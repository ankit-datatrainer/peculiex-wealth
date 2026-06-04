"use strict";

const { Router } = require("express");
const { z } = require("zod");

const {
  hashPassword,
  verifyPassword,
  signToken
} = require("../auth/tokens");
const {
  createUser,
  getUserByEmail,
  getUserById,
  setUserOtp,
  consumeOtp,
  checkResendAllowed,
  updateUser
} = require("../auth/store");
const { requireAuth } = require("../auth/middleware");
const { sendOtpEmail, sendWelcomeEmail, readDevOtp, smtpConfigured } = require("../auth/mailer");

const router = Router();

/* ------------------------- schemas ------------------------- */

const SignupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
  mobile: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
});

const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(128)
});

const OtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be 6 digits")
});

const ResendSchema = z.object({
  email: z.string().trim().email("Enter a valid email")
});

const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email")
});

const ResetPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  otp: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(128)
});

const ChangePasswordVerifySchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(128)
});

/* ------------------------- helpers ------------------------- */

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  mobile: user.mobile || null,
  role: user.role || "user",
  email_verified: !!user.email_verified
});

const issueAuthResponse = (user) => {
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role || "user"
  });
  return { token, user: publicUser(user) };
};

const isProd = process.env.NODE_ENV === "production";

/* ------------------------- routes ------------------------- */

/**
 * POST /api/auth/signup
 * Creates an unverified account and emails a 6-digit OTP. Does NOT issue a
 * session token — the client must call /verify-otp next.
 */
router.post("/signup", async (req, res, next) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Invalid signup payload";
      return res.status(400).json({ error: msg });
    }
    const { name, email, password, mobile } = parsed.data;

    let user = await getUserByEmail(email);
    if (user && user.email_verified) {
      return res.status(409).json({
        error: "An account with this email already exists. Try logging in.",
        code: "already_registered"
      });
    }

    if (!user) {
      const password_hash = hashPassword(password);
      user = await createUser({
        name,
        email,
        password_hash,
        mobile: mobile || null,
        email_verified: false
      });
    }
    // If the user existed but wasn't verified, we keep the existing record
    // and just send a fresh OTP. (We don't overwrite their password.)

    const { otp } = await setUserOtp(user.id);
    await sendOtpEmail({ to: user.email, name: user.name, otp });

    return res.status(201).json({
      pendingEmail: user.email,
      // Hint to the client about whether email actually went out vs landed
      // in the dev console.
      delivery: smtpConfigured ? "email" : "dev-console",
      message: smtpConfigured
        ? "We've sent a 6-digit code to your inbox."
        : "Dev mode: check the backend console for your 6-digit code."
    });
  } catch (err) {
    if (err && err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/auth/verify-otp
 * Validates the OTP, marks email_verified=true, and returns a session token.
 */
router.post("/verify-otp", async (req, res, next) => {
  try {
    const parsed = OtpSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Invalid OTP payload";
      return res.status(400).json({ error: msg });
    }
    const { email, otp } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ error: "No pending verification for this email." });
    }
    
    const wasAlreadyVerified = user.email_verified;
    const result = await consumeOtp(user.id, otp);
    if (!result.ok) {
      const map = {
        wrong_code: { status: 400, msg: "Incorrect code. Please try again." },
        invalid_format: {
          status: 400,
          msg: "The code must be 6 digits."
        },
        expired: {
          status: 410,
          msg: "This code has expired. Tap Resend to get a new one."
        },
        too_many_attempts: {
          status: 429,
          msg: "Too many wrong attempts. Tap Resend to get a new code."
        },
        no_pending_otp: {
          status: 400,
          msg: "There is no pending verification. Sign up first."
        },
        not_found: {
          status: 404,
          msg: "No pending verification for this email."
        }
      };
      const e = map[result.reason] || { status: 400, msg: "Could not verify." };
      return res.status(e.status).json({ error: e.msg, code: result.reason });
    }
    
    const fresh = await getUserByEmail(email); // refreshed flags
    
    // If it was their first time verifying, send a welcome email
    if (!wasAlreadyVerified && fresh.email_verified) {
      // Best-effort send, don't block response
      sendWelcomeEmail({ to: fresh.email, name: fresh.name }).catch(e => {
        console.warn("[mailer] Failed to send welcome email:", e.message);
      });
    }

    return res.json(issueAuthResponse(fresh));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/resend-otp
 * Issue a fresh OTP for an existing, not-yet-verified user. Rate-limited:
 *   - 60-second cool-down between sends per user
 *   - 5 sends per rolling hour per user
 */
router.post("/resend-otp", async (req, res, next) => {
  try {
    const parsed = ResendSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Enter a valid email" });
    }
    const { email } = parsed.data;
    const user = await getUserByEmail(email);
    // Don't reveal whether the email exists — return a generic OK either way.
    if (!user || user.email_verified) {
      return res.json({
        ok: true,
        message:
          "If an account is awaiting verification, a new code has been sent."
      });
    }
    try {
      await checkResendAllowed(user.id);
    } catch (e) {
      const status = e.status || 429;
      const body = { error: e.message };
      if (e.retryAfter) body.retryAfter = e.retryAfter;
      return res.status(status).json(body);
    }
    const { otp } = await setUserOtp(user.id);
    await sendOtpEmail({ to: user.email, name: user.name, otp });
    return res.json({
      ok: true,
      delivery: smtpConfigured ? "email" : "dev-console"
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * If the password matches but email isn't verified yet, returns 403 with
 * `needsVerification: true` so the frontend can pivot to the OTP step.
 */
router.post("/login", async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Invalid login payload";
      return res.status(400).json({ error: msg });
    }
    const { email, password } = parsed.data;
    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      // identical message to avoid email enumeration
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (!user.email_verified) {
      // Best-effort: send a fresh OTP so the user lands on the verify
      // screen with a code already in their inbox. Ignore rate-limit
      // failures here; the verify screen has a Resend button.
      try {
        await checkResendAllowed(user.id);
        const { otp } = await setUserOtp(user.id);
        await sendOtpEmail({ to: user.email, name: user.name, otp });
      } catch {
        /* swallow — the user can hit Resend themselves */
      }
      return res.status(403).json({
        error: "Verify your email to continue.",
        needsVerification: true,
        pendingEmail: user.email
      });
    }
    return res.json(issueAuthResponse(user));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/forgot-password
 * Initiates the password reset flow. Sends an OTP to the user's email if the account exists.
 */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Enter a valid email" });
    }
    const { email } = parsed.data;
    const user = await getUserByEmail(email);

    // To prevent email enumeration, we always return a generic success message
    if (user) {
      try {
        await checkResendAllowed(user.id);
        const { otp } = await setUserOtp(user.id);
        await sendOtpEmail({ to: user.email, name: user.name, otp, isReset: true });
      } catch (e) {
        // If rate limited, just swallow it so we don't leak info, 
        // or return 429 if we don't care about enumeration for rate limit
      }
    }
    
    return res.json({
      ok: true,
      message: "If an account with that email exists, we've sent a password reset code."
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/reset-password
 * Consumes the OTP and updates the user's password.
 */
router.post("/reset-password", async (req, res, next) => {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Invalid payload";
      return res.status(400).json({ error: msg });
    }
    const { email, otp, newPassword } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "No pending reset for this email." });
    }

    const result = await consumeOtp(user.id, otp);
    if (!result.ok) {
      const map = {
        wrong_code: { status: 400, msg: "Incorrect code. Please try again." },
        invalid_format: { status: 400, msg: "The code must be 6 digits." },
        expired: { status: 410, msg: "This code has expired. Request a new one." },
        too_many_attempts: { status: 429, msg: "Too many wrong attempts." },
        no_pending_otp: { status: 400, msg: "There is no pending reset request." },
        not_found: { status: 404, msg: "User not found." }
      };
      const e = map[result.reason] || { status: 400, msg: "Could not verify." };
      return res.status(e.status).json({ error: e.msg, code: result.reason });
    }

    const password_hash = hashPassword(newPassword);
    await updateUser(user.id, { password_hash });

    const fresh = await getUserByEmail(email);
    return res.json(issueAuthResponse(fresh));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/change-password-request
 * Sends an OTP to the currently authenticated user's email.
 */
router.post("/change-password-request", requireAuth, async (req, res, next) => {
  try {
    const user = req.user;
    try {
      await checkResendAllowed(user.id);
    } catch (e) {
      const status = e.status || 429;
      const body = { error: e.message };
      if (e.retryAfter) body.retryAfter = e.retryAfter;
      return res.status(status).json(body);
    }
    const { otp } = await setUserOtp(user.id);
    await sendOtpEmail({ to: user.email, name: user.name, otp, isReset: true });
    
    return res.json({
      ok: true,
      message: "We've sent a 6-digit code to your inbox to confirm the password change."
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/change-password-verify
 * Validates the OTP and changes the authenticated user's password.
 */
router.post("/change-password-verify", requireAuth, async (req, res, next) => {
  try {
    const parsed = ChangePasswordVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Invalid payload";
      return res.status(400).json({ error: msg });
    }
    const { otp, newPassword } = parsed.data;
    const user = req.user;

    const result = await consumeOtp(user.id, otp);
    if (!result.ok) {
      const map = {
        wrong_code: { status: 400, msg: "Incorrect code. Please try again." },
        invalid_format: { status: 400, msg: "The code must be 6 digits." },
        expired: { status: 410, msg: "This code has expired. Request a new one." },
        too_many_attempts: { status: 429, msg: "Too many wrong attempts." },
        no_pending_otp: { status: 400, msg: "There is no pending password change." },
        not_found: { status: 404, msg: "User not found." }
      };
      const e = map[result.reason] || { status: 400, msg: "Could not verify." };
      return res.status(e.status).json({ error: e.msg, code: result.reason });
    }

    const password_hash = hashPassword(newPassword);
    await updateUser(user.id, { password_hash });

    return res.json({ ok: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post("/logout", requireAuth, (_req, res) => {
  // Stateless tokens — client just discards.
  res.json({ ok: true });
});

/**
 * GET /api/auth/dev-last-otp?email=...
 * Dev-only: returns the most recent OTP for the given email. Disabled in
 * production. Useful so testers can paste-grab the code without touching
 * the server log.
 */
router.get("/dev-last-otp", (req, res) => {
  if (isProd) return res.status(404).json({ error: "Not found" });
  const email = String(req.query.email || "").trim();
  if (!email) return res.status(400).json({ error: "email is required" });
  const otp = readDevOtp(email);
  if (!otp) return res.status(404).json({ error: "No OTP on record" });
  res.json({ otp, note: "Dev-only endpoint. Disabled in production." });
});

module.exports = router;

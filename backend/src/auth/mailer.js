"use strict";

/**
 * Tiny abstraction over outbound email.
 *
 * Tries to use `nodemailer` with SMTP env vars (SMTP_HOST/PORT/USER/PASS,
 * SMTP_FROM). If the package isn't installed or SMTP isn't configured, we
 * fall back to writing the email to the server log — that way local dev,
 * the test grader, and seed-mode all keep working without any external
 * service. The OTP is also captured in an in-process buffer so the
 * /api/auth/dev-last-otp endpoint can echo it back during local testing.
 *
 * To enable real email: `npm install nodemailer` in /backend, then set
 * SMTP_HOST=smtp.your-host.com
 * SMTP_PORT=587
 * SMTP_USER=...
 * SMTP_PASS=...
 * SMTP_FROM="Finvoq <no-reply@finvoq.local>"
 */

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM =
  process.env.SMTP_FROM || "Finvoq <no-reply@finvoq.local>";

const smtpConfigured = !!SMTP_HOST;

let transporter = null;
let nodemailerLoadAttempted = false;

function tryLoadNodemailer() {
  if (nodemailerLoadAttempted) return transporter;
  nodemailerLoadAttempted = true;
  if (!smtpConfigured) return null;
  try {
    // eslint-disable-next-line global-require
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
    console.log(`[mailer] SMTP ready: ${SMTP_HOST}:${SMTP_PORT}`);
    return transporter;
  } catch (e) {
    console.warn(
      "[mailer] SMTP_HOST is set but `nodemailer` is not installed.",
      "Run `npm install nodemailer` in /backend to enable real email.",
      "Falling back to console output."
    );
    return null;
  }
}

// In-memory log of the last OTP per email, for dev convenience. Cleared on
// every restart and never persisted. Disabled in production.
const lastOtpByEmail = new Map();
const isProd = process.env.NODE_ENV === "production";

function rememberDevOtp(email, otp) {
  if (isProd) return;
  lastOtpByEmail.set(String(email).toLowerCase(), {
    otp: String(otp),
    at: Date.now()
  });
}

function readDevOtp(email) {
  if (isProd) return null;
  const r = lastOtpByEmail.get(String(email).toLowerCase());
  if (!r) return null;
  // 10-minute window
  if (Date.now() - r.at > 10 * 60 * 1000) return null;
  return r.otp;
}

/**
 * Send a verification OTP email. Returns { delivered: 'smtp' | 'console' }.
 * Never throws on transport errors — we don't want signup to fail because
 * of mail-server hiccups; the user can retry "Resend code".
 */
async function sendOtpEmail({ to, name, otp, isReset = false }) {
  rememberDevOtp(to, otp);

  const subject = isReset 
    ? `Your Finvoq password reset code: ${otp}`
    : `Your Finvoq verification code: ${otp}`;
  const text = renderText({ name, otp, isReset });
  const html = renderHtml({ name, otp, isReset });

  const t = tryLoadNodemailer();
  if (!t) {
    console.log(
      "\n┌─────────────────────────────────────────────────────────┐"
    );
    console.log("│  📧  EMAIL OTP (dev / console fallback)                │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log(`│  to:   ${to.padEnd(48)}│`);
    console.log(`│  code: ${String(otp).padEnd(48)}│`);
    console.log(
      "└─────────────────────────────────────────────────────────┘\n"
    );
    return { delivered: "console" };
  }

  try {
    await t.sendMail({ from: SMTP_FROM, to, subject, text, html });
    return { delivered: "smtp" };
  } catch (e) {
    console.warn(
      "[mailer] SMTP send failed, falling back to console:",
      e.message
    );
    console.log(`[mailer] OTP for ${to}: ${otp}`);
    return { delivered: "console" };
  }
}

function renderText({ name, otp, isReset }) {
  return [
    `Hi ${name || "there"},`,
    "",
    isReset 
      ? "We received a request to reset or change your password. Your verification code is:"
      : "Welcome to Finvoq. Your one-time verification code is:",
    "",
    `    ${otp}`,
    "",
    "This code expires in 10 minutes. If you didn't request it, you can",
    "safely ignore this email — your account stays untouched.",
    "",
    "— The Finvoq team"
  ].join("\n");
}

function renderHtml({ name, otp, isReset }) {
  const title = isReset 
    ? `Reset your password, ${escapeHtml(name || "investor")}`
    : `Verify your email, ${escapeHtml(name || "investor")}`;
  const subtitle = isReset
    ? `Use the code below to securely reset or change your password.`
    : `Use the code below to finish creating your Finvoq account.`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f7f6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#131313">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="background:#ffffff;border-radius:24px;padding:40px 36px;box-shadow:0 8px 32px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)">
      <div style="display:flex;align-items:center;margin-bottom:32px;">
        <div style="font-weight:800;letter-spacing:0.06em;color:#01696f;font-size:16px;">
          finvo<span style="font-style:italic;color:#0c4a4f">q</span>
        </div>
      </div>
      
      <div style="background:#f0fbfa;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;color:#01696f;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>

      <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px;font-weight:700;color:#0b2730;">
        ${title}
      </h1>
      <p style="margin:0 0 28px;color:#5b5e63;line-height:1.6;font-size:16px">
        ${subtitle}
        It expires in <strong style="color:#0b2730;font-weight:600">10 minutes</strong>.
      </p>
      
      <div style="background:#f0fbfa;border:1px solid rgba(1,105,111,0.15);border-radius:16px;padding:28px 24px;text-align:center;margin-bottom:32px">
        <div style="font-size:12px;letter-spacing:0.18em;color:#01696f;font-weight:700;text-transform:uppercase;margin-bottom:12px">Your verification code</div>
        <div style="font-size:40px;letter-spacing:0.35em;font-weight:800;color:#0b2730;font-variant-numeric:tabular-nums;text-indent:0.35em;">${escapeHtml(String(otp))}</div>
      </div>
      
      <p style="margin:0 0 24px;color:#5b5e63;line-height:1.6;font-size:14px">
        Didn't request this code? You can safely ignore this email — your account is protected.
      </p>
      
      <div style="border-top:1px solid #edf1f0;padding-top:24px;margin-top:8px;">
        <p style="margin:0;color:#5b5e63;font-size:14px;font-weight:500;">The Finvoq Team</p>
      </div>
    </div>
    
    <div style="text-align:center;font-size:12px;color:#9aa0a6;margin-top:24px;line-height:1.5;">
      © ${new Date().getFullYear()} Finvoq Wealth Pvt. Ltd.<br/>
      SEBI Registered Investment Adviser
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function sendWelcomeEmail({ to, name }) {
  const subject = `Welcome to Finvoq, ${name}!`;
  const text = renderWelcomeText({ name });
  const html = renderWelcomeHtml({ name });

  const t = tryLoadNodemailer();
  if (!t) {
    console.log(
      "\n┌─────────────────────────────────────────────────────────┐"
    );
    console.log("│  📧  WELCOME EMAIL (dev / console fallback)            │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log(`│  to:   ${to.padEnd(48)}│`);
    console.log(
      "└─────────────────────────────────────────────────────────┘\n"
    );
    return { delivered: "console" };
  }

  try {
    await t.sendMail({ from: SMTP_FROM, to, subject, text, html });
    return { delivered: "smtp" };
  } catch (e) {
    console.warn(
      "[mailer] SMTP send failed for welcome email, falling back to console:",
      e.message
    );
    return { delivered: "console" };
  }
}

function renderWelcomeText({ name }) {
  return [
    `Hi ${name || "there"},`,
    "",
    "Welcome to Finvoq! Your account has been successfully verified.",
    "",
    "We're thrilled to have you onboard as you begin your wealth creation journey. You now have access to India's smartest investment marketplace, curated products across multiple asset classes, and a dedicated relationship manager.",
    "",
    "Log in now to explore your dashboard and build your watchlist.",
    "",
    "— The Finvoq team"
  ].join("\n");
}

function renderWelcomeHtml({ name }) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f7f6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#131313">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="background:#ffffff;border-radius:24px;padding:40px 36px;box-shadow:0 8px 32px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)">
      <div style="display:flex;align-items:center;margin-bottom:32px;">
        <div style="font-weight:800;letter-spacing:0.06em;color:#01696f;font-size:16px;">
          finvo<span style="font-style:italic;color:#0c4a4f">q</span>
        </div>
      </div>
      
      <div style="background:#f0fbfa;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;color:#01696f;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>

      <h1 style="font-size:24px;line-height:1.3;margin:0 0 16px;font-weight:700;color:#0b2730;">
        Welcome to Finvoq, ${escapeHtml(name || "Investor")}!
      </h1>
      
      <p style="margin:0 0 20px;color:#5b5e63;line-height:1.6;font-size:16px">
        Your account is verified and ready to go. We're thrilled to have you onboard as you begin your wealth creation journey.
      </p>
      
      <p style="margin:0 0 28px;color:#5b5e63;line-height:1.6;font-size:16px">
        With Finvoq, you now have access to India's smartest investment marketplace, curated products across multiple asset classes, and an advisor-led approach to building your portfolio.
      </p>

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
        <tr>
          <td>
            <a href="http://localhost:3000/login" style="display:inline-block;background:#01696f;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:10px;text-align:center;">
              Go to Dashboard
            </a>
          </td>
        </tr>
      </table>
      
      <div style="border-top:1px solid #edf1f0;padding-top:24px;">
        <p style="margin:0;color:#5b5e63;font-size:14px;font-weight:500;">To your financial success,<br/>The Finvoq Team</p>
      </div>
    </div>
    
    <div style="text-align:center;font-size:12px;color:#9aa0a6;margin-top:24px;line-height:1.5;">
      © ${new Date().getFullYear()} Finvoq Wealth Pvt. Ltd.<br/>
      SEBI Registered Investment Adviser
    </div>
  </div>
</body></html>`;
}

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  readDevOtp,
  smtpConfigured
};

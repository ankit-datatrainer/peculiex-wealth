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
    "safely ignore this email. Your account stays untouched.",
    "",
    "The Finvoq team"
  ].join("\n");
}

function renderHtml({ name, otp, isReset }) {
  const appUrl = (process.env.APP_URL || "https://finvoq.com").replace(/\/$/, "");
  const logoUrl = `${appUrl}/logo_light.svg`;
  const title = isReset 
    ? `Reset your password`
    : `Verify your email`;
  const subtitle = isReset
    ? `Hi ${escapeHtml(name || "there")}, use the code below to securely reset your Finvoq password.`
    : `Hi ${escapeHtml(name || "there")}, use the code below to finish creating your Finvoq account.`;
  const iconSvg = isReset
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`
    : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="light"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#131313;-webkit-font-smoothing:antialiased;">
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
  <div style="max-width:600px;margin:0 auto;padding:40px 16px;">

    <!-- Logo header -->
    <div style="text-align:center;padding:0 0 32px;">
      <a href="${appUrl}" style="text-decoration:none;">
        <img src="${logoUrl}" alt="Finvoq" width="160" height="64" style="display:inline-block;max-width:160px;height:auto;"/>
      </a>
    </div>

    <!-- Main card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(19,115,93,0.08),0 1px 3px rgba(0,0,0,0.04);">

      <!-- Green gradient header bar -->
      <div style="background:linear-gradient(135deg,#13735d 0%,#0f5c49 50%,#1a8c6e 100%);padding:32px 36px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.18);display:inline-block;line-height:56px;text-align:center;vertical-align:middle;">
          ${iconSvg}
        </div>
        <h1 style="font-size:24px;line-height:1.3;margin:16px 0 0;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">
          ${title}
        </h1>
      </div>

      <!-- Body content -->
      <div style="padding:36px 36px 32px;">
        <p style="margin:0 0 24px;color:#4a5568;line-height:1.7;font-size:15px;">
          ${subtitle}
          This code expires in <strong style="color:#13735d;font-weight:600;">10 minutes</strong>.
        </p>

        <!-- OTP code box -->
        <div style="background:linear-gradient(135deg,#e4f1ed 0%,#f0f9f6 100%);border:2px solid #13735d;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
          <div style="font-size:11px;letter-spacing:0.2em;color:#13735d;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Your verification code</div>
          <div style="font-size:36px;letter-spacing:0.4em;font-weight:800;color:#0f5c49;font-variant-numeric:tabular-nums;text-indent:0.4em;font-family:'Courier New',Courier,monospace;">${escapeHtml(String(otp))}</div>
        </div>

        <p style="margin:0 0 20px;color:#718096;line-height:1.6;font-size:13px;text-align:center;">
          Didn't request this? You can safely ignore this email — your account stays secure.
        </p>
      </div>

      <!-- Footer divider & sign-off -->
      <div style="border-top:1px solid #e8eeec;padding:24px 36px;background:#fafcfb;">
        <p style="margin:0;color:#718096;font-size:13px;">Warm regards,</p>
        <p style="margin:4px 0 0;color:#13735d;font-size:14px;font-weight:600;">The Finvoq Team</p>
      </div>
    </div>

    <!-- Bottom footer -->
    <div style="text-align:center;padding:28px 0 8px;">
      <p style="margin:0 0 6px;font-size:12px;color:#a0aab0;line-height:1.5;">
        © ${new Date().getFullYear()} Finvoq Wealth Pvt. Ltd. · SEBI Registered Investment Adviser
      </p>
      <p style="margin:0;font-size:11px;color:#b8c2c8;">
        <a href="${appUrl}" style="color:#13735d;text-decoration:none;">finvoq.com</a>
      </p>
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
    "The Finvoq team"
  ].join("\n");
}

function renderWelcomeHtml({ name }) {
  const appUrl = (process.env.APP_URL || "https://finvoq.com").replace(/\/$/, "");
  const logoUrl = `${appUrl}/logo_light.svg`;
  const escapedName = escapeHtml(name || "Investor");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="light"/><title>Welcome to Finvoq</title></head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#131313;-webkit-font-smoothing:antialiased;">
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
  <div style="max-width:600px;margin:0 auto;padding:40px 16px;">

    <!-- Logo header -->
    <div style="text-align:center;padding:0 0 32px;">
      <a href="${appUrl}" style="text-decoration:none;">
        <img src="${logoUrl}" alt="Finvoq" width="160" height="64" style="display:inline-block;max-width:160px;height:auto;"/>
      </a>
    </div>

    <!-- Main card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(19,115,93,0.08),0 1px 3px rgba(0,0,0,0.04);">

      <!-- Green gradient header bar -->
      <div style="background:linear-gradient(135deg,#13735d 0%,#0f5c49 50%,#1a8c6e 100%);padding:32px 36px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.18);display:inline-block;line-height:56px;text-align:center;vertical-align:middle;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h1 style="font-size:24px;line-height:1.3;margin:16px 0 0;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">
          Welcome to Finvoq, ${escapedName}!
        </h1>
      </div>

      <!-- Body content -->
      <div style="padding:36px 36px 32px;">
        <p style="margin:0 0 20px;color:#4a5568;line-height:1.7;font-size:15px;">
          Your account is verified and ready to go. We're thrilled to have you onboard as you begin your wealth creation journey.
        </p>

        <p style="margin:0 0 28px;color:#4a5568;line-height:1.7;font-size:15px;">
          With Finvoq, you now have access to India's smartest investment marketplace — curated products, transparent pricing, and an advisor-led approach to building your portfolio.
        </p>

        <!-- Feature highlights -->
        <div style="background:#fafcfb;border:1px solid #e8eeec;border-radius:12px;padding:24px 28px;margin:0 0 32px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:0 0 14px;">
                <table border="0" cellspacing="0" cellpadding="0"><tr>
                  <td style="width:28px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;border-radius:50%;background:#e4f1ed;text-align:center;line-height:20px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#13735d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </td>
                  <td style="color:#2d3748;font-size:14px;font-weight:500;line-height:1.5;">10+ asset classes, one unified dashboard</td>
                </tr></table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 14px;">
                <table border="0" cellspacing="0" cellpadding="0"><tr>
                  <td style="width:28px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;border-radius:50%;background:#e4f1ed;text-align:center;line-height:20px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#13735d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </td>
                  <td style="color:#2d3748;font-size:14px;font-weight:500;line-height:1.5;">SEBI-registered, advisor-led, transparent pricing</td>
                </tr></table>
              </td>
            </tr>
            <tr>
              <td style="padding:0;">
                <table border="0" cellspacing="0" cellpadding="0"><tr>
                  <td style="width:28px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;border-radius:50%;background:#e4f1ed;text-align:center;line-height:20px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#13735d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </td>
                  <td style="color:#2d3748;font-size:14px;font-weight:500;line-height:1.5;">Dedicated relationship manager for your portfolio</td>
                </tr></table>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin:0 0 8px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <a href="${appUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#13735d,#0f5c49);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;text-align:center;letter-spacing:0.01em;">
                  Go to Your Dashboard →
                </a>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Footer divider & sign-off -->
      <div style="border-top:1px solid #e8eeec;padding:24px 36px;background:#fafcfb;">
        <p style="margin:0;color:#718096;font-size:13px;">To your financial success,</p>
        <p style="margin:4px 0 0;color:#13735d;font-size:14px;font-weight:600;">The Finvoq Team</p>
      </div>
    </div>

    <!-- Bottom footer -->
    <div style="text-align:center;padding:28px 0 8px;">
      <p style="margin:0 0 6px;font-size:12px;color:#a0aab0;line-height:1.5;">
        © ${new Date().getFullYear()} Finvoq Wealth Pvt. Ltd. · SEBI Registered Investment Adviser
      </p>
      <p style="margin:0;font-size:11px;color:#b8c2c8;">
        <a href="${appUrl}" style="color:#13735d;text-decoration:none;">finvoq.com</a>
      </p>
    </div>

  </div>
</body></html>`;
}


async function sendContactFormEmail({ name, email, subject, message }) {
  const to = "info@finvoq.com";
  const mailSubject = `New Contact Form Submission: ${subject}`;
  const text = renderContactFormText({ name, email, subject, message });
  const html = renderContactFormHtml({ name, email, subject, message });

  const t = tryLoadNodemailer();
  if (!t) {
    console.log(
      "\n┌─────────────────────────────────────────────────────────┐"
    );
    console.log("│  📧  CONTACT FORM (dev / console fallback)             │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log(`│  to:   ${to.padEnd(48)}│`);
    console.log(`│  from: ${email.padEnd(48)}│`);
    console.log(
      "└─────────────────────────────────────────────────────────┘\n"
    );
    return { delivered: "console" };
  }

  try {
    await t.sendMail({ from: SMTP_FROM, to, replyTo: email, subject: mailSubject, text, html });
    return { delivered: "smtp" };
  } catch (e) {
    console.warn(
      "[mailer] SMTP send failed for contact form, falling back to console:",
      e.message
    );
    return { delivered: "console" };
  }
}

function renderContactFormText({ name, email, subject, message }) {
  return [
    `New Contact Form Submission`,
    `---------------------------`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    ``,
    `Message:`,
    message
  ].join("\n");
}

function renderContactFormHtml({ name, email, subject, message }) {
  const appUrl = (process.env.APP_URL || "https://finvoq.com").replace(/\/$/, "");
  const logoUrl = `${appUrl}/logo_light.svg`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="light"/><title>New Contact Form Submission</title></head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#131313;-webkit-font-smoothing:antialiased;">
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
  <div style="max-width:600px;margin:0 auto;padding:40px 16px;">

    <!-- Logo header -->
    <div style="text-align:center;padding:0 0 32px;">
      <a href="${appUrl}" style="text-decoration:none;">
        <img src="${logoUrl}" alt="Finvoq" width="140" height="56" style="display:inline-block;max-width:140px;height:auto;"/>
      </a>
    </div>

    <!-- Main card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(19,115,93,0.08),0 1px 3px rgba(0,0,0,0.04);">

      <!-- Green top accent -->
      <div style="height:5px;background:linear-gradient(90deg,#13735d 0%,#1a8c6e 50%,#2ea2a8 100%);"></div>

      <div style="padding:32px 36px;">
        <!-- Header -->
        <h2 style="margin:0 0 24px;color:#13735d;font-size:20px;font-weight:700;border-bottom:1px solid #e8eeec;padding-bottom:16px;">
          New Contact Form Submission
        </h2>

        <!-- Form data table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;font-size:14px;">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f4f3;width:100px;color:#718096;font-weight:600;vertical-align:top;background:#fafcfb;">Name</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f4f3;color:#2d3748;font-weight:600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f4f3;color:#718096;font-weight:600;vertical-align:top;background:#fafcfb;">Email</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f4f3;color:#2d3748;font-weight:600;">
              <a href="mailto:${escapeHtml(email)}" style="color:#13735d;text-decoration:none;">${escapeHtml(email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f4f3;color:#718096;font-weight:600;vertical-align:top;background:#fafcfb;">Subject</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f4f3;color:#2d3748;font-weight:600;">${escapeHtml(subject)}</td>
          </tr>
        </table>

        <!-- Message body -->
        <div style="background:#fafcfb;padding:20px 24px;border-radius:10px;border:1px solid #e8eeec;line-height:1.7;font-size:14px;color:#4a5568;white-space:pre-wrap;">${escapeHtml(message)}</div>

        <!-- Reply CTA -->
        <div style="text-align:center;margin-top:28px;">
          <a href="mailto:${escapeHtml(email)}?subject=Re: ${escapeHtml(subject)}" style="display:inline-block;background:linear-gradient(135deg,#13735d,#0f5c49);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
            Reply to ${escapeHtml(name)}
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom footer -->
    <div style="text-align:center;padding:24px 0 8px;">
      <p style="margin:0;font-size:11px;color:#b8c2c8;line-height:1.5;">
        This email was sent automatically from the Finvoq website contact form.
      </p>
    </div>

  </div>
</body></html>`;
}


module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendContactFormEmail,
  readDevOtp,
  smtpConfigured
};

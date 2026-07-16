"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent
} from "react";
import { useAuth } from "@/lib/auth-context";

type Step = "creds" | "otp" | "profile" | "done";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/watchlist";

  const {
    user,
    ready,
    startSignup,
    verifyOtp,
    resendOtp,
    loading,
    error,
    clearError
  } = useAuth();

  const [step, setStep] = useState<Step>("creds");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");

  // Step 2 (OTP)
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    ""
  ]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [delivery, setDelivery] = useState<"email" | "dev-console">("email");
  const [verifying, setVerifying] = useState(false);

  // Step 3
  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [investmentGoal, setInvestmentGoal] = useState("Wealth creation");

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user && step !== "done") router.replace(next);
  }, [ready, user, step, router, next]);

  const stepIdx = ["creds", "otp", "profile", "done"].indexOf(step);

  const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const validateMobile = (s: string) =>
    !s || /^[6-9]\d{9}$/.test(s.replace(/\D/g, ""));

  /* ---------- step 1 → start signup ---------- */

  const onCredsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (name.trim().length < 2) return setLocalError("Tell us your full name.");
    if (!validateEmail(email))
      return setLocalError("Enter a valid email address.");
    if (password.length < 6)
      return setLocalError("Password must be at least 6 characters.");
    if (!validateMobile(mobile))
      return setLocalError(
        "Enter a valid 10-digit Indian mobile, or leave it blank."
      );
    try {
      const r = await startSignup(name, email, password, mobile);
      setDelivery(r.delivery);
      setStep("otp");
      setResendIn(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError(null);
    } catch {
      /* surfaced via context error */
    }
  };

  /* ---------- step 2 → OTP ---------- */

  // 1-second resend countdown
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  const otpString = useMemo(() => otpDigits.join(""), [otpDigits]);

  const submitOtp = async (code: string) => {
    if (verifying) return;
    setOtpError(null);
    clearError();
    setVerifying(true);
    try {
      await verifyOtp(email, code);
      setStep("profile");
    } catch (e: any) {
      setOtpError(e?.message || "Could not verify your code.");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => focusOtpBox(0), 0);
    } finally {
      setVerifying(false);
    }
  };

  const onOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpString.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }
    void submitOtp(otpString);
  };

  const onResend = async () => {
    if (resendIn > 0) return;
    setOtpError(null);
    try {
      await resendOtp(email);
      setResendIn(60);
    } catch (e: any) {
      setOtpError(e?.message || "Could not resend the code.");
    }
  };

  /* ---------- step 3 → profile ---------- */

  const onProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
    setTimeout(() => router.replace(next), 1200);
  };

  const shownError = localError || error;

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link href="/" className="logo" data-magnetic>
          <span className="logo-mark">
            <span>f</span>
          </span>
          <span className="logo-text">
            finvo<em>q</em>
          </span>
        </Link>
        <div>
          <h2>
            Open your account in <em>under a minute</em>. Start building your
            watchlist today.
          </h2>
          <ul className="auth-points">
            <li>Free to sign up · no credit card</li>
            <li>SEBI-registered Investment Adviser</li>
            <li>Curated products across 8 asset classes</li>
            <li>A dedicated relationship manager from day one</li>
          </ul>
        </div>
        <div className="auth-foot">
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#cedcd8", textDecoration: "underline" }}
          >
            Login →
          </Link>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {step !== "done" && (
            <div className="step-pills" aria-hidden="true">
              {["creds", "otp", "profile"].map((s, i) => (
                <span
                  key={s}
                  className={`step-pill${i < stepIdx ? " done" : ""}${
                    i === stepIdx ? " active" : ""
                  }`}
                ></span>
              ))}
            </div>
          )}

          {step === "creds" && (
            <>
              <h1>Open your free account</h1>
              <p className="auth-sub">
                Already with us? <Link href="/login">Login →</Link>
              </p>
              {shownError && <div className="auth-error">{shownError}</div>}
              <form onSubmit={onCredsSubmit}>
                <label>
                  <span>Full name</span>
                  <input
                    type="text"
                    autoFocus
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  <span>Password</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-muted, #333333)",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px"
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </label>
                <label>
                  <span>
                    Mobile number{" "}
                    <em
                      style={{
                        fontStyle: "normal",
                        color: "var(--color-text-muted)",
                        fontWeight: 400
                      }}
                    >
                      (optional)
                    </em>
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-cta"
                  data-magnetic
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Sending verification code…" : "Send code"}
                </button>
              </form>
              <p className="auth-foot-link" style={{ fontSize: "0.78rem" }}>
                We&apos;ll email a 6-digit verification code to confirm your
                inbox. By continuing, you agree to our{" "}
                <Link href="/legal/terms">Terms</Link> and{" "}
                <Link href="/legal/privacy">Privacy Policy</Link>.
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <h1>Check your email</h1>
              <p className="auth-sub">
                We sent a 6-digit code to <strong>{email}</strong>.{" "}
                <button
                  type="button"
                  className="otp-link"
                  onClick={() => {
                    setStep("creds");
                    setOtpError(null);
                  }}
                >
                  Wrong email?
                </button>
              </p>

              {delivery === "dev-console" && (
                <div className="auth-info">
                  <strong>Dev mode:</strong> the backend isn&apos;t configured
                  to send real email. Look at the server console — your code
                  is printed there. Or hit{" "}
                  <code>/api/auth/dev-last-otp?email={encodeURIComponent(email)}</code>.
                </div>
              )}

              {otpError && <div className="auth-error">{otpError}</div>}

              <form onSubmit={onOtpSubmit}>
                <OtpBoxes
                  digits={otpDigits}
                  setDigits={setOtpDigits}
                  onComplete={(code) => void submitOtp(code)}
                  disabled={verifying}
                />

                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-cta"
                  data-magnetic
                  disabled={verifying || otpString.length !== 6}
                  style={{ opacity: verifying ? 0.7 : 1 }}
                >
                  {verifying ? "Verifying…" : "Verify & continue"}
                </button>
              </form>

              <p className="auth-foot-link">
                Didn&apos;t get the code?{" "}
                {resendIn > 0 ? (
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Resend in {resendIn}s
                  </span>
                ) : (
                  <button
                    type="button"
                    className="otp-link"
                    onClick={onResend}
                  >
                    Resend code
                  </button>
                )}
              </p>
            </>
          )}

          {step === "profile" && (
            <>
              <h1>Tell us how you invest</h1>
              <p className="auth-sub">
                Helps us tailor your dashboard. You can change these any time.
              </p>
              <form onSubmit={onProfileSubmit}>
                <label>
                  <span>Risk profile</span>
                  <select
                    value={riskProfile}
                    onChange={(e) => setRiskProfile(e.target.value)}
                  >
                    <option>Conservative</option>
                    <option>Moderate</option>
                    <option>Aggressive</option>
                  </select>
                </label>
                <label>
                  <span>Primary investment goal</span>
                  <select
                    value={investmentGoal}
                    onChange={(e) => setInvestmentGoal(e.target.value)}
                  >
                    <option>Wealth creation</option>
                    <option>Retirement</option>
                    <option>Child&apos;s education</option>
                    <option>Buying a home</option>
                    <option>Tax saving</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-cta"
                  data-magnetic
                >
                  Continue to my watchlist →
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--color-success-bg)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 24
                }}
                aria-hidden="true"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l4 4L19 6"
                    stroke="#16a34a"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1>Welcome, {name.split(" ")[0] || "investor"}.</h1>
              <p className="auth-sub">
                Your account is live. Loading your watchlist…
              </p>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .auth-info {
          background: rgba(10, 160, 128, 0.08);
          border: 1px solid rgba(10, 160, 128, 0.2);
          border-radius: 12px;
          padding: 0.7rem 0.9rem;
          color: #075c4a;
          font-size: 0.82rem;
          margin-bottom: 1rem;
          line-height: 1.45;
        }
        .auth-info code {
          background: rgba(0, 0, 0, 0.06);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.78rem;
        }
        .otp-link {
          background: transparent;
          border: 0;
          padding: 0;
          font: inherit;
          color: var(--color-primary, #0a7d64);
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* ============== Reusable 6-digit OTP boxes ============== */

function focusOtpBox(idx: number) {
  const el = document.querySelector<HTMLInputElement>(
    `input[data-otp-idx="${idx}"]`
  );
  el?.focus();
  el?.select();
}

function OtpBoxes({
  digits,
  setDigits,
  onComplete,
  disabled
}: {
  digits: string[];
  setDigits: (d: string[]) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // autofocus first empty box on mount / reset
    const idx = digits.findIndex((d) => !d);
    refs.current[idx === -1 ? 5 : idx]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAt = (i: number, val: string) => {
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    return next;
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    if (!v) {
      setAt(i, "");
      return;
    }
    const next = setAt(i, v);
    if (i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === 6) {
      onComplete(next.join(""));
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setAt(i - 1, "");
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) onComplete(text);
  };

  return (
    <div
      role="group"
      aria-label="Enter the 6-digit verification code"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: "0.5rem",
        margin: "0.4rem 0 1.2rem"
      }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-otp-idx={i}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={d}
          onChange={(e) => onChange(e, i)}
          onKeyDown={(e) => onKeyDown(e, i)}
          onPaste={onPaste}
          disabled={disabled}
          style={{
            height: 60,
            textAlign: "center",
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            border: "1.5px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            background: "#fff",
            color: "var(--color-text, #131313)",
            fontFamily: "inherit",
            transition:
              "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
            outline: "none",
            fontVariantNumeric: "tabular-nums"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary, #0a7d64)";
            e.currentTarget.style.boxShadow =
              "0 0 0 4px rgba(10, 160, 128, 0.12)";
            e.currentTarget.select();
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ))}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Step = "request" | "reset" | "done";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordInner />
    </Suspense>
  );
}

function ForgotPasswordInner() {
  const router = useRouter();
  const {
    user,
    ready,
    forgotPassword,
    resetPassword,
    loading,
    error,
    clearError
  } = useAuth();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const otpString = useMemo(() => otpDigits.join(""), [otpDigits]);

  const onRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!email.trim()) return setLocalError("Enter your email.");
    try {
      await forgotPassword(email);
      setStep("reset");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError(null);
    } catch {
      /* error surfaced via context */
    }
  };

  const submitReset = async (code: string) => {
    if (verifying) return;
    setOtpError(null);
    clearError();
    if (newPassword.length < 6) {
      return setOtpError("Password must be at least 6 characters.");
    }
    setVerifying(true);
    try {
      await resetPassword(email, code, newPassword);
      setStep("done");
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (e: any) {
      setOtpError(e?.message || "Could not reset password.");
      setOtpDigits(["", "", "", "", "", ""]);
    } finally {
      setVerifying(false);
    }
  };

  const onResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpString.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }
    if (newPassword.length < 6) {
      setOtpError("Password must be at least 6 characters.");
      return;
    }
    void submitReset(otpString);
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
            Secure your <em>Finvoq</em> account.
          </h2>
          <ul className="auth-points">
            <li>Email OTP verification ensures your security</li>
            <li>We'll never share your data</li>
          </ul>
        </div>
        <div className="auth-foot">
          © {new Date().getFullYear()} Finvoq Wealth Pvt. Ltd.
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {step === "request" && (
            <>
              <h1>Reset Password</h1>
              <p className="auth-sub">
                Enter your email address and we'll send you a 6-digit code to reset your password.
              </p>
              {shownError && <div className="auth-error">{shownError}</div>}
              <form onSubmit={onRequestSubmit}>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    autoFocus
                    autoComplete="username"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-cta"
                  data-magnetic
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1, marginTop: 12 }}
                >
                  {loading ? "Sending code…" : "Send Reset Code"}
                </button>
              </form>
              <p className="auth-foot-link">
                Remember your password? <Link href="/login">Back to login</Link>
              </p>
            </>
          )}

          {step === "reset" && (
            <>
              <h1>Enter Code & New Password</h1>
              <p className="auth-sub">
                We sent a 6-digit reset code to <strong>{email}</strong>.
              </p>

              {otpError && <div className="auth-error">{otpError}</div>}

              <form onSubmit={onResetSubmit}>
                <label>
                  <span>6-Digit Code</span>
                  <OtpBoxes
                    digits={otpDigits}
                    setDigits={setOtpDigits}
                    onComplete={() => {}}
                    disabled={verifying}
                  />
                </label>
                <label style={{ marginTop: 24 }}>
                  <span>New Password</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-cta"
                  data-magnetic
                  disabled={verifying || otpString.length !== 6 || newPassword.length < 6}
                  style={{ opacity: verifying ? 0.7 : 1, marginTop: 24 }}
                >
                  {verifying ? "Updating…" : "Reset & Login"}
                </button>
              </form>

              <p className="auth-foot-link">
                <button
                  type="button"
                  className="otp-link"
                  onClick={() => {
                    setStep("request");
                    setOtpError(null);
                  }}
                >
                  Use a different email
                </button>
              </p>
            </>
          )}

          {step === "done" && (
            <>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--color-success-bg, #f0fdf4)",
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
              <h1>Password Updated</h1>
              <p className="auth-sub">Redirecting to your dashboard…</p>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .otp-link {
          background: transparent;
          border: 0;
          padding: 0;
          font: inherit;
          color: var(--color-primary, #01696f);
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
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
    const idx = digits.findIndex((d) => !d);
    refs.current[idx === -1 ? 5 : idx]?.focus();
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
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
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
            border: "1.5px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            background: "#fff",
            color: "var(--color-text, #131313)",
            outline: "none"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary, #01696f)";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(1, 105, 111, 0.12)";
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

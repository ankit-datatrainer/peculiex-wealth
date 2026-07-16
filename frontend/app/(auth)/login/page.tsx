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

type Step = "creds" | "otp" | "done";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const {
    user,
    ready,
    login,
    verifyOtp,
    resendOtp,
    loading,
    error,
    clearError
  } = useAuth();

  const [step, setStep] = useState<Step>("creds");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // OTP step state
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    ""
  ]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const next = search.get("next");

  useEffect(() => {
    if (ready && user) {
      const defaultNext = (user.role === "superadmin" || user.role === "admin") ? "/admin" : "/watchlist";
      router.replace(next || defaultNext);
    }
  }, [ready, user, router, next]);

  // Pretty resend countdown
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  const otpString = useMemo(() => otpDigits.join(""), [otpDigits]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!email.trim()) return setLocalError("Enter your email.");
    if (password.length < 6)
      return setLocalError("Password must be at least 6 characters.");
    try {
      const r = await login(email, password);
      if (r.ok) {
        setStep("done");
        setTimeout(() => {
          const defaultNext = (r.user?.role === "superadmin" || r.user?.role === "admin") ? "/admin" : "/watchlist";
          router.replace(next || defaultNext);
        }, 400);
      } else if (r.needsVerification) {
        // Pivot to OTP step. The backend already pushed a fresh code.
        setPendingEmail(r.pendingEmail);
        setStep("otp");
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpError(null);
        setResendIn(60);
      }
    } catch {
      /* error already surfaced via context */
    }
  };

  const submitOtp = async (code: string) => {
    if (verifying) return;
    setOtpError(null);
    clearError();
    setVerifying(true);
    try {
      const u = await verifyOtp(pendingEmail, code);
      setStep("done");
      setTimeout(() => {
        const defaultNext = (u?.role === "superadmin" || u?.role === "admin") ? "/admin" : "/watchlist";
        router.replace(next || defaultNext);
      }, 400);
    } catch (e: any) {
      setOtpError(e?.message || "Could not verify your code.");
      setOtpDigits(["", "", "", "", "", ""]);
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
      await resendOtp(pendingEmail);
      setResendIn(60);
    } catch (e: any) {
      setOtpError(e?.message || "Could not resend the code.");
    }
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
            Welcome back to <em>India&apos;s smartest</em> investment marketplace.
          </h2>
          <ul className="auth-points">
            <li>Eight asset classes, one unified dashboard</li>
            <li>SEBI-registered, advisor-led, transparent pricing</li>
            <li>Trusted by 4,000+ investors managing ₹450 Cr+</li>
          </ul>
        </div>
        <div className="auth-foot">
          © {new Date().getFullYear()} Finvoq Wealth Pvt. Ltd.
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {step === "creds" && (
            <>
              <h1>Login to your account</h1>
              <p className="auth-sub">
                New to Finvoq?{" "}
                <Link href="/signup">Open a free account →</Link>
              </p>
              {shownError && <div className="auth-error">{shownError}</div>}
              <form onSubmit={onSubmit}>
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
                <label>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span>Password</span>
                    <Link href="/forgot-password" tabIndex={-1} style={{ fontSize: "0.85rem", color: "var(--color-primary, #0a7d64)", textDecoration: "none", fontWeight: 500 }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
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
                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-cta"
                  data-magnetic
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Signing you in…" : "Login"}
                </button>
              </form>
              <p className="auth-foot-link">
                <Link href="/signup">First time here? Create an account →</Link>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <h1>Verify your email</h1>
              <p className="auth-sub">
                Looks like <strong>{pendingEmail}</strong> hasn&apos;t been
                verified yet. We just sent a fresh 6-digit code to your inbox.{" "}
                <button
                  type="button"
                  className="otp-link"
                  onClick={() => {
                    setStep("creds");
                    setOtpError(null);
                  }}
                >
                  Use a different email
                </button>
              </p>

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
                  {verifying ? "Verifying…" : "Verify & login"}
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
              <h1>You&apos;re in.</h1>
              <p className="auth-sub">Redirecting to your watchlist…</p>
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
          color: var(--color-primary, #0a7d64);
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* ============== shared OTP boxes (kept inline for simplicity) ============== */

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
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
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

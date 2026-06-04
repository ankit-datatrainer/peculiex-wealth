"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";

export default function Onboard() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      interest: String(fd.get("interest") || ""),
      budget: String(fd.get("budget") || ""),
      message: String(fd.get("msg") || "")
    };
    if (!payload.name || !payload.email || !payload.phone) {
      setError("Please fill name, email, and phone.");
      return;
    }
    const formEl = e.currentTarget;
    setSubmitting(true);
    try {
      await postJSON("/api/leads", payload);
      setSuccess(true);
      formEl.reset();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="onboard" className="onboard-sec">
      <div className="container onboard-grid">
        <div className="onboard-left">
          <div className="sec-head reveal">
            <div className="label">Get Started</div>
            <h2 className="stitle">
              Open your account in <em>minutes</em>
            </h2>
            <p className="sdesc">
              Start investing with a simple, guided onboarding process.
            </p>
          </div>
          <ol className="steps">
            <li className="reveal">
              <span className="step-no">01</span>
              <div>
                <h4>Share your details</h4>
                <p>
                  Basic profile, contact information, and investment
                  preferences.
                </p>
              </div>
            </li>
            <li className="reveal">
              <span className="step-no">02</span>
              <div>
                <h4>Complete KYC verification</h4>
                <p>
                  Aadhaar-based eKYC or upload PAN &amp; address proof — done
                  in under 5 minutes.
                </p>
              </div>
            </li>
            <li className="reveal">
              <span className="step-no">03</span>
              <div>
                <h4>Get matched with an advisor</h4>
                <p>
                  Based on your goals and risk profile, we pair you with the
                  right expert.
                </p>
              </div>
            </li>
            <li className="reveal">
              <span className="step-no">04</span>
              <div>
                <h4>Start investing</h4>
                <p>
                  Access the full marketplace — equities, unlisted, MF, PMS,
                  bonds &amp; more.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <form
          className="onboard-form reveal"
          data-tilt
          id="onboardForm"
          onSubmit={onSubmit}
        >
          <h3>Investor Interest Form</h3>
          <p className="form-sub">
            Tell us about yourself and we'll get you started.
          </p>

          <label>
            <span>Full Name</span>
            <input required type="text" name="name" placeholder="Your full name" />
          </label>
          <div className="form-row">
            <label>
              <span>Email</span>
              <input required type="email" name="email" placeholder="you@email.com" />
            </label>
            <label>
              <span>Phone</span>
              <input required type="tel" name="phone" placeholder="+91 ..." />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>Interest</span>
              <select name="interest" defaultValue="Demat Account">
                <option>Demat Account</option>
                <option>Mutual Funds</option>
                <option>PMS / AIF</option>
                <option>Unlisted Shares</option>
                <option>Bonds</option>
                <option>Insurance</option>
              </select>
            </label>
            <label>
              <span>Budget</span>
              <select name="budget" defaultValue="Below ₹1 Lakh">
                <option>Below ₹1 Lakh</option>
                <option>₹1 Lakh – ₹10 Lakh</option>
                <option>₹10 Lakh – ₹50 Lakh</option>
                <option>₹50 Lakh – ₹1 Cr</option>
                <option>₹1 Cr and above</option>
              </select>
            </label>
          </div>
          <label>
            <span>Message (optional)</span>
            <textarea
              name="msg"
              rows={3}
              placeholder="Anything you'd like to share..."
            />
          </label>
          <button
            type="submit"
            className="btn btn-gold btn-lg form-submit"
            data-magnetic
            style={{ opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : success ? "Submitted ✓" : "Submit & Get Started"}
          </button>
          <div
            className={`form-success${success ? " show" : ""}`}
            id="formSuccess"
          >
            ✓ Submitted. We'll reach out within 24 hours.
          </div>
          {error && (
            <div
              style={{
                color: "var(--color-danger)",
                marginTop: "0.75rem",
                fontSize: "0.9rem"
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

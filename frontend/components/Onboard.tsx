"use client";

import { useState } from "react";
import { postJSON } from "@/lib/api";
import Logo from "./Logo";
import { useContent, accent } from "@/lib/content";

/** Render a *starred* CMS heading with the <em> accent the design uses. */
function heading(text: string) {
  return accent(text).map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <em key={i}>{p.em}</em>
  );
}

/* Fallback steps: used until a super admin edits them in the CMS. */
const STEPS = [
  { title: "Share your details", body: "Basic profile, contact information, and investment preferences." },
  { title: "Complete KYC verification", body: "Aadhaar-based eKYC or upload PAN & address proof, done in under 5 minutes." },
  { title: "Get matched with an advisor", body: "Based on your goals and risk profile, we pair you with the right expert." },
  { title: "Start investing", body: "Access the full marketplace: equities, unlisted, MF, PMS, bonds & more." }
];

/* Fallback select options, mirroring the CMS defaults (Get Started → Interest form fields). */
const INTERESTS = [
  { label: "Demat Account" },
  { label: "Mutual Funds" },
  { label: "PMS / AIF" },
  { label: "Unlisted Shares" },
  { label: "Bonds" },
  { label: "Insurance" }
];
const BUDGETS = [
  { label: "Below ₹1 Lakh" },
  { label: "₹1 Lakh to ₹10 Lakh" },
  { label: "₹10 Lakh to ₹50 Lakh" },
  { label: "₹50 Lakh to ₹1 Cr" },
  { label: "₹1 Cr and above" }
];

export default function Onboard() {
  const cms = useContent("get-started");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = (field: string, fallback: string) => cms.t("form", field, fallback);
  const interests = cms.list("form", "interests", INTERESTS).filter((o) => o.label);
  const budgets = cms.list("form", "budgets", BUDGETS).filter((o) => o.label);

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
      setError(form("requiredError", "Please fill name, email, and phone."));
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
      setError(err?.message || form("genericError", "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="onboard" className="onboard-sec">
      <div className="container onboard-grid">
        <div className="onboard-left">
          <div className="sec-head reveal">
            <Logo
              width={112}
              height={80}
              className="page-hero-logo"
              style={{ margin: "0 0 22px" }}
            />
            <div className="label">{cms.t("hero", "label", "Get Started")}</div>
            <h2 className="stitle">{heading(cms.t("hero", "title", "Open your account in *minutes*"))}</h2>
            <p className="sdesc">{cms.t("hero", "subtitle", "Start investing with a simple, guided onboarding process.")}</p>
          </div>
          <ol className="steps">
            {cms.list("steps", "items", STEPS).map((st: any, i: number) => (
              <li className="reveal" key={i}>
                <span className="step-no">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h4>{st.title}</h4>
                  <p>{st.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <form
          className="onboard-form reveal"
          data-tilt
          id="onboardForm"
          onSubmit={onSubmit}
        >
          <h3>{cms.t("hero", "formTitle", "Investor Interest Form")}</h3>
          <p className="form-sub">
            {cms.t(
              "hero",
              "formNote",
              "Tell us about yourself and we'll get you started."
            )}
          </p>

          <label>
            <span>{form("nameLabel", "Full Name")}</span>
            <input required type="text" name="name" placeholder={form("namePlaceholder", "Your full name")} />
          </label>
          <div className="form-row">
            <label>
              <span>{form("emailLabel", "Email")}</span>
              <input required type="email" name="email" placeholder={form("emailPlaceholder", "you@email.com")} />
            </label>
            <label>
              <span>{form("phoneLabel", "Phone")}</span>
              <input required type="tel" name="phone" placeholder={form("phonePlaceholder", "+91 ...")} />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>{form("interestLabel", "Interest")}</span>
              <select name="interest" defaultValue={interests[0]?.label}>
                {interests.map((o, i) => (
                  <option key={`${o.label}-${i}`}>{o.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{form("budgetLabel", "Budget")}</span>
              <select name="budget" defaultValue={budgets[0]?.label}>
                {budgets.map((o, i) => (
                  <option key={`${o.label}-${i}`}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>{form("messageLabel", "Message (optional)")}</span>
            <textarea
              name="msg"
              rows={3}
              placeholder={form("messagePlaceholder", "Anything you'd like to share...")}
            />
          </label>
          <button
            type="submit"
            className="btn btn-gold btn-lg form-submit"
            data-magnetic
            style={{ opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting
              ? form("submittingLabel", "Submitting…")
              : success
                ? form("submittedLabel", "Submitted ✓")
                : cms.t("hero", "formButton", "Submit & Get Started")}
          </button>
          <div
            className={`form-success${success ? " show" : ""}`}
            id="formSuccess"
          >
            {form("successText", "✓ Submitted. We'll reach out within 24 hours.")}
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

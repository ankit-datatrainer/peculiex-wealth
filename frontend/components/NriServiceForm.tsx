"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";
import { useContent } from "@/lib/content";
import { fill } from "@/lib/template";

/**
 * Callback form beside each NRI service page. Its copy is the `form` section
 * of that page's CMS entry (`nri-pan`, `nri-tax`, `nri-citizenship`).
 */
export default function NriServiceForm({
  serviceName,
  page,
  ctaLabel
}: {
  serviceName: string;
  /** CMS page the copy is read from. */
  page?: string;
  /** Overrides the CMS heading / button label when given. */
  ctaLabel?: string;
}) {
  const cms = useContent(page || "");
  const t = (field: string, fallback: string) => cms.t("form", field, fallback);
  const cta = ctaLabel || t("title", "Request a callback");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim() || !country.trim()) {
      setError(t("requiredError", "Please fill in all required fields."));
      return;
    }
    setSubmitting(true);
    try {
      await postJSON("/api/leads", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        interest: serviceName,
        budget: country.trim(),
        message: message.trim() || null
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || t("genericError", "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="nri-svc-form-card nri-svc-form-success">
        <div className="nri-svc-success-icon">✓</div>
        <h3>{t("successTitle", "Request received")}</h3>
        <p>
          {fill(
            t(
              "successBody",
              "Thank you. Our NRI desk will reach out within one business day to discuss your {service} requirement."
            ),
            { service: serviceName.toLowerCase() }
          )}
        </p>
      </div>
    );
  }

  return (
    <form className="nri-svc-form-card" onSubmit={onSubmit}>
      <h3>{cta}</h3>
      <p className="nri-svc-form-sub">
        {t("subtitle", "Share a few details and our team will get in touch.")}
      </p>

      <div className="nri-svc-form-grid">
        <label className="nri-svc-field">
          <span>{t("nameLabel", "Full name *")}</span>
          <input
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder", "Your name")}
            required
          />
        </label>
        <label className="nri-svc-field">
          <span>{t("emailLabel", "Email *")}</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder", "you@email.com")}
            required
          />
        </label>
        <label className="nri-svc-field">
          <span>{t("phoneLabel", "Phone / WhatsApp *")}</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder", "+91 98765 43210")}
            required
          />
        </label>
        <label className="nri-svc-field">
          <span>{t("countryLabel", "Country of residence *")}</span>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={t("countryPlaceholder", "e.g. UAE, USA, UK")}
            required
          />
        </label>
      </div>

      <label className="nri-svc-field nri-svc-field-wide">
        <span>{t("messageLabel", "Anything specific we should know? (optional)")}</span>
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder", "Tell us a bit about your situation…")}
        />
      </label>

      {error && <p className="nri-svc-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
        {submitting ? t("submitting", "Submitting…") : cta}
      </button>
      <p className="nri-svc-form-fine">
        {t(
          "consent",
          "By submitting, you authorise us to contact you by call, email or WhatsApp."
        )}
      </p>
    </form>
  );
}

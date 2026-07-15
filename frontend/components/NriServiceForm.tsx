"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";

export default function NriServiceForm({
  serviceName,
  ctaLabel = "Request a callback"
}: {
  serviceName: string;
  ctaLabel?: string;
}) {
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
      setError("Please fill in all required fields.");
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
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="nri-svc-form-card nri-svc-form-success">
        <div className="nri-svc-success-icon">✓</div>
        <h3>Request received</h3>
        <p>
          Thank you — our NRI desk will reach out within one business day to
          discuss your {serviceName.toLowerCase()} requirement.
        </p>
      </div>
    );
  }

  return (
    <form className="nri-svc-form-card" onSubmit={onSubmit}>
      <h3>{ctaLabel}</h3>
      <p className="nri-svc-form-sub">
        Share a few details and our team will get in touch to take this forward.
      </p>

      <div className="nri-svc-form-grid">
        <label className="nri-svc-field">
          <span>Full name *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        </label>
        <label className="nri-svc-field">
          <span>Email *</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
        </label>
        <label className="nri-svc-field">
          <span>Phone / WhatsApp *</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" required />
        </label>
        <label className="nri-svc-field">
          <span>Country of residence *</span>
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. UAE, USA, UK" required />
        </label>
      </div>

      <label className="nri-svc-field nri-svc-field-wide">
        <span>Anything specific we should know? (optional)</span>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a bit about your situation…"
        />
      </label>

      {error && <p className="nri-svc-error">{error}</p>}

      <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
        {submitting ? "Submitting…" : ctaLabel}
      </button>
      <p className="nri-svc-form-fine">
        By submitting, you authorise us to contact you by call, email or WhatsApp regarding this request.
      </p>
    </form>
  );
}

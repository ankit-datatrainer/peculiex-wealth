"use client";
import { useState, useRef, useEffect } from "react";
import { postJSON } from "@/lib/api";

type InvestModalProps = {
  open: boolean;
  onClose: () => void;
  company: {
    name: string;
    price: number;
    min_units: number;
    sector: string;
    logo_url?: string | null;
  };
};

export default function InvestModal({ open, onClose, company }: InvestModalProps) {
  const [units, setUnits] = useState<number>(company.min_units || 1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnits(company.min_units || 1);
      setSubmitted(false);
      setError(null);
      setName("");
      setEmail("");
      setPhone("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, company]);

  if (!open) return null;

  const investmentAmount = units * company.price;
  const stampDuty = investmentAmount * 0.00015;
  const finalAmount = investmentAmount + stampDuty;

  const fmtINR = (n: number) =>
    "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in your name and phone.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await postJSON("/api/leads", {
        name: name.trim(),
        email: email.trim(),
        mobile: phone.trim(),
        source: "unlisted-invest",
        notes: `Interest in ${company.name} — ${units} units @ ${fmtINR(company.price)}/unit = ${fmtINR(finalAmount)}`
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="invest-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className={`invest-modal${submitted ? " invest-modal--success" : ""}`}>
        <button className="invest-modal__close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="invest-success">
            <div className="invest-success__icon">
              <svg viewBox="0 0 52 52" width="72" height="72">
                <circle className="invest-success__circle" cx="26" cy="26" r="25" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                <path className="invest-success__check" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3>Inquiry Submitted!</h3>
            <p>Our team will reach out to you shortly regarding <strong>{company.name}</strong>.</p>
            <button className="invest-modal__btn" onClick={onClose} style={{ marginTop: 24 }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="invest-modal__header">
              <h3>{company.name} Unlisted Share Price Today</h3>
              <div className="invest-modal__price-badge">
                {fmtINR(company.price)} <span className="invest-modal__change">+0 (0%) 1Y</span>
              </div>
            </div>

            <div className="invest-modal__body">
              <div className="invest-modal__row">
                <span>Price per Unit</span>
                <strong>{fmtINR(company.price)}</strong>
              </div>
              <div className="invest-modal__row">
                <span>Minimum no. of Units</span>
                <strong>{company.min_units}</strong>
              </div>
              <div className="invest-modal__row invest-modal__row--input">
                <span>Enter Units</span>
                <input
                  type="number"
                  min={1}
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                  className="invest-modal__units-input"
                />
              </div>

              <div className="invest-modal__divider" />

              <div className="invest-modal__wa">
                Best bulk price?{" "}
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/919999999999"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>Chat with us on WhatsApp!</strong>{" "}
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="#25D366" style={{ verticalAlign: "middle" }}>
                    <path d="M16.001 3.2C9.043 3.2 3.4 8.842 3.4 15.8c0 2.227.581 4.4 1.683 6.314L3.2 28.8l6.864-1.802a12.59 12.59 0 0 0 5.937 1.51h.005c6.957 0 12.6-5.642 12.6-12.6 0-3.367-1.31-6.531-3.69-8.91A12.521 12.521 0 0 0 16.001 3.2z" />
                  </svg>
                </a>
              </div>

              <div className="invest-modal__row">
                <span>Investment Amount</span>
                <strong>{fmtINR(investmentAmount)}</strong>
              </div>
              <div className="invest-modal__row">
                <span>Stamp Duty (0.015%)</span>
                <strong>{fmtINR(stampDuty)}</strong>
              </div>
              <div className="invest-modal__row invest-modal__row--total">
                <span>Final Amount</span>
                <strong>{fmtINR(finalAmount)}</strong>
              </div>

              <div className="invest-modal__divider" />

              <form className="invest-modal__form" onSubmit={handleSubmit}>
                <h4>Get in touch with us</h4>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                {error && <p className="invest-modal__error">{error}</p>}
                <button
                  type="submit"
                  className="invest-modal__btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="invest-modal__spinner" />
                  ) : (
                    "Invest Now"
                  )}
                </button>
              </form>

              <div className="invest-modal__note">
                <strong>Please note:</strong> The settlement period is 15 working days from the transaction date.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

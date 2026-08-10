"use client";
import { useState, useRef, useEffect } from "react";
import { postJSON } from "@/lib/api";
import { useWhatsApp } from "@/lib/siteSettings";

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
  const wa = useWhatsApp();

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
        notes: `Interest in ${company.name}, ${units} units @ ${fmtINR(company.price)}/unit = ${fmtINR(finalAmount)}`
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
    <div
      className="invest-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      data-lenis-prevent
    >
      {/* Small-screen / short-viewport hardening (additive; desktop rules unchanged) */}
      <style jsx global>{`
        .invest-overlay {
          box-sizing: border-box;
          max-width: 100%;
          overflow: hidden;
        }
        .invest-modal {
          /* min() keeps desktop at the existing 520px / 90vh, shrinks on small screens */
          max-width: min(520px, 100%);
          max-height: min(90vh, 90dvh);
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .invest-modal__header-top > div {
          min-width: 0;
        }
        .invest-modal__title,
        .invest-modal--success p {
          overflow-wrap: anywhere;
        }
        .invest-modal__summary-row span,
        .invest-modal__wa span {
          min-width: 0;
        }

        @media (max-width: 560px) {
          .invest-overlay {
            padding: 12px;
          }
          .invest-modal {
            max-height: min(94vh, 94dvh);
          }
          .invest-modal__header {
            padding: 20px 16px 16px;
          }
          .invest-modal__header-top {
            gap: 10px;
            /* Clears the close button, which the responsive layer grows to the
               44px tap minimum below 1024px. */
            padding-right: 52px;
          }
          .invest-modal__title {
            font-size: 1.08rem;
          }
          .invest-modal__price-row {
            flex-wrap: wrap;
            gap: 6px 10px;
          }
          .invest-modal__price {
            font-size: 1.45rem;
          }
          .invest-modal__body {
            padding: 18px 16px 22px;
          }
          .invest-modal__calculator-card,
          .invest-modal__summary-card {
            padding: 14px;
          }
          .invest-modal__calc-row {
            flex-wrap: wrap;
            gap: 10px;
          }
          .invest-modal__input-wrapper {
            flex: 1 1 100%;
          }
          .invest-modal__units-input {
            width: 100%;
          }
          .invest-modal__wa {
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px 14px;
          }
          .invest-modal__summary-row {
            gap: 12px;
          }
          .invest-modal__summary-row strong {
            text-align: right;
          }
          .invest-modal__total-price {
            font-size: 1.15rem;
          }
          .invest-modal--success {
            padding: 36px 18px;
          }
        }

        /* Landscape phones / short viewports: keep the dialog fully reachable */
        @media (max-height: 480px) {
          .invest-overlay {
            padding: 8px;
            align-items: flex-start;
          }
          .invest-modal {
            max-height: min(96vh, 96dvh);
            margin: 0 auto;
          }
          .invest-modal__header {
            padding: 16px 20px 12px;
          }
          .invest-modal__price {
            font-size: 1.4rem;
          }
          .invest-modal--success {
            padding: 28px 20px;
          }
        }
      `}</style>
      <div
        className={`invest-modal${submitted ? " invest-modal--success" : ""}`}
        data-lenis-prevent
      >
        <button className="invest-modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitted ? (
          <div className="invest-success">
            <div className="invest-success__icon">
              <svg viewBox="0 0 52 52" width="72" height="72">
                <circle className="invest-success__circle" cx="26" cy="26" r="25" fill="none" stroke="var(--color-primary, #059669)" strokeWidth="2" />
                <path className="invest-success__check" fill="none" stroke="var(--color-primary, #059669)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.8-16.8" />
              </svg>
            </div>
            <h3>Allocation Request Received!</h3>
            <p>Our private wealth desk will contact you shortly regarding <strong>{company.name}</strong>.</p>
            <button className="invest-modal__btn" onClick={onClose} style={{ marginTop: 24 }}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="invest-modal__header">
              <div className="invest-modal__header-top">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo_url} alt={company.name} className="invest-modal__logo" />
                ) : null}
                <div>
                  <span className="invest-modal__sector-badge">{company.sector || "Unlisted Share"}</span>
                  <h3 className="invest-modal__title">{company.name}</h3>
                </div>
              </div>
              <div className="invest-modal__price-row">
                <div className="invest-modal__price">
                  {fmtINR(company.price)} <span className="invest-modal__unit-label">/ unit</span>
                </div>
                <span className="invest-modal__change-badge">+0 (0%) 1Y</span>
              </div>
            </div>

            {/* Below 600px wide / 540px tall the responsive layer turns this
                into the dialog's scroll container (fixed header, scrolling
                body). Lenis hijacks wheel events site-wide, so the attribute
                has to be here too or the container never scrolls. */}
            <div className="invest-modal__body" data-lenis-prevent>
              {/* Units Selector */}
              <div className="invest-modal__calculator-card">
                <div className="invest-modal__calc-row">
                  <div>
                    <label className="invest-modal__label">Number of Units</label>
                    <span className="invest-modal__sublabel">Minimum required: {company.min_units} units</span>
                  </div>
                  <div className="invest-modal__input-wrapper">
                    <input
                      type="number"
                      min={company.min_units || 1}
                      value={units}
                      onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                      className="invest-modal__units-input"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Banner */}
              <div className="invest-modal__wa">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Looking for bulk deal pricing?</span>
                </div>
                <a
                  href={
                    // Pre-fill the share and quantity so the thread opens with
                    // the context the desk needs, not a bare "Hi".
                    wa.link(
                      `Hi Finvoq team! I'd like bulk deal pricing on ${company.name} (${units} units).`
                    ) || "/contact"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="invest-modal__wa-link"
                >
                  Chat on WhatsApp &rarr;
                </a>
              </div>

              {/* Summary Card */}
              <div className="invest-modal__summary-card">
                <div className="invest-modal__summary-row">
                  <span>Investment Amount</span>
                  <strong>{fmtINR(investmentAmount)}</strong>
                </div>
                <div className="invest-modal__summary-row">
                  <span>Government Stamp Duty (0.015%)</span>
                  <strong>{fmtINR(stampDuty)}</strong>
                </div>
                <div className="invest-modal__summary-row invest-modal__summary-row--total">
                  <span>Total Payable Amount</span>
                  <strong className="invest-modal__total-price">{fmtINR(finalAmount)}</strong>
                </div>
              </div>

              {/* Inquiry Form */}
              <form className="invest-modal__form" onSubmit={handleSubmit}>
                <h4 className="invest-modal__form-title">Request Share Allocation</h4>
                <div className="invest-modal__field-group">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="invest-modal__input"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="invest-modal__input"
                  />
                  <input
                    type="email"
                    placeholder="Email Address (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="invest-modal__input"
                  />
                </div>
                {error && <p className="invest-modal__error">{error}</p>}
                <button
                  type="submit"
                  className="invest-modal__btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="invest-modal__spinner" />
                  ) : (
                    "Submit Inquiry & Reserve Shares"
                  )}
                </button>
              </form>

              <div className="invest-modal__note">
                🔒 <strong>Settlement terms:</strong> 100% verified transfer via your Demat account within standard 15 working days.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

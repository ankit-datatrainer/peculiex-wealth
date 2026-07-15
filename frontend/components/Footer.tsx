"use client";
import { useState, useEffect } from "react";
import { postJSON } from "@/lib/api";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setYear(new Date().getFullYear()), []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const input = formEl.querySelector<HTMLInputElement>('input[type="email"]');
    if (!input?.value || !input.checkValidity()) {
      input?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await postJSON("/api/newsletter", { email: input.value });
      setSuccess(true);
      input.value = "";
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || "Could not subscribe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container foot-newsletter reveal">
        <div className="fn-text">
          <h3>
            Get the <em>weekly market brief.</em>
          </h3>
          <p>
            Curated insights from our research team — every Monday before
            markets open. No promotions, no spam, ever.
          </p>
        </div>
        <form
          className="fn-form"
          id="newsletterForm"
          noValidate
          onSubmit={onSubmit}
        >
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            required
            aria-label="Email address"
          />
          <button
            className="btn btn-primary"
            type="submit"
            data-magnetic
            disabled={submitting}
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            <span>
              {submitting ? "Subscribing…" : success ? "Subscribed ✓" : "Subscribe"}
            </span>
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <path
                d="M1 7h12m0 0L8 2m5 5l-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <p className={`fn-msg${success ? " show" : ""}`} id="fnMsg">
            ✓ Subscribed. Look out for Monday's brief in your inbox.
          </p>
          {error && (
            <p
              style={{
                color: "var(--color-danger)",
                marginTop: "0.5rem",
                fontSize: "0.85rem"
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="container foot-grid">
        <div className="foot-col foot-brand">
          <div className="logo">
            <span className="logo-mark">
              <span>f</span>
            </span>
            <span className="logo-text">
              finvo<em>q</em>
            </span>
          </div>
          <p>
            India's premium investment marketplace. Eight asset classes, one
            platform, advisory-led.
          </p>
          <div className="foot-reg">
            <span className="status-dot"></span>SEBI Registered Investment Distributor
          </div>
        </div>

        <div className="foot-col">
          <h4>Products</h4>
          <ul>
            <li>
              <a href="/products/equities">Equities</a>
            </li>
            <li>
              <a href="/products/mutual-funds">Mutual Funds</a>
            </li>
            <li>
              <a href="/products/pms">PMS</a>
            </li>
            <li>
              <a href="/products/aif">AIF</a>
            </li>
            <li>
              <a href="/products/fixed-deposits">FDs</a>
            </li>
            <li>
              <a href="/products/bonds">Bonds</a>
            </li>
            <li>
              <a href="/products/insurance">Insurance</a>
            </li>
            <li>
              <a href="/unlisted">Unlisted</a>
            </li>
          </ul>
        </div>

        <div className="foot-col">
          <h4>Company</h4>
          <ul>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/stories">Investor stories</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
            <li>
              <a href="/get-started">Get started</a>
            </li>
            <li>
              <a href="/careers">Careers</a>
            </li>
            <li>
              <a href="/press">Press kit</a>
            </li>
          </ul>
        </div>

        <div className="foot-col">
          <h4>Resources</h4>
          <ul>
            <li>
              <a href="/news">News</a>
            </li>
            <li>
              <a href="/calculator">SIP Calculator</a>
            </li>
            <li>
              <a href="/calculator/lumpsum">Lumpsum Calculator</a>
            </li>
            <li>
              <a href="/calculator/goal-planner">Goal Planner</a>
            </li>
            <li>
              <a href="/insights">Market Insights</a>
            </li>
            <li>
              <a href="/glossary">Glossary</a>
            </li>
          </ul>
        </div>

        <div className="foot-col">
          <h4>Legal</h4>
          <ul>
            <li>
              <a href="/legal/terms">Terms of service</a>
            </li>
            <li>
              <a href="/legal/privacy">Privacy policy</a>
            </li>
            <li>
              <a href="/legal/risk-disclosure">Risk disclosure</a>
            </li>
            <li>
              <a href="/legal/grievance">Grievance redressal</a>
            </li>
            <li>
              <a href="/legal/investor-charter">Investor charter</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container foot-band">
        <div className="foot-disclaim">
          <p>
            <strong>
              Investments in securities markets are subject to market risks.
            </strong>{" "}
            Read all related documents carefully before investing. Past
            performance does not guarantee future returns. Finvoq Wealth Pvt.
            Ltd. is a SEBI Registered Investment Distributor. Demat services are
            provided by SEBI-registered partner brokers.
          </p>
          <p className="foot-codes">
            SEBI RIA: INA000099999 · CIN: U67100MH2024PTC999999 · GST:
            27ABCDE1234F1Z5
          </p>
        </div>
        <div className="foot-social" aria-label="Social links">
          <a href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 10v8M8 7v.01M12 18v-5a3 3 0 0 1 6 0v5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </a>
          <a href="#" aria-label="X">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 4l16 16M20 4L4 20"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>
          <a href="#" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="2"
                y="6"
                width="20"
                height="13"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M10 10l5 2.5-5 2.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="container foot-base">
        <span>
          © <span id="year">{year ?? ""}</span> Finvoq Wealth Pvt. Ltd. — All
          rights reserved.
        </span>
        <span>Crafted with care · Mumbai, India</span>
      </div>
    </footer>
  );
}

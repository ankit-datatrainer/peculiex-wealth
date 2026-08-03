"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { postJSON } from "@/lib/api";
import Logo from "./Logo";
import { useContent, accent } from "@/lib/content";
import {
  DEMAT_DISCLOSURE,
  REGISTRATION_CODES_LINE,
  REGISTRATION_LINE,
  REGISTRATION_NUMBER,
  REGULATORY_LABEL
} from "@/lib/siteFacts";
import { SOCIAL_ICON_PATHS } from "@/lib/socialIcons";
import {
  contactFrom,
  footerColumnsFrom,
  socialFrom,
  whatsappFrom,
  type FooterColumn
} from "@/lib/siteSettings";

/* Link columns as they ship. The CMS replaces these wholesale; they remain so
   a footer still navigates if the content API is unreachable. */
const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Products",
    links: [
      { label: "Equities", href: "/products/equities" },
      { label: "Mutual Funds", href: "/products/mutual-funds" },
      { label: "PMS", href: "/products/pms" },
      { label: "AIF", href: "/products/aif" },
      { label: "FDs", href: "/products/fixed-deposits" },
      { label: "Bonds", href: "/products/bonds" },
      { label: "Insurance", href: "/products/insurance" },
      { label: "Unlisted", href: "/unlisted" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Investor stories", href: "/stories" },
      { label: "FAQ", href: "/faq" },
      { label: "Get started", href: "/get-started" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "News", href: "/news" },
      { label: "SIP Calculator", href: "/calculator" },
      { label: "Lumpsum Calculator", href: "/calculator/lumpsum" },
      { label: "Goal Planner", href: "/calculator/goal-planner" },
      { label: "Market Insights", href: "/insights" },
      { label: "Glossary", href: "/glossary" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Risk disclosure", href: "/legal/risk-disclosure" },
      { label: "Grievance redressal", href: "/legal/grievance" },
      { label: "Investor charter", href: "/legal/investor-charter" }
    ]
  }
];

/** Render a *starred* CMS heading with the <em> accent the design uses. */
function heading(text: string) {
  return accent(text).map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <em key={i}>{p.em}</em>
  );
}


export default function Footer() {
  const cms = useContent("global");
  const columns = footerColumnsFrom(cms, FOOTER_COLUMNS);
  const social = socialFrom(cms);
  const whatsapp = whatsappFrom(cms);
  const contact = contactFrom(cms);
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);


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

  // The homepage is the SecuredFi-style clone, which ships its own footer —
  // rendering this one too would stack two footers on the blue page.
  if (pathname === "/") return null;

  return (
    <footer className="site-footer">
      <div className="container foot-newsletter reveal">
        <div className="fn-text">
          <h3>{heading(cms.t("footer", "newsletterTitle", "Get the *weekly market brief.*"))}</h3>
          <p>{cms.t("footer", "newsletterBody", "Curated insights from our research team, every Monday before markets open. No promotions, no spam, ever.")}</p>
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
          {success && (
            <p className="fn-msg show" id="fnMsg">
              ✓ Subscribed. Look out for Monday's brief in your inbox.
            </p>
          )}
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
            <Logo width={168} height={66} />
          </div>
          <p>
            {cms.t(
              "footer",
              "blurb",
              "India's premium investment marketplace. Multiple asset classes, one platform, advisory-led."
            )}
          </p>
          <div className="foot-reg">
            <span className="status-dot"></span>{cms.t("footer", "badge", REGISTRATION_LINE)}
          </div>
          {/* Direct routes in the footer: the number is the fastest path to a
              human, and burying it on /contact costs the high-intent click. */}
          <ul className="foot-contact">
            {whatsapp.href ? (
              <li>
                <a href={whatsapp.href} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="15" height="15">
                    <path d={SOCIAL_ICON_PATHS.whatsapp} />
                  </svg>
                  WhatsApp {whatsapp.display}
                </a>
              </li>
            ) : null}
            {/* Same number as the WhatsApp row above, so it is labelled by
                what the tap does rather than repeated as a bare figure. */}
            {contact.phoneDisplay ? (
              <li>
                <a href={`tel:${contact.phone}`}>Call {contact.phoneDisplay}</a>
              </li>
            ) : null}
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div className="foot-col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container foot-band">
        <div className="foot-disclaim">
          <p>
            <strong>
              Investments in securities markets are subject to market risks.
            </strong>{" "}
            Read all related documents carefully before investing. Past
            performance does not guarantee future returns. Finvoq Wealth Pvt.
            Ltd. is an {REGULATORY_LABEL}
            {REGISTRATION_NUMBER ? ` (${REGISTRATION_NUMBER})` : ""}.{" "}
            {DEMAT_DISCLOSURE}
          </p>
          {/* The full AMFI risk-factor text is ~200 words of mandated small
              print. Collapsing it keeps the disclosure complete and one click
              away, instead of ending every page in a wall of grey type. */}
          <details className="foot-legal">
            <summary>
              <span>Full risk factors &amp; commission disclosure</span>
              <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <p>
              Risk Factors: Investments in Mutual Funds are subject to Market Risks. Read all scheme related documents carefully before investing. Mutual Fund Schemes do not assure or guarantee any returns. Past performances of any Mutual Fund Scheme may or may not be sustained in future. There is no guarantee that the investment objective of any suggested scheme shall be achieved. All existing and prospective investors are advised to check and evaluate the Exit loads and other cost structure (TER) applicable at the time of making the investment before finalizing on any investment decision for Mutual Funds schemes. We deal in Regular Plans only for Mutual Fund Schemes and earn a Trailing Commission on client investments. Disclosure For Commission earnings is made to clients at the time of investments. Option of Direct Plan for every Mutual Fund Scheme is available to investors offering advantage of lower expense ratio. We are not entitled to earn any commission on Direct plans. Hence we do not deal in Direct Plans.
            </p>
          </details>
          {REGISTRATION_CODES_LINE ? (
            <p className="foot-codes">{REGISTRATION_CODES_LINE}</p>
          ) : null}
        </div>
        {social.length > 0 && (
          <div className="foot-social" aria-label="Social links">
            {social.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="18" height="18">
                  <path d={SOCIAL_ICON_PATHS[s.id]} />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Oversized wordmark: anchors the bottom of the page and gives the
          footer a deliberate end, rather than trailing off into small print.
          Decorative only — the accessible brand name is in the logo above. */}
      <div className="foot-wordmark" aria-hidden="true">
        <span>Finvoq</span>
      </div>

      <div className="container foot-base">
        <span>
          © <span id="year">{year}</span> {cms.t("footer", "copyright", "Finvoq Wealth Pvt. Ltd. All rights reserved.")}
        </span>
        <span>{cms.t("footer", "madeIn", "Crafted with care · Delhi, India")}</span>
      </div>
    </footer>
  );
}

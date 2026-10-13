"use client";

/**
 * Members-only gate for /products/<slug>.
 *
 * A logged-out visitor sees the page hero and then this panel in place of
 * everything else: a blurred, inert impression of the content that continues
 * below, with a card asking them to log in or create an account. Both links
 * carry `next` so the visitor lands back on this exact product afterwards.
 *
 * All copy is CMS-editable under Global → "Product pages — members-only gate".
 * The fallbacks below must stay identical to that section's schema defaults.
 */

import Link from "next/link";
import { accent, useContent } from "@/lib/content";
import { GLOBAL_PAGE } from "@/lib/siteSettings";
import "./product-gate.css";

const GATE_BULLETS = [
  { text: "Live factsheets, returns and portfolio data" },
  { text: "Clear costs, fees and taxation, side by side" },
  { text: "A step-by-step path to invest, with an advisor on call" }
];

/** "Log in to see the full *{product}* briefing." -> JSX with the <em> accent. */
function renderHeadline(text: string, product: string) {
  return accent(text.split("{product}").join(product)).map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <em key={i}>{part.em}</em>
    )
  );
}

/**
 * The shape of the page's first sections — a metrics strip and a row of
 * cards — drawn as empty blocks. No real content, so nothing is leaked; it
 * only has to read as "the page carries on below".
 */
function Teaser({ shimmer = false }: { shimmer?: boolean }) {
  return (
    <div className={`pgate-teaser${shimmer ? " is-shimmer" : ""}`} aria-hidden="true">
      <div className="pgate-sk-metrics">
        {[0, 1, 2, 3].map((i) => (
          <div className="pgate-sk-metric" key={i}>
            <span className="pgate-sk-line pgate-sk-value" />
            <span className="pgate-sk-line pgate-sk-caption" />
          </div>
        ))}
      </div>
      <div className="pgate-sk-cards">
        {[0, 1, 2].map((i) => (
          <div className="pgate-sk-card" key={i}>
            <span className="pgate-sk-line pgate-sk-heading" />
            <span className="pgate-sk-line" />
            <span className="pgate-sk-line" />
            <span className="pgate-sk-line pgate-sk-short" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Placeholder while the session is still being checked. Deliberately neutral
 * — no lock, no call to action — so a logged-in visitor never sees the gate
 * flash, and a logged-out one never sees the real content flash.
 */
export function ProductGateSkeleton() {
  return (
    <section className="pgate pgate--loading" aria-busy="true" aria-label="Loading">
      <div className="container">
        <Teaser shimmer />
      </div>
    </section>
  );
}

type Props = {
  slug: string;
  /** Product name, substituted for {product} in the headline. */
  label: string;
};

export default function ProductGate({ slug, label }: Props) {
  const cms = useContent(GLOBAL_PAGE);

  const eyebrow = cms.t("productGate", "eyebrow", "Members only");
  const headline = cms.t(
    "productGate",
    "headline",
    "Log in to see the full *{product}* briefing."
  );
  const body = cms.t(
    "productGate",
    "body",
    "Detailed factsheets, costs and how investing works are reserved for Finvoq members. It takes a minute and costs nothing."
  );
  const bullets = cms
    .list<{ text: string }>("productGate", "bullets", GATE_BULLETS)
    .filter((b) => b.text?.trim());
  const primaryLabel = cms.t("productGate", "primaryLabel", "Log in to view details");
  const secondaryLabel = cms.t("productGate", "secondaryLabel", "Create a free account");
  const footnote = cms.t(
    "productGate",
    "footnote",
    "Free forever. No spam, no obligation to invest."
  );

  // Both auth pages read `next` and send the visitor straight back here.
  const next = `/products/${slug}`;
  const titleId = `pgate-title-${slug}`;

  return (
    <section className="pgate" aria-labelledby={titleId}>
      <div className="container">
        <div className="pgate-stage">
          <Teaser />

          <div className="pgate-card">
            <span className="pgate-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15.5" r="1.25" fill="currentColor" stroke="none" />
              </svg>
            </span>

            {eyebrow && <p className="pgate-eyebrow">{eyebrow}</p>}
            <h2 className="pgate-title" id={titleId}>
              {renderHeadline(headline, label)}
            </h2>
            {body && <p className="pgate-body">{body}</p>}

            {bullets.length > 0 && (
              <ul className="pgate-benefits">
                {bullets.map((b, i) => (
                  <li key={`${i}-${b.text}`}>
                    <span className="pgate-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.2 4.2L19 7" />
                      </svg>
                    </span>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="pgate-actions">
              <Link href={`/login?next=${next}`} className="btn btn-primary btn-lg pgate-btn">
                {primaryLabel}
              </Link>
              <Link href={`/signup?next=${next}`} className="btn btn-ghost btn-lg pgate-btn">
                {secondaryLabel}
              </Link>
            </div>

            {footnote && <p className="pgate-footnote">{footnote}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

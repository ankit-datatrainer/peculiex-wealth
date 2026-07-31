"use client";

/**
 * Client component for product detail pages.
 *
 * Consumes CMS content via `useContent("product-{slug}")` so the super admin
 * can edit every section of every product page through the Content Manager.
 * Falls back to the static `ProductContent` for SSR and for any field the
 * admin hasn't edited yet.
 */

import Link from "next/link";
import { PRODUCTS, type ProductContent } from "@/lib/productContent";
import { useContent, accent } from "@/lib/content";
import PageHero from "@/components/PageHero";
import PartnerLogos from "@/components/PartnerLogos";
import Factsheet from "@/components/Factsheet";
import FactsheetEmbed from "@/components/FactsheetEmbed";
import PremiumThemeSync from "@/components/PremiumThemeSync";
import { LAMF_RATE } from "@/lib/siteFacts";

/** Render *accented* text: `*words*` → <em>words</em>. */
function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <em key={i}>{part.em}</em>
    )
  );
}

type Props = {
  slug: string;
  product: ProductContent;
};

export default function ProductPageClient({ slug, product: p }: Props) {
  const cmsKey = `product-${slug}`;
  const cms = useContent(cmsKey);

  const isPremium = slug === "pms" || slug === "aif";

  /* ── Metrics: prefer CMS, fallback to static ── */
  const cmsMetrics = cms.list<{ value: string; label: string }>(
    "metrics",
    "items",
    []
  );
  const metrics =
    cmsMetrics.length > 0
      ? cmsMetrics
      : p.metrics;

  /* ── Highlights: prefer CMS, fallback to static ── */
  const highlightEyebrow = cms.t("highlights", "sectionEyebrow", "What you get");
  const highlightTitleRaw = cms.t(
    "highlights",
    "sectionTitle",
    `Everything that makes *${p.label}* simple.`
  );
  const cmsHighlights = cms.list<{ title: string; body: string }>(
    "highlights",
    "items",
    []
  );
  const highlights =
    cmsHighlights.length > 0
      ? cmsHighlights
      : p.highlights;

  /* ── Insurance image cards ── */
  const cmsInsuranceCards = cms.list<{ title: string; img: string }>(
    "highlights",
    "insuranceCards",
    []
  );
  const insuranceCards =
    cmsInsuranceCards.length > 0
      ? cmsInsuranceCards
      : slug === "insurance"
        ? [
            { title: "Health Care", img: "/health_care.png" },
            { title: "Life Care", img: "/life_care.png" },
            { title: "Motor Care", img: "/motor_care.png" },
            { title: "Home Care", img: "/home_care.png" },
            { title: "Business Insurance", img: "/business_insurance.png" },
          ]
        : [];

  /* ── How it works: prefer CMS, fallback to static ── */
  const howEyebrow = cms.t("howItWorks", "sectionEyebrow", "How it works");
  const howTitleRaw = cms.t(
    "howItWorks",
    "sectionTitle",
    "Four steps from *discovery to ownership.*"
  );
  const cmsSteps = cms.list<{ step: string; title: string; body: string }>(
    "howItWorks",
    "items",
    []
  );
  const howItWorks =
    cmsSteps.length > 0
      ? cmsSteps
      : p.howItWorks;

  /* ── Closing CTA ── */
  const closingText = cms.t("closing", "text", p.closing);
  const ctaLabel = cms.t("closing", "ctaLabel", p.cta?.label || "");
  const ctaHref = cms.t("closing", "ctaHref", p.cta?.href || "");

  /* ── Related products ── */
  const cmsRelated = cms.list<{ slug: string }>("related", "items", []);
  const relatedSlugs =
    cmsRelated.length > 0
      ? cmsRelated.map((r) => r.slug)
      : p.related || [];

  return (
    <div className={isPremium ? "premium-product-page" : ""}>
      {isPremium && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{localStorage.setItem('theme','dark');var e=document.documentElement;e.classList.add('dark');e.classList.remove('light');e.style.colorScheme='dark';}catch(_){}"
            }}
          />
          <PremiumThemeSync />
        </>
      )}

      <PageHero label={p.label} title={p.title} subtitle={p.subtitle} page={cmsKey} />

      {/* Metrics row */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="container">
          <div
            className="premium-metrics-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1px",
              background: "var(--color-divider)",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid var(--color-divider)"
            }}
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                className="premium-metric-card"
                style={{
                  background: "var(--color-surface-2)",
                  padding: "28px 24px",
                  textAlign: "center"
                }}
              >
                <div
                  className="premium-metric-value"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 500,
                    color: "var(--color-primary)"
                  }}
                >
                  {m.value}
                </div>
                <div
                  className="premium-metric-label"
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginTop: 4
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner logos */}
      <PartnerLogos productSlug={slug} />

      {/* Factsheet */}
      {slug !== "pms" && <Factsheet slug={slug} label={p.label} />}
      <FactsheetEmbed slug={slug} label={p.label} />

      {/* Highlights */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">{highlightEyebrow}</div>
            <h2 className="stitle">{renderAccented(highlightTitleRaw)}</h2>
          </div>
          {slug === "insurance" && insuranceCards.length > 0 ? (
            <div className="insurance-card-grid reveal-stagger">
              {insuranceCards.map((card, i) => (
                <article key={i} className="insurance-card reveal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.img} alt={card.title} className="insurance-card-img" />
                  <div className="insurance-card-footer">
                    <span>{card.title}</span>
                    <span>🍃</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px"
              }}
              className="reveal-stagger"
            >
              {highlights.map((h) => (
                <article
                  key={h.title}
                  className="why-card reveal"
                  data-tilt
                  style={{ minHeight: "auto" }}
                >
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">{howEyebrow}</div>
            <h2 className="stitle">{renderAccented(howTitleRaw)}</h2>
          </div>
          <ol
            className="steps"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
          >
            {howItWorks.map((s) => (
              <li className="reveal" key={s.step}>
                <span className="step-no">{s.step}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ padding: "0 0 140px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <h2
            className="premium-closing-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
              marginBottom: 16
            }}
          >
            {closingText}
          </h2>
          {ctaLabel && ctaHref && (
            <Link href={ctaHref} className="btn btn-primary btn-lg" data-magnetic>
              {ctaLabel}
            </Link>
          )}
        </div>
      </section>

      {/* LAMF cross-sell: appears only on mutual funds page */}
      {slug === "mutual-funds" && (
        <section style={{ padding: "0 0 110px" }}>
          <div className="container">
            <div className="lamf-band reveal">
              <div className="lamf-band-text">
                <div className="label">Loan Against Mutual Funds</div>
                <h3>Need liquidity? Don&apos;t sell, pledge.</h3>
                <p>
                  Pledge your mutual fund units and unlock an instant overdraft from minimum {LAMF_RATE}{" "}
                  while your investments stay invested. Interest only on what you use.
                </p>
              </div>
              <div className="lamf-band-cta">
                <Link href="/products/loan-against-mutual-funds" className="btn btn-primary" data-magnetic>
                  Explore LAMF →
                </Link>
                <Link href="/get-started" className="btn btn-ghost" data-magnetic>
                  Check my limit
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedSlugs.length > 0 && (
        <section style={{ padding: "0 0 120px", borderTop: "1px solid var(--color-divider)" }}>
          <div className="container" style={{ paddingTop: 60 }}>
            <div className="label" style={{ marginBottom: 16 }}>You might also like</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px"
              }}
            >
              {relatedSlugs.map((rs) => {
                const r = PRODUCTS[rs];
                if (!r) return null;
                return (
                  <Link
                    href={`/products/${r.slug}`}
                    key={r.slug}
                    className="premium-related-card"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-divider)",
                      borderRadius: 14,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6
                    }}
                  >
                    <strong className="premium-related-title" style={{ color: "var(--color-text)" }}>{r.label}</strong>
                    <span className="premium-related-desc" style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
                      {r.subtitle.split(".")[0]}.
                    </span>
                    <span className="premium-related-link" style={{ color: "var(--color-primary)", fontWeight: 600, marginTop: 6 }}>
                      Learn more →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

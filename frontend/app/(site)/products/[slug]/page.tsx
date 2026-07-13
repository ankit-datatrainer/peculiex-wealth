import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS } from "@/lib/productContent";
import PageHero from "@/components/PageHero";
import PartnerLogos from "@/components/PartnerLogos";
import Factsheet from "@/components/Factsheet";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export function generateMetadata({
  params
}: {
  params: { slug: string };
}): Metadata {
  const p = PRODUCTS[params.slug];
  if (!p) return { title: "Not found" };
  return {
    title: `${p.label} — Finvoq`,
    description: p.subtitle
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = PRODUCTS[params.slug];
  if (!p) notFound();
  
  const isPremium = p.slug === "pms" || p.slug === "aif";

  return (
    <div className={isPremium ? "premium-product-page" : ""}>
      <PageHero label={p.label} title={p.title} subtitle={p.subtitle} />


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
            {p.metrics.map((m) => (
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
      <PartnerLogos productSlug={p.slug} />

      {/* Factsheet / brochure PDF — dynamic (super-admin uploadable), with a
          static fallback at /public/factsheets/<slug>.pdf */}
      <Factsheet slug={p.slug} label={p.label} />

      {/* Highlights */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">What you get</div>
            <h2 className="stitle">
              Everything that makes <em>{p.label}</em> simple.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px"
            }}
          >
            {p.highlights.map((h) => (
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
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">How it works</div>
            <h2 className="stitle">
              Four steps from <em>discovery to ownership.</em>
            </h2>
          </div>
          <ol
            className="steps"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
          >
            {p.howItWorks.map((s) => (
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
            {p.closing}
          </h2>
          <Link href={p.cta.href} className="btn btn-primary btn-lg" data-magnetic>
            {p.cta.label}
          </Link>
        </div>
      </section>

      {/* LAMF cross-sell — appears on every product page except LAMF itself */}
      {p.slug !== "loan-against-mutual-funds" && (
        <section style={{ padding: "0 0 110px" }}>
          <div className="container">
            <div className="lamf-band reveal">
              <div className="lamf-band-text">
                <div className="label">Loan Against Mutual Funds</div>
                <h3>Need liquidity? Don’t sell — pledge.</h3>
                <p>
                  Pledge your mutual fund units and unlock an instant overdraft from ~9% p.a.
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
      {p.related && p.related.length > 0 && (
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
              {p.related.map((rs) => {
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

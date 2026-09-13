"use client";

import Link from "next/link";
import PageHero from "@/components/PageHero";
import { useContent, accent } from "@/lib/content";

function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? <span key={i}>{part}</span> : <em key={i}>{part.em}</em>
  );
}

const DEFAULT_FEATURES = [
  {
    title: "NRE / NRO / FCNR ready",
    body: "Invest from your NRE (repatriable) or NRO account, with FEMA-compliant execution and full documentation for repatriation."
  },
  {
    title: "Mutual funds & PMS for NRIs",
    body: "Access India-domiciled mutual funds, PMS and AIF strategies open to NRIs, with TDS handling and DTAA guidance built in."
  },
  {
    title: "Unlisted & pre-IPO access",
    body: "Curated unlisted opportunities with off-market transfer into your NRO demat, fully disclosed and compliant."
  },
  {
    title: "Gift City (IFSC) offshore route",
    body: "Invest in USD-denominated global funds through GIFT City: a familiar, IFSCA-regulated framework for NRIs."
  },
  {
    title: "Tax & DTAA support",
    body: "Capital-gains statements, TDS reconciliation, and Double Taxation Avoidance Agreement guidance for your country of residence."
  },
  {
    title: "Dedicated NRI desk",
    body: "A relationship manager who understands time zones, repatriation, and cross-border paperwork: reachable on WhatsApp, email or call."
  }
];

export default function NriCornerContent() {
  const cms = useContent("nri");

  const whatLabel = cms.t("whatYouGet", "label", "What you get");
  const whatTitle = cms.t("whatYouGet", "title", "A complete *NRI investing* desk.");
  const features = cms.list<{ title: string; body: string }>(
    "whatYouGet",
    "items",
    DEFAULT_FEATURES
  );

  const ctaTitle = cms.t(
    "cta",
    "title",
    "Distance shouldn’t cost you the India growth story."
  );
  const ctaSubtitle = cms.t(
    "cta",
    "subtitle",
    "Our NRI desk handles the paperwork, the compliance, and the tax. You just decide where to invest."
  );
  const primaryBtnText = cms.t("cta", "primaryBtnText", "Talk to the NRI desk →");
  const primaryBtnHref = cms.t("cta", "primaryBtnHref", "/get-started");
  const secondaryBtnText = cms.t("cta", "secondaryBtnText", "Explore Gift City");
  const secondaryBtnHref = cms.t("cta", "secondaryBtnHref", "/products/gift-city");

  return (
    <>
      <PageHero
        page="nri"
        label="For Non-Resident Indians"
        title={<>Invest in India, <em>from anywhere.</em></>}
        subtitle="Mutual funds, PMS, AIF, unlisted shares, bonds and Gift City offshore access, with repatriation-aware, FEMA-compliant routing for NRIs and OCIs."
      />

      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">{whatLabel}</div>
            <h2 className="stitle">{renderAccented(whatTitle)}</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px"
            }}
          >
            {features.map((f, i) => (
              <article key={f.title || i} className="why-card reveal" data-tilt style={{ minHeight: "auto" }}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 140px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 500,
              lineHeight: 1.3,
              marginBottom: 16
            }}
          >
            {ctaTitle}
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
            {ctaSubtitle}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={primaryBtnHref} className="btn btn-primary btn-lg" data-magnetic>
              {primaryBtnText}
            </Link>
            <Link href={secondaryBtnHref} className="btn btn-ghost btn-lg" data-magnetic>
              {secondaryBtnText}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

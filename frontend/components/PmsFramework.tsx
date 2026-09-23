"use client";

/**
 * PMS-only editorial block: "why PMS" benefits + equity taxation, followed by
 * the shortlisting-parameter explorer.
 *
 * Rendered immediately above the factsheet on /products/pms. Every string is
 * CMS-overridable through the `pmsBenefits` / `pmsShortlisting` sections of
 * the `product-pms` page (see backend/src/content/schema.js); the constants
 * below are the shipped defaults and the SSR source of truth.
 */

import { useEffect, useRef } from "react";
import { useContent, accent } from "@/lib/content";
import CountUp from "@/components/CountUp";
import ParameterExplorer from "@/components/ParameterExplorer";
import "./premium-block.css";
import "./pms-framework.css";

/* ── Shipped defaults ─────────────────────────────────────────────── */

const BENEFITS = [
  {
    title: "Professional Management",
    body: "A SEBI-registered portfolio manager runs the mandate full-time, with a dedicated research desk behind every position."
  },
  {
    title: "Diversification of risk",
    body: "Capital is spread across companies, sectors and market caps, so no single holding decides the outcome."
  },
  {
    title: "Transparency",
    body: "Securities sit in your own demat account. Every holding, trade and charge is visible to you, line by line."
  },
  {
    title: "Rebalancing",
    body: "Allocations are reviewed and reset as valuations, conviction and market cycles change."
  },
  {
    title: "Scope of higher risk adjusted return",
    body: "A focused, actively managed book is built for return per unit of risk, not return alone."
  }
];

const TAX_ROWS = [
  {
    tenure: "STCG",
    full: "Short-term capital gains",
    rate: "20%",
    suffix: "+ Cess + Surcharge"
  },
  {
    tenure: "LTCG",
    full: "Long-term capital gains",
    rate: "12.5%",
    suffix: "+ Cess + Surcharge"
  }
];

const PARAMETERS = [
  {
    name: "Calendar Year Performance",
    rationale:
      "We have considered the alpha of 3-year and 5-year average calendar year returns."
  },
  {
    name: "Rolling Returns",
    rationale:
      "We have considered the alpha of 3-year and 5-year average rolling returns."
  },
  {
    name: "Standard Deviation",
    rationale:
      "Standard Deviation is used to measure the volatility or risk associated with a portfolio. Lower standard deviation implies more stable returns, making it a useful parameter for shortlisting portfolios."
  },
  {
    name: "Sharpe Ratio",
    rationale:
      "We prefer funds with a higher Sharpe Ratio relative to their peers, as it reflects better risk-adjusted performance."
  },
  {
    name: "Beta",
    rationale:
      "We have given higher weightage to the funds having lower Beta. A beta of more than 1 indicates higher momentum than the benchmark, and a beta of less than 1 indicates less momentum."
  },
  {
    name: "Fund Level AUM",
    rationale: "It represents the overall market value that the fund holds."
  },
  {
    name: "Fund Manager",
    rationale:
      "We choose funds based on the pedigree and the fund manager's experience."
  },
  {
    name: "AMC",
    rationale:
      "We prefer AMC-backed or boutique PMS which have exceptionally good performance."
  }
];

const TAX_NOTE =
  "Indicative equity taxation. Cess and surcharge apply as per your income slab — please confirm the final position with your tax advisor.";

const PARAM_DESC =
  "Every strategy we put in front of a client clears the same eight-point screen. Select a parameter to see why it earns its place.";

/** Render *accented* text: `*words*` → <em>words</em>. */
function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? <span key={i}>{part}</span> : <em key={i}>{part.em}</em>
  );
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default function PmsFramework() {
  const cms = useContent("product-pms");
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* ── Benefits + taxation copy ── */
  const benefitsEyebrow = cms.t("pmsBenefits", "sectionEyebrow", "Why PMS");
  const benefitsTitle = cms.t(
    "pmsBenefits",
    "sectionTitle",
    "The case for a *managed portfolio.*"
  );
  const benefits = cms.list<{ title: string; body: string }>(
    "pmsBenefits",
    "items",
    BENEFITS
  );
  const taxTitle = cms.t("pmsBenefits", "taxTitle", "Taxation");
  const taxSubtitle = cms.t("pmsBenefits", "taxSubtitle", "Equity-oriented portfolios");
  const taxColTenure = cms.t("pmsBenefits", "taxColTenure", "Tenure");
  const taxColRate = cms.t("pmsBenefits", "taxColRate", "Equity taxation");
  const taxRows = cms.list<{
    tenure: string;
    full: string;
    rate: string;
    suffix: string;
  }>("pmsBenefits", "taxRows", TAX_ROWS);
  const taxNote = cms.t("pmsBenefits", "taxNote", TAX_NOTE);

  /* ── Shortlisting copy ── */
  const paramEyebrow = cms.t("pmsShortlisting", "sectionEyebrow", "Our diligence");
  const paramTitle = cms.t(
    "pmsShortlisting",
    "sectionTitle",
    "Shortlisting *parameters.*"
  );
  const paramDesc = cms.t("pmsShortlisting", "sectionDesc", PARAM_DESC);
  const params = cms.list<{ name: string; rationale: string }>(
    "pmsShortlisting",
    "items",
    PARAMETERS
  );

  /* Scroll-reveal: reuse the site-wide observer GlobalUX exposes, and fall
     back to a local one if this component ever mounts before it (or on a
     route where GlobalUX isn't present). */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    const shared = (window as unknown as { __finvoqReveal?: IntersectionObserver })
      .__finvoqReveal;
    if (shared) {
      nodes.forEach((n) => shared.observe(n));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="fvblk" ref={rootRef}>
      {/* ── Benefits + taxation ─────────────────────────────────────── */}
      {benefits.length > 0 && (
        <section className="fvblk-sec pmsb-sec">
          <span className="fvblk-glow-wrap" aria-hidden="true">
            <span className="fvblk-glow fvblk-glow-a" />
          </span>
          <div className="container">
            <div className="sec-head reveal">
              <div className="label">{benefitsEyebrow}</div>
              <h2 className="stitle">{renderAccented(benefitsTitle)}</h2>
            </div>

            <div className="pmsb-grid">
              <ul className="pmsb-list reveal-stagger">
                {benefits.map((b, i) => (
                  <li className="pmsb-item reveal" key={b.title}>
                    <span className="pmsb-rail" aria-hidden="true" />
                    <span className="pmsb-num" aria-hidden="true">
                      {pad(i)}
                    </span>
                    <div className="pmsb-copy">
                      <h3>{b.title}</h3>
                      {b.body && <p>{b.body}</p>}
                    </div>
                    <span className="pmsb-shine" aria-hidden="true" />
                  </li>
                ))}
              </ul>

              {taxRows.length > 0 && (
                <aside className="pmsb-tax reveal rv-zoom">
                  <div className="pmsb-tax-head">
                    <span className="pmsb-tax-sheen" aria-hidden="true" />
                    <span className="pmsb-tax-mark" aria-hidden="true">
                      %
                    </span>
                    <div>
                      <h3>{taxTitle}</h3>
                      <p>{taxSubtitle}</p>
                    </div>
                  </div>

                  <div className="pmsb-tax-table" role="table" aria-label={taxTitle}>
                    <div className="pmsb-tax-row pmsb-tax-thead" role="row">
                      <span role="columnheader">{taxColTenure}</span>
                      <span role="columnheader">{taxColRate}</span>
                    </div>
                    {taxRows.map((r) => (
                      <div className="pmsb-tax-row" role="row" key={r.tenure}>
                        <span role="cell">
                          <strong>{r.tenure}</strong>
                          {r.full && <em>{r.full}</em>}
                        </span>
                        <span role="cell">
                          <b className="pmsb-tax-rate">
                            <CountUp value={r.rate} duration={1300} />
                          </b>
                          {r.suffix && <em>{r.suffix}</em>}
                        </span>
                      </div>
                    ))}
                  </div>

                  {taxNote && <p className="pmsb-tax-note">{taxNote}</p>}
                </aside>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Shortlisting parameters ─────────────────────────────────── */}
      {params.length > 0 && (
        <section className="fvblk-sec">
          <span className="fvblk-glow-wrap" aria-hidden="true">
            <span className="fvblk-glow fvblk-glow-b" />
          </span>
          <div className="container">
            <div className="sec-head reveal">
              <div className="label">{paramEyebrow}</div>
              <h2 className="stitle">{renderAccented(paramTitle)}</h2>
              {paramDesc && <p className="sdesc">{paramDesc}</p>}
            </div>
            <ParameterExplorer
              items={params}
              label="PMS shortlisting parameters"
              idPrefix="pms-shortlist"
              kicker="Parameter"
            />
          </div>
        </section>
      )}
    </div>
  );
}

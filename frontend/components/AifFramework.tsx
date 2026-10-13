"use client";

/**
 * AIF explorer for /products/aif, rendered directly above the factsheet.
 *
 * The page's source material is a deck: two parallel decks, really, one for
 * equity AIFs and one for debt. Rather than transcribe two long tables, this
 * presents the structure as a flow — AIF at the root, equity and debt as
 * branches, the strategies under whichever branch is open — and everything
 * below the branch selector swaps in place.
 *
 * Every string is CMS-overridable through the `aifIntro`, `aifEquity` and
 * `aifDebt` sections of the `product-aif` page (backend/src/content/schema.js);
 * lib/aifContent.ts holds the shipped defaults and is the fallback.
 */

import { useEffect, useRef, useState } from "react";
import {
  AIF_DEBT,
  AIF_EQUITY,
  AIF_INTRO,
  type AifBranch,
  type AifFund
} from "@/lib/aifContent";
import { accent, useContent, type Reader } from "@/lib/content";
import ParameterExplorer from "@/components/ParameterExplorer";
import "./premium-block.css";
import "./aif-framework.css";

const pad = (n: number) => String(n).padStart(2, "0");

/* ── CMS ─────────────────────────────────────────────────────────────── */

/** Shared labels from the `aifIntro` section, with the shipped defaults. */
function aifLabels(cms: Reader) {
  const t = (field: string, fallback: string) => cms.t("aifIntro", field, fallback);
  return {
    eyebrow: t("eyebrow", "How AIFs are structured"),
    title: t("title", "Two routes into *private markets.*"),
    intro: t("intro", AIF_INTRO),
    rootMark: t("rootMark", "AIF"),
    rootTitle: t("rootTitle", "Alternative Investment Funds"),
    rootSubtitle: t("rootSubtitle", "SEBI-regulated, privately pooled, ₹1 Cr minimum"),
    strategies: t("strategiesSuffix", "strategies"),
    viewing: t("viewingLabel", "Viewing"),
    explore: t("exploreLabel", "Explore"),
    categoriesTitle: t("categoriesTitle", "Categories of an AIF"),
    shortlistTitle: t("shortlistTitle", "Shortlisting parameters"),
    shortlistKicker: t("shortlistKicker", "Parameter"),
    shortlistNext: t("shortlistNext", "Next"),
    taxTenure: t("taxTenureHeader", "Tenure"),
    tenureChip: t("tenureChip", "Tenure"),
    exitLoadChip: t("exitLoadChip", "Exit load")
  };
}

type AifLabels = ReturnType<typeof aifLabels>;

type TitleBodyRow = { title: string; body: string };
type FundRow = { name: string; description: string; tenure: string; exitLoad: string };

/**
 * Rebuild one branch from its CMS section. Lists are flat rows in the CMS, so
 * the nested shapes (taxation cells, the ring) are reassembled here; the
 * compiled branch supplies every fallback.
 */
function branchFromCms(cms: Reader, section: string, fb: AifBranch): AifBranch {
  const t = (field: string, fallback: string) => cms.t(section, field, fallback);
  const titleBody = (field: string, rows: { title: string; body?: string }[]) =>
    cms.list<TitleBodyRow>(
      section,
      field,
      rows.map((r) => ({ title: r.title, body: r.body || "" }))
    );

  const branch: AifBranch = {
    key: fb.key,
    label: t("label", fb.label),
    tagline: t("tagline", fb.tagline),
    title: t("title", fb.title),
    lead: t("lead", fb.lead),
    benefitsTitle: t("benefitsTitle", fb.benefitsTitle),
    benefits: titleBody("benefits", fb.benefits),
    featuresTitle: t("featuresTitle", fb.featuresTitle),
    features: titleBody("features", fb.features),
    parameters: cms.list(section, "parameters", fb.parameters),
    fundsTitle: t("fundsTitle", fb.fundsTitle),
    funds: cms.list<FundRow>(
      section,
      "funds",
      fb.funds.map((f) => ({ ...f, exitLoad: f.exitLoad || "" }))
    )
  };

  if (fb.categories) {
    const cats = cms.list(section, "categories", fb.categories);
    if (cats.length) branch.categories = cats;
  }

  if (fb.taxation) {
    const tx = fb.taxation;
    const rows = cms.list(
      section,
      "taxRows",
      tx.rows.map((r) => ({
        tenure: r.tenure,
        full: r.full,
        cell1: r.cells[0] || "",
        cell2: r.cells[1] || ""
      }))
    );
    if (rows.length) {
      branch.taxation = {
        title: t("taxTitle", tx.title),
        columns: [t("taxCol1", tx.columns[0] || ""), t("taxCol2", tx.columns[1] || "")],
        rows: rows.map((r) => ({
          tenure: r.tenure,
          full: r.full,
          cells: [r.cell1, r.cell2]
        })),
        note: t("taxNote", tx.note)
      };
    }
  }

  if (fb.ring) {
    const items = cms
      .list(section, "ringItems", fb.ring.items.map((text) => ({ text })))
      .map((r) => r.text)
      .filter(Boolean);
    if (items.length) branch.ring = { hub: t("ringHub", fb.ring.hub), items };
  }

  return branch;
}

/** Render *accented* text: `*words*` → <em>words</em>. */
function renderAccented(text: string) {
  return accent(text)
    .filter((part) => part !== "")
    .map((part, i) =>
      typeof part === "string" ? <span key={i}>{part}</span> : <em key={i}>{part.em}</em>
    );
}

/* ── Strategy accordion ──────────────────────────────────────────────── */

function FundList({
  funds,
  branchKey,
  labels
}: {
  funds: AifFund[];
  branchKey: string;
  labels: AifLabels;
}) {
  const [open, setOpen] = useState(0);

  // Reset to the first strategy when the branch changes under us.
  useEffect(() => setOpen(0), [branchKey]);

  return (
    <div className="aifx-funds reveal-stagger">
      {funds.map((f, i) => {
        const isOpen = i === open;
        const base = `aifx-fund-${branchKey}-${i}`;
        return (
          /* The open state rides on a data attribute, not a class. `.visible`
             is put on `.reveal` nodes by GlobalUX's observer, outside React —
             so a className that changes between renders makes React rewrite
             the whole class attribute and wipe it, and the observer has
             already unobserved the node. Keep className static on anything
             carrying `.reveal`. */
          <article className="aifx-fund reveal" data-open={isOpen || undefined} key={`${i}-${f.name}`}>
            <h4 className="aifx-fund-h">
              <button
                type="button"
                id={`${base}-btn`}
                className="aifx-fund-head"
                aria-expanded={isOpen}
                aria-controls={`${base}-panel`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="aifx-fund-no" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="aifx-fund-name">{f.name}</span>
                <span className="aifx-fund-meta">
                  <span className="aifx-chip">
                    <em>{labels.tenureChip}</em>
                    {f.tenure}
                  </span>
                  {f.exitLoad && (
                    <span className="aifx-chip aifx-chip-exit">
                      <em>{labels.exitLoadChip}</em>
                      {f.exitLoad}
                    </span>
                  )}
                </span>
                <span className="aifx-fund-caret" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </h4>
            {/* Kept mounted so the 0fr → 1fr height animation has something
                to interpolate; the body's `visibility` takes the collapsed
                copy out of the a11y tree and the tab order. */}
            <div
              className="aifx-fund-wrap"
              id={`${base}-panel`}
              role="region"
              aria-labelledby={`${base}-btn`}
            >
              <div className="aifx-fund-body">
                <p>{f.description}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ── Branch detail ───────────────────────────────────────────────────── */

function BranchDetail({ b, labels }: { b: AifBranch; labels: AifLabels }) {
  return (
    <div className="aifx-detail" key={b.key}>
      {b.lead && <p className="aifx-lead">{b.lead}</p>}

      {/* Benefits + key features, side by side */}
      <div className="aifx-two">
        <div className="aifx-panel">
          <div className="fvblk-subhead">
            <h3>{b.benefitsTitle}</h3>
            <i aria-hidden="true" />
          </div>
          <ul className="aifx-ticks">
            {b.benefits.map((x, i) => (
              <li key={`${i}-${x.title}`}>
                <span className="aifx-tick" aria-hidden="true" />
                <span>
                  <strong>{x.title}</strong>
                  {x.body && <em>{x.body}</em>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="aifx-panel">
          <div className="fvblk-subhead">
            <h3>{b.featuresTitle}</h3>
            <i aria-hidden="true" />
          </div>
          <ul className="aifx-ticks">
            {b.features.map((x, i) => (
              <li key={`${i}-${x.title}`}>
                <span className="aifx-tick" aria-hidden="true" />
                <span>
                  <strong>{x.title}</strong>
                  {x.body && <em>{x.body}</em>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Equity: the three SEBI categories */}
      {b.categories && (
        <div className="aifx-block">
          <div className="fvblk-subhead">
            <h3>{labels.categoriesTitle}</h3>
            <i aria-hidden="true" />
          </div>
          <div className="aifx-cats reveal-stagger">
            {b.categories.map((c, i) => (
              <article className="aifx-cat reveal" key={`${i}-${c.name}`}>
                <span className="aifx-cat-roman" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h4>{c.name}</h4>
                <p>{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Debt: the feature ring */}
      {b.ring && (
        <div className="aifx-block">
          <div className="aifx-ring">
            <div className="aifx-ring-hub">
              <span aria-hidden="true">✦</span>
              <strong>{b.ring.hub}</strong>
            </div>
            <ul className="aifx-ring-list reveal-stagger">
              {b.ring.items.map((t, i) => (
                <li
                  className="aifx-ring-item reveal"
                  key={`${i}-${t}`}
                  style={{ ["--i" as string]: i }}
                >
                  <span className="aifx-ring-dot" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Equity: the taxation matrix */}
      {b.taxation && (
        <div className="aifx-block">
          <div className="fvblk-subhead">
            <h3>{b.taxation.title}</h3>
            <i aria-hidden="true" />
          </div>
          <div className="aifx-tax" role="table" aria-label={b.taxation.title}>
            <div className="aifx-tax-row aifx-tax-head" role="row">
              <span role="columnheader">{labels.taxTenure}</span>
              {b.taxation.columns.map((c, i) => (
                <span role="columnheader" key={i}>
                  {c}
                </span>
              ))}
            </div>
            {b.taxation.rows.map((r, ri) => (
              <div className="aifx-tax-row" role="row" key={`${ri}-${r.tenure}`}>
                <span className="aifx-tax-tenure" role="rowheader">
                  <strong>{r.tenure}</strong>
                  <em>{r.full}</em>
                </span>
                {r.cells.map((cell, ci) => (
                  <span className="aifx-tax-cell" role="cell" key={ci}>
                    <em className="aifx-tax-colname">{b.taxation!.columns[ci]}</em>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
          {b.taxation.note && <p className="aifx-tax-note">{b.taxation.note}</p>}
        </div>
      )}

      {/* Shortlisting */}
      <div className="aifx-block">
        <div className="fvblk-subhead">
          <h3>{labels.shortlistTitle}</h3>
          <i aria-hidden="true" />
        </div>
        <ParameterExplorer
          items={b.parameters}
          label={`${b.label} shortlisting parameters`}
          idPrefix={`aif-${b.key}-shortlist`}
          kicker={labels.shortlistKicker}
          nextLabel={labels.shortlistNext}
        />
      </div>

      {/* The strategies themselves */}
      <div className="aifx-block">
        <div className="fvblk-subhead">
          <h3>{b.fundsTitle}</h3>
          <i aria-hidden="true" />
          <span className="aifx-count">
            {pad(b.funds.length)} {labels.strategies}
          </span>
        </div>
        <FundList funds={b.funds} branchKey={b.key} labels={labels} />
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export default function AifFramework() {
  const cms = useContent("product-aif");
  const labels = aifLabels(cms);
  const branches = [
    branchFromCms(cms, "aifEquity", AIF_EQUITY),
    branchFromCms(cms, "aifDebt", AIF_DEBT)
  ];
  const [branchKey, setBranchKey] = useState<AifBranch["key"]>("equity");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const branch = branches.find((b) => b.key === branchKey) || branches[0];

  /* Scroll-reveal. Reuses the site-wide observer GlobalUX exposes and falls
     back to a local one; re-runs on every branch switch because the detail
     column is a fresh subtree that the original scan never saw. */
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
  }, [branchKey]);

  return (
    <div className="fvblk aifx" ref={rootRef}>
      {/* ── The flow: AIF → equity / debt ──────────────────────────── */}
      <section className="fvblk-sec aifx-flow-sec">
        <span className="fvblk-glow-wrap" aria-hidden="true">
          <span className="fvblk-glow fvblk-glow-a" />
        </span>
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">{labels.eyebrow}</div>
            <h2 className="stitle">{renderAccented(labels.title)}</h2>
            {labels.intro && <p className="sdesc">{labels.intro}</p>}
          </div>

          <div className="aifx-tree reveal">
            <div className="aifx-root">
              <span className="aifx-root-mark" aria-hidden="true">
                {labels.rootMark}
              </span>
              <div className="aifx-root-copy">
                <strong>{labels.rootTitle}</strong>
                <span>{labels.rootSubtitle}</span>
              </div>
            </div>

            <div className="aifx-fork" aria-hidden="true">
              <span className="aifx-fork-stem" />
              <span className="aifx-fork-bar" />
              <span className="aifx-fork-drop aifx-fork-drop-l" />
              <span className="aifx-fork-drop aifx-fork-drop-r" />
            </div>

            <div className="aifx-branches" role="tablist" aria-label="AIF type">
              {branches.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  role="tab"
                  id={`aifx-branch-${b.key}`}
                  aria-selected={b.key === branchKey}
                  aria-controls="aifx-branch-panel"
                  tabIndex={b.key === branchKey ? 0 : -1}
                  className={`aifx-branch${b.key === branchKey ? " is-active" : ""}`}
                  onClick={() => setBranchKey(b.key)}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                    e.preventDefault();
                    const other = branches.find((x) => x.key !== b.key);
                    if (other) {
                      setBranchKey(other.key);
                      document
                        .getElementById(`aifx-branch-${other.key}`)
                        ?.focus();
                    }
                  }}
                >
                  <span className="aifx-branch-sheen" aria-hidden="true" />
                  <span className="aifx-branch-top">
                    <span className="aifx-branch-label">{b.label}</span>
                    <span className="aifx-branch-n">
                      {pad(b.funds.length)} {labels.strategies}
                    </span>
                  </span>
                  <span className="aifx-branch-tag">{b.tagline}</span>
                  <span className="aifx-branch-go" aria-hidden="true">
                    {b.key === branchKey ? labels.viewing : labels.explore} →
                  </span>
                </button>
              ))}
            </div>

            <div className="aifx-stem-down" aria-hidden="true">
              <span
                className={`aifx-stem-line aifx-stem-${branchKey}`}
                data-branch={branchKey}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Branch detail ───────────────────────────────────────────── */}
      <section
        className="fvblk-sec aifx-detail-sec"
        role="tabpanel"
        id="aifx-branch-panel"
        aria-labelledby={`aifx-branch-${branchKey}`}
      >
        <span className="fvblk-glow-wrap" aria-hidden="true">
          <span className="fvblk-glow fvblk-glow-b" />
        </span>
        <div className="container">
          <div className="aifx-detail-head reveal">
            <span className="aifx-detail-kicker">{branch.label}</span>
            <h2 className="stitle">{branch.title}</h2>
          </div>
          <BranchDetail b={branch} labels={labels} />
        </div>
      </section>
    </div>
  );
}

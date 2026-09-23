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
 * Content lives in lib/aifContent.ts.
 */

import { useEffect, useRef, useState } from "react";
import {
  AIF_BRANCHES,
  AIF_INTRO,
  type AifBranch,
  type AifFund
} from "@/lib/aifContent";
import ParameterExplorer from "@/components/ParameterExplorer";
import "./premium-block.css";
import "./aif-framework.css";

const pad = (n: number) => String(n).padStart(2, "0");

/* ── Strategy accordion ──────────────────────────────────────────────── */

function FundList({ funds, branchKey }: { funds: AifFund[]; branchKey: string }) {
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
          <article className="aifx-fund reveal" data-open={isOpen || undefined} key={f.name}>
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
                    <em>Tenure</em>
                    {f.tenure}
                  </span>
                  {f.exitLoad && (
                    <span className="aifx-chip aifx-chip-exit">
                      <em>Exit load</em>
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

function BranchDetail({ b }: { b: AifBranch }) {
  return (
    <div className="aifx-detail" key={b.key}>
      <p className="aifx-lead">{b.lead}</p>

      {/* Benefits + key features, side by side */}
      <div className="aifx-two">
        <div className="aifx-panel">
          <div className="fvblk-subhead">
            <h3>{b.benefitsTitle}</h3>
            <i aria-hidden="true" />
          </div>
          <ul className="aifx-ticks">
            {b.benefits.map((x) => (
              <li key={x.title}>
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
            {b.features.map((x) => (
              <li key={x.title}>
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
            <h3>Categories of an AIF</h3>
            <i aria-hidden="true" />
          </div>
          <div className="aifx-cats reveal-stagger">
            {b.categories.map((c, i) => (
              <article className="aifx-cat reveal" key={c.name}>
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
                  key={t}
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
              <span role="columnheader">Tenure</span>
              {b.taxation.columns.map((c) => (
                <span role="columnheader" key={c}>
                  {c}
                </span>
              ))}
            </div>
            {b.taxation.rows.map((r) => (
              <div className="aifx-tax-row" role="row" key={r.tenure}>
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
          <p className="aifx-tax-note">{b.taxation.note}</p>
        </div>
      )}

      {/* Shortlisting */}
      <div className="aifx-block">
        <div className="fvblk-subhead">
          <h3>Shortlisting parameters</h3>
          <i aria-hidden="true" />
        </div>
        <ParameterExplorer
          items={b.parameters}
          label={`${b.label} shortlisting parameters`}
          idPrefix={`aif-${b.key}-shortlist`}
        />
      </div>

      {/* The strategies themselves */}
      <div className="aifx-block">
        <div className="fvblk-subhead">
          <h3>{b.fundsTitle}</h3>
          <i aria-hidden="true" />
          <span className="aifx-count">{pad(b.funds.length)} strategies</span>
        </div>
        <FundList funds={b.funds} branchKey={b.key} />
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export default function AifFramework() {
  const [branchKey, setBranchKey] = useState<AifBranch["key"]>("equity");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const branch = AIF_BRANCHES.find((b) => b.key === branchKey) || AIF_BRANCHES[0];

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
            <div className="label">How AIFs are structured</div>
            <h2 className="stitle">
              <span>Two routes into </span>
              <em>private markets.</em>
            </h2>
            <p className="sdesc">{AIF_INTRO}</p>
          </div>

          <div className="aifx-tree reveal">
            <div className="aifx-root">
              <span className="aifx-root-mark" aria-hidden="true">
                AIF
              </span>
              <div className="aifx-root-copy">
                <strong>Alternative Investment Funds</strong>
                <span>SEBI-regulated, privately pooled, ₹1 Cr minimum</span>
              </div>
            </div>

            <div className="aifx-fork" aria-hidden="true">
              <span className="aifx-fork-stem" />
              <span className="aifx-fork-bar" />
              <span className="aifx-fork-drop aifx-fork-drop-l" />
              <span className="aifx-fork-drop aifx-fork-drop-r" />
            </div>

            <div className="aifx-branches" role="tablist" aria-label="AIF type">
              {AIF_BRANCHES.map((b) => (
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
                    const other = AIF_BRANCHES.find((x) => x.key !== b.key);
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
                      {pad(b.funds.length)} strategies
                    </span>
                  </span>
                  <span className="aifx-branch-tag">{b.tagline}</span>
                  <span className="aifx-branch-go" aria-hidden="true">
                    {b.key === branchKey ? "Viewing" : "Explore"} →
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
          <BranchDetail b={branch} />
        </div>
      </section>
    </div>
  );
}

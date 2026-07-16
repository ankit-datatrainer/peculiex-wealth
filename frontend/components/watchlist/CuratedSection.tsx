"use client";

import type { Basket, Stock } from "./types";

export default function CuratedSection({
  baskets,
  stockMap,
  trackedSet,
  onImport
}: {
  baskets: Basket[];
  stockMap: Record<string, Stock>;
  trackedSet: Set<string>;
  onImport: (b: Basket) => void;
}) {
  return (
    <section className="cur-wrap">
      <div className="cur-head">
        <div className="label">Curated baskets</div>
        <h2>
          Or start with a <em>ready-made watchlist</em>
        </h2>
        <p className="sdesc">
          Hand-picked sets of stocks for common investing themes. Add an
          entire basket in a single tap.
        </p>
      </div>
      <div className="cur-grid">
        {baskets.map((b) => {
          const previews = b.symbols
            .map((sym) => stockMap[sym])
            .filter(Boolean) as Stock[];
          const allTracked = b.symbols.every((s) => trackedSet.has(s));
          const tagLabel = b.id === "bluechip" ? "BLUECHIPS" : b.id === "movers" ? "HIGH YIELD" : "STABLE YIELD";
          return (
            <article className="cur-card" key={b.id}>
              <div className="cur-card-header">
                <h3>{b.title}</h3>
                <span className={`cur-badge ${b.id}`}>{tagLabel}</span>
              </div>
              <p className="cur-desc">{b.blurb}</p>
              <div className="cur-syms">
                {(previews.length ? previews : []).slice(0, 5).map((s) => {
                  const up = s.chg >= 0;
                  return (
                    <div className="cur-row" key={s.sym}>
                      <strong>{s.sym}</strong>
                      <span className="cur-name">{s.name}</span>
                      <span className={up ? "cur-up" : "cur-dn"}>
                        {up ? "+" : "−"}
                        {Math.abs(s.chg).toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
                {previews.length === 0 &&
                  b.symbols.slice(0, 5).map((sym) => (
                    <div className="cur-row" key={sym}>
                      <strong>{sym}</strong>
                      <span className="cur-name">—</span>
                      <span style={{ color: "var(--color-text-muted, #333333)" }}>—</span>
                    </div>
                  ))}
              </div>
              <button
                type="button"
                className="cur-btn"
                onClick={() => onImport(b)}
                disabled={allTracked}
                data-magnetic
              >
                {allTracked ? "Already on your list" : "Add basket to watchlist"}
              </button>
            </article>
          );
        })}
      </div>
      <style jsx>{`
        .cur-wrap {
          margin-top: 3.5rem;
        }
        .cur-head {
          margin-bottom: 2rem;
        }
        .label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-primary, #0a7d64);
          font-family: var(--font-display, "Barlow", sans-serif);
          margin-bottom: 0.3rem;
        }
        .cur-head h2 {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          line-height: 1.1;
          color: var(--color-text, #1e1c18);
          margin: 0.3rem 0 0.5rem;
          font-weight: 500;
          letter-spacing: -0.018em;
        }
        .cur-head h2 em {
          color: var(--color-primary, #0a7d64);
          font-style: italic;
          background: linear-gradient(120deg, var(--color-primary, #0a7d64) 0%, #2ea2a8 45%, var(--color-primary, #0a7d64) 100%);
          background-size: 220% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: var(--color-primary, #0a7d64);
          animation: shineText 5s linear infinite;
        }
        @keyframes shineText { to { background-position: -220% center; } }
        .sdesc {
          font-size: 0.95rem;
          color: var(--color-text-muted, #6b6964);
          max-width: 580px;
          line-height: 1.5;
        }
        .cur-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .cur-card {
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-divider, rgba(26, 25, 23, 0.07));
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s, box-shadow 0.25s;
        }
        .cur-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary, rgba(10, 160, 128, 0.2));
          box-shadow: var(--shadow-lg);
        }
        .cur-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4rem;
          gap: 0.5rem;
        }
        .cur-card h3 {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: 1.2rem;
          color: var(--color-text, #1e1c18);
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .cur-badge {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          font-family: var(--font-display, "Barlow", sans-serif);
        }
        .cur-badge.bluechip {
          background: var(--color-primary-highlight, rgba(10, 160, 128, 0.08));
          color: var(--color-primary, #0a7d64);
        }
        .cur-badge.movers {
          background: var(--color-danger-bg, rgba(220, 38, 38, 0.08));
          color: var(--color-danger, #b91c1c);
        }
        .cur-badge.stable {
          background: rgba(234, 124, 28, 0.08);
          color: var(--color-orange, #b45309);
        }
        .cur-desc {
          font-size: 0.85rem;
          color: var(--color-text-muted, #6b6964);
          margin: 0 0 1.2rem;
          line-height: 1.4;
        }
        .cur-syms {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.4rem;
          flex: 1;
        }
        .cur-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.75rem;
          align-items: center;
          padding: 0.6rem 0.85rem;
          background: var(--color-surface, #fdfdfc);
          border: 1px solid var(--color-divider, rgba(26, 25, 23, 0.04));
          border-radius: 10px;
          font-size: 0.84rem;
          transition: all 0.2s;
        }
        .cur-row:hover {
          background: var(--color-surface-offset, rgba(10, 160, 128, 0.03));
          border-color: var(--color-border, rgba(10, 160, 128, 0.1));
        }
        .cur-row strong {
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--color-text, #1e1c18);
        }
        .cur-name {
          color: var(--color-text-muted, #6b6964);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cur-up {
          color: var(--color-success, #15803d);
          font-weight: 600;
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
        }
        .cur-dn {
          color: var(--color-danger, #b91c1c);
          font-weight: 600;
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
        }
        .cur-btn {
          width: 100%;
          border-radius: 12px;
          padding: 0.75rem 1.2rem;
          font-weight: 600;
          font-size: 0.85rem;
          font-family: var(--font-display, "Barlow", sans-serif);
          letter-spacing: 0.02em;
          border: 1px solid transparent;
          background: var(--color-primary, #0a7d64);
          color: var(--color-text-inverse, #ffffff);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cur-btn:hover:not(:disabled) {
          background: var(--color-primary-hover, #015257);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .cur-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .cur-btn:disabled {
          background: var(--color-surface, rgba(26, 25, 23, 0.05));
          border-color: var(--color-divider, rgba(26, 25, 23, 0.06));
          color: var(--color-text-faint, #9c9a94);
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}

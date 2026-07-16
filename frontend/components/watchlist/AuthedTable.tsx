"use client";

import { fmtINR2, sparkPath, getCompanyDomain } from "@/lib/util";
import { formatRelative, type SortKey } from "./types";
import { useRouter } from "next/navigation";

type Row = {
  item: { id: string; symbol: string; created_at: string; added_price: number | null };
  name: string;
  price: number | null;
  chg: number | null;
  vol: string;
  cap: string;
  sector: string | null;
  domain: string | null;
  brand: string | null;
  initial: string | null;
  iv: string | null;
  isUnlisted: boolean;
  addedDelta: number | null;
};

export default function AuthedTable({
  rows,
  busySym,
  onRemove,
  sort,
  setSort,
  sparks
}: {
  rows: Row[];
  sparks: Record<string, number[]>;
  busySym: string | null;
  onRemove: (sym: string) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
}) {
  const router = useRouter();

  const headerSort = (key: SortKey) => {
    setSort(key);
  };

  return (
    <div className="t-wrap" role="region" aria-label="Watchlist list">
      {/* Desktop Header */}
      <div className="t-header desktop-only">
        <div className="t-cell t-col-hash">#</div>
        <div
          className="t-cell t-col-asset t-sortable"
          onClick={() => headerSort("alpha")}
        >
          Asset {sort === "alpha" && <Caret />}
        </div>
        <div className="t-cell t-col-num">Price</div>
        <div
          className="t-cell t-col-num t-sortable"
          onClick={() => headerSort(sort === "topGain" ? "topLoss" : "topGain")}
        >
          Change{" "}
          {(sort === "topGain" || sort === "topLoss") && (
            <Caret down={sort === "topGain"} />
          )}
        </div>
        <div className="t-cell t-col-num">Market Cap</div>
        <div className="t-cell t-col-num">Volume</div>
        <div className="t-cell t-col-chart">Last 24h</div>
        <div className="t-cell t-col-actions"></div>
      </div>

      <div className="t-body">
        {rows.map((w, index) => {
          const up = (w.chg ?? 0) >= 0;
          const optimistic = w.item.id.startsWith("tmp-");
          const vals = sparks[w.item.symbol] || [];

          return (
            <div
              key={w.item.id}
              className={`t-row ${optimistic ? "is-optim" : ""}`}
              onClick={() => router.push(`/markets/${w.item.symbol}`)}
            >
              {/* Desktop specific cells */}
              <div className="t-cell t-col-hash desktop-only">{index + 1}</div>

              {/* Asset Info (Mobile Top Left, Desktop Col 2) */}
              <div className="t-cell t-col-asset">
                <div className="t-asset-info">

                  <div className="t-asset-text">
                    <div className="t-asset-name">
                      {w.isUnlisted ? w.name || "Unlisted" : w.item.symbol}
                    </div>
                    <div className="t-asset-sub">
                      {w.isUnlisted ? w.sector || "Private Market" : w.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Vol (Mobile Center, Desktop split cols) */}
              <div className="t-cell t-col-num t-price-block">
                <div className="t-price-val">
                  {w.price != null ? `${fmtINR2(w.price)}` : "—"}
                </div>
                {/* Vol only shown here on mobile */}
                <div className="t-vol-sub mobile-only">
                  Vol: {w.vol}
                </div>
              </div>

              {/* Change (Mobile Right, Desktop Col 4) */}
              <div className="t-cell t-col-num t-chg-block">
                <div className={`t-chg-abs ${up ? "up" : "dn"}`}>
                  {w.chg != null ? `${up ? "+" : "−"}${Math.abs(w.chg * (w.price ? w.price / 100 : 0)).toFixed(2)}` : "—"}
                </div>
                <div className={`t-chg-pct ${up ? "up" : "dn"}`}>
                  {w.chg != null ? `${up ? "+" : "−"}${Math.abs(w.chg).toFixed(2)}%` : w.iv || "—"}
                </div>
              </div>

              {/* Desktop only columns */}
              <div className="t-cell t-col-num desktop-only t-muted">{w.cap}</div>
              <div className="t-cell t-col-num desktop-only t-muted">{w.vol}</div>
              
              {/* Sparkline chart */}
              <div className="t-cell t-col-chart desktop-only">
                {!w.isUnlisted && vals.length > 0 ? (
                  <svg className="t-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path
                      d={sparkPath(vals, 100, 30)}
                      fill="none"
                      stroke={up ? "var(--color-primary, #0a7d64)" : "var(--color-danger, #dc2626)"}
                      strokeWidth="1.8"
                    />
                  </svg>
                ) : (
                  <span className="t-muted">—</span>
                )}
              </div>

              {/* Actions */}
              <div className="t-cell t-col-actions">
                <button
                  type="button"
                  className="t-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(w.item.symbol);
                  }}
                  disabled={busySym === w.item.symbol || optimistic}
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .t-wrap {
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-divider, rgba(26, 25, 23, 0.1));
          border-radius: 12px;
          overflow: hidden;
          margin-top: 1rem;
          width: 100%;
          color: var(--color-text, #1e1c18);
          font-family: var(--font-body, inherit);
        }

        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        .t-header {
          display: flex;
          align-items: center;
          padding: 0.4rem 1rem;
          border-bottom: 1px solid var(--color-divider, rgba(26, 25, 23, 0.08));
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted, #6b6964);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .t-row {
          display: flex;
          align-items: center;
          padding: 0.4rem 1rem;
          border-bottom: 1px solid var(--color-divider, rgba(26, 25, 23, 0.06));
          transition: background 0.2s;
          cursor: pointer;
        }
        .t-row:hover {
          background: var(--color-surface-offset, #fdfdfc);
        }
        .t-row:last-child {
          border-bottom: none;
        }
        .t-row.is-optim {
          opacity: 0.6;
        }

        .t-cell {
          display: flex;
          align-items: center;
        }

        .t-col-hash { width: 40px; color: var(--color-text-muted, #6b6964); font-variant-numeric: tabular-nums; }
        .t-col-asset { flex: 2; min-width: 150px; }
        .t-col-num { flex: 1; justify-content: flex-end; text-align: right; font-variant-numeric: tabular-nums; }
        .t-col-chart { flex: 1; justify-content: center; }
        .t-col-actions { width: 40px; justify-content: flex-end; }

        /* Asset column */
        .t-asset-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .t-logo-wrap {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-surface-2, #fff);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .t-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 4px;
        }
        .t-logo-fallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .t-asset-text {
          display: flex;
          flex-direction: column;
        }
        .t-asset-name {
          font-family: var(--font-display, inherit);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-text, #1e1c18);
        }
        .t-asset-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b6964);
          margin-top: 2px;
        }

        /* Number blocks */
        .t-price-block, .t-chg-block {
          display: flex;
          flex-direction: column;
        }
        .t-price-val {
          font-family: var(--font-display, inherit);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-text, #1e1c18);
        }
        .t-chg-abs {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .t-chg-pct {
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 2px;
        }
        .t-vol-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b6964);
          margin-top: 2px;
        }
        
        .up { color: var(--color-success, #0a7d64); }
        .dn { color: var(--color-danger, #dc2626); }
        .t-muted { color: var(--color-text-muted, #6b6964); }

        .t-spark {
          width: 70px;
          height: 24px;
        }

        .t-remove {
          background: transparent;
          border: none;
          color: var(--color-text-faint, #555);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .t-remove:hover {
          color: var(--color-text, #1e1c18);
        }

        .t-sortable { cursor: pointer; user-select: none; }
        .t-sortable:hover { color: var(--color-text, #1e1c18); }

        /* MOBILE LAYOUT matching Moneycontrol */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block; }
          
          .t-row {
            padding: 0.35rem 0.6rem;
            position: relative;
          }
          
          .t-col-asset { flex: 1.5; }
          .t-col-num { flex: 1; }
          
          .t-asset-text {
            /* Add left margin if logo was here, but logo is hidden */
          }
          .t-asset-name {
            font-size: 0.95rem;
          }
          
          .t-price-block {
            align-items: flex-end;
          }
          .t-price-val {
            font-size: 0.95rem;
          }
          
          .t-chg-block {
            align-items: flex-end;
          }
          .t-chg-abs {
            font-size: 0.9rem;
          }
          
          .t-col-actions {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Caret({ down }: { down?: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "middle", marginLeft: 4, transform: down ? "rotate(180deg)" : "none" }}>
      <path d="M12 8l6 8H6z" />
    </svg>
  );
}

const PALETTE = ["#0a7d64", "#0ea5e9", "#3b82f6", "#5b21b6", "#a3262d", "#b45309", "#15803d", "#0f766e", "#7c3aed"];
function pickColor(sym: string) {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

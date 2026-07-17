"use client";

import { fmtINR2 } from "@/lib/util";
import { cleanSymbol, exchangeOf } from "./types";
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

export default function AuthedCards({
  rows,
  busySym,
  onRemove
}: {
  rows: Row[];
  sparks?: Record<string, number[]>; // Kept for compatibility
  busySym: string | null;
  onRemove: (sym: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="cards-grid">
      {rows.map((w) => {
        const up = (w.chg ?? 0) >= 0;
        const optimistic = w.item.id.startsWith("tmp-");
        return (
          <article
            className={`c-card ${w.isUnlisted ? "is-unlisted" : ""} ${optimistic ? "is-optim" : ""}`}
            key={w.item.id}
            onClick={() => router.push(`/markets/${w.item.symbol}`)}
          >
            <div className="c-sym">
              {w.isUnlisted ? w.name || "Unlisted" : cleanSymbol(w.item.symbol)}
              {!w.isUnlisted && (
                <span className="c-exch">{exchangeOf(w.item.symbol)}</span>
              )}
            </div>
            <div className="c-price">
              {w.price != null ? `${fmtINR2(w.price)}` : "—"}
            </div>
            {w.chg != null ? (
              <div className={`c-chg ${up ? "up" : "dn"}`}>
                {up ? "+" : ""}— ({up ? "+" : "−"}{Math.abs(w.chg).toFixed(2)}%)
              </div>
            ) : w.isUnlisted ? (
              <div className="c-chg unl-iv">IV {w.iv ?? "—"}</div>
            ) : (
              <div className="c-chg">—</div>
            )}

            <button
              type="button"
              className="c-remove"
              aria-label={`Remove ${w.item.symbol}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(w.item.symbol);
              }}
              disabled={busySym === w.item.symbol || optimistic}
              title="Remove"
            >
              ×
            </button>
          </article>
        );
      })}

      <style jsx>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .c-card {
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-divider, rgba(26, 25, 23, 0.1));
          border-radius: 8px;
          padding: 0.6rem 0.4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          cursor: pointer;
          transition: all 0.2s var(--ease);
          color: var(--color-text, #1e1c18);
          min-height: 70px;
        }
        
        .c-card.card-up {
          /* subtle top highlight instead of heavy left border */
          box-shadow: inset 0 2px 0 0 rgba(10, 160, 128, 0.2);
        }
        .c-card.card-dn {
          box-shadow: inset 0 2px 0 0 rgba(220, 38, 38, 0.2);
        }
        
        .c-card:hover {
          background: var(--color-surface-offset, #fdfdfc);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
          border-color: var(--color-border, rgba(26, 25, 23, 0.15));
        }

        .c-exch {
          display: inline-block;
          margin-left: 6px;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          vertical-align: middle;
          background: var(--color-primary-highlight);
          color: var(--color-primary-ink);
        }
        .c-sym {
          font-family: var(--font-display, inherit);
          font-weight: 600;
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b6964);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .c-price {
          font-family: var(--font-display, inherit);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--color-text, #1e1c18);
          font-variant-numeric: tabular-nums;
          margin-bottom: 0.1rem;
        }

        .c-chg {
          font-size: 0.7rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        .c-chg.up {
          color: var(--color-success, #13735d);
        }
        .c-chg.dn {
          color: var(--color-danger, #dc2626);
        }

        .c-remove {
          position: absolute;
          right: 4px;
          top: 4px;
          background: transparent;
          border: none;
          color: #aaa;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .c-card:hover .c-remove {
          color: #888;
        }
        .c-remove:hover {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.1);
        }

        @media (min-width: 640px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1rem;
          }
          .c-card {
            padding: 1.2rem 0.8rem;
            min-height: 110px;
            border-radius: 12px;
          }
          .c-sym { font-size: 0.85rem; margin-bottom: 0.6rem; }
          .c-price { font-size: 1.25rem; margin-bottom: 0.4rem; }
          .c-chg { font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}

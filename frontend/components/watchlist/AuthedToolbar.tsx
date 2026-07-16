"use client";

import { fmtINR2 } from "@/lib/util";
import type { Filter, SortKey, Stock, Unl, ViewMode } from "./types";

type Suggestion =
  | { kind: "listed"; data: Stock }
  | { kind: "unlisted"; data: Unl; symbol: string };

export default function AuthedToolbar({
  query,
  setQuery,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  searching,
  addListed,
  addUnlisted,
  busySym,
  filter,
  setFilter,
  sort,
  setSort,
  view,
  setView,
  hasItems
}: {
  query: string;
  setQuery: (s: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (b: boolean) => void;
  suggestions: Suggestion[];
  searching?: boolean;
  addListed: (s: Stock) => void;
  addUnlisted: (u: Unl, sym: string) => void;
  busySym: string | null;
  filter: Filter;
  setFilter: (f: Filter) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  hasItems: boolean;
}) {
  return (
    <div className="tb-wrap reveal visible">
      {/* Search row */}
      <div className="tb-search-wrap">
        <svg
          className="tb-search-ic"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          className="tb-search"
          placeholder="Search by project, symbol or token..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          aria-label="Search and add a stock"
        />
        {query && (
          <button
            type="button"
            className="tb-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setShowSuggestions(false);
            }}
          >
            ×
          </button>
        )}

        {showSuggestions && query.trim() && (
          <div className="tb-suggest" role="listbox">
            {suggestions.length === 0 ? (
              <div className="tb-suggest-empty">
                {searching ? "Searching all listed shares…" : "No matches found."}
              </div>
            ) : (
              suggestions.map((s) => {
                if (s.kind === "listed") {
                  const st = s.data;
                  const up = st.chg >= 0;
                  // A live-search hit carries no price yet (it fills in from
                  // the quotes poll after it's added); show its exchange
                  // instead of a fake ₹0.00.
                  const isLive = !st.price;
                  return (
                    <button
                      key={"l-" + st.sym}
                      type="button"
                      className="tb-suggest-row"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addListed(st)}
                      disabled={busySym === st.sym}
                    >
                      <div className="tb-suggest-left">
                        <span className="tb-suggest-sym">
                          {st.sym}
                          <span className="tb-tag listed">Listed</span>
                        </span>
                        <span className="tb-suggest-name">{st.name}</span>
                      </div>
                      <div className="tb-suggest-right">
                        {isLive ? (
                          <span className="tb-suggest-px">{st.cap || "NSE"}</span>
                        ) : (
                          <>
                            <span className="tb-suggest-px">₹{fmtINR2(st.price)}</span>
                            <span className={up ? "tb-up" : "tb-dn"}>
                              {up ? "+" : "−"}
                              {Math.abs(st.chg).toFixed(2)}%
                            </span>
                          </>
                        )}
                      </div>
                      <span className="tb-suggest-add">Add</span>
                    </button>
                  );
                }
                const u = s.data;
                return (
                  <button
                    key={"u-" + s.symbol}
                    type="button"
                    className="tb-suggest-row"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addUnlisted(u, s.symbol)}
                    disabled={busySym === s.symbol}
                  >
                    <div className="tb-suggest-left">
                      <span className="tb-suggest-sym">
                        {u.name}
                        <span className="tb-tag unlisted">Unlisted</span>
                      </span>
                      <span className="tb-suggest-name">{u.sector}</span>
                    </div>
                    <div className="tb-suggest-right">
                      <span className="tb-suggest-px">
                        ₹{u.price.toLocaleString("en-IN")}
                      </span>
                      <span className="tb-up">{u.iv}</span>
                    </div>
                    <span className="tb-suggest-add">Add</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Filters + sort + view */}
      {hasItems && (
        <div className="tb-actions">
          <div className="tb-filters" role="tablist" aria-label="Filter">
            {(
              [
                ["all", "Top"],
                ["gainers", "Gainers"],
                ["losers", "Decliners"],
                ["stable", "Stable"]
              ] as [Filter, string][]
            ).map(([f, l]) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`tb-chip${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {filter === f && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                    <path d="M12 2L2 22h20L12 2z" />
                  </svg>
                )}
                {l}
              </button>
            ))}
          </div>

          <div className="tb-right">
            <div className="tb-sort" aria-label="Filter/Sort Controls">
              <button className="tb-icon-btn" onClick={() => setSort(sort === "recent" ? "alpha" : "recent")} title="Toggle Sort">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                <span style={{ marginLeft: 6 }}>Sort</span>
              </button>
            </div>

            <div className="tb-view" role="group" aria-label="View">
              <button
                type="button"
                className={`tb-icon-btn tb-view-btn${view === "table" ? " active" : ""}`}
                onClick={() => setView("table")}
                aria-label="Table view"
                aria-pressed={view === "table"}
                title="Table view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                className={`tb-icon-btn tb-view-btn${view === "cards" ? " active" : ""}`}
                onClick={() => setView("cards")}
                aria-label="Cards view"
                aria-pressed={view === "cards"}
                title="Cards view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tb-wrap {
          position: relative;
          z-index: 20;
          background: transparent;
          padding: 1.5rem 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.2rem;
        }

        /* search */
        .tb-search-wrap {
          position: relative;
          width: 100%;
          max-width: 340px;
          order: 2;
        }
        
        .tb-search {
          width: 100%;
          height: 44px;
          padding: 0 2.5rem 0 2.5rem;
          border-radius: 22px;
          border: 1px solid var(--color-border, rgba(26, 25, 23, 0.15));
          background: var(--color-surface-2, #ffffff);
          font-size: 0.9rem;
          font-family: var(--font-body, inherit);
          color: var(--color-text, #1e1c18);
          transition: all 0.25s var(--ease);
          box-shadow: var(--shadow-sm);
        }
        .tb-search::placeholder {
          color: var(--color-text-faint, #a3a19a);
        }
        .tb-search:focus {
          outline: none;
          border-color: var(--color-primary, #01696f);
          box-shadow: 0 0 0 3px rgba(1, 105, 111, 0.1);
        }
        .tb-search-ic {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-faint, #a3a19a);
          pointer-events: none;
        }
        .tb-clear {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          width: 26px;
          height: 26px;
          border: 0;
          border-radius: 50%;
          background: var(--color-surface-offset, rgba(26, 25, 23, 0.05));
          color: var(--color-text-muted, #6b6964);
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        }
        .tb-clear:hover {
          background: var(--color-surface-offset, rgba(26, 25, 23, 0.1));
          color: var(--color-text, #1e1c18);
        }

        /* suggestions */
        .tb-suggest {
          position: absolute;
          inset: calc(100% + 8px) 0 auto 0;
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-divider, rgba(26, 25, 23, 0.1));
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          overflow: hidden;
          z-index: 30;
          max-height: 380px;
          overflow-y: auto;
        }
        .tb-suggest-empty {
          padding: 1.2rem;
          color: var(--color-text-muted, #6b6964);
          font-size: 0.9rem;
          text-align: center;
        }
        .tb-suggest-row {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--color-divider, rgba(26, 25, 23, 0.05));
          cursor: pointer;
          text-align: left;
          color: var(--color-text, #1e1c18);
          transition: background 0.2s var(--ease);
        }
        .tb-suggest-row:last-child {
          border-bottom: none;
        }
        .tb-suggest-row:hover {
          background: var(--color-surface-offset, #fdfdfc);
        }
        .tb-suggest-row:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .tb-suggest-left {
          display: flex;
          flex-direction: column;
        }
        .tb-suggest-sym {
          font-weight: 600;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tb-suggest-name {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b6964);
          margin-top: 2px;
        }
        .tb-suggest-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.85rem;
        }
        .tb-up { color: var(--color-success, #01696f); font-size: 0.75rem; font-weight: 500; }
        .tb-dn { color: var(--color-danger, #dc2626); font-size: 0.75rem; font-weight: 500; }
        
        .tb-suggest-add {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary, #01696f);
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          background: var(--color-primary-highlight, rgba(1, 105, 111, 0.1));
          transition: all 0.2s;
        }
        .tb-suggest-row:hover .tb-suggest-add {
          background: var(--color-primary, #01696f);
          color: #fff;
        }

        .tb-tag {
          font-size: 0.55rem;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .tb-tag.listed { background: rgba(56, 189, 248, 0.15); color: #0284c7; }
        .tb-tag.unlisted { background: rgba(251, 146, 60, 0.15); color: #c2410c; }

        /* actions row */
        .tb-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.2rem;
          order: 1;
          flex: 1;
        }
        .tb-filters {
          display: flex;
          gap: 0.25rem;
          background: var(--color-surface-offset, #fdfdfc);
          padding: 0.3rem;
          border-radius: 10px;
          border: 1px solid var(--color-divider, rgba(26, 25, 23, 0.1));
        }
        .tb-chip {
          padding: 0.45rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-muted, #6b6964);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        .tb-chip:hover {
          color: var(--color-text, #1e1c18);
          background: var(--color-surface-offset, rgba(26, 25, 23, 0.05));
        }
        .tb-chip.active {
          background: var(--color-surface-2, #ffffff);
          color: var(--color-primary, #01696f);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .tb-right {
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }
        
        .tb-icon-btn {
          display: inline-flex;
          align-items: center;
          height: 36px;
          padding: 0 0.8rem;
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-border, rgba(26, 25, 23, 0.15));
          border-radius: 8px;
          color: var(--color-text-muted, #6b6964);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tb-icon-btn:hover {
          background: var(--color-surface-offset, #fdfdfc);
          color: var(--color-text, #1e1c18);
          border-color: var(--color-border, rgba(26, 25, 23, 0.25));
        }
        .tb-view {
          display: flex;
          gap: 0.4rem;
        }
        .tb-view-btn {
          padding: 0 0.6rem;
        }
        .tb-view-btn.active {
          background: var(--color-primary-highlight, rgba(1, 105, 111, 0.08));
          color: var(--color-primary, #01696f);
          border-color: var(--color-primary, rgba(1, 105, 111, 0.2));
        }

        @media (max-width: 860px) {
          .tb-wrap {
            flex-direction: column;
            align-items: stretch;
          }
          .tb-search-wrap {
            max-width: 100%;
            order: 1;
          }
          .tb-actions {
            order: 2;
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .tb-filters {
            flex-wrap: wrap;
          }
          .tb-chip {
            flex: 1 1 auto;
            justify-content: center;
            padding: 0.45rem 0.5rem;
            font-size: 0.8rem;
          }
          .tb-right {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

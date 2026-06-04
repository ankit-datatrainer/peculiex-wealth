"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetcher } from "@/lib/api";
import { fmtINR2, randomSpark, sparkPath, getCompanyDomain } from "@/lib/util";
import WatchlistButton from "./WatchlistButton";

type SymbolEntry = { symbol: string; name: string; currency: string };
type Quote = {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  change: number | null;
  volume: number | null;
  marketState: string | null;
};
type Index = { id: string; name: string; price: number; chg: number };

const FALLBACK_INDICES: Index[] = [
  { id: "ix-nifty", name: "NIFTY 50", price: 22530.7, chg: 1.35 },
  { id: "ix-sensex", name: "SENSEX", price: 74119.39, chg: 0.92 },
  { id: "ix-bank", name: "BANK NIFTY", price: 48650.15, chg: -0.34 },
  { id: "ix-vix", name: "India VIX", price: 13.28, chg: -2.1 }
];

type Tab = "all" | "gainers" | "losers";

export default function Markets() {
  const [indices, setIndices] = useState<Index[]>(FALLBACK_INDICES);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allStocks, setAllStocks] = useState<Quote[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [gainers, setGainers] = useState<Quote[]>([]);
  const [losers, setLosers] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [moversLoading, setMoversLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Fetch all stocks (paginated + search)
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const data = await fetcher<{ items: Quote[]; total: number; totalPages: number }>(
        `/api/markets/all-stocks?${params}`
      );
      setAllStocks(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setAllStocks([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  // Fetch movers (gainers/losers)
  useEffect(() => {
    setMoversLoading(true);
    fetcher<{ gainers: Quote[]; losers: Quote[] }>("/api/markets/movers?count=15")
      .then((data) => {
        setGainers(data.gainers || []);
        setLosers(data.losers || []);
      })
      .catch(() => {})
      .finally(() => setMoversLoading(false));
  }, []);

  // Fetch indices
  useEffect(() => {
    fetcher<{ items: Index[] }>("/api/indices")
      .then((d) => { if (d?.items?.length) setIndices(d.items); })
      .catch(() => {});
  }, []);

  const sparks = useMemo(() => {
    const map: Record<string, number[]> = {};
    allStocks.forEach((s, i) => (map[s.symbol] = randomSpark(i * 7)));
    return map;
  }, [allStocks]);

  return (
    <section id="markets" className="markets">
      <div className="container">
        <div className="sec-head reveal">
          <div className="label"><span className="markets-live-dot" /> Live · NSE</div>
          <h2 className="stitle">Market <em>Opportunities</em></h2>
          <p className="sdesc">
            All Indian stocks listed on NSE. Search any stock, or view today&apos;s top gainers and losers.
          </p>
        </div>

        {/* Indices */}
        <div className="indices-row reveal">
          {indices.map((ix) => {
            const up = ix.chg >= 0;
            return (
              <Link href={`/markets/${encodeURIComponent(ix.name)}`} className="index-card" key={ix.id}>
                <span>{ix.name}</span>
                <strong>{ix.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                <em className={up ? "up" : "dn"}>
                  <svg className="trend-icon"><use href={`#i-arrow-${up ? "up" : "down"}`} /></svg>{" "}
                  {up ? "+" : "−"}{Math.abs(ix.chg).toFixed(2)}%
                </em>
              </Link>
            );
          })}
        </div>

        {/* Tabs + Search */}
        <div className="filter-bar reveal" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["all", "gainers", "losers"] as const).map((t) => (
              <button
                key={t}
                className={`chip${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
                type="button"
              >
                {t === "all" ? `All Stocks` : t === "gainers" ? "Top Gainers" : "Top Losers"}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem 0.6rem 2.4rem",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#ffffff",
                color: "var(--color-text)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                fontSize: "0.9rem"
              }}
            />
            <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, opacity: 1, color: "var(--color-text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Content based on tab */}
        {tab === "all" && (
          <>
    {loading ? (
              <div className="stock-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <article className="stock" key={i} style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", height: "180px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--color-border)", animation: "pulse 1.5s infinite ease-in-out" }} />
                      <div>
                        <div style={{ width: 120, height: 16, background: "var(--color-border)", borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s infinite ease-in-out" }} />
                        <div style={{ width: 80, height: 12, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
                      </div>
                    </div>
                    <div style={{ width: 60, height: 24, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
                    <div style={{ flex: 1 }} />
                    <div style={{ width: "100%", height: 30, background: "var(--color-border)", borderRadius: 4, opacity: 0.5, animation: "pulse 1.5s infinite ease-in-out" }} />
                    <style jsx>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
                  </article>
                ))}
              </div>
            ) : allStocks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                {debouncedSearch ? `No stocks found for "${debouncedSearch}"` : "No stocks available. Make sure FINNHUB_API_KEY is set in backend .env"}
              </div>
            ) : (
              <>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", margin: "0.5rem 0 1rem" }}>
                  Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total} stocks
                  {debouncedSearch && ` matching "${debouncedSearch}"`}
                </p>
                <div className="stock-grid" id="stockGrid">
                  {allStocks.map((q, i) => {
                    const up = (q.changePercent ?? 0) >= 0;
                    const vals = sparks[q.symbol] || randomSpark(i * 7);
                    return (
                      <article className="stock reveal visible" key={q.symbol}>
                        <Link href={`/markets/${encodeURIComponent(q.symbol)}`} className="stock-link" aria-label={`Open ${q.name} details`}>
                          <div className="stock-head" style={{ alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <Image
                                src={`https://logo.clearbit.com/${getCompanyDomain(q.symbol, q.name)}`}
                                alt=""
                                width={32}
                                height={32}
                                style={{ borderRadius: 999, objectFit: "contain", background: "#fff", border: "1px solid rgba(0,0,0,0.05)" }}
                                onError={(e) => {
                                  const t = e.currentTarget;
                                  t.style.display = "none";
                                  const fb = t.nextElementSibling as HTMLElement | null;
                                  if (fb) fb.style.display = "grid";
                                }}
                              />
                              <span className="unl-logo-fallback" style={{ display: "none", width: 32, height: 32, borderRadius: 999, background: "#01696f", color: "#fff", placeItems: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: 1 }}>
                                {q.symbol.slice(0, 2)}
                              </span>
                              <div>
                                <div className="stock-name">{q.name}</div>
                                <div className="stock-sym">{q.symbol} · NSE</div>
                              </div>
                            </div>
                            <span className={`stock-pill ${up ? "up" : "dn"}`}>
                              <svg className="trend-icon"><use href={`#i-arrow-${up ? "up" : "down"}`} /></svg>{" "}
                              {Math.abs(q.changePercent ?? 0).toFixed(2)}%
                            </span>
                          </div>
                          <div className="stock-price">
                            <b>₹{q.price != null ? fmtINR2(q.price) : "—"}</b>
                          </div>
                          <svg className="stock-spark" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <path d={sparkPath(vals)} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth="1.6" />
                          </svg>
                          {q.volume != null && (
                            <div className="stock-meta">
                              <span>Vol {(q.volume / 1e6).toFixed(1)}M</span>
                            </div>
                          )}
                        </Link>
                        <div className="stock-actions">
                          <WatchlistButton symbol={q.symbol} name={q.name} price={q.price ?? 0} kind="listed" />
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
                    <button className="chip" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} type="button">← Prev</button>
                    <span style={{ display: "flex", alignItems: "center", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                      Page {page} of {totalPages}
                    </span>
                    <button className="chip" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} type="button">Next →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {(tab === "gainers" || tab === "losers") && (
          <>
            {moversLoading ? (
              <div className="stock-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <article className="stock" key={i} style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", height: "180px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--color-border)", animation: "pulse 1.5s infinite ease-in-out" }} />
                      <div>
                        <div style={{ width: 120, height: 16, background: "var(--color-border)", borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s infinite ease-in-out" }} />
                        <div style={{ width: 80, height: 12, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
                      </div>
                    </div>
                    <div style={{ width: 60, height: 24, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
                    <div style={{ flex: 1 }} />
                    <div style={{ width: "100%", height: 30, background: "var(--color-border)", borderRadius: 4, opacity: 0.5, animation: "pulse 1.5s infinite ease-in-out" }} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="stock-grid" id="stockGrid">
                {(tab === "gainers" ? gainers : losers).map((q, i) => {
                  const up = (q.changePercent ?? 0) >= 0;
                  const vals = randomSpark(i * 5 + (tab === "losers" ? 100 : 0));
                  return (
                    <article className="stock reveal visible" key={q.symbol}>
                      <Link href={`/markets/${encodeURIComponent(q.symbol)}`} className="stock-link" aria-label={`Open ${q.name} details`}>
                        <div className="stock-head" style={{ alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Image
                              src={`https://logo.clearbit.com/${getCompanyDomain(q.symbol, q.name)}`}
                              alt=""
                              width={32}
                              height={32}
                              style={{ borderRadius: 999, objectFit: "contain", background: "#fff", border: "1px solid rgba(0,0,0,0.05)" }}
                              onError={(e) => {
                                const t = e.currentTarget;
                                t.style.display = "none";
                                const fb = t.nextElementSibling as HTMLElement | null;
                                if (fb) fb.style.display = "grid";
                              }}
                            />
                            <span className="unl-logo-fallback" style={{ display: "none", width: 32, height: 32, borderRadius: 999, background: "#01696f", color: "#fff", placeItems: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: 1 }}>
                              {q.symbol.slice(0, 2)}
                            </span>
                            <div>
                              <div className="stock-name">{q.name}</div>
                              <div className="stock-sym">{q.symbol} · NSE</div>
                            </div>
                          </div>
                          <span className={`stock-pill ${up ? "up" : "dn"}`}>
                            <svg className="trend-icon"><use href={`#i-arrow-${up ? "up" : "down"}`} /></svg>{" "}
                            {Math.abs(q.changePercent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                        <div className="stock-price">
                          <b>₹{q.price != null ? fmtINR2(q.price) : "—"}</b>
                        </div>
                        <svg className="stock-spark" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <path d={sparkPath(vals)} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth="1.6" />
                        </svg>
                        {q.volume != null && (
                          <div className="stock-meta">
                            <span>Vol {(q.volume / 1e6).toFixed(1)}M</span>
                          </div>
                        )}
                      </Link>
                      <div className="stock-actions">
                        <WatchlistButton symbol={q.symbol} name={q.name} price={q.price ?? 0} kind="listed" />
                      </div>
                    </article>
                  );
                })}
                {(tab === "gainers" ? gainers : losers).length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    No {tab} data available. Market may be closed.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}


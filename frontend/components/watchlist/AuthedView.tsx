"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { apiFetch, apiPostJSON, fetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { fmtINR2, randomSpark, sparkPath, formatCompact, formatIndianCap } from "@/lib/util";
import { makeUnlistedSymbol } from "@/components/WatchlistButton";
import {
  CURATED_BASKETS,
  formatRelative,
  type Basket,
  type Filter,
  type SortKey,
  type Stock,
  type Unl,
  type ViewMode,
  type WatchlistItem
} from "./types";
import AuthedToolbar from "./AuthedToolbar";
import AuthedCards from "./AuthedCards";
import AuthedTable from "./AuthedTable";

/* small toast helper, mirrors WatchlistButton's behaviour */
let toastEl: HTMLDivElement | null = null;
let toastTimer: number | null = null;
function flashToast(msg: string) {
  if (typeof document === "undefined") return;
  if (!toastEl) {
    toastEl = document.createElement("div");
    Object.assign(toastEl.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%) translateY(20px)",
      background: "rgba(15,23,42,0.94)",
      color: "#fff",
      padding: "0.7rem 1.1rem",
      borderRadius: "999px",
      fontSize: "0.88rem",
      fontWeight: "500",
      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
      zIndex: "90",
      backdropFilter: "blur(8px)",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.2s, transform 0.25s ease"
    } as CSSStyleDeclaration);
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  void toastEl.offsetWidth;
  toastEl.style.opacity = "1";
  toastEl.style.transform = "translateX(-50%) translateY(0)";
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (!toastEl) return;
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(-50%) translateY(20px)";
  }, 2200);
}

export default function AuthedView() {
  const { user } = useAuth();

  /* ---------- catalog ---------- */
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [allUnlisted, setAllUnlisted] = useState<Unl[]>([]);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Stock[] }>("/api/stocks")
      .then((j) => !killed && j?.items?.length && setAllStocks(j.items))
      .catch(() => {});
    fetcher<{ items: Unl[] }>("/api/unlisted")
      .then((j) => !killed && j?.items?.length && setAllUnlisted(j.items))
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);



  const stockMap = useMemo(() => {
    const m: Record<string, Stock> = {};
    allStocks.forEach((s) => (m[s.sym] = s));
    return m;
  }, [allStocks]);

  const unlistedMap = useMemo(() => {
    const m: Record<string, Unl> = {};
    allUnlisted.forEach((u) => (m[makeUnlistedSymbol(u.name)] = u));
    return m;
  }, [allUnlisted]);

  /* ---------- watchlist ---------- */
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySym, setBusySym] = useState<string | null>(null);

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch<{ items: WatchlistItem[] }>("/api/watchlist");
      setItems(r.items || []);
    } catch (e: any) {
      setError(e?.message || "Could not load your watchlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  const [liveQuotes, setLiveQuotes] = useState<Record<string, any>>({});

  useEffect(() => {
    let killed = false;
    let ws: WebSocket | null = null;
    
    const listedSyms = items
      .filter((it) => {
        const isUnl = it.symbol.startsWith("UNL-") || it.note === "unlisted" || unlistedMap[it.symbol];
        return !isUnl;
      })
      .map((it) => it.symbol);

    if (listedSyms.length > 0) {
      const symStr = listedSyms.join(",");
      apiFetch<{ quotes: any[] }>(`/api/markets/quotes?symbols=${symStr}`)
        .then((res) => {
          if (killed) return;
          if (res?.quotes) {
            const m: Record<string, any> = {};
            res.quotes.forEach((q) => {
              m[q.symbol] = q;
            });
            setLiveQuotes(m);
          }
        })
        .catch(console.error);
        
      const apiBaseStr = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
      const wsUrl = apiBaseStr.replace(/^http/, "ws").replace(/\/api\/?$/, "");
      
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          ws?.send(JSON.stringify({ action: "subscribe", symbols: listedSyms }));
        };
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "PRICE_TICK" && msg.payload) {
              setLiveQuotes((prev) => ({
                ...prev,
                [msg.payload.symbol]: msg.payload
              }));
            }
          } catch(err) {}
        };
      } catch (err) {
        console.error("Failed to connect to WebSocket", err);
      }
    }
    
    return () => {
      killed = true;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "unsubscribe", symbols: listedSyms }));
        ws.close();
      } else if (ws) {
        ws.close();
      }
    };
  }, [items, unlistedMap]);


  /* ---------- ui state ---------- */
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>("cards");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const trackedSet = useMemo(
    () => new Set(items.map((i) => i.symbol)),
    [items]
  );

  /* per-symbol stable spark seed */
  const sparks = useMemo(() => {
    const map: Record<string, number[]> = {};
    items.forEach((it, i) => {
      if (!map[it.symbol]) map[it.symbol] = randomSpark(i * 5);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.symbol).join(",")]);

  /* ---------- joined view ---------- */
  const watched = useMemo(() => {
    const rows = items.map((it) => {
      const live = stockMap[it.symbol];
      const liveQuote = liveQuotes[it.symbol];
      const unl = unlistedMap[it.symbol];
      const isUnlisted =
        !!unl || it.symbol.startsWith("UNL-") || it.note === "unlisted";
      const price = liveQuote?.price ?? live?.price ?? unl?.price ?? null;
      const chg = liveQuote?.changePercent ?? live?.chg ?? null;
      
      let vol = live?.vol ?? "—";
      let cap = live?.cap ?? "—";
      if (liveQuote?.volume) vol = formatCompact(liveQuote.volume);
      if (liveQuote?.marketCap) cap = formatIndianCap(liveQuote.marketCap);

      return {
        item: it,
        name: it.name || liveQuote?.name || live?.name || unl?.name || it.symbol,
        price,
        chg,
        vol,
        cap,
        sector: unl?.sector ?? null,
        domain: unl?.domain ?? null,
        brand: unl?.brand ?? null,
        initial: unl?.initial ?? null,
        iv: unl?.iv ?? null,
        isUnlisted,
        addedDelta:
          price != null && it.added_price
            ? +(((price - it.added_price) / it.added_price) * 100).toFixed(2)
            : null
      };
    });

    const filtered = rows.filter((r) => {
      if (filter === "all") return true;
      if (r.chg == null) return false;
      if (filter === "gainers") return r.chg > 0;
      if (filter === "losers") return r.chg < 0;
      if (filter === "stable") return Math.abs(r.chg) < 0.5;
      return true;
    });

    const sorter: Record<SortKey, (a: any, b: any) => number> = {
      recent: (a, b) =>
        new Date(b.item.created_at).getTime() -
        new Date(a.item.created_at).getTime(),
      alpha: (a, b) => a.item.symbol.localeCompare(b.item.symbol),
      topGain: (a, b) => (b.chg ?? -Infinity) - (a.chg ?? -Infinity),
      topLoss: (a, b) => (a.chg ?? Infinity) - (b.chg ?? Infinity)
    };
    return [...filtered].sort(sorter[sort]);
  }, [items, stockMap, unlistedMap, filter, sort, liveQuotes]);

  const stats = useMemo(() => {
    const liveItems = items
      .filter(it => !it.symbol.startsWith("UNL-") && it.note !== "unlisted" && !unlistedMap[it.symbol])
      .map(it => {
        const live = stockMap[it.symbol];
        const liveQuote = liveQuotes[it.symbol];
        return {
          sym: it.symbol,
          chg: liveQuote?.changePercent ?? live?.chg ?? 0,
        };
      });
      
    const gainers = liveItems.filter((s) => s.chg > 0).length;
    const losers = liveItems.filter((s) => s.chg < 0).length;
    const top = liveItems.reduce<any>(
      (best, s) => (best == null || s.chg > best.chg ? s : best),
      null
    );
    return { total: items.length, gainers, losers, top };
  }, [items, stockMap, liveQuotes, unlistedMap]);

  /* ---------- search suggestions ---------- */
  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [] as Array<
      | { kind: "listed"; data: Stock }
      | { kind: "unlisted"; data: Unl; symbol: string }
    >;
    const out: Array<
      | { kind: "listed"; data: Stock }
      | { kind: "unlisted"; data: Unl; symbol: string }
    > = [];
    for (const s of allStocks) {
      if (
        !trackedSet.has(s.sym) &&
        (s.sym.includes(q) || s.name.toUpperCase().includes(q))
      ) {
        out.push({ kind: "listed", data: s });
      }
    }
    for (const u of allUnlisted) {
      const sym = makeUnlistedSymbol(u.name);
      if (
        !trackedSet.has(sym) &&
        (u.name.toUpperCase().includes(q) ||
          u.sector.toUpperCase().includes(q))
      ) {
        out.push({ kind: "unlisted", data: u, symbol: sym });
      }
    }
    return out.slice(0, 10);
  }, [query, allStocks, allUnlisted, trackedSet]);

  /* ---------- mutations ---------- */
  const addListed = useCallback(
    async (s: Stock) => {
      if (trackedSet.has(s.sym)) return;
      setBusySym(s.sym);
      setError(null);
      const tempItem: WatchlistItem = {
        id: `tmp-${s.sym}-${Date.now()}`,
        user_id: user?.id || "",
        symbol: s.sym,
        name: s.name,
        added_price: s.price,
        note: null,
        created_at: new Date().toISOString()
      };
      setItems((prev) => [tempItem, ...prev]);
      setQuery("");
      setShowSuggestions(false);
      try {
        const r = await apiPostJSON<{ item: WatchlistItem }>(
          "/api/watchlist",
          { symbol: s.sym, name: s.name, price: s.price }
        );
        setItems((prev) =>
          prev.map((it) => (it.id === tempItem.id ? r.item : it))
        );
        flashToast(`${s.name} added to your watchlist`);
      } catch (e: any) {
        setItems((prev) => prev.filter((it) => it.id !== tempItem.id));
        setError(e?.message || "Could not add to watchlist.");
      } finally {
        setBusySym(null);
      }
    },
    [trackedSet, user]
  );

  const addUnlisted = useCallback(
    async (u: Unl, symbol: string) => {
      if (trackedSet.has(symbol)) return;
      setBusySym(symbol);
      setError(null);
      const tempItem: WatchlistItem = {
        id: `tmp-${symbol}-${Date.now()}`,
        user_id: user?.id || "",
        symbol,
        name: u.name,
        added_price: u.price,
        note: "unlisted",
        created_at: new Date().toISOString()
      };
      setItems((prev) => [tempItem, ...prev]);
      setQuery("");
      setShowSuggestions(false);
      try {
        const r = await apiPostJSON<{ item: WatchlistItem }>(
          "/api/watchlist",
          { symbol, name: u.name, price: u.price, note: "unlisted" }
        );
        setItems((prev) =>
          prev.map((it) => (it.id === tempItem.id ? r.item : it))
        );
        flashToast(`${u.name} added to your watchlist`);
      } catch (e: any) {
        setItems((prev) => prev.filter((it) => it.id !== tempItem.id));
        setError(e?.message || "Could not add to watchlist.");
      } finally {
        setBusySym(null);
      }
    },
    [trackedSet, user]
  );

  const removeStock = useCallback(
    async (sym: string) => {
      setBusySym(sym);
      setError(null);
      const snapshot = items;
      const removed = snapshot.find((it) => it.symbol === sym);
      setItems((prev) => prev.filter((it) => it.symbol !== sym));
      try {
        await apiFetch(`/api/watchlist/${encodeURIComponent(sym)}`, {
          method: "DELETE"
        });
        if (removed) flashToast(`${removed.name} removed`);
      } catch (e: any) {
        setItems(snapshot);
        setError(e?.message || "Could not remove from watchlist.");
      } finally {
        setBusySym(null);
      }
    },
    [items]
  );

  const importBasket = useCallback(
    async (basket: Basket) => {
      const symbolsToAdd = basket.symbols.filter((s) => !trackedSet.has(s));
      if (symbolsToAdd.length === 0) {
        setError(
          `Every stock in "${basket.title}" is already on your watchlist.`
        );
        return;
      }
      setError(null);
      try {
        const itemsBody = symbolsToAdd.map((sym) => {
          const live = stockMap[sym];
          return {
            symbol: sym,
            name: live?.name || sym,
            price: live?.price
          };
        });
        const r = await apiPostJSON<{
          added: number;
          items: WatchlistItem[];
        }>("/api/watchlist/batch", { items: itemsBody });
        setItems(r.items);
        flashToast(`${basket.title} added (${r.added} stocks)`);
      } catch (e: any) {
        setError(e?.message || "Could not import the basket.");
      }
    },
    [trackedSet, stockMap]
  );

  const clearAll = useCallback(async () => {
    if (!items.length) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Remove every stock from your watchlist? This cannot be undone.")
    )
      return;
    setError(null);
    const snapshot = items;
    setItems([]);
    try {
      await apiFetch("/api/watchlist/all", { method: "DELETE" });
      flashToast("Watchlist cleared");
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message || "Could not clear watchlist.");
    }
  }, [items]);

  /* ---------- render ---------- */
  return (
    <section className="authed-wrap">
      {/* Hero greeting */}
      <header className="a-hero">
        <div className="a-hero-content">
          <div className="a-hero-top">
            <h1 className="a-title">Leaderboard - Watchlist</h1>
            <p className="sdesc">
              Stay Ahead of the Market with Your Personalized Watchlist
            </p>
          </div>
          
          <div className="a-statgrid">
            <div className="stat-main">
              <div className="stat-label">Market Trend</div>
              <div className="stat-value-large">
                {stats.gainers >= stats.losers ? "Bullish" : "Bearish"}
                <span className={`stat-chg-large ${stats.gainers >= stats.losers ? "up" : "dn"}`}>
                  {stats.top ? `Top: ${stats.top.sym} +${Math.abs(stats.top.chg).toFixed(2)}%` : ""}
                </span>
              </div>
            </div>
            
            <div className="stat-divider" />
            
            <div className="stat-group">
              <div className="stat-item">
                <div className="stat-label">Watchlist Assets</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Gainers</div>
                <div className="stat-value">{stats.gainers}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Losers</div>
                <div className="stat-value">{stats.losers}</div>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* Sticky toolbar */}
      <AuthedToolbar
        query={query}
        setQuery={setQuery}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        suggestions={suggestions}
        addListed={addListed}
        addUnlisted={addUnlisted}
        busySym={busySym}
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        hasItems={items.length > 0}
      />

      {error && (
        <div className="a-error" role="alert">
          {error}
          <button onClick={() => setError(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {/* Body */}
      {loading && items.length === 0 ? (
        <GridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : watched.length === 0 ? (
        <div className="a-empty-mini">
          No stocks match this filter.{" "}
          <button className="a-link" onClick={() => setFilter("all")}>
            Show all
          </button>
        </div>
      ) : view === "cards" ? (
        <AuthedCards
          rows={watched}
          sparks={sparks}
          busySym={busySym}
          onRemove={removeStock}
        />
      ) : (
        <AuthedTable
          rows={watched}
          sparks={sparks}
          busySym={busySym}
          onRemove={removeStock}
          sort={sort}
          setSort={setSort}
        />
      )}



      {/* Footer actions */}
      {items.length > 0 && (
        <div className="a-foot">
          <span>
            {items.length} stock{items.length === 1 ? "" : "s"} on your list
          </span>
          <div className="a-foot-actions">
            <Link href="/unlisted" className="a-link">
              Browse unlisted →
            </Link>
            <button type="button" className="a-clear" onClick={clearAll}>
              Clear watchlist
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .a-hero {
          background: #ffffff;
          padding: 120px 32px 2rem;
          margin: 0 -32px 1rem;
          color: #1e1c18;
          border-bottom: 1px solid rgba(26, 25, 23, 0.08);
        }
        .a-hero-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .a-title {
          font-family: var(--font-display, inherit);
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.4rem;
          color: #1e1c18;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sdesc {
          font-size: 0.9rem;
          color: #6b6964;
          margin: 0;
        }
        
        .a-statgrid {
          display: flex;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #6b6964;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.4rem;
        }
        .stat-value-large {
          font-family: var(--font-display, inherit);
          font-size: 2.2rem;
          font-weight: 700;
          color: #1e1c18;
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }
        .stat-chg-large {
          font-size: 1rem;
          font-weight: 600;
        }
        .stat-chg-large.up { color: #01696f; }
        .stat-chg-large.dn { color: #dc2626; }
        
        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(26, 25, 23, 0.1);
        }
        
        .stat-group {
          display: flex;
          gap: 3rem;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-family: var(--font-display, inherit);
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e1c18;
        }

        @media (max-width: 768px) {
          .a-hero {
            padding: 100px 16px 1.5rem;
            margin: 0 -16px 1rem;
          }
          .a-statgrid {
            gap: 1.5rem;
            flex-direction: column;
            align-items: flex-start;
          }
          .stat-divider {
            display: none;
          }
          .stat-group {
            gap: 1.5rem;
            width: 100%;
            justify-content: space-between;
          }
        }

        .authed-wrap {
          padding: 0 0 6rem;
        }


        /* ── Shared ── */
        .a-error {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.18);
          color: #b91c1c;
          padding: 0.8rem 1.2rem;
          border-radius: 14px;
          margin: 0.5rem 0 1.2rem;
          font-size: 0.92rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-body, 'Barlow', sans-serif);
        }
        .a-error button {
          background: transparent;
          border: 0;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 0.3rem;
          line-height: 1;
        }
        .a-empty-mini {
          padding: 3.5rem 1.5rem;
          text-align: center;
          color: var(--color-text-muted, #333333);
          background: var(--color-surface-2, #ffffff);
          border: 1px dashed rgba(1, 105, 111, 0.18);
          border-radius: 20px;
          font-size: 0.95rem;
          box-shadow: var(--shadow-sm);
          font-family: var(--font-body, 'Barlow', sans-serif);
        }
        .a-link {
          color: var(--color-primary, #01696f);
          background: transparent;
          border: 0;
          padding: 0;
          font: inherit;
          font-family: var(--font-body, 'Barlow', sans-serif);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1.5px solid rgba(1, 105, 111, 0.25);
          transition: all 0.2s;
        }
        .a-link:hover {
          color: #015257;
          border-bottom-color: #015257;
        }
        .a-foot {
          margin-top: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          color: var(--color-text-muted, #333333);
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-divider, #e0ddd8);
          font-family: var(--font-body, 'Barlow', sans-serif);
        }
        .a-foot-actions {
          display: flex;
          gap: 1.2rem;
          align-items: center;
        }
        .a-clear {
          background: transparent;
          border: 0;
          font: inherit;
          font-family: var(--font-body, 'Barlow', sans-serif);
          padding: 0;
          color: var(--color-danger, #dc2626);
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1.5px solid rgba(185, 28, 28, 0.25);
          transition: all 0.2s;
        }
        .a-clear:hover {
          color: #991b1b;
          border-bottom-color: #991b1b;
        }
      `}</style>
    </section>
  );
}

/* ============== Sub-components ============== */

function Stat({
  label,
  value,
  accent,
  compact
}: {
  label: string;
  value: number | string;
  accent: string;
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        border: hovered ? "1px solid rgba(1, 105, 111, 0.2)" : "1px solid rgba(26, 25, 23, 0.07)",
        borderRadius: 20,
        padding: compact ? "0.8rem 1rem" : "1rem 1.25rem",
        minWidth: 112,
        boxShadow: hovered 
          ? "0 14px 36px rgba(1, 105, 111, 0.03), 0 3px 8px rgba(1, 105, 111, 0.015)" 
          : "0 10px 30px rgba(28, 27, 24, 0.02), 0 2px 6px rgba(28, 27, 24, 0.01)",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)"
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: "#6b6964",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 600,
          fontFamily: "var(--font-display, 'Barlow', sans-serif)"
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: compact ? "1.05rem" : "1.5rem",
          fontWeight: 700,
          color: accent,
          marginTop: 6,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-display, 'Barlow', sans-serif)"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        marginTop: "1.5rem"
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#ffffff",
            border: "1px solid rgba(26, 25, 23, 0.07)",
            borderRadius: 20,
            padding: "1.5rem",
            height: 200,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(28, 27, 24, 0.02)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(26,25,23,0) 0%, rgba(26,25,23,0.03) 50%, rgba(26,25,23,0) 100%)",
              animation: "wlpulse 1.4s infinite"
            }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px dashed rgba(26, 25, 23, 0.15)",
        borderRadius: 24,
        padding: "4.5rem 2rem",
        textAlign: "center",
        marginTop: "1rem",
        boxShadow: "0 12px 34px rgba(28, 27, 24, 0.02)"
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 1.5rem",
          borderRadius: "50%",
          background: "rgba(1, 105, 111, 0.06)",
          border: "1px solid rgba(1, 105, 111, 0.1)",
          display: "grid",
          placeItems: "center",
          color: "#01696f",
          boxShadow: "0 4px 12px rgba(1, 105, 111, 0.03)"
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3l2.9 6 6.6 1-4.7 4.6 1.1 6.6L12 18l-5.9 3.2 1.1-6.6L2.5 10l6.6-1z" />
        </svg>
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display, 'Barlow', sans-serif)",
          fontSize: "1.8rem",
          fontWeight: 600,
          color: "#1e1c18",
          margin: "0 0 0.6rem",
          letterSpacing: "-0.02em"
        }}
      >
        Start your watchlist
      </h3>
      <p
        style={{
          color: "#6b6964",
          maxWidth: 480,
          margin: "0 auto 2rem",
          fontSize: "0.98rem",
          lineHeight: 1.55
        }}
      >
        Search a stock above to add it to your watchlist. Everything syncs perfectly to your account.
      </p>
      <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/unlisted"
          style={{
            background: "transparent",
            color: "#01696f",
            border: "1px solid rgba(1, 105, 111, 0.2)",
            borderRadius: 12,
            padding: "0.8rem 1.6rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "inline-block",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            fontFamily: "var(--font-display, 'Barlow', sans-serif)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(1, 105, 111, 0.04)";
            e.currentTarget.style.borderColor = "#01696f";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(1, 105, 111, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Browse unlisted →
        </Link>
      </div>
    </div>
  );
}

// trigger recompile

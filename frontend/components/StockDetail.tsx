"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  fetchProfile,
  fetchNews,
  fetchQuote,
  fmtCompactINR,
  fmtCompactNum,
  fmtPct,
  fmtPrice,
  isIndex,
  wsBaseUrl,
  type LiveQuote,
  type NewsItem,
  type StockProfile
} from "@/lib/markets";
import { getCompanyDomain, getCompanyLogo } from "@/lib/util";
import PriceChart from "./PriceChart";
import WatchlistButton from "./WatchlistButton";


type Props = { symbol: string };

const POLL_MS = 15_000;

/**
 * Groww/Zerodha-style detail view for a single instrument.
 *
 * Top-level data:
 *   - getProfile() — one rich call: quote + assetProfile + summaryDetail.
 *     Polled every 15s (the backend caches Yahoo for 30s anyway, so this
 *     is friendly to upstream).
 *   - getNews() — Finnhub news once on mount (cached on backend).
 */
export default function StockDetail({ symbol }: Props) {
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** "up" | "dn" for one beat after each tick, to flash the price green/red. */
  const [tickDir, setTickDir] = useState<"up" | "dn" | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    let killed = false;
    setLoading(true);
    setError(null);

    fetchProfile(symbol)
      .then((p) => {
        if (killed) return;
        setProfile(p);
        setQuote(p);
      })
      .catch((e) => {
        if (!killed) setError(e?.message || "Could not load this stock.");
      })
      .finally(() => {
        if (!killed) setLoading(false);
      });

    fetchNews(symbol)
      .then((items) => {
        if (!killed) setNews(items || []);
      })
      .catch(() => {});

    // Quick refresh of live quote only — keeps the header price live
    // without re-fetching the heavy profile blob.
    const t = window.setInterval(() => {
      fetchQuote(symbol)
        .then((q) => {
          if (!killed) setQuote(q);
        })
        .catch(() => {});
    }, POLL_MS);

    return () => {
      killed = true;
      window.clearInterval(t);
    };
  }, [symbol]);

  /* Live ticks over WebSocket — the backend pushes a PRICE_TICK roughly every
     2s for subscribed symbols while the market is open. This is what makes the
     header price move in real time (the 15s poll above is only a safety net). */
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsBaseUrl());
      ws.onopen = () => {
        ws?.send(JSON.stringify({ action: "subscribe", symbols: [symbol] }));
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type !== "PRICE_TICK" || !msg.payload) return;
          const p = msg.payload;
          if (p.symbol !== symbol && p.yahooSymbol !== symbol) return;

          const price = p.price ?? p.c;
          if (price == null) return;

          // Flash the price green/red in the direction it moved.
          const prev = lastPriceRef.current;
          if (prev != null && price !== prev) {
            setTickDir(price > prev ? "up" : "dn");
            if (flashTimer.current) window.clearTimeout(flashTimer.current);
            flashTimer.current = window.setTimeout(() => setTickDir(null), 700);
          }
          lastPriceRef.current = price;

          setQuote((q) =>
            q
              ? {
                  ...q,
                  price,
                  change: p.change ?? p.d ?? q.change,
                  changePercent: p.changePercent ?? p.dp ?? q.changePercent
                }
              : q
          );
        } catch (err) {}
      };
    } catch (err) {
      console.error("WebSocket connect error", err);
    }

    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "unsubscribe", symbols: [symbol] }));
        ws.close();
      } else if (ws) {
        ws.close();
      }
    };
  }, [symbol]);

  const display = quote || profile;
  const up = (display?.changePercent ?? 0) >= 0;

  if (error && !display) {
    return (
      <main className="container stock-page">
        <div className="stock-page-error">
          <h1>Couldn&apos;t load {decodeURIComponent(symbol)}</h1>
          <p>{error}</p>
          <Link href="/markets" className="btn btn-outline">
            ← Back to markets
          </Link>
        </div>
      </main>
    );
  }

  if (loading && !display) {
    return (
      <main className="container stock-page">
        <div className="stock-page-skeleton">
          <div className="skel-bar" style={{ width: "40%", height: 28 }} />
          <div className="skel-bar" style={{ width: "20%", height: 40 }} />
          <div className="skel-bar" style={{ width: "100%", height: 280 }} />
        </div>
      </main>
    );
  }

  if (!display) return null;

  const initial = (display.name || display.symbol || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const idxFlag = isIndex(display.symbol, display.exchange);

  const stats: Array<[string, string]> = [
    ["Open", fmtPrice(display.previousClose ?? null, display.currency, idxFlag)],
    ["Day High", fmtPrice(display.dayHigh, display.currency, idxFlag)],
    ["Day Low", fmtPrice(display.dayLow, display.currency, idxFlag)],
    ["Prev. Close", fmtPrice(display.previousClose, display.currency, idxFlag)],
    ["Volume", fmtCompactNum(display.volume)],
    ["52W High", fmtPrice(display.fiftyTwoWeekHigh, display.currency, idxFlag)],
    ["52W Low", fmtPrice(display.fiftyTwoWeekLow, display.currency, idxFlag)],
    [
      "Market Cap",
      profile?.marketCap != null
        ? fmtCompactINR(profile.marketCap)
        : "—"
    ],
    [
      "P/E Ratio",
      profile?.peRatio != null ? profile.peRatio.toFixed(2) : "—"
    ],
    [
      "EPS (TTM)",
      profile?.eps != null ? profile.eps.toFixed(2) : "—"
    ],
    [
      "Dividend Yield",
      profile?.dividendYield != null
        ? `${(profile.dividendYield * 100).toFixed(2)}%`
        : "—"
    ],
    ["Beta", profile?.beta != null ? profile.beta.toFixed(2) : "—"]
  ];

  return (
    <main className="container stock-page">
      <nav className="stock-page-crumbs">
        <Link href="/markets">Markets</Link>
        <span> / </span>
        <span>{display.symbol}</span>
      </nav>

      <header className="stock-page-head-groww">
        <div className="stock-page-head-groww-top">
          <div className="stock-page-id">
            <div className="stock-logo-wrap" style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg-hover)", fontSize: "1.2rem", fontWeight: "bold", color: "var(--c-text-mut)" }}>
              <span style={{ position: "absolute", zIndex: 0 }}>{display.symbol.charAt(0)}</span>
              <Image
                src={getCompanyLogo(getCompanyDomain(display.symbol, display.name))}
                alt={display.symbol}
                fill
                style={{ objectFit: "cover", zIndex: 1 }}
                unoptimized
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="stock-page-name" style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{display.name}</h1>
              <div className="stock-page-meta">
                <span className="stock-page-sym">{display.symbol}</span>
                {display.exchange && (
                  <span className="stock-page-badge">{display.exchange}</span>
                )}
                {display.marketState && (
                  <span
                    className={`stock-page-badge stock-page-badge-${
                      display.marketState === "REGULAR" ? "ok" : "off"
                    }`}
                  >
                    {display.marketState === "REGULAR"
                      ? "Market Open"
                      : "Market Closed"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="stock-page-actions" style={{ display: "flex", gap: "12px" }}>

            <WatchlistButton
              symbol={display.symbol}
              name={display.name}
              price={display.price ?? 0}
              kind="listed"
            />
          </div>
        </div>

        <div className="stock-page-price-block-groww" style={{ marginTop: "1.5rem", display: "flex", alignItems: "baseline", gap: "12px" }}>
          <div
            className={`stock-page-price${tickDir ? ` tick-${tickDir}` : ""}`}
            style={{ fontSize: "2rem", fontWeight: 700 }}
          >
            {fmtPrice(display.price, display.currency, idxFlag)}
          </div>
          <div className={`stock-page-change ${up ? "up" : "dn"}`} style={{ fontSize: "1rem", fontWeight: 500 }}>
            {display.change != null ? (
              <>
                {display.change >= 0 ? "+" : "−"}
                {Math.abs(display.change).toFixed(2)} ({fmtPct(display.changePercent)})
              </>
            ) : (
              fmtPct(display.changePercent)
            )}
            <span className="stock-page-change-tag" style={{ color: "var(--c-text-mut)", marginLeft: "6px" }}>1D</span>
          </div>
          {display.marketState === "REGULAR" && (
            <span className="stock-live-pill" title="Live — updating in real time">
              <span className="stock-live-dot" />
              LIVE
            </span>
          )}
        </div>
      </header>

      <section className="stock-page-card">
        <PriceChart symbol={display.symbol} fallbackUp={up} isIndex={idxFlag} />
      </section>

      <section className="stock-page-card">
        <h2 className="stock-page-section-title">Key Stats</h2>
        <div className="stock-page-stats">
          {stats.map(([label, value]) => (
            <div className="stock-page-stat" key={label}>
              <span className="stock-page-stat-label">{label}</span>
              <span className="stock-page-stat-value">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {(profile?.longBusinessSummary || profile?.sector || profile?.website) && (
        <section className="stock-page-card">
          <h2 className="stock-page-section-title">About {display.name}</h2>
          <div className="stock-page-about-row">
            {profile.sector && (
              <div>
                <span className="stock-page-stat-label">Sector</span>
                <span className="stock-page-stat-value">{profile.sector}</span>
              </div>
            )}
            {profile.industry && (
              <div>
                <span className="stock-page-stat-label">Industry</span>
                <span className="stock-page-stat-value">{profile.industry}</span>
              </div>
            )}
            {profile.employees != null && (
              <div>
                <span className="stock-page-stat-label">Employees</span>
                <span className="stock-page-stat-value">
                  {profile.employees.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {profile.website && (
              <div>
                <span className="stock-page-stat-label">Website</span>
                <a
                  className="stock-page-stat-value link"
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {hostname(profile.website)} ↗
                </a>
              </div>
            )}
          </div>
          {profile.longBusinessSummary && (
            <p className="stock-page-bio">{profile.longBusinessSummary}</p>
          )}
        </section>
      )}

      {news.length > 0 && (
        <section className="stock-page-card">
          <h2 className="stock-page-section-title">News</h2>
          <ul className="stock-page-news">
            {news.slice(0, 8).map((n) => (
              <li key={n.id} className="stock-page-news-item">
                <a href={n.url} target="_blank" rel="noreferrer">
                  <div className="stock-page-news-meta">
                    <span>{n.source}</span>
                    <span>·</span>
                    <span>
                      {n.publishedAt
                        ? new Date(n.publishedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit"
                            }
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="stock-page-news-headline">{n.headline}</div>
                  {n.summary && (
                    <p className="stock-page-news-summary">{n.summary}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="stock-page-disclaimer">
        Live prices are sourced from public market feeds with up to a 15-minute
        delay during market hours. This page is informational only — it is not
        an offer or recommendation to buy or sell securities.
      </p>
    </main>
  );
}

/* ---------- helpers ---------- */

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `linear-gradient(135deg, hsl(${hue} 65% 38%), hsl(${(hue + 40) % 360} 60% 28%))`;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}


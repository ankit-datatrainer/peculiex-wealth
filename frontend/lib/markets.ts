/**
 * Typed client for the live market endpoints exposed by the backend at
 * /api/markets/*. The backend proxies Yahoo Finance for quotes/charts and
 * Finnhub for news, so the browser never sees the API key.
 */

import { fetcher } from "./api";

export type LiveQuote = {
  symbol: string;
  yahooSymbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  volume: number | null;
  marketState: string | null;
  asOf: number;
};

export type Candle = {
  t: number;
  o: number | null;
  h: number | null;
  l: number | null;
  c: number | null;
  v: number | null;
};

export type CandleSeries = {
  symbol: string;
  yahooSymbol: string;
  range: string;
  interval: string;
  currency: string;
  candles: Candle[];
};

export type StockProfile = LiveQuote & {
  sector: string | null;
  industry: string | null;
  website: string | null;
  longBusinessSummary: string | null;
  employees: number | null;
  marketCap: number | null;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  beta: number | null;
  bookValue: number | null;
  priceToBook: number | null;
};

export type NewsItem = {
  id: string | number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  publishedAt: number;
};

export type SearchHit = {
  symbol: string;
  yahooSymbol: string;
  name: string;
  exchange: string;
  type: string;
};

export type Timeframe = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y" | "MAX";

export const TIMEFRAMES: Timeframe[] = ["1D", "5D", "1M", "6M", "1Y", "5Y"];

export const fetchQuote = (symbol: string) =>
  fetcher<{ quote: LiveQuote }>(
    `/api/markets/quote/${encodeURIComponent(symbol)}`
  ).then((r) => r.quote);

export const fetchQuotes = (symbols: string[]) =>
  fetcher<{ quotes: LiveQuote[] }>(
    `/api/markets/quotes?symbols=${encodeURIComponent(symbols.join(","))}`
  ).then((r) => r.quotes);

export const fetchCandles = (symbol: string, range: Timeframe = "1D") =>
  fetcher<CandleSeries>(
    `/api/markets/candles/${encodeURIComponent(symbol)}?range=${range}`
  );

export const fetchProfile = (symbol: string) =>
  fetcher<{ profile: StockProfile }>(
    `/api/markets/profile/${encodeURIComponent(symbol)}`
  ).then((r) => r.profile);

export const fetchNews = (symbol: string) =>
  fetcher<{ items: NewsItem[] }>(
    `/api/markets/news/${encodeURIComponent(symbol)}`
  ).then((r) => r.items);

export const searchSymbols = (q: string) =>
  fetcher<{ items: SearchHit[] }>(
    `/api/markets/search?q=${encodeURIComponent(q)}`
  ).then((r) => r.items);

/* ---------- formatting helpers ---------- */

export const isIndex = (symbol: string, exchange?: string | null) => {
  if (exchange === "INDEX") return true;
  const s = symbol.toUpperCase();
  return s.includes("NIFTY") || s.includes("SENSEX") || s.includes("VIX");
};

export const fmtPrice = (n: number | null | undefined, cur = "INR", hideCurrency = false) => {
  if (n == null || !isFinite(n)) return "—";
  if (cur === "INR") {
    const formatted = n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return hideCurrency ? formatted : "₹" + formatted;
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: cur || "USD"
  });
};

export const fmtCompactINR = (n: number | null | undefined) => {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(2)} K`;
  return `₹${n.toFixed(0)}`;
};

export const fmtCompactNum = (n: number | null | undefined) => {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
  return String(Math.round(n));
};

export const fmtPct = (n: number | null | undefined) => {
  if (n == null || !isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
};

/** Convert candle timeseries into a simple [number, number] array for our
 *  inline SVG line chart (x = unix-ms, y = close). */
export const closeSeries = (series: CandleSeries): Array<[number, number]> =>
  series.candles
    .filter((c) => c.c != null)
    .map((c) => [c.t, c.c as number]);

/**
 * Browser WebSocket base URL for live price ticks.
 *
 * The old code derived this from NEXT_PUBLIC_API_BASE, which is not set (only
 * the server-side API_BASE is), so it fell back to :4000 while the backend WS
 * actually runs on :4001 — the socket never connected and prices only updated
 * on a manual refresh. This resolves it correctly in every environment:
 *   1. An explicit NEXT_PUBLIC_WS_URL wins (set per deploy).
 *   2. On localhost dev, the backend WS is on :4001.
 *   3. In production, the socket rides the same host over wss:// (nginx proxies
 *      the upgrade to the backend).
 */
export function wsBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit;
  if (typeof window !== "undefined") {
    const secure = window.location.protocol === "https:";
    const proto = secure ? "wss:" : "ws:";
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `${proto}//${host}:4001`;
    }
    return `${proto}//${window.location.host}`;
  }
  return "ws://127.0.0.1:4001";
}

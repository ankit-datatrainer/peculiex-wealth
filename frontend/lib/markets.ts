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
 * Resolution order:
 *   1. An explicit NEXT_PUBLIC_WS_URL wins (set per deploy).
 *   2. On localhost dev, the browser talks to the backend directly on :4001.
 *   3. In production the socket rides the same origin on the /ws path.
 *
 * Why /ws and not the bare origin: in production the browser only ever reaches
 * Next.js (port 3001), and REST works because next.config rewrites proxy
 * /api/* to the backend. Next rewrites do NOT proxy WebSocket upgrades, so a
 * socket opened against the bare origin lands on Next, which has no WS handler,
 * and dies — prices looked frozen in production while working locally. The /ws
 * path exists so nginx can proxy the upgrade straight to the backend (:4001),
 * bypassing Next entirely. Requires the matching nginx location block:
 *
 *   location /ws {
 *     proxy_pass http://127.0.0.1:4001;
 *     proxy_http_version 1.1;
 *     proxy_set_header Upgrade $http_upgrade;
 *     proxy_set_header Connection "upgrade";
 *     proxy_set_header Host $host;
 *     proxy_read_timeout 3600s;
 *   }
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
    return `${proto}//${window.location.host}/ws`;
  }
  return "ws://127.0.0.1:4001";
}

/**
 * Live price ticks for a set of symbols, with a polling safety net.
 *
 * Prefers the WebSocket (sub-second push, ~2s ticks). If the socket can't be
 * established — most commonly because the reverse proxy in front of the app
 * isn't forwarding the upgrade, which silently froze prices in production
 * while they worked locally — it degrades to polling the REST quotes endpoint,
 * which is proxied normally. That way prices always move, and the socket is a
 * fast path rather than a single point of failure.
 *
 * Returns an unsubscribe function.
 */
export function subscribeTicks(
  symbols: string[],
  onTick: (q: Partial<LiveQuote> & { symbol: string }) => void,
  opts?: { pollMs?: number; connectTimeoutMs?: number }
): () => void {
  const pollMs = opts?.pollMs ?? 5000;
  const connectTimeoutMs = opts?.connectTimeoutMs ?? 4000;

  let ws: WebSocket | null = null;
  let pollTimer: number | null = null;
  let connectTimer: number | null = null;
  let opened = false;
  let killed = false;

  const startPolling = () => {
    if (killed || pollTimer != null || !symbols.length) return;
    const run = () => {
      fetchQuotes(symbols)
        .then((quotes) => {
          if (killed || !quotes) return;
          quotes.forEach((q) => q && q.symbol && onTick(q));
        })
        .catch(() => {});
    };
    run();
    pollTimer = window.setInterval(run, pollMs);
  };

  if (typeof window === "undefined" || !symbols.length) return () => {};

  try {
    ws = new WebSocket(wsBaseUrl());

    // If the upgrade never completes, stop waiting and fall back.
    connectTimer = window.setTimeout(() => {
      if (!opened && !killed) {
        try {
          ws?.close();
        } catch {}
        startPolling();
      }
    }, connectTimeoutMs);

    ws.onopen = () => {
      opened = true;
      if (connectTimer) window.clearTimeout(connectTimer);
      ws?.send(JSON.stringify({ action: "subscribe", symbols }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type !== "PRICE_TICK" || !msg.payload) return;
        const p = msg.payload;
        if (!p.symbol) return;
        onTick({
          ...p,
          price: p.price ?? p.c,
          change: p.change ?? p.d,
          changePercent: p.changePercent ?? p.dp
        });
      } catch {}
    };

    ws.onerror = () => {
      if (!opened && !killed) startPolling();
    };

    ws.onclose = () => {
      // Covers both "never connected" and "dropped mid-session".
      if (!killed) startPolling();
    };
  } catch {
    startPolling();
  }

  return () => {
    killed = true;
    if (connectTimer) window.clearTimeout(connectTimer);
    if (pollTimer) window.clearInterval(pollTimer);
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "unsubscribe", symbols }));
        }
        ws.close();
      } catch {}
    }
  };
}

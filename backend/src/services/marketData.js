"use strict";

/**
 * marketData — single source of truth for live equity prices.
 *
 * Primary source:  Yahoo Finance (free, unauthenticated, supports NSE/BSE)
 * Secondary:       Finnhub (uses FINNHUB_API_KEY) — used for company news.
 *                  Finnhub free tier does NOT cover Indian exchanges.
 *
 * All Yahoo + Finnhub responses are cached in-memory with a per-resource
 * TTL so we stay well under any rate limits and respond instantly to
 * frontend polling.
 *
 * Symbols accepted by the public helpers can be either:
 *   - Plain Indian ticker: "RELIANCE", "TCS", "HDFCBANK"
 *     (auto-suffixed with .NS when calling Yahoo)
 *   - Already-suffixed:    "RELIANCE.NS", "TCS.BO"
 *   - Index alias:         "NIFTY", "SENSEX", "BANKNIFTY", "VIX"
 *   - Yahoo special:       "^NSEI", "USDINR=X", "BTC-INR" — passed through
 */

const { broadcast, getActiveSymbols } = require("../wsServer");
const fs = require("fs");
const path = require("path");
const { fyersDataSocket } = require("fyers-api-v3");

function toFyersSym(sym) {
  if (sym.endsWith(".NS")) return `NSE:${sym.replace(".NS", "")}-EQ`;
  if (sym.endsWith(".BO")) return `BSE:${sym.replace(".BO", "")}-EQ`;
  if (sym === "^NSEI") return "NSE:NIFTY50-INDEX";
  if (sym === "^BSESN") return "BSE:SENSEX-INDEX";
  if (sym === "^NSEBANK") return "NSE:NIFTYBANK-INDEX";
  if (sym === "^INDIAVIX") return "NSE:INDIAVIX-INDEX";
  return sym;
}

function fromFyersSym(sym) {
  if (sym.startsWith("NSE:") && sym.endsWith("-EQ")) return sym.replace("NSE:", "").replace("-EQ", ".NS");
  if (sym.startsWith("BSE:") && sym.endsWith("-EQ")) return sym.replace("BSE:", "").replace("-EQ", ".BO");
  if (sym === "NSE:NIFTY50-INDEX") return "^NSEI";
  if (sym === "BSE:SENSEX-INDEX") return "^BSESN";
  if (sym === "NSE:NIFTYBANK-INDEX") return "^NSEBANK";
  if (sym === "NSE:INDIAVIX-INDEX") return "^INDIAVIX";
  return sym;
}

const { fyersModel } = require("fyers-api-v3");

function getFyersClient() {
  const token = getFyersToken();
  const appId = process.env.FYERS_APP_ID || "K7S38ZHV3L-100";
  if (!token) return null;
  const fyers = new fyersModel();
  fyers.setAppId(appId);
  fyers.setAccessToken(token);
  return fyers;
}

function getFyersToken() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "../../fyers_token.json"), "utf8");
    return JSON.parse(data).access_token;
  } catch (e) {
    return null;
  }
}

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";
const NEWSDATA_KEY = process.env.NEWSDATA_API_KEY || "pub_3a794af7ae564aea9a6602aa49403d20";
const GROWW_API_KEY = process.env.GROWW_API_KEY || "";
const GROWW_API_SECRET = process.env.GROWW_API_SECRET || "";

const YAHOO_BASE = "https://query1.finance.yahoo.com";
const YAHOO_BASE_ALT = "https://query2.finance.yahoo.com";
const FINNHUB_BASE = "https://finnhub.io/api/v1";
const NEWSDATA_BASE = "https://newsdata.io/api/1";
const GROWW_BASE = "https://api.groww.in/v1";

// Browser-like UA — Yahoo blocks default node fetch UA on some endpoints.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

/* ---------- in-memory TTL cache ---------- */

const cache = new Map();

function cacheGet(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) {
    cache.delete(key);
    return null;
  }
  return e.value;
}

function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, exp: Date.now() + ttlMs });
}

function generateSlug(headline) {
  if (!headline) return "article-" + Math.random().toString(36).substring(2, 8);
  const clean = headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const hash = Math.random().toString(36).substring(2, 7);
  return `${clean}-${hash}`;
}

function getArticleUrlBySlug(slug) {
  return cacheGet(`news_slug:${slug}`);
}

/* ---------- symbol normalization ---------- */

const INDEX_ALIASES = {
  NIFTY: "^NSEI",
  "NIFTY 50": "^NSEI",
  NIFTY50: "^NSEI",
  SENSEX: "^BSESN",
  BANKNIFTY: "^NSEBANK",
  "BANK NIFTY": "^NSEBANK",
  "INDIA VIX": "^INDIAVIX",
  VIX: "^INDIAVIX",
  NASDAQ: "^IXIC",
  USDINR: "USDINR=X",
  BRENT: "BZ=F",
  "GOLD MCX": "GC=F",
  GOLD: "GC=F",
  "SILVER MCX": "SI=F",
  SILVER: "SI=F",
  "BTC/INR": "BTC-INR",
  BTC: "BTC-INR"
};

/**
 * Convert a user-friendly symbol into a Yahoo-compatible one.
 * "RELIANCE"   -> "RELIANCE.NS"
 * "RELIANCE.NS" -> "RELIANCE.NS"
 * "NIFTY"      -> "^NSEI"
 * "^NSEI"      -> "^NSEI"
 */
function toYahoo(symbol) {
  if (!symbol) return "";
  const raw = String(symbol).trim();
  const upper = raw.toUpperCase();
  if (INDEX_ALIASES[upper]) return INDEX_ALIASES[upper];
  // Already a special / suffixed symbol
  if (raw.startsWith("^") || raw.includes(".") || raw.includes("=") || raw.includes("-")) {
    return raw;
  }
  // Plain Indian ticker — assume NSE
  return `${upper}.NS`;
}

/** Drop ".NS"/".BO" so we can show clean labels in the UI. */
function displaySymbol(yahooSymbol) {
  if (!yahooSymbol) return "";
  if (yahooSymbol.startsWith("^")) {
    const map = {
      "^NSEI": "NIFTY 50",
      "^BSESN": "SENSEX",
      "^NSEBANK": "BANK NIFTY",
      "^INDIAVIX": "INDIA VIX",
      "^IXIC": "NASDAQ"
    };
    return map[yahooSymbol] || yahooSymbol;
  }
  return yahooSymbol.replace(/\.(NS|BO)$/i, "");
}

function exchangeFor(yahooSymbol) {
  if (!yahooSymbol) return "";
  if (/\.NS$/i.test(yahooSymbol)) return "NSE";
  if (/\.BO$/i.test(yahooSymbol)) return "BSE";
  if (yahooSymbol.startsWith("^")) return "INDEX";
  if (yahooSymbol.includes("=X")) return "FX";
  if (yahooSymbol.includes("=F")) return "FUT";
  if (yahooSymbol.includes("-")) return "CRYPTO";
  return "";
}

/* ---------- HTTP helper ---------- */

async function getJSON(url) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,*/*"
    }
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    const err = new Error(`Upstream ${r.status} for ${url}: ${text.slice(0, 160)}`);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

/* ---------- Yahoo crumb auth ----------
 * Yahoo's quoteSummary endpoint started requiring a CSRF "crumb" in 2024.
 * Flow: prime fc.yahoo.com to get an A1 cookie, then exchange it for a
 * crumb. The crumb is appended (?crumb=...) to every quoteSummary call.
 * Cached for an hour; on any failure we silently degrade to no crumb so
 * the rest of the service stays available.
 */

let crumbCache = null;

async function getCrumb() {
  if (crumbCache && Date.now() < crumbCache.exp) {
    return { crumb: crumbCache.crumb, cookie: crumbCache.cookie };
  }
  try {
    const r1 = await fetch("https://fc.yahoo.com/", {
      headers: { "User-Agent": UA }
    });
    const setCookie = r1.headers.get("set-cookie") || "";
    const cookie = setCookie
      .split(",")
      .map((c) => c.split(";")[0].trim())
      .filter(Boolean)
      .join("; ");
    if (!cookie) return null;

    const r2 = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: cookie, Accept: "text/plain" }
    });
    if (!r2.ok) return null;
    const crumb = (await r2.text()).trim();
    if (!crumb) return null;

    crumbCache = { crumb, cookie, exp: Date.now() + 60 * 60_000 };
    return { crumb, cookie };
  } catch (e) {
    console.warn("[markets] crumb fetch failed:", e.message);
    return null;
  }
}

async function getJSONWithCrumb(url) {
  const cc = await getCrumb();
  const sep = url.includes("?") ? "&" : "?";
  const finalUrl = cc?.crumb
    ? `${url}${sep}crumb=${encodeURIComponent(cc.crumb)}`
    : url;
  const r = await fetch(finalUrl, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,*/*",
      ...(cc?.cookie ? { Cookie: cc.cookie } : {})
    }
  });
  if (!r.ok) {
    if (r.status === 401) crumbCache = null; // refresh next time
    const text = await r.text().catch(() => "");
    const err = new Error(`Upstream ${r.status} for ${finalUrl}: ${text.slice(0, 160)}`);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

/* ---------- Yahoo: single quote + chart helpers ---------- */

/**
 * Fetch a quote via the chart endpoint (most reliable, no auth).
 * Returns a normalized shape we control.
 */
async function fetchYahooChart(symbol, { interval = "1d", range = "5d" } = {}) {
  const url =
    `${YAHOO_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=${interval}&range=${range}&includePrePost=false`;
  const j = await getJSON(url);
  const result = j?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${symbol}`);
  return result;
}

function quoteFromChart(chart) {
  const meta = chart.meta || {};
  const ts = chart.timestamp || [];
  const closes = chart.indicators?.quote?.[0]?.close || [];
  // Last non-null close as fallback if regularMarketPrice is missing
  let last = meta.regularMarketPrice;
  if (last == null) {
    for (let i = closes.length - 1; i >= 0; i--) {
      if (closes[i] != null) {
        last = closes[i];
        break;
      }
    }
  }
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const change = prev != null && last != null ? last - prev : null;
  const changePct = prev ? (change / prev) * 100 : null;

  return {
    symbol: displaySymbol(meta.symbol),
    yahooSymbol: meta.symbol,
    name: meta.longName || meta.shortName || displaySymbol(meta.symbol),
    exchange: exchangeFor(meta.symbol) || meta.fullExchangeName || meta.exchangeName || "",
    currency: meta.currency || "INR",
    price: last != null ? +Number(last).toFixed(2) : null,
    previousClose: prev != null ? +Number(prev).toFixed(2) : null,
    change: change != null ? +Number(change).toFixed(2) : null,
    changePercent: changePct != null ? +Number(changePct).toFixed(2) : null,
    dayHigh: meta.regularMarketDayHigh ?? null,
    dayLow: meta.regularMarketDayLow ?? null,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    volume: meta.regularMarketVolume ?? null,
    marketState: meta.marketState || null,
    asOf: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
    timestamps: ts,
    closes
  };
}

/* ---------- public: getQuote ---------- */

async function getQuote(symbol) {
  const ys = toYahoo(symbol);
  if (!ys) throw new Error("symbol required");
  const key = `quote:${ys}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const chart = await fetchYahooChart(ys, { interval: "5m", range: "1d" });
  const q = quoteFromChart(chart);
  // Drop the heavy timestamp/closes arrays from the cached short-form quote.
  // Detail page uses dedicated /candles endpoint instead.
  const slim = { ...q };
  delete slim.timestamps;
  delete slim.closes;
  cacheSet(key, slim, 30_000); // 30s — feels live, kind to upstream
  return slim;
}

async function getQuotesBatchFyers(ysSymbols) {
  try {
    const fyers = getFyersClient();
    if (!fyers) return null;

    const fyersSymbols = ysSymbols.map(toFyersSym);
    const res = await fyers.getQuotes(fyersSymbols);

    if (res && res.s === "ok" && Array.isArray(res.d)) {
      const map = new Map();
      for (const item of res.d) {
        if (item.s !== "ok") continue;
        const q = item.v;
        const ys = fromFyersSym(item.n);
        const prev = q.prev_close_price;
        const last = q.lp;
        const change = q.ch;
        const changePct = q.chp;

        const slim = {
          symbol: displaySymbol(ys),
          yahooSymbol: ys,
          name: q.short_name || displaySymbol(ys),
          exchange: q.exchange || "NSE",
          currency: "INR",
          price: last != null ? +Number(last).toFixed(2) : null,
          previousClose: prev != null ? +Number(prev).toFixed(2) : null,
          change: change != null ? +Number(change).toFixed(2) : null,
          changePercent: changePct != null ? +Number(changePct).toFixed(2) : null,
          dayHigh: q.high_price ?? null,
          dayLow: q.low_price ?? null,
          volume: q.volume ?? null,
          asOf: q.tt ? q.tt * 1000 : Date.now()
        };
        cacheSet(`quote:${ys}`, slim, 30_000);
        map.set(ys, slim);
      }
      return map;
    }
    return null;
  } catch (e) {
    console.warn("[markets] Fyers batch quote failed:", e.message);
    return null;
  }
}

/* ---------- Groww Trade API ---------- */

let growwAccessToken = null;
let growwTokenExpires = 0;

async function getGrowwAuthToken() {
  if (growwAccessToken && Date.now() < growwTokenExpires) {
    return growwAccessToken;
  }
  // Exchanging API Key & Secret for an access token
  try {
    const res = await fetch(`${GROWW_BASE}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: GROWW_API_KEY,
        apiSecret: GROWW_API_SECRET
      })
    });
    if (!res.ok) throw new Error("Groww Auth Failed");
    const data = await res.json();
    growwAccessToken = data.access_token;
    growwTokenExpires = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
    return growwAccessToken;
  } catch (err) {
    console.warn("[markets] Groww Auth failed, will fallback to Yahoo:", err.message);
    return null;
  }
}

async function getQuotesBatchGroww(symbols) {
  if (!GROWW_API_KEY) return null;
  const token = await getGrowwAuthToken();
  if (!token) return null;

  // Groww usually expects plain symbols (RELIANCE) without .NS
  const growwSymbols = symbols.map(s => s.replace(/\.NS$/, ''));
  try {
    const res = await fetch(`${GROWW_BASE}/market/quotes?symbols=${growwSymbols.join(",")}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      // Very short timeout so we fallback to Yahoo quickly if it hangs due to IP block
      signal: AbortSignal.timeout(3000) 
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    // Assuming data format: { data: [ { symbol, ltp, close, ... } ] }
    const map = new Map();
    if (data && Array.isArray(data.data)) {
      data.data.forEach(q => {
        // Map back to yahoo symbol for internal tracking
        const ys = toYahoo(q.symbol);
        const price = q.ltp || q.lastPrice || 0;
        const prev = q.close || q.previousClose || price;
        const change = price - prev;
        const changePercent = prev ? (change / prev) * 100 : 0;
        
        map.set(ys, {
          symbol: q.symbol,
          yahooSymbol: ys,
          exchange: "NSE",
          price,
          change,
          changePercent,
          previousClose: prev
        });
      });
      return map;
    }
    return null;
  } catch (err) {
    console.warn("[markets] Groww Quote fetch failed, will fallback to Yahoo:", err.message);
    return null;
  }
}

/* ---------- public: getQuotes (batched) ---------- */

async function getQuotes(symbols) {
  const list = (Array.isArray(symbols) ? symbols : [symbols])
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean);
  if (!list.length) return [];

  // De-dupe by Yahoo symbol
  const seen = new Map();
  list.forEach((s) => {
    const ys = toYahoo(s);
    if (!seen.has(ys)) seen.set(ys, s);
  });
  const ysSymbols = Array.from(seen.keys());

  // Attempt Groww first if configured
  if (GROWW_API_KEY) {
    const growwMap = await getQuotesBatchGroww(ysSymbols);
    if (growwMap && growwMap.size > 0) {
      console.log(`[markets] Served ${growwMap.size} quotes from Groww API`);
      return ysSymbols.map((ys) => growwMap.get(ys) || null).filter(Boolean);
    }
  }

  // Fallback to Fyers
  const fyersMap = await getQuotesBatchFyers(ysSymbols);
  if (fyersMap) {
    return ysSymbols.map((ys) => fyersMap.get(ys) || null).filter(Boolean);
  }

  // Run in parallel; failures become null entries we filter later.
  const settled = await Promise.allSettled(ysSymbols.map((ys) => getQuote(ys)));
  return settled
    .map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      console.warn(`[markets] quote failed for ${ysSymbols[i]}:`, r.reason?.message);
      return null;
    })
    .filter(Boolean);
}

/* ---------- public: getCandles ---------- */

const RANGE_PRESETS_FYERS = {
  "1D": { resolution: "5", range: 1 },
  "5D": { resolution: "15", range: 5 },
  "1M": { resolution: "D", range: 30 },
  "6M": { resolution: "D", range: 180 },
  "1Y": { resolution: "D", range: 365 },
  "5Y": { resolution: "W", range: 365 * 5 },
  MAX: { resolution: "M", range: 365 * 10 }
};

async function getCandles(symbol, rangeKey = "1D") {
  const ys = toYahoo(symbol);
  const fyersSym = toFyersSym(ys);
  const preset = RANGE_PRESETS_FYERS[String(rangeKey).toUpperCase()] || RANGE_PRESETS_FYERS["1D"];
  const key = `candles:${ys}:${preset.resolution}:${preset.range}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  try {
    const fyers = getFyersClient();
    if (!fyers) throw new Error("Fyers not configured");

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - preset.range);

    const history = await fyers.getHistory({
      symbol: fyersSym,
      resolution: preset.resolution,
      date_format: "1",
      range_from: start.toISOString().split('T')[0],
      range_to: end.toISOString().split('T')[0],
      cont_flag: "1"
    });

    if (history && history.s === "ok" && history.candles) {
      const out = {
        symbol: displaySymbol(ys),
        yahooSymbol: ys,
        range: rangeKey.toUpperCase(),
        interval: preset.resolution,
        currency: "INR",
        candles: history.candles.map(c => ({
          t: c[0] * 1000,
          o: c[1],
          h: c[2],
          l: c[3],
          c: c[4],
          v: c[5]
        }))
      };

      const ttl = preset.range <= 5 ? 60_000 : 5 * 60_000;
      cacheSet(key, out, ttl);
      return out;
    }
  } catch (e) {
    console.warn(`[markets] Fyers chart failed for ${ys}:`, e.message);
  }

  // Fallback to minimal cached quote if history fails
  return {
    symbol: displaySymbol(ys),
    yahooSymbol: ys,
    range: rangeKey.toUpperCase(),
    interval: "1d",
    currency: "INR",
    candles: []
  };
}

/* ---------- public: getProfile ---------- */

async function getProfile(symbol) {
  const ys = toYahoo(symbol);
  const key = `profile:${ys}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  // quoteSummary is the richest Yahoo endpoint (assetProfile, summaryDetail, price).
  // Yahoo requires a CSRF crumb here — getJSONWithCrumb handles it.
  const url =
    `${YAHOO_BASE_ALT}/v10/finance/quoteSummary/${encodeURIComponent(ys)}` +
    `?modules=assetProfile,summaryDetail,price,defaultKeyStatistics,summaryProfile`;
  let summary = null;
  try {
    const j = await getJSONWithCrumb(url);
    summary = j?.quoteSummary?.result?.[0] || null;
  } catch (e) {
    // Non-fatal: profile still gets price/52w via the quote layer below.
    console.warn(`[markets] quoteSummary failed for ${ys}:`, e.message);
  }

  // Always layer the quote so the profile has price even if summary fails
  const quote = await getQuote(ys);

  const profile = {
    ...quote,
    sector: summary?.assetProfile?.sector || summary?.summaryProfile?.sector || null,
    industry: summary?.assetProfile?.industry || summary?.summaryProfile?.industry || null,
    website: summary?.assetProfile?.website || summary?.summaryProfile?.website || null,
    longBusinessSummary:
      summary?.assetProfile?.longBusinessSummary ||
      summary?.summaryProfile?.longBusinessSummary ||
      null,
    employees:
      summary?.assetProfile?.fullTimeEmployees ||
      summary?.summaryProfile?.fullTimeEmployees ||
      null,
    marketCap: summary?.summaryDetail?.marketCap?.raw ?? summary?.price?.marketCap?.raw ?? null,
    peRatio: summary?.summaryDetail?.trailingPE?.raw ?? null,
    eps: summary?.defaultKeyStatistics?.trailingEps?.raw ?? null,
    dividendYield: summary?.summaryDetail?.dividendYield?.raw ?? null,
    beta: summary?.defaultKeyStatistics?.beta?.raw ?? null,
    bookValue: summary?.defaultKeyStatistics?.bookValue?.raw ?? null,
    priceToBook: summary?.defaultKeyStatistics?.priceToBook?.raw ?? null
  };

  cacheSet(key, profile, 10 * 60_000); // 10 min
  return profile;
}

/* ---------- public: search ---------- */

async function search(query) {
  const q = String(query || "").trim();
  if (!q) return [];
  const key = `search:${q.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `${YAHOO_BASE}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`;
  let results = [];
  try {
    const j = await getJSON(url);
    results = (j?.quotes || [])
      .filter((x) => x.symbol && (x.shortname || x.longname))
      .map((x) => ({
        symbol: displaySymbol(x.symbol),
        yahooSymbol: x.symbol,
        name: x.longname || x.shortname,
        exchange: x.exchange || x.exchDisp || "",
        type: x.quoteType || ""
      }));
  } catch (e) {
    console.warn("[markets] search failed:", e.message);
  }
  cacheSet(key, results, 5 * 60_000);
  return results;
}

/* ---------- public: getNews (Finnhub) ---------- */

async function getNews(symbol) {
  if (!FINNHUB_KEY) return []; // graceful: no key, no news
  // Finnhub uses the bare ticker for US stocks. For Indian stocks the
  // company-news endpoint won't work on the free tier, so we fall back to
  // general market news so the UI still shows something useful.
  const ys = toYahoo(symbol);
  const isIndian = /\.(NS|BO)$/i.test(ys);
  const key = `news:${ys}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  let url;
  if (isIndian) {
    url = `${FINNHUB_BASE}/news?category=general&token=${FINNHUB_KEY}`;
  } else {
    const today = new Date();
    const from = new Date(today.getTime() - 14 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const to = today.toISOString().slice(0, 10);
    const finSym = ys.split(".")[0];
    url = `${FINNHUB_BASE}/company-news?symbol=${finSym}&from=${from}&to=${to}&token=${FINNHUB_KEY}`;
  }

  let items = [];
  try {
    const j = await getJSON(url);
    items = (Array.isArray(j) ? j : [])
      .slice(0, 10)
      .map((n) => {
        const slug = generateSlug(n.headline);
        cacheSet(`news_slug:${slug}`, n.url, 24 * 60 * 60_000); // 24h cache for the url
        return {
          id: n.id,
          slug,
          headline: n.headline,
          summary: n.summary,
          source: n.source,
          url: n.url,
          image: n.image,
          publishedAt: (n.datetime || 0) * 1000
        };
      });
  } catch (e) {
    console.warn("[markets] news failed:", e.message);
  }
  cacheSet(key, items, 5 * 60_000);
  return items;
}

let globalNewsArchive = [];

/* ---------- public: getGeneralNews (NewsData.io -> JSON) ---------- */

async function getGeneralNews() {
  const key = "markets_general_news";
  const cached = cacheGet(key);
  if (cached) return cached;

  let newItems = [];
  try {
    const url = `${NEWSDATA_BASE}/latest?apikey=${NEWSDATA_KEY}&category=business&country=in&language=en`;
    const data = await getJSON(url);

    if (data.status === "success" && data.results) {
      newItems = data.results.map((n) => {
        const title = n.title || "";
        const slug = generateSlug(title);
        cacheSet(`news_slug:${slug}`, n.link, 24 * 60 * 60_000);
        
        const publishedAt = n.pubDate ? new Date(n.pubDate).getTime() : Date.now();

        return {
          id: n.article_id || n.link || slug,
          slug,
          headline: title,
          summary: n.description || "",
          source: n.source_id || "NewsData",
          url: n.link,
          image: n.image_url || "",
          publishedAt: isNaN(publishedAt) ? Date.now() : publishedAt
        };
      });
    } else {
      console.warn("[markets] NewsData API error or missing results:", data);
    }
  } catch (e) {
    console.warn("[markets] general news failed:", e.message);
  }
  
  // Merge new items into global archive
  const combined = [...newItems, ...globalNewsArchive];
  
  // Deduplicate by id
  const unique = new Map();
  combined.forEach(item => {
    if (!unique.has(item.id)) {
      unique.set(item.id, item);
    }
  });

  // Sort and limit to top 500
  globalNewsArchive = Array.from(unique.values())
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 500);
  
  // Cache for 30 minutes to guarantee we stay well under the 200 req/day limit 
  // 30 mins = 2 reqs/hr = 48 reqs/day
  cacheSet(key, globalNewsArchive, 30 * 60_000); 
  return globalNewsArchive;
}

/* ---------- Fallback NSE symbol list (used when no Finnhub key) ---------- */

const FALLBACK_NSE_SYMBOLS = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", currency: "INR" },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd", currency: "INR" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", currency: "INR" },
  { symbol: "INFY", name: "Infosys Ltd", currency: "INR" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", currency: "INR" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", currency: "INR" },
  { symbol: "LT", name: "Larsen & Toubro Ltd", currency: "INR" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", currency: "INR" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", currency: "INR" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", currency: "INR" },
  { symbol: "ITC", name: "ITC Ltd", currency: "INR" },
  { symbol: "SBIN", name: "State Bank of India", currency: "INR" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", currency: "INR" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", currency: "INR" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", currency: "INR" },
  { symbol: "WIPRO", name: "Wipro Ltd", currency: "INR" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd", currency: "INR" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd", currency: "INR" },
  { symbol: "TITAN", name: "Titan Company Ltd", currency: "INR" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd", currency: "INR" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd", currency: "INR" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", currency: "INR" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", currency: "INR" },
  { symbol: "POWERGRID", name: "Power Grid Corporation of India Ltd", currency: "INR" },
  { symbol: "NTPC", name: "NTPC Ltd", currency: "INR" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd", currency: "INR" },
  { symbol: "COALINDIA", name: "Coal India Ltd", currency: "INR" },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd", currency: "INR" },
  { symbol: "ADANIPORTS", name: "Adani Ports & Special Economic Zone Ltd", currency: "INR" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd", currency: "INR" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd", currency: "INR" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", currency: "INR" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd", currency: "INR" },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd", currency: "INR" },
  { symbol: "GRASIM", name: "Grasim Industries Ltd", currency: "INR" },
  { symbol: "CIPLA", name: "Cipla Ltd", currency: "INR" },
  { symbol: "DRREDDY", name: "Dr Reddys Laboratories Ltd", currency: "INR" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd", currency: "INR" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd", currency: "INR" },
  { symbol: "DIVISLAB", name: "Divis Laboratories Ltd", currency: "INR" },
  { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd", currency: "INR" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", currency: "INR" },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd", currency: "INR" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd", currency: "INR" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", currency: "INR" },
  { symbol: "LTIM", name: "LTIMindtree Ltd", currency: "INR" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd", currency: "INR" },
  { symbol: "SBILIFE", name: "SBI Life Insurance Company Ltd", currency: "INR" },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd", currency: "INR" },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd", currency: "INR" },
  { symbol: "VEDL", name: "Vedanta Ltd", currency: "INR" },
  { symbol: "TRENT", name: "Trent Ltd", currency: "INR" },
  { symbol: "ZOMATO", name: "Zomato Ltd", currency: "INR" },
  { symbol: "PAYTM", name: "One97 Communications Ltd", currency: "INR" },
  { symbol: "NYKAA", name: "FSN E-Commerce Ventures Ltd", currency: "INR" },
  { symbol: "DMART", name: "Avenue Supermarts Ltd", currency: "INR" },
  { symbol: "PIDILITIND", name: "Pidilite Industries Ltd", currency: "INR" },
  { symbol: "SIEMENS", name: "Siemens Ltd", currency: "INR" },
  { symbol: "HAVELLS", name: "Havells India Ltd", currency: "INR" },
  { symbol: "GODREJCP", name: "Godrej Consumer Products Ltd", currency: "INR" },
  { symbol: "DABUR", name: "Dabur India Ltd", currency: "INR" },
  { symbol: "MARICO", name: "Marico Ltd", currency: "INR" },
  { symbol: "BERGEPAINT", name: "Berger Paints India Ltd", currency: "INR" },
  { symbol: "COLPAL", name: "Colgate-Palmolive India Ltd", currency: "INR" },
  { symbol: "BANKBARODA", name: "Bank of Baroda", currency: "INR" },
  { symbol: "PNB", name: "Punjab National Bank", currency: "INR" },
  { symbol: "CANBK", name: "Canara Bank", currency: "INR" },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd", currency: "INR" },
  { symbol: "FEDERALBNK", name: "Federal Bank Ltd", currency: "INR" },
  { symbol: "BANDHANBNK", name: "Bandhan Bank Ltd", currency: "INR" },
  { symbol: "AUBANK", name: "AU Small Finance Bank Ltd", currency: "INR" },
  { symbol: "CHOLAFIN", name: "Cholamandalam Investment & Finance Co Ltd", currency: "INR" },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd", currency: "INR" },
  { symbol: "MANAPPURAM", name: "Manappuram Finance Ltd", currency: "INR" },
  { symbol: "LICHSGFIN", name: "LIC Housing Finance Ltd", currency: "INR" },
  { symbol: "RECLTD", name: "REC Ltd", currency: "INR" },
  { symbol: "PFC", name: "Power Finance Corporation Ltd", currency: "INR" },
  { symbol: "IRFC", name: "Indian Railway Finance Corporation Ltd", currency: "INR" },
  { symbol: "IRCTC", name: "Indian Railway Catering & Tourism Corp Ltd", currency: "INR" },
  { symbol: "INDIANB", name: "Indian Bank", currency: "INR" },
  { symbol: "IOC", name: "Indian Oil Corporation Ltd", currency: "INR" },
  { symbol: "GAIL", name: "GAIL India Ltd", currency: "INR" },
  { symbol: "PETRONET", name: "Petronet LNG Ltd", currency: "INR" },
  { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd", currency: "INR" },
  { symbol: "SAIL", name: "Steel Authority of India Ltd", currency: "INR" },
  { symbol: "NMDC", name: "NMDC Ltd", currency: "INR" },
  { symbol: "NATIONALUM", name: "National Aluminium Company Ltd", currency: "INR" },
  { symbol: "BHEL", name: "Bharat Heavy Electricals Ltd", currency: "INR" },
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd", currency: "INR" },
  { symbol: "BEL", name: "Bharat Electronics Ltd", currency: "INR" },
  { symbol: "DIXON", name: "Dixon Technologies India Ltd", currency: "INR" },
  { symbol: "TATAELXSI", name: "Tata Elxsi Ltd", currency: "INR" },
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd", currency: "INR" },
  { symbol: "COFORGE", name: "Coforge Ltd", currency: "INR" },
  { symbol: "MPHASIS", name: "MphasiS Ltd", currency: "INR" },
  { symbol: "LTTS", name: "L&T Technology Services Ltd", currency: "INR" },
  { symbol: "HAPPSTMNDS", name: "Happiest Minds Technologies Ltd", currency: "INR" },
  { symbol: "ZYDUSLIFE", name: "Zydus Lifesciences Ltd", currency: "INR" },
  { symbol: "LUPIN", name: "Lupin Ltd", currency: "INR" },
  { symbol: "AUROPHARMA", name: "Aurobindo Pharma Ltd", currency: "INR" },
  { symbol: "BIOCON", name: "Biocon Ltd", currency: "INR" },
  { symbol: "TORNTPHARM", name: "Torrent Pharmaceuticals Ltd", currency: "INR" },
  { symbol: "ALKEM", name: "Alkem Laboratories Ltd", currency: "INR" },
  { symbol: "IPCALAB", name: "IPCA Laboratories Ltd", currency: "INR" },
  { symbol: "LAURUSLABS", name: "Laurus Labs Ltd", currency: "INR" },
  { symbol: "MAXHEALTH", name: "Max Healthcare Institute Ltd", currency: "INR" },
  { symbol: "FORTIS", name: "Fortis Healthcare Ltd", currency: "INR" },
  { symbol: "METROPOLIS", name: "Metropolis Healthcare Ltd", currency: "INR" },
  { symbol: "LALPATHLAB", name: "Dr Lal PathLabs Ltd", currency: "INR" },
  { symbol: "DLF", name: "DLF Ltd", currency: "INR" },
  { symbol: "GODREJPROP", name: "Godrej Properties Ltd", currency: "INR" },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty Ltd", currency: "INR" },
  { symbol: "PRESTIGE", name: "Prestige Estates Projects Ltd", currency: "INR" },
  { symbol: "LODHA", name: "Macrotech Developers Ltd", currency: "INR" },
  { symbol: "PHOENIXLTD", name: "Phoenix Mills Ltd", currency: "INR" },
  { symbol: "BRIGADE", name: "Brigade Enterprises Ltd", currency: "INR" },
  { symbol: "SOBHA", name: "Sobha Ltd", currency: "INR" },
  { symbol: "VOLTAS", name: "Voltas Ltd", currency: "INR" },
  { symbol: "WHIRLPOOL", name: "Whirlpool of India Ltd", currency: "INR" },
  { symbol: "CROMPTON", name: "Crompton Greaves Consumer Electricals Ltd", currency: "INR" },
  { symbol: "BLUESTARCO", name: "Blue Star Ltd", currency: "INR" },
  { symbol: "POLYCAB", name: "Polycab India Ltd", currency: "INR" },
  { symbol: "KEI", name: "KEI Industries Ltd", currency: "INR" },
  { symbol: "ASTRAL", name: "Astral Ltd", currency: "INR" },
  { symbol: "SUPREMEIND", name: "Supreme Industries Ltd", currency: "INR" },
  { symbol: "AMBUJACEM", name: "Ambuja Cements Ltd", currency: "INR" },
  { symbol: "ACC", name: "ACC Ltd", currency: "INR" },
  { symbol: "SHREECEM", name: "Shree Cement Ltd", currency: "INR" },
  { symbol: "RAMCOCEM", name: "Ramco Cements Ltd", currency: "INR" },
  { symbol: "DALBHARAT", name: "Dalmia Bharat Ltd", currency: "INR" },
  { symbol: "JKCEMENT", name: "JK Cement Ltd", currency: "INR" },
  { symbol: "UPL", name: "UPL Ltd", currency: "INR" },
  { symbol: "PI", name: "PI Industries Ltd", currency: "INR" },
  { symbol: "COROMANDEL", name: "Coromandel International Ltd", currency: "INR" },
  { symbol: "ATUL", name: "Atul Ltd", currency: "INR" },
  { symbol: "SRF", name: "SRF Ltd", currency: "INR" },
  { symbol: "DEEPAKNTR", name: "Deepak Nitrite Ltd", currency: "INR" },
  { symbol: "AARTIIND", name: "Aarti Industries Ltd", currency: "INR" },
  { symbol: "CLEAN", name: "Clean Science & Technology Ltd", currency: "INR" },
  { symbol: "TATAPOWER", name: "Tata Power Company Ltd", currency: "INR" },
  { symbol: "ADANIGREEN", name: "Adani Green Energy Ltd", currency: "INR" },
  { symbol: "NHPC", name: "NHPC Ltd", currency: "INR" },
  { symbol: "SJVN", name: "SJVN Ltd", currency: "INR" },
  { symbol: "TORNTPOWER", name: "Torrent Power Ltd", currency: "INR" },
  { symbol: "CESC", name: "CESC Ltd", currency: "INR" },
  { symbol: "TATACOMM", name: "Tata Communications Ltd", currency: "INR" },
  { symbol: "IDEA", name: "Vodafone Idea Ltd", currency: "INR" },
  { symbol: "INDUSTOWER", name: "Indus Towers Ltd", currency: "INR" },
  { symbol: "MTNL", name: "Mahanagar Telephone Nigam Ltd", currency: "INR" },
  { symbol: "JUBLFOOD", name: "Jubilant Foodworks Ltd", currency: "INR" },
  { symbol: "DEVYANI", name: "Devyani International Ltd", currency: "INR" },
  { symbol: "PAGEIND", name: "Page Industries Ltd", currency: "INR" },
  { symbol: "RELAXO", name: "Relaxo Footwears Ltd", currency: "INR" },
  { symbol: "BATAINDIA", name: "Bata India Ltd", currency: "INR" },
  { symbol: "VBL", name: "Varun Beverages Ltd", currency: "INR" },
  { symbol: "UBL", name: "United Breweries Ltd", currency: "INR" },
  { symbol: "MCDOWELL-N", name: "United Spirits Ltd", currency: "INR" },
  { symbol: "RADICO", name: "Radico Khaitan Ltd", currency: "INR" },
  { symbol: "INDIGO", name: "InterGlobe Aviation Ltd", currency: "INR" },
  { symbol: "CONCOR", name: "Container Corporation of India Ltd", currency: "INR" },
  { symbol: "MOTHERSON", name: "Samvardhana Motherson International Ltd", currency: "INR" },
  { symbol: "BOSCHLTD", name: "Bosch Ltd", currency: "INR" },
  { symbol: "MRF", name: "MRF Ltd", currency: "INR" },
  { symbol: "APOLLOTYRE", name: "Apollo Tyres Ltd", currency: "INR" },
  { symbol: "BALKRISIND", name: "Balkrishna Industries Ltd", currency: "INR" },
  { symbol: "CEATLTD", name: "CEAT Ltd", currency: "INR" },
  { symbol: "ASHOKLEY", name: "Ashok Leyland Ltd", currency: "INR" },
  { symbol: "ESCORTS", name: "Escorts Kubota Ltd", currency: "INR" },
  { symbol: "BHARATFORG", name: "Bharat Forge Ltd", currency: "INR" },
  { symbol: "SONACOMS", name: "Sona BLW Precision Forgings Ltd", currency: "INR" },
  { symbol: "EXIDEIND", name: "Exide Industries Ltd", currency: "INR" },
  { symbol: "AMARAJABAT", name: "Amara Raja Energy & Mobility Ltd", currency: "INR" },
  { symbol: "SOLARINDS", name: "Solar Industries India Ltd", currency: "INR" },
  { symbol: "RVNL", name: "Rail Vikas Nigam Ltd", currency: "INR" },
  { symbol: "IRCON", name: "Ircon International Ltd", currency: "INR" },
  { symbol: "NBCC", name: "NBCC India Ltd", currency: "INR" },
  { symbol: "ENGINERSIN", name: "Engineers India Ltd", currency: "INR" },
  { symbol: "HUDCO", name: "Housing & Urban Development Corp Ltd", currency: "INR" },
  { symbol: "CANFINHOME", name: "Can Fin Homes Ltd", currency: "INR" },
  { symbol: "ICICIGI", name: "ICICI Lombard General Insurance Co Ltd", currency: "INR" },
  { symbol: "ICICIPRULI", name: "ICICI Prudential Life Insurance Co Ltd", currency: "INR" },
  { symbol: "NIACL", name: "New India Assurance Company Ltd", currency: "INR" },
  { symbol: "SBICARD", name: "SBI Cards & Payment Services Ltd", currency: "INR" },
  { symbol: "CDSL", name: "Central Depository Services India Ltd", currency: "INR" },
  { symbol: "BSE", name: "BSE Ltd", currency: "INR" },
  { symbol: "MCX", name: "Multi Commodity Exchange of India Ltd", currency: "INR" },
  { symbol: "CAMS", name: "Computer Age Management Services Ltd", currency: "INR" },
  { symbol: "ANGELONE", name: "Angel One Ltd", currency: "INR" },
  { symbol: "JIOFIN", name: "Jio Financial Services Ltd", currency: "INR" },
  { symbol: "ABCAPITAL", name: "Aditya Birla Capital Ltd", currency: "INR" },
  { symbol: "MFSL", name: "Max Financial Services Ltd", currency: "INR" },
  { symbol: "NAM-INDIA", name: "Nippon Life India Asset Management Ltd", currency: "INR" },
  { symbol: "HDFC", name: "HDFC Ltd", currency: "INR" },
  { symbol: "LICI", name: "Life Insurance Corporation of India", currency: "INR" },
  { symbol: "POLICYBZR", name: "PB Fintech Ltd", currency: "INR" },
  { symbol: "CARTRADE", name: "CarTrade Tech Ltd", currency: "INR" },
  { symbol: "DELHIVERY", name: "Delhivery Ltd", currency: "INR" },
  { symbol: "MAPMYINDIA", name: "CE Info Systems Ltd", currency: "INR" },
  { symbol: "LATENTVIEW", name: "Latent View Analytics Ltd", currency: "INR" },
  { symbol: "ROUTE", name: "ROUTE Mobile Ltd", currency: "INR" },
  { symbol: "KAYNES", name: "Kaynes Technology India Ltd", currency: "INR" },
  { symbol: "AFFLE", name: "Affle India Ltd", currency: "INR" },
  { symbol: "NAZARA", name: "Nazara Technologies Ltd", currency: "INR" },
  { symbol: "RATEGAIN", name: "RateGain Travel Technologies Ltd", currency: "INR" },
  { symbol: "EASEMYTRIP", name: "Easy Trip Planners Ltd", currency: "INR" },
  { symbol: "IIFL", name: "IIFL Finance Ltd", currency: "INR" },
  { symbol: "POONAWALLA", name: "Poonawalla Fincorp Ltd", currency: "INR" },
  { symbol: "JBCHEPHARM", name: "JB Chemicals & Pharmaceuticals Ltd", currency: "INR" },
  { symbol: "GLENMARK", name: "Glenmark Pharmaceuticals Ltd", currency: "INR" },
  { symbol: "NATCOPHARM", name: "Natco Pharma Ltd", currency: "INR" },
  { symbol: "SYNGENE", name: "Syngene International Ltd", currency: "INR" },
  { symbol: "ABFRL", name: "Aditya Birla Fashion & Retail Ltd", currency: "INR" },
  { symbol: "SHOPERSTOP", name: "Shoppers Stop Ltd", currency: "INR" },
  { symbol: "RAYMOND", name: "Raymond Ltd", currency: "INR" },
  { symbol: "PVRINOX", name: "PVR INOX Ltd", currency: "INR" },
  { symbol: "SUNTV", name: "Sun TV Network Ltd", currency: "INR" },
  { symbol: "ZEEL", name: "Zee Entertainment Enterprises Ltd", currency: "INR" },
  { symbol: "NETWORK18", name: "Network18 Media & Investments Ltd", currency: "INR" },
  { symbol: "NAUKRI", name: "Info Edge India Ltd", currency: "INR" },
  { symbol: "INDIAMART", name: "IndiaMART InterMESH Ltd", currency: "INR" },
  { symbol: "JUSTDIAL", name: "Just Dial Ltd", currency: "INR" }
];

/* ---------- public: getAllIndianSymbols (Finnhub) ---------- */

/**
 * Fetch all NSE-listed stock symbols from Finnhub's /stock/symbol endpoint.
 * This works on the free tier. Cached for 24 hours since the symbol list
 * rarely changes. Falls back to a curated list if no API key is set.
 */
async function getAllIndianSymbols() {
  const key = "indian-symbols";
  const cached = cacheGet(key);
  if (cached) return cached;

  let symbols = [];

  if (FINNHUB_KEY) {
    const url = `${FINNHUB_BASE}/stock/symbol?exchange=NS&token=${FINNHUB_KEY}`;
    try {
      const j = await getJSON(url);
      symbols = (Array.isArray(j) ? j : [])
        .filter((s) => s.symbol && s.description && s.type === "Common Stock")
        .map((s) => ({
          symbol: s.symbol.replace(/\.NS$/i, ""),
          name: s.description,
          type: s.type,
          currency: s.currency || "INR"
        }));
    } catch (e) {
      console.warn("[markets] Finnhub symbol fetch failed:", e.message);
    }
  }

  if (!symbols.length) {
    symbols = FALLBACK_NSE_SYMBOLS;
  }

  cacheSet(key, symbols, 24 * 60 * 60_000);
  return symbols;
}

/**
 * Get quotes for a batch of symbols (for gainers/losers).
 * Uses Yahoo Finance. Limits batch size to avoid overwhelming upstream.
 */
async function getBatchQuotes(symbols, batchSize = 20) {
  const results = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((sym) => getQuote(toYahoo(sym)))
    );
    settled.forEach((r) => {
      if (r.status === "fulfilled" && r.value?.price != null) {
        results.push(r.value);
      }
    });
  }
  return results;
}

async function fetchArticleHtml(url) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    }
  });
  if (!r.ok) {
    throw new Error(`Failed to fetch article: ${r.statusText}`);
  }
  return r.text();
}

function parseArticleContent(html, url) {
  // Extract Title
  let title = "";
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Extract Hero Image (prefer og:image)
  let image = "";
  const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                       html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
  if (ogImageMatch) {
    image = ogImageMatch[1];
  }

  // Clean and parse body paragraphs
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  const paragraphs = [];

  while ((match = pRegex.exec(cleanHtml)) !== null) {
    let pText = match[1]
      .replace(/<[^>]+>/g, "") // Strip tag content
      .replace(/\s+/g, " ")     // Normalize whitespace
      .trim();

    // Basic HTML Entity Decoder
    pText = pText
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");

    if (
      pText.length > 60 && 
      !pText.toLowerCase().includes("cookie") &&
      !pText.toLowerCase().includes("privacy policy") &&
      !pText.toLowerCase().includes("subscribe") &&
      !pText.toLowerCase().includes("all rights reserved")
    ) {
      paragraphs.push(pText);
    }
  }

  if (paragraphs.length === 0) {
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
                     html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"/i);
    if (metaDesc) {
      paragraphs.push(metaDesc[1]);
    } else {
      paragraphs.push("Article body is not available in clean reader view. Please open the link below to view it.");
    }
  }

  let source = "Economic Times";
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    if (domain.includes("economictimes")) source = "Economic Times";
    else if (domain.includes("moneycontrol")) source = "Moneycontrol";
    else if (domain.includes("bloomberg")) source = "Bloomberg";
    else source = domain;
  } catch (e) {}

  return {
    title: title || "Financial Update",
    image: image || "",
    paragraphs: paragraphs.slice(0, 20),
    source,
    url
  };
}

/* ---------- WebSocket Ticker Loop ---------- */

let fyersWs = null;

function startTickLoop() {
  const token = getFyersToken();
  const appId = process.env.FYERS_APP_ID;

  if (token && appId) {
let reconnectTimer = null;
    let wsConnected = false;

    function connectFyers() {
      console.log("[fyers] Starting Fyers WebSocket");
      fyersWs = new fyersDataSocket(`${appId}:${token}`);
      
      fyersWs.on("connect", () => {
        console.log("[fyers] WS connected");
        wsConnected = true;
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      });
      
      fyersWs.on("message", (msg) => {
        const ticks = Array.isArray(msg) ? msg : [msg];
        ticks.forEach(data => {
          if (data && data.symbol && data.ltp) {
            const sym = fromFyersSym(data.symbol);
            broadcast("PRICE_TICK", {
              symbol: sym,
              c: data.ltp,
              d: data.ch || 0,
              dp: data.chp || 0,
              t: (data.timestamp || (Date.now() / 1000))
            });
          }
        });
      });
      
      fyersWs.on("error", (e) => console.error("[fyers] WS Error:", e));
      
      fyersWs.on("close", () => {
        console.log("[fyers] WS disconnected. Attempting reconnect...");
        wsConnected = false;
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            connectFyers();
          }, 5000); // 5 sec reconnect delay
        }
      });

      try { fyersWs.connect(); } catch (e) { console.error(e); }
    }

    connectFyers();

    setInterval(() => {
      if (!wsConnected) return;
      const symbols = getActiveSymbols();
      if (!symbols || symbols.length === 0) return;
      const newSubs = symbols.map(toFyersSym);
      if (fyersWs) fyersWs.subscribe(newSubs); // Fyers usually accepts array
    }, 5000);
  } else {
    console.log("[fyers] No token found, fallback to Yahoo polling");
    setInterval(async () => {
      const symbols = getActiveSymbols();
      if (!symbols || symbols.length === 0) return;
      const quotes = await getQuotes(symbols);
      quotes.forEach((q) => {
        if (q && q.symbol) broadcast("PRICE_TICK", q);
      });
    }, 3000);
  }
}

module.exports = {
  toYahoo,
  displaySymbol,
  exchangeFor,
  getQuote,
  getQuotes,
  getCandles,
  getProfile,
  search,
  getNews,
  getGeneralNews,
  getAllIndianSymbols,
  getBatchQuotes,
  generateSlug,
  getArticleUrlBySlug,
  fetchArticleHtml,
  parseArticleContent,
  startTickLoop
};

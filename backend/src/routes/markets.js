"use strict";

/**
 * Live market routes — proxy Yahoo Finance + Finnhub through our backend
 * so the Finnhub key never reaches the browser and we share an in-memory
 * cache across all clients.
 */

const { Router } = require("express");
const md = require("../services/marketData");

const router = Router();

// ---------- all Indian stocks (symbol list from Finnhub) ----------
// /api/markets/all-stocks?page=1&limit=50&search=reli
router.get("/all-stocks", async (req, res) => {
  try {
    const allSymbols = await md.getAllIndianSymbols();
    const search = String(req.query.search || "").trim().toLowerCase();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    let filtered = allSymbols;
    if (search) {
      filtered = allSymbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(search) ||
          s.name.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);

    // Fetch live quotes for this page
    let live = [];
    try {
      live = await md.getQuotes(items.map((i) => i.symbol));
    } catch (err) {
      console.warn("[all-stocks] live fetch failed:", err.message);
    }
    const quoteMap = new Map(live.map((q) => [md.toYahoo(q.symbol), q]));

    const enrichedItems = items.map((item) => {
      const q = quoteMap.get(md.toYahoo(item.symbol));
      return {
        ...item,
        price: q?.price ?? null,
        changePercent: q?.changePercent ?? null,
        change: q?.change ?? null
      };
    });

    res.json({ items: enrichedItems, total, page, totalPages, limit });
  } catch (e) {
    res.status(502).json({ error: e.message || "all-stocks failed" });
  }
});

// ---------- top gainers & losers ----------
// /api/markets/movers?count=10
// Fetches quotes for a sample of popular stocks and returns sorted gainers/losers
router.get("/movers", async (req, res) => {
  try {
    const count = Math.min(20, Math.max(5, parseInt(req.query.count) || 10));

    // Use a curated list of ~50 popular NSE stocks for movers
    const POPULAR = [
      "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
      "BHARTIARTL", "LT", "ASIANPAINT", "MARUTI", "HINDUNILVR",
      "ITC", "SBIN", "BAJFINANCE", "KOTAKBANK", "AXISBANK",
      "WIPRO", "HCLTECH", "SUNPHARMA", "TITAN", "ULTRACEMCO",
      "NESTLEIND", "TATAMOTORS", "TATASTEEL", "POWERGRID", "NTPC",
      "ONGC", "COALINDIA", "ADANIENT", "ADANIPORTS", "TECHM",
      "JSWSTEEL", "BAJAJFINSV", "INDUSINDBK", "HINDALCO", "GRASIM",
      "CIPLA", "DRREDDY", "APOLLOHOSP", "EICHERMOT", "DIVISLAB",
      "BPCL", "HEROMOTOCO", "BRITANNIA", "TATACONSUM", "BAJAJ-AUTO",
      "LTIM", "HDFCLIFE", "SBILIFE", "M&M", "SHRIRAMFIN"
    ];

    const quotes = await md.getBatchQuotes(POPULAR, 25);

    const sorted = quotes
      .filter((q) => q.changePercent != null)
      .sort((a, b) => b.changePercent - a.changePercent);

    const gainers = sorted.slice(0, count);
    const losers = sorted.slice(-count).reverse();

    res.json({ gainers, losers });
  } catch (e) {
    res.status(502).json({ error: e.message || "movers failed" });
  }
});

// ---------- single quote ----------
router.get("/quote/:symbol", async (req, res) => {
  try {
    const q = await md.getQuote(req.params.symbol);
    res.json({ quote: q });
  } catch (e) {
    res.status(502).json({ error: e.message || "quote failed" });
  }
});

// ---------- batched quotes ----------
// /api/markets/quotes?symbols=RELIANCE,TCS,INFY
router.get("/quotes", async (req, res) => {
  try {
    const raw = String(req.query.symbols || "").trim();
    if (!raw) return res.json({ quotes: [] });
    const symbols = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const quotes = await md.getQuotes(symbols);
    res.json({ quotes });
  } catch (e) {
    res.status(502).json({ error: e.message || "quotes failed" });
  }
});

// ---------- chart candles ----------
// /api/markets/candles/RELIANCE?range=1D|5D|1M|6M|1Y|5Y|MAX
router.get("/candles/:symbol", async (req, res) => {
  try {
    const range = String(req.query.range || "1D").toUpperCase();
    const data = await md.getCandles(req.params.symbol, range);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message || "candles failed" });
  }
});

// ---------- company profile ----------
router.get("/profile/:symbol", async (req, res) => {
  try {
    const profile = await md.getProfile(req.params.symbol);
    res.json({ profile });
  } catch (e) {
    res.status(502).json({ error: e.message || "profile failed" });
  }
});

// ---------- search ----------
// /api/markets/search?q=reli
router.get("/search", async (req, res) => {
  try {
    const items = await md.search(req.query.q);
    res.json({ items });
  } catch (e) {
    res.status(502).json({ error: e.message || "search failed" });
  }
});

// ---------- general news ----------
router.get("/news/general", async (req, res) => {
  try {
    const items = await md.getGeneralNews();
    res.json({ items });
  } catch (e) {
    res.status(502).json({ error: e.message || "general news failed" });
  }
});

// ---------- secure news article reader ----------
router.get("/news/article", async (req, res) => {
  try {
    const targetSlug = String(req.query.slug || "").trim();
    if (!targetSlug) {
      return res.status(400).json({ error: "slug query parameter is required" });
    }

    let targetUrl = md.getArticleUrlBySlug(targetSlug);
    if (!targetUrl) {
      // Repopulate the cache by fetching latest general news items
      try {
        await md.getGeneralNews();
        targetUrl = md.getArticleUrlBySlug(targetSlug);
      } catch (err) {
        console.warn("[news/article] failed to fetch general news fallback:", err.message);
      }
    }

    if (!targetUrl) {
      return res.status(404).json({ error: "Article not found or link expired" });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL structure in cache" });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.status(400).json({ error: "Only http and https protocols are supported" });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Security SSRF Protection: Prevent querying localhost, private IPs, or cloud meta interfaces
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
    if (blockedHosts.some(host => hostname === host || hostname.endsWith("." + host))) {
      return res.status(403).json({ error: "Access to private resources is forbidden" });
    }

    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(hostname)) {
      return res.status(403).json({ error: "Access to private networks is forbidden" });
    }

    const html = await md.fetchArticleHtml(targetUrl);
    const article = md.parseArticleContent(html, targetUrl);

    res.json({ article });
  } catch (e) {
    res.status(502).json({ error: e.message || "Failed to parse news article" });
  }
});

// ---------- news ----------
router.get("/news/:symbol", async (req, res) => {
  try {
    const items = await md.getNews(req.params.symbol);
    res.json({ items });
  } catch (e) {
    res.status(502).json({ error: e.message || "news failed" });
  }
});

module.exports = router;

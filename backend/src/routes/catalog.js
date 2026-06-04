"use strict";

const { Router } = require("express");
const { client, isLive } = require("../db");
const seed = require("../seed");
const md = require("../services/marketData");

const router = Router();

/**
 * Try Supabase first; if no rows / no client, fall back to seed.
 */
async function fromTable(table, fallback) {
  if (!isLive()) return fallback;
  try {
    const { data, error } = await client.from(table).select("*");
    if (error) {
      console.error("[" + table + "]", error.message);
      return fallback;
    }
    if (!data || !data.length) return fallback;
    return data;
  } catch (e) {
    console.error("[" + table + "] threw", e.message);
    return fallback;
  }
}

/**
 * Merge a live Yahoo quote onto a seed/Supabase row. The seed row supplies
 * stable display-only fields (vol, cap, sector etc.); Yahoo wins on price
 * and change. If the live fetch fails the seed row is returned unchanged.
 */
function mergeQuote(row, quote) {
  if (!quote) return row;
  return {
    ...row,
    price: quote.price ?? row.price,
    chg: quote.changePercent ?? row.chg,
    change: quote.change ?? null,
    previousClose: quote.previousClose ?? null,
    dayHigh: quote.dayHigh ?? null,
    dayLow: quote.dayLow ?? null,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? null,
    volume: quote.volume ?? null,
    marketState: quote.marketState ?? null,
    name: row.name || quote.name,
    sym: row.sym || quote.symbol,
    live: true
  };
}

/* ---------- ticker ---------- */
router.get("/ticker", async (_req, res) => {
  const seedItems = await fromTable("ticker_items", seed.TICKER);
  // Pull live snapshot for every ticker entry in parallel.
  const symbols = seedItems.map((t) => t.name); // names get aliased inside marketData
  let live = [];
  try {
    live = await md.getQuotes(symbols);
  } catch (e) {
    console.warn("[ticker] live fetch failed:", e.message);
  }
  // Map by Yahoo symbol so we can match seed items by their normalised key.
  const byYahoo = new Map(live.map((q) => [md.toYahoo(q.symbol), q]));
  const items = seedItems.map((t) => {
    const ys = md.toYahoo(t.name);
    const q = byYahoo.get(ys);
    if (!q || q.price == null) return t; // fallback to seed
    return {
      name: t.name,
      price: q.price,
      chg: q.changePercent ?? t.chg
    };
  });
  res.json({ items });
});

/* ---------- indices ---------- */
router.get("/indices", async (_req, res) => {
  const seedItems = await fromTable("indices", seed.INDICES);
  let live = [];
  try {
    live = await md.getQuotes(seedItems.map((i) => i.name));
  } catch (e) {
    console.warn("[indices] live fetch failed:", e.message);
  }
  const byYahoo = new Map(live.map((q) => [md.toYahoo(q.symbol), q]));
  const items = seedItems.map((ix) => {
    const q = byYahoo.get(md.toYahoo(ix.name));
    if (!q || q.price == null) return ix;
    return {
      ...ix,
      price: q.price,
      chg: q.changePercent ?? ix.chg
    };
  });
  res.json({ items });
});

/* ---------- stocks ---------- */
router.get("/stocks", async (_req, res) => {
  const seedItems = await fromTable("stocks", seed.STOCKS);
  let live = [];
  try {
    live = await md.getQuotes(seedItems.map((s) => s.sym));
  } catch (e) {
    console.warn("[stocks] live fetch failed:", e.message);
  }
  const byYahoo = new Map(live.map((q) => [md.toYahoo(q.symbol), q]));
  const items = seedItems.map((s) => {
    const q = byYahoo.get(md.toYahoo(s.sym));
    return mergeQuote(s, q);
  });
  res.json({ items });
});

/* ---------- everything below is unchanged: static catalog ---------- */
router.get("/unlisted", async (_req, res) => {
  const items = await fromTable("unlisted_shares", seed.UNLISTED);
  res.json({ items });
});

router.get("/products", async (_req, res) => {
  // Bypassing fromTable to ensure UI updates are immediately reflected from seed.PRODUCTS
  res.json({ items: seed.PRODUCTS });
});

router.get("/testimonials", async (_req, res) => {
  const items = await fromTable("testimonials", seed.TESTIMONIALS);
  res.json({ items });
});

router.get("/faqs", async (_req, res) => {
  const items = await fromTable("faqs", seed.FAQS);
  res.json({ items });
});

module.exports = router;

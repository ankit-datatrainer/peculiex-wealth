"use strict";

/**
 * Mutual fund data proxy — wraps the free public mfapi.in API (a mirror of
 * AMFI's official NAV data) so the frontend can search schemes and read
 * historical NAV without hitting CORS, and so we can cache upstream calls.
 * Used by the MF Resources tools (SIP performance, NAV, comparison, etc.)
 */
const { Router } = require("express");

const router = Router();
const BASE = "https://api.mfapi.in";

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

async function fetchJSON(url) {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`Upstream ${r.status}`);
  return r.json();
}

// GET /api/mf/search?q=HDFC+Flexi+Cap
router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json([]);
  const key = `mf_search:${q.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);
  try {
    const data = await fetchJSON(`${BASE}/mf/search?q=${encodeURIComponent(q)}`);
    cacheSet(key, data, 15 * 60_000);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message || "MF search failed" });
  }
});

// GET /api/mf/scheme/:code — full historical NAV series + meta
router.get("/scheme/:code", async (req, res) => {
  const code = String(req.params.code).replace(/\D/g, "");
  if (!code) return res.status(400).json({ error: "Invalid scheme code" });
  const key = `mf_scheme:${code}`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);
  try {
    const data = await fetchJSON(`${BASE}/mf/${code}`);
    cacheSet(key, data, 60 * 60_000); // 1hr — NAV updates once daily
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message || "MF scheme fetch failed" });
  }
});

// GET /api/mf/scheme/:code/latest — just today's NAV
router.get("/scheme/:code/latest", async (req, res) => {
  const code = String(req.params.code).replace(/\D/g, "");
  if (!code) return res.status(400).json({ error: "Invalid scheme code" });
  const key = `mf_latest:${code}`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);
  try {
    const data = await fetchJSON(`${BASE}/mf/${code}/latest`);
    cacheSet(key, data, 15 * 60_000);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message || "MF latest fetch failed" });
  }
});

module.exports = router;

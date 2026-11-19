"use strict";

const fs = require("fs");
const path = require("path");
const { gunzipSync } = require("zlib");

const DATA_DIR = path.resolve(process.env.UNLISTED_SYNC_DIR || path.join(__dirname, "../../uploads/unlisted-sync"));
const BUNDLED_FILE = path.join(__dirname, "../data/unlisted-catalog.json");
const RUNTIME_FILE = path.join(DATA_DIR, "catalog.json");
const cachedFiles = new Map();
let resolvedCatalog;

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n");
  fs.renameSync(temporary, file);
}

function readCatalog(file) {
  let stat;
  try { stat = fs.statSync(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
  const key = `${stat.mtimeMs}:${stat.size}`;
  const cached = cachedFiles.get(file);
  if (cached?.key === key) return cached.value;
  const value = readJson(file);
  if (file === BUNDLED_FILE && value?.history_archive === "unlisted-history.json.gz") {
    const archive = path.join(path.dirname(file), value.history_archive);
    const history = JSON.parse(gunzipSync(fs.readFileSync(archive)));
    value.items = value.items.map(item => ({ ...item, ...history[item.id] }));
  }
  cachedFiles.set(file, { key, value });
  return value;
}

function mergeSeries(archived = [], recent = []) {
  if (!archived.length) return recent;
  if (!recent.length) return archived;
  const byDay = new Map([...archived, ...recent]);
  return [...byDay].sort(([a], [b]) => a.localeCompare(b));
}

function getCatalog() {
  const runtime = readCatalog(RUNTIME_FILE);
  const bundled = readCatalog(BUNDLED_FILE);
  if (!runtime || !bundled) return runtime || bundled;
  if (resolvedCatalog?.runtime === runtime && resolvedCatalog.bundled === bundled) {
    return resolvedCatalog.value;
  }

  // Older VPS snapshots predate the archive. Recover archived details for
  // matching companies while keeping the saved inventory and current quotes.
  const bySource = new Map(bundled.items.filter(item => item.source_url).map(item => [item.source_url, item]));
  const byId = new Map(bundled.items.map(item => [item.id, item]));
  const items = runtime.items.map(item => {
    const saved = byId.get(item.id);
    const archived = bySource.get(item.source_url) ||
      (saved && (!saved.source_url || !item.source_url) ? saved : null);
    if (!archived) return item;

    const priceHistory = mergeSeries(archived.price_history, item.price_history);
    const dailyQuotes = mergeSeries(archived.daily_quotes, item.daily_quotes);
    return {
      ...item,
      price_history: priceHistory,
      daily_quotes: dailyQuotes,
      daily_quote_date: dailyQuotes.at(-1)?.[0] || null,
      fundamentals: item.fundamentals ?? archived.fundamentals,
      financials: item.financials ?? archived.financials,
      documents: item.documents ?? archived.documents,
      shareholding: item.shareholding ?? archived.shareholding,
      promoters: item.promoters ?? archived.promoters,
      company_status: item.company_status ?? archived.company_status,
    };
  });
  const value = { ...runtime, items };
  resolvedCatalog = { runtime, bundled, value };
  return value;
}

function getStatus() {
  const catalog = getCatalog();
  const status = readJson(path.join(DATA_DIR, "status.json"));
  return {
    enabled: process.env.UNLISTED_SYNC_ENABLED !== "false",
    running: fs.existsSync(path.join(DATA_DIR, "sync.lock")),
    interval_minutes: Number(process.env.UNLISTED_SYNC_INTERVAL_MINUTES) || 15,
    daily_quote_date: catalog?.items?.map(item => item.daily_quote_date).filter(Boolean).sort().at(-1) || null,
    history_companies: catalog?.items?.filter(item => item.price_history?.length > 0).length || 0,
    document_count: catalog?.items?.reduce((sum, item) => sum + (item.documents?.length || 0), 0) || 0,
    last_success_at: catalog?.synced_at || null,
    company_count: catalog?.items?.length || 0,
    last_attempt_at: status?.last_attempt_at || null,
    last_error: status?.last_error || null
  };
}

module.exports = { DATA_DIR, BUNDLED_FILE, readJson, atomicJson, getCatalog, getStatus };

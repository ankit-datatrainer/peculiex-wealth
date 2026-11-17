"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(process.env.UNLISTED_SYNC_DIR || path.join(__dirname, "../../uploads/unlisted-sync"));
const BUNDLED_FILE = path.join(__dirname, "../data/unlisted-catalog.json");
const cachedFiles = new Map();

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

function getCatalog() {
  for (const file of [path.join(DATA_DIR, "catalog.json"), BUNDLED_FILE]) {
    let stat;
    try { stat = fs.statSync(file); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
    const key = `${stat.mtimeMs}:${stat.size}`;
    const cached = cachedFiles.get(file);
    if (cached?.key === key) return cached.value;
    const value = readJson(file);
    if (file === BUNDLED_FILE && value.history_archive === "unlisted-history.json.gz") {
      const history = JSON.parse(require("zlib").gunzipSync(fs.readFileSync(path.join(__dirname, "../data/unlisted-history.json.gz"))));
      value.items = value.items.map(item => ({ ...item, ...history[item.id] }));
    }
    cachedFiles.set(file, { key, value });
    return value;
  }
  return null;
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

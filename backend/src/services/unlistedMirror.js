"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const source = require("./unlistedSource");
const state = require("./unlistedCatalogState");

const REQUIRED_FIELDS = ["price per share", "sector", "minimum units", "market cap", "pe(x)"];
const LOGO_DIR = path.join(__dirname, "../../uploads/unlisted-logos");
// These three listing images were broken on the source. Verified company sites
// provide the replacement; a working source image always takes precedence.
const LOGO_FALLBACKS = {
  "Medlix Health Solutions Private Limited": "https://medlix.in/wp-content/uploads/elementor/thumbs/logo-2-qve1yet41izqg573wmgwe0a1e0l2y8fdrx70n2bcuw.png",
  "MTAndT Rentals Limited": "https://mtandtrentals.com/wp-content/themes/twentytwentyone/assets/equpir/assets/images/logo.jpg",
  "Incred Capital Financial Services Limited": "https://www.incredcapital.com/wp-content/uploads/2016/12/Incred_Capital-new.png"
};
const IMAGE_HOSTS = new Set(["investkraft-new.s3.ap-south-1.amazonaws.com", "www.unlistedkraft.in", "medlix.in", "mtandtrentals.com", "www.incredcapital.com"]);

async function request(url, { maxBytes = 3 * 1024 * 1024, headers = {} } = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(25000), redirect: "error",
    headers: { "User-Agent": "FinvoqCatalogSync/1.0", ...headers }
  });
  if (response.status === 304) return { notModified: true };
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}: ${url}`);
  const chunks = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxBytes) throw new Error(`Upstream response exceeds ${maxBytes} bytes`);
    chunks.push(chunk);
  }
  return { body: Buffer.concat(chunks), etag: response.headers.get("etag") };
}

function validateRows(rows, previousCount = 0, allowLargeRemoval = false) {
  if (rows.length < 100) throw new Error(`Incomplete source: only ${rows.length} companies`);
  if (!allowLargeRemoval && previousCount && rows.length < previousCount * 0.75) {
    throw new Error("Source shrank by more than 25%; kept the last successful catalog for review");
  }
  const names = new Set(), urls = new Set();
  for (const row of rows) {
    const url = new URL(row.sourceUrl);
    if (url.origin !== new URL(source.SOURCE_URL).origin || !url.pathname.startsWith("/stocks/")) throw new Error(`Invalid company URL: ${row.name}`);
    if (!row.name || names.has(row.name.toLowerCase()) || urls.has(url.href)) throw new Error(`Duplicate source identity: ${row.name}`);
    names.add(row.name.toLowerCase()); urls.add(url.href);
    if (REQUIRED_FIELDS.some(field => !row.sourceFields?.includes(field))) throw new Error(`Incomplete source card: ${row.name}`);
    if (!row.sector || !row.market_cap || !row.pe || !row.min_units) throw new Error(`Missing source details: ${row.name}`);
    if (!Number.isFinite(row.price) && !/^(n\/?a|[-–—]|price on request)$/i.test(row.rawPrice)) throw new Error(`Unrecognized price: ${row.name}`);
  }
}

async function fetchListing() {
  const { body } = await request(source.SOURCE_URL, { maxBytes: 8 * 1024 * 1024 });
  const html = body.toString("utf8");
  const cards = [...html.matchAll(/<div\s+class="[^"]*\bshare-item\b[^"]*"/g)].length;
  const rows = source.parseSourceHtml(html);
  // The current Load More button reveals cards already present in the HTML.
  // Reject truncated pages and parser/layout changes before any DB operation.
  if (!html.includes("</html>") || !html.includes('id="shareList"') || cards !== rows.length) throw new Error("Incomplete source HTML or changed card layout");
  return rows;
}

function parseDetailHtml(html) {
  const start = html.indexOf("<!-- Fundamentals content start");
  const end = html.indexOf("<!-- Fundamentals content end", start);
  if (start < 0 || end < 0) throw new Error("Company fundamentals layout changed");
  const fields = {};
  const pairs = html.slice(start, end).matchAll(/<span[^>]*class="fs16\s+me-auto"[^>]*>([\s\S]*?)<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>/gi);
  for (const pair of pairs) fields[source.cleanText(pair[1])] = source.cleanText(pair[2]);
  if (!Object.hasOwn(fields, "ISIN") || !Object.hasOwn(fields, "Face Value")) throw new Error("Incomplete company fundamentals");
  const financialStart = html.indexOf("<!-- Key Financials section start");
  const financialEnd = html.indexOf("<!-- Key Financials section end", financialStart);
  const section = financialStart >= 0 && financialEnd >= 0 ? html.slice(financialStart, financialEnd) : "";
  const financials = ["Profit & Loss", "Balance Sheet"].flatMap((title, index) => {
    const begin = section.indexOf(`id="nested-tabs-${index + 1}"`);
    const finish = section.indexOf(`id="nested-tabs-${index + 2}"`, begin);
    const panel = begin < 0 ? "" : section.slice(begin, finish < 0 ? section.length : finish);
    const table = panel.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i);
    if (!table) return [];
    return [{ title, rows: [...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row =>
      [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell => source.cleanText(cell[1]))
    ).filter(row => row.length > 0) }];
  });
  return { fundamentals: fields, financials };
}

async function fetchDetail(row, previous) {
  const { body } = await request(row.sourceUrl);
  return { ...parseDetailHtml(body.toString("utf8")), detail_fetched_at: new Date().toISOString() };
}

async function fetchLogo(row, previous, logoDir = LOGO_DIR) {
  const candidates = [row.logo, LOGO_FALLBACKS[row.name]].filter(Boolean);
  let lastError;
  for (const url of candidates) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || !IMAGE_HOSTS.has(parsed.hostname)) throw new Error("Unrecognized logo host");
      const oldFile = previous?.logo_url?.startsWith("/api/unlisted-logos/file/") ? path.join(logoDir, path.basename(previous.logo_url)) : null;
      const cached = url === previous?.logo_source_url && oldFile && fs.existsSync(oldFile);
      const response = await request(url, { maxBytes: 5 * 1024 * 1024, headers: cached && previous.logo_etag ? { "If-None-Match": previous.logo_etag } : {} });
      if (response.notModified) return { logo_url: previous.logo_url, logo_source_url: url, logo_etag: previous.logo_etag };
      const ext = source.sniffImageExt(response.body);
      if (!ext) throw new Error("Logo is not a supported image");
      const hash = crypto.createHash("sha256").update(response.body).digest("hex").slice(0, 24);
      const filename = `market-${hash}.${ext}`;
      fs.mkdirSync(logoDir, { recursive: true });
      if (!fs.existsSync(path.join(logoDir, filename))) {
        const temporary = path.join(logoDir, `${filename}.${process.pid}.tmp`);
        fs.writeFileSync(temporary, response.body);
        fs.renameSync(temporary, path.join(logoDir, filename));
      }
      return { logo_url: `/api/unlisted-logos/file/${filename}`, logo_source_url: url, logo_etag: response.etag };
    } catch (error) { lastError = error; }
  }
  throw new Error(`Logo unavailable for ${row.name}: ${lastError?.message || "no image"}`);
}

function reconcile(existing, rows, previousItems = []) {
  const used = new Set();
  const matched = rows.map(row => {
    const prior = previousItems.find(item => item.source_url === row.sourceUrl);
    const bySource = prior && existing.find(item => item.id === prior.id && !used.has(item.id));
    const candidates = existing.filter(item => !used.has(item.id)).map(item => ({ item, tier: source.matchTier(source.nameKeys(row.name), source.nameKeys(item.name)) }))
      .filter(candidate => candidate.tier >= 0).sort((a, b) => a.tier - b.tier || a.item.name.localeCompare(b.item.name));
    const exact = candidates.find(candidate => candidate.item.name === row.name);
    const current = bySource || (exact || candidates[0])?.item || null;
    if (current) used.add(current.id);
    return { row, current };
  });
  return { matched, removed: existing.filter(item => !used.has(item.id)) };
}

async function mapLimit(items, limit, operation) {
  const results = new Array(items.length); let next = 0;
  // allSettled keeps workers alive until completion before releasing a lock.
  const workers = await Promise.allSettled(Array.from({ length: limit }, async () => {
    while (next < items.length) { const index = next++; results[index] = await operation(items[index]); }
  }));
  const failure = workers.find(result => result.status === "rejected");
  if (failure) throw failure.reason;
  return results;
}

function acquireLock(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "sync.lock");
  try {
    const fd = fs.openSync(file, "wx");
    fs.writeFileSync(fd, String(process.pid)); fs.closeSync(fd);
    return () => fs.unlinkSync(file);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const pid = Number(fs.readFileSync(file, "utf8"));
    if (!Number.isInteger(pid) || pid <= 0) throw new Error("An unlisted sync is already running");
    try { process.kill(pid, 0); }
    catch (err) { if (err.code === "ESRCH") { fs.unlinkSync(file); return acquireLock(dir); } }
    throw new Error("An unlisted sync is already running");
  }
}

const DB_FIELDS = ["name", "price", "sector", "logo_url", "iv"];
async function runSync(options = {}) {
  const dir = options.dir || state.DATA_DIR;
  const release = acquireLock(dir);
  const attempt = new Date().toISOString();
  try {
    const previous = options.previous || state.getCatalog();
    const store = options.store || require("../admin/store");
    const rows = await (options.fetchListing || fetchListing)();
    const existing = await store.listUnlisted({ raw: true });
    validateRows(rows, previous?.items?.length || existing.length, options.allowLargeRemoval);
    const plan = reconcile(existing, rows, previous?.items || []);
    const staged = await mapLimit(plan.matched, 3, async ({ row, current }) => {
      const old = previous?.items?.find(item => item.source_url === row.sourceUrl);
      const details = await (options.fetchDetail || fetchDetail)(row, old);
      const logo = await (options.fetchLogo || fetchLogo)(row, old);
      const fields = source.newShareFields({ ...row, price: row.valid ? row.price : 0 });
      fields.iv = details.fundamentals["Face Value"] || "N/A";
      return { current, item: { ...fields, ...details, ...logo, source_url: row.sourceUrl, source_checked_at: attempt, quote_status: row.valid ? "quoted" : "unavailable" } };
    });
    const changed = staged.filter(({ current, item }) => !current || DB_FIELDS.some(key => current[key] !== item[key]));
    const result = {
      checked_at: attempt, source: source.SOURCE_URL, count: rows.length,
      added: staged.filter(s => !s.current).map(s => s.item.name),
      updated: changed.filter(s => s.current).map(s => s.item.name),
      removed: plan.removed.map(item => item.name),
      unquoted: staged.filter(s => s.item.price === 0).map(s => s.item.name)
    };
    if (options.dryRun) return { result, items: staged.map(s => s.item) };
    // Every logo and detail page has succeeded before any mutation or removal.
    // A failed run leaves the published API snapshot intact. DB partial writes
    // are repaired idempotently by the next run; removals happen last.
    if (changed.length || plan.removed.length) {
      state.atomicJson(path.join(dir, "backups", `${attempt.replace(/[:.]/g, "-")}.json`), { result, before: existing, catalog: previous });
    }
    const published = [];
    for (const { current, item } of staged) {
      const fields = Object.fromEntries([...DB_FIELDS, "domain", "brand", "initial", "tag", "min_units", "market_cap", "pe"].map(key => [key, item[key]]));
      let saved = current;
      if (!current) saved = await store.createUnlisted(fields);
      else if (DB_FIELDS.some(key => current[key] !== item[key])) saved = await store.updateUnlisted(current.id, fields);
      if (!saved) throw new Error(`Could not save ${item.name}`);
      published.push({ ...item, id: saved.id });
    }
    for (const item of plan.removed) {
      if (!await store.deleteUnlisted(item.id)) throw new Error(`Could not remove ${item.name}`);
    }
    const final = await store.listUnlisted({ raw: true });
    if (final.length !== rows.length || final.some(item => !published.some(p => p.id === item.id && DB_FIELDS.every(key => p[key] === item[key])))) throw new Error("Database inventory verification failed");
    const catalog = { version: 1, source: source.SOURCE_URL, synced_at: attempt, items: published.sort((a, b) => a.name.localeCompare(b.name)) };
    state.atomicJson(path.join(dir, "catalog.json"), catalog);
    state.atomicJson(path.join(dir, "last-report.json"), result);
    state.atomicJson(path.join(dir, "status.json"), { last_attempt_at: attempt, last_error: null });
    return { result, catalog };
  } catch (error) {
    state.atomicJson(path.join(dir, "status.json"), { last_attempt_at: attempt, last_error: error.message });
    throw error;
  } finally { release(); }
}

function startAutoSync({ sync = runSync, schedule = setInterval } = {}) {
  if (process.env.UNLISTED_SYNC_ENABLED === "false") return;
  const minutes = Number(process.env.UNLISTED_SYNC_INTERVAL_MINUTES) || 15;
  if (!Number.isFinite(minutes) || minutes < 5) throw new Error("UNLISTED_SYNC_INTERVAL_MINUTES must be at least 5");
  const tick = () => sync().then(({ result }) => console.log("[unlisted-sync]", JSON.stringify(result)))
    .catch(error => console.error("[unlisted-sync] kept last successful catalog:", error.message));
  tick();
  const timer = schedule(tick, minutes * 60000); timer.unref();
  return () => clearInterval(timer);
}

module.exports = { request, validateRows, fetchListing, parseDetailHtml, fetchDetail, fetchLogo, reconcile, mapLimit, acquireLock, runSync, startAutoSync };

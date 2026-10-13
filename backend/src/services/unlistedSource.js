"use strict";

/**
 * Unlisted-share market source sync.
 *
 * Reads the public "live" listing at unlistedkraft.in, parses every share
 * card, and diffs it against our own unlisted_shares inventory so an admin
 * can review price / fundamentals changes and newly listed companies before
 * anything is written.
 *
 * Split into three layers so each can be tested on its own:
 *   1. fetchSourceShares() / parseSourceHtml()  — network + HTML parsing
 *   2. computeDiff()                            — pure: (existing, source) -> diff
 *   3. applySync()                              — writes through the admin store
 *
 * Safety rules baked in:
 *   - Existing rows only ever get price, min_units, market_cap, pe and sector
 *     changed. name / logo / brand / tag / domain are never touched.
 *   - Nothing is ever deleted. Rows missing from the source are reported only.
 *   - Cards with a nonsensical price (<= 0, e.g. "-1" placeholders the source
 *     uses for sold-out shares) are reported as invalid and left alone.
 */

const fs = require("fs");
const path = require("path");

const SOURCE_URL = "https://www.unlistedkraft.in/stocks/live";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 20000;
const LOGO_TIMEOUT_MS = 15000;
const LOGO_MAX_BYTES = 5 * 1024 * 1024;

// Fields a sync is allowed to change on an existing row.
const SYNC_FIELDS = ["price", "min_units", "market_cap", "pe", "sector"];

// Keep in step with the admin route's zod limits so a synced row can still be
// edited and saved from the admin form afterwards.
const MAX_NAME = 120;
const MAX_SECTOR = 80;

// Brand colours for newly added shares (white initial must stay legible on
// each, so no yellows). Picked deterministically from the name.
const BRAND_PALETTE = [
  "#c62828", "#ad1457", "#6a1b9a", "#4527a0", "#283593", "#1565c0",
  "#0277bd", "#00838f", "#00695c", "#00796b", "#2e7d32", "#d84315",
  "#e65100", "#5d4037", "#4e342e", "#455a64", "#37474f"
];

// --------------------------------------------------------------
// Text helpers
// --------------------------------------------------------------

function decodeEntities(s) {
  return String(s || "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function cleanText(html) {
  return decodeEntities(String(html || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

// The source occasionally leaks a "Company Fundamental" heading into the
// name, and pads parentheses ("( Formerly X )").
function cleanName(raw) {
  return cleanText(raw)
    .replace(/\s+company\s+fundamentals?\s*$/i, "")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

// "11,955 Cr Cr" -> "11,955 Cr"; the source sometimes doubles the unit.
function cleanMarketCap(v) {
  return String(v || "").replace(/(\s*cr\b\.?)+\s*$/i, " Cr").trim();
}

// "NA" / "na" -> "N/A", matching the label used across our inventory.
function cleanPe(v) {
  const s = String(v || "").trim();
  return /^n\/?a$/i.test(s) ? "N/A" : s;
}

function parseNumber(raw) {
  const s = String(raw == null ? "" : raw).replace(/,/g, "").trim();
  if (!s) return NaN;
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}

// URL-safe slug, same rules as the frontend's unlistedSlug().
function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --------------------------------------------------------------
// Name normalisation + matching keys
// --------------------------------------------------------------

const STOP_WORDS = new Set(["ltd", "limited", "pvt", "private", "india", "the"]);

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\s+company\s+fundamentals?\s*$/i, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !STOP_WORDS.has(w))
    .join(" ");
}

/**
 * Matching keys for a name:
 *   full    — whole name, parentheses content included
 *   outside — name with every "(...)" removed
 *   inside  — each parenthesised chunk on its own (e.g. "NSE", "Oyo Rooms")
 */
function nameKeys(name) {
  const raw = String(name || "");
  const full = normalizeName(raw);
  const outside = normalizeName(raw.replace(/\([^)]*\)/g, " "));
  const inside = [];
  for (const m of raw.matchAll(/\(([^)]*)\)/g)) {
    const k = normalizeName(m[1]);
    if (k.length >= 3) inside.push(k);
  }
  return { full, outside, inside };
}

/** Match strength between two key sets: 0 best, 2 weakest, -1 no match. */
function matchTier(a, b) {
  if (a.full && a.full === b.full) return 0;
  if (a.outside && a.outside === b.outside) return 1;
  if (
    (a.outside && b.inside.includes(a.outside)) ||
    (b.outside && a.inside.includes(b.outside)) ||
    a.inside.some((k) => b.inside.includes(k))
  ) {
    return 2;
  }
  return -1;
}

// Token-overlap similarity, used only to flag "possible duplicate" on an
// addition so the admin can untick it. Never used to auto-match.
function similarity(a, b) {
  const ta = new Set(a.split(" ").filter(Boolean));
  const tb = new Set(b.split(" ").filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.min(ta.size, tb.size);
}

// --------------------------------------------------------------
// 1. Fetch + parse
// --------------------------------------------------------------

/**
 * Parse the live listing HTML into share rows. Each card is a
 * `<div class="... share-item ...">` block holding an <h2><a>NAME</a></h2>,
 * a logo <img>, and label/value span pairs.
 */
function parseSourceHtml(html) {
  const text = String(html || "");
  const starts = [];
  const re = /<div\s+class="[^"]*\bshare-item\b[^"]*"/g;
  let m;
  while ((m = re.exec(text))) starts.push(m.index);

  const rows = [];
  for (let i = 0; i < starts.length; i++) {
    const chunk = text.slice(starts[i], starts[i + 1] || text.length);

    const head = chunk.match(/<h2[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!head) continue;
    const name = cleanName(head[2]);
    if (!name) continue;

    const img = chunk.match(/<img[^>]*\bsrc="([^"]*)"/i);
    const logo = img
      ? decodeEntities(img[1]).replace(/\\/g, "/").trim()
      : "";

    const fields = {};
    const pairRe =
      /<span\s+class="fs15\s+me-auto"[^>]*>([\s\S]*?)<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>/gi;
    let p;
    while ((p = pairRe.exec(chunk))) {
      fields[cleanText(p[1]).toLowerCase()] = cleanText(p[2]);
    }

    const rawPrice = fields["price per share"] ?? "";
    const price = parseNumber(rawPrice);
    const minUnits = parseNumber(fields["minimum units"]);
    const row = {
      name: name.slice(0, MAX_NAME),
      price,
      rawPrice,
      sector: (fields["sector"] || "").slice(0, MAX_SECTOR),
      min_units: Number.isFinite(minUnits) && minUnits > 0 ? Math.round(minUnits) : null,
      market_cap: cleanMarketCap(fields["market cap"]),
      pe: cleanPe(fields["pe(x)"]),
      sourceUrl: decodeEntities(head[1]).trim(),
      logo,
      valid: true,
      invalidReason: null
    };
    if (!Number.isFinite(price)) {
      row.valid = false;
      row.invalidReason = `Price is not a number ("${rawPrice}")`;
    } else if (price <= 0) {
      row.valid = false;
      row.invalidReason = `Price must be above zero (source shows ${rawPrice})`;
    }
    rows.push(row);
  }
  return rows;
}

async function fetchWithTimeout(url, ms, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "User-Agent": USER_AGENT, ...(init.headers || {}) }
    });
  } catch (e) {
    if (e && e.name === "AbortError") throw new Error(`Timed out fetching ${url}`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSourceShares({ url = SOURCE_URL, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  const res = await fetchWithTimeout(url, timeoutMs, {
    headers: { Accept: "text/html,application/xhtml+xml" }
  });
  if (!res.ok) throw new Error(`Source returned HTTP ${res.status}`);
  const html = await res.text();
  const rows = parseSourceHtml(html);
  // A layout change on the source would silently yield nothing; treat that as
  // an error rather than reporting "every share is missing from source".
  if (rows.length < 10) {
    throw new Error(
      `Source page parsed to only ${rows.length} shares — its layout may have changed.`
    );
  }
  return rows;
}

/**
 * Accept rows supplied by a caller (POST body / saved JSON) instead of a live
 * fetch. Same shape as parseSourceHtml() output; strings are tolerated.
 */
function normalizeSourceItems(items) {
  if (!Array.isArray(items)) throw new Error("items must be an array");
  return items
    .filter((it) => it && it.name)
    .map((it) => {
      const rawPrice = it.rawPrice != null ? String(it.rawPrice) : String(it.price ?? "");
      const price = parseNumber(it.price);
      const minUnits = parseNumber(it.min_units);
      const valid = Number.isFinite(price) && price > 0;
      return {
        name: cleanName(it.name).slice(0, MAX_NAME),
        price,
        rawPrice,
        sector: cleanText(it.sector || "").slice(0, MAX_SECTOR),
        min_units: Number.isFinite(minUnits) && minUnits > 0 ? Math.round(minUnits) : null,
        market_cap: cleanMarketCap(cleanText(it.market_cap)),
        pe: cleanPe(cleanText(it.pe)),
        sourceUrl: String(it.sourceUrl || it.url || ""),
        logo: String(it.logo || "").replace(/\\/g, "/").trim(),
        valid,
        invalidReason: valid
          ? null
          : Number.isFinite(price)
            ? `Price must be above zero (source shows ${rawPrice})`
            : `Price is not a number ("${rawPrice}")`
      };
    });
}

// --------------------------------------------------------------
// 2. Diff (pure)
// --------------------------------------------------------------

const sameText = (a, b) =>
  String(a ?? "").replace(/\s+/g, " ").trim().toLowerCase() ===
  String(b ?? "").replace(/\s+/g, " ").trim().toLowerCase();

// Sector labels: ignore case, "&" vs "and" and punctuation-only differences.
const wordsOf = (v) =>
  String(v ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
const sameWords = (a, b) => wordsOf(a) === wordsOf(b);

// "N/A", "N/A Cr", "-", "Other" — values that carry no information.
const isPlaceholder = (v) =>
  /^(n\/?a|-+|others?)(\s*cr)?$/i.test(String(v ?? "").trim());

/** Field-level changes a source row would make to an existing row. */
function fieldChanges(existing, src) {
  const changes = {};
  if (Math.abs(Number(existing.price) - src.price) > 1e-9) {
    changes.price = { from: Number(existing.price), to: src.price };
  }
  if (src.min_units != null && Number(existing.min_units || 0) !== src.min_units) {
    changes.min_units = { from: Number(existing.min_units || 0), to: src.min_units };
  }
  // Blank / placeholder source values never overwrite something we have.
  const usable = (v, cur) => !!v && (!isPlaceholder(v) || !String(cur || "").trim());
  if (usable(src.market_cap, existing.market_cap) && !sameText(existing.market_cap, src.market_cap)) {
    changes.market_cap = { from: existing.market_cap || "", to: src.market_cap };
  }
  if (usable(src.pe, existing.pe) && !sameText(existing.pe, src.pe)) {
    changes.pe = { from: existing.pe || "", to: src.pe };
  }
  if (usable(src.sector, existing.sector) && !sameWords(existing.sector, src.sector)) {
    changes.sector = { from: existing.sector || "", to: src.sector };
  }
  return changes;
}

/**
 * @param existing rows from the store ({id, name, price, sector, min_units, market_cap, pe, ...})
 * @param source   rows from parseSourceHtml()/normalizeSourceItems()
 * @returns {{updates, additions, invalid, missingFromSource, ambiguous, unchanged, counts}}
 */
function computeDiff(existing, source) {
  const src = source.map((s, idx) => ({ s, idx, keys: nameKeys(s.name) }));
  const ex = existing.map((e) => ({ e, keys: nameKeys(e.name) }));

  const matchedSource = new Set();
  const updates = [];
  const invalid = [];
  const missingFromSource = [];
  const ambiguous = [];
  let unchanged = 0;

  for (const { e, keys } of ex) {
    let bestTier = Infinity;
    let best = [];
    for (const cand of src) {
      const t = matchTier(keys, cand.keys);
      if (t < 0) continue;
      if (t < bestTier) {
        bestTier = t;
        best = [cand];
      } else if (t === bestTier) {
        best.push(cand);
      }
    }
    if (best.length === 0) {
      missingFromSource.push({ id: e.id, name: e.name, price: Number(e.price) });
      continue;
    }
    best.forEach((b) => matchedSource.add(b.idx));
    // Several distinct source cards tie for this row: don't guess.
    const distinct = new Set(best.map((b) => b.keys.full));
    if (distinct.size > 1) {
      ambiguous.push({
        id: e.id,
        name: e.name,
        candidates: best.map((b) => b.s.name)
      });
      continue;
    }
    const s = best[0].s;
    const matchedBy = ["name", "name without brackets", "bracketed name"][bestTier];
    if (!s.valid) {
      invalid.push({
        name: s.name,
        rawPrice: s.rawPrice,
        reason: s.invalidReason,
        matchedId: e.id,
        matchedName: e.name,
        currentPrice: Number(e.price)
      });
      continue;
    }
    const changes = fieldChanges(e, s);
    if (Object.keys(changes).length === 0) {
      unchanged++;
      continue;
    }
    updates.push({ id: e.id, name: e.name, sourceName: s.name, matchedBy, changes });
  }

  const existingKeys = ex.map((x) => x.keys.full);
  const additions = [];
  const seenNew = new Set();
  for (const { s, idx, keys } of src) {
    if (matchedSource.has(idx)) continue;
    if (!s.valid) {
      invalid.push({ name: s.name, rawPrice: s.rawPrice, reason: s.invalidReason, matchedId: null, matchedName: null });
      continue;
    }
    if (seenNew.has(keys.full)) continue; // duplicate card on the source
    seenNew.add(keys.full);
    const similarTo = ex
      .filter((x, i) => similarity(keys.outside || keys.full, x.keys.outside || existingKeys[i]) >= 0.75)
      .map((x) => x.e.name)
      .slice(0, 3);
    additions.push({
      name: s.name,
      price: s.price,
      sector: s.sector,
      min_units: s.min_units,
      market_cap: s.market_cap,
      pe: s.pe,
      sourceUrl: s.sourceUrl,
      logo: s.logo,
      similarTo
    });
  }

  // Invalid placeholder prices and multi-row duplicates are common; keep the
  // most actionable (largest relative) price moves first.
  const pct = (u) =>
    u.changes.price && u.changes.price.from
      ? Math.abs((u.changes.price.to - u.changes.price.from) / u.changes.price.from)
      : 0;
  updates.sort((a, b) => pct(b) - pct(a) || a.name.localeCompare(b.name));
  additions.sort((a, b) => a.name.localeCompare(b.name));
  missingFromSource.sort((a, b) => a.name.localeCompare(b.name));

  return {
    updates,
    additions,
    invalid,
    missingFromSource,
    ambiguous,
    unchanged,
    counts: {
      source: source.length,
      existing: existing.length,
      updates: updates.length,
      priceChanges: updates.filter((u) => u.changes.price).length,
      sectorChanges: updates.filter((u) => u.changes.sector).length,
      additions: additions.length,
      invalid: invalid.length,
      missingFromSource: missingFromSource.length,
      ambiguous: ambiguous.length,
      unchanged
    }
  };
}

// --------------------------------------------------------------
// 3. New-share defaults + logo download
// --------------------------------------------------------------

function brandFor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return BRAND_PALETTE[h % BRAND_PALETTE.length];
}

/**
 * Placeholder "domain" for a share whose website we don't know. It is never a
 * real-looking domain: the logo fallback (icon.horse) simply fails on it and
 * the UI drops back to the coloured initial.
 */
function placeholderDomain(name) {
  return slugify(normalizeName(String(name).replace(/\([^)]*\)/g, " ")) || name) || "unlisted";
}

function newShareFields(add) {
  const name = add.name.slice(0, MAX_NAME);
  const initial = (name.match(/[A-Za-z0-9]/) || ["?"])[0].toUpperCase();
  return {
    name,
    domain: placeholderDomain(name),
    sector: (add.sector || "Unlisted").slice(0, MAX_SECTOR),
    brand: brandFor(name),
    initial,
    price: add.price,
    iv: "10",
    tag: "avail",
    min_units: add.min_units || 0,
    market_cap: add.market_cap || "",
    pe: add.pe || "N/A"
  };
}

function sniffImageExt(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.slice(0, 4).toString("ascii") === "GIF8") return "gif";
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.slice(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.slice(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return "avif";
  }
  return null;
}

/**
 * Download a source logo into `dir` as `<basename>.<ext>`, where ext comes
 * from the file's magic bytes (never trusted from the URL). Returns the file
 * name written, or null if the logo could not be fetched / isn't an image.
 */
async function downloadLogo(url, dir, basename) {
  if (!url || !/^https:\/\//i.test(url)) return null;
  const safeBase = slugify(basename).slice(0, 80) || "logo";
  try {
    const res = await fetchWithTimeout(url, LOGO_TIMEOUT_MS, { headers: { Accept: "image/*" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > LOGO_MAX_BYTES) return null;
    const ext = sniffImageExt(buf);
    if (!ext) return null;
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${safeBase}.${ext}`;
    fs.writeFileSync(path.join(dir, filename), buf);
    return filename;
  } catch {
    return null;
  }
}

// Logos shipped with the frontend build (frontend/public/logos), when this
// backend runs next to it. Next only serves files present at build time, so
// runtime downloads go to the backend's own upload folder instead.
const FRONTEND_LOGO_DIR = path.join(__dirname, "..", "..", "..", "frontend", "public", "logos");
const UPLOAD_LOGO_DIR = path.join(__dirname, "..", "..", "uploads", "unlisted-logos");

function findShippedLogo(name, seedRows) {
  const seedRow = (seedRows || []).find((u) => u.name === name);
  if (seedRow && seedRow.logo_url && seedRow.logo_url.startsWith("/logos/")) return seedRow.logo_url;
  const base = slugify(name);
  try {
    const hit = fs.readdirSync(FRONTEND_LOGO_DIR).find((f) => f.replace(/\.[^.]+$/, "") === base);
    if (hit) return `/logos/${hit}`;
  } catch {
    /* frontend not deployed alongside the backend */
  }
  return null;
}

async function resolveLogoUrl(add, seedRows) {
  const shipped = findShippedLogo(add.name, seedRows);
  if (shipped) return shipped;
  const file = await downloadLogo(add.logo, UPLOAD_LOGO_DIR, `sync-${slugify(add.name)}`);
  return file ? `/api/unlisted-logos/file/${file}` : null;
}

// --------------------------------------------------------------
// 4. Apply
// --------------------------------------------------------------

/**
 * Write a diff through the admin store.
 *
 * @param store       the admin store (listUnlisted/createUnlisted/updateUnlisted)
 * @param diff        output of computeDiff()
 * @param applyUpdates  apply every entry in diff.updates (price, min units,
 *                      market cap, P/E)
 * @param applySectors  also overwrite sector labels. Off by default: the
 *                      source's sector text is often looser than our curated
 *                      labels, so it is opt-in per sync.
 * @param addNames    source names (diff.additions[].name) to create
 * @param seedRows    seed.UNLISTED, used to reuse logos shipped with the site
 */
async function applySync(
  store,
  diff,
  { applyUpdates = false, applySectors = false, addNames = [], seedRows = [] } = {}
) {
  const result = { updated: [], added: [], skipped: [], errors: [] };

  if (applyUpdates) {
    for (const u of diff.updates) {
      const patch = {};
      for (const f of SYNC_FIELDS) {
        if (f === "sector" && !applySectors) continue;
        if (u.changes[f]) patch[f] = u.changes[f].to;
      }
      if (Object.keys(patch).length === 0) continue; // sector-only change, not opted in
      try {
        const row = await store.updateUnlisted(u.id, patch);
        if (row) result.updated.push({ id: u.id, name: u.name, fields: Object.keys(patch) });
        else result.skipped.push({ name: u.name, reason: "Row no longer exists" });
      } catch (e) {
        result.errors.push({ name: u.name, error: e.message });
      }
    }
  }

  const wanted = new Set((addNames || []).map((n) => String(n)));
  for (const add of diff.additions) {
    if (!wanted.has(add.name)) continue;
    wanted.delete(add.name);
    try {
      const fields = newShareFields(add);
      fields.logo_url = await resolveLogoUrl(add, seedRows);
      const row = await store.createUnlisted(fields);
      result.added.push({ id: row.id, name: row.name, logo_url: row.logo_url || null });
    } catch (e) {
      if (e && e.status === 409) result.skipped.push({ name: add.name, reason: e.message });
      else result.errors.push({ name: add.name, error: e.message });
    }
  }
  for (const name of wanted) {
    result.skipped.push({ name, reason: "Not in the current list of new shares" });
  }
  return result;
}

module.exports = {
  SOURCE_URL,
  SYNC_FIELDS,
  parseSourceHtml,
  fetchSourceShares,
  normalizeSourceItems,
  normalizeName,
  nameKeys,
  computeDiff,
  newShareFields,
  brandFor,
  placeholderDomain,
  slugify,
  sniffImageExt,
  downloadLogo,
  applySync,
  FRONTEND_LOGO_DIR,
  UPLOAD_LOGO_DIR
};

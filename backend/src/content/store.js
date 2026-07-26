"use strict";

/**
 * Page-content store.
 *
 * Persists the super-admin's edits for each page. Follows the same strategy
 * as the rest of the backend: Supabase when it is configured, otherwise a
 * JSON file on disk so the CMS is fully usable in seed mode / local dev.
 *
 * Only the *overrides* are stored, never the whole page. Defaults live in
 * schema.js, so shipping new copy in code keeps working for every field an
 * admin has not touched, and "Reset" is simply deleting the row.
 */

const fs = require("fs");
const path = require("path");
const { client, isLive } = require("../db");
const schema = require("./schema");

const TABLE = "page_content";
const FILE_DIR = path.join(__dirname, "..", "..", "uploads", "content");
const FILE = path.join(FILE_DIR, "page-content.json");

fs.mkdirSync(FILE_DIR, { recursive: true });

/**
 * Supabase is used when the `page_content` table exists. Until the migration
 * in sql/schema.sql has been applied we fall back to the JSON file, so the
 * content manager is usable on a fresh install and starts writing to
 * Postgres by itself the moment the table appears.
 */
let tableMissing = false;

const isMissingTable = (err) =>
  !!err &&
  /page_content/i.test(err.message || "") &&
  /(does not exist|schema cache|not find)/i.test(err.message || "");

function noteMissingTable(err) {
  if (!tableMissing) {
    console.warn(
      "[content] `page_content` table not found: storing edits on disk. " +
        "Apply backend/sql/schema.sql to persist them in Postgres."
    );
  }
  tableMissing = true;
  return err;
}

const useDb = () => isLive() && !tableMissing;

/* ── disk fallback ─────────────────────────────────────────────── */

function readFileStore() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeFileStore(obj) {
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), "utf8");
}

/* ── reads ─────────────────────────────────────────────────────── */

/** Raw saved overrides for every page, keyed by page. */
async function allOverrides() {
  if (!useDb()) return readFileStore();
  const { data, error } = await client
    .from(TABLE)
    .select("page, data, updated_at, updated_by");
  if (error) {
    if (isMissingTable(error)) noteMissingTable(error);
    else console.warn("[content] read failed, using disk:", error.message);
    return readFileStore();
  }
  const out = {};
  for (const row of data || []) {
    out[row.page] = {
      data: row.data || {},
      updatedAt: row.updated_at,
      updatedBy: row.updated_by
    };
  }
  return out;
}

/** Merged content (defaults + overrides) for one page. */
async function getPage(pageKey) {
  if (!schema.hasPage(pageKey)) return null;
  const all = await allOverrides();
  const entry = all[pageKey];
  return schema.merge(pageKey, entry && entry.data ? entry.data : entry);
}

/** Merged content for every page: what the public site consumes. */
async function getAll() {
  const all = await allOverrides();
  const out = {};
  for (const key of schema.pageKeys()) {
    const entry = all[key];
    out[key] = schema.merge(key, entry && entry.data ? entry.data : entry);
  }
  return out;
}

/** Saved-metadata map for the admin list (which pages are customised). */
async function statuses() {
  const all = await allOverrides();
  const out = {};
  for (const key of schema.pageKeys()) {
    const entry = all[key];
    out[key] = entry
      ? { edited: true, updatedAt: entry.updatedAt || null, updatedBy: entry.updatedBy || null }
      : { edited: false };
  }
  return out;
}

/* ── writes ────────────────────────────────────────────────────── */

async function savePage(pageKey, data, who) {
  if (!schema.hasPage(pageKey)) throw new Error("Unknown page.");
  // Round-trip through the schema so only known keys are ever persisted.
  const merged = schema.merge(pageKey, data);
  const updatedAt = new Date().toISOString();

  const toDisk = () => {
    const store = readFileStore();
    store[pageKey] = { data: merged, updatedAt, updatedBy: who || "admin" };
    writeFileStore(store);
  };

  if (useDb()) {
    const { error } = await client
      .from(TABLE)
      .upsert(
        { page: pageKey, data: merged, updated_at: updatedAt, updated_by: who || "admin" },
        { onConflict: "page" }
      );
    if (error) {
      // A missing table is a setup step, not a failed save: keep the edit.
      if (!isMissingTable(error)) throw new Error(error.message);
      noteMissingTable(error);
      toDisk();
    }
  } else {
    toDisk();
  }
  return merged;
}

/** Drop the overrides so the page falls back to the copy shipped in code. */
async function resetPage(pageKey) {
  if (!schema.hasPage(pageKey)) throw new Error("Unknown page.");
  const fromDisk = () => {
    const store = readFileStore();
    delete store[pageKey];
    writeFileStore(store);
  };

  if (useDb()) {
    const { error } = await client.from(TABLE).delete().eq("page", pageKey);
    if (error) {
      if (!isMissingTable(error)) throw new Error(error.message);
      noteMissingTable(error);
    }
  }
  // Always clear the disk copy too, so a reset is complete either way.
  fromDisk();
  return schema.defaultsFor(pageKey);
}

module.exports = { getPage, getAll, statuses, savePage, resetPage };

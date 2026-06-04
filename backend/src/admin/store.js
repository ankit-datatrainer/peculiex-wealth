"use strict";

/**
 * Admin store: CRUD over the editable catalog tables (unlisted_shares,
 * stocks). Mirrors the auth store pattern — uses Supabase when configured,
 * otherwise an in-memory map seeded from `seed.js` so the admin panel is
 * fully functional even in zero-config "seed mode".
 *
 * Every record has a stable `id` (UUID) so an item can be renamed without
 * losing its identity. The DB tables keep `name` / `sym` as the natural
 * primary key for backwards compatibility, but admin CRUD uses `id`.
 */

const crypto = require("crypto");
const { client, isLive } = require("../db");
const seed = require("../seed");

const UNLISTED_TABLE = "unlisted_shares";
const STOCKS_TABLE = "stocks";

const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const VALID_UNLISTED_TAGS = new Set(["trend", "avail", "lim"]);
const VALID_STOCK_CATS = new Set(["up", "stable", "watch"]);

// --------------------------------------------------------------
// In-memory state (seed-mode fallback). Lazy-seeded on first use so we
// don't pay the cost when running against Supabase.
// --------------------------------------------------------------
const mem = {
  unlisted: null, // Map<id, item> | null until first seeded
  stocks: null
};

function seedUnlistedMem() {
  if (mem.unlisted) return mem.unlisted;
  mem.unlisted = new Map();
  for (const u of seed.UNLISTED) {
    const id = newId();
    mem.unlisted.set(id, {
      id,
      name: u.name,
      domain: u.domain,
      sector: u.sector,
      brand: u.brand,
      initial: u.initial,
      price: Number(u.price),
      iv: u.iv,
      tag: u.tag,
      logo_url: null,
      created_at: now(),
      updated_at: now()
    });
  }
  return mem.unlisted;
}

function seedStocksMem() {
  if (mem.stocks) return mem.stocks;
  mem.stocks = new Map();
  for (const s of seed.STOCKS) {
    const id = newId();
    mem.stocks.set(id, {
      id,
      sym: s.sym,
      name: s.name,
      price: Number(s.price),
      chg: Number(s.chg),
      vol: s.vol,
      cap: s.cap,
      cat: s.cat,
      created_at: now(),
      updated_at: now()
    });
  }
  return mem.stocks;
}

// --------------------------------------------------------------
// Coercion helpers — every external write goes through these so the
// shapes stay consistent whether they came from a JSON body, a form
// post, or a Supabase row.
// --------------------------------------------------------------
function coerceUnlistedInput(input, { partial = false } = {}) {
  const out = {};
  const keys = [
    "name",
    "domain",
    "sector",
    "brand",
    "initial",
    "price",
    "iv",
    "tag",
    "logo_url"
  ];
  for (const k of keys) {
    if (input[k] === undefined) continue;
    let v = input[k];
    if (k === "price") {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) throw new Error("price must be a non-negative number");
      out.price = n;
    } else if (k === "tag") {
      if (!VALID_UNLISTED_TAGS.has(v)) throw new Error("tag must be trend, avail or lim");
      out.tag = v;
    } else if (k === "initial") {
      out.initial = String(v).trim().slice(0, 2) || "?";
    } else if (k === "brand") {
      const s = String(v).trim();
      if (!/^#?[0-9a-fA-F]{3,8}$/.test(s)) throw new Error("brand must be a hex colour like #EE2E24");
      out.brand = s.startsWith("#") ? s : "#" + s;
    } else if (k === "domain") {
      out.domain = String(v).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    } else if (k === "logo_url") {
      out.logo_url = v ? String(v).trim().slice(0, 500) : null;
    } else {
      // name, sector, iv — plain string fields
      out[k] = String(v).trim().slice(0, 200);
    }
  }
  if (!partial) {
    const required = ["name", "domain", "sector", "brand", "initial", "price", "iv", "tag"];
    for (const r of required) {
      if (out[r] === undefined || out[r] === null || out[r] === "") {
        throw new Error(`Field "${r}" is required`);
      }
    }
  }
  return out;
}

function coerceStockInput(input, { partial = false } = {}) {
  const out = {};
  const setNum = (k) => {
    if (input[k] === undefined) return;
    const n = Number(input[k]);
    if (!Number.isFinite(n)) throw new Error(`${k} must be a number`);
    out[k] = n;
  };
  const setStr = (k, max = 80) => {
    if (input[k] === undefined) return;
    out[k] = String(input[k]).trim().slice(0, max);
  };
  if (input.sym !== undefined) {
    out.sym = String(input.sym).trim().toUpperCase().slice(0, 20);
  }
  setStr("name", 120);
  setNum("price");
  setNum("chg");
  setStr("vol", 30);
  setStr("cap", 30);
  if (input.cat !== undefined) {
    if (!VALID_STOCK_CATS.has(input.cat)) throw new Error("cat must be up, stable or watch");
    out.cat = input.cat;
  }
  if (!partial) {
    const required = ["sym", "name", "price", "chg", "vol", "cap", "cat"];
    for (const r of required) {
      if (out[r] === undefined || out[r] === null || out[r] === "") {
        throw new Error(`Field "${r}" is required`);
      }
    }
  }
  return out;
}

// --------------------------------------------------------------
// UNLISTED SHARES
// --------------------------------------------------------------

async function listUnlisted() {
  if (!isLive()) {
    return Array.from(seedUnlistedMem().values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

async function getUnlistedById(id) {
  if (!id) return null;
  if (!isLive()) return seedUnlistedMem().get(id) || null;
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function createUnlisted(input) {
  const fields = coerceUnlistedInput(input, { partial: false });
  const row = {
    id: newId(),
    ...fields,
    created_at: now(),
    updated_at: now()
  };
  if (!isLive()) {
    const map = seedUnlistedMem();
    // Soft uniqueness on name to mirror the DB constraint.
    for (const u of map.values()) {
      if (u.name.toLowerCase() === row.name.toLowerCase()) {
        const err = new Error("An unlisted share with this name already exists.");
        err.status = 409;
        throw err;
      }
    }
    map.set(row.id, row);
    return row;
  }
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .insert(row)
    .select("*")
    .single();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("An unlisted share with this name already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data;
}

async function updateUnlisted(id, patch) {
  const fields = coerceUnlistedInput(patch, { partial: true });
  if (Object.keys(fields).length === 0) return getUnlistedById(id);
  fields.updated_at = now();

  if (!isLive()) {
    const map = seedUnlistedMem();
    const cur = map.get(id);
    if (!cur) return null;
    if (fields.name) {
      for (const [otherId, u] of map) {
        if (otherId !== id && u.name.toLowerCase() === fields.name.toLowerCase()) {
          const err = new Error("An unlisted share with this name already exists.");
          err.status = 409;
          throw err;
        }
      }
    }
    const next = { ...cur, ...fields };
    map.set(id, next);
    return next;
  }
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .update(fields)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("An unlisted share with this name already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data || null;
}

async function deleteUnlisted(id) {
  if (!id) return false;
  if (!isLive()) {
    const map = seedUnlistedMem();
    return map.delete(id);
  }
  const { error, count } = await client
    .from(UNLISTED_TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function countUnlisted() {
  if (!isLive()) return seedUnlistedMem().size;
  const { count, error } = await client
    .from(UNLISTED_TABLE)
    .select("name", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

// --------------------------------------------------------------
// STOCKS
// --------------------------------------------------------------

async function listStocks() {
  if (!isLive()) {
    return Array.from(seedStocksMem().values()).sort((a, b) =>
      a.sym.localeCompare(b.sym)
    );
  }
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .select("*")
    .order("sym", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

async function getStockById(id) {
  if (!id) return null;
  if (!isLive()) return seedStocksMem().get(id) || null;
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function createStock(input) {
  const fields = coerceStockInput(input, { partial: false });
  const row = {
    id: newId(),
    ...fields,
    created_at: now(),
    updated_at: now()
  };
  if (!isLive()) {
    const map = seedStocksMem();
    for (const s of map.values()) {
      if (s.sym === row.sym) {
        const err = new Error("A stock with this symbol already exists.");
        err.status = 409;
        throw err;
      }
    }
    map.set(row.id, row);
    return row;
  }
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .insert(row)
    .select("*")
    .single();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("A stock with this symbol already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data;
}

async function updateStock(id, patch) {
  const fields = coerceStockInput(patch, { partial: true });
  if (Object.keys(fields).length === 0) return getStockById(id);
  fields.updated_at = now();

  if (!isLive()) {
    const map = seedStocksMem();
    const cur = map.get(id);
    if (!cur) return null;
    if (fields.sym) {
      for (const [otherId, s] of map) {
        if (otherId !== id && s.sym === fields.sym) {
          const err = new Error("A stock with this symbol already exists.");
          err.status = 409;
          throw err;
        }
      }
    }
    const next = { ...cur, ...fields };
    map.set(id, next);
    return next;
  }
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .update(fields)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("A stock with this symbol already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data || null;
}

async function deleteStock(id) {
  if (!id) return false;
  if (!isLive()) {
    return seedStocksMem().delete(id);
  }
  const { error, count } = await client
    .from(STOCKS_TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function countStocks() {
  if (!isLive()) return seedStocksMem().size;
  const { count, error } = await client
    .from(STOCKS_TABLE)
    .select("sym", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

// --------------------------------------------------------------
// Submission tables — read-only listing for the admin viewer
// --------------------------------------------------------------

async function listLeads({ limit = 500 } = {}) {
  if (!isLive()) return [];
  const cap = Math.min(Math.max(Number(limit) || 500, 1), 2000);
  const { data, error } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return data || [];
}

async function updateLeadStatus(id, status) {
  if (!isLive()) return null;
  const allowed = new Set(["new", "contacted", "qualified", "won", "lost"]);
  if (!allowed.has(status)) throw new Error("Invalid status");
  const { data, error } = await client
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function deleteLead(id) {
  if (!isLive()) return false;
  const { error, count } = await client
    .from("leads")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function listNewsletter({ limit = 1000 } = {}) {
  if (!isLive()) return [];
  const cap = Math.min(Math.max(Number(limit) || 1000, 1), 5000);
  const { data, error } = await client
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return data || [];
}

async function deleteNewsletter(email) {
  if (!isLive()) return false;
  const e = String(email || "").trim().toLowerCase();
  if (!e) return false;
  const { error, count } = await client
    .from("newsletter_subscribers")
    .delete({ count: "exact" })
    .eq("email", e);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function listContact({ limit = 500 } = {}) {
  if (!isLive()) return [];
  const cap = Math.min(Math.max(Number(limit) || 500, 1), 2000);
  const { data, error } = await client
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return data || [];
}

async function deleteContact(id) {
  if (!isLive()) return false;
  const { error, count } = await client
    .from("contact_messages")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

// --------------------------------------------------------------
// Stats — used by the admin dashboard KPI cards
// --------------------------------------------------------------

async function getStats() {
  // Counts that work in both modes
  const [unlisted, stocks] = await Promise.all([
    countUnlisted(),
    countStocks()
  ]);

  const stats = {
    unlisted,
    stocks,
    users: 0,
    leads: 0,
    newsletter: 0,
    contact: 0,
    db: isLive() ? "connected" : "seed-mode"
  };

  if (!isLive()) {
    // In seed mode the submission tables are write-and-forget — there is no
    // historical record to count, so we report 0 honestly.
    return stats;
  }

  const safeCount = async (table) => {
    try {
      const { count, error } = await client
        .from(table)
        .select("id", { count: "exact", head: true });
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  };
  const [users, leads, newsletter, contact] = await Promise.all([
    safeCount("app_users"),
    safeCount("leads"),
    (async () => {
      try {
        const { count, error } = await client
          .from("newsletter_subscribers")
          .select("email", { count: "exact", head: true });
        return error ? 0 : count || 0;
      } catch {
        return 0;
      }
    })(),
    safeCount("contact_messages")
  ]);
  stats.users = users;
  stats.leads = leads;
  stats.newsletter = newsletter;
  stats.contact = contact;
  return stats;
}

module.exports = {
  // unlisted
  listUnlisted,
  getUnlistedById,
  createUnlisted,
  updateUnlisted,
  deleteUnlisted,
  countUnlisted,
  // stocks
  listStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  countStocks,
  // submissions
  listLeads,
  updateLeadStatus,
  deleteLead,
  listNewsletter,
  deleteNewsletter,
  listContact,
  deleteContact,
  // dashboard
  getStats
};

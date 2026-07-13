"use strict";

/**
 * User + watchlist storage. Uses Supabase when a service-role key is
 * configured; otherwise falls back to an in-memory Map so the API still
 * works in zero-config "seed mode" (the same convention the rest of the
 * project follows).
 *
 * Public surface:
 *   createUser({ email, password_hash, name, mobile?, role? }) -> user
 *   getUserByEmail(email)                                       -> user|null
 *   getUserById(id)                                             -> user|null
 *   listUsers({ search?, limit? })                              -> [users]
 *   updateUser(id, patch)                                       -> user
 *   deleteUser(id)                                              -> boolean
 *   countUsers()                                                -> number
 *   listWatchlist(userId)                                       -> [items]
 *   addWatchlistItem(userId, payload)                           -> item
 *   removeWatchlistItem(userId, symbol)                         -> boolean
 *   clearWatchlist(userId)                                      -> number
 *
 * Roles:
 *   'user'        — default, no admin powers
 *   'admin'       — can read admin endpoints (reserved for future use)
 *   'superadmin'  — full admin powers (CRUD across every admin endpoint)
 */

const crypto = require("crypto");
const { client, isLive } = require("../db");

const USERS_TABLE = "app_users";
const WATCHLIST_TABLE = "watchlist_items";

const VALID_ROLES = new Set(["user", "admin", "superadmin"]);

// Columns we expose to the rest of the app. Kept narrow on purpose so a
// password_hash never leaks via a `select('*')`.
const USER_PUBLIC_COLS =
  "id, email, name, mobile, role, email_verified, created_at";

// ---------- in-memory fallback ----------
const mem = {
  users: new Map(),       // id -> user
  byEmail: new Map(),     // email (lower) -> id
  watchlists: new Map()   // userId -> Map(symbol -> item)
};

const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const norm = (s) => String(s || "").trim().toLowerCase();

const stripPwd = (u) => {
  if (!u) return null;
  // never leak the hash, even internally
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...rest } = u;
  return rest;
};

// ---------- users ----------

async function createUser({ email, password_hash, name, mobile, role, email_verified }) {
  const e = norm(email);
  if (!e || !password_hash || !name) {
    throw new Error("email, password_hash and name are required");
  }
  const safeRole = VALID_ROLES.has(role) ? role : "user";
  const id = newId();
  const row = {
    id,
    email: e,
    password_hash,
    name: String(name).trim(),
    mobile: mobile ? String(mobile).trim() : null,
    role: safeRole,
    email_verified: !!email_verified,
    otp_hash: null,
    otp_expires_at: null,
    otp_attempts: 0,
    otp_last_sent_at: null,
    otp_send_count_hour: 0,
    otp_send_window_at: null,
    created_at: now()
  };

  if (!isLive()) {
    if (mem.byEmail.has(e)) {
      const err = new Error("An account with this email already exists.");
      err.status = 409;
      throw err;
    }
    mem.users.set(id, row);
    mem.byEmail.set(e, id);
    return stripPwd(row);
  }

  // Supabase path
  const { data, error } = await client
    .from(USERS_TABLE)
    .insert(row)
    .select(USER_PUBLIC_COLS)
    .single();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("An account with this email already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data;
}

async function getUserByEmail(email) {
  const e = norm(email);
  if (!e) return null;
  if (!isLive()) {
    const id = mem.byEmail.get(e);
    return id ? mem.users.get(id) || null : null;
  }
  const { data, error } = await client
    .from(USERS_TABLE)
    .select("*")
    .eq("email", e)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function getUserById(id) {
  if (!id) return null;
  if (!isLive()) {
    return stripPwd(mem.users.get(id) || null);
  }
  const { data, error } = await client
    .from(USERS_TABLE)
    .select(USER_PUBLIC_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function listUsers({ search = "", limit = 200 } = {}) {
  const q = String(search || "").trim().toLowerCase();
  const cap = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  if (!isLive()) {
    let rows = Array.from(mem.users.values()).map(stripPwd);
    if (q) {
      rows = rows.filter(
        (u) =>
          (u.email || "").toLowerCase().includes(q) ||
          (u.name || "").toLowerCase().includes(q) ||
          (u.mobile || "").toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return rows.slice(0, cap);
  }
  let qb = client
    .from(USERS_TABLE)
    .select(USER_PUBLIC_COLS)
    .order("created_at", { ascending: false })
    .limit(cap);
  if (q) {
    // Supabase OR filter on a couple of columns. ilike for case-insensitive.
    qb = qb.or(
      `email.ilike.%${q}%,name.ilike.%${q}%,mobile.ilike.%${q}%`
    );
  }
  const { data, error } = await qb;
  if (error) throw new Error(error.message);
  return data || [];
}

async function updateUser(id, patch = {}) {
  if (!id) throw new Error("id required");
  const allowed = {};
  if (patch.name != null) allowed.name = String(patch.name).trim().slice(0, 80);
  if (patch.mobile !== undefined)
    allowed.mobile = patch.mobile ? String(patch.mobile).trim().slice(0, 20) : null;
  if (patch.role != null) {
    if (!VALID_ROLES.has(patch.role)) throw new Error("Invalid role");
    allowed.role = patch.role;
  }
  if (patch.password_hash) allowed.password_hash = patch.password_hash;
  if (patch.email_verified !== undefined)
    allowed.email_verified = !!patch.email_verified;
  if (Object.keys(allowed).length === 0) {
    return getUserById(id);
  }

  if (!isLive()) {
    const u = mem.users.get(id);
    if (!u) return null;
    Object.assign(u, allowed);
    mem.users.set(id, u);
    return stripPwd(u);
  }
  const { data, error } = await client
    .from(USERS_TABLE)
    .update(allowed)
    .eq("id", id)
    .select(USER_PUBLIC_COLS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function deleteUser(id) {
  if (!id) return false;
  if (!isLive()) {
    const u = mem.users.get(id);
    if (!u) return false;
    mem.users.delete(id);
    mem.byEmail.delete(u.email);
    mem.watchlists.delete(id);
    return true;
  }
  const { error, count } = await client
    .from(USERS_TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function countUsers() {
  if (!isLive()) return mem.users.size;
  const { count, error } = await client
    .from(USERS_TABLE)
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

// ---------- watchlist ----------

async function listWatchlist(userId) {
  if (!isLive()) {
    const map = mem.watchlists.get(userId);
    if (!map) return [];
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }
  const { data, error } = await client
    .from(WATCHLIST_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

async function addWatchlistItem(userId, payload) {
  const symbol = String(payload.symbol || "").trim().toUpperCase();
  if (!symbol) throw new Error("symbol is required");
  const row = {
    id: newId(),
    user_id: userId,
    symbol,
    name: payload.name ? String(payload.name).trim() : symbol,
    added_price:
      payload.price != null && Number.isFinite(Number(payload.price))
        ? Number(payload.price)
        : null,
    note: payload.note ? String(payload.note).slice(0, 280) : null,
    created_at: now()
  };

  if (!isLive()) {
    if (!mem.watchlists.has(userId)) mem.watchlists.set(userId, new Map());
    const map = mem.watchlists.get(userId);
    if (map.has(symbol)) return map.get(symbol); // idempotent
    map.set(symbol, row);
    return row;
  }

  // upsert by (user_id, symbol)
  const { data, error } = await client
    .from(WATCHLIST_TABLE)
    .upsert(row, { onConflict: "user_id,symbol", ignoreDuplicates: true })
    .select()
    .single();
  if (error) {
    // ignoreDuplicates returns no row when the conflict already existed.
    // Fall back to the existing record.
    const { data: existing } = await client
      .from(WATCHLIST_TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("symbol", symbol)
      .maybeSingle();
    if (existing) return existing;
    throw new Error(error.message);
  }
  return data;
}

async function removeWatchlistItem(userId, symbol) {
  const sym = String(symbol || "").trim().toUpperCase();
  if (!sym) return false;
  if (!isLive()) {
    const map = mem.watchlists.get(userId);
    if (!map) return false;
    return map.delete(sym);
  }
  const { error, count } = await client
    .from(WATCHLIST_TABLE)
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("symbol", sym);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function clearWatchlist(userId) {
  if (!isLive()) {
    const map = mem.watchlists.get(userId);
    if (!map) return 0;
    const n = map.size;
    map.clear();
    return n;
  }
  const { error, count } = await client
    .from(WATCHLIST_TABLE)
    .delete({ count: "exact" })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return count || 0;
}

// ---------- OTP helpers ----------
//
// We never store the raw OTP; only a SHA-256 hash. The OTP itself is sent
// to the user's inbox and (in dev mode) printed to the server log.

const OTP_TTL_MS = 10 * 60 * 1000;            // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;     // 1 minute between sends
const OTP_MAX_SENDS_PER_HOUR = 5;             // anti-abuse
const OTP_MAX_ATTEMPTS = 6;                   // wrong-guess attempts

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function generateOtp() {
  // 6-digit, leading zeros allowed
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Persist a freshly issued OTP for the user. Returns the plaintext OTP
 *  so the caller can email it. */
async function setUserOtp(userId) {
  const otp = generateOtp();
  const otp_hash = hashOtp(otp);
  const expires = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const sentAt = now();

  if (!isLive()) {
    const u = mem.users.get(userId);
    if (!u) throw new Error("User not found");
    // rolling 1-hour anti-abuse window
    const windowStart = u.otp_send_window_at
      ? new Date(u.otp_send_window_at).getTime()
      : 0;
    const inWindow = Date.now() - windowStart < 60 * 60 * 1000;
    u.otp_send_count_hour = inWindow ? (u.otp_send_count_hour || 0) + 1 : 1;
    u.otp_send_window_at = inWindow ? u.otp_send_window_at : sentAt;
    u.otp_hash = otp_hash;
    u.otp_expires_at = expires;
    u.otp_attempts = 0;
    u.otp_last_sent_at = sentAt;
    return { otp, sendsThisHour: u.otp_send_count_hour };
  }

  // Supabase path — read current counter, then update
  const { data: cur } = await client
    .from(USERS_TABLE)
    .select("otp_send_count_hour, otp_send_window_at")
    .eq("id", userId)
    .maybeSingle();
  const windowStart = cur?.otp_send_window_at
    ? new Date(cur.otp_send_window_at).getTime()
    : 0;
  const inWindow = Date.now() - windowStart < 60 * 60 * 1000;
  const sendsThisHour = inWindow ? (cur?.otp_send_count_hour || 0) + 1 : 1;
  const window_at = inWindow ? cur.otp_send_window_at : sentAt;
  const { error } = await client
    .from(USERS_TABLE)
    .update({
      otp_hash,
      otp_expires_at: expires,
      otp_attempts: 0,
      otp_last_sent_at: sentAt,
      otp_send_count_hour: sendsThisHour,
      otp_send_window_at: window_at
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  return { otp, sendsThisHour };
}

/** Returns the raw user record (not stripped) — internal use only. */
async function getUserInternal(id) {
  if (!isLive()) return mem.users.get(id) || null;
  const { data, error } = await client
    .from(USERS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

/** Validate an OTP against a user. On match, clears OTP fields and sets
 *  email_verified=true atomically. */
async function consumeOtp(userId, otpInput) {
  const u = await getUserInternal(userId);
  if (!u) return { ok: false, reason: "not_found" };
  if (u.email_verified) return { ok: true, alreadyVerified: true };

  if (!u.otp_hash || !u.otp_expires_at) {
    return { ok: false, reason: "no_pending_otp" };
  }
  if (new Date(u.otp_expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if ((u.otp_attempts || 0) >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }
  const candidate = String(otpInput || "").trim();
  if (!/^\d{6}$/.test(candidate)) {
    await bumpOtpAttempts(userId);
    return { ok: false, reason: "invalid_format" };
  }
  const matches =
    hashOtp(candidate).length === u.otp_hash.length &&
    crypto.timingSafeEqual(
      Buffer.from(hashOtp(candidate), "hex"),
      Buffer.from(u.otp_hash, "hex")
    );
  if (!matches) {
    await bumpOtpAttempts(userId);
    return { ok: false, reason: "wrong_code" };
  }
  // success: mark verified, clear OTP fields
  if (!isLive()) {
    u.email_verified = true;
    u.otp_hash = null;
    u.otp_expires_at = null;
    u.otp_attempts = 0;
    return { ok: true };
  }
  const { error } = await client
    .from(USERS_TABLE)
    .update({
      email_verified: true,
      otp_hash: null,
      otp_expires_at: null,
      otp_attempts: 0
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

async function bumpOtpAttempts(userId) {
  if (!isLive()) {
    const u = mem.users.get(userId);
    if (!u) return;
    u.otp_attempts = (u.otp_attempts || 0) + 1;
    return;
  }
  const { data } = await client
    .from(USERS_TABLE)
    .select("otp_attempts")
    .eq("id", userId)
    .maybeSingle();
  await client
    .from(USERS_TABLE)
    .update({ otp_attempts: (data?.otp_attempts || 0) + 1 })
    .eq("id", userId);
}

/** Throws an error if the user has hit the resend cooldown / rate-limit.
 *  Otherwise returns silently. */
async function checkResendAllowed(userId) {
  const u = await getUserInternal(userId);
  if (!u) throw new Error("User not found");
  if (u.otp_last_sent_at) {
    const since = Date.now() - new Date(u.otp_last_sent_at).getTime();
    if (since < OTP_RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((OTP_RESEND_COOLDOWN_MS - since) / 1000);
      const err = new Error(
        `Please wait ${wait}s before requesting another code.`
      );
      err.status = 429;
      err.retryAfter = wait;
      throw err;
    }
  }
  if (u.otp_send_window_at) {
    const inWindow =
      Date.now() - new Date(u.otp_send_window_at).getTime() < 60 * 60 * 1000;
    if (inWindow && (u.otp_send_count_hour || 0) >= OTP_MAX_SENDS_PER_HOUR) {
      const err = new Error(
        "Too many codes requested. Try again in an hour."
      );
      err.status = 429;
      throw err;
    }
  }
}

// ---------- super-admin bootstrap ----------
//
// On first boot, if SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are set in the
// environment, we make sure exactly one super-admin exists with those
// credentials. If the account doesn't exist we create it; if it exists with
// a different role we promote it. We never automatically rotate passwords —
// that would be a footgun every time the process restarts.
async function bootstrapSuperAdmin({ hashPassword }) {
  const email = norm(process.env.SUPERADMIN_EMAIL);
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = (process.env.SUPERADMIN_NAME || "Super Admin").trim();
  if (!email || !password) {
    return { skipped: true, reason: "SUPERADMIN_EMAIL/PASSWORD not set" };
  }
  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      if (existing.role !== "superadmin") {
        await updateUser(existing.id, { role: "superadmin" });
        return { promoted: true, email };
      }
      return { existed: true, email };
    }
    const password_hash = hashPassword(password);
    await createUser({
      email,
      password_hash,
      name,
      role: "superadmin"
    });
    return { created: true, email };
  } catch (e) {
    return { error: e.message };
  }
}

// ---------- test-user bootstrap ----------
//
// On boot, ensure a verified test user exists so QA can sign in without
// going through the OTP flow. Set TEST_USER_EMAIL + TEST_USER_PASSWORD in
// the env to enable. Defaults are baked in so the README credentials work
// out of the box for local dev.

async function bootstrapTestUser({ hashPassword }) {
  const email = norm(
    process.env.TEST_USER_EMAIL || "tester@finvoq.local"
  );
  const password = process.env.TEST_USER_PASSWORD || "Test@1234";
  const name = (process.env.TEST_USER_NAME || "Test Investor").trim();
  if (!email || !password) {
    return { skipped: true, reason: "TEST_USER_EMAIL/PASSWORD not set" };
  }
  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      // Make sure they're verified — promotes pre-existing test rows that
      // were created before email_verified was added.
      if (!existing.email_verified) {
        await updateUser(existing.id, { email_verified: true });
        return { promoted: true, email };
      }
      return { existed: true, email };
    }
    const password_hash = hashPassword(password);
    await createUser({
      email,
      password_hash,
      name,
      role: "user",
      email_verified: true
    });
    return { created: true, email };
  } catch (e) {
    return { error: e.message };
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUserInternal,
  listUsers,
  updateUser,
  deleteUser,
  countUsers,
  listWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  clearWatchlist,
  bootstrapSuperAdmin,
  bootstrapTestUser,
  setUserOtp,
  consumeOtp,
  checkResendAllowed,
  stripPwd,
  VALID_ROLES,
  OTP_TTL_MS,
  OTP_RESEND_COOLDOWN_MS
};

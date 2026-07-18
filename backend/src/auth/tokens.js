"use strict";

/**
 * Tiny dependency-free auth primitives:
 *   - scrypt-based password hashing
 *   - HMAC-SHA256 signed token (JWT-ish, header omitted)
 *
 * We deliberately avoid `bcrypt`, `bcryptjs`, and `jsonwebtoken` so the
 * project keeps booting on machines that haven't run `npm install` for
 * native modules and so the dependency surface stays minimal.
 */

const crypto = require("crypto");

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SECRET =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  // Stable per-process fallback — fine for local dev / seed mode. The README
  // recommends overriding AUTH_SECRET in any real deployment.
  "finvoq-dev-secret-change-me";

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

const b64urlDecode = (str) => {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
};

function hashPassword(plain) {
  if (typeof plain !== "string" || plain.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(plain, stored) {
  if (!stored || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  let actual;
  try {
    actual = crypto.scryptSync(plain, salt, expected.length);
  } catch {
    return false;
  }
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function signToken(payload, ttlMs = TOKEN_TTL_MS) {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + ttlMs
  };
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest();
  let provided;
  try {
    provided = b64urlDecode(sig);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(provided, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(b64urlDecode(data).toString("utf8"));
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  if (payload.exp && payload.exp < Date.now()) return null;
  return payload;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  TOKEN_TTL_MS
};

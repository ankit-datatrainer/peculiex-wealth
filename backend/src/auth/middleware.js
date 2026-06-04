"use strict";

const { verifyToken } = require("./tokens");
const { getUserById } = require("./store");

/**
 * requireAuth — Express middleware. Reads `Authorization: Bearer <token>`,
 * verifies the HMAC, looks up the user, and attaches `req.user`. On failure
 * it short-circuits with 401.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || typeof header !== "string") {
      return res.status(401).json({ error: "Authentication required." });
    }
    const m = /^Bearer\s+(.+)$/i.exec(header);
    if (!m) return res.status(401).json({ error: "Malformed Authorization header." });
    const payload = verifyToken(m[1].trim());
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }
    const user = await getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Account not found." });
    }
    req.user = user;
    req.token = m[1].trim();
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireAdmin — chains after requireAuth. Allows `superadmin` (full access)
 * and `admin` (reserved). Plain users get 403.
 */
function requireAdmin(req, res, next) {
  const role = req.user && req.user.role;
  if (role === "superadmin" || role === "admin") return next();
  return res
    .status(403)
    .json({ error: "Admin privileges required for this action." });
}

/** requireSuperAdmin — strictest gate. Use for destructive ops like
 *  deleting another admin or rotating roles. */
function requireSuperAdmin(req, res, next) {
  const role = req.user && req.user.role;
  if (role === "superadmin") return next();
  return res
    .status(403)
    .json({ error: "Super-admin privileges required." });
}

module.exports = { requireAuth, requireAdmin, requireSuperAdmin };

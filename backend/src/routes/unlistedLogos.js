"use strict";

/**
 * Unlisted-share logo upload — lets a super-admin/admin/manager upload an
 * actual image file (not just paste a URL) for a company's logo. Stored on
 * disk under backend/uploads/unlisted-logos/<id>.<ext> and served publicly
 * (product logos are meant to be visible to every visitor). Mirrors the
 * factsheets.js pattern: mounted before the global small JSON body limit so
 * this route can accept a larger base64 image payload.
 */
const { Router } = require("express");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth } = require("../auth/middleware");
const admin = require("../admin/store");

const router = Router();

// This whole route is unlisted-share-specific, so managers are always
// allowed here (not just when the URL happens to start with /unlisted).
function requireUnlistedAccess(req, res, next) {
  const role = req.user && req.user.role;
  if (role === "superadmin" || role === "admin" || role === "manager") return next();
  return res.status(403).json({ error: "Admin or manager privileges required." });
}

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "unlisted-logos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT_BY_MAGIC = [
  { magic: [0x89, 0x50, 0x4e, 0x47], ext: "png" },
  { magic: [0xff, 0xd8, 0xff], ext: "jpg" },
  { magic: [0x47, 0x49, 0x46, 0x38], ext: "gif" },
  { magic: [0x52, 0x49, 0x46, 0x46], ext: "webp" } // RIFF....WEBP
];

function detectExt(buffer) {
  for (const { magic, ext } of EXT_BY_MAGIC) {
    if (magic.every((b, i) => buffer[i] === b)) return ext;
  }
  return null;
}

// ---------- public: serve an uploaded logo ----------
router.get("/file/:filename", (req, res) => {
  const filename = String(req.params.filename || "").replace(/[^a-zA-Z0-9._-]/g, "");
  const file = path.join(UPLOAD_DIR, filename);
  if (!file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) {
    return res.status(404).json({ error: "Not found" });
  }
  res.setHeader("Cache-Control", "public, max-age=86400");
  fs.createReadStream(file).pipe(res);
});

// ---------- admin/manager: upload / replace a company's logo ----------
router.post(
  "/:id",
  requireAuth,
  requireUnlistedAccess,
  express.json({ limit: "8mb" }),
  async (req, res) => {
    try {
      const id = String(req.params.id || "").trim();
      if (!id) return res.status(400).json({ error: "Missing share id." });

      const item = await admin.getUnlistedById(id);
      if (!item) return res.status(404).json({ error: "Unlisted share not found." });

      let dataBase64 = (req.body && req.body.dataBase64) || "";
      const comma = dataBase64.indexOf(",");
      if (dataBase64.startsWith("data:") && comma !== -1) {
        dataBase64 = dataBase64.slice(comma + 1);
      }
      if (!dataBase64) return res.status(400).json({ error: "Missing image data." });

      let buffer;
      try {
        buffer = Buffer.from(dataBase64, "base64");
      } catch {
        return res.status(400).json({ error: "Invalid image data." });
      }
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(413).json({ error: "Image too large (max 5 MB)." });
      }
      const ext = detectExt(buffer);
      if (!ext) {
        return res.status(400).json({ error: "Only PNG, JPG, GIF or WEBP images are allowed." });
      }

      // Clean up any previous upload for this item (any extension).
      for (const f of fs.readdirSync(UPLOAD_DIR)) {
        if (f.startsWith(`${id}.`)) fs.unlinkSync(path.join(UPLOAD_DIR, f));
      }

      const filename = `${id}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

      const logo_url = `/api/unlisted-logos/file/${filename}?v=${Date.now()}`;
      const updated = await admin.updateUnlisted(id, { logo_url });

      res.json({ ok: true, item: updated, logo_url });
    } catch (e) {
      res.status(500).json({ error: e.message || "Upload failed." });
    }
  }
);

module.exports = router;

"use strict";

/**
 * Site content API.
 *
 *   GET    /api/content              merged content for every page (public)
 *   GET    /api/content/schema       field definitions + saved status (admin)
 *   GET    /api/content/:page        merged content for one page (public)
 *   PUT    /api/content/:page        save overrides (super-admin)
 *   DELETE /api/content/:page        reset to the copy shipped in code
 *   POST   /api/content/upload       upload an image, returns its URL
 *
 * Saves broadcast a CONTENT_UPDATED frame over the existing WebSocket so
 * open browsers repaint immediately instead of waiting for a refresh.
 *
 * This router is mounted before the global JSON body limit so the upload
 * route can accept a base64 image (same approach as factsheets.js).
 */

const { Router } = require("express");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth, requireSuperAdmin } = require("../auth/middleware");
const schema = require("../content/schema");
const store = require("../content/store");

let broadcast = () => {};
try {
  ({ broadcast } = require("../wsServer"));
} catch {
  /* WS is optional: the CMS still works, it just falls back to polling. */
}

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "content-images");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const EXT_BY_MAGIC = [
  { magic: [0x89, 0x50, 0x4e, 0x47], ext: "png" },
  { magic: [0xff, 0xd8, 0xff], ext: "jpg" },
  { magic: [0x47, 0x49, 0x46, 0x38], ext: "gif" },
  { magic: [0x52, 0x49, 0x46, 0x46], ext: "webp" }
];

function detectExt(buf) {
  for (const { magic, ext } of EXT_BY_MAGIC) {
    if (magic.every((b, i) => buf[i] === b)) return ext;
  }
  // SVG is text, so sniff the markup instead of a binary signature.
  const head = buf.slice(0, 200).toString("utf8").trim().toLowerCase();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return "svg";
  return null;
}

/* ── public reads ───────────────────────────────────────────────── */

router.get("/", async (_req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.json({ pages: await store.getAll() });
  } catch (e) {
    res.status(500).json({ error: e.message || "Could not load content." });
  }
});

// Declared before /:page so the literal path is not read as a page key.
router.get("/schema", requireAuth, requireSuperAdmin, async (_req, res) => {
  try {
    res.json({
      pages: schema.publicSchema(),
      status: await store.statuses(),
      content: await store.getAll()
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Could not load schema." });
  }
});

// Serve an uploaded image. Public: these are site assets.
router.get("/image/:filename", (req, res) => {
  const name = String(req.params.filename || "").replace(/[^a-zA-Z0-9._-]/g, "");
  const file = path.join(UPLOAD_DIR, name);
  if (!file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) {
    return res.status(404).json({ error: "Not found" });
  }
  if (name.endsWith(".svg")) res.type("image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  fs.createReadStream(file).pipe(res);
});

router.get("/:page", async (req, res) => {
  const page = String(req.params.page || "");
  if (!schema.hasPage(page)) return res.status(404).json({ error: "Unknown page." });
  try {
    res.setHeader("Cache-Control", "no-store");
    res.json({ page, content: await store.getPage(page) });
  } catch (e) {
    res.status(500).json({ error: e.message || "Could not load page." });
  }
});

/* ── admin writes ───────────────────────────────────────────────── */

router.post(
  "/upload",
  requireAuth,
  requireSuperAdmin,
  express.json({ limit: "8mb" }),
  (req, res) => {
    const raw = String((req.body && req.body.image) || "");
    const base64 = raw.includes(",") ? raw.split(",").pop() : raw;
    if (!base64) return res.status(400).json({ error: "No image supplied." });

    let buf;
    try {
      buf = Buffer.from(base64, "base64");
    } catch {
      return res.status(400).json({ error: "Image is not valid base64." });
    }
    if (!buf.length) return res.status(400).json({ error: "Image is empty." });
    if (buf.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: "Image is larger than 6 MB." });
    }
    const ext = detectExt(buf);
    if (!ext) {
      return res
        .status(400)
        .json({ error: "Unsupported format. Use PNG, JPG, GIF, WEBP or SVG." });
    }

    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    try {
      fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    } catch (e) {
      return res.status(500).json({ error: e.message || "Could not save image." });
    }
    res.json({ ok: true, url: `/api/content/image/${name}`, bytes: buf.length });
  }
);

router.put(
  "/:page",
  requireAuth,
  requireSuperAdmin,
  express.json({ limit: "2mb" }),
  async (req, res) => {
    const page = String(req.params.page || "");
    if (!schema.hasPage(page)) return res.status(404).json({ error: "Unknown page." });
    try {
      const content = await store.savePage(
        page,
        req.body && req.body.content,
        (req.user && req.user.email) || "admin"
      );
      broadcast("CONTENT_UPDATED", { page, content });
      res.json({ ok: true, page, content });
    } catch (e) {
      res.status(500).json({ error: e.message || "Could not save." });
    }
  }
);

router.delete("/:page", requireAuth, requireSuperAdmin, async (req, res) => {
  const page = String(req.params.page || "");
  if (!schema.hasPage(page)) return res.status(404).json({ error: "Unknown page." });
  try {
    const content = await store.resetPage(page);
    broadcast("CONTENT_UPDATED", { page, content });
    res.json({ ok: true, page, content });
  } catch (e) {
    res.status(500).json({ error: e.message || "Could not reset." });
  }
});

module.exports = router;

"use strict";

/**
 * Factsheets — dynamic per-product PDF documents that a super-admin can upload
 * and replace from the admin panel, with zero code changes. Files are stored on
 * disk under `backend/uploads/factsheets/<slug>.pdf` and a small JSON manifest
 * tracks metadata. Public routes let the website embed the current PDF; the
 * upload/delete routes are gated to super-admins.
 *
 * Upload uses a plain JSON body ({ slug, filename, dataBase64 }) so we don't
 * need multipart parsing — the frontend reads the File as base64 and posts it.
 */

const { Router } = require("express");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth, requireSuperAdmin } = require("../auth/middleware");

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "factsheets");
const MANIFEST = path.join(UPLOAD_DIR, "_manifest.json");

// Ensure the storage directory exists.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const safeSlug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

function writeManifest(obj) {
  fs.writeFileSync(MANIFEST, JSON.stringify(obj, null, 2));
}

// ---------- public: list all factsheets ----------
router.get("/", (_req, res) => {
  res.json({ items: readManifest() });
});

// ---------- public: metadata for one product ----------
router.get("/:slug", (req, res) => {
  const slug = safeSlug(req.params.slug);
  const manifest = readManifest();
  const entry = manifest[slug];
  if (!entry) return res.status(404).json({ exists: false });
  res.json({ exists: true, ...entry, url: `/api/factsheets/file/${slug}` });
});

// ---------- public: stream the PDF file ----------
router.get("/file/:slug", (req, res) => {
  const slug = safeSlug(req.params.slug);
  const file = path.join(UPLOAD_DIR, `${slug}.pdf`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${slug}.pdf"`);
  fs.createReadStream(file).pipe(res);
});

// ---------- admin: upload / replace a factsheet ----------
// Larger JSON limit only on this route (a PDF as base64 can be several MB).
router.post(
  "/",
  requireAuth,
  requireSuperAdmin,
  express.json({ limit: "30mb" }),
  (req, res) => {
    const slug = safeSlug(req.body && req.body.slug);
    const filename = String((req.body && req.body.filename) || `${slug}.pdf`);
    let dataBase64 = (req.body && req.body.dataBase64) || "";

    if (!slug) return res.status(400).json({ error: "Missing product slug." });
    // Strip a data-URL prefix if present (e.g. "data:application/pdf;base64,")
    const comma = dataBase64.indexOf(",");
    if (dataBase64.startsWith("data:") && comma !== -1) {
      dataBase64 = dataBase64.slice(comma + 1);
    }
    if (!dataBase64) return res.status(400).json({ error: "Missing file data." });

    let buffer;
    try {
      buffer = Buffer.from(dataBase64, "base64");
    } catch {
      return res.status(400).json({ error: "Invalid file data." });
    }
    // Basic guardrails: PDF magic header + size cap (20 MB).
    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(413).json({ error: "File too large (max 20 MB)." });
    }
    if (buffer.slice(0, 5).toString("latin1") !== "%PDF-") {
      return res.status(400).json({ error: "Only PDF files are allowed." });
    }

    try {
      fs.writeFileSync(path.join(UPLOAD_DIR, `${slug}.pdf`), buffer);
      const manifest = readManifest();
      manifest[slug] = {
        filename,
        size: buffer.length,
        updatedAt: new Date().toISOString(),
        updatedBy: (req.user && req.user.email) || "admin"
      };
      writeManifest(manifest);
      res.json({ ok: true, slug, url: `/api/factsheets/file/${slug}`, ...manifest[slug] });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to save file." });
    }
  }
);

// ---------- admin: delete a factsheet ----------
router.delete("/:slug", requireAuth, requireSuperAdmin, (req, res) => {
  const slug = safeSlug(req.params.slug);
  try {
    const file = path.join(UPLOAD_DIR, `${slug}.pdf`);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const manifest = readManifest();
    delete manifest[slug];
    writeManifest(manifest);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to delete." });
  }
});

module.exports = router;

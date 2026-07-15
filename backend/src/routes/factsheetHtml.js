"use strict";

/**
 * HTML factsheets — a super-admin pastes a complete HTML document for a
 * product and it renders on that product's page with no code change.
 *
 * SECURITY: the stored HTML is arbitrary markup + CSS + JS, so it is NEVER
 * injected into the site's own DOM. The frontend renders it inside a
 * sandboxed iframe on an opaque origin (see FactsheetEmbed.tsx), which means
 * it cannot read cookies, tokens or anything else belonging to the site.
 * These routes therefore store the document as-is rather than trying to
 * sanitise it — sanitising would break legitimate factsheets (they rely on
 * their own <style> and <script>), and the iframe is what actually contains
 * the risk. Write access stays restricted to super-admins.
 *
 * Storage mirrors the PDF factsheet route: a file per slug on disk plus a
 * small JSON manifest for metadata.
 */

const { Router } = require("express");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth, requireSuperAdmin } = require("../auth/middleware");

const router = Router();

const HTML_DIR = path.join(__dirname, "..", "..", "uploads", "factsheet-html");
const MANIFEST = path.join(HTML_DIR, "_manifest.json");

// Factsheets shipped with the repo. An admin upload for the same slug takes
// precedence; these are never written to, so "Remove" always reveals the
// bundled version again rather than leaving the product with nothing.
const DEFAULT_DIR = path.join(__dirname, "..", "data", "factsheet-html");

// The factsheet offered as the starting template in the admin prompt.
const TEMPLATE_SLUG = "mutual-funds";

fs.mkdirSync(HTML_DIR, { recursive: true });

// 2 MB is far beyond any hand-written factsheet but stops a runaway paste.
const MAX_BYTES = 2 * 1024 * 1024;

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

function htmlPath(slug) {
  return path.join(HTML_DIR, `${slug}.html`);
}

function defaultPath(slug) {
  return path.join(DEFAULT_DIR, `${slug}.html`);
}

/** Admin upload wins; otherwise fall back to the version bundled in the repo. */
function resolveHtml(slug) {
  const custom = htmlPath(slug);
  if (fs.existsSync(custom)) {
    return { html: fs.readFileSync(custom, "utf8"), source: "custom" };
  }
  const bundled = defaultPath(slug);
  if (fs.existsSync(bundled)) {
    return { html: fs.readFileSync(bundled, "utf8"), source: "default" };
  }
  return null;
}

// ---------- public: which products have an HTML factsheet ----------
router.get("/", (_req, res) => {
  const manifest = readManifest();
  let defaults = [];
  try {
    defaults = fs
      .readdirSync(DEFAULT_DIR)
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.replace(/\.html$/, ""));
  } catch {
    defaults = [];
  }
  res.json({ items: manifest, defaults });
});

// ---------- admin: the starter template for the "generate with AI" prompt ----------
// Declared before /:slug so it isn't swallowed by the slug route.
router.get("/__template", (_req, res) => {
  const found = resolveHtml(TEMPLATE_SLUG);
  if (!found) return res.status(404).json({ error: "No template available." });
  res.json({ slug: TEMPLATE_SLUG, html: found.html });
});

// ---------- public: the HTML document for one product ----------
router.get("/:slug", (req, res) => {
  const slug = safeSlug(req.params.slug);
  if (!slug) return res.status(404).json({ exists: false });
  const found = resolveHtml(slug);
  if (!found) return res.status(404).json({ exists: false });
  const entry = readManifest()[slug] || {};
  res.json({ exists: true, slug, html: found.html, source: found.source, ...entry });
});

// ---------- admin: create / replace ----------
router.post(
  "/:slug",
  requireAuth,
  requireSuperAdmin,
  express.json({ limit: "4mb" }),
  (req, res) => {
    const slug = safeSlug(req.params.slug);
    const html = String((req.body && req.body.html) || "");

    if (!slug) return res.status(400).json({ error: "Missing product slug." });
    if (!html.trim()) return res.status(400).json({ error: "The HTML is empty." });
    if (Buffer.byteLength(html, "utf8") > MAX_BYTES) {
      return res.status(413).json({ error: "HTML is too large (max 2 MB)." });
    }
    // A factsheet must actually be markup — catches pasting a PDF or prose.
    if (!/<[a-z!][\s\S]*>/i.test(html)) {
      return res.status(400).json({ error: "That doesn't look like HTML." });
    }

    try {
      fs.writeFileSync(htmlPath(slug), html, "utf8");
      const manifest = readManifest();
      manifest[slug] = {
        size: Buffer.byteLength(html, "utf8"),
        updatedAt: new Date().toISOString(),
        updatedBy: (req.user && req.user.email) || "admin"
      };
      writeManifest(manifest);
      res.json({ ok: true, slug, ...manifest[slug] });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to save." });
    }
  }
);

// ---------- admin: delete ----------
router.delete("/:slug", requireAuth, requireSuperAdmin, (req, res) => {
  const slug = safeSlug(req.params.slug);
  try {
    const file = htmlPath(slug);
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

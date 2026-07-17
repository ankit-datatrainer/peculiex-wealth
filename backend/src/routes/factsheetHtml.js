"use strict";

/**
 * HTML factsheets — a super-admin pastes a complete HTML document for a
 * product and it renders on that product's page with no code change.
 *
 * LIGHT / DARK: a factsheet can have a separate document per theme. The site
 * requests `?theme=light` or `?theme=dark` and gets the matching variant.
 * A single "base" upload (no variant) is still supported and is used for both
 * themes when a theme-specific one isn't present — so older single uploads
 * keep working unchanged.
 *
 * SECURITY: the stored HTML is arbitrary markup + CSS + JS, so it is NEVER
 * injected into the site's own DOM. The frontend renders it inside a
 * sandboxed iframe on an opaque origin (see FactsheetEmbed.tsx), which means
 * it cannot read cookies, tokens or anything else belonging to the site.
 * Write access stays restricted to super-admins.
 *
 * Storage: a file per slug+variant on disk plus a small JSON manifest.
 *   <slug>.html        → base (both themes)
 *   <slug>.light.html  → light theme
 *   <slug>.dark.html   → dark theme
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

// Normalise a variant to "light" | "dark" | "base".
const safeVariant = (v) => {
  const t = String(v || "").toLowerCase();
  return t === "light" || t === "dark" ? t : "base";
};

function readManifest() {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
  // Migrate old flat entries ({size,updatedAt,updatedBy}) to the variant shape
  // ({base:{...}}) so everything downstream sees one consistent structure.
  for (const slug of Object.keys(raw)) {
    const e = raw[slug];
    if (e && (e.size != null || e.updatedAt != null) && !e.base && !e.light && !e.dark) {
      raw[slug] = { base: e };
    }
  }
  return raw;
}

function writeManifest(obj) {
  fs.writeFileSync(MANIFEST, JSON.stringify(obj, null, 2));
}

// File on disk for a given slug + variant.
function htmlPath(slug, variant = "base") {
  const suffix = variant === "light" || variant === "dark" ? `.${variant}` : "";
  return path.join(HTML_DIR, `${slug}${suffix}.html`);
}

function defaultPath(slug) {
  return path.join(DEFAULT_DIR, `${slug}.html`);
}

const readFile = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);

/**
 * Resolve the HTML to serve for a slug in a given theme, most-specific first:
 *   1. custom themed  (<slug>.<theme>.html)
 *   2. custom base    (<slug>.html)
 *   3. bundled default(<slug>.html in the repo)
 * theme is "light" | "dark" | undefined (base only).
 */
function resolveHtml(slug, theme) {
  if (theme === "light" || theme === "dark") {
    const themed = readFile(htmlPath(slug, theme));
    if (themed != null) return { html: themed, source: "custom", variant: theme };
  }
  const base = readFile(htmlPath(slug, "base"));
  if (base != null) return { html: base, source: "custom", variant: "base" };
  const bundled = readFile(defaultPath(slug));
  if (bundled != null) return { html: bundled, source: "default", variant: "base" };
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

// ---------- public: the HTML document for one product (theme-aware) ----------
router.get("/:slug", (req, res) => {
  const slug = safeSlug(req.params.slug);
  if (!slug) return res.status(404).json({ exists: false });
  const theme = req.query.theme === "dark" ? "dark" : req.query.theme === "light" ? "light" : undefined;
  const found = resolveHtml(slug, theme);
  if (!found) return res.status(404).json({ exists: false });
  const entry = readManifest()[slug] || {};
  res.json({
    exists: true,
    slug,
    theme: theme || null,
    html: found.html,
    source: found.source,
    servedVariant: found.variant,
    variants: entry // { base?, light?, dark? } metadata
  });
});

// ---------- admin: create / replace (optionally per variant) ----------
router.post(
  "/:slug",
  requireAuth,
  requireSuperAdmin,
  express.json({ limit: "4mb" }),
  (req, res) => {
    const slug = safeSlug(req.params.slug);
    const variant = safeVariant(req.body && req.body.variant);
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
      fs.writeFileSync(htmlPath(slug, variant), html, "utf8");
      const manifest = readManifest();
      const entry = manifest[slug] || {};
      entry[variant] = {
        size: Buffer.byteLength(html, "utf8"),
        updatedAt: new Date().toISOString(),
        updatedBy: (req.user && req.user.email) || "admin"
      };
      manifest[slug] = entry;
      writeManifest(manifest);
      res.json({ ok: true, slug, variant, ...entry[variant] });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to save." });
    }
  }
);

// ---------- admin: delete (one variant, or all with ?variant=all) ----------
router.delete("/:slug", requireAuth, requireSuperAdmin, (req, res) => {
  const slug = safeSlug(req.params.slug);
  const which = String(req.query.variant || "all").toLowerCase();
  try {
    const manifest = readManifest();
    const entry = manifest[slug] || {};
    const targets =
      which === "light" || which === "dark" || which === "base"
        ? [which]
        : ["base", "light", "dark"];
    for (const v of targets) {
      const f = htmlPath(slug, v);
      if (fs.existsSync(f)) fs.unlinkSync(f);
      delete entry[v];
    }
    if (Object.keys(entry).length === 0) delete manifest[slug];
    else manifest[slug] = entry;
    writeManifest(manifest);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to delete." });
  }
});

module.exports = router;

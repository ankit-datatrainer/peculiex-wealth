"use strict";

/**
 * Public (no auth) read-only blog endpoints.
 * GET /api/blogs        — list published blogs
 * GET /api/blogs/:slug  — get a single published blog by slug
 */

const { Router } = require("express");
const admin = require("../admin/store");

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const items = await admin.listBlogs({ publishedOnly: true });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ error: "slug required" });
    const item = await admin.getBlogBySlug(slug);
    if (!item || !item.published) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

"use strict";

/**
 * Blog image upload — lets a super-admin/admin upload a cover image for a
 * blog post. Stored on disk under backend/uploads/blog-images/<id>.<ext> and
 * served publicly. Mirrors the unlisted-logos upload pattern.
 */
const { Router } = require("express");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth } = require("../auth/middleware");
const admin = require("../admin/store");

const router = Router();

function requireBlogAccess(req, res, next) {
  const role = req.user && req.user.role;
  if (role === "superadmin" || role === "admin") return next();
  return res.status(403).json({ error: "Admin privileges required." });
}

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "blog-images");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT_BY_MAGIC = [
  { magic: [0x89, 0x50, 0x4e, 0x47], ext: "png" },
  { magic: [0xff, 0xd8, 0xff], ext: "jpg" },
  { magic: [0x47, 0x49, 0x46, 0x38], ext: "gif" },
  { magic: [0x52, 0x49, 0x46, 0x46], ext: "webp" }
];

function detectExt(buffer) {
  for (const { magic, ext } of EXT_BY_MAGIC) {
    if (magic.every((b, i) => buffer[i] === b)) return ext;
  }
  return null;
}

// ---------- public: serve an uploaded blog image ----------
router.get("/file/:filename", async (req, res) => {
  const filename = String(req.params.filename || "").replace(/[^a-zA-Z0-9._-]/g, "");
  let file = path.join(UPLOAD_DIR, filename);

  if (!file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) {
    // Fallback for the old cover naming "<blogId>-<timestamp>.<ext>": a cover
    // that was re-uploaded under a new timestamp is still found by its blog id.
    // Only for real ids — "media-…" names would otherwise match any other
    // media file and serve the wrong picture.
    const baseId = filename.split(".")[0].split("-")[0];
    if (baseId && /^[0-9a-f]{8}$/i.test(baseId)) {
      try {
        const match = fs.readdirSync(UPLOAD_DIR).find((f) => f.startsWith(baseId));
        if (match) {
          file = path.join(UPLOAD_DIR, match);
        }
      } catch {}
    }
  }

  if (!file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) {
    // Uploads live on the server's disk, so a local copy of the site has none
    // of the live images. In development, set BLOG_IMAGE_FALLBACK_ORIGIN (e.g.
    // https://finvoq.com): a missing image is downloaded from there once,
    // saved into uploads/blog-images, and served locally from then on.
    // (Redirecting doesn't work: the live site's Cross-Origin-Resource-Policy
    // stops browsers showing its images on another origin.)
    const origin = (process.env.BLOG_IMAGE_FALLBACK_ORIGIN || "").replace(/\/+$/, "");
    const host = req.get("host") || "(no host)";
    if (origin && filename && !origin.includes(host)) {
      try {
        const r = await fetch(`${origin}/api/blog-images/file/${encodeURIComponent(filename)}`, {
          signal: AbortSignal.timeout(15000)
        });
        const buf = Buffer.from(await r.arrayBuffer());
        if (r.ok && detectExt(buf)) {
          const target = path.join(UPLOAD_DIR, filename);
          fs.writeFileSync(target, buf);
          file = target;
        }
      } catch (err) {
        console.warn(`[blog-images] could not fetch ${filename} from ${origin}: ${err.message}`);
      }
    }
  }

  if (!file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) {
    return res.status(404).json({ error: "Not found" });
  }

  res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  res.sendFile(path.resolve(file));
});

// ---------- admin: media library ----------
//
// Uploading through the blog-scoped route below needs a saved post to hang the
// file off, which is no use while you are still writing one — the editor has
// to be able to drop an image into the body, or set a cover, before the post
// exists. These routes own the file only; whatever references it is the
// caller's business.

const MEDIA_PREFIX = "media-";

/** Byte size formatted for the picker, e.g. "412 KB". */
function human(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Decode a data: URL or bare base64 string into a validated image buffer. */
function decodeImage(dataBase64) {
  let raw = String(dataBase64 || "");
  const comma = raw.indexOf(",");
  if (raw.startsWith("data:") && comma !== -1) raw = raw.slice(comma + 1);
  if (!raw) return { error: "Missing image data." };

  let buffer;
  try {
    buffer = Buffer.from(raw, "base64");
  } catch {
    return { error: "Invalid base64 data." };
  }
  if (!buffer.length) return { error: "Missing image data." };
  if (buffer.length > 15 * 1024 * 1024) {
    return { error: "Image must be under 15 MB." };
  }
  const ext = detectExt(buffer);
  if (!ext) {
    return { error: "Unsupported image type. Use PNG, JPG, GIF or WebP." };
  }
  return { buffer, ext };
}

router.post(
  "/media",
  requireAuth,
  requireBlogAccess,
  express.json({ limit: "25mb" }),
  (req, res) => {
    try {
      const { buffer, ext, error } = decodeImage(req.body && req.body.dataBase64);
      if (error) return res.status(400).json({ error });

      // Keep something human-readable from the original name so the library is
      // browsable, but never trust it as a path.
      const stem = String((req.body && req.body.filename) || "image")
        .replace(/\.[^.]*$/, "")
        .replace(/[^a-zA-Z0-9-]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()
        .slice(0, 48) || "image";

      const filename = `${MEDIA_PREFIX}${Date.now()}-${stem}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

      res.json({
        ok: true,
        url: `/api/blog-images/file/${filename}`,
        filename,
        size: buffer.length,
        sizeLabel: human(buffer.length)
      });
    } catch (err) {
      console.error("[blog-images] media upload error:", err);
      res.status(500).json({ error: err.message || "Upload failed." });
    }
  }
);

router.get("/media", requireAuth, requireBlogAccess, (_req, res) => {
  try {
    const items = fs
      .readdirSync(UPLOAD_DIR)
      .filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, f));
        return {
          filename: f,
          url: `/api/blog-images/file/${f}`,
          size: stat.size,
          sizeLabel: human(stat.size),
          uploadedAt: stat.mtime.toISOString()
        };
      })
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
      .slice(0, 200);
    res.json({ items });
  } catch (err) {
    console.error("[blog-images] media list error:", err);
    res.status(500).json({ error: "Could not read the media library." });
  }
});

router.delete("/media/:filename", requireAuth, requireBlogAccess, (req, res) => {
  const filename = String(req.params.filename || "").replace(/[^a-zA-Z0-9._-]/g, "");
  const file = path.join(UPLOAD_DIR, filename);
  if (!filename || !file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    fs.unlinkSync(file);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Delete failed." });
  }
});

// ---------- admin: upload / replace a blog cover image ----------
router.post(
  "/:id",
  requireAuth,
  requireBlogAccess,
  express.json({ limit: "25mb" }),
  async (req, res) => {
    try {
      const id = String(req.params.id || "").trim();
      if (!id) return res.status(400).json({ error: "Missing blog id." });

      const item = await admin.getBlogById(id);
      if (!item) return res.status(404).json({ error: "Blog post not found." });

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
        return res.status(400).json({ error: "Invalid base64 data." });
      }
      if (buffer.length > 15 * 1024 * 1024) {
        return res.status(413).json({ error: "Image must be under 15 MB." });
      }

      const ext = detectExt(buffer);
      if (!ext) {
        return res
          .status(400)
          .json({ error: "Unsupported image type. Use PNG, JPG, GIF or WebP." });
      }

      // Remove any previous image for this blog post.
      for (const f of fs.readdirSync(UPLOAD_DIR)) {
        if (f.startsWith(id + ".") || f.startsWith(id + "-") || f.startsWith(id + "_")) {
          try {
            fs.unlinkSync(path.join(UPLOAD_DIR, f));
          } catch {}
        }
      }

      const timestamp = Date.now();
      const filename = `${id}-${timestamp}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

      const nowIso = new Date().toISOString();
      const logo_url = `/api/blog-images/file/${filename}`;
      const updated = await admin.updateBlog(id, {
        image_url: logo_url,
        og_image: logo_url,
        // Only the edit time moves; created_at is the article date.
        updated_at: nowIso
      });

      res.json({ ok: true, item: updated, image_url: logo_url });
    } catch (err) {
      console.error("[blog-images] upload error:", err);
      res.status(500).json({ error: err.message || "Upload failed." });
    }
  }
);

module.exports = router;

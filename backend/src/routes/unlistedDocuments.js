"use strict";

const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { getCatalog } = require("../services/unlistedCatalogState");
const { cachedDocument } = require("../services/unlistedDocuments");
const router = Router();

router.get(
  "/:id",
  rateLimit({
    windowMs: 60000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  async (req, res) => {
    const id = req.params.id;
    const document =
      /^[a-f0-9]{24}$/.test(id) &&
      getCatalog()
        ?.items.flatMap((item) => item.documents || [])
        .find((doc) => doc.id === id);
    if (!document)
      return res.status(404).json({ error: "Investor document not found" });
    try {
      const file = await cachedDocument(document);
      const name =
        document.title.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 100) ||
        "Investor document";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `${req.query.download === "1" ? "attachment" : "inline"}; filename="${name}.pdf"`,
      );
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.sendFile(file); // Handles HTTP Range requests for desktop/mobile PDF viewers.
    } catch (error) {
      console.error("[unlisted-document]", id, error.message);
      res
        .status(502)
        .json({
          error:
            "The source PDF is temporarily unavailable. Please retry later.",
        });
    }
  },
);

module.exports = router;

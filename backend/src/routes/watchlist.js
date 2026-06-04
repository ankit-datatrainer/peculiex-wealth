"use strict";

const { Router } = require("express");
const { z } = require("zod");
const { requireAuth } = require("../auth/middleware");
const {
  listWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  clearWatchlist
} = require("../auth/store");

const router = Router();

// Every route below requires auth.
router.use(requireAuth);

const SymbolSchema = z
  .string()
  .trim()
  .min(1, "Symbol is required")
  .max(20, "Symbol too long")
  .regex(/^[A-Za-z0-9._-]+$/, "Symbol contains invalid characters");

const AddSchema = z.object({
  symbol: SymbolSchema,
  name: z.string().trim().min(1).max(120).optional(),
  price: z.number().finite().nonnegative().optional(),
  note: z.string().trim().max(280).optional()
});

const BatchSchema = z.object({
  items: z
    .array(
      z.object({
        symbol: SymbolSchema,
        name: z.string().trim().max(120).optional(),
        price: z.number().finite().nonnegative().optional()
      })
    )
    .max(100)
});

router.get("/", async (req, res, next) => {
  try {
    const items = await listWatchlist(req.user.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      price:
        req.body && req.body.price != null && req.body.price !== ""
          ? Number(req.body.price)
          : undefined
    };
    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.errors[0]?.message || "Invalid watchlist payload";
      return res.status(400).json({ error: msg });
    }
    const item = await addWatchlistItem(req.user.id, parsed.data);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

/** Bulk-import (used to migrate localStorage watchlist on first login). */
router.post("/batch", async (req, res, next) => {
  try {
    const parsed = BatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid batch payload" });
    }
    const added = [];
    for (const it of parsed.data.items) {
      try {
        const item = await addWatchlistItem(req.user.id, it);
        added.push(item);
      } catch (e) {
        // skip individual failures so the bulk import is best-effort
        console.warn("[watchlist/batch] skip", it.symbol, e.message);
      }
    }
    const items = await listWatchlist(req.user.id);
    res.json({ added: added.length, items });
  } catch (err) {
    next(err);
  }
});

router.delete("/all", async (req, res, next) => {
  try {
    const removed = await clearWatchlist(req.user.id);
    res.json({ removed });
  } catch (err) {
    next(err);
  }
});

router.delete("/:symbol", async (req, res, next) => {
  try {
    const sym = String(req.params.symbol || "").trim();
    if (!SymbolSchema.safeParse(sym).success) {
      return res.status(400).json({ error: "Invalid symbol" });
    }
    const ok = await removeWatchlistItem(req.user.id, sym);
    if (!ok) return res.status(404).json({ error: "Symbol not in watchlist" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

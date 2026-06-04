"use strict";

const { Router } = require("express");
const { z } = require("zod");
const { requireAuth } = require("../auth/middleware");
const { client, isLive } = require("../db");

const router = Router();
router.use(requireAuth);

const TradeSchema = z.object({
  symbol: z.string().trim().min(1),
  type: z.enum(["buy", "sell"]),
  quantity: z.number().int().positive(),
  price: z.number().finite().positive()
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = TradeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid trade payload" });
    }

    if (!isLive()) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const { data, error } = await client
      .from("paper_trades")
      .insert([
        {
          user_id: req.user.id,
          symbol: parsed.data.symbol,
          type: parsed.data.type,
          quantity: parsed.data.quantity,
          price: parsed.data.price
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ trade: data });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    if (!isLive()) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { data, error } = await client
      .from("paper_trades")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ trades: data || [] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

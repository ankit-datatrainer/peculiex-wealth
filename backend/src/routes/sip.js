"use strict";

const { Router } = require("express");
const { z } = require("zod");
const { customAlphabet } = require("nanoid");
const { client, isLive } = require("../db");

const router = Router();
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

// In-memory fallback when Supabase isn't configured
const memory = new Map();

const Schema = z.object({
  amount: z.number().min(500).max(10_000_000),
  rate: z.number().min(0.1).max(50),
  years: z.number().int().min(1).max(60)
});

function compute({ amount, rate, years }) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const total =
    r === 0 ? amount * n : amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = amount * n;
  const gains = total - invested;
  return { invested, gains, total };
}

router.post("/share", async (req, res) => {
  const parsed = Schema.safeParse({
    amount: Number(req.body?.amount),
    rate: Number(req.body?.rate),
    years: Number(req.body?.years)
  });
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { amount, rate, years } = parsed.data;
  const { invested, gains, total } = compute(parsed.data);
  const id = nanoid();
  const frontend = process.env.PUBLIC_FRONTEND_URL || "http://127.0.0.1:3000";
  const url = frontend.replace(/\/$/, "") + "/sip/" + id;

  const row = {
    id,
    amount,
    rate,
    years,
    invested: +invested.toFixed(2),
    gains: +gains.toFixed(2),
    total: +total.toFixed(2)
  };

  if (!isLive()) {
    memory.set(id, { ...row, created_at: new Date().toISOString() });
    return res.json({ id, url });
  }

  const { error } = await client.from("sip_shares").insert(row);
  if (error) {
    console.error("[sip-share] insert", error.message);
    return res.status(500).json({ error: "Could not create share link." });
  }
  res.json({ id, url });
});

router.get("/share/:id", async (req, res) => {
  const id = String(req.params.id);
  if (!isLive()) {
    const row = memory.get(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  }
  const { data, error } = await client
    .from("sip_shares")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

module.exports = router;

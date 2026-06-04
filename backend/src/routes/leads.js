"use strict";

const { Router } = require("express");
const { z } = require("zod");
const { client, isLive } = require("../db");

const router = Router();

const LeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(40),
  interest: z.string().min(1).max(80),
  budget: z.string().min(1).max(80),
  message: z.string().max(2000).optional().nullable()
});

router.post("/", async (req, res) => {
  const parsed = LeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data", issues: parsed.error.issues });
  }
  const data = parsed.data;

  if (!isLive()) {
    console.log("[leads] (no DB) lead received:", data);
    return res.json({ ok: true, stored: false });
  }

  const { error } = await client.from("leads").insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    interest: data.interest,
    budget: data.budget,
    message: data.message || null
  });
  if (error) {
    console.error("[leads] insert error", error.message);
    return res.status(500).json({ error: "Could not store lead." });
  }
  res.json({ ok: true, stored: true });
});

/**
 * Admin endpoint — returns all leads. Protected by ADMIN_TOKEN header.
 * Usage:
 *   curl -H "x-admin-token: $ADMIN_TOKEN" http://localhost:4000/api/leads
 */
router.get("/", async (req, res) => {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.header("x-admin-token");
  if (!expected || got !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!isLive()) return res.json({ items: [] });
  const { data, error } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data || [] });
});

module.exports = router;

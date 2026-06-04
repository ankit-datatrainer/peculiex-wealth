"use strict";

const { Router } = require("express");
const { z } = require("zod");
const { client, isLive } = require("../db");

const router = Router();

const Schema = z.object({
  email: z.string().email()
});

router.post("/", async (req, res) => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email" });
  }
  const email = parsed.data.email.toLowerCase();

  if (!isLive()) {
    console.log("[newsletter] (no DB) subscribe:", email);
    return res.json({ ok: true, stored: false });
  }
  const { error } = await client
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email" });
  if (error) {
    console.error("[newsletter] insert error", error.message);
    return res.status(500).json({ error: "Could not subscribe." });
  }
  res.json({ ok: true, stored: true });
});

module.exports = router;

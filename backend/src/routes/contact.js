"use strict";

const { Router } = require("express");
const { z } = require("zod");
const { client, isLive } = require("../db");

const router = Router();

const Schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(160),
  message: z.string().min(2).max(4000)
});

router.post("/", async (req, res) => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid form" });
  const data = parsed.data;
  if (!isLive()) {
    console.log("[contact] (no DB)", data);
    return res.json({ ok: true, stored: false });
  }
  const { error } = await client.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, stored: true });
});

module.exports = router;

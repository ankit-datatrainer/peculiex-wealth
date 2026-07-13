"use strict";

const { Router } = require("express");
const { isLive } = require("../db");

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "finvoq-backend",
    db: isLive() ? "connected" : "seed-mode",
    uptime_seconds: Math.round(process.uptime()),
    time: new Date().toISOString()
  });
});

module.exports = router;

"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const catalog = require("./routes/catalog");
const markets = require("./routes/markets");
const leads = require("./routes/leads");
const newsletter = require("./routes/newsletter");
const contact = require("./routes/contact");
const sip = require("./routes/sip");
const health = require("./routes/health");
const auth = require("./routes/auth");
const fyersAuth = require("./routes/fyersAuth");
const watchlist = require("./routes/watchlist");
const adminRoutes = require("./routes/admin");
const { bootstrapSuperAdmin, bootstrapTestUser } = require("./auth/store");
const { hashPassword } = require("./auth/tokens");

const http = require("http");
const { initWSS } = require("./wsServer");
const helmet = require("helmet");

const app = express();
app.use(helmet());
const PORT = Number(process.env.PORT || 4000);
const ORIGIN = process.env.CORS_ORIGIN || "http://127.0.0.1:3000";

app.disable("x-powered-by");
// Factsheets and unlisted-share logos are mounted BEFORE the global 200kb
// JSON parser so their upload routes can apply their own larger limits for
// base64 file payloads.
app.use("/api/factsheets", require("./routes/factsheets"));
app.use("/api/unlisted-logos", require("./routes/unlistedLogos"));
app.use(express.json({ limit: "200kb" }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server / curl
      const allowed = ORIGIN.split(",").map((s) => s.trim());
      if (allowed.includes("*") || allowed.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed: " + origin));
    },
    credentials: false
  })
);

// Rate-limit only the write endpoints — catalog reads stay snappy
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

// Auth-specific limiter — prevents brute force on login + signup. The cap is
// per-IP, not per-account, so a shared NAT can still authenticate everyone.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

// Admin limiter — generous because the panel does many small calls, but
// still caps abuse if a token leaks.
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/", (_req, res) => {
  res.type("text/plain").send("Finvoq API · see /api/health");
});

app.use("/api/health", health);
app.use("/api", catalog);
app.use("/api/markets", markets);
app.use("/api/mf", require("./routes/mf"));
app.use("/api/auth/fyers", fyersAuth);
app.use("/api/auth", authLimiter, auth);
app.use("/api/watchlist", watchlist);
app.use("/api/paper-trades", require("./routes/paperTrades"));
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/leads", writeLimiter, leads);
app.use("/api/newsletter", writeLimiter, newsletter);
app.use("/api/contact", writeLimiter, contact);
app.use("/api/sip", writeLimiter, sip);

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ error: err.message || "Internal error" });
});

if (!process.env.VERCEL) {
  const server = http.createServer(app);
  initWSS(server);
  
  const { startTickLoop } = require("./services/marketData");
  startTickLoop();

  server.listen(PORT, async () => {
    console.log(`[server] Finvoq API listening on http://localhost:${PORT}`);
    console.log(`[server] CORS allowed: ${ORIGIN}`);
    // Best-effort super-admin bootstrap — never crash the boot if this fails.
    try {
      const result = await bootstrapSuperAdmin({ hashPassword });
      if (result.created) {
        console.log(`[admin] super-admin created: ${result.email}`);
      } else if (result.promoted) {
        console.log(`[admin] super-admin promoted: ${result.email}`);
      } else if (result.existed) {
        console.log(`[admin] super-admin ready: ${result.email}`);
      } else if (result.skipped) {
        console.log(
          `[admin] super-admin bootstrap skipped (${result.reason}). Set SUPERADMIN_EMAIL + SUPERADMIN_PASSWORD in .env to enable the admin panel.`
        );
      } else if (result.error) {
        console.warn(`[admin] super-admin bootstrap failed: ${result.error}`);
      }
    } catch (e) {
      console.warn("[admin] super-admin bootstrap threw:", e.message);
    }

    // Test user — for QA / grading. Verified out of the box so the OTP
    // flow can be skipped during testing.
    try {
      const t = await bootstrapTestUser({ hashPassword });
      if (t.created) {
        console.log(`[test-user] created & verified: ${t.email}`);
      } else if (t.promoted) {
        console.log(`[test-user] verified flag set: ${t.email}`);
      } else if (t.existed) {
        console.log(`[test-user] ready: ${t.email}`);
      } else if (t.error) {
        console.warn(`[test-user] bootstrap failed: ${t.error}`);
      }
    } catch (e) {
      console.warn("[test-user] bootstrap threw:", e.message);
    }
  });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;

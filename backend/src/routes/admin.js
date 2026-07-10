"use strict";

const { Router } = require("express");
const { z } = require("zod");

const { requireAuth, requireAdmin } = require("../auth/middleware");
const userStore = require("../auth/store");
const { hashPassword } = require("../auth/tokens");
const admin = require("../admin/store");

const router = Router();

// Every admin route needs auth + admin role.
router.use(requireAuth, requireAdmin);

// --------------------------------------------------------------
// Dashboard / stats
// --------------------------------------------------------------

router.get("/stats", async (_req, res, next) => {
  try {
    const stats = await admin.getStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------
// USERS
// --------------------------------------------------------------

router.get("/users", async (req, res, next) => {
  try {
    const users = await userStore.listUsers({
      search: req.query.q || "",
      limit: req.query.limit
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

const UserPatchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  mobile: z.string().trim().max(20).nullable().optional(),
  role: z.enum(["user", "manager", "admin", "superadmin"]).optional(),
  password: z.string().min(6).max(128).optional()
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "User id required" });

    const parsed = UserPatchSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message || "Invalid payload" });
    }

    const target = await userStore.getUserById(id);
    if (!target) return res.status(404).json({ error: "User not found" });

    // Guard: don't let an admin demote themselves out of admin status — that
    // would lock them out mid-session. They can demote a different admin
    // through this endpoint, just not their own active account.
    if (
      parsed.data.role &&
      String(target.id) === String(req.user.id) &&
      parsed.data.role !== req.user.role
    ) {
      return res
        .status(400)
        .json({ error: "You cannot change your own role." });
    }

    const patch = { ...parsed.data };
    if (parsed.data.password) {
      patch.password_hash = hashPassword(parsed.data.password);
      delete patch.password;
    }

    const updated = await userStore.updateUser(id, patch);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "User id required" });
    if (String(id) === String(req.user.id)) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account." });
    }
    const target = await userStore.getUserById(id);
    if (!target) return res.status(404).json({ error: "User not found" });

    // Block deletion of the last super-admin so the panel can't get bricked.
    if (target.role === "superadmin") {
      const all = await userStore.listUsers({ limit: 1000 });
      const supers = all.filter((u) => u.role === "superadmin");
      if (supers.length <= 1) {
        return res
          .status(400)
          .json({ error: "Cannot delete the only super-admin." });
      }
    }
    const ok = await userStore.deleteUser(id);
    if (!ok) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------
// UNLISTED SHARES
// --------------------------------------------------------------

const UnlistedCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  domain: z.string().trim().min(2).max(160),
  sector: z.string().trim().min(1).max(80),
  brand: z.string().trim().min(3).max(10),
  initial: z.string().trim().min(1).max(2),
  price: z.coerce.number().nonnegative(),
  iv: z.string().trim().min(1).max(20),
  tag: z.enum(["trend", "avail", "lim"]),
  logo_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .nullable(),
  min_units: z.coerce.number().nonnegative().optional().default(0),
  market_cap: z.string().trim().max(50).optional().default(""),
  pe: z.string().trim().max(50).optional().default("N/A")
});

const UnlistedPatchSchema = UnlistedCreateSchema.partial();

router.get("/unlisted", async (_req, res, next) => {
  try {
    const items = await admin.listUnlisted();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/unlisted", async (req, res, next) => {
  try {
    const parsed = UnlistedCreateSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message || "Invalid payload" });
    }
    const item = await admin.createUnlisted(parsed.data);
    res.status(201).json({ item });
  } catch (err) {
    if (err && err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

router.patch("/unlisted/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "id required" });
    const parsed = UnlistedPatchSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message || "Invalid payload" });
    }
    const updated = await admin.updateUnlisted(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (err) {
    if (err && err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

router.delete("/unlisted/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "id required" });
    const ok = await admin.deleteUnlisted(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------
// STOCKS
// --------------------------------------------------------------

const StockCreateSchema = z.object({
  sym: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(120),
  price: z.coerce.number(),
  chg: z.coerce.number(),
  vol: z.string().trim().min(1).max(30),
  cap: z.string().trim().min(1).max(30),
  cat: z.enum(["up", "stable", "watch"])
});

const StockPatchSchema = StockCreateSchema.partial();

router.get("/stocks", async (_req, res, next) => {
  try {
    const items = await admin.listStocks();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/stocks", async (req, res, next) => {
  try {
    const parsed = StockCreateSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message || "Invalid payload" });
    }
    const item = await admin.createStock(parsed.data);
    res.status(201).json({ item });
  } catch (err) {
    if (err && err.status === 409) return res.status(409).json({ error: err.message });
    next(err);
  }
});

router.patch("/stocks/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    const parsed = StockPatchSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message || "Invalid payload" });
    }
    const updated = await admin.updateStock(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (err) {
    if (err && err.status === 409) return res.status(409).json({ error: err.message });
    next(err);
  }
});

router.delete("/stocks/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    const ok = await admin.deleteStock(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------
// LEADS
// --------------------------------------------------------------

router.get("/leads", async (_req, res, next) => {
  try {
    const items = await admin.listLeads();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.patch("/leads/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = String(req.body?.status || "").trim();
    const item = await admin.updateLeadStatus(id, status);
    if (!item) return res.status(404).json({ error: "Lead not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

router.delete("/leads/:id", async (req, res, next) => {
  try {
    const ok = await admin.deleteLead(req.params.id);
    if (!ok) return res.status(404).json({ error: "Lead not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------
// NEWSLETTER
// --------------------------------------------------------------

router.get("/newsletter", async (_req, res, next) => {
  try {
    const items = await admin.listNewsletter();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.delete("/newsletter/:email", async (req, res, next) => {
  try {
    const ok = await admin.deleteNewsletter(req.params.email);
    if (!ok) return res.status(404).json({ error: "Subscriber not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------
// CONTACT MESSAGES
// --------------------------------------------------------------

router.get("/contact", async (_req, res, next) => {
  try {
    const items = await admin.listContact();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.delete("/contact/:id", async (req, res, next) => {
  try {
    const ok = await admin.deleteContact(req.params.id);
    if (!ok) return res.status(404).json({ error: "Message not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

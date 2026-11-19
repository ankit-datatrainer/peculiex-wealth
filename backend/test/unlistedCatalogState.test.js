"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("upgrading a VPS catalog restores bundled details without undoing runtime quotes or removals", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "finvoq-legacy-catalog-"));
  process.env.UNLISTED_SYNC_DIR = dir;
  t.after(() => {
    delete process.env.UNLISTED_SYNC_DIR;
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const { getCatalog, atomicJson } = require("../src/services/unlistedCatalogState");
  const original = getCatalog().items.find((item) => item.name === "63sats Cybertech Limited");
  assert.ok(original.price_history.length > 1);
  assert.ok(original.documents.length > 0);
  const snapshot = {
    synced_at: "2026-11-18T12:30:51.699Z",
    items: [{
      id: "vps-id",
      name: original.name,
      price: 28.7,
      source_url: original.source_url,
    }, {
      id: "vps-only",
      name: "New company",
      source_url: "https://www.unlistedkraft.in/stocks/new-company",
      price: 10,
    }],
  };
  const file = path.join(dir, "catalog.json");
  atomicJson(file, snapshot);

  const restored = getCatalog();
  assert.equal(restored.synced_at, snapshot.synced_at);
  assert.equal(restored.items.length, 2);
  assert.equal(restored.items[0].id, "vps-id");
  assert.equal(restored.items[0].price, 28.7);
  assert.deepEqual(restored.items[0].price_history, original.price_history);
  assert.deepEqual(restored.items[0].documents, original.documents);
  assert.deepEqual(restored.items[1], snapshot.items[1]);

  const correctedDay = original.price_history.at(-1)[0];
  snapshot.items[0].price_history = [[correctedDay, 29], ["2026-11-19", 28.7]];
  snapshot.items[0].daily_quotes = [["2026-11-19", 28.7]];
  snapshot.items[0].documents = [];
  atomicJson(file, snapshot);
  const updated = getCatalog().items[0];
  assert.deepEqual(updated.price_history.slice(-2), snapshot.items[0].price_history);
  assert.equal(updated.price_history.length, original.price_history.length + 1);
  assert.deepEqual(updated.documents, []);
  assert.equal(updated.daily_quote_date, "2026-11-19");
});

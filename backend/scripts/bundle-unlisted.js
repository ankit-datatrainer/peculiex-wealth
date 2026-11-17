"use strict";
// Package the last verified import for a fresh deployment without a long first scrape.
// Live quotes/history continue to live in the writable uploads directory afterwards.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const {
  DATA_DIR,
  atomicJson,
  readJson,
} = require("../src/services/unlistedCatalogState");
const catalog = readJson(path.join(DATA_DIR, "catalog.json"));
if (
  !catalog?.items?.length ||
  !catalog.items.every(
    (i) => Array.isArray(i.price_history) && Array.isArray(i.documents),
  )
)
  throw Error("Run a successful full sync before bundling");
const histories = {};
const items = catalog.items.map(
  ({ price_history, daily_quotes, daily_quote_date, ...item }) => {
    histories[item.id] = { price_history, daily_quotes, daily_quote_date };
    return item;
  },
);
const dir = path.join(__dirname, "../src/data");
fs.writeFileSync(
  path.join(dir, "unlisted-history.json.gz"),
  zlib.gzipSync(JSON.stringify(histories), { level: 9 }),
);
atomicJson(path.join(dir, "unlisted-catalog.json"), {
  ...catalog,
  history_archive: "unlisted-history.json.gz",
  items,
});
// Bundle any new source logos too. Other stock assets remain available at runtime.
for (const item of items) {
  const filename = path.basename(item.logo_url || "");
  if (!/^market-[a-f0-9]+\.(png|jpg|gif|webp|avif)$/.test(filename)) continue;
  const runtime = path.join(__dirname, "../uploads/unlisted-logos", filename);
  if (fs.existsSync(runtime))
    fs.copyFileSync(runtime, path.join(dir, "unlisted-logos", filename));
}
console.log(
  `Bundled ${items.length} companies with verified historical data and document listings.`,
);

#!/usr/bin/env node
"use strict";

/**
 * Sync unlisted shares with the market source (unlistedkraft.in/stocks/live).
 *
 * Runs against whatever database backend/.env points at — Supabase when
 * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, otherwise the in-memory
 * seed (nothing persists). Take a backup of unlisted_shares before --apply
 * against production.
 *
 * Usage (from backend/):
 *   node scripts/sync-unlisted.js                 dry run: print the diff, write nothing
 *   node scripts/sync-unlisted.js --apply         apply price / min units / market cap / P/E
 *                                                 changes and add every new share
 *
 * Options:
 *   --sectors            also overwrite sector labels (off by default)
 *   --skip-updates       don't change existing shares
 *   --skip-additions     don't add new shares
 *   --input=<file.json>  use saved source rows instead of fetching live
 *   --out=<file.json>    write the full diff as JSON
 *   --verbose            list every change, not just a summary
 *
 * Seed-only run (safe, nothing persists):
 *   SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= node scripts/sync-unlisted.js
 */

const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { isLive } = require("../src/db");
const admin = require("../src/admin/store");
const seed = require("../src/seed");
const svc = require("../src/services/unlistedSource");

function parseArgs(argv) {
  const opts = {
    apply: false,
    sectors: false,
    skipUpdates: false,
    skipAdditions: false,
    input: null,
    out: null,
    verbose: false
  };
  for (const a of argv) {
    if (a === "--apply") opts.apply = true;
    else if (a === "--dry-run") opts.apply = false;
    else if (a === "--sectors") opts.sectors = true;
    else if (a === "--skip-updates") opts.skipUpdates = true;
    else if (a === "--skip-additions") opts.skipAdditions = true;
    else if (a === "--verbose" || a === "-v") opts.verbose = true;
    else if (a.startsWith("--input=")) opts.input = a.slice(8);
    else if (a.startsWith("--out=")) opts.out = a.slice(6);
    else if (a === "--help" || a === "-h") opts.help = true;
    else throw new Error(`Unknown option: ${a}`);
  }
  return opts;
}

const fmtPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const pct = (from, to) => (from ? `${(((to - from) / from) * 100).toFixed(1)}%` : "new");

function printDiff(diff, verbose) {
  const c = diff.counts;
  console.log("");
  console.log(`Source shares:        ${c.source}`);
  console.log(`Our shares:           ${c.existing}`);
  console.log(`Updates:              ${c.updates}  (${c.priceChanges} price, ${c.sectorChanges} sector)`);
  console.log(`Unchanged:            ${c.unchanged}`);
  console.log(`New on source:        ${c.additions}`);
  console.log(`Invalid source price: ${c.invalid}`);
  console.log(`Missing from source:  ${c.missingFromSource}  (reported only, never deleted)`);
  if (c.ambiguous) console.log(`Ambiguous matches:    ${c.ambiguous}  (skipped)`);

  const priceMoves = diff.updates.filter((u) => u.changes.price);
  const shown = verbose ? priceMoves : priceMoves.slice(0, 15);
  if (shown.length) {
    console.log("\nPrice changes" + (verbose ? ":" : " (largest first):"));
    for (const u of shown) {
      const p = u.changes.price;
      console.log(`  ${u.name.padEnd(48).slice(0, 48)} ${fmtPrice(p.from).padStart(12)} -> ${fmtPrice(p.to).padStart(12)}  ${pct(p.from, p.to)}`);
    }
    if (!verbose && priceMoves.length > shown.length) {
      console.log(`  … ${priceMoves.length - shown.length} more (use --verbose)`);
    }
  }
  if (verbose) {
    for (const u of diff.updates) {
      const other = Object.entries(u.changes).filter(([k]) => k !== "price");
      if (!other.length) continue;
      console.log(`  ${u.name}: ${other.map(([k, v]) => `${k} "${v.from}" -> "${v.to}"`).join("; ")}`);
    }
  }
  if (diff.additions.length) {
    console.log("\nNew shares:");
    for (const a of diff.additions) {
      const hint = a.similarTo.length ? `  (similar to: ${a.similarTo.join(", ")})` : "";
      console.log(`  + ${a.name} — ${fmtPrice(a.price)}, ${a.sector || "no sector"}${hint}`);
    }
  }
  if (diff.invalid.length) {
    console.log("\nInvalid on source (left unchanged):");
    for (const i of diff.invalid) console.log(`  ! ${i.name}: ${i.reason}`);
  }
  if (diff.missingFromSource.length) {
    console.log("\nNot on source any more (kept as is):");
    for (const m of diff.missingFromSource) console.log(`  - ${m.name}`);
  }
  if (diff.ambiguous.length) {
    console.log("\nAmbiguous (skipped):");
    for (const a of diff.ambiguous) console.log(`  ? ${a.name} -> ${a.candidates.join(" | ")}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(fs.readFileSync(__filename, "utf8").split("*/")[0]);
    return;
  }

  const target = isLive()
    ? `Supabase (${new URL(process.env.SUPABASE_URL).host})`
    : "in-memory seed (nothing will persist)";
  console.log(`Target:  ${target}`);
  console.log(`Mode:    ${opts.apply ? "APPLY" : "dry run"}`);

  let rows;
  if (opts.input) {
    rows = svc.normalizeSourceItems(JSON.parse(fs.readFileSync(opts.input, "utf8")));
    console.log(`Source:  ${opts.input} (${rows.length} rows)`);
  } else {
    console.log(`Source:  ${svc.SOURCE_URL}`);
    rows = await svc.fetchSourceShares();
  }

  const existing = await admin.listUnlisted();
  const diff = svc.computeDiff(existing, rows);
  printDiff(diff, opts.verbose);

  if (opts.out) {
    fs.writeFileSync(opts.out, JSON.stringify({ generatedAt: new Date().toISOString(), ...diff }, null, 2));
    console.log(`\nDiff written to ${opts.out}`);
  }

  if (!opts.apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to write these changes.");
    return;
  }

  const result = await svc.applySync(admin, diff, {
    applyUpdates: !opts.skipUpdates,
    applySectors: opts.sectors,
    addNames: opts.skipAdditions ? [] : diff.additions.map((a) => a.name),
    seedRows: seed.UNLISTED
  });

  console.log("\nApplied:");
  console.log(`  updated: ${result.updated.length}`);
  console.log(`  added:   ${result.added.length}`);
  console.log(`  skipped: ${result.skipped.length}`);
  console.log(`  errors:  ${result.errors.length}`);
  for (const s of result.skipped) console.log(`  skipped ${s.name}: ${s.reason}`);
  for (const e of result.errors) console.log(`  error   ${e.name}: ${e.error}`);
  for (const a of result.added) {
    if (!a.logo_url) console.log(`  note    ${a.name}: no logo could be fetched (initial badge will show)`);
  }
  if (isLive()) {
    console.log(
      "\nNote: min units, market cap and P/E are read from src/seed.js in this deployment (not database columns)." +
        " Deploy the updated seed.js for those to change on the site; price and sector are already saved."
    );
  }
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`\nSync failed: ${e.message}`);
  process.exit(1);
});

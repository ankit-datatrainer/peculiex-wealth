#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { runSync } = require("../src/services/unlistedMirror");
const { atomicJson } = require("../src/services/unlistedCatalogState");

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("Usage: npm run sync:unlisted -- [--apply] [--out=report.json] [--allow-large-removal]\nDefault: fetch all company details and logos, preview changes without database writes.\n--apply mirrors additions, updates and removals; a backup is saved first.");
    return;
  }
  for (const arg of args) {
    if (!["--apply", "--dry-run", "--allow-large-removal"].includes(arg) && !arg.startsWith("--out=")) throw new Error(`Unknown option: ${arg}`);
  }
  const output = await runSync({ dryRun: !args.includes("--apply"), allowLargeRemoval: args.includes("--allow-large-removal") });
  const outFile = args.find(arg => arg.startsWith("--out="))?.slice(6);
  if (outFile) atomicJson(path.resolve(outFile), output.result);
  console.log(JSON.stringify(output.result, null, 2));
  console.log(args.includes("--apply") ? "Catalog synchronized, including removals." : "Dry run: no database records changed. Use --apply to synchronize.");
}

main().catch(error => { console.error("Unlisted sync failed:", error.message); process.exitCode = 1; });

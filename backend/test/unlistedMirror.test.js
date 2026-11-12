"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mirror = require("../src/services/unlistedMirror");
const state = require("../src/services/unlistedCatalogState");

function rows(count = 100) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Company ${i}`, sourceUrl: `https://www.unlistedkraft.in/stocks/company-${i}`,
    price: i ? 42.5 : 0, rawPrice: i ? "42.5" : "0", valid: i > 0,
    sector: "Technology", min_units: 10, market_cap: "100 Cr", pe: "N/A",
    sourceFields: ["price per share", "sector", "minimum units", "market cap", "pe(x)"]
  }));
}
function context(t, existing) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "finvoq-mirror-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const data = new Map(existing.map(item => [item.id, { ...item }]));
  const calls = { updates: 0, additions: 0, removals: 0 };
  const store = {
    listUnlisted: async () => [...data.values()].map(item => ({ ...item })),
    createUnlisted: async fields => { calls.additions++; const row = { ...fields, id: `new-${fields.name}` }; data.set(row.id, row); return row; },
    updateUnlisted: async (id, fields) => { calls.updates++; const row = { ...data.get(id), ...fields }; data.set(id, row); return row; },
    deleteUnlisted: async id => { calls.removals++; return data.delete(id); }
  };
  const options = {
    dir, store, previous: { items: [] }, fetchListing: async () => rows(),
    fetchDetail: async () => ({ fundamentals: { ISIN: "INE000000001", "Face Value": "2" }, financials: [] }),
    fetchLogo: async () => ({ logo_url: "/api/unlisted-logos/file/market-fixture.png" })
  };
  return { dir, data, calls, store, options };
}

test("rejects truncated, incomplete, duplicate and unexpectedly shrunken listings", () => {
  assert.throws(() => mirror.validateRows(rows(24)), /Incomplete source/);
  const missing = rows(); delete missing[3].sourceFields;
  assert.throws(() => mirror.validateRows(missing), /Incomplete source card/);
  const duplicate = rows(); duplicate[1].sourceUrl = duplicate[0].sourceUrl;
  assert.throws(() => mirror.validateRows(duplicate), /Duplicate source identity/);
  assert.throws(() => mirror.validateRows(rows(), 200), /shrank/);
  assert.doesNotThrow(() => mirror.validateRows(rows(), 200, true));
});

test("selects canonical identity and removes the old duplicate", () => {
  const canonical = "Signify Innovations (Previously Phillips Lighting) India Limited";
  const result = mirror.reconcile([
    { id: "old", name: "Signify Innovations India Limited" },
    { id: "canonical", name: canonical },
    { id: "removed", name: "NSE" }
  ], [{ name: canonical }]);
  assert.equal(result.matched[0].current.id, "canonical");
  assert.deepEqual(result.removed.map(x => x.id), ["old", "removed"]);
});

test("a renamed source company retains its database identity", () => {
  const url = "https://www.unlistedkraft.in/stocks/company";
  const plan = mirror.reconcile([{ id: "stable", name: "Old Brand" }], [{ name: "New Brand", sourceUrl: url }], [{ id: "stable", source_url: url }]);
  assert.equal(plan.matched[0].current.id, "stable"); assert.equal(plan.removed.length, 0);
});

test("persists every field, adds/removes companies, includes unquoted shares and is idempotent", async t => {
  const ctx = context(t, [{ id: "stable", name: "Company 1", price: 99 }, { id: "gone", name: "Obsolete Company" }]);
  const output = await mirror.runSync(ctx.options);
  assert.equal(ctx.data.size, 100);
  assert.equal(output.result.added.length, 99);
  assert.deepEqual(output.result.removed, ["Obsolete Company"]);
  const published = state.readJson(path.join(ctx.dir, "catalog.json"));
  const zero = published.items.find(item => item.name === "Company 0");
  assert.equal(zero.price, 0); assert.equal(zero.quote_status, "unavailable");
  const stable = published.items.find(item => item.id === "stable");
  assert.equal(stable.price, 42.5); assert.equal(stable.min_units, 10);
  assert.equal(stable.market_cap, "100 Cr"); assert.equal(stable.pe, "N/A");
  assert.equal(stable.iv, "2"); assert.equal(stable.fundamentals.ISIN, "INE000000001");
  const before = { ...ctx.calls };
  const again = await mirror.runSync({ ...ctx.options, previous: published });
  assert.deepEqual(ctx.calls, before);
  assert.deepEqual(again.result.added, []); assert.deepEqual(again.result.removed, []);
  assert.ok(fs.readdirSync(path.join(ctx.dir, "backups")).length);
});

test("upstream/logo failures leave the last catalog and database untouched", async t => {
  const ctx = context(t, [{ id: "keep", name: "Keep this company" }]);
  const previous = { items: [{ name: "Last good" }], synced_at: "2026-01-01" };
  state.atomicJson(path.join(ctx.dir, "catalog.json"), previous);
  await assert.rejects(mirror.runSync({ ...ctx.options, fetchLogo: async row => { if (row.name === "Company 3") throw Error("Image failed"); return { logo_url: "/logo.png" }; } }), /Image failed/);
  assert.deepEqual(ctx.calls, { updates: 0, additions: 0, removals: 0 });
  assert.deepEqual(state.readJson(path.join(ctx.dir, "catalog.json")), previous);
  assert.match(state.readJson(path.join(ctx.dir, "status.json")).last_error, /Image failed/);
  assert.equal(fs.existsSync(path.join(ctx.dir, "sync.lock")), false);
});

test("a partial database failure does not publish and is repaired by a retry", async t => {
  const ctx = context(t, [{ id: "remove-last", name: "Obsolete" }]);
  const create = ctx.store.createUnlisted;
  let created = 0;
  ctx.store.createUnlisted = async fields => { if (++created === 5) throw Error("Database unavailable"); return create(fields); };
  await assert.rejects(mirror.runSync(ctx.options), /Database unavailable/);
  assert.equal(ctx.data.size, 5); assert.equal(ctx.calls.removals, 0);
  assert.equal(fs.existsSync(path.join(ctx.dir, "catalog.json")), false);
  ctx.store.createUnlisted = create;
  await mirror.runSync(ctx.options);
  assert.equal(ctx.data.size, 100);
  assert.equal(ctx.calls.removals, 1);
});

test("dry run stages all data without database or snapshot changes", async t => {
  const ctx = context(t, [{ id: "keep", name: "Old" }]);
  const preview = await mirror.runSync({ ...ctx.options, dryRun: true });
  assert.equal(preview.items.length, 100);
  assert.deepEqual(ctx.calls, { updates: 0, additions: 0, removals: 0 });
  assert.equal(fs.existsSync(path.join(ctx.dir, "catalog.json")), false);
});

test("only one process may reconcile a catalog at a time", t => {
  const ctx = context(t, []);
  const release = mirror.acquireLock(ctx.dir);
  assert.throws(() => mirror.acquireLock(ctx.dir), /already running/);
  release();
  mirror.acquireLock(ctx.dir)();
});

test("detail parser extracts factual fundamentals and financial tables without markup", () => {
  const html = '<!-- Fundamentals content start --><span class="fs16  me-auto">ISIN</span><span>INE000000001</span><span class="fs16  me-auto">Face Value</span><span><b>10</b></span><!-- Fundamentals content end --><!-- Key Financials section start --><div id="nested-tabs-1"><table><tr><th>Metric</th><th>FY26</th></tr><tr><td>Revenue</td><td>100</td></tr></table></div><div id="nested-tabs-2"><table><tr><th>Assets</th></tr></table></div><div id="nested-tabs-3"></div><!-- Key Financials section end -->';
  const parsed = mirror.parseDetailHtml(html);
  assert.equal(parsed.fundamentals["Face Value"], "10");
  assert.deepEqual(parsed.financials[0].rows[1], ["Revenue", "100"]);
  const withoutProfitTable = html.replace(/<table>[\s\S]*?<\/table>/, "");
  assert.equal(mirror.parseDetailHtml(withoutProfitTable).financials[0].title, "Balance Sheet");
  assert.throws(() => mirror.parseDetailHtml("<html>Blocked</html>"), /layout changed/);
});

test("scheduler refreshes on startup and on its configured interval", async t => {
  const old = process.env.UNLISTED_SYNC_ENABLED;
  delete process.env.UNLISTED_SYNC_ENABLED;
  t.after(() => { if (old === undefined) delete process.env.UNLISTED_SYNC_ENABLED; else process.env.UNLISTED_SYNC_ENABLED = old; });
  let calls = 0, callback;
  mirror.startAutoSync({ sync: async () => { calls++; return { result: { count: 201 } }; }, schedule: (fn, milliseconds) => {
    assert.equal(milliseconds, 15 * 60000); callback = fn; return { unref() {} };
  } });
  assert.equal(calls, 1); await callback(); assert.equal(calls, 2);
  process.env.UNLISTED_SYNC_ENABLED = "false";
  mirror.startAutoSync({ sync: async () => { throw Error("Must not run"); } });
});

test("cached logos use conditional requests, new versions get immutable file names", async t => {
  const ctx = context(t, []);
  const row = { name: "Company", logo: "https://www.unlistedkraft.in/logo.png" };
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(png, { headers: { ETag: '"one"' } }));
  const first = await mirror.fetchLogo(row, null, ctx.dir);
  fetch.mock.restore();
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.headers["If-None-Match"], '"one"');
    return new Response(null, { status: 304 });
  });
  const second = await mirror.fetchLogo(row, first, ctx.dir);
  assert.equal(second.logo_url, first.logo_url);
});

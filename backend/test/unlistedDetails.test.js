"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const details = require("../src/services/unlistedDetails");
const {
  cachedDocument,
  checkDocuments,
} = require("../src/services/unlistedDocuments");

test("source history uses explicit US dates, preserves gaps, deduplicates and excludes invalid/future quotes", () => {
  const html =
    'var rate_history = [["04/05/2022 10:00:00",14],["04/05/2022 11:00:00",15],["09/12/2022 10:00:00",-1],["01/01/2030 10:00:00",99],["10/01/2026 10:00:00",24]];';
  assert.deepEqual(details.parseHistory(html, "2026-11-17"), [
    ["2022-04-05", 15],
    ["2026-10-01", 24],
  ]);
  assert.throws(
    () =>
      details.parseHistory('var rate_history = [["02/31/2026 10:00:00",24]];'),
    /Invalid source/,
  );
  assert.throws(
    () => details.parseHistory("var rate_history = [dangerous()];"),
    SyntaxError,
  );
  assert.deepEqual(details.parseHistory("<html>No graph</html>"), []);
});

test("daily observations use India midnight and keep one latest quote per day across restarts and upstream corrections", () => {
  assert.equal(
    details.indiaDay(new Date("2026-11-17T18:40:00Z")),
    "2026-11-18",
  );
  const first = details.mergeHistory(
    null,
    { price_history: [["2022-04-04", 145]] },
    23.35,
    "2026-11-17T17:00:00Z",
  );
  const next = details.mergeHistory(
    first,
    { price_history: [["2022-04-04", 144]] },
    24,
    "2026-11-17T18:00:00Z",
  );
  assert.deepEqual(next.daily_quotes, [["2026-11-17", 24]]);
  assert.deepEqual(next.price_history, [
    ["2022-04-04", 144],
    ["2026-11-17", 24],
  ]);
  const midnight = details.mergeHistory(
    next,
    { price_history: [] },
    25,
    "2026-11-17T18:40:00Z",
  );
  assert.deepEqual(midnight.daily_quotes, [
    ["2026-11-17", 24],
    ["2026-11-18", 25],
  ]);
  const unavailable = details.mergeHistory(
    midnight,
    {},
    0,
    "2026-11-18T19:00:00Z",
  );
  assert.deepEqual(unavailable.price_history, midnight.price_history);
  assert.equal(unavailable.daily_quote_date, "2026-11-18");
});

test("PDF discovery keeps actual public links, labels/years and removes duplicates and unsafe hosts", () => {
  const url =
    "https://investkraft-new.s3.ap-south-1.amazonaws.com/web_app/live/assets/docs/unlistedshare/company_1/report.pdf?ver=1";
  const html = `<label>Annual Report 2024-2025</label><a id="download_link_0" href="${url}">Download</a><!-- <a id="download_link_1" href="https://evil.test/report.pdf">fake</a> --><a id="download_link_2" href="${url}">Duplicate</a><a id="download_link_3" href="http://127.0.0.1/secrets.pdf">Bad</a>`;
  const docs = details.parseDocuments(html);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].year, "2024-2025");
  assert.equal(docs[0].type, "Annual report");
  assert.match(docs[0].id, /^[a-f0-9]{24}$/);
  assert.equal(details.isDocumentUrl(url), true);
  for (const bad of [
    url.replace("https:", "http:"),
    url.replace(".com/", ".com.evil/"),
    "https://www.unlistedkraft.in/login",
    "file:///etc/passwd",
  ])
    assert.equal(details.isDocumentUrl(bad), false);
});

test("all financial tables and factual ownership/leadership fields are imported", () => {
  const html =
    '<!-- Key Financials section start --><div id="nested-tabs-1"><table><tr><th>Revenue</th><td>100</td></tr></table></div><div id="nested-tabs-2"><table><tr><th>Assets</th><td>90</td></tr></table><table><tr><th>Liabilities</th><td>90</td></tr></table></div><div id="nested-tabs-3"></div><!-- Key Financials section end --><!-- Shareholding Pattern Section start --><table><tr><th>Name</th><th>Holding</th></tr><tr><td>Founder</td><td>40%</td></tr></table><!-- Shareholding Pattern Section end --><!-- Promoters Section start --><table><tr><th>Name</th><th>Role</th></tr><tr><td>A &amp; B</td><td>CEO</td></tr></table><!-- Promoters Section end --><span>Current Status :</span><span class="status">DRHP Filed</span>';
  const data = details.parseExtras(html);
  assert.equal(data.financials.length, 3);
  assert.equal(data.financials[2].rows[0][0], "Liabilities");
  assert.deepEqual(data.shareholding, [{ name: "Founder", holding: "40%" }]);
  assert.deepEqual(data.promoters, [{ name: "A & B", designation: "CEO" }]);
  assert.equal(data.company_status, "DRHP Filed");
});

test("PDF checks validate bytes, retry daily and retain verified records during an outage", async () => {
  const doc = {
    id: "a".repeat(24),
    source_url:
      "https://investkraft-new.s3.ap-south-1.amazonaws.com/web_app/live/assets/docs/unlistedshare/company_1/test.pdf",
  };
  const good = await checkDocuments([doc], [], async (_url, opts) => {
    assert.equal(opts.headers.Range, "bytes=0-7");
    return { body: Buffer.from("%PDF-1.7") };
  });
  assert.equal(good[0].available, true);
  const cached = await checkDocuments([doc], good, async () => {
    throw Error("Should not fetch");
  });
  assert.deepEqual(cached, good);
  const stale = [{ ...good[0], checked_at: "2020-01-01" }];
  assert.equal(
    (
      await checkDocuments([doc], stale, async () => {
        throw Error("Down");
      })
    )[0].available,
    true,
  );
  assert.equal(
    (
      await checkDocuments([doc], [], async () => ({
        body: Buffer.from("<html>Sign in"),
      }))
    )[0].available,
    false,
  );
});

test("PDF caching coalesces parallel downloads, rejects HTML and retains a valid PDF through failure", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "finvoq-pdf-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const doc = {
    id: "a".repeat(24),
    source_url:
      "https://investkraft-new.s3.ap-south-1.amazonaws.com/web_app/live/assets/docs/unlistedshare/company_1/test.pdf",
  };
  let calls = 0;
  const options = {
    dir,
    request: async () => {
      calls++;
      return { body: Buffer.from("%PDF-1.7\nVerified test document") };
    },
  };
  const files = await Promise.all(
    Array.from({ length: 5 }, () => cachedDocument(doc, options)),
  );
  assert.equal(calls, 1);
  assert.ok(files.every((f) => f === files[0]));
  assert.equal(fs.readFileSync(files[0], "utf8").startsWith("%PDF-"), true);
  await cachedDocument(doc, {
    ...options,
    now: Date.now() + 2 * 86400000,
    request: async () => {
      throw Error("Offline");
    },
  });
  await assert.rejects(
    cachedDocument(
      { ...doc, id: "b".repeat(24) },
      {
        dir,
        request: async () => ({ body: Buffer.from("<html>Login</html>") }),
      },
    ),
    /did not return a PDF/,
  );
  await assert.rejects(
    cachedDocument(
      { ...doc, source_url: "https://evil.test/document.pdf" },
      options,
    ),
    /Invalid investor/,
  );
});

test("buy and sell enquiries match the actual leads API contract without sending mail or creating leads", async () => {
  const { buildUnlistedEnquiry } = await import(
    "../../frontend/lib/unlisted-enquiry.mjs"
  );
  const schema = require("../src/validation/leads");
  for (const intent of ["buy", "sell"]) {
    const payload = buildUnlistedEnquiry({
      name: "Test Person",
      email: "test@example.com",
      phone: "9999999999",
      company: "Example Private Limited",
      units: 1000,
      intent,
      hasQuote: true,
      total: 23353.5,
    });
    assert.equal(schema.safeParse(payload).success, true);
    assert.match(
      payload.message,
      intent === "sell" ? /Sell enquiry/ : /Buy enquiry/,
    );
    if (intent === "sell") assert.equal(payload.budget, "Quote requested");
  }
});

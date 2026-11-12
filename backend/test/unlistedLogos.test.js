"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const express = require("express");

test("bundled AVIF logos have the correct MIME type and unsafe paths are rejected", async t => {
  const app = express();
  app.use("/logos", require("../src/routes/unlistedLogos"));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const dir = path.join(__dirname, "../src/data/unlisted-logos");
  const avif = fs.readdirSync(dir).find(file => file.endsWith(".avif"));
  assert.ok(avif);
  const response = await fetch(`http://127.0.0.1:${server.address().port}/logos/file/${avif}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^image\/avif/);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(dir, avif)));
  const invalid = await fetch(`http://127.0.0.1:${server.address().port}/logos/file/not-an-image.txt`);
  assert.equal(invalid.status, 404);
});

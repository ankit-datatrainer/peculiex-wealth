"use strict";

const fs = require("fs");
const path = require("path");
const { isDocumentUrl } = require("./unlistedDetails");
const { DATA_DIR } = require("./unlistedCatalogState");
const pending = new Map();
let active = 0;
const queue = [];

async function checkDocuments(
  documents,
  previous = [],
  request = require("./unlistedMirror").request,
) {
  const checked = [];
  for (const document of documents) {
    const prior = previous.find((p) => p.id === document.id);
    if (
      prior?.checked_at &&
      Date.now() - Date.parse(prior.checked_at) < 86400000
    ) {
      checked.push({
        ...document,
        available: prior.available,
        checked_at: prior.checked_at,
      });
      continue;
    }
    try {
      const { body } = await request(document.source_url, {
        maxBytes: 4096,
        headers: { Range: "bytes=0-7" },
      });
      checked.push({
        ...document,
        available: body.subarray(0, 5).toString() === "%PDF-",
        checked_at: new Date().toISOString(),
      });
    } catch (error) {
      // Never discard an existing verified document during a transient source outage.
      checked.push({
        ...document,
        available: prior?.available === true ? true : false,
        checked_at: new Date().toISOString(),
      });
    }
  }
  return checked;
}

async function cachedDocument(
  document,
  {
    dir = path.join(DATA_DIR, "documents"),
    request = require("./unlistedMirror").request,
    now = Date.now(),
  } = {},
) {
  if (
    !/^[a-f0-9]{24}$/.test(document.id) ||
    !isDocumentUrl(document.source_url)
  )
    throw Error("Invalid investor document");
  const file = path.join(dir, `${document.id}.pdf`);
  if (fs.existsSync(file) && now - fs.statSync(file).mtimeMs < 86400000)
    return file;
  const key = `${dir}:${document.id}`;
  if (pending.has(key)) return pending.get(key);
  if (queue.length >= 20)
    throw Error("Document service busy; please retry shortly");
  const job = (async () => {
    if (active >= 3) await new Promise((resolve) => queue.push(resolve));
    active++;
    try {
      const { body } = await request(document.source_url, {
        maxBytes: 40 * 1024 * 1024,
      });
      if (body.length < 8 || body.subarray(0, 5).toString() !== "%PDF-")
        throw Error("Source did not return a PDF");
      fs.mkdirSync(dir, { recursive: true });
      const temporary = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(temporary, body);
      fs.renameSync(temporary, file);
      return file;
    } catch (error) {
      if (fs.existsSync(file)) return file; // Preserve a previously validated public PDF during an outage.
      throw error;
    } finally {
      active--;
      queue.shift()?.();
    }
  })();
  pending.set(key, job);
  try {
    return await job;
  } finally {
    pending.delete(key);
  }
}

module.exports = { cachedDocument, checkDocuments };

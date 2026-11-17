"use strict";

const crypto = require("crypto");
const { cleanText } = require("./unlistedSource");

function indiaDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function validDay(day) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}

function parseHistory(html, today = indiaDay()) {
  const match = html.match(/\bvar\s+rate_history\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!match) return [];
  const rows = JSON.parse(match[1]); // Data only: never evaluate upstream scripts.
  if (!Array.isArray(rows) || rows.length > 30000)
    throw Error("Invalid source price history");
  const byDay = new Map();
  for (const row of rows) {
    const date =
      Array.isArray(row) &&
      typeof row[0] === "string" &&
      row[0].match(/^(\d{2})\/(\d{2})\/(\d{4})\s/);
    if (!date) throw Error("Unrecognized source history date");
    // The upstream chart uses MM/DD/YYYY, not the host's locale/date parser.
    const day = `${date[3]}-${date[1]}-${date[2]}`;
    if (!validDay(day)) throw Error("Invalid source history date");
    if (
      day <= today &&
      typeof row[1] === "number" &&
      Number.isFinite(row[1]) &&
      row[1] > 0
    )
      byDay.set(day, row[1]);
  }
  return [...byDay].sort(([a], [b]) => a.localeCompare(b));
}

function tableRows(html) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) =>
      [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        cleanText(cell[1]),
      ),
    )
    .filter((row) => row.length);
}

function commentSection(html, name) {
  const start = html.indexOf(`<!-- ${name}`);
  if (start < 0) return "";
  const end = html.indexOf(`<!-- ${name.replace(/start.*/, "end")}`, start + 8);
  return html.slice(
    start,
    end < 0 ? html.indexOf("</section>", start) + 10 : end,
  );
}

function isDocumentUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "investkraft-new.s3.ap-south-1.amazonaws.com" &&
      /^\/web_app\/live\/assets\/docs\/unlistedshare\/company_\d+\/[^/]+\.pdf$/i.test(
        url.pathname,
      ) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function parseDocuments(html) {
  const documents = new Map();
  // Ignore commented-out duplicate links, scripts and forms that require upstream sign-in.
  const clean = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const match of clean.matchAll(
    /<a\b([^>]*\bid="download_link[^\"]*"[^>]*)>/gi,
  )) {
    const href = match[1]
      .match(/\bhref="([^"]+)"/i)?.[1]
      ?.replace(/&amp;/g, "&");
    if (!isDocumentUrl(href)) continue;
    const preceding = clean.slice(Math.max(0, match.index - 3200), match.index);
    const labels = [
      ...preceding.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi),
    ];
    const title = cleanText(
      labels.at(-1)?.[1] || "Investor presentation",
    ).slice(0, 180);
    const id = crypto
      .createHash("sha256")
      .update(href)
      .digest("hex")
      .slice(0, 24);
    documents.set(href, {
      id,
      title,
      type: /annual report/i.test(title)
        ? "Annual report"
        : /presentation/i.test(title)
          ? "Presentation"
          : "Investor document",
      year: title.match(/\b20\d{2}\s*[-–]\s*20\d{2}\b/)?.[0] || "",
      source_url: href,
    });
  }
  return [...documents.values()];
}

function parseExtras(html, today) {
  const financialSection = commentSection(html, "Key Financials section start");
  const financials = ["Profit & Loss", "Balance Sheet"].flatMap(
    (title, index) => {
      const begin = financialSection.indexOf(`id="nested-tabs-${index + 1}"`);
      if (begin < 0) return [];
      const end = financialSection.indexOf(
        `id="nested-tabs-${index + 2}"`,
        begin,
      );
      const panel = financialSection.slice(
        begin,
        end < 0 ? financialSection.length : end,
      );
      return [...panel.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
        .map((m, i) => ({
          title: i ? `${title} · ${i + 1}` : title,
          rows: tableRows(m[1]),
        }))
        .filter((t) => t.rows.length);
    },
  );
  const holders = tableRows(
    commentSection(html, "Shareholding Pattern Section start"),
  )
    .slice(1)
    .map((row) => ({ name: row[0], holding: row[1] }))
    .filter((row) => row.name && row.holding);
  const promoters = tableRows(commentSection(html, "Promoters Section start"))
    .slice(1)
    .map((row) => ({ name: row[0], designation: row[1] }))
    .filter((row) => row.name && row.designation);
  const status = cleanText(
    html.match(
      /Current Status\s*:\s*<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>/i,
    )?.[1] || "",
  );
  return {
    price_history: parseHistory(html, today),
    documents: parseDocuments(html),
    shareholding: holders,
    promoters,
    company_status: status,
    financials,
  };
}

function mergeHistory(previous, details, price, checkedAt) {
  const today = indiaDay(new Date(checkedAt));
  const quotes = new Map(
    (previous?.daily_quotes || []).filter(
      (p) =>
        validDay(p[0]) && p[0] <= today && Number.isFinite(p[1]) && p[1] > 0,
    ),
  );
  if (Number.isFinite(price) && price > 0) quotes.set(today, price);
  const history = new Map(
    (previous?.price_history || []).filter(
      (p) =>
        validDay(p[0]) && p[0] <= today && Number.isFinite(p[1]) && p[1] > 0,
    ),
  );
  for (const [date, value] of details.price_history || [])
    history.set(date, value);
  // A day's latest observed listing quote wins; never manufacture missing days.
  for (const [date, value] of quotes) history.set(date, value);
  return {
    price_history: [...history].sort(([a], [b]) => a.localeCompare(b)),
    daily_quotes: [...quotes].sort(([a], [b]) => a.localeCompare(b)),
    daily_quote_date: quotes.has(today)
      ? today
      : quotes.size
        ? [...quotes.keys()].sort().at(-1)
        : null,
  };
}

module.exports = {
  indiaDay,
  validDay,
  parseHistory,
  tableRows,
  isDocumentUrl,
  parseDocuments,
  parseExtras,
  mergeHistory,
};

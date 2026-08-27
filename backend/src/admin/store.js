"use strict";

/**
 * Admin store: CRUD over the editable catalog tables (unlisted_shares,
 * stocks). Mirrors the auth store pattern — uses Supabase when configured,
 * otherwise an in-memory map seeded from `seed.js` so the admin panel is
 * fully functional even in zero-config "seed mode".
 *
 * Every record has a stable `id` (UUID) so an item can be renamed without
 * losing its identity. The DB tables keep `name` / `sym` as the natural
 * primary key for backwards compatibility, but admin CRUD uses `id`.
 */

const crypto = require("crypto");
const { client, isLive } = require("../db");
const seed = require("../seed");

const UNLISTED_TABLE = "unlisted_shares";
const STOCKS_TABLE = "stocks";

const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const VALID_UNLISTED_TAGS = new Set(["trend", "avail", "lim"]);
const VALID_STOCK_CATS = new Set(["up", "stable", "watch"]);

// --------------------------------------------------------------
// In-memory state (seed-mode fallback). Lazy-seeded on first use so we
// don't pay the cost when running against Supabase.
// --------------------------------------------------------------
const mem = {
  unlisted: null, // Map<id, item> | null until first seeded
  stocks: null
};

function seedUnlistedMem() {
  if (mem.unlisted) return mem.unlisted;
  mem.unlisted = new Map();
  for (const u of seed.UNLISTED) {
    const id = newId();
    mem.unlisted.set(id, {
      id,
      name: u.name,
      domain: u.domain,
      sector: u.sector,
      brand: u.brand,
      initial: u.initial,
      price: Number(u.price),
      iv: u.iv,
      tag: u.tag,
      logo_url: u.logo_url || null,
      min_units: u.min_units || 0,
      market_cap: u.market_cap || "",
      pe: u.pe || "N/A",
      created_at: now(),
      updated_at: now()
    });
  }
  return mem.unlisted;
}

function seedStocksMem() {
  if (mem.stocks) return mem.stocks;
  mem.stocks = new Map();
  for (const s of seed.STOCKS) {
    const id = newId();
    mem.stocks.set(id, {
      id,
      sym: s.sym,
      name: s.name,
      price: Number(s.price),
      chg: Number(s.chg),
      vol: s.vol,
      cap: s.cap,
      cat: s.cat,
      created_at: now(),
      updated_at: now()
    });
  }
  return mem.stocks;
}

// --------------------------------------------------------------
// Coercion helpers — every external write goes through these so the
// shapes stay consistent whether they came from a JSON body, a form
// post, or a Supabase row.
// --------------------------------------------------------------
function coerceUnlistedInput(input, { partial = false } = {}) {
  const out = {};
  const keys = [
    "name",
    "domain",
    "sector",
    "brand",
    "initial",
    "price",
    "iv",
    "tag",
    "logo_url",
    "min_units",
    "market_cap",
    "pe"
  ];
  for (const k of keys) {
    if (input[k] === undefined) continue;
    let v = input[k];
    if (k === "price") {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) throw new Error("price must be a non-negative number");
      out.price = n;
    } else if (k === "tag") {
      if (!VALID_UNLISTED_TAGS.has(v)) throw new Error("tag must be trend, avail or lim");
      out.tag = v;
    } else if (k === "initial") {
      out.initial = String(v).trim().slice(0, 2) || "?";
    } else if (k === "brand") {
      const s = String(v).trim();
      if (!/^#?[0-9a-fA-F]{3,8}$/.test(s)) throw new Error("brand must be a hex colour like #EE2E24");
      out.brand = s.startsWith("#") ? s : "#" + s;
    } else if (k === "domain") {
      out.domain = String(v).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    } else if (k === "logo_url") {
      out.logo_url = v ? String(v).trim().slice(0, 500) : null;
    } else if (k === "min_units") {
      const n = Number(v);
      out.min_units = Number.isFinite(n) && n >= 0 ? n : 0;
    } else if (k === "market_cap" || k === "pe") {
      out[k] = String(v).trim().slice(0, 50);
    } else {
      // name, sector, iv — plain string fields
      out[k] = String(v).trim().slice(0, 200);
    }
  }
  if (!partial) {
    const required = ["name", "domain", "sector", "brand", "initial", "price", "iv", "tag"];
    for (const r of required) {
      if (out[r] === undefined || out[r] === null || out[r] === "") {
        throw new Error(`Field "${r}" is required`);
      }
    }
  }
  return out;
}

function coerceStockInput(input, { partial = false } = {}) {
  const out = {};
  const setNum = (k) => {
    if (input[k] === undefined) return;
    const n = Number(input[k]);
    if (!Number.isFinite(n)) throw new Error(`${k} must be a number`);
    out[k] = n;
  };
  const setStr = (k, max = 80) => {
    if (input[k] === undefined) return;
    out[k] = String(input[k]).trim().slice(0, max);
  };
  if (input.sym !== undefined) {
    out.sym = String(input.sym).trim().toUpperCase().slice(0, 20);
  }
  setStr("name", 120);
  setNum("price");
  setNum("chg");
  setStr("vol", 30);
  setStr("cap", 30);
  if (input.cat !== undefined) {
    if (!VALID_STOCK_CATS.has(input.cat)) throw new Error("cat must be up, stable or watch");
    out.cat = input.cat;
  }
  if (!partial) {
    const required = ["sym", "name", "price", "chg", "vol", "cap", "cat"];
    for (const r of required) {
      if (out[r] === undefined || out[r] === null || out[r] === "") {
        throw new Error(`Field "${r}" is required`);
      }
    }
  }
  return out;
}

// --------------------------------------------------------------
// UNLISTED SHARES
// --------------------------------------------------------------

async function listUnlisted() {
  if (!isLive()) {
    return Array.from(seedUnlistedMem().values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  
  const seedUnlisted = require("../seed").UNLISTED;
  const seedByName = new Map(seedUnlisted.map(u => [u.name, u]));
  return (data || []).map(item => {
    const s = seedByName.get(item.name);
    if (!s) return item;
    return {
      ...item,
      min_units: item.min_units ?? s.min_units ?? 0,
      market_cap: item.market_cap ?? s.market_cap ?? "",
      pe: item.pe ?? s.pe ?? "N/A",
      logo_url: item.logo_url ?? s.logo_url ?? null
    };
  });
}

async function getUnlistedById(id) {
  if (!id) return null;
  if (!isLive()) return seedUnlistedMem().get(id) || null;
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const s = require("../seed").UNLISTED.find(u => u.name === data.name);
  if (!s) return data;
  return {
    ...data,
    min_units: data.min_units ?? s.min_units ?? 0,
    market_cap: data.market_cap ?? s.market_cap ?? "",
    pe: data.pe ?? s.pe ?? "N/A",
    logo_url: data.logo_url ?? s.logo_url ?? null
  };
}

async function createUnlisted(input) {
  const fields = coerceUnlistedInput(input, { partial: false });
  const row = {
    id: newId(),
    ...fields,
    created_at: now(),
    updated_at: now()
  };
  if (!isLive()) {
    const map = seedUnlistedMem();
    // Soft uniqueness on name to mirror the DB constraint.
    for (const u of map.values()) {
      if (u.name.toLowerCase() === row.name.toLowerCase()) {
        const err = new Error("An unlisted share with this name already exists.");
        err.status = 409;
        throw err;
      }
    }
    map.set(row.id, row);
    return row;
  }
  const dbRow = { ...row };
  delete dbRow.min_units;
  delete dbRow.market_cap;
  delete dbRow.pe;
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .insert(dbRow)
    .select("*")
    .single();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("An unlisted share with this name already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  const s = require("../seed").UNLISTED.find(u => u.name === data.name);
  return s ? {
    ...data,
    min_units: data.min_units ?? s.min_units ?? 0,
    market_cap: data.market_cap ?? s.market_cap ?? "",
    pe: data.pe ?? s.pe ?? "N/A",
    logo_url: data.logo_url ?? s.logo_url ?? null
  } : data;
}

async function updateUnlisted(id, patch) {
  const fields = coerceUnlistedInput(patch, { partial: true });
  if (Object.keys(fields).length === 0) return getUnlistedById(id);
  fields.updated_at = now();

  if (!isLive()) {
    const map = seedUnlistedMem();
    const cur = map.get(id);
    if (!cur) return null;
    if (fields.name) {
      for (const [otherId, u] of map) {
        if (otherId !== id && u.name.toLowerCase() === fields.name.toLowerCase()) {
          const err = new Error("An unlisted share with this name already exists.");
          err.status = 409;
          throw err;
        }
      }
    }
    const next = { ...cur, ...fields };
    map.set(id, next);
    return next;
  }
  const dbFields = { ...fields };
  delete dbFields.min_units;
  delete dbFields.market_cap;
  delete dbFields.pe;
  const { data, error } = await client
    .from(UNLISTED_TABLE)
    .update(dbFields)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("An unlisted share with this name already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  if (!data) return null;
  const s = require("../seed").UNLISTED.find(u => u.name === data.name);
  return s ? {
    ...data,
    min_units: data.min_units ?? s.min_units ?? 0,
    market_cap: data.market_cap ?? s.market_cap ?? "",
    pe: data.pe ?? s.pe ?? "N/A",
    logo_url: data.logo_url ?? s.logo_url ?? null
  } : data;
}

async function deleteUnlisted(id) {
  if (!id) return false;
  if (!isLive()) {
    const map = seedUnlistedMem();
    return map.delete(id);
  }
  const { error, count } = await client
    .from(UNLISTED_TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function countUnlisted() {
  if (!isLive()) return seedUnlistedMem().size;
  const { count, error } = await client
    .from(UNLISTED_TABLE)
    .select("name", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

// --------------------------------------------------------------
// STOCKS
// --------------------------------------------------------------

async function listStocks() {
  if (!isLive()) {
    return Array.from(seedStocksMem().values()).sort((a, b) =>
      a.sym.localeCompare(b.sym)
    );
  }
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .select("*")
    .order("sym", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

async function getStockById(id) {
  if (!id) return null;
  if (!isLive()) return seedStocksMem().get(id) || null;
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function createStock(input) {
  const fields = coerceStockInput(input, { partial: false });
  const row = {
    id: newId(),
    ...fields,
    created_at: now(),
    updated_at: now()
  };
  if (!isLive()) {
    const map = seedStocksMem();
    for (const s of map.values()) {
      if (s.sym === row.sym) {
        const err = new Error("A stock with this symbol already exists.");
        err.status = 409;
        throw err;
      }
    }
    map.set(row.id, row);
    return row;
  }
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .insert(row)
    .select("*")
    .single();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("A stock with this symbol already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data;
}

async function updateStock(id, patch) {
  const fields = coerceStockInput(patch, { partial: true });
  if (Object.keys(fields).length === 0) return getStockById(id);
  fields.updated_at = now();

  if (!isLive()) {
    const map = seedStocksMem();
    const cur = map.get(id);
    if (!cur) return null;
    if (fields.sym) {
      for (const [otherId, s] of map) {
        if (otherId !== id && s.sym === fields.sym) {
          const err = new Error("A stock with this symbol already exists.");
          err.status = 409;
          throw err;
        }
      }
    }
    const next = { ...cur, ...fields };
    map.set(id, next);
    return next;
  }
  const { data, error } = await client
    .from(STOCKS_TABLE)
    .update(fields)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      const err = new Error("A stock with this symbol already exists.");
      err.status = 409;
      throw err;
    }
    throw new Error(error.message);
  }
  return data || null;
}

async function deleteStock(id) {
  if (!id) return false;
  if (!isLive()) {
    return seedStocksMem().delete(id);
  }
  const { error, count } = await client
    .from(STOCKS_TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function countStocks() {
  if (!isLive()) return seedStocksMem().size;
  const { count, error } = await client
    .from(STOCKS_TABLE)
    .select("sym", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

// --------------------------------------------------------------
// Submission tables — read-only listing for the admin viewer
// --------------------------------------------------------------

async function listLeads({ limit = 500 } = {}) {
  if (!isLive()) return [];
  const cap = Math.min(Math.max(Number(limit) || 500, 1), 2000);
  const { data, error } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return data || [];
}

async function updateLeadStatus(id, status) {
  if (!isLive()) return null;
  const allowed = new Set(["new", "contacted", "qualified", "won", "lost"]);
  if (!allowed.has(status)) throw new Error("Invalid status");
  const { data, error } = await client
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function deleteLead(id) {
  if (!isLive()) return false;
  const { error, count } = await client
    .from("leads")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function listNewsletter({ limit = 1000 } = {}) {
  if (!isLive()) return [];
  const cap = Math.min(Math.max(Number(limit) || 1000, 1), 5000);
  const { data, error } = await client
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return data || [];
}

async function deleteNewsletter(email) {
  if (!isLive()) return false;
  const e = String(email || "").trim().toLowerCase();
  if (!e) return false;
  const { error, count } = await client
    .from("newsletter_subscribers")
    .delete({ count: "exact" })
    .eq("email", e);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

async function listContact({ limit = 500 } = {}) {
  if (!isLive()) return [];
  const cap = Math.min(Math.max(Number(limit) || 500, 1), 2000);
  const { data, error } = await client
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return data || [];
}

async function deleteContact(id) {
  if (!isLive()) return false;
  const { error, count } = await client
    .from("contact_messages")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

// --------------------------------------------------------------
// BLOGS
// --------------------------------------------------------------

const BLOGS_TABLE = "blogs";

function seedBlogsMem() {
  if (mem.blogs) return mem.blogs;
  mem.blogs = new Map();
  const seedBlogs = [
    {
      title: "Why Advisory-Led Investing Beats Pure DIY in 2026",
      slug: "advisory-led-investing-beats-diy-2026",
      excerpt:
        "Navigating volatile markets requires discipline and expert curation. Here's why personalized advisory creates durable wealth over pure DIY trading.",
      body: `<h2>The Limitations of Pure DIY Investing</h2>
<p>Over the last decade, discount brokerages democratized access to the stock markets. Anyone with a smartphone can now place an order within seconds. However, access to trade is not equivalent to investment expertise. Data published by SEBI repeatedly highlights that over 90% of individual active traders consistently lose capital.</p>
<p>The primary barrier to wealth creation is not lack of information, but the inability to filter market noise, manage behavioral biases, and execute a disciplined asset allocation framework.</p>

<h2>What Advisory-Led Wealth Management Delivers</h2>
<p>Advisory-led investing combines modern data analytics with human wisdom. Rather than chasing short-term market tips or panic-selling during routine drawdowns, an advisory partner provides:</p>
<ul>
  <li><strong>Goal-Aligned Portfolio Construction:</strong> Tailoring your asset mix to your time horizon, liquidity requirements, and risk appetite.</li>
  <li><strong>Curated Multi-Asset Access:</strong> Vetted opportunities across Equities, Mutual Funds, PMS, AIFs, Bonds, and Pre-IPO shares.</li>
  <li><strong>Emotional Circuit Breakers:</strong> Preventing impulse decisions during peak bull exuberance or deep market corrections.</li>
  <li><strong>Continuous Rebalancing:</strong> Locking in gains from outperforming sectors and accumulating undervalued assets systematically.</li>
</ul>

<blockquote>"Investing is not about beating the market in any single month; it is about building a compounding engine that endures market cycles."</blockquote>

<h2>The Finvoq Approach</h2>
<p>At Finvoq, we believe technology should empower, not replace, strategic financial guidance. Our platform unites 10+ asset classes in a single unified dashboard, backed by SEBI-registered expertise to help you build resilient, generational wealth.</p>`,
      image_url: "/images/blogs/blog-1.jpg",
      author: "Finvoq Admin",
      category: "Wealth Advisory",
      published: true,
      position: 1,
      meta_title: "Why Advisory-Led Investing Beats Pure DIY in 2026 | Finvoq",
      meta_description: "Discover why personalized wealth advisory outperforms pure DIY trading in 2026. Explore behavioral discipline, multi-asset allocation, and portfolio risk management.",
      focus_keyword: "advisory led investing",
      meta_keywords: "wealth management, advisory investing, sebi registered advisor, diy investing risks, asset allocation",
      tags: ["Advisory", "Investing", "SEBI", "Wealth Creation", "Market Strategy"],
      canonical_url: "https://finvoq.com/blog/advisory-led-investing-beats-diy-2026",
      og_image: "/images/blogs/blog-1.jpg"
    },
    {
      title: "Pre-IPO & Unlisted Equities: The New Frontier of Alpha",
      slug: "pre-ipo-unlisted-equities-alpha",
      excerpt:
        "Discover how early access to India's high-growth private champions before their IPO can deliver outsized portfolio returns.",
      body: `<h2>Why the Biggest Value Creation Happens Before the IPO</h2>
<p>Companies are staying private much longer than they did twenty years ago. Industry leaders in fintech, quick commerce, green energy, and defense technology often achieve multi-billion dollar valuations and mature business models long before filing their Red Herring Prospectus (DRHP).</p>
<p>By the time a marquee company goes public on the NSE or BSE, the lion's share of early-stage growth and valuation multiple expansion has already been captured by institutional investors.</p>

<h2>Understanding the Risk-Reward Equation</h2>
<p>Investing in unlisted equities offers immense potential, but demands rigorous due diligence:</p>
<ul>
  <li><strong>Valuation Discipline:</strong> Comparing private transaction multiples against publicly listed peers.</li>
  <li><strong>Liquidity & Holding Periods:</strong> Pre-IPO shares generally require a 2 to 4 year investment horizon.</li>
  <li><strong>Regulatory Safeguards:</strong> Under SEBI guidelines, shares held prior to an IPO are subject to a mandatory lock-in period (typically 6 months) post-listing.</li>
</ul>

<h2>How Finvoq Democratizes Pre-IPO Investing</h2>
<p>Historically reserved for ultra-HNIs and venture funds, Finvoq opens direct access to verified unlisted shares with institutional-grade research, transparent pricing, and seamless demat delivery into your existing CDSL/NSDL account.</p>`,
      image_url: "/images/blogs/blog-2.jpg",
      author: "Finvoq Admin",
      category: "Private Equity & Pre-IPO",
      published: true,
      position: 2,
      meta_title: "Pre-IPO & Unlisted Equities: The New Frontier of Alpha | Finvoq",
      meta_description: "Learn how investing in India's top pre-IPO and unlisted shares before their public listing unlocks exponential portfolio alpha and early-stage compounding.",
      focus_keyword: "unlisted equities alpha",
      meta_keywords: "pre ipo shares, unlisted shares india, private equity investing, drhp filing, cdsl demat delivery",
      tags: ["Pre-IPO", "Unlisted Shares", "Alpha", "Private Markets", "Venture Growth"],
      canonical_url: "https://finvoq.com/blog/pre-ipo-unlisted-equities-alpha",
      og_image: "/images/blogs/blog-2.jpg"
    },
    {
      title: "The Art of Multi-Asset Allocation: Stocks, Bonds & Alternatives",
      slug: "art-of-multi-asset-allocation",
      excerpt:
        "Why true diversification goes beyond large-cap equities. A comprehensive framework for balancing risk and reward across 10+ asset classes.",
      body: `<h2>Beyond the Traditional 60/40 Portfolio</h2>
<p>For decades, standard financial advice recommended a basic 60% equity and 40% bond split. However, macroeconomic shifts, sticky inflation cycles, and changing interest rate regimes mean traditional correlation models are no longer sufficient.</p>

<h2>The 4 Pillars of a Resilient Modern Portfolio</h2>
<ol>
  <li><strong>Growth Engines (Equities & Mutual Funds):</strong> Providing long-term capital appreciation that beats inflation.</li>
  <li><strong>Yield & Capital Preservation (Bonds & Corporate FDs):</strong> Generating steady, predictable cash flows and downside defense.</li>
  <li><strong>Alpha Generators (PMS & Unlisted Shares):</strong> High-conviction concentrated strategies designed to outpace benchmark indices.</li>
  <li><strong>Alternative Assets (AIFs & Gold):</strong> Providing non-correlated returns during macroeconomic dislocations.</li>
</ol>

<h2>Dynamic Rebalancing in Action</h2>
<p>When equities surge, taking partial profits to reallocate into high-yielding fixed income locks in gains. When markets pull back, fixed income yield provides liquidity to acquire equities at discounted valuations.</p>`,
      image_url: "/images/blogs/blog-3.jpg",
      author: "Finvoq Admin",
      category: "Portfolio Strategy",
      published: true,
      position: 3,
      meta_title: "The Art of Multi-Asset Allocation: Stocks, Bonds & Alternatives | Finvoq",
      meta_description: "Master the modern 4-pillar multi-asset allocation framework beyond the 60/40 rule. Balance equity growth, fixed income yield, and alternative hedges.",
      focus_keyword: "multi-asset allocation",
      meta_keywords: "multi asset allocation, portfolio diversification, risk adjusted returns, dynamic rebalancing",
      tags: ["Asset Allocation", "Diversification", "Stocks", "Bonds", "Alternative Assets"],
      canonical_url: "https://finvoq.com/blog/art-of-multi-asset-allocation",
      og_image: "/images/blogs/blog-3.jpg"
    },
    {
      title: "Mastering Market Volatility: A Systematic Compounding Playbook",
      slug: "mastering-market-volatility-playbook",
      excerpt:
        "How institutional investors use market corrections to strategically rebalance and accelerate compound interest over decades.",
      body: `<h2>Volatility is the Toll for Long-Term Wealth</h2>
<p>Market corrections of 10% to 15% occur almost every year in equity markets. Yet, history consistently demonstrates that every major drawdown has eventually been surpassed by new highs in the Indian growth story.</p>

<h2>3 Rules to Turn Volatility Into an Advantage</h2>
<ul>
  <li><strong>Automate the Core (SIPs & STPs):</strong> Dollar-cost averaging ensures you buy more units when prices fall without emotional hesitation.</li>
  <li><strong>Maintain Strategic Cash Buffers:</strong> Keep liquid capital ready to deploy during market-wide panics when high-quality businesses go on sale.</li>
  <li><strong>Focus on Earnings Growth Over Stock Tickers:</strong> In the short run, the market is a voting machine; in the long run, it is a weighing machine.</li>
</ul>`,
      image_url: "/images/blogs/blog-4.jpg",
      author: "Finvoq Admin",
      category: "Market Insights",
      published: true,
      position: 4,
      meta_title: "Mastering Market Volatility: A Systematic Compounding Playbook | Finvoq",
      meta_description: "Turn market corrections into long-term compounding opportunities. Practical rules for institutional rebalancing, rupee-cost averaging, and equity cash buffers.",
      focus_keyword: "market volatility playbook",
      meta_keywords: "stock market volatility, market corrections, dollar cost averaging, long term compounding",
      tags: ["Market Volatility", "Compounding", "SIP", "Risk Management", "Disciplined Investing"],
      canonical_url: "https://finvoq.com/blog/mastering-market-volatility-playbook",
      og_image: "/images/blogs/blog-4.jpg"
    },
    {
      title: "Fixed Income Reimagined: High-Yield Corporate Bonds & FDs",
      slug: "fixed-income-high-yield-bonds-fds",
      excerpt:
        "Secure steady, predictable cash flows with senior secured bonds and AAA-rated fixed income securities in a shifting interest rate cycle.",
      body: `<h2>Why Fixed Income Deserves a Strategic Place</h2>
<p>With bank savings rates hovering at modest levels, smart investors are looking toward curated corporate bonds, senior debt instruments, and high-yield fixed deposits to generate superior risk-adjusted yields.</p>

<h2>Evaluating Corporate Debt Safely</h2>
<ul>
  <li><strong>Credit Ratings:</strong> Prioritize instruments rated AAA and AA+ by recognized agencies like CRISIL, ICRA, and CARE.</li>
  <li><strong>Seniority & Security:</strong> Understand whether the bond is senior secured (backed by company assets) or subordinated.</li>
  <li><strong>Cash Flow Matching:</strong> Structure maturity dates to align with upcoming financial commitments.</li>
</ul>`,
      image_url: "/images/blogs/blog-5.jpg",
      author: "Finvoq Admin",
      category: "Fixed Income & Debt",
      published: true,
      position: 5,
      meta_title: "Fixed Income Reimagined: High-Yield Corporate Bonds & FDs | Finvoq",
      meta_description: "Secure predictable cash flows with AAA-rated corporate bonds and fixed deposits. Understand credit ratings, seniority, and yield curve strategies in 2026.",
      focus_keyword: "high-yield corporate bonds",
      meta_keywords: "corporate bonds india, high yield fd, fixed income securities, crisil aaa bonds, debt instruments",
      tags: ["Bonds", "Corporate FDs", "Fixed Income", "Yield", "Capital Preservation"],
      canonical_url: "https://finvoq.com/blog/fixed-income-high-yield-bonds-fds",
      og_image: "/images/blogs/blog-5.jpg"
    },
    {
      title: "Portfolio Management Services (PMS) vs Mutual Funds",
      slug: "pms-vs-mutual-funds-guide",
      excerpt:
        "Unpacking the key differences in portfolio concentration, fee structures, and customization for high-net-worth investors.",
      body: `<h2>Choosing the Right Vehicle for Your Capital</h2>
<p>While Mutual Funds offer broad diversification for retail investors, Portfolio Management Services (PMS) cater to discerning investors seeking concentrated, theme-driven alpha.</p>

<h2>Direct Comparison Matrix</h2>
<ul>
  <li><strong>Portfolio Concentration:</strong> Mutual funds often hold 50–100 stocks; a PMS typically focuses on 15–25 high-conviction ideas.</li>
  <li><strong>Ownership:</strong> In a PMS, shares are held directly in your individual demat account.</li>
  <li><strong>Customization:</strong> PMS managers have the agility to hold tactical cash and customize sector exposure based on market regimes.</li>
</ul>`,
      image_url: "/images/blogs/blog-6.jpg",
      author: "Finvoq Admin",
      category: "Investment Vehicles",
      published: true,
      position: 6,
      meta_title: "Portfolio Management Services (PMS) vs Mutual Funds: A 2026 Guide | Finvoq",
      meta_description: "Comparing PMS and Mutual Funds on concentration, direct demat ownership, fee structures, and customization for high-net-worth investors.",
      focus_keyword: "pms vs mutual funds",
      meta_keywords: "pms vs mutual funds, portfolio management services, sebi pms regulations, hni investing india",
      tags: ["PMS", "Mutual Funds", "HNIs", "Portfolio Management", "Alpha Generation"],
      canonical_url: "https://finvoq.com/blog/pms-vs-mutual-funds-guide",
      og_image: "/images/blogs/blog-6.jpg"
    }
  ];
  for (const b of seedBlogs) {
    const id = newId();
    mem.blogs.set(id, {
      id,
      ...b,
      created_at: now(),
      updated_at: now()
    });
  }
  return mem.blogs;
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function coerceBlogInput(input, { partial = false } = {}) {
  const out = {};
  const stringKeys = [
    "title",
    "slug",
    "excerpt",
    "body",
    "author",
    "category",
    "meta_title",
    "meta_description",
    "focus_keyword",
    "meta_keywords",
    "canonical_url",
    "og_image"
  ];
  for (const k of stringKeys) {
    if (input[k] !== undefined) {
      if (k === "slug") {
        out.slug = slugify(input[k]);
      } else {
        out[k] = input[k] ? String(input[k]).trim() : "";
      }
    }
  }
  if (input.image_url !== undefined) {
    out.image_url = input.image_url ? String(input.image_url).trim().slice(0, 1000) : null;
  }
  if (input.published !== undefined) {
    out.published = Boolean(input.published);
  }
  if (input.position !== undefined) {
    const n = Number(input.position);
    out.position = Number.isFinite(n) ? n : 0;
  }
  if (input.tags !== undefined) {
    if (Array.isArray(input.tags)) {
      out.tags = input.tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof input.tags === "string") {
      out.tags = input.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      out.tags = [];
    }
  }
  if (!partial) {
    if (!out.title) throw new Error('Field "title" is required');
    if (!out.slug) out.slug = slugify(out.title);
    if (!out.category) out.category = "Wealth Management";
    if (!out.author) out.author = "Finvoq Admin";
    if (!out.tags) out.tags = [];
  }
  return out;
}

function fillBlogDefaults(row) {
  if (!row) return null;
  const map = seedBlogsMem();
  let seed = null;
  for (const s of map.values()) {
    if (s.slug === row.slug || s.title === row.title) {
      seed = s;
      break;
    }
  }
  const rawAuthor = row.author || seed?.author || "Finvoq Admin";
  const author =
    rawAuthor.toLowerCase().includes("research") ||
    rawAuthor.toLowerCase().includes("singhania") ||
    rawAuthor.toLowerCase().includes("sharma") ||
    rawAuthor.toLowerCase().includes("malhotra") ||
    rawAuthor.toLowerCase().includes("intelligence") ||
    rawAuthor.toLowerCase().includes("team")
      ? "Finvoq Admin"
      : rawAuthor;

  return {
    ...row,
    author,
    category: row.category || seed?.category || "Wealth Advisory",
    meta_title: row.meta_title || seed?.meta_title || `${row.title} | Finvoq`,
    meta_description: row.meta_description || seed?.meta_description || row.excerpt || "",
    focus_keyword: row.focus_keyword || seed?.focus_keyword || "",
    meta_keywords: row.meta_keywords || seed?.meta_keywords || "",
    tags: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags : (seed?.tags || ["Investing", "Wealth"]),
    canonical_url: row.canonical_url || seed?.canonical_url || `https://finvoq.com/blog/${row.slug}`,
    og_image: row.og_image || seed?.og_image || row.image_url || null
  };
}

async function listBlogs({ publishedOnly = false } = {}) {
  const map = seedBlogsMem();
  if (!isLive()) {
    let arr = Array.from(map.values());
    if (publishedOnly) arr = arr.filter((b) => b.published);
    return arr
      .map(fillBlogDefaults)
      .sort((a, b) => (a.position || 0) - (b.position || 0) || new Date(b.created_at) - new Date(a.created_at));
  }
  try {
    let query = client.from(BLOGS_TABLE).select("*");
    if (publishedOnly) query = query.eq("published", true);
    query = query.order("position", { ascending: true }).order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let arr = Array.from(map.values());
      if (publishedOnly) arr = arr.filter((b) => b.published);
      return arr
        .map(fillBlogDefaults)
        .sort((a, b) => (a.position || 0) - (b.position || 0) || new Date(b.created_at) - new Date(a.created_at));
    }
    // Also sync existing memory items if any extra ones were created
    return data.map(fillBlogDefaults);
  } catch {
    let arr = Array.from(map.values());
    if (publishedOnly) arr = arr.filter((b) => b.published);
    return arr
      .map(fillBlogDefaults)
      .sort((a, b) => (a.position || 0) - (b.position || 0) || new Date(b.created_at) - new Date(a.created_at));
  }
}

async function getBlogById(id) {
  if (!id) return null;
  const map = seedBlogsMem();
  if (!isLive()) return fillBlogDefaults(map.get(id)) || null;
  try {
    const { data, error } = await client
      .from(BLOGS_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) return fillBlogDefaults(data);
  } catch {}
  return fillBlogDefaults(map.get(id)) || null;
}

async function getBlogBySlug(slug) {
  if (!slug) return null;
  const map = seedBlogsMem();
  if (!isLive()) {
    for (const b of map.values()) {
      if (b.slug === slug) return fillBlogDefaults(b);
    }
    return null;
  }
  try {
    const { data, error } = await client
      .from(BLOGS_TABLE)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return fillBlogDefaults(data);
  } catch {}
  for (const b of map.values()) {
    if (b.slug === slug) return fillBlogDefaults(b);
  }
  return null;
}

async function createBlog(input) {
  const fields = coerceBlogInput(input, { partial: false });
  if (!fields.slug) fields.slug = slugify(fields.title);
  const row = {
    id: newId(),
    title: fields.title,
    slug: fields.slug,
    excerpt: fields.excerpt || "",
    body: fields.body || "",
    image_url: fields.image_url || null,
    author: fields.author || "Finvoq Admin",
    category: fields.category || "Wealth Advisory",
    published: fields.published !== undefined ? fields.published : true,
    position: fields.position || 0,
    meta_title: fields.meta_title || null,
    meta_description: fields.meta_description || null,
    focus_keyword: fields.focus_keyword || null,
    meta_keywords: fields.meta_keywords || null,
    tags: fields.tags || [],
    canonical_url: fields.canonical_url || null,
    og_image: fields.og_image || null,
    created_at: now(),
    updated_at: now()
  };

  const map = seedBlogsMem();
  map.set(row.id, row);

  if (isLive()) {
    try {
      const { data, error } = await client
        .from(BLOGS_TABLE)
        .insert(row)
        .select("*")
        .single();
      if (!error && data) {
        map.set(data.id, fillBlogDefaults(data));
        return fillBlogDefaults(data);
      }
    } catch {}
  }
  return fillBlogDefaults(row);
}

async function updateBlog(id, patch) {
  const fields = coerceBlogInput(patch, { partial: true });
  if (Object.keys(fields).length === 0) return getBlogById(id);
  fields.updated_at = now();

  const map = seedBlogsMem();
  const cur = map.get(id) || {};
  const next = fillBlogDefaults({ ...cur, ...fields, id });
  map.set(id, next);

  if (isLive()) {
    try {
      const { data, error } = await client
        .from(BLOGS_TABLE)
        .update(fields)
        .eq("id", id)
        .select("*")
        .single();
      if (!error && data) {
        const filled = fillBlogDefaults(data);
        map.set(id, filled);
        return filled;
      }
    } catch {}
  }
  return next;
}

async function deleteBlog(id) {
  if (!id) return false;
  const map = seedBlogsMem();
  map.delete(id);
  if (isLive()) {
    try {
      await client
        .from(BLOGS_TABLE)
        .delete()
        .eq("id", id);
    } catch {}
  }
  return true;
}

async function countBlogs() {
  if (!isLive()) return seedBlogsMem().size;
  const { count, error } = await client
    .from(BLOGS_TABLE)
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

// --------------------------------------------------------------
// Stats — used by the admin dashboard KPI cards
// --------------------------------------------------------------

async function getStats() {
  // Counts that work in both modes
  const [unlisted, stocks, blogs] = await Promise.all([
    countUnlisted(),
    countStocks(),
    countBlogs()
  ]);

  const stats = {
    unlisted,
    stocks,
    blogs,
    users: 0,
    leads: 0,
    newsletter: 0,
    contact: 0,
    db: isLive() ? "connected" : "seed-mode"
  };

  if (!isLive()) {
    // In seed mode the submission tables are write-and-forget — there is no
    // historical record to count, so we report 0 honestly.
    return stats;
  }

  const safeCount = async (table) => {
    try {
      const { count, error } = await client
        .from(table)
        .select("id", { count: "exact", head: true });
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  };
  const [users, leads, newsletter, contact] = await Promise.all([
    safeCount("app_users"),
    safeCount("leads"),
    (async () => {
      try {
        const { count, error } = await client
          .from("newsletter_subscribers")
          .select("email", { count: "exact", head: true });
        return error ? 0 : count || 0;
      } catch {
        return 0;
      }
    })(),
    safeCount("contact_messages")
  ]);
  stats.users = users;
  stats.leads = leads;
  stats.newsletter = newsletter;
  stats.contact = contact;
  return stats;
}

module.exports = {
  // unlisted
  listUnlisted,
  getUnlistedById,
  createUnlisted,
  updateUnlisted,
  deleteUnlisted,
  countUnlisted,
  // stocks
  listStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  countStocks,
  // blogs
  listBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  countBlogs,
  // submissions
  listLeads,
  updateLeadStatus,
  deleteLead,
  listNewsletter,
  deleteNewsletter,
  listContact,
  deleteContact,
  // dashboard
  getStats
};

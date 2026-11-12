"use strict";

/* BSE only — NIFTY 50, BANK NIFTY and INDIA VIX are NSE indices and the site
   does not quote NSE. SENSEX is the BSE benchmark and stays. The ticker and
   indices routes also filter NSE out at read time, so a stale row left in the
   database cannot put them back. */
const TICKER = [
  { name: "SENSEX", price: 74119.39, chg: 0.92 },
  { name: "GOLD MCX", price: 72480, chg: -0.28 },
  { name: "SILVER MCX", price: 84120, chg: 0.45 },
  { name: "USDINR", price: 83.42, chg: 0.12 },
  { name: "BRENT", price: 84.65, chg: -0.55 },
  { name: "NASDAQ", price: 17891.22, chg: 1.1 },
  { name: "BTC/INR", price: 5612340, chg: 2.34 }
];

const INDICES = [
  { id: "ix-sensex", name: "SENSEX", price: 74119.39, chg: 0.92 }
];

const STOCKS = [
  { name: "Reliance Ind.", sym: "RELIANCE", price: 2840.55, chg: 1.42, vol: "8.2M", cap: "₹19.2L Cr", cat: "up" },
  { name: "TCS", sym: "TCS", price: 3920.10, chg: 0.85, vol: "2.4M", cap: "₹14.3L Cr", cat: "up" },
  { name: "HDFC Bank", sym: "HDFCBANK", price: 1672.30, chg: -0.32, vol: "6.8M", cap: "₹12.7L Cr", cat: "stable" },
  { name: "Infosys", sym: "INFY", price: 1845.65, chg: 1.10, vol: "4.1M", cap: "₹7.6L Cr", cat: "up" },
  { name: "ICICI Bank", sym: "ICICIBANK", price: 1140.80, chg: 0.62, vol: "5.5M", cap: "₹8.0L Cr", cat: "watch" },
  { name: "Bharti Airtel", sym: "BHARTIARTL", price: 1485.40, chg: 2.15, vol: "3.2M", cap: "₹8.4L Cr", cat: "up" },
  { name: "L&T", sym: "LT", price: 3580.25, chg: -0.18, vol: "1.9M", cap: "₹4.9L Cr", cat: "stable" },
  { name: "Asian Paints", sym: "ASIANPAINT", price: 2895.70, chg: -0.95, vol: "0.9M", cap: "₹2.8L Cr", cat: "watch" },
  { name: "Maruti Suzuki", sym: "MARUTI", price: 12480.0, chg: 1.62, vol: "0.4M", cap: "₹3.9L Cr", cat: "up" }
];

// Checked source catalog supplies the same fallback inventory as the public API.
const UNLISTED = require("./data/unlisted-catalog.json").items;

const PRODUCTS = [
  { icon: "i-trending-up", title: "Equities", body: "Track listed shares with live price feeds, sparkline trends, and watchlist-driven discovery.", cta: "Explore", slug: "equities" },
  { icon: "i-bar-chart", title: "Mutual Funds", body: "SIP & lump sum across 40+ AMCs. Goal-based planning with built-in calculators.", cta: "Explore", slug: "mutual-funds" },
  { icon: "i-gem", title: "Portfolio Management (PMS)", body: "Bespoke investment solutions tailored for HNI and UHNI investors.", cta: "Explore", slug: "pms" },
  { icon: "i-gem", title: "Alternative Investments (AIF)", body: "Access sophisticated private market opportunities and hedge funds.", cta: "Explore", slug: "aif" },
  { icon: "i-building", title: "Bonds & G-Sec", body: "Government securities, corporate bonds, tax-free bonds, and NCD opportunities.", cta: "Explore", slug: "bonds" },
  { icon: "i-shield", title: "Insurance", body: "Term life, health, and ULIP products from top insurers with comparison tools.", cta: "Explore", slug: "insurance" },
  { icon: "i-building", title: "Fixed Deposits", body: "Secure, high-yield fixed deposits from top-rated banks and NBFCs for stable returns.", cta: "Explore", slug: "fixed-deposits" },
  { icon: "i-gem", title: "Gift City", body: "Explore offshore investment opportunities and global diversification via Gift City.", cta: "Explore", slug: "gift-city" }
];

const TESTIMONIALS = [
  { quote: "Finally a platform that treats unlisted shares with the same rigor as listed ones. The diligence is exceptional.", author: "Aarav Shah", role: "Founder, Lumen Studios", color: "#0E3F76", initials: "AS" },
  { quote: "I moved my entire portfolio over after my first call with their advisor. The depth of research is unmatched.", author: "Priya Kapoor", role: "Director, MIT-K Capital", color: "#7c3aed", initials: "PK" },
  { quote: "Most platforms feel like brokerage apps. Finvoq actually feels like a private bank, without the markup.", author: "Vikram Iyer", role: "Managing Partner, Iyer Family Office", color: "#01696f", initials: "VI" },
  { quote: "The unified dashboard alone saves me three hours a week. I can finally see every asset class in one place.", author: "Neha Reddy", role: "CFO, Zenith Health", color: "#ea7c1c", initials: "NR" },
  { quote: "I've been investing for 25 years. This is the first platform that actually serves me, not the other way around.", author: "Rajesh Bansal", role: "Retd. Senior Banker", color: "#16a34a", initials: "RB" },
  { quote: "The PMS access alone justifies the platform. The team made onboarding feel personal, rare these days.", author: "Karan Mehta", role: "Founder, Stride Ventures", color: "#dc2626", initials: "KM" }
];

const FAQS = [
  {
    q: "What is Finvoq?",
    a: "Finvoq is a multi-asset investment platform that helps investors discover, evaluate and access curated investment opportunities across listed and unlisted equities, mutual funds, PMS, AIFs, bonds and other asset classes."
  },
  {
    q: "Can I invest in unlisted and pre-IPO shares through Finvoq?",
    a: "Yes. Finvoq provides access to selected unlisted and pre-IPO opportunities, along with research and relevant transaction information to help investors make informed decisions."
  },
  {
    q: "How does Finvoq select investment opportunities?",
    a: "Finvoq follows a research-led approach, evaluating opportunities across factors such as business fundamentals, financial performance, valuation, risks and overall investment suitability before presenting them to investors."
  },
  {
    q: "Are investments made through Finvoq risk-free?",
    a: "No. Every investment carries risk. Unlisted shares, in particular, can involve lower liquidity, limited price discovery, valuation risk and uncertainty around future IPO or listing timelines."
  },
  {
    q: "Does Finvoq offer investments beyond unlisted shares?",
    a: "Yes. Investors can explore multiple asset classes through Finvoq, including listed equities, mutual funds, PMS, AIFs, bonds, fixed deposits, insurance and GIFT City opportunities."
  },
  {
    q: "How can I start investing with Finvoq?",
    a: "You can get started by creating an account with Finvoq. Based on your investment goals, time horizon and portfolio requirements, you can then explore suitable opportunities and connect with the Finvoq team for assistance."
  }
];

module.exports = { TICKER, INDICES, STOCKS, UNLISTED, PRODUCTS, TESTIMONIALS, FAQS };

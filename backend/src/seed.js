"use strict";

const TICKER = [
  { name: "NIFTY 50", price: 22530.7, chg: 1.35 },
  { name: "SENSEX", price: 74119.39, chg: 0.92 },
  { name: "BANK NIFTY", price: 48650.15, chg: -0.34 },
  { name: "INDIA VIX", price: 13.28, chg: -2.1 },
  { name: "GOLD MCX", price: 72480, chg: -0.28 },
  { name: "SILVER MCX", price: 84120, chg: 0.45 },
  { name: "USDINR", price: 83.42, chg: 0.12 },
  { name: "BRENT", price: 84.65, chg: -0.55 },
  { name: "NASDAQ", price: 17891.22, chg: 1.1 },
  { name: "BTC/INR", price: 5612340, chg: 2.34 }
];

const INDICES = [
  { id: "ix-nifty", name: "NIFTY 50", price: 22530.7, chg: 1.35 },
  { id: "ix-sensex", name: "SENSEX", price: 74119.39, chg: 0.92 },
  { id: "ix-bank", name: "BANK NIFTY", price: 48650.15, chg: -0.34 },
  { id: "ix-vix", name: "India VIX", price: 13.28, chg: -2.1 }
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

const UNLISTED = [
  { domain: "sbimf.com", name: "SBI Funds Management Ltd.", sector: "Asset Management", brand: "#0066b3", initial: "S", price: 791, iv: "1", tag: "avail" },
  { domain: "amc.ppfas.com", name: "Parag Parikh Financial Advisory Services", sector: "Asset Management", brand: "#3a9e3a", initial: "P", price: 18050, iv: "10", tag: "lim" },
  { domain: "careinsurance.com", name: "Care Health Insurance Ltd.", sector: "Insurance", brand: "#f37021", initial: "C", price: 117.75, iv: "10", tag: "avail" },
  { domain: "orbisfinancial.in", name: "Orbis Financial Corporation", sector: "Financial Services", brand: "#173a72", initial: "O", price: 394, iv: "10", tag: "trend" },
  { domain: "chennaisuperkings.com", name: "CSK", sector: "Sports", brand: "#FFCD00", initial: "C", price: 254, iv: "0.1", tag: "trend" },
  { domain: "herofincorp.com", name: "Hero Fincorp", sector: "Financial Services", brand: "#e02020", initial: "H", price: 1030, iv: "10", tag: "avail" },
  { domain: "cial.aero", name: "CIAL", sector: "Aviation", brand: "#005a8f", initial: "C", price: 435, iv: "2", tag: "avail" },
  { domain: "incred.com", name: "Incred Holdings", sector: "Financial Services", brand: "#0a2f4d", initial: "I", price: 146, iv: "10", tag: "avail" },
  { domain: "vivriticapital.com", name: "Vivriti Capital", sector: "Financial Services", brand: "#353272", initial: "V", price: 802, iv: "10", tag: "lim" },
  { domain: "veedacr.com", name: "Veeda Clinical Research", sector: "Clinical Research", brand: "#2f9c4d", initial: "V", price: 457, iv: "2", tag: "avail" },
  { domain: "oyorooms.com", name: "Oravel Stays (OYO)", sector: "Hospitality", brand: "#EE2E24", initial: "O", price: 21.85, iv: "1", tag: "trend" },
  { domain: "sterlitepower.com", name: "Sterlite Electrical", sector: "Energy", brand: "#e96228", initial: "S", price: 472, iv: "2", tag: "avail" },
  { domain: "esds.co.in", name: "ESDS Software Solutions", sector: "IT Services", brand: "#1e3d7a", initial: "E", price: 472, iv: "1", tag: "avail" },
  { domain: "innov8.work", name: "Innov8 Workspaces India Limited", sector: "Real Estate", brand: "#f7b731", initial: "I", price: 49.50, iv: "1", tag: "avail" },
  { domain: "nseindia.com", name: "National Stock Exchange of India (NSE)", sector: "Exchange", brand: "#F58220", initial: "N", price: 2025, iv: "1", tag: "trend" },
  { domain: "goodluckdefence.com", name: "Goodluck Defence and Aerospace", sector: "Defence", brand: "#272a2e", initial: "G", price: 383.00, iv: "10", tag: "lim" }
];

const PRODUCTS = [
  { icon: "i-trending-up", title: "Equities", body: "Track listed shares with live price feeds, sparkline trends, and watchlist-driven discovery.", cta: "Explore" },
  { icon: "i-lock", title: "Unlisted Shares", body: "Access curated pre-IPO and private market opportunities with advisor-assisted execution.", cta: "Explore" },
  { icon: "i-bar-chart", title: "Mutual Funds", body: "SIP & lump sum across 40+ AMCs. Goal-based planning with built-in calculators.", cta: "Explore" },
  { icon: "i-gem", title: "PMS & AIF", body: "Portfolio management services and alternative investment funds for HNI and UHNI investors.", cta: "Explore" },
  { icon: "i-building", title: "Bonds & G-Sec", body: "Government securities, corporate bonds, tax-free bonds, and NCD opportunities.", cta: "Explore" },
  { icon: "i-shield", title: "Insurance", body: "Term life, health, and ULIP products from top insurers with comparison tools.", cta: "Explore" },
  { icon: "i-building", title: "Fixed Deposits", body: "Secure, high-yield fixed deposits from top-rated banks and NBFCs for stable returns.", cta: "Explore" }
];

const TESTIMONIALS = [
  { quote: "Finally a platform that treats unlisted shares with the same rigor as listed ones. The diligence is exceptional.", author: "Aarav Shah", role: "Founder, Lumen Studios", color: "#0E3F76", initials: "AS" },
  { quote: "I moved my entire portfolio over after my first call with their advisor. The depth of research is unmatched.", author: "Priya Kapoor", role: "Director, MIT-K Capital", color: "#7c3aed", initials: "PK" },
  { quote: "Most platforms feel like brokerage apps. Peculiex actually feels like a private bank — without the markup.", author: "Vikram Iyer", role: "Managing Partner, Iyer Family Office", color: "#01696f", initials: "VI" },
  { quote: "The unified dashboard alone saves me three hours a week. I can finally see every asset class in one place.", author: "Neha Reddy", role: "CFO, Zenith Health", color: "#ea7c1c", initials: "NR" },
  { quote: "I've been investing for 25 years. This is the first platform that actually serves me, not the other way around.", author: "Rajesh Bansal", role: "Retd. Senior Banker", color: "#16a34a", initials: "RB" },
  { quote: "The PMS access alone justifies the platform. The team made onboarding feel personal — rare these days.", author: "Karan Mehta", role: "Founder, Stride Ventures", color: "#dc2626", initials: "KM" }
];

const FAQS = [
  { q: "Is my money safe with Peculiex?", a: "Yes. Your demat account is held with SEBI-registered partners and funds move via RBI-regulated banking rails. Peculiex never holds custody of your assets — we are an advisor and execution layer only, and every transaction settles directly into your name." },
  { q: "What's the minimum amount to start investing?", a: "You can start a SIP from ₹1,000 per month or a lump sum from ₹500. PMS and AIF have higher statutory minimums (₹50L and ₹1Cr respectively) as mandated by SEBI. Unlisted shares vary by lot size — typically ₹25,000 to ₹1L per opportunity." },
  { q: "How is Peculiex different from a discount broker?", a: "Discount brokers give you a tool. Peculiex gives you an advisor, a curated product list across 8 asset classes, and a single dashboard that ties it all together. You get curation, accountability, and a relationship — not just access to an order screen." },
  { q: "Can I withdraw or sell my investments anytime?", a: "For listed equity, mutual funds, and bonds — yes, subject to standard settlement cycles (T+1 or T+2). Unlisted shares, PMS, and AIF have lock-in periods that vary by product. Each lock-in is clearly disclosed before you invest, never buried in fine print." },
  { q: "What does Peculiex charge?", a: "A flat advisory fee starting at 0.25% per year on assets advised — billed quarterly, transparent to the rupee. We earn nothing from product manufacturers, distributors, or anyone else. Your fee is our only revenue, so our incentives stay aligned with yours." },
  { q: "Who is my advisor and how do I reach them?", a: "Every investor is paired with a SEBI-registered advisor based on goals, time horizon, and portfolio size. You can reach them via WhatsApp, email, or scheduled video call — typical response time is under 30 minutes during market hours." },
  { q: "How do I track my portfolio performance?", a: "You can track your portfolio performance through our unified dashboard. It provides real-time updates across all asset classes, detailed analytics, and personalized insights." },
  { q: "What are the tax implications of my investments?", a: "Taxation varies by asset class. We provide a comprehensive annual tax statement and capital gains report to make filing easy. However, we recommend consulting a tax advisor for personalized advice." },
  { q: "Is there a lock-in period for my investments?", a: "Lock-in periods depend on the specific product. Listed equities and mutual funds generally have no lock-in (except ELSS). Unlisted shares, PMS, and AIFs may have varying lock-in periods, which are clearly stated before investing." }
];

module.exports = { TICKER, INDICES, STOCKS, UNLISTED, PRODUCTS, TESTIMONIALS, FAQS };

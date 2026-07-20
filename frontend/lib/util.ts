export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const fmtINR = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const fmtINR2 = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

export const formatCompact = (num: number) => {
  if (!num) return "—";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
};

export const formatIndianCap = (num: number) => {
  if (!num) return "—";
  if (num >= 1e12) return "₹" + (num / 1e12).toFixed(1) + "L Cr";
  if (num >= 1e7) return "₹" + (num / 1e7).toFixed(1) + "Cr";
  if (num >= 1e5) return "₹" + (num / 1e5).toFixed(1) + "L";
  if (num >= 1e3) return "₹" + (num / 1e3).toFixed(1) + "K";
  return "₹" + num.toString();
};

export const sparkPath = (vals: number[], w = 100, h = 50) => {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h * 0.05 + (1 - (v - min) / range) * (h * 0.9);
      return (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
    })
    .join(" ");
};

/** Returns the last point { x, y } for a dot at the end of the sparkline */
export const sparkLastPoint = (vals: number[], w = 100, h = 50) => {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const i = vals.length - 1;
  return {
    x: (i / (vals.length - 1)) * w,
    y: h * 0.05 + (1 - (vals[i] - min) / range) * (h * 0.9),
  };
};

export const randomSpark = (seed = 0, n = 150) => {
  const arr: number[] = [];
  // Seeded pseudo-random for deterministic-looking but unique charts
  let s = (seed * 9301 + 49297) % 233280;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let v = 40 + (seed % 30);
  for (let i = 0; i < n; i++) {
    // Realistic micro-movements: small jitter + occasional bigger moves
    const jitter = (rng() - 0.48) * 2.5;
    const trend = Math.sin(i * 0.04 + seed) * 0.3;
    const spike = rng() > 0.92 ? (rng() - 0.5) * 8 : 0;
    v += jitter + trend + spike;
    v = Math.max(10, Math.min(90, v));
    arr.push(v);
  }
  return arr;
};

export const apiBase = () =>
  process.env.NEXT_PUBLIC_API_BASE || "";

export const getCompanyDomain = (sym: string, name: string): string => {
  const map: Record<string, string> = {
    RELIANCE: "ril.com",
    TCS: "tcs.com",
    HDFCBANK: "hdfcbank.com",
    INFY: "infosys.com",
    ICICIBANK: "icicibank.com",
    BHARTIARTL: "airtel.in",
    LT: "larsentoubro.com",
    ASIANPAINT: "asianpaints.com",
    MARUTI: "marutisuzuki.com",
    HINDUNILVR: "hul.co.in",
    ITC: "itcportal.com",
    SBIN: "sbi.co.in",
    BAJFINANCE: "bajajfinserv.in",
    MRF: "mrftyres.com",
    RTNPOWER: "rattanindia.com",
    WIPRO: "wipro.com",
    AXISBANK: "axisbank.com",
    KOTAKBANK: "kotak.com",
    TATAMOTORS: "tatamotors.com",
    TATASTEEL: "tatasteel.com",
    SUNPHARMA: "sunpharma.com",
    TITAN: "titancompany.in",
    ULTRACEMCO: "ultratechcement.com",
    NESTLEIND: "nestle.in",
    POWERGRID: "powergrid.in",
    NTPC: "ntpc.co.in",
    ONGC: "ongcindia.com",
    COALINDIA: "coalindia.in",
    ADANIENT: "adanienterprises.com",
    ADANIPORTS: "adaniports.com",
    JSWSTEEL: "jsw.in",
    TECHM: "techmahindra.com",
    HCLTECH: "hcltech.com",
    ZOMATO: "zomato.com",
    PAYTM: "paytm.com",
    DMART: "dmart.in"
  };
  // Strip the exchange suffix (.NS / .BO) before matching — otherwise
  // "MRF.BO" never hits the map and we guess a wrong domain.
  const base = (sym || "").split(".")[0].toUpperCase();
  if (map[base]) return map[base];

  const clean = (name || base).split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.length > 2) return `${clean}.com`;
  return `${base.toLowerCase()}.com`;
};

export const getCompanyLogo = (domain: string) =>
  `https://icon.horse/icon/${domain}`;

// URL-safe slug for an unlisted company name, used for /unlisted/[slug] detail pages.
export const unlistedSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

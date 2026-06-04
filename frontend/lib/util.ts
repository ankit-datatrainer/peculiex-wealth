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
      const y = h - ((v - min) / range) * h;
      return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
};

export const randomSpark = (seed = 0, n = 26) => {
  const arr: number[] = [];
  let v = 50 + seed;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * 12;
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
    BAJFINANCE: "bajajfinserv.in"
  };
  if (map[sym]) return map[sym];
  
  const clean = (name || sym).split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.length > 2) return `${clean}.com`;
  return `${sym.toLowerCase()}.com`;
};

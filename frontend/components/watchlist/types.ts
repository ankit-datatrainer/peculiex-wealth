// Shared types & constants used by every watchlist sub-view. Kept in a
// separate module so Guest / Authed views stay focused on rendering.

export type Stock = {
  name: string;
  sym: string;
  price: number;
  chg: number;
  vol: string;
  cap: string;
  cat: "up" | "stable" | "watch";
};

export type Unl = {
  domain: string;
  name: string;
  sector: string;
  brand: string;
  initial: string;
  price: number;
  iv: string;
  tag: "trend" | "avail" | "lim";
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  added_price: number | null;
  note: string | null;
  created_at: string;
};

export type Filter = "all" | "gainers" | "losers" | "stable";
export type SortKey = "recent" | "alpha" | "topGain" | "topLoss";
export type ViewMode = "cards" | "table";

export type Basket = {
  id: string;
  title: string;
  blurb: string;
  symbols: string[];
};

export const CURATED_BASKETS: Basket[] = [
  {
    id: "bluechip",
    title: "Top 5 Bluechips",
    blurb: "India's largest, most-tracked household names.",
    symbols: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"]
  },
  {
    id: "movers",
    title: "Today's Movers",
    blurb: "The most active large-caps from this session.",
    symbols: ["BHARTIARTL", "MARUTI", "RELIANCE", "INFY", "ASIANPAINT"]
  },
  {
    id: "stable",
    title: "Stable Compounders",
    blurb: "Lower-volatility names for long-horizon investors.",
    symbols: ["HDFCBANK", "LT", "ASIANPAINT", "TCS"]
  }
];

/** Strip an exchange suffix for display: "RTNINDIA.BO" -> "RTNINDIA". */
export const cleanSymbol = (s: string) => (s || "").replace(/\.(BO|NS)$/i, "");

/** Which exchange a stored symbol resolves to (a ".BO" suffix means BSE). */
export const exchangeOf = (s: string): "NSE" | "BSE" =>
  /\.BO$/i.test(s || "") ? "BSE" : "NSE";

export function formatRelative(iso: string) {
  const dt = new Date(iso).getTime();
  if (!Number.isFinite(dt)) return "";
  const diff = (Date.now() - dt) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

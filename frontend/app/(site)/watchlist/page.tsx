import type { Metadata } from "next";
import Watchlist from "@/components/Watchlist";

export const metadata: Metadata = {
  title: "Your Watchlist — Live Prices & Sparklines",
  description:
    "Track the stocks you care about. Live prices, sparkline trends, and a clean professional interface — your personal markets cockpit."
};

export default function WatchlistPage() {
  return <Watchlist />;
}

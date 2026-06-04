import type { Metadata } from "next";
import Markets from "@/components/Markets";

export const metadata: Metadata = {
  title: "Markets — Live Indian Equities",
  description:
    "Track listed Indian shares with live price feeds, sparklines, and a personal watchlist. Filter by gainers, watchlist, or stable picks."
};

export default function MarketsPage() {
  return <Markets />;
}

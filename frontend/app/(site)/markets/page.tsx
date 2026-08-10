import type { Metadata } from "next";
import Markets from "@/components/Markets";

export const metadata: Metadata = {
  title: "Markets: Live Indian Equities",
  description:
    "Track listed Indian shares with live price feeds, sparklines, and a personal watchlist. Filter by gainers, watchlist, or stable picks.",
  // Self-referencing canonical: this page is in the sitemap, and without
  // one any ?ref= / utm_* parameter on an inbound link becomes a competing URL.
  alternates: { canonical: "/markets" }
};

export default function MarketsPage() {
  return <Markets />;
}

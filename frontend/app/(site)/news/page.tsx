import type { Metadata } from "next";
import NewsPage from "@/components/NewsPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Market News",
  description:
    "Live Indian market news: NSE and BSE movers, economic data, policy shifts and company updates, in a clean reader curated for long-term investors.",
  path: "/news",
  ogTitle: "Market News — Finvoq"
});

export default function Page() {
  return <NewsPage />;
}

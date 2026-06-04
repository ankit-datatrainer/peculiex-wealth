import type { Metadata } from "next";
import NewsPage from "@/components/NewsPage";

export const metadata: Metadata = {
  title: "News — Indian Stock Market Updates",
  description:
    "The latest financial updates, stock market trends, and economic news for the Indian market."
};

export default function Page() {
  return <NewsPage />;
}

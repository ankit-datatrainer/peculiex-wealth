import type { Metadata } from "next";
import InsightsContent from "@/components/InsightsContent";

export const metadata: Metadata = {
  title: "Market Insights",
  description:
    "Curated weekly research from the Finvoq desk, what we're watching across Indian equities, debt, unlisted, and global markets."
};

export default function InsightsPage() {
  return <InsightsContent />;
}

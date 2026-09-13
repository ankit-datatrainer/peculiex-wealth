import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import StoriesContent from "@/components/StoriesContent";

export const metadata: Metadata = pageMeta({
  title: "Investor Stories",
  description:
    "Real Finvoq investors on what actually changed for them, from a first ₹5,000 SIP to consolidating crores across demats into a single private-client mandate.",
  path: "/stories",
  ogTitle: "Investor Stories — Finvoq"
});

export default function StoriesPage() {
  return <StoriesContent />;
}


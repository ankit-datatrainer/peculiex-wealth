import type { Metadata } from "next";
import Unlisted from "@/components/Unlisted";

export const metadata: Metadata = {
  title: "Unlisted Shares: Pre-IPO Opportunities",
  description:
    "Curated pre-IPO and unlisted share inventory with transparent pricing and advisor-assisted purchase flows.",
  // Self-referencing canonical: this page is in the sitemap, and without
  // one any ?ref= / utm_* parameter on an inbound link becomes a competing URL.
  alternates: { canonical: "/unlisted" }
};

export default function UnlistedPage() {
  return <Unlisted />;
}

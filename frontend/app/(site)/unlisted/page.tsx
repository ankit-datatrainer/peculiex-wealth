import type { Metadata } from "next";
import Unlisted from "@/components/Unlisted";

export const metadata: Metadata = {
  title: "Unlisted Shares — Pre-IPO Opportunities",
  description:
    "Curated pre-IPO and unlisted share inventory with transparent pricing and advisor-assisted purchase flows."
};

export default function UnlistedPage() {
  return <Unlisted />;
}

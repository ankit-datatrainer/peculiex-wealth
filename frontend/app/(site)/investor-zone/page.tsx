import type { Metadata } from "next";
import InvestorZone from "@/components/InvestorZone";

export const metadata: Metadata = {
  title: "InvestorZone — Your Investing Command Center | Peculiex",
  description:
    "InvestorZone brings live markets, SIP and reverse-SIP calculators, mutual fund performance, unlisted shares, research and news together in one place."
};

export default function InvestorZonePage() {
  return <InvestorZone />;
}

import type { Metadata } from "next";
import Onboard from "@/components/Onboard";

export const metadata: Metadata = {
  title: "Get Started — Open Your Investment Account",
  description:
    "Open your Peculiex account in minutes. Share your details, complete KYC, get matched with an advisor, and start investing."
};

export default function GetStartedPage() {
  return <Onboard />;
}

import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import MFResources from "@/components/MFResources";

export const metadata: Metadata = {
  title: "Mutual Fund Resources — Past SIP Performance, NFOs & More",
  description: "Comprehensive resources to help you analyze past SIP performance, track current NFOs, compare schemes, and calculate SWPs.",
};

export default function MutualFundsResourcesPage() {
  return (
    <main>
      <PageHero
        label="Resources"
        title="Mutual Fund Resources"
        subtitle="Explore past performance, latest NAVs, scheme comparisons, and a suite of tools designed to help you invest smarter."
      />
      <MFResources />
    </main>
  );
}

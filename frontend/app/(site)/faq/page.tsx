import type { Metadata } from "next";
import FAQ from "@/components/FAQ";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Straight answers to the questions investors ask before getting started with Peculiex — security, minimums, fees, withdrawals, and more."
};

export default function FAQPage() {
  return (
    <>
      <PageHero
        label="FAQ"
        title={<>Questions, <em>answered.</em></>}
        subtitle="Everything investors ask before getting started — straight answers, no jargon."
        align="center"
      />
      <FAQ />
    </>
  );
}

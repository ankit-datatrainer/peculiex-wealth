import type { Metadata } from "next";
import FAQ from "@/components/FAQ";
import PageHero from "@/components/PageHero";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Frequently Asked Questions",
  description:
    "Straight answers to what investors ask before starting with Finvoq: account security, minimum investment, fees and commissions, KYC, withdrawals and support.",
  path: "/faq",
  ogTitle: "Investor FAQ — Finvoq"
});

export default function FAQPage() {
  return (
    <>
      <PageHero
        page="faq"
        label="FAQ"
        title={<>Questions, <em>answered.</em></>}
        subtitle="Everything investors ask before getting started: straight answers, no jargon."
        align="center"
      />
      <FAQ />
    </>
  );
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import GlossaryContent from "@/components/GlossaryContent";

export const metadata: Metadata = pageMeta({
  title: "Investing Glossary",
  description:
    "Plain-English definitions of the investment terms Indian investors actually meet, from AIF, CAGR and expense ratio to NAV, SIP, STCG and yield to maturity.",
  path: "/glossary",
  ogTitle: "Investing Glossary — Finvoq"
});

export default function GlossaryPage() {
  return <GlossaryContent />;
}


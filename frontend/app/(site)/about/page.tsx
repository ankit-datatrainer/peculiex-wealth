import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ASSET_CLASS_COUNT_WORD } from "@/lib/siteFacts";
import AboutClient from "@/components/AboutClient";

export const metadata: Metadata = pageMeta({
  title: "About Finvoq — who we are",
  description: `Finvoq is India's curated investment marketplace: ${ASSET_CLASS_COUNT_WORD} asset classes on one SEBI-linked platform. Meet the team, the mission and the values behind it.`,
  path: "/about"
});

export default function AboutPage() {
  return <AboutClient />;
}


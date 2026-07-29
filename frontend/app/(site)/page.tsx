import type { Metadata } from "next";
import HomeClone from "@/components/homeclone/HomeClone";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Finvoq: India's Investment Marketplace",
  description:
    "Invest in listed and unlisted shares, mutual funds, PMS, AIF, bonds and insurance from one SEBI-registered, advisory-led platform built for Indian investors.",
  path: "/",
  ogTitle: "Finvoq: India's Investment Marketplace",
  absoluteTitle: true
});

export default function Home() {
  return <HomeClone />;
}

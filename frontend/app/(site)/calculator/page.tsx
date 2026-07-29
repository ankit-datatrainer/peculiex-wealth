import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "SIP Calculator",
  description:
    "See how a monthly SIP compounds over time. Adjust the instalment, expected return and duration to model your future mutual fund corpus in rupees, instantly.",
  path: "/calculator",
  ogTitle: "SIP Calculator — Finvoq"
});

export default function CalculatorPage() {
  return <Calculator />;
}

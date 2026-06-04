import type { Metadata } from "next";
import LumpsumCalc from "@/components/LumpsumCalc";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Lumpsum Calculator — One-time Investment Returns",
  description:
    "See what a one-time mutual fund investment can grow to. Adjust amount, expected return, and duration to model your future portfolio."
};

export default function LumpsumPage() {
  return (
    <>
      <PageHero
        label="Calculator"
        title={<>Lumpsum <em>investment calculator</em></>}
        subtitle="Compounding turns a one-time deposit into a meaningful corpus over time. Try the numbers below."
      />
      <LumpsumCalc />
    </>
  );
}

import type { Metadata } from "next";
import RetirementCalc from "@/components/RetirementCalc";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Retirement Calculator — Secure your golden years",
  description:
    "Calculate the corpus needed for retirement and the SIP required to get there based on your current age, retirement age, and monthly expenses."
};

export default function RetirementPage() {
  return (
    <>
      <PageHero
        label="Calculator"
        title={<>Retirement <em>calculator</em></>}
        subtitle="Secure your future by calculating how much you need to save and invest today for a comfortable retirement."
      />
      <RetirementCalc />
    </>
  );
}

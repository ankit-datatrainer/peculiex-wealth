import type { Metadata } from "next";
import GoalPlanner from "@/components/GoalPlanner";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Reverse SIP Calculator: Find the Monthly SIP for Your Target Corpus",
  description:
    "Enter your target corpus and time horizon and the reverse SIP calculator auto-computes the monthly SIP, total investment and expected gains at your assumed return."
};

export default function ReverseSipPage() {
  return (
    <>
      <PageHero
        page="calculator-reverse-sip"
        label="Reverse SIP Calculator"
        title={<>Enter your goal: get the <em>monthly SIP.</em></>}
        subtitle="Type a target corpus and a time horizon, and we work backward to the exact monthly investment."
      />
      <GoalPlanner page="calculator-reverse-sip" />
    </>
  );
}

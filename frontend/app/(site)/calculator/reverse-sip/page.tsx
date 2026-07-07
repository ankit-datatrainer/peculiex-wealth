import type { Metadata } from "next";
import GoalPlanner from "@/components/GoalPlanner";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Reverse SIP Calculator — Find the Monthly SIP for Your Target Corpus",
  description:
    "Enter your target corpus and time horizon and the reverse SIP calculator auto-computes the monthly SIP, total investment and expected gains at your assumed return."
};

export default function ReverseSipPage() {
  return (
    <>
      <PageHero
        label="Reverse SIP Calculator"
        title={<>Enter your goal — get the <em>monthly SIP.</em></>}
        subtitle="Type a target corpus (e.g. ₹1 Cr) and a time horizon (e.g. 10 years), and we work backward to the exact monthly SIP, total invested, and expected gains — all auto-calculated."
      />
      <GoalPlanner />
    </>
  );
}

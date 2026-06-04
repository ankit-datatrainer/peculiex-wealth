import type { Metadata } from "next";
import GoalPlanner from "@/components/GoalPlanner";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Goal Planner — Calculate Your Required Monthly SIP",
  description:
    "Set a target corpus and time horizon. We calculate the monthly SIP you need to get there at your assumed rate of return."
};

export default function GoalPlannerPage() {
  return (
    <>
      <PageHero
        label="Calculator"
        title={<>Goal-based <em>investment planner</em></>}
        subtitle="Start with the destination — retirement, a home, your child's education — and work backward to the monthly SIP that gets you there."
      />
      <GoalPlanner />
    </>
  );
}

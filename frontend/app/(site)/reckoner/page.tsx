import type { Metadata } from "next";
import Reckoner from "@/components/Reckoner";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Marcom & Centricity Reckoner — Peculiex",
  description:
    "Score your marketing communication and client-centricity across eight levers and get a single readiness score with a breakdown of where to improve."
};

export default function ReckonerPage() {
  return (
    <>
      <PageHero
        label="Advisor Toolkit"
        title={<>Marcom &amp; Centricity <em>Reckoner</em></>}
        subtitle="Rate your marketing communication and client engagement across eight levers. Get an instant readiness score and see which area to strengthen first."
      />
      <Reckoner />
    </>
  );
}

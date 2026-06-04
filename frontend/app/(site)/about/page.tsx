import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";

export const metadata: Metadata = {
  title: "About Peculiex",
  description:
    "Peculiex is India's premium investment marketplace — eight asset classes, one platform, advisory-led. Learn about our mission, values, and the team behind the platform."
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        title={<>Wealth management, <em>without the markup.</em></>}
        subtitle="We started Peculiex because India's investing experience was broken in two predictable ways: too many platforms, and too many incentives that point away from the investor."
      />

      <ContentBody>
        <h2>Why we exist</h2>
        <p>
          Most Indian investors hold a tangle of mutual fund folios, a demat account at one
          broker, an LIC policy from a relative, a flat in a tier-3 city, and a few stocks
          someone recommended at a wedding. Each piece was sold by someone earning a
          commission. None of it was bought as part of a plan.
        </p>
        <p>
          Peculiex unifies the investing surface — eight asset classes, one dashboard — and
          changes the business model. We earn a flat advisory fee from <em>you</em>, and
          nothing from product manufacturers. Ever. Our incentives match yours, by design.
        </p>

        <h2>What we believe</h2>
        <ul>
          <li>
            <strong>Curation beats access.</strong> India has 1,500 mutual fund schemes and
            300+ unlisted offers. The win isn't more choice — it's the right shortlist.
          </li>
          <li>
            <strong>Advice should be paid for, openly.</strong> An advisor who earns from a
            commission cannot ever fully be on your side. We take the kickbacks off the
            table.
          </li>
          <li>
            <strong>Tools should be opinionated.</strong> Calculators, dashboards, and
            research notes should help you decide — not just visualise.
          </li>
          <li>
            <strong>Compliance is a feature, not a hurdle.</strong> SEBI-registered, RBI-rail
            settlements, demat in your name, audit trail you can pull at any time.
          </li>
        </ul>

        <h2>Where we are</h2>
        <ul>
          <li>Founded in 2024 in Mumbai, India.</li>
          <li>SEBI Registered Investment Adviser (RIA: INA000099999).</li>
          <li>4,000+ active investors, ₹450 Cr+ in assets advised.</li>
          <li>A team of 28 — engineers, advisors, and a research desk that has covered Indian markets through three boom-bust cycles.</li>
        </ul>

        <h2>How we work with you</h2>
        <p>
          Every investor is paired with a SEBI-registered advisor based on goals, time
          horizon, and portfolio size. You'll get one human as your point of contact —
          reachable on WhatsApp, email, or a scheduled call — backed by a research desk and
          an operations team that handles the paperwork.
        </p>
        <p>
          We do quarterly portfolio reviews on the calendar, and ad-hoc reviews whenever
          there's a market event or a personal one. The goal is steady, boring compounding —
          and the discipline to ride out the rough quarters.
        </p>

        <h2>What we don't do</h2>
        <ul>
          <li>Sell ULIPs, endowment plans, or any product that mixes insurance with investing.</li>
          <li>Take commissions or revenue-share from AMCs, brokers, or insurers.</li>
          <li>Push F&amp;O speculation, intraday tips, or "get-rich" schemes.</li>
          <li>Promise specific returns. We promise process and transparency.</li>
        </ul>

        <h2>Our regulators</h2>
        <p>
          We work within the framework set by <strong>SEBI</strong> (Investment Adviser and
          Research Analyst regulations), <strong>RBI</strong> (banking rails), and{" "}
          <strong>IRDAI</strong> (insurance distribution). Disputes can be raised through{" "}
          <Link href="/legal/grievance">our grievance redressal process</Link>, with
          escalation to the SEBI SCORES portal at every stage.
        </p>

        <hr />

        <p>
          If our values match yours, we'd love to work with you.{" "}
          <Link href="/get-started">Get started in five minutes →</Link>
        </p>
      </ContentBody>
    </>
  );
}

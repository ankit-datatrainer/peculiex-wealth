import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";
import { pageMeta } from "@/lib/seo";
import {
  ASSETS_ADVISED,
  ASSET_CLASS_COUNT_WORD,
  CITY,
  FEE_DISCLOSURE,
  INVESTOR_COUNT,
  REGISTRATION_LINE
} from "@/lib/siteFacts";

export const metadata: Metadata = pageMeta({
  title: "About Finvoq — who we are",
  description: `Finvoq is India's curated investment marketplace: ${ASSET_CLASS_COUNT_WORD} asset classes on one SEBI-linked platform. Meet the team, the mission and the values behind it.`,
  path: "/about"
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        page="about"
        label="About"
        title={<>Wealth management, <em>without the markup.</em></>}
        subtitle="We started Finvoq because India's investing experience was broken in two predictable ways: too many platforms, and too many incentives that point away from the investor."
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
          Finvoq unifies the investing surface ({ASSET_CLASS_COUNT_WORD} asset classes, one
          dashboard). {FEE_DISCLOSURE} There's no separate bill from us for the research,
          the curation, or the platform itself.
        </p>

        <h2>What we believe</h2>
        <ul>
          <li>
            <strong>Curation beats access.</strong> India has 1,500 mutual fund schemes and
            300+ unlisted offers. The win isn't more choice. It's the right shortlist.
          </li>
          <li>
            <strong>Every fee should be visible.</strong> Distribution commission is how this
            industry has always worked. What's rare is showing you the number. We disclose
            what we earn on every recommendation, upfront.
          </li>
          <li>
            <strong>Tools should be opinionated.</strong> Calculators, dashboards, and
            research notes should help you decide, not just visualise.
          </li>
          <li>
            <strong>Compliance is a feature, not a hurdle.</strong> SEBI-linked, RBI-rail
            settlements, demat in your name, audit trail you can pull at any time.
          </li>
        </ul>

        <h2>Where we are</h2>
        <ul>
          <li>Founded in 2026 in {CITY}, India.</li>
          <li>{REGISTRATION_LINE}.</li>
          <li>{INVESTOR_COUNT} active investors, {ASSETS_ADVISED} in assets under distribution.</li>
        </ul>

        <h2>How we work with you</h2>
        <p>
          Every investor is paired with a relationship manager based on goals, time
          horizon, and portfolio size. You'll get one human as your point of contact
          (reachable on WhatsApp, email, or a scheduled call), backed by a research desk and
          an operations team that handles the paperwork.
        </p>
        <p>
          We do quarterly portfolio reviews on the calendar, and ad-hoc reviews whenever
          there's a market event or a personal one. The goal is steady, boring compounding,
          and the discipline to ride out the rough quarters.
        </p>

        <h2>What we don't do</h2>
        <ul>
          <li>Sell ULIPs, endowment plans, or any product that mixes insurance with investing.</li>
          <li>Charge you a separate advisory fee on top of the commission we disclose.</li>
          <li>Push F&amp;O speculation, intraday tips, or "get-rich" schemes.</li>
          <li>Promise specific returns. We promise process and transparency.</li>
        </ul>

        <h2>Our regulators</h2>
        <p>
          We work within the framework set by <strong>SEBI</strong> and{" "}
          <strong>AMFI</strong> (mutual fund distribution), <strong>RBI</strong> (banking
          rails), and <strong>IRDAI</strong> (insurance distribution). Disputes can be
          raised through <Link href="/legal/grievance">our grievance redressal process</Link>,
          with escalation to the SEBI SCORES portal at every stage.
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

"use client";

import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";
import RegulatoryCredentials from "@/components/RegulatoryCredentials";
import CountUp from "@/components/CountUp";
import { useContent } from "@/lib/content";
import {
  ASSETS_ADVISED,
  ASSET_CLASS_COUNT_WORD,
  CITY,
  FEE_DISCLOSURE,
  FOUNDED_YEAR,
  INVESTOR_COUNT,
  REGISTRATION_LINE
} from "@/lib/siteFacts";

const ABOUT_STATS = [
  { v: "182cr+", l: "Assets under distribution" },
  { v: "400+", l: "Active investors" },
  { v: "0%", l: "Advisory fee" }
];

export default function AboutClient() {
  const cms = useContent("about");

  // Why section
  const whyHeading = cms.t("why", "heading", "Why we exist");
  const whyP1 = cms.t(
    "why",
    "paragraph1",
    "Most Indian investors hold a tangle of mutual fund folios, a demat account at one broker, an LIC policy from a relative, a flat in a tier-3 city, and a few stocks someone recommended at a wedding. Each piece was sold by someone earning a commission. None of it was bought as part of a plan."
  );
  const whyP2 = cms.t(
    "why",
    "paragraph2",
    `Finvoq unifies the investing surface (${ASSET_CLASS_COUNT_WORD} asset classes, one dashboard). ${FEE_DISCLOSURE} There's 0% advisory fee and no separate bill from us for the research, the curation, or the platform itself.`
  );

  // Beliefs section
  const beliefsHeading = cms.t("beliefs", "heading", "What we believe");
  const beliefsList = cms.list("beliefs", "items", [
    {
      title: "Curation beats access.",
      description:
        "India has 1,500 mutual fund schemes and 300+ unlisted offers. The win isn't more choice. It's the right shortlist."
    },
    {
      title: "Every fee should be visible.",
      description:
        "Distribution commission is how this industry has always worked. What's rare is showing you the number. We disclose what we earn on every recommendation, upfront."
    },
    {
      title: "Tools should be opinionated.",
      description:
        "Calculators, dashboards, and research notes should help you decide, not just visualise."
    },
    {
      title: "Compliance is a feature, not a hurdle.",
      description:
        "SEBI-linked, RBI-rail settlements, demat in your name, audit trail you can pull at any time."
    }
  ]);

  // Where section
  const whereHeading = cms.t("where", "heading", "Where we are");
  const whereList = cms.list("where", "items", [
    { text: `Founded in ${FOUNDED_YEAR} in ${CITY}, India.` },
    { text: `${REGISTRATION_LINE}.` },
    { text: `${INVESTOR_COUNT} active investors, ${ASSETS_ADVISED} in assets under distribution.` },
    { text: `0% direct advisory fee — 100% transparent.` }
  ]);

  // How we work section
  const howHeading = cms.t("howWeWork", "heading", "How we work with you");
  const howP1 = cms.t(
    "howWeWork",
    "paragraph1",
    "Every investor is paired with a relationship manager based on goals, time horizon, and portfolio size. You'll get one human as your point of contact (reachable on WhatsApp, email, or a scheduled call), backed by a research desk and an operations team that handles the paperwork."
  );
  const howP2 = cms.t(
    "howWeWork",
    "paragraph2",
    "We do quarterly portfolio reviews on the calendar, and ad-hoc reviews whenever there's a market event or a personal one. The goal is steady, boring compounding, and the discipline to ride out the rough quarters."
  );

  // What we don't do section
  const dontHeading = cms.t("whatWeDontDo", "heading", "What we don't do");
  const dontList = cms.list("whatWeDontDo", "items", [
    { text: "Sell ULIPs, endowment plans, or any product that mixes insurance with investing." },
    { text: "Charge you a separate advisory fee on top of the commission we disclose." },
    { text: "Push F&O speculation, intraday tips, or \"get-rich\" schemes." },
    { text: "Promise specific returns. We promise process and transparency." }
  ]);

  // Regulators section
  const regHeading = cms.t("regulators", "heading", "Our regulators");
  const regBody = cms.t(
    "regulators",
    "body",
    "We work within the framework set by SEBI and AMFI (mutual fund distribution), RBI (banking rails), and IRDAI (insurance distribution). Disputes can be raised through our grievance redressal process, with escalation to the SEBI SCORES portal at every stage."
  );
  const regCredHeading = cms.t("regulators", "credentialsHeading", "Our AMFI registration");
  const regCredIntro = cms.t(
    "regulators",
    "credentialsIntro",
    "Verify these against the AMFI register before you invest. We publish them in full because a distributor who will not show you their ARN is a distributor you should not be dealing with."
  );

  // CTA section
  const ctaText = cms.t("cta", "text", "If our values match yours, we'd love to work with you.");
  const ctaLinkLabel = cms.t("cta", "linkLabel", "Get started in five minutes →");
  const ctaLinkHref = cms.t("cta", "linkHref", "/get-started");

  return (
    <>
      <PageHero
        page="about"
        label="About"
        title={<>Wealth management, <em>without the markup.</em></>}
        subtitle="We started Finvoq because India's investing experience was broken in two predictable ways: too many platforms, and too many incentives that point away from the investor."
      />

      <ContentBody>
        <div
          className="about-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            margin: "0 0 40px",
            padding: "24px 20px",
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "16px"
          }}
        >
          {cms.list("stats", "items", ABOUT_STATS).map((st, i) => (
            <div key={st.l || i} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(2rem, 3.2vw, 2.6rem)",
                  fontWeight: 700,
                  color: "var(--color-primary, #10b981)",
                  lineHeight: 1.15
                }}
              >
                <CountUp value={st.v} />
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  color: "var(--color-text-muted, #94a3b8)",
                  fontWeight: 500
                }}
              >
                {st.l}
              </div>
            </div>
          ))}
        </div>

        <h2>{whyHeading}</h2>
        <p>{whyP1}</p>
        <p>{whyP2}</p>

        <h2>{beliefsHeading}</h2>
        <ul>
          {beliefsList.map((item, idx) => (
            <li key={idx}>
              {item.title && <strong>{item.title} </strong>}
              {item.description}
            </li>
          ))}
        </ul>

        <h2>{whereHeading}</h2>
        <ul>
          {whereList.map((item, idx) => (
            <li key={idx}>{item.text}</li>
          ))}
        </ul>

        <h2>{howHeading}</h2>
        <p>{howP1}</p>
        <p>{howP2}</p>

        <h2>{dontHeading}</h2>
        <ul>
          {dontList.map((item, idx) => (
            <li key={idx}>{item.text}</li>
          ))}
        </ul>

        <h2>{regHeading}</h2>
        <p>
          {regBody.includes("grievance redressal process") ? (
            <>
              We work within the framework set by <strong>SEBI</strong> and{" "}
              <strong>AMFI</strong> (mutual fund distribution), <strong>RBI</strong> (banking
              rails), and <strong>IRDAI</strong> (insurance distribution). Disputes can be
              raised through <Link href="/legal/grievance">our grievance redressal process</Link>,
              with escalation to the SEBI SCORES portal at every stage.
            </>
          ) : (
            regBody
          )}
        </p>

        <RegulatoryCredentials
          heading={regCredHeading}
          intro={regCredIntro}
        />

        <hr />

        <p>
          {ctaText}{" "}
          <Link href={ctaLinkHref}>{ctaLinkLabel}</Link>
        </p>
      </ContentBody>
    </>
  );
}

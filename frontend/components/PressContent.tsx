"use client";

import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";
import { useContent } from "@/lib/content";

const DEFAULT_FACTS = [
  { label: "Legal name", value: "East Side Global" },
  { label: "Founded", value: "2021" },
  { label: "Headquarters", value: "Delhi, India" },
  { label: "Registration", value: "AMFI Registered Mutual Fund Distributor" },
  { label: "CIN", value: "U67100MH2024PTC999999" },
  { label: "Active investors", value: "4,000+" },
  { label: "Assets advised", value: "₹182 Cr+" },
  {
    label: "Asset classes covered",
    value:
      "Listed equity, unlisted shares, mutual funds, PMS, AIF, bonds, insurance, gold & commodities"
  }
];

export default function PressContent() {
  const cms = useContent("press");

  const contactHeading = cms.t("contact", "heading", "Press contact");
  const contactBody = cms.t("contact", "body", "For media enquiries, please email");
  const contactEmail = cms.t("contact", "email", "press@finvoq.com");
  const responseTime = cms.t(
    "contact",
    "responseTime",
    "We aim to respond to journalists within four business hours during India trading days."
  );

  const factsHeading = cms.t("companyFacts", "heading", "Company facts");
  const facts = cms.list<{ label: string; value: string }>(
    "companyFacts",
    "facts",
    DEFAULT_FACTS
  );

  const bpHeading = cms.t("boilerplate", "heading", "Boilerplate");
  const bpText = cms.t(
    "boilerplate",
    "text",
    "Finvoq is India's premium investment marketplace. We unify 10+ asset classes (listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds, insurance, fixed deposits, and GIFT City products) into a single advisor-led platform. As an AMFI Registered Mutual Fund Distributor, Finvoq is compensated through trail commission paid by the asset manager. Founded in 2021, headquartered in Delhi."
  );

  const brandHeading = cms.t("brandAssets", "heading", "Brand assets");
  const brandBody = cms.t(
    "brandAssets",
    "body",
    "Logos, wordmarks, and approved colour palettes are available on request to press@finvoq.com. Please do not modify the wordmark or apply colour treatments not in the brand kit."
  );

  const biosHeading = cms.t("founderBios", "heading", "Founder bios");
  const biosBody = cms.t(
    "founderBios",
    "body",
    "Bios for our co-founders, head of advisory, and head of research are available on request. We are happy to arrange interviews with subject-matter experts on India's mutual fund industry, unlisted markets, fixed income, and SEBI's investment-adviser framework."
  );

  const disclaimerNote = cms.t(
    "disclaimer",
    "note",
    "We do not respond to PR pitches or sponsored-post requests through this channel."
  );

  return (
    <>
      <PageHero
        page="press"
        label="Press"
        title={<>Press <em>resources</em></>}
        subtitle="Company facts, brand assets, and media contact for journalists writing about Finvoq."
      />

      <ContentBody>
        <h2>{contactHeading}</h2>
        <p>
          {contactBody} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. {responseTime}
        </p>

        <h2>{factsHeading}</h2>
        <ul>
          {facts.map((f, i) => (
            <li key={i}>
              <strong>{f.label}:</strong> {f.value}
            </li>
          ))}
        </ul>

        <h2>{bpHeading}</h2>
        <blockquote>{bpText}</blockquote>

        <h2>{brandHeading}</h2>
        <p>{brandBody}</p>

        <h2>{biosHeading}</h2>
        <p>{biosBody}</p>

        <hr />

        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          {disclaimerNote}
        </p>
      </ContentBody>
    </>
  );
}

import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";

export const metadata: Metadata = {
  title: "Press & Brand Kit",
  description: "Press contact, company facts, brand assets, and media coverage of Peculiex."
};

export default function PressPage() {
  return (
    <>
      <PageHero
        label="Press"
        title={<>Press <em>resources</em></>}
        subtitle="Company facts, brand assets, and media contact for journalists writing about Peculiex."
      />

      <ContentBody>
        <h2>Press contact</h2>
        <p>
          For media enquiries, please email{" "}
          <a href="mailto:press@peculiex.example.com">press@peculiex.example.com</a>. We aim to
          respond to journalists within four business hours during India trading days.
        </p>

        <h2>Company facts</h2>
        <ul>
          <li><strong>Legal name:</strong> Peculiex Wealth Pvt. Ltd.</li>
          <li><strong>Founded:</strong> 2024</li>
          <li><strong>Headquarters:</strong> Mumbai, India</li>
          <li><strong>SEBI Registered Investment Adviser:</strong> INA000099999</li>
          <li><strong>CIN:</strong> U67100MH2024PTC999999</li>
          <li><strong>Active investors:</strong> 4,000+</li>
          <li><strong>Assets advised:</strong> ₹450 Cr+</li>
          <li><strong>Asset classes covered:</strong> Listed equity, unlisted shares, mutual funds, PMS, AIF, bonds, insurance, gold &amp; commodities</li>
        </ul>

        <h2>Boilerplate</h2>
        <blockquote>
          Peculiex is India's premium investment marketplace. We unify eight asset classes —
          listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds, insurance,
          and gold &amp; commodities — into a single advisor-led platform. As a SEBI Registered
          Investment Adviser, Peculiex earns a flat fee from investors and accepts no
          commissions from product manufacturers. Founded in 2024, headquartered in Mumbai.
        </blockquote>

        <h2>Brand assets</h2>
        <p>
          Logos, wordmarks, and approved colour palettes are available on request to
          <a href="mailto:press@peculiex.example.com"> press@peculiex.example.com</a>. Please
          do not modify the wordmark or apply colour treatments not in the brand kit.
        </p>

        <h2>Founder bios</h2>
        <p>
          Bios for our co-founders, head of advisory, and head of research are available on
          request. We are happy to arrange interviews with subject-matter experts on India's
          mutual fund industry, unlisted markets, fixed income, and SEBI's investment-adviser
          framework.
        </p>

        <hr />

        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          We do not respond to PR pitches or sponsored-post requests through this channel.
        </p>
      </ContentBody>
    </>
  );
}

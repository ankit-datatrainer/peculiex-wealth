import type { Metadata } from "next";
import NriServicePage, { type NriServiceContent } from "@/components/NriServicePage";

export const metadata: Metadata = {
  title: "Apply for a PAN Card (NRI) — Finvoq",
  description:
    "Assisted application for a new Indian PAN card for NRIs — required for investing, property transactions, and tax filing in India. Fully remote, no branch visits."
};

const content: NriServiceContent = {
  label: "NRI Services",
  title: (
    <>
      Get your <em>Indian PAN card</em>, wherever you live.
    </>
  ),
  subtitle:
    "Assisted application for a new Permanent Account Number (PAN) — required for investing, property transactions, and tax filing in India.",
  intro:
    "A PAN is mandatory for NRIs who want to invest in Indian securities, buy or sell property, open a bank or demat account, or file income tax returns in India. We prepare and track your application so you don't have to navigate the forms and documentation yourself.",
  highlights: [
    { title: "Correct form, filled right", body: "NRIs typically apply through Form 49AA. We make sure the right form and applicant category are used from the start." },
    { title: "Document review before submission", body: "We check that your passport, overseas address proof and photograph meet the required format, so your application isn't rejected on a technicality." },
    { title: "Application tracking", body: "We monitor your application status after submission and keep you updated at every stage." },
    { title: "Delivery coordination", body: "Your physical PAN card can be couriered to your overseas address, or you can use the e-PAN for most digital purposes immediately." },
    { title: "No branch visits required", body: "The entire process — documentation, submission, and tracking — is handled online, over email and WhatsApp." }
  ],
  steps: [
    { title: "Share your details", body: "Basic personal information, a passport copy, and your current overseas address proof." },
    { title: "We prepare your application", body: "Form 49AA is filled out and cross-checked against your documents for accuracy." },
    { title: "You review and sign", body: "We share the final application with you for confirmation before it's submitted." },
    { title: "Submitted & tracked", body: "Your application is submitted to the PAN issuing authority and tracked through to allotment." }
  ],
  documents: [
    "Passport copy (all relevant pages)",
    "Overseas address proof (utility bill, bank statement, or residence permit)",
    "Passport-size photograph",
    "OCI/PIO card copy, if applicable",
    "Proof of an Indian address, if you'd like to register one (optional)"
  ],
  faqs: [
    { q: "Why does an NRI need a PAN card?", a: "PAN is required to open an NRE/NRO account for investment purposes, invest in mutual funds, shares, PMS or AIF, buy or sell property in India, and file Indian income tax returns." },
    { q: "How long does it take to get a PAN card?", a: "Processing typically takes a couple of weeks from submission, though it can vary depending on document verification and the issuing authority's workload." },
    { q: "Can I apply for a PAN without visiting India?", a: "Yes — the entire application, verification and delivery process can be completed while you're overseas." },
    { q: "What's the difference between Form 49A and Form 49AA?", a: "Form 49A is meant for Indian citizens; Form 49AA is for foreign citizens and, in most cases, NRIs. We determine the correct form for your specific situation before filing." },
    { q: "Can I use an e-PAN instead of a physical card?", a: "For most digital purposes — including e-KYC for investment accounts — the e-PAN (PDF version) is accepted. A physical card can still be couriered if you need one." }
  ],
  serviceName: "PAN Card Application"
};

export default function PanApplicationPage() {
  return <NriServicePage content={content} />;
}

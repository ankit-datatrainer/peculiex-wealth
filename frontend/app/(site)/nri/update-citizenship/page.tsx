import type { Metadata } from "next";
import NriServicePage, { type NriServiceContent } from "@/components/NriServicePage";

export const metadata: Metadata = {
  title: "Update PAN Citizenship & Residential Status — Finvoq",
  description:
    "Correct your residential status, address, or personal details on an existing Indian PAN card, so your records match your current NRI status. Fully remote."
};

const content: NriServiceContent = {
  label: "NRI Services",
  title: (
    <>
      Update your <em>PAN details</em> to match your NRI status.
    </>
  ),
  subtitle:
    "Correct your residential status, address, or personal details on an existing PAN card — so your records match your current status as an NRI.",
  intro:
    "If your residential status has changed — you've recently moved abroad, changed citizenship, or your existing PAN reflects outdated details — keeping your PAN updated helps avoid mismatches when investing, filing taxes, or dealing with your bank in India.",
  highlights: [
    { title: "Residential status correction", body: "Update your PAN record to accurately reflect your resident or non-resident status." },
    { title: "Address updates", body: "Change your registered address on file to your current overseas address." },
    { title: "Name and detail corrections", body: "Fix spelling errors, or update details following a legal name change." },
    { title: "Correction form handled for you", body: "The PAN correction / change-request form is prepared and filed on your behalf, with supporting documents attached." },
    { title: "Tracked until completion", body: "We follow up with the issuing authority and confirm once your updated PAN details are processed." }
  ],
  steps: [
    { title: "Tell us what needs updating", body: "Share your current PAN details and what has changed." },
    { title: "We prepare the correction request", body: "The appropriate change-request form is filled out with supporting documents attached." },
    { title: "You review and confirm", body: "We share the final request with you for confirmation before it's submitted." },
    { title: "Filed and confirmed", body: "Once processed, you'll receive your updated PAN details and, if applicable, a reissued card." }
  ],
  documents: [
    "Copy of your existing PAN card",
    "Passport copy showing current citizenship/nationality",
    "Current overseas address proof",
    "Visa, OCI or residency permit, if the update relates to citizenship or residential status",
    "Legal documents for any name change (e.g. marriage certificate), if applicable"
  ],
  faqs: [
    { q: "Why should I update my PAN if my status has changed to NRI?", a: "Banks, brokers and the Income Tax Department cross-check your PAN details. An outdated resident status or address can cause tax to be deducted at the wrong rate, or delay KYC on your investment accounts." },
    { q: "Will I get a new PAN number?", a: "No. A correction request updates the details linked to your existing PAN — the PAN number itself never changes." },
    { q: "How long does a PAN correction take?", a: "It generally takes a couple of weeks after submission, depending on document verification." },
    { q: "Do I need to update my PAN if I only changed my address, not my citizenship?", a: "It's optional but recommended, so your KYC records with banks and brokers stay accurate and correspondence reaches you without delay." },
    { q: "Can this be done entirely online?", a: "Yes — the correction request, document upload and confirmation can all be completed remotely." }
  ],
  serviceName: "PAN Citizenship / Status Update"
};

export default function UpdateCitizenshipPage() {
  return <NriServicePage content={content} />;
}

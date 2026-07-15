import type { Metadata } from "next";
import NriServicePage, { type NriServiceContent } from "@/components/NriServicePage";

export const metadata: Metadata = {
  title: "NRI Income Tax Filing in India — Finvoq",
  description:
    "Expert-assisted income tax return filing for Non-Resident Indians — NRE/NRO income, capital gains, DTAA relief, and TDS reconciliation, handled end to end."
};

const content: NriServiceContent = {
  label: "NRI Services",
  title: (
    <>
      File your <em>India income tax</em> without the stress.
    </>
  ),
  subtitle:
    "Expert-assisted income tax return filing for Non-Resident Indians — covering NRE/NRO income, capital gains, DTAA relief, and TDS reconciliation.",
  intro:
    "If you earn income in India — rent, interest, dividends, or capital gains from property, mutual funds or shares — you may be required to file an income tax return even as a non-resident. We handle the assessment, the paperwork, and the filing, so you can stay compliant without navigating the Indian tax system yourself.",
  highlights: [
    { title: "Full income coverage", body: "NRE/NRO interest, rental income, capital gains from Indian assets, and dividends — every income source is accounted for in your return." },
    { title: "DTAA relief applied correctly", body: "Where India has a Double Taxation Avoidance Agreement with your country of residence, we apply the relevant relief so the same income isn't taxed twice." },
    { title: "TDS reconciliation", body: "We match tax already deducted by your bank or broker against your Form 26AS / AIS, and claim a refund wherever excess tax was withheld." },
    { title: "Capital gains computed correctly", body: "Short-term and long-term gains on equity, mutual funds and property — computed with indexation applied where it's available." },
    { title: "Filed and acknowledged", body: "Your return is e-filed and verified, so you have a clean compliance record and an acknowledgment you can rely on." },
    { title: "Support after filing", body: "If the Income Tax Department raises a query or notice after filing, we help you understand it and prepare the response." }
  ],
  steps: [
    { title: "Share your documents", body: "Send your PAN, Form 26AS/AIS, and your NRE/NRO bank and broker statements for the financial year." },
    { title: "We assess your tax liability", body: "Our team reviews every income source, applicable DTAA benefits, and eligible deductions." },
    { title: "Review & approve", body: "You review a plain-language summary of your computed tax position before anything is filed." },
    { title: "E-file & acknowledge", body: "Your return is filed electronically and the acknowledgment (ITR-V) is shared with you for your records." }
  ],
  documents: [
    "PAN card copy",
    "Passport (photo and visa/residency pages)",
    "Form 26AS / Annual Information Statement (AIS)",
    "NRE and NRO bank account statements for the financial year",
    "Capital gains statements from your broker or mutual fund folios, if applicable",
    "Details of any property sold or rented out in India",
    "Proof of tax already paid overseas, if you're claiming DTAA relief"
  ],
  faqs: [
    { q: "Do NRIs need to file income tax returns in India?", a: "If your total taxable income in India exceeds the basic exemption limit, or you want to claim a refund of TDS already deducted, you're required to file a return — even though you're a non-resident for tax purposes." },
    { q: "What is DTAA and how does it help?", a: "The Double Taxation Avoidance Agreement is a treaty India has with most countries. It prevents the same income from being taxed twice — once in India and once in your country of residence — either through an exemption or a tax credit." },
    { q: "Is interest on my NRE account taxable in India?", a: "Interest earned on an NRE account is generally tax-exempt in India for as long as your NRI status holds. Interest on an NRO account, however, is taxable and usually subject to TDS." },
    { q: "What happens if I miss the filing deadline?", a: "Late filing can attract interest and penalties, and may affect your ability to carry forward certain losses. If you've already missed a deadline, we can still help you file a belated return where the law permits it." },
    { q: "Can you help if I've already received a notice from the tax department?", a: "Yes — we review the notice, prepare an appropriate response, and help you resolve it." }
  ],
  serviceName: "NRI Tax Filing"
};

export default function TaxFilingPage() {
  return <NriServicePage content={content} />;
}

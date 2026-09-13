import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Finvoq — talk to an adviser",
  description:
    "Reach the Finvoq team by phone, email or message. Questions about mutual funds, PMS, AIF, bonds, unlisted equity or NRI services — we reply within one working day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Finvoq — talk to an adviser",
    description:
      "Reach the Finvoq team by phone, email or message. We reply within one working day.",
    url: "/contact",
    images: [OG_IMAGE],
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}

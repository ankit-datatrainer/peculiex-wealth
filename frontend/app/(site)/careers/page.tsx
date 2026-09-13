import type { Metadata } from "next";
import CareersContent from "@/components/CareersContent";

export const metadata: Metadata = {
  title: "Careers at Finvoq",
  description:
    "We're building India's premium investment marketplace. If you care about what you build and how it's sold, we'd love to hear from you."
};

export default function CareersPage() {
  return <CareersContent />;
}


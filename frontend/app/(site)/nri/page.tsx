import type { Metadata } from "next";
import NriCornerContent from "@/components/NriCornerContent";

export const metadata: Metadata = {
  title: "NRI Investing: Finvoq",
  description:
    "Invest in India as an NRI: mutual funds, PMS, AIF, unlisted shares, bonds, and Gift City (IFSC) offshore access, with repatriation-aware, FEMA-compliant routing."
};

export default function NriPage() {
  return <NriCornerContent />;
}

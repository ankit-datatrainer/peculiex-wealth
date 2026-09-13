import type { Metadata } from "next";
import PressContent from "@/components/PressContent";

export const metadata: Metadata = {
  title: "Press & Brand Kit",
  description: "Press contact, company facts, brand assets, and media coverage of Finvoq."
};

export default function PressPage() {
  return <PressContent />;
}

import type { Metadata } from "next";
import Calculator from "@/components/Calculator";

export const metadata: Metadata = {
  title: "SIP Calculator — Plan Your Mutual Fund Returns",
  description:
    "Visualise how systematic monthly investments compound over time. Adjust amount, expected return, and duration to model your future portfolio."
};

export default function CalculatorPage() {
  return <Calculator />;
}

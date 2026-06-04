import Hero from "@/components/Hero";
import Why from "@/components/Why";
import Marketplace from "@/components/Marketplace";
import MarketsPreview from "@/components/MarketsPreview";
import UnlistedPreview from "@/components/UnlistedPreview";
import CalculatorPreview from "@/components/CalculatorPreview";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <Why />
      <Marketplace />
      <MarketsPreview />
      <UnlistedPreview />
      <CalculatorPreview />
      <Testimonials />
      <FAQ />
      <Pricing />
    </>
  );
}

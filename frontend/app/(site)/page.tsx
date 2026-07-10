import Hero from "@/components/Hero";
import Why from "@/components/Why";
import Marketplace from "@/components/Marketplace";
import MarketsPreview from "@/components/MarketsPreview";

import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <Marketplace />
      <Why />
      <MarketsPreview />

      {/* Offer / value proposition before credibility (testimonials) to improve conversion flow */}
      <Pricing />
      <Testimonials />
      <FAQ />
    </>
  );
}

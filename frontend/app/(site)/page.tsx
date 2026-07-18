import Hero from "@/components/Hero";
import Why from "@/components/Why";
import PartnerLogos from "@/components/PartnerLogos";

import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <Why />
      <PartnerLogos productSlug="mutual-funds" />

      {/* Offer / value proposition before credibility (testimonials) to improve conversion flow */}
      <Pricing />
      <Testimonials />
      <FAQ />
    </>
  );
}

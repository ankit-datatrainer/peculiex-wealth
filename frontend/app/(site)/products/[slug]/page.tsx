import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/productContent";
import ProductPageClient from "@/components/ProductPageClient";

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export function generateMetadata({
  params
}: {
  params: { slug: string };
}): Metadata {
  const p = PRODUCTS[params.slug];
  if (!p) return { title: "Not found" };
  return {
    title: `${p.label}: Finvoq`,
    description: p.subtitle
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = PRODUCTS[params.slug];
  if (!p) notFound();

  return <ProductPageClient slug={params.slug} product={p} />;
}

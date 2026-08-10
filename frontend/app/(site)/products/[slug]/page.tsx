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
  if (!p) return { title: "Not found", robots: { index: false, follow: true } };
  return {
    title: `${p.label}: Finvoq`,
    description: p.subtitle,
    // These are the highest-priority pages in the sitemap, so they need a
    // self-referencing canonical: without one, any tracking or ref parameter
    // on an inbound link is treated as a separate, competing URL.
    alternates: { canonical: `/products/${params.slug}` },
    openGraph: {
      title: `${p.label}: Finvoq`,
      description: p.subtitle,
      url: `/products/${params.slug}`
    }
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = PRODUCTS[params.slug];
  if (!p) notFound();

  return <ProductPageClient slug={params.slug} product={p} />;
}

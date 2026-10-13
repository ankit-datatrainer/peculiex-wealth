import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL, legalSection } from "@/lib/legalContent";
import { pageMeta } from "@/lib/seo";
import LegalDocument from "./LegalDocument";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LEGAL).map((slug) => ({ slug }));
}

export function generateMetadata({
  params
}: {
  params: { slug: string };
}): Metadata {
  const d = LEGAL[params.slug];
  if (!d) return { title: "Not found", robots: { index: false, follow: true } };
  return pageMeta({
    title: d.title,
    description: d.subtitle,
    path: `/legal/${params.slug}`,
    ogTitle: `${d.title} — Finvoq`
  });
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = LEGAL[params.slug];
  if (!doc) notFound();

  // Header, date line and body are all editable (Content Manager → Legal
  // pages); the built-in body is the server-rendered fallback.
  return (
    <LegalDocument
      section={legalSection(doc.slug)}
      label={doc.label}
      title={doc.title}
      subtitle={doc.subtitle}
      updated={doc.updated}
    >
      {doc.body}
    </LegalDocument>
  );
}

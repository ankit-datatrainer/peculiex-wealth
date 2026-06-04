import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL } from "@/lib/legalContent";
import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";

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
  if (!d) return { title: "Not found" };
  return { title: d.title, description: d.subtitle };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = LEGAL[params.slug];
  if (!doc) notFound();

  return (
    <>
      <PageHero label={doc.label} title={doc.title} subtitle={doc.subtitle} />
      <ContentBody>
        <p
          style={{
            color: "var(--color-text-faint)",
            fontSize: "0.85rem",
            marginBottom: "2rem"
          }}
        >
          {doc.updated}
        </p>
        {doc.body}
      </ContentBody>
    </>
  );
}

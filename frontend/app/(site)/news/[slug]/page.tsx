import type { Metadata } from "next";
import ArticlePage from "@/components/ArticlePage";
import { pageMeta } from "@/lib/seo";

interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * The story itself is resolved client-side from the cached news feed, so the
 * slug is the only headline signal available at render time. Deriving the
 * title from it still gives every article a distinct title, canonical and
 * og:url instead of one shared social card for the whole section.
 */
function titleFromSlug(slug: string) {
  const words = decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!words) return "Market News";
  const cased = words.charAt(0).toUpperCase() + words.slice(1);
  return cased.length > 70 ? `${cased.slice(0, 67).trimEnd()}…` : cased;
}

export function generateMetadata({ params }: PageProps): Metadata {
  const headline = titleFromSlug(params.slug);
  return pageMeta({
    title: headline,
    description:
      `${headline} — the full story in Finvoq's distraction-free market news reader, with related Indian market coverage alongside it.`.slice(
        0,
        158
      ),
    path: `/news/${params.slug}`,
    ogTitle: `${headline} — Finvoq News`
  });
}

export default function Page({ params }: PageProps) {
  return <ArticlePage params={{ slug: params.slug }} />;
}

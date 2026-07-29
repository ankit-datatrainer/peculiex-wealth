import type { Metadata } from "next";

/**
 * Builds a per-page Metadata object with a distinct og:title, a canonical URL
 * and og:url. `metadataBase` is set in app/layout.tsx, so relative paths here
 * resolve to absolute https://finvoq.com/... URLs automatically.
 *
 * og:image: app/opengraph-image.tsx generates the card, but the file convention
 * only reaches pages that do NOT declare their own `openGraph` object — as soon
 * as a page sets one, the inherited image is dropped and the share preview goes
 * blank again. Since every page built with this helper does declare `openGraph`,
 * the image is referenced explicitly below.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Finvoq — India's advisory-led investment marketplace"
};
export function pageMeta({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  absoluteTitle = false
}: {
  /** Page <title>. The root layout appends " · Finvoq". */
  title: string;
  description: string;
  /** Route path, leading slash, e.g. "/calculator". */
  path: string;
  /** Social-card title. Defaults to `${title} · Finvoq` so it is never identical sitewide. */
  ogTitle?: string;
  ogDescription?: string;
  /** Set for the home page, where the " · Finvoq" title template would duplicate the brand. */
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Finvoq",
      locale: "en_IN",
      title: ogTitle ?? `${title} · Finvoq`,
      description: ogDescription ?? description,
      url: path,
      images: [OG_IMAGE]
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? `${title} · Finvoq`,
      description: ogDescription ?? description,
      images: [OG_IMAGE.url]
    }
  };
}

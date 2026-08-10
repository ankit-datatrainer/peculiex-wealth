import type { Metadata } from "next";
import UnlistedDetail from "@/components/UnlistedDetail";

/**
 * Turn a slug back into a readable company name for the page title.
 *
 * The detail view itself is client-rendered from the API, so without this
 * every one of the ~170 unlisted URLs in the sitemap would inherit the root
 * layout's generic title — a wall of identical <title> and no description,
 * which is exactly the duplicate-metadata pattern that gets a section
 * demoted. Deriving from the slug keeps it accurate without making this a
 * server component that has to wait on the API.
 *
 * "zak-venture-ltd" -> "Zak Venture Ltd"
 */
function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) =>
      // Company suffixes read wrong in Title Case.
      ["ltd", "llp", "plc", "inc", "nse", "bse", "ipo", "pvt"].includes(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
    .replace(/\bLTD\b/, "Ltd")
    .replace(/\bPVT\b/, "Pvt");
}

export function generateMetadata({
  params
}: {
  params: { slug: string };
}): Metadata {
  const name = titleFromSlug(params.slug);
  const description =
    `Buy ${name} unlisted shares through Finvoq. Live indicative pricing, ` +
    `minimum lot size and advisor-assisted settlement into your own demat account.`;

  return {
    title: `${name} Unlisted Share Price`,
    description,
    alternates: { canonical: `/unlisted/${params.slug}` },
    openGraph: {
      title: `${name} Unlisted Share Price`,
      description,
      url: `/unlisted/${params.slug}`
    }
  };
}

export default function UnlistedDetailPage({
  params
}: {
  params: { slug: string };
}) {
  return <UnlistedDetail slug={params.slug} />;
}

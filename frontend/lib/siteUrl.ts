/**
 * The site's canonical origin, in one place.
 *
 * robots.txt, sitemap.xml and metadataBase must all agree: a sitemap served
 * from a host the robots.txt does not name, or canonicals pointing at a
 * different origin, are ignored by crawlers rather than reported as errors.
 *
 * Trailing slashes are stripped so callers can safely template `${SITE_URL}/x`
 * without producing a double slash, which reads as a distinct URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://finvoq.com"
).replace(/\/+$/, "");

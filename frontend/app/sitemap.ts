import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";
import { PRODUCTS } from "@/lib/productContent";
import { LEGAL } from "@/lib/legalContent";
import { unlistedSlug } from "@/lib/util";
import { getAllFallbackBlogs } from "@/lib/blogData";

/**
 * /sitemap.xml
 *
 * Regenerated hourly rather than frozen at build time: the unlisted-shares
 * list comes from the API, and a build that happened while the backend was
 * down would otherwise ship a sitemap missing those pages until the next
 * deploy.
 */
export const revalidate = 3600;

/** Routes that render the same for everyone and are worth indexing. */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },

  // Money pages — the reason someone searches for us.
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/unlisted", priority: 0.9, changeFrequency: "daily" },
  { path: "/markets", priority: 0.8, changeFrequency: "daily" },
  { path: "/get-started", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },

  // Tools: strong long-tail search intent ("sip calculator" etc.).
  { path: "/calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/calculator/lumpsum", priority: 0.7, changeFrequency: "monthly" },
  { path: "/calculator/goal-planner", priority: 0.7, changeFrequency: "monthly" },
  { path: "/calculator/retirement", priority: 0.7, changeFrequency: "monthly" },
  { path: "/calculator/reverse-sip", priority: 0.7, changeFrequency: "monthly" },
  { path: "/reckoner", priority: 0.6, changeFrequency: "monthly" },

  // NRI cluster.
  { path: "/nri", priority: 0.8, changeFrequency: "monthly" },
  { path: "/nri/tax-filing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/nri/pan-application", priority: 0.6, changeFrequency: "monthly" },
  { path: "/nri/update-citizenship", priority: 0.6, changeFrequency: "monthly" },

  // Content and trust pages.
  { path: "/news", priority: 0.7, changeFrequency: "daily" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/insights", priority: 0.6, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/glossary", priority: 0.5, changeFrequency: "monthly" },
  { path: "/stories", priority: 0.5, changeFrequency: "monthly" },
  { path: "/press", priority: 0.4, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.4, changeFrequency: "monthly" },
  { path: "/investor-zone", priority: 0.5, changeFrequency: "monthly" },
  { path: "/resources/mutual-funds", priority: 0.6, changeFrequency: "monthly" },
  { path: "/watchlist", priority: 0.5, changeFrequency: "weekly" },
];

/**
 * Unlisted company pages, whose slugs live in the API.
 *
 * Deliberately non-fatal: a sitemap that throws takes the route down and
 * crawlers get a 500, which is worse than a sitemap missing one section. On
 * any failure we log and return nothing, and the hourly revalidate picks the
 * pages up once the backend answers again.
 */
async function unlistedRoutes(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "";
  if (!base) return [];

  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/api/unlisted`, {
      signal: AbortSignal.timeout(8000),
      // Matches this route's `revalidate`, so the sitemap can be cached and
      // regenerated hourly. `no-store` here would opt the whole route into
      // dynamic rendering and hit the backend on every crawler request.
      next: { revalidate },
    });
    if (!res.ok) return [];

    const json = (await res.json()) as { items?: Array<{ name?: string }> };
    const seen = new Set<string>();

    return (json.items || [])
      .map((item) => item?.name)
      .filter((name): name is string => Boolean(name && name.trim()))
      .map((name) => unlistedSlug(name))
      .filter((slug) => {
        // The slug is derived from the display name, so two companies can
        // collide; a duplicate <loc> makes the whole file invalid.
        if (!slug || seen.has(slug)) return false;
        seen.add(slug);
        return true;
      })
      .map((slug) => ({
        url: `${SITE_URL}/unlisted/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (err) {
    console.warn(
      "[sitemap] unlisted companies omitted:",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

/**
 * Blog article pages.
 *
 * Tries the live API first so newly-published articles appear in the sitemap
 * within an hour. Falls back to the hardcoded default blogs baked into the
 * frontend to guarantee the sitemap is never empty.
 */
async function blogRoutes(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  type BlogItem = { slug?: string; updated_at?: string; created_at?: string };
  let apiBlogs: BlogItem[] = [];

  if (base) {
    try {
      const res = await fetch(
        `${base.replace(/\/+$/, "")}/api/blogs`,
        { signal: AbortSignal.timeout(8000), next: { revalidate } }
      );
      if (res.ok) {
        const json = (await res.json()) as { items?: BlogItem[] };
        apiBlogs = json.items || [];
      }
    } catch (err) {
      console.warn(
        "[sitemap] blog articles from API omitted:",
        err instanceof Error ? err.message : err
      );
    }
  }

  // Merge API slugs with hardcoded fallback to guarantee coverage
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  const addBlog = (slug: string, lastMod?: string) => {
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    entries.push({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: lastMod ? new Date(lastMod) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    });
  };

  apiBlogs.forEach((b) => addBlog(b.slug || "", b.updated_at || b.created_at));
  getAllFallbackBlogs().forEach((b) => addBlog(b.slug, b.created_at));

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // One page per product, straight from the same record the pages render from,
  // so a new product cannot be added without appearing here.
  const productEntries: MetadataRoute.Sitemap = Object.keys(PRODUCTS).map(
    (slug) => ({
      url: `${SITE_URL}/products/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  const legalEntries: MetadataRoute.Sitemap = Object.keys(LEGAL).map((slug) => ({
    url: `${SITE_URL}/legal/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  /* Intentionally absent:
     - /markets/<symbol>: ~200 pages whose body is a live quote table. They are
       near-duplicates of each other and of far stronger pages elsewhere on the
       web, so listing them invites thin-content judgements and burns crawl
       budget on pages that change every second. They stay crawlable via
       /markets for anyone who follows the links.
     - /news/<slug>: article pages are proxied third-party content; submitting
       someone else's article as our canonical URL is a duplicate-content risk.
     - /dashboard, /sip/*, /login, /signup, /admin/*: private or auth-only, and
       disallowed in robots.txt. */

  return [
    ...staticEntries,
    ...productEntries,
    ...legalEntries,
    ...(await blogRoutes()),
    ...(await unlistedRoutes()),
  ];
}

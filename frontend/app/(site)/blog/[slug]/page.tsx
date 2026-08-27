import type { Metadata } from "next";
import { apiUrl } from "@/lib/api";
import { type Blog, getFallbackBlogBySlug, getAllFallbackBlogs } from "@/lib/blogData";
import BlogDetailClient from "@/components/BlogDetailClient";
import "./blog-detail.css";

export const dynamicParams = true;

export async function generateStaticParams() {
  // Try fetching from the live API first so newly-added blogs get pre-built.
  // Fall back to the hardcoded list if the API is unreachable (build-time safety).
  const apiBase =
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  if (apiBase) {
    try {
      const cleanBase = apiBase.replace(/\/+$/, "");
      const res = await fetch(`${cleanBase}/api/blogs`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.items || json;
        if (Array.isArray(items) && items.length > 0) {
          // Merge API slugs with fallback slugs to guarantee coverage
          const slugSet = new Set<string>(
            items.map((b: { slug: string }) => b.slug)
          );
          getAllFallbackBlogs().forEach((b) => slugSet.add(b.slug));
          return Array.from(slugSet).map((slug) => ({ slug }));
        }
      }
    } catch {
      // API unreachable during build — use fallback list below
    }
  }

  return getAllFallbackBlogs().map((b) => ({ slug: b.slug }));
}

async function fetchFromUrl(baseUrl: string, slug: string): Promise<Blog | null> {
  try {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const res = await fetch(`${cleanBase}/api/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.item || null;
  } catch {
    return null;
  }
}

async function getBlog(slug: string): Promise<Blog | null> {
  const fallback = getFallbackBlogBySlug(slug);

  // Candidate API base URLs to attempt in order.
  // On the VPS the backend usually lives on the same box, so localhost works.
  // The production site URL is included as a fallback because next.config
  // rewrites /api/* → backend, meaning https://finvoq.com/api/blogs/... will
  // route through to the Express backend even in production.
  const candidates: string[] = [
    process.env.API_BASE,
    process.env.NEXT_PUBLIC_API_BASE,
    process.env.NEXT_PUBLIC_SITE_URL,   // e.g. https://finvoq.com
    "http://127.0.0.1:4001",
    "http://127.0.0.1:4000",
    "http://localhost:4001",
    "http://localhost:4000"
  ].filter(Boolean) as string[];

  // Remove duplicates
  const uniqueUrls = Array.from(new Set(candidates));

  for (const url of uniqueUrls) {
    const blog = await fetchFromUrl(url, slug);
    if (blog) return blog;
  }

  // If live fetch failed, return fallback blog
  return fallback;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = (await getBlog(params.slug)) || getFallbackBlogBySlug(params.slug);
  if (!blog) {
    const formattedTitle = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${formattedTitle} | Finvoq Wealth`,
      description: "Expert wealth management analysis and insights from the Finvoq research team.",
      alternates: { canonical: `https://finvoq.com/blog/${params.slug}` }
    };
  }

  const title = blog.meta_title || `${blog.title} | Finvoq Wealth`;
  const description =
    blog.meta_description ||
    blog.excerpt ||
    "Expert wealth management analysis and insights from the Finvoq research team.";
  const canonical = blog.canonical_url || `https://finvoq.com/blog/${blog.slug}`;
  const rawCover = blog.og_image || blog.image_url || "/images/blogs/blog-1.jpg";
  const coverImg = rawCover.startsWith("http") || rawCover.startsWith("/") ? rawCover : apiUrl(rawCover);
  const tags = blog.tags || [];

  return {
    title,
    description,
    keywords: [
      ...(blog.focus_keyword ? [blog.focus_keyword] : []),
      ...tags,
      ...(blog.meta_keywords ? blog.meta_keywords.split(",").map((k) => k.trim()) : [])
    ].filter(Boolean),
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Finvoq Wealth Management",
      type: "article",
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at || blog.created_at,
      authors: [blog.author || "Finvoq Admin"],
      tags,
      images: [
        {
          url: coverImg,
          width: 1200,
          height: 630,
          alt: blog.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImg],
      creator: "@FinvoqWealth"
    }
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);

  // JSON-LD Article Schema for Search Engines (Google SEO Rich Snippets)
  const jsonLd = blog
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: blog.meta_title || blog.title,
        description: blog.meta_description || blog.excerpt,
        image: [
          blog.og_image || blog.image_url
            ? (blog.og_image || blog.image_url)!.startsWith("http") || (blog.og_image || blog.image_url)!.startsWith("/")
              ? blog.og_image || blog.image_url
              : apiUrl(blog.og_image || blog.image_url || "/images/blogs/blog-1.jpg")
            : "https://finvoq.com/images/blogs/blog-1.jpg"
        ],
        datePublished: blog.created_at,
        dateModified: blog.updated_at || blog.created_at,
        author: {
          "@type": "Person",
          name: blog.author || "Finvoq Admin"
        },
        publisher: {
          "@type": "Organization",
          name: "Finvoq",
          logo: {
            "@type": "ImageObject",
            url: "https://finvoq.com/logo.png"
          }
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://finvoq.com/blog/${blog.slug}`
        },
        keywords: (blog.tags || []).join(", ")
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailClient slug={params.slug} initialBlog={blog} />
    </>
  );
}

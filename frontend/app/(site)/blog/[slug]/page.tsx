import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Tag, ArrowUpRight, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";
import "./blog-detail.css";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_url: string | null;
  author: string;
  category?: string;
  published: boolean;
  position: number;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  meta_keywords?: string | null;
  tags?: string[];
  canonical_url?: string | null;
  og_image?: string | null;
  created_at?: string;
  updated_at?: string;
};

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const url = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "http://127.0.0.1:4001";
    const res = await fetch(`${url}/api/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.item || null;
  } catch {
    return null;
  }
}

async function getAllBlogs(): Promise<Blog[]> {
  try {
    const url = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "http://127.0.0.1:4001";
    const res = await fetch(`${url}/api/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: "Article Not Found | Finvoq" };

  const title = blog.meta_title || `${blog.title} | Finvoq Wealth`;
  const description = blog.meta_description || blog.excerpt || "Expert wealth management analysis and insights from the Finvoq research team.";
  const canonical = blog.canonical_url || `https://finvoq.com/blog/${blog.slug}`;
  const coverImg = blog.og_image || blog.image_url || "/images/blogs/blog-1.jpg";
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
          url: apiUrl(coverImg),
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
      images: [apiUrl(coverImg)],
      creator: "@FinvoqWealth"
    }
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  const allBlogs = await getAllBlogs();
  const related = allBlogs.filter((b) => b.slug !== blog.slug).slice(0, 3);

  // Estimate read time
  const wordCount = (blog.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 180));

  // JSON-LD Article Schema for Search Engines (Google SEO Rich Snippets)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.meta_title || blog.title,
    "description": blog.meta_description || blog.excerpt,
    "image": [apiUrl(blog.og_image || blog.image_url || "/images/blogs/blog-1.jpg")],
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "author": {
      "@type": "Person",
      "name": blog.author || "Finvoq Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Finvoq",
      "logo": {
        "@type": "ImageObject",
        "url": "https://finvoq.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://finvoq.com/blog/${blog.slug}`
    },
    "keywords": (blog.tags || []).join(", ")
  };

  return (
    <>
      {/* Search Engine JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="blog-detail">
        <div className="blog-container">
          <Link href="/blog" className="blog-back">
            <ArrowLeft size={16} /> Back to All Articles
          </Link>

          <header className="blog-header">
            <div className="blog-category-pill">
              <Sparkles size={13} />
              <span>{blog.category || "Wealth Advisory"}</span>
            </div>

            <h1 className="blog-title">{blog.title}</h1>
            {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}

            <div className="blog-meta-strip">
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span>
                  By <strong className="blog-author-tag">{blog.author}</strong>
                </span>
                {blog.created_at && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} />
                    {new Date(blog.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} />
                  {readTime} min read
                </span>
              </div>
            </div>
          </header>

          {blog.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={apiUrl(blog.image_url)}
              alt={blog.title}
              className="blog-cover"
              loading="eager"
            />
          )}

          <div
            className="blog-body"
            dangerouslySetInnerHTML={{ __html: blog.body }}
          />

          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags-box">
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-sub, #64748b)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Tag size={15} /> Tags:
              </span>
              {blog.tags.map((t) => (
                <Link href={`/blog?tag=${encodeURIComponent(t)}`} key={t} className="blog-tag-chip">
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <section className="blog-related-section">
              <div className="blog-related-head">
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  Related Perspectives
                </h3>
                <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: "#10b981", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  All articles <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="blog-related-grid">
                {related.map((r) => (
                  <Link href={`/blog/${r.slug}`} key={r.slug} className="blog-rel-card">
                    {r.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={apiUrl(r.image_url)} alt={r.title} className="blog-rel-img" loading="lazy" />
                    )}
                    <div className="blog-rel-body">
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#10b981", marginBottom: 4 }}>
                        {r.category || "Wealth Advisory"}
                      </span>
                      <h4 className="blog-rel-title">{r.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}

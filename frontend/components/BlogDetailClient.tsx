"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Tag, ArrowUpRight, Sparkles, Check } from "lucide-react";
import { fetcher, apiUrl } from "@/lib/api";
import { type Blog, getFallbackBlogBySlug, getAllFallbackBlogs } from "@/lib/blogData";
import "@/app/(site)/blog/[slug]/blog-detail.css";

interface BlogDetailClientProps {
  slug: string;
  initialBlog?: Blog | null;
}

export default function BlogDetailClient({ slug, initialBlog }: BlogDetailClientProps) {
  const fallback = getFallbackBlogBySlug(slug);
  const [blog, setBlog] = useState<Blog | null>(initialBlog || fallback);
  const [allBlogs, setAllBlogs] = useState<Blog[]>(getAllFallbackBlogs());
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!initialBlog && !fallback);

  useEffect(() => {
    let killed = false;

    // Fetch the specific blog live
    fetcher<{ item: Blog }>(`/api/blogs/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!killed && res?.item) {
          setBlog(res.item);
        }
      })
      .catch(() => {
        // Keep initial or fallback if API fails
      })
      .finally(() => {
        if (!killed) setLoading(false);
      });

    // Fetch all blogs for related articles
    fetcher<{ items: Blog[] }>("/api/blogs")
      .then((res) => {
        if (!killed && res?.items?.length) {
          setAllBlogs(res.items);
        }
      })
      .catch(() => {});

    return () => {
      killed = true;
    };
  }, [slug]);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://finvoq.com/blog/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!blog) {
    if (loading) {
      return (
        <article className="blog-detail" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="blog-spinner" style={{ width: 36, height: 36, border: "3px solid rgba(16,185,129,0.2)", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </article>
      );
    }

    return (
      <article className="blog-detail">
        <div className="blog-container" style={{ textAlign: "center", padding: "80px 24px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Article Not Found</h1>
          <p style={{ color: "var(--ink-sub, #64748b)", marginBottom: 24 }}>
            The article you are looking for does not exist or has been moved.
          </p>
          <Link href="/blog" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} /> Back to All Articles
          </Link>
        </div>
      </article>
    );
  }

  const related = allBlogs.filter((b) => b.slug !== blog.slug).slice(0, 3);
  const wordCount = (blog.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 180));

  const coverImg = blog.image_url
    ? blog.image_url.startsWith("http") || blog.image_url.startsWith("/")
      ? blog.image_url
      : apiUrl(blog.image_url)
    : "/images/blogs/blog-1.jpg";

  return (
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
                By <strong className="blog-author-tag">{blog.author || "Finvoq Admin"}</strong>
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

            <button
              type="button"
              onClick={handleShare}
              className="blog-tag-chip"
              style={{ cursor: "pointer", border: "none", background: copied ? "#10b981" : undefined, color: copied ? "#fff" : undefined }}
              title="Copy link to article"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copied ? "Link Copied!" : "Share Article"}</span>
            </button>
          </div>
        </header>

        {coverImg && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={coverImg}
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
              {related.map((r, idx) => {
                const fallbackImg = `/images/blogs/blog-${(idx % 6) + 1}.jpg`;
                const relImg = r.image_url
                  ? r.image_url.startsWith("http") || r.image_url.startsWith("/")
                    ? r.image_url
                    : apiUrl(r.image_url)
                  : fallbackImg;

                return (
                  <Link href={`/blog/${r.slug}`} key={r.slug} className="blog-rel-card">
                    <div className="blog-rel-img-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={relImg}
                        alt={r.title}
                        className="blog-rel-img"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImg;
                        }}
                      />
                    </div>
                    <div className="blog-rel-body">
                      <span className="blog-rel-cat">
                        {r.category || "Wealth Advisory"}
                      </span>
                      <h4 className="blog-rel-title">{r.title}</h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

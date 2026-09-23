"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Tag, ArrowUpRight, Sparkles, Check, Lock, LogIn } from "lucide-react";
import { fetcher, apiUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { type Blog, getFallbackBlogBySlug, getAllFallbackBlogs } from "@/lib/blogData";
import "@/app/(site)/blog/[slug]/blog-detail.css";

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"
]);

function cleanBlogHtml(html: string): string {
  if (!html) return "";
  let s = html.trim();
  // Strip outer <article ...> ... </article> wrapper if present
  s = s.replace(/^<article(?:\s+[^>]*)?>/i, "").replace(/<\/article>\s*$/i, "").trim();
  // Strip outer <section ...> ... </section> wrapper if present
  s = s.replace(/^<section(?:\s+[^>]*)?>/i, "").replace(/<\/section>\s*$/i, "").trim();
  return s;
}

/**
 * Splits an HTML string into a preview (first ~wordLimit words, ~2-4 lines)
 * and the remainder, cutting only at top-level tag boundaries (depth === 0)
 * so both preview and rest are 100% syntactically balanced and valid HTML.
 */
function splitHtmlBody(rawHtml: string, wordLimit = 35): { preview: string; rest: string } {
  const html = cleanBlogHtml(rawHtml);
  const plainText = html.replace(/<[^>]+>/g, " ");
  const words = plainText.split(/\s+/).filter(Boolean);

  if (words.length <= wordLimit) {
    return { preview: html, rest: "" };
  }

  const tagRegex = /<\/?([a-zA-Z0-9]+)(?:\s+[^>]*)?>/g;
  let wordsSeen = 0;
  let cutIdx = -1;
  let cursor = 0;
  const openTags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const matchIndex = match.index;
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>") || VOID_TAGS.has(tagName);

    // Count words in text chunk between tags
    if (matchIndex > cursor) {
      const textChunk = html.slice(cursor, matchIndex);
      const chunkWords = textChunk.split(/\s+/).filter(Boolean).length;
      wordsSeen += chunkWords;
    }
    cursor = matchIndex + fullTag.length;

    if (isClosing) {
      const lastIdx = openTags.lastIndexOf(tagName);
      if (lastIdx !== -1) {
        openTags.splice(lastIdx, 1);
      }
    } else if (!isSelfClosing) {
      openTags.push(tagName);
    }

    // Cut at the first top-level tag boundary (depth === 0) after wordLimit
    if (wordsSeen >= wordLimit && openTags.length === 0) {
      cutIdx = cursor;
      break;
    }
  }

  // Fallback if no clean depth===0 boundary was reached
  if (cutIdx === -1) {
    cutIdx = Math.min(html.length, 1200);
    const closingStr = [...openTags].reverse().map((t) => `</${t}>`).join("");
    return {
      preview: html.slice(0, cutIdx) + closingStr,
      rest: html.slice(cutIdx)
    };
  }

  return {
    preview: html.slice(0, cutIdx).trim(),
    rest: html.slice(cutIdx).trim()
  };
}

interface BlogDetailClientProps {
  slug: string;
  initialBlog?: Blog | null;
}

export default function BlogDetailClient({ slug, initialBlog }: BlogDetailClientProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const fallback = getFallbackBlogBySlug(slug);
  const [blog, setBlog] = useState<Blog | null>(initialBlog || fallback);
  const [allBlogs, setAllBlogs] = useState<Blog[]>(getAllFallbackBlogs());
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!initialBlog && !fallback);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && !!user;

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

  // Smart relevance ranking for related articles
  const related = useMemo(() => {
    if (!blog) return [];

    const candidates = allBlogs.filter((b) => b.slug !== blog.slug);
    if (candidates.length === 0) return [];

    const currentCategory = (blog.category || "").toLowerCase().trim();
    const currentTags = new Set((blog.tags || []).map((t) => t.toLowerCase().trim()));
    const stopWords = new Set(["the", "and", "for", "with", "into", "from", "when", "that", "this", "your", "about", "what", "how", "over"]);
    const currentWords = (blog.title || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const scored = candidates.map((candidate) => {
      let score = 0;

      // 1. Same category is primary (+20)
      const candidateCat = (candidate.category || "").toLowerCase().trim();
      if (candidateCat && candidateCat === currentCategory) {
        score += 20;
      }

      // 2. Matching tags (+10 each)
      if (candidate.tags && candidate.tags.length > 0) {
        candidate.tags.forEach((t) => {
          if (currentTags.has(t.toLowerCase().trim())) {
            score += 10;
          }
        });
      }

      // 3. Matching title or excerpt keywords (+6 / +3)
      const candTitleLower = (candidate.title || "").toLowerCase();
      const candExcerptLower = (candidate.excerpt || "").toLowerCase();
      currentWords.forEach((word) => {
        if (candTitleLower.includes(word)) {
          score += 6;
        } else if (candExcerptLower.includes(word)) {
          score += 3;
        }
      });

      // 4. Recency tiebreaker
      const candidateTime = new Date(candidate.updated_at || candidate.created_at || 0).getTime();
      const recencyBonus = isNaN(candidateTime) ? 0 : candidateTime / 1e14;
      score += recencyBonus;

      return { candidate, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((s) => s.candidate);
  }, [blog, allBlogs]);

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

  const wordCount = (blog.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 180));

  const coverImg = blog.image_url
    ? blog.image_url.startsWith("http") || blog.image_url.startsWith("/")
      ? blog.image_url
      : apiUrl(blog.image_url)
    : "/images/blogs/blog-1.jpg";

  const articleDate = blog.updated_at || blog.created_at;

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
              {articleDate && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} />
                  {new Date(articleDate).toLocaleDateString("en-IN", {
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

        {/* ── Blog Body: gated for guests ─────────────────── */}
        {(() => {
          if (isLoggedIn) {
            // Authenticated: show full body
            return (
              <>
                <div
                  className="blog-body"
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{ __html: cleanBlogHtml(blog.body) }}
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
              </>
            );
          }

          // Guest: show preview (2-4 lines) + blur with login card floating directly above
          const { preview, rest } = splitHtmlBody(blog.body, 35);
          const nextUrl = `/blog/${slug}`;

          return (
            <>
              {/* Unblurred preview text — limited to 2-4 lines */}
              <div
                className="blog-body blog-preview-body"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: preview }}
              />

              {rest && (
                <div className="blog-gate-container">
                  {/* Blurry text visible underneath */}
                  <div
                    className="blog-gate-blur"
                    aria-hidden="true"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: rest }}
                  />
                  <div className="blog-gate-overlay" />

                  {/* Centered CTA floating directly above the blurred text */}
                  <div className="blog-gate-cta-wrapper">
                    <div className="blog-gate-cta">
                      <div className="blog-gate-icon" aria-hidden="true">
                        <Lock size={26} />
                      </div>
                      <h3 className="blog-gate-heading">Want to read more?</h3>
                      <p className="blog-gate-subtext">
                        Log in or create a free account to unlock the full article and access all our insights.
                      </p>
                      <div className="blog-gate-actions">
                        <Link
                          href={`/login?next=${encodeURIComponent(nextUrl)}`}
                          className="btn btn-primary btn-lg"
                          data-magnetic
                        >
                          <LogIn size={16} style={{ marginRight: 6 }} />
                          Log in
                        </Link>
                        <Link
                          href={`/signup?next=${encodeURIComponent(nextUrl)}`}
                          className="btn btn-outline btn-lg"
                          data-magnetic
                        >
                          Create an account
                        </Link>
                      </div>
                      <p className="blog-gate-foot">
                        It takes under a minute. We&apos;ll never share your details.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Related Articles Section — only for authenticated users */}
      {isLoggedIn && related.length > 0 && (
        <section className="blog-related-section">
          <div className="blog-related-container">
            <div className="blog-related-head">
              <div>
                <span className="blog-related-eyebrow">
                  <Sparkles size={13} /> Recommended Reading
                </span>
                <h3 className="blog-related-heading">
                  Related Perspectives
                </h3>
              </div>
              <Link href="/blog" className="blog-related-all-btn">
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
                const rDate = r.updated_at || r.created_at;
                const rWordCount = (r.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
                const rReadTime = Math.max(2, Math.ceil(rWordCount / 180));

                return (
                  <Link href={`/blog/${r.slug}`} key={r.slug} className="blog-rel-card">
                    <div className="blog-rel-img-wrap">
                      <span className="blog-rel-cat-badge">
                        {r.category || "Wealth Advisory"}
                      </span>
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
                      <div className="blog-rel-meta">
                        <span className="blog-rel-author">{r.author || "Finvoq Admin"}</span>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                          {rDate && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Calendar size={12} />
                              {new Date(rDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} />
                            {rReadTime} min
                          </span>
                        </div>
                      </div>
                      <h4 className="blog-rel-title">{r.title}</h4>
                      {r.excerpt && <p className="blog-rel-excerpt">{r.excerpt}</p>}
                      <div className="blog-rel-footer">
                        <span className="blog-rel-read">
                          Read article <ArrowUpRight size={13} />
                        </span>
                        {r.tags && r.tags.length > 0 && (
                          <div className="blog-rel-tags">
                            {r.tags.slice(0, 2).map((t) => (
                              <span key={t} className="blog-rel-tag">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

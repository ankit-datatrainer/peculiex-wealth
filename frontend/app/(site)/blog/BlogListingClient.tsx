"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetcher, apiUrl } from "@/lib/api";
import { type Blog, DEFAULT_BLOGS } from "@/lib/blogData";
import { ArrowUpRight, Search, Sparkles, Tag, Clock } from "lucide-react";
import "./blog.css";

export default function BlogListingClient() {
  const [blogs, setBlogs] = useState<Blog[]>(DEFAULT_BLOGS);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Blog[] }>("/api/blogs")
      .then((j) => {
        if (!killed && j?.items?.length) setBlogs(j.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!killed) setLoading(false);
      });
    return () => {
      killed = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["all", ...Array.from(set)];
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      if (selectedCat !== "all" && b.category !== selectedCat) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [blogs, selectedCat, search]);

  return (
    <div className="blog-page">
      <div className="blog-container">
        <header className="blog-page-header">
          <span className="blog-page-eyebrow">
            <Sparkles size={14} /> Finvoq Research & Insights
          </span>
          <h1 className="blog-page-title">Perspectives that shape wealth.</h1>
          <p className="blog-page-sub">
            Expert market commentary, multi-asset allocation strategies, and pre-IPO intelligence from SEBI-registered specialists.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="blog-filter-bar">
          <div className="blog-cat-chips">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`blog-cat-chip ${selectedCat === c ? "active" : ""}`}
                onClick={() => setSelectedCat(c)}
              >
                {c === "all" ? "All Topics" : c}
              </button>
            ))}
          </div>

          <div className="blog-search-box">
            <Search
              size={15}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              className="blog-search-input"
              placeholder="Search articles & tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="blog-spinner" />
        ) : filtered.length === 0 ? (
          <div className="blog-empty">
            <p>No blog posts found matching your filter.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedCat("all");
                setSearch("");
              }}
              style={{ marginTop: 12 }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map((b) => {
              const wordCount = (b.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
              const readTime = Math.max(2, Math.ceil(wordCount / 180));
              const coverImg = b.image_url
                ? b.image_url.startsWith("http") || b.image_url.startsWith("/")
                  ? b.image_url
                  : apiUrl(b.image_url)
                : "/images/blogs/blog-1.jpg";

              return (
                <Link
                  key={b.id || b.slug}
                  href={`/blog/${b.slug}`}
                  className="blog-card"
                  aria-label={`Read: ${b.title}`}
                >
                  <div className="blog-card-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImg}
                      alt={b.title}
                      className="blog-card-img"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/blogs/blog-1.jpg";
                      }}
                    />
                    <span className="blog-card-category-badge">
                      {b.category || "Wealth Advisory"}
                    </span>
                  </div>

                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span className="blog-card-author">{b.author || "Finvoq Admin"}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> {readTime} min
                      </span>
                    </div>

                    <h3>{b.title}</h3>
                    {b.excerpt && <p className="blog-card-excerpt">{b.excerpt}</p>}

                    <div className="blog-card-footer">
                      <span className="blog-card-read">
                        Read article <ArrowUpRight size={14} />
                      </span>
                      {b.tags && b.tags.length > 0 && (
                        <div className="blog-card-tags">
                          {b.tags.slice(0, 2).map((t) => (
                            <span key={t} className="blog-card-tag">
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
        )}
      </div>
    </div>
  );
}

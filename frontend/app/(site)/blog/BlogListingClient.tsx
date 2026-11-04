"use client";

import { useEffect, useMemo, useState } from "react";
import { fetcher } from "@/lib/api";
import { type Blog, DEFAULT_BLOGS } from "@/lib/blogData";
import { useContent } from "@/lib/content";
import { Search, Sparkles } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import "./blog.css";

export default function BlogListingClient() {
  // Page copy only (Content Manager → Blog listing); the posts come from the
  // Blog manager via /api/blogs.
  const cms = useContent("blog");
  const header = (field: string, fallback: string) => cms.t("header", field, fallback);
  const copy = (field: string, fallback: string) => cms.t("listing", field, fallback);

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
            <Sparkles size={14} /> {header("eyebrow", "Finvoq Research & Insights")}
          </span>
          <h1 className="blog-page-title">{header("title", "Perspectives that shape wealth.")}</h1>
          <p className="blog-page-sub">
            {header(
              "subtitle",
              "Expert market commentary, multi-asset allocation strategies, and pre-IPO intelligence from SEBI-registered specialists."
            )}
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
                {c === "all" ? copy("allTopicsLabel", "All Topics") : c}
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
              placeholder={copy("searchPlaceholder", "Search articles & tags…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="blog-spinner" />
        ) : filtered.length === 0 ? (
          <div className="blog-empty">
            <p>{copy("emptyText", "No blog posts found matching your filter.")}</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedCat("all");
                setSearch("");
              }}
              style={{ marginTop: 12 }}
            >
              {copy("resetLabel", "Reset Filters")}
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map((b) => (
              <BlogCard key={b.id || b.slug} blog={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

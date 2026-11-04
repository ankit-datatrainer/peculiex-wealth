"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { type Blog } from "@/lib/blogData";
import { useContent, imgSrc } from "@/lib/content";
import "./BlogCard.css";

export default function BlogCard({ blog: b }: { blog: Blog }) {
  const cms = useContent("blog");
  const copy = (field: string, fallback: string) => cms.t("listing", field, fallback);
  const fallbackImage = imgSrc(copy("fallbackImage", "/images/blogs/blog-1.jpg"));
  const wordCount = (b.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 180));
  const coverImg = b.image_url
    ? b.image_url.startsWith("http") || b.image_url.startsWith("/")
      ? b.image_url
      : apiUrl(b.image_url)
    : fallbackImage;

  return (
    <Link
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
            const img = e.currentTarget as HTMLImageElement;
            // Guard against a loop when the fallback itself is broken.
            if (!img.src.endsWith(fallbackImage)) img.src = fallbackImage;
          }}
        />
      </div>

      <div className="blog-card-body">
        {/* Category sits in the card body, not over the cover, so it
            never hides the image's own headline. */}
        <span className="blog-card-category-badge">
          {b.category || copy("fallbackCategory", "Wealth Advisory")}
        </span>
        <div className="blog-card-meta">
          <span className="blog-card-author">{b.author || copy("fallbackAuthor", "Finvoq Admin")}</span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            {(b.created_at || b.updated_at) && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} />
                {new Date((b.created_at || b.updated_at)!).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} /> {readTime} min
            </span>
          </div>
        </div>

        <h3 className="blog-card-title">{b.title}</h3>
        {b.excerpt && <p className="blog-card-excerpt">{b.excerpt}</p>}

        <div className="blog-card-footer">
          <span className="blog-card-read">
            {copy("readLabel", "Read article")} <ArrowUpRight size={13} />
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
}

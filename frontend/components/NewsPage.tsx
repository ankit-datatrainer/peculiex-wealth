"use client";

import { useContent, accent } from "@/lib/content";
import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetcher, apiUrl } from "@/lib/api";
import "./news-portal.css";

/** Render a *starred* CMS heading with the <em> accent the design uses. */
function heading(text: string) {
  return accent(text).map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <em key={i}>{p.em}</em>
  );
}

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: number;
}

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  author: string;
  category?: string;
  created_at?: string;
};

const DEFAULT_NEWS_BLOGS: BlogItem[] = [
  {
    id: "b1",
    title: "Why Advisory-Led Investing Beats Pure DIY in 2026",
    slug: "advisory-led-investing-beats-diy-2026",
    excerpt: "Navigating volatile markets requires discipline and expert curation. Here's why personalized advisory creates durable wealth over pure DIY trading.",
    image_url: "/images/blogs/blog-1.jpg",
    author: "Finvoq Admin",
    category: "Wealth Advisory"
  },
  {
    id: "b2",
    title: "Pre-IPO & Unlisted Equities: The New Frontier of Alpha",
    slug: "pre-ipo-unlisted-equities-alpha",
    excerpt: "Discover how early access to India's high-growth private champions before their IPO can deliver outsized portfolio returns.",
    image_url: "/images/blogs/blog-2.jpg",
    author: "Finvoq Admin",
    category: "Private Equity & Pre-IPO"
  },
  {
    id: "b3",
    title: "The Art of Multi-Asset Allocation: Stocks, Bonds & Alternatives",
    slug: "art-of-multi-asset-allocation",
    excerpt: "Why true diversification goes beyond large-cap equities. A comprehensive framework for balancing risk and reward across 10+ asset classes.",
    image_url: "/images/blogs/blog-3.jpg",
    author: "Finvoq Admin",
    category: "Portfolio Strategy"
  },
  {
    id: "b4",
    title: "Mastering Market Volatility: A Systematic Compounding Playbook",
    slug: "mastering-market-volatility-playbook",
    excerpt: "How institutional investors use market corrections to strategically rebalance and accelerate compound interest over decades.",
    image_url: "/images/blogs/blog-4.jpg",
    author: "Finvoq Admin",
    category: "Market Insights"
  },
  {
    id: "b5",
    title: "Fixed Income Reimagined: High-Yield Corporate Bonds & FDs",
    slug: "fixed-income-high-yield-bonds-fds",
    excerpt: "Secure steady, predictable cash flows with senior secured bonds and AAA-rated fixed income securities in a shifting interest rate cycle.",
    image_url: "/images/blogs/blog-5.jpg",
    author: "Finvoq Admin",
    category: "Fixed Income & Debt"
  },
  {
    id: "b6",
    title: "Portfolio Management Services (PMS) vs Mutual Funds",
    slug: "pms-vs-mutual-funds-guide",
    excerpt: "Unpacking the key differences in portfolio concentration, fee structures, and customization for high-net-worth investors.",
    image_url: "/images/blogs/blog-6.jpg",
    author: "Finvoq Admin",
    category: "Investment Vehicles"
  }
];

const PAGE_SIZE = 30;

function relativeTime(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function absoluteTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function NewsPage() {
  const cms = useContent("news");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All");
  const [blogs, setBlogs] = useState<BlogItem[]>(DEFAULT_NEWS_BLOGS);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: BlogItem[] }>("/api/blogs")
      .then((j) => {
        if (!killed && j?.items?.length) setBlogs(j.items);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

  const { data, error, isLoading } = useSWR<{ items: NewsItem[] }>(
    "/api/markets/news/general",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 5 * 60_000,
      dedupingInterval: 5 * 60_000
    }
  );

  const items = (data?.items ?? []).filter((i) => i.source !== "Economic Times");

  // Source chips, ordered by how much each publisher actually contributes.
  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => counts.set(i.source, (counts.get(i.source) ?? 0) + 1));
    return ["All", ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([s]) => s)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (source !== "All" && i.source !== source) return false;
      if (!q) return true;
      return (
        i.headline.toLowerCase().includes(q) ||
        (i.summary ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query, source]);

  // Snapshot strip — computed from the feed, never hand-typed.
  const stats = useMemo(() => {
    const publishers = new Set(items.map((i) => i.source)).size;
    const latest = items.reduce((m, i) => Math.max(m, i.publishedAt), 0);
    const today = items.filter(
      (i) => Date.now() - i.publishedAt < 24 * 60 * 60_000
    ).length;
    return { total: items.length, publishers, latest, today };
  }, [items]);

  const [lead, ...rest] = filtered;
  const shown = rest.slice(0, visible);

  const resetTo = (fn: () => void) => {
    fn();
    setVisible(PAGE_SIZE);
  };

  return (
    <main className="np">
      <div className="container">
        {/* Framed module: the whole feed reads as one embedded unit */}
        <div className="np-module">
          <header className="np-head">
            <div>
              <div className="np-eyebrow">
                <span className="np-live" aria-hidden="true" />
                Live Intelligence & Market Insights
              </div>
              <h1 className="np-title">
                {heading(cms.t("hero", "title", "Markets, *decoded.*"))}
              </h1>
              <p className="np-sub">
                {cms.t(
                  "hero",
                  "subtitle",
                  "Strategic financial perspectives, in-depth blogs, and real-time market headlines aggregated from India's leading financial networks."
                )}
              </p>
            </div>
            {!isLoading && !error && stats.latest > 0 && (
              <span className="np-asof">
                <span className="np-asof-dot" />
                Updated {relativeTime(stats.latest)}
              </span>
            )}
          </header>

          {/* ── 1. Featured Blogs & Research Section (Displayed First) ── */}
          <section className="np-blog-featured">
            <div className="np-blog-featured-head">
              <div>
                <span className="np-blog-featured-eyebrow">From Our Blog</span>
                <h2 className="np-blog-featured-title">Finvoq Wealth Blogs & Market Perspectives</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--color-text-muted)" }}>
                  In-depth analysis, asset allocation strategies, and actionable market intelligence.
                </p>
              </div>
              <Link href="/blog" className="np-blog-see-more-btn">
                <span>See more</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="np-blog-featured-grid">
              {blogs.slice(0, 6).map((b) => (
                <Link href={`/blog/${b.slug}`} key={b.slug} className="np-blog-featured-card">
                  <div className="np-blog-featured-img-wrap">
                    <img
                      src={b.image_url ? apiUrl(b.image_url) : "/images/blogs/blog-1.jpg"}
                      alt={b.title}
                      className="np-blog-featured-img"
                      loading="lazy"
                    />
                    {b.category && (
                      <span className="np-blog-featured-cat-tag">
                        {b.category}
                      </span>
                    )}
                  </div>
                  <div className="np-blog-featured-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span className="np-blog-featured-author">{b.author || "Finvoq Admin"}</span>
                      <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>5 min read</span>
                    </div>
                    <h3 className="np-blog-featured-card-title">{b.title}</h3>
                    {b.excerpt && <p className="np-blog-featured-excerpt">{b.excerpt}</p>}
                    <span className="np-blog-featured-read">
                      Read full article <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom See More Bar */}
            <div className="np-blog-bottom-bar">
              <div>
                <strong style={{ display: "block", fontSize: 14, color: "var(--color-text)", marginBottom: 2 }}>
                  Want to explore more wealth strategies?
                </strong>
                <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                  Browse our complete archive of in-depth guides, pre-IPO breakdowns, and bond research.
                </span>
              </div>
              <Link href="/blog" className="np-blog-see-more-btn primary">
                <span>See more blogs</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>

          {/* ── 2. Market News Headlines Section (Displayed at Bottom) ── */}
          <div style={{ marginTop: 44, paddingTop: 32, borderTop: "1px solid var(--color-divider)" }}>
            <div style={{ marginBottom: 20 }}>
              <span className="np-eyebrow" style={{ marginBottom: 4 }}>
                <span className="np-live" aria-hidden="true" />
                Live Feed
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                Real-Time Market News
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--color-text-muted)" }}>
                Latest breaking financial headlines, regulatory updates, and corporate developments across India.
              </p>
            </div>
          </div>

          {!isLoading && !error && items.length > 0 && (
            <div className="np-stats">
              <div className="np-stat">
                <p className="np-stat-label">Stories</p>
                <div className="np-stat-value">{stats.total}</div>
                <p className="np-stat-note">in the live feed</p>
              </div>
              <div className="np-stat">
                <p className="np-stat-label">Publishers</p>
                <div className="np-stat-value">{stats.publishers}</div>
                <p className="np-stat-note">Indian financial media</p>
              </div>
              <div className="np-stat np-stat--hero">
                <p className="np-stat-label">Last 24 hours</p>
                <div className="np-stat-value">{stats.today}</div>
                <p className="np-stat-note">new headlines</p>
              </div>
              <div className="np-stat">
                <p className="np-stat-label">Refresh</p>
                <div className="np-stat-value">
                  5<span className="np-stat-unit">min</span>
                </div>
                <p className="np-stat-note">automatic</p>
              </div>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="np-controls">
              <div className="np-search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => resetTo(() => setQuery(e.target.value))}
                  placeholder="Search headlines…"
                  aria-label="Search headlines"
                />
              </div>
              <div className="np-chips" role="group" aria-label="Filter by source">
                {sources.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="np-chip"
                    data-active={source === s}
                    onClick={() => resetTo(() => setSource(s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="np-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div className="np-card np-skel" key={i}>
                  <div className="np-skel-line" style={{ width: "30%", height: 11 }} />
                  <div className="np-skel-line" style={{ width: "95%", height: 18 }} />
                  <div className="np-skel-line" style={{ width: "70%", height: 18 }} />
                  <div className="np-skel-line" style={{ width: "100%", height: 12, opacity: 0.5 }} />
                  <div className="np-skel-line" style={{ width: "85%", height: 12, opacity: 0.5 }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="np-state">
              <h3>Couldn&apos;t load the news feed</h3>
              <p>The feed is temporarily unreachable. Please try again shortly.</p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="np-state">
              <h3>No stories match your filters</h3>
              <p>Try a different search term or clear the source filter.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => resetTo(() => { setQuery(""); setSource("All"); })}
              >
                Clear filters
              </button>
            </div>
          )}

          {!isLoading && !error && lead && (
            <a
              className="np-lead"
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="np-lead-body">
                <div className="np-meta">
                  <span className="np-source">{lead.source}</span>
                  <span className="np-dot" />
                  <time dateTime={new Date(lead.publishedAt).toISOString()} title={absoluteTime(lead.publishedAt)}>
                    {relativeTime(lead.publishedAt)}
                  </time>
                </div>
                <h2 className="np-lead-title">{lead.headline}</h2>
                {lead.summary && <p className="np-lead-sum">{lead.summary}</p>}
                <span className="np-read">Read on {lead.source} →</span>
              </div>
            </a>
          )}

          {!isLoading && !error && shown.length > 0 && (
            <div className="np-grid">
              {shown.map((item) => (
                <a
                  className="np-card"
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="np-meta">
                    <span className="np-source">{item.source}</span>
                    <span className="np-dot" />
                    <time dateTime={new Date(item.publishedAt).toISOString()} title={absoluteTime(item.publishedAt)}>
                      {relativeTime(item.publishedAt)}
                    </time>
                  </div>
                  <h3 className="np-card-title">{item.headline}</h3>
                  {item.summary && <p className="np-card-sum">{item.summary}</p>}
                  <span className="np-read">Read on {item.source} →</span>
                </a>
              ))}
            </div>
          )}

          {!isLoading && !error && rest.length > visible && (
            <div className="np-more">
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load more stories
              </button>
              <span className="np-count">
                Showing {shown.length} of {rest.length}
              </span>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <p className="np-attrib">
              Headlines aggregated from{" "}
              <a href="https://pulse.zerodha.com/" target="_blank" rel="noopener noreferrer">
                Zerodha Pulse
              </a>
              . Every story links to the publisher that reported it, and all rights
              remain with them. Finvoq does not author or edit this coverage.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

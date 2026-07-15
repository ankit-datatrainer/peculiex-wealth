"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import "./news-portal.css";

interface NewsItem {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  publishedAt: number;
}

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
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All");

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

  const items = data?.items ?? [];

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

  const [lead, ...rest] = filtered;
  const shown = rest.slice(0, visible);

  const resetTo = (fn: () => void) => {
    fn();
    setVisible(PAGE_SIZE);
  };

  return (
    <main className="np">
      <div className="container">
        <header className="np-head">
          <div className="np-eyebrow">
            <span className="np-live" aria-hidden="true" />
            Market News
          </div>
          <h1 className="np-title">
            Every headline that <em>moves the market.</em>
          </h1>
          <p className="np-sub">
            Financial and market news from India&apos;s leading publishers, aggregated
            in one place and refreshed through the day.
          </p>
        </header>

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
          <Link className="np-lead" href={`/news/${lead.slug}`}>
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
              <span className="np-read">Read story →</span>
            </div>
          </Link>
        )}

        {!isLoading && !error && shown.length > 0 && (
          <div className="np-grid">
            {shown.map((item) => (
              <Link className="np-card" key={item.id} href={`/news/${item.slug}`}>
                <div className="np-meta">
                  <span className="np-source">{item.source}</span>
                  <span className="np-dot" />
                  <time dateTime={new Date(item.publishedAt).toISOString()} title={absoluteTime(item.publishedAt)}>
                    {relativeTime(item.publishedAt)}
                  </time>
                </div>
                <h3 className="np-card-title">{item.headline}</h3>
                {item.summary && <p className="np-card-sum">{item.summary}</p>}
                <span className="np-read">Read story →</span>
              </Link>
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
    </main>
  );
}

"use client";

import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

function fullTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  // The feed is already cached by SWR for the index page, so resolving the
  // story from it keeps this page instant and avoids a second round trip.
  const { data, error, isLoading } = useSWR<{ items: NewsItem[] }>(
    "/api/markets/news/general",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5 * 60_000 }
  );

  const items = data?.items ?? [];
  const item = items.find((i) => i.slug === params.slug);
  const related = items.filter((i) => i.slug !== params.slug).slice(0, 6);

  return (
    <main className="np np-article">
      <div className="container">
        <div className="np-back">
          <Link href="/news">
            <ArrowLeft size={15} />
            Back to Market News
          </Link>
        </div>

        {isLoading && (
          <div className="np-art-grid">
            <div>
              <div className="np-skel-line" style={{ width: "25%", height: 12, marginBottom: 18 }} />
              <div className="np-skel-line" style={{ width: "95%", height: 34, marginBottom: 10 }} />
              <div className="np-skel-line" style={{ width: "70%", height: 34, marginBottom: 26 }} />
              <div className="np-skel-line" style={{ width: "100%", height: 14, marginBottom: 8 }} />
              <div className="np-skel-line" style={{ width: "92%", height: 14, marginBottom: 8 }} />
              <div className="np-skel-line" style={{ width: "80%", height: 14 }} />
            </div>
          </div>
        )}

        {!isLoading && (error || !item) && (
          <div className="np-state">
            <h3>Story not available</h3>
            <p>
              This story is no longer in the current feed — headlines roll off as
              newer ones arrive.
            </p>
            <Link href="/news" className="btn btn-primary">
              Browse latest news
            </Link>
          </div>
        )}

        {!isLoading && item && (
          <div className="np-art-grid">
            <article className="np-art-main">
              <div className="np-meta">
                <span className="np-source">{item.source}</span>
                <span className="np-dot" />
                <time dateTime={new Date(item.publishedAt).toISOString()}>
                  {relativeTime(item.publishedAt)}
                </time>
              </div>

              <h1 className="np-art-title">{item.headline}</h1>

              <p className="np-art-date">{fullTime(item.publishedAt)}</p>

              {item.summary && <p className="np-art-lead">{item.summary}</p>}

              {/* The feed syndicates the headline and this summary. The full
                  article text belongs to the publisher, so we hand off to them
                  for the rest rather than reproducing it here. */}
              <a
                className="np-art-cta"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <strong>Continue reading at {item.source}</strong>
                  <span>
                    This story was reported by {item.source}. Open the full
                    article on their site.
                  </span>
                </div>
                <span className="np-art-cta-arrow" aria-hidden="true">
                  →
                </span>
              </a>

              <p className="np-art-note">
                Finvoq aggregates headlines from India&apos;s leading financial
                publishers. We don&apos;t author or edit this coverage, and all
                rights remain with {item.source}.
              </p>
            </article>

            <aside className="np-art-side">
              <h3 className="np-side-title">Latest stories</h3>
              <div className="np-side-list">
                {related.map((r) => (
                  <Link key={r.id} href={`/news/${r.slug}`} className="np-side-card">
                    <div className="np-meta">
                      <span className="np-source">{r.source}</span>
                      <span className="np-dot" />
                      <time dateTime={new Date(r.publishedAt).toISOString()}>
                        {relativeTime(r.publishedAt)}
                      </time>
                    </div>
                    <h4>{r.headline}</h4>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import Link from "next/link";
import "./news.css"; 

interface NewsItem {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  source: string;
  image: string;
  publishedAt: number;
}

export default function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;
  const FALLBACK_IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";

  const { data, error, isLoading } = useSWR<{ items: NewsItem[] }>(
    "/api/markets/news/general",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000 // 10 mins
    }
  );

  const totalItems = data?.items?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = data?.items?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  return (
    <main className="news-page-container">
      <div className="container">
        <header className="news-header section-header">
          <h1>Indian Market News</h1>
          <p className="subtitle">
            The latest financial updates, stock market trends, and economic news.
          </p>
        </header>

        {isLoading && (
          <div className="news-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="news-card" style={{ pointerEvents: "none" }}>
                <div className="news-card-image" style={{ background: "var(--color-border)", animation: "pulse 1.5s infinite ease-in-out" }}></div>
                <div className="news-card-content">
                  <div style={{ width: "40%", height: 12, background: "var(--color-border)", borderRadius: 4, marginBottom: 12, animation: "pulse 1.5s infinite ease-in-out" }} />
                  <div style={{ width: "90%", height: 20, background: "var(--color-border)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite ease-in-out" }} />
                  <div style={{ width: "75%", height: 20, background: "var(--color-border)", borderRadius: 4, marginBottom: 16, animation: "pulse 1.5s infinite ease-in-out" }} />
                  <div style={{ width: "100%", height: 14, background: "var(--color-border)", borderRadius: 4, marginBottom: 6, opacity: 0.5, animation: "pulse 1.5s infinite ease-in-out" }} />
                  <div style={{ width: "80%", height: 14, background: "var(--color-border)", borderRadius: 4, opacity: 0.5, animation: "pulse 1.5s infinite ease-in-out" }} />
                </div>
              </div>
            ))}
            <style jsx>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        )}

        {error && (
          <div className="news-error">
            <p>Failed to load news. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && totalItems === 0 && (
          <div className="news-empty">
            <p>No recent news found at the moment.</p>
          </div>
        )}

        {!isLoading && !error && totalItems > 0 && (
          <>
            <div className="news-grid">
              {paginatedItems.map((item, i) => {
                // If it's the first item on the first page, make it featured
                const isFeatured = currentPage === 1 && i === 0;
                return (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className={`news-card ${isFeatured ? "featured-news" : ""}`}
                  >
                    <div className="news-card-image">
                      <img src={item.image || FALLBACK_IMG} alt="" loading="lazy" />
                    </div>
                    <div className="news-card-content">
                      <div className="news-meta">

                        <span className="news-date">
                          {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <h3 className="news-headline">{item.headline}</h3>
                      {item.summary && <p className="news-summary">{item.summary}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="news-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import Link from "next/link";
import "./news.css";
import { ArrowLeft } from "lucide-react";

interface ArticleData {
  title: string;
  image: string;
  paragraphs: string[];
  source: string;
  url: string;
}

interface SidebarNewsItem {
  id: string;
  slug: string;
  headline: string;
  source: string;
  url: string;
  image: string;
  publishedAt: number;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [mounted, setMounted] = useState(false);
  const FALLBACK_IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the article content using the clean slug
  const { data, error, isLoading } = useSWR<{ article: ArticleData }>(
    params?.slug ? `/api/markets/news/article?slug=${encodeURIComponent(params.slug)}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't re-fetch while reading
      dedupingInterval: 600000 // 10 minutes
    }
  );

  // Fetch some trending news for the sidebar
  const { data: trendingData } = useSWR<{ items: SidebarNewsItem[] }>(
    "/api/markets/news/general",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000 // 10 mins
    }
  );

  if (!mounted) return null;

  return (
    <main className="article-view-container">
      <div className="container">
        
        {/* Navigation Header */}
        <div className="article-nav-header">
          <Link href="/news" className="article-back-btn">
            <ArrowLeft className="back-arrow-icon" />
            Back to Market News
          </Link>
        </div>

        <div className="article-layout-grid">
          {/* Main Reading Area */}
          <article className="article-main-content">
            {isLoading && (
              <div className="article-skeleton">
                <div className="skeleton-badge"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-title short"></div>
                <div className="skeleton-meta"></div>
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            )}

            {error && (
              <div className="article-error-state">
                <div className="error-icon">⚠️</div>
                <h2>Unable to load article</h2>
                <p>We could not fetch this article directly. The link might be expired or unsupported.</p>
                <Link href="/news" className="original-fallback-btn">
                  Return to News
                </Link>
              </div>
            )}

            {data?.article && (
              <>
                <div className="article-meta-wrapper">
                  {data.article.paragraphs && data.article.paragraphs.length > 0 && (

                    <span className="article-reading-time">
                      ⏱️ {Math.max(1, Math.ceil((data.article.paragraphs.join(" ").length) / 1000))} min read
                    </span>
                  )}
                </div>
                
                <h1 className="article-title-header">{data.article.title}</h1>

                <div className="article-hero-image">
                  <img src={data.article.image || FALLBACK_IMG} alt={data.article.title} />
                </div>

                <div className="article-body-text">
                  {data.article.paragraphs?.map((p, i) => (
                    <p key={i} className="article-para">{p}</p>
                  ))}
                </div>

                <div className="article-reading-footer">
                  {data.article.url && (
                    <p>
                      Read the original article on{" "}
                      <a href={data.article.url} target="_blank" rel="noopener noreferrer" className="read-original-anchor">
                        the source website
                      </a>
                    </p>
                  )}
                  <p>Content parsed for distraction-free reading.</p>
                </div>
              </>
            )}
          </article>

          {/* Sidebar Area */}
          <aside className="article-sidebar">
            <h3 className="sidebar-section-title">Trending Market Updates</h3>
            <div className="sidebar-list">
              {trendingData?.items?.slice(0, 5).map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="sidebar-news-card">
                  <div className="sidebar-img-wrapper">
                    <img src={item.image || FALLBACK_IMG} alt="" loading="lazy" />
                  </div>
                  <div className="sidebar-card-content">
                    <h4 className="sidebar-card-headline">{item.headline}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

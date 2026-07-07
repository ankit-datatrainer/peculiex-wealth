"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCompanyLogo, unlistedSlug } from "@/lib/util";
import { fetcher } from "@/lib/api";
import { UNLISTED_FALLBACK, type Unl } from "./Unlisted";
import WatchlistButton, { makeUnlistedSymbol } from "./WatchlistButton";

const TAG_LABEL: Record<Unl["tag"], string> = {
  trend: "Trending",
  avail: "Available",
  lim: "Limited"
};

export default function UnlistedDetail({ slug }: { slug: string }) {
  const [items, setItems] = useState<Unl[]>(UNLISTED_FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Unl[] }>("/api/unlisted")
      .then((j) => {
        if (!killed && j?.items?.length) setItems(j.items);
      })
      .catch(() => {})
      .finally(() => !killed && setLoaded(true));
    return () => {
      killed = true;
    };
  }, []);

  const item = useMemo(
    () => items.find((u) => unlistedSlug(u.name) === slug),
    [items, slug]
  );

  if (!item) {
    return (
      <main className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: 12 }}>
          {loaded ? "Company not found" : "Loading…"}
        </h1>
        {loaded && (
          <>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
              We couldn’t find that unlisted company. It may no longer be in our inventory.
            </p>
            <Link href="/unlisted" className="btn btn-primary">
              ← Back to all unlisted shares
            </Link>
          </>
        )}
      </main>
    );
  }

  const sym = makeUnlistedSymbol(item.name);

  return (
    <main className="unl-detail">
      <div className="container">
        <Link href="/unlisted" className="unl-detail-back">← All unlisted shares</Link>

        <header className="unl-detail-head">
          <div className="unl-detail-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.logo_url ? item.logo_url : getCompanyLogo(item.domain)}
              alt={`${item.name} logo`}
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                t.style.display = "none";
                const fb = t.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
            <span className="unl-logo-fallback" style={{ background: item.brand }}>
              {item.initial}
            </span>
          </div>
          <div className="unl-detail-title">
            <span className={`unl-tag ${item.tag}`} style={{ position: "static" }}>
              {TAG_LABEL[item.tag]}
            </span>
            <h1>{item.name}</h1>
            <div className="sector">{item.sector}</div>
          </div>
          <div className="unl-detail-action">
            <WatchlistButton symbol={sym} name={item.name} price={item.price} kind="unlisted" />
          </div>
        </header>

        <section className="unl-detail-stats">
          <div className="unl-stat">
            <span>Price / Share</span>
            <strong>₹{item.price.toLocaleString("en-IN")}</strong>
          </div>
          <div className="unl-stat">
            <span>Face Value</span>
            <strong>₹{item.iv}</strong>
          </div>
          <div className="unl-stat">
            <span>Sector</span>
            <strong>{item.sector}</strong>
          </div>
          <div className="unl-stat">
            <span>Availability</span>
            <strong>{TAG_LABEL[item.tag]}</strong>
          </div>
        </section>

        <section className="unl-detail-body">
          <h2>About the opportunity</h2>
          <p>
            {item.name} is available as an unlisted / pre-IPO holding through Peculiex’s private-markets desk.
            Shares settle via off-market transfer directly into your demat account, with transparent pricing,
            recent transaction history, and full compliance disclosures shared before purchase.
          </p>
          <h2>What to know before you invest</h2>
          <ul>
            <li>Unlisted shares are illiquid and may carry a lock-in of up to 6 months post-listing.</li>
            <li>Pricing reflects the latest available transaction and can move between funding rounds.</li>
            <li>Minimum ticket sizes and settlement timelines are confirmed on your diligence call.</li>
            <li>Capital gains, stamp duty and GST are computed and declared per SEBI norms.</li>
          </ul>

          <div className="unl-detail-cta">
            <Link href="/get-started" className="btn btn-primary btn-lg" data-magnetic>
              Request a diligence call →
            </Link>
            <a
              href={`/factsheets/unlisted-${slug}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-lg"
            >
              Download factsheet ↓
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

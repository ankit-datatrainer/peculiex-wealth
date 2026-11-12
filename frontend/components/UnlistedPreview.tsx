"use client";
import Link from "next/link";
import { getCompanyLogo } from "@/lib/util";
import { useUnlisted } from "@/lib/useUnlisted";
import { type Unl } from "./Unlisted";
import WatchlistButton, { makeUnlistedSymbol } from "./WatchlistButton";

const TAG_LABEL: Record<Unl["tag"], string> = {
  trend: "Trending",
  avail: "Available",
  lim: "Limited"
};

export default function UnlistedPreview() {
  const { items } = useUnlisted();

  return (
    <section className="preview-sec">
      <div className="container">
        <div className="preview-head reveal">
          <div>
            <div className="label">Unlisted Shares</div>
            <h2>
              Pre-IPO <em>opportunities</em>
            </h2>
          </div>
          <Link href="/unlisted" className="preview-cta">
            View all opportunities →
          </Link>
        </div>

        {/* Small-screen hardening (additive; desktop rules unchanged) */}
        <style jsx global>{`
          .preview-sec .unl-card,
          .preview-sec .unl-stat {
            min-width: 0;
          }
          .preview-sec .unl-card h4,
          .preview-sec .unl-card .sector,
          .preview-sec .unl-stat strong {
            overflow-wrap: anywhere;
          }
          /* overflow-safe tracks; identical to 1fr 1fr for normal content */
          .preview-sec .unl-stats {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
        `}</style>
        <div
          className="unlisted-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }}
        >
          {items.slice(0, 4).map((u) => {
            const sym = makeUnlistedSymbol(u.name);
            return (
              <article
                className="unl-card reveal visible"
                key={u.name}
                style={{ position: "relative" }}
              >
                <span
                  className={`unl-tag ${u.tag}`}
                  style={{ left: 12, right: "auto", top: 18 }}
                >
                  {TAG_LABEL[u.tag]}
                </span>
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1
                  }}
                >
                  <WatchlistButton
                    symbol={sym}
                    name={u.name}
                    price={u.price}
                    kind="unlisted"
                  />
                </div>
                <div className="unl-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      u.logo_url
                        ? u.logo_url
                        : getCompanyLogo(u.domain)
                    }
                    alt={`${u.name} logo`}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                      const fb = target.nextElementSibling as HTMLElement | null;
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                  <span
                    className="unl-logo-fallback"
                    style={{ background: u.brand }}
                  >
                    {u.initial}
                  </span>
                </div>
                <h4>{u.name}</h4>
                <div className="sector">{u.sector}</div>
                <div className="unl-stats">
                  <div className="unl-stat">
                    <span>Price / Share</span>
                    <strong>{u.price > 0 ? `₹${u.price.toLocaleString("en-IN")}` : "Price on request"}</strong>
                  </div>
                  <div className="unl-stat">
                    <span>Face Value</span>
                    <strong className="up">{u.iv && u.iv !== "N/A" ? `₹${u.iv}` : "N/A"}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


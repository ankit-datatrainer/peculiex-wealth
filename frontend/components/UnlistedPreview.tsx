"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompanyLogo } from "@/lib/util";
import { fetcher } from "@/lib/api";
import WatchlistButton, { makeUnlistedSymbol } from "./WatchlistButton";

type Unl = {
  domain: string;
  name: string;
  sector: string;
  brand: string;
  initial: string;
  price: number;
  iv: string;
  tag: "trend" | "avail" | "lim";
  logo_url?: string | null;
};

const FALLBACK: Unl[] = [
  { domain: "oyorooms.com", name: "Oyo Hotels", sector: "Hospitality", brand: "#EE2E24", initial: "O", price: 54, iv: "1", tag: "trend" },
  { domain: "nseindia.com", name: "NSE India", sector: "Exchange", brand: "#F58220", initial: "N", price: 3850, iv: "1", tag: "trend" },
  { domain: "swiggy.com", name: "Swiggy", sector: "Foodtech", brand: "#FC8019", initial: "S", price: 430, iv: "10", tag: "lim" },
  { domain: "tatacapital.com", name: "Tata Capital", sector: "NBFC", brand: "#486AAB", initial: "T", price: 920, iv: "10", tag: "lim" }
];

const TAG_LABEL: Record<Unl["tag"], string> = {
  trend: "Trending",
  avail: "Available",
  lim: "Limited"
};

export default function UnlistedPreview() {
  const [items, setItems] = useState<Unl[]>(FALLBACK);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Unl[] }>("/api/unlisted")
      .then((j) => {
        if (!killed && j?.items?.length) setItems(j.items.slice(0, 4));
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

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

        <div
          className="unlisted-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
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
                    <strong>₹{u.price.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="unl-stat">
                    <span>Face Value</span>
                    <strong className="up">₹{u.iv}</strong>
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


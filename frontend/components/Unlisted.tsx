"use client";
import { useEffect, useState } from "react";
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
  { domain: "oyorooms.com", name: "Oyo Hotels", sector: "Hospitality", brand: "#EE2E24", initial: "O", price: 54, iv: "+12.5%", tag: "trend" },
  { domain: "nseindia.com", name: "NSE India", sector: "Exchange", brand: "#F58220", initial: "N", price: 3850, iv: "+8.2%", tag: "trend" },
  { domain: "pharmeasy.in", name: "Pharmeasy", sector: "Healthtech", brand: "#10847E", initial: "P", price: 8.5, iv: "-3.4%", tag: "avail" },
  { domain: "chennaisuperkings.com", name: "CSK", sector: "Sports", brand: "#FFCD00", initial: "C", price: 204, iv: "+18.6%", tag: "trend" },
  { domain: "boat-lifestyle.com", name: "BOAT", sector: "Consumer Tech", brand: "#111111", initial: "b", price: 1450, iv: "+5.2%", tag: "avail" },
  { domain: "tatacapital.com", name: "Tata Capital", sector: "NBFC", brand: "#486AAB", initial: "T", price: 920, iv: "+9.8%", tag: "lim" },
  { domain: "hdbfs.com", name: "HDB Financial", sector: "NBFC", brand: "#004C8F", initial: "H", price: 1180, iv: "+11.2%", tag: "avail" },
  { domain: "swiggy.com", name: "Swiggy", sector: "Foodtech", brand: "#FC8019", initial: "S", price: 430, iv: "+22.1%", tag: "lim" },
  { domain: "relianceretail.com", name: "Reliance Retail", sector: "Retail", brand: "#0E3F76", initial: "R", price: 1380, iv: "+15.0%", tag: "trend" }
];

const TAG_LABEL: Record<Unl["tag"], string> = {
  trend: "Trending",
  avail: "Available",
  lim: "Limited"
};

export default function Unlisted() {
  const [items, setItems] = useState<Unl[]>(FALLBACK);
  const [filter, setFilter] = useState<"all" | "trend" | "avail" | "lim">("all");

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Unl[] }>("/api/unlisted")
      .then((j) => {
        if (!killed && j?.items?.length) setItems(j.items);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

  const visible = items.filter((u) => filter === "all" || u.tag === filter);

  return (
    <section id="unlisted" className="unlisted">
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">Unlisted Shares</div>
          <h2 className="stitle">
            Private market <em>opportunities</em>
          </h2>
          <p className="sdesc">
            Curated pre-IPO and unlisted share inventory with transparent
            pricing and advisor-assisted purchase flows. Tap the star to add
            any to your watchlist.
          </p>
        </div>

        <div className="filter-bar reveal">
          {(["all", "trend", "avail", "lim"] as const).map((f) => (
            <button
              key={f}
              className={`chip${filter === f ? " active" : ""}`}
              type="button"
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "trend"
                ? "Trending"
                : f === "avail"
                ? "Available"
                : "Limited"}
            </button>
          ))}
        </div>

        <div className="unlisted-grid" id="unlistedGrid">
          {visible.map((u) => {
            const sym = makeUnlistedSymbol(u.name);
            return (
              <article
                className="unl-card reveal visible"
                data-cat={u.tag}
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
                          : `https://logo.clearbit.com/${u.domain}`
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
                    <span>IV (1Y)</span>
                    <strong className="up">{u.iv}</strong>
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


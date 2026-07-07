"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompanyLogo, unlistedSlug } from "@/lib/util";
import { fetcher } from "@/lib/api";
import WatchlistButton, { makeUnlistedSymbol } from "./WatchlistButton";

export type Unl = {
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

export const UNLISTED_FALLBACK: Unl[] = [
  { domain: "sbimf.com", name: "SBI Funds Management Ltd.", sector: "Asset Management", brand: "#0066b3", initial: "S", price: 791, iv: "1", tag: "avail" },
  { domain: "amc.ppfas.com", name: "Parag Parikh Financial Advisory Services", sector: "Asset Management", brand: "#3a9e3a", initial: "P", price: 18050, iv: "10", tag: "lim" },
  { domain: "careinsurance.com", name: "Care Health Insurance Ltd.", sector: "Insurance", brand: "#f37021", initial: "C", price: 117.75, iv: "10", tag: "avail" },
  { domain: "orbisfinancial.in", name: "Orbis Financial Corporation", sector: "Financial Services", brand: "#173a72", initial: "O", price: 394, iv: "10", tag: "trend" },
  { domain: "chennaisuperkings.com", name: "CSK", sector: "Sports", brand: "#FFCD00", initial: "C", price: 254, iv: "0.1", tag: "trend" },
  { domain: "herofincorp.com", name: "Hero Fincorp", sector: "Financial Services", brand: "#e02020", initial: "H", price: 1030, iv: "10", tag: "avail" },
  { domain: "cial.aero", name: "CIAL", sector: "Aviation", brand: "#005a8f", initial: "C", price: 435, iv: "2", tag: "avail" },
  { domain: "incred.com", name: "Incred Holdings", sector: "Financial Services", brand: "#0a2f4d", initial: "I", price: 146, iv: "10", tag: "avail" },
  { domain: "vivriticapital.com", name: "Vivriti Capital", sector: "Financial Services", brand: "#353272", initial: "V", price: 802, iv: "10", tag: "lim" },
  { domain: "veedacr.com", name: "Veeda Clinical Research", sector: "Clinical Research", brand: "#2f9c4d", initial: "V", price: 457, iv: "2", tag: "avail" },
  { domain: "oyorooms.com", name: "Oravel Stays (OYO)", sector: "Hospitality", brand: "#EE2E24", initial: "O", price: 21.85, iv: "1", tag: "trend" },
  { domain: "sterlitepower.com", name: "Sterlite Electrical", sector: "Energy", brand: "#e96228", initial: "S", price: 472, iv: "2", tag: "avail" },
  { domain: "esds.co.in", name: "ESDS Software Solutions", sector: "IT Services", brand: "#1e3d7a", initial: "E", price: 472, iv: "1", tag: "avail" },
  { domain: "innov8.work", name: "Innov8 Workspaces India Limited", sector: "Real Estate", brand: "#f7b731", initial: "I", price: 49.50, iv: "1", tag: "avail" },
  { domain: "nseindia.com", name: "National Stock Exchange of India (NSE)", sector: "Exchange", brand: "#F58220", initial: "N", price: 2025, iv: "1", tag: "trend" },
  { domain: "goodluckdefence.com", name: "Goodluck Defence and Aerospace", sector: "Defence", brand: "#272a2e", initial: "G", price: 383.00, iv: "10", tag: "lim" }
];

const TAG_LABEL: Record<Unl["tag"], string> = {
  trend: "Trending",
  avail: "Available",
  lim: "Limited"
};

export default function Unlisted() {
  const [items, setItems] = useState<Unl[]>(UNLISTED_FALLBACK);
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
                <Link
                  href={`/unlisted/${unlistedSlug(u.name)}`}
                  className="unl-view-link"
                  aria-label={`View details for ${u.name}`}
                >
                  View details →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


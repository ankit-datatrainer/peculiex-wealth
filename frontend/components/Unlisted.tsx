"use client";
import { useEffect, useState, useMemo } from "react";
import { fetcher } from "@/lib/api";
import InvestModal from "./InvestModal";

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
  min_units: number;
  market_cap: string;
  pe: string;
};

export default function Unlisted() {
  const [items, setItems] = useState<Unl[]>([]);
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState<Unl | null>(null);

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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.sector.toLowerCase().includes(q)
    );
  }, [items, search]);

  useEffect(() => {
    // Re-observe dynamic cards so they fade in instead of staying invisible
    const io = (window as any).__finvoqReveal;
    if (io) {
      document
        .querySelectorAll(".unlisted-grid-v2 .reveal:not(.visible)")
        .forEach((el) => io.observe(el));
    }
  }, [visible]);

  const fmtINR = (n: number) =>
    "₹ " + n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  return (
    <>
      <section id="unlisted" className="unlisted-v2">
        <div className="container">
          <div className="sec-head reveal">
            <div className="label">Unlisted Shares</div>
            <h2 className="stitle">
              Private market <em>opportunities</em>
            </h2>
            <p className="sdesc">
              Curated pre-IPO and unlisted share inventory with transparent
              pricing. Click &quot;Invest Now&quot; on any company to submit an inquiry.
            </p>
          </div>

          {/* Search Bar */}
          <div className="unlisted-search reveal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by company name or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="unlisted-search__input"
            />
            {search && (
              <button
                className="unlisted-search__clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="unlisted-count reveal">
            Showing <strong>{visible.length}</strong> of {items.length} companies
          </div>

          {/* Card Grid */}
          <div className="unlisted-grid-v2" id="unlistedGrid">
            {visible.map((u, i) => (
              <article className="ulv2-card reveal" key={`${u.name}-${i}`}>
                {/* Logo */}
                <div className="ulv2-card__logo">
                  {u.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.logo_url}
                      alt={`${u.name} logo`}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fb) fb.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className="ulv2-card__logo-fb"
                    style={{ background: u.brand, display: u.logo_url ? "none" : "flex" }}
                  >
                    {u.initial}
                  </span>
                </div>

                {/* Company name */}
                <h4 className="ulv2-card__name">{u.name}</h4>

                {/* Stats */}
                <div className="ulv2-card__stats">
                  <div className="ulv2-card__stat">
                    <span>Price per share</span>
                    <strong>{fmtINR(u.price)}</strong>
                  </div>
                  <div className="ulv2-card__stat">
                    <span>Sector</span>
                    <strong>{u.sector}</strong>
                  </div>
                  <div className="ulv2-card__stat">
                    <span>Minimum Units</span>
                    <strong>{u.min_units || "—"}</strong>
                  </div>
                  <div className="ulv2-card__stat">
                    <span>Market Cap</span>
                    <strong>₹ {u.market_cap || "—"}</strong>
                  </div>
                  <div className="ulv2-card__stat">
                    <span>P/E(x)</span>
                    <strong>{u.pe || "N/A"}</strong>
                  </div>
                </div>

                {/* Invest Now Button */}
                <button
                  className="ulv2-card__invest"
                  onClick={() => setModalItem(u)}
                >
                  Invest Now
                </button>
              </article>
            ))}
          </div>

          {visible.length === 0 && items.length > 0 && (
            <div className="unlisted-empty reveal">
              <p>No companies match &quot;{search}&quot;. Try a different search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Invest Modal */}
      <InvestModal
        open={!!modalItem}
        onClose={() => setModalItem(null)}
        company={modalItem || { name: "", price: 0, min_units: 0, sector: "" }}
      />
    </>
  );
}

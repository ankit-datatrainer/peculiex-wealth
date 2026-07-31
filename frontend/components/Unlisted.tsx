"use client";

import { useContent, accent } from "@/lib/content";

/** Render a *starred* CMS heading with the <em> accent the design uses. */
function heading(text: string) {
  return accent(text).map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <em key={i}>{p.em}</em>
  );
}
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
  const cms = useContent("unlisted");
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
          <div className="unlisted-hero-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', marginBottom: '48px', flexWrap: 'wrap' }}>
            {/* Left Box */}
            <div className="ul-feature-box reveal" style={{ flex: '1 1 200px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.1)', textAlign: 'center' }}>
              <span style={{ display: 'inline-block', background: '#0284c7', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cms.t("deal", "eyebrow", "Deal of the Day")}</span>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0f172a' }}>{cms.t("deal", "title", "HDFC Securities")}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{cms.t("deal", "subtitle", "High Growth Potential")}</p>
            </div>

            {/* Center Header */}
            <div className="sec-head reveal" style={{ flex: '2 1 300px', textAlign: 'center', margin: 0 }}>
              <h2 className="stitle">{heading(cms.t("hero", "title", "Private market *opportunities*"))}</h2>
              <p className="sdesc" style={{ marginBottom: '24px' }}>{cms.t("hero", "subtitle", "Curated pre-IPO and unlisted share inventory with transparent pricing.")}</p>
              
              <a href={cms.t("whatsapp", "link", "https://chat.whatsapp.com/your-invite-link")} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '10px 24px', borderRadius: '30px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)', transition: 'transform 0.2s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {cms.t("whatsapp", "label", "Join our WhatsApp Community")}
              </a>
            </div>

            {/* Right Box */}
            <div className="ul-feature-box reveal" style={{ flex: '1 1 200px', background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #f5d0fe', boxShadow: '0 4px 12px rgba(217, 70, 239, 0.1)', textAlign: 'center' }}>
              <span style={{ display: 'inline-block', background: '#c026d3', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cms.t("hot", "eyebrow", "Hot Opportunity")}</span>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0f172a' }}>{cms.t("hot", "title", "NSE India")}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{cms.t("hot", "subtitle", "Pre-IPO Access")}</p>
            </div>
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

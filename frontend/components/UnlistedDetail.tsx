"use client";
import { useMemo } from "react";
import Link from "next/link";
import { getCompanyLogo, unlistedSlug } from "@/lib/util";
import { useUnlisted } from "@/lib/useUnlisted";
import { useContent } from "@/lib/content";
import { fill } from "@/lib/template";
import { type Unl } from "./Unlisted";
import WatchlistButton, { makeUnlistedSymbol } from "./WatchlistButton";

const KNOW_ITEMS = [
  { text: "Unlisted shares are illiquid and may carry a lock-in of up to 6 months post-listing." },
  { text: "Pricing reflects the latest available transaction and can move between funding rounds." },
  { text: "Minimum ticket sizes and settlement timelines are confirmed on your diligence call." },
  { text: "Capital gains, stamp duty and GST are computed and declared per SEBI norms." }
];

const ABOUT_BODY =
  "{company} is available as an unlisted / pre-IPO holding through Finvoq’s private-markets desk. Shares settle via off-market transfer directly into your demat account, with transparent pricing, recent transaction history, and full compliance disclosures shared before purchase.";

export default function UnlistedDetail({ slug }: { slug: string }) {
  // Copy comes from the `detail` section of the "unlisted" CMS page; the
  // company data itself is live from the API.
  const cms = useContent("unlisted");
  const t = (field: string, fallback: string) => cms.t("detail", field, fallback);
  const { items, loading, error } = useUnlisted(slug);
  const loaded = !loading;

  const item = useMemo(
    () => items.find((u) => unlistedSlug(u.name) === slug),
    [items, slug]
  );

  if (!item) {
    return (
      <main className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: 12 }}>
          {error ? "Could not load company details" : loaded ? t("notFoundTitle", "Company not found") : t("loading", "Loading…")}
        </h1>
        {loaded && (
          <>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
              {t(
                "notFoundBody",
                "We couldn’t find that unlisted company. It may no longer be in our inventory."
              )}
            </p>
            <Link href="/unlisted" className="btn btn-primary">
              {t("notFoundBack", "← Back to all unlisted shares")}
            </Link>
          </>
        )}
      </main>
    );
  }

  const sym = makeUnlistedSymbol(item.name);
  const knowItems = cms.list("detail", "knowItems", KNOW_ITEMS).filter((k) => k.text);

  return (
    <main className="unl-detail">
      <div className="container">
        <Link href="/unlisted" className="unl-detail-back">
          {t("backLink", "← All unlisted shares")}
        </Link>

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
            <h1>{item.name}</h1>
            <div className="sector">{item.sector}</div>
          </div>
          <div className="unl-detail-action">
            <WatchlistButton symbol={sym} name={item.name} price={item.price} kind="unlisted" />
          </div>
        </header>

        <section className="unl-detail-stats">
          <div className="unl-stat">
            <span>{item.quote_status === "unverified" ? "Last recorded price" : t("statPrice", "Price / Share")}</span>
            <strong>{item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : "Price on request"}</strong>
          </div>
          <div className="unl-stat">
            <span>{t("statMinUnits", "Minimum Units")}</span>
            <strong>{item.min_units || "—"}</strong>
          </div>
          <div className="unl-stat">
            <span>{t("statSector", "Sector")}</span>
            <strong>{item.sector}</strong>
          </div>
          <div className="unl-stat">
            <span>{t("statMarketCap", "Market Cap")}</span>
            <strong>{item.market_cap && !/^n\/?a/i.test(item.market_cap) ? `₹ ${item.market_cap}` : "N/A"}</strong>
          </div>
          <div className="unl-stat">
            <span>{t("statPe", "P/E (x)")}</span>
            <strong>{item.pe || "N/A"}</strong>
          </div>
        </section>

        {item.fundamentals && (
          <section className="unl-detail-stats" aria-label="Company fundamentals">
            {["ISIN", "Face Value", "EPS", "P/B Ratio", "Book Value", "Debt to Equity Ratio"].map(label => (
              <div className="unl-stat" key={label}>
                <span>{label}</span><strong>{item.fundamentals?.[label] || "N/A"}</strong>
              </div>
            ))}
          </section>
        )}

        {item.financials?.map(table => table.rows.length > 0 && (
          <section className="unl-detail-body" key={table.title}>
            <h2>{table.title}</h2>
            <div style={{ overflowX: "auto", marginBottom: 24 }} tabIndex={0} aria-label={table.title}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead><tr>{table.rows[0].map((cell, i) => <th key={i} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{cell}</th>)}</tr></thead>
                <tbody>{table.rows.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: 12, borderBottom: "1px solid var(--color-border)" }}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="unl-detail-body">
          <h2>{t("aboutTitle", "About the opportunity")}</h2>
          <p>{fill(t("aboutBody", ABOUT_BODY), { company: item.name })}</p>
          <h2>{t("knowTitle", "What to know before you invest")}</h2>
          {knowItems.length > 0 && (
            <ul>
              {knowItems.map((k, i) => (
                <li key={i}>{k.text}</li>
              ))}
            </ul>
          )}

          <div className="unl-detail-cta">
            <Link
              href={t("ctaPrimaryHref", "/get-started")}
              className="btn btn-primary btn-lg"
              data-magnetic
            >
              {t("ctaPrimary", "Request a diligence call →")}
            </Link>
            <a
              href={`/factsheets/unlisted-${slug}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-lg"
            >
              {t("ctaSecondary", "Download factsheet ↓")}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

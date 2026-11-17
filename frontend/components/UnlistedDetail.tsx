"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUnlisted } from "@/lib/useUnlisted";
import { useWhatsApp } from "@/lib/siteSettings";
import WatchlistButton, { makeUnlistedSymbol } from "./WatchlistButton";
import InvestModal from "./InvestModal";
import UnlistedPriceChart from "./UnlistedPriceChart";
import UnlistedDocuments from "./UnlistedDocuments";

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const stamp = (date?: string | null) =>
  date
    ? new Date(date).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }) + " IST"
    : "Awaiting first sync";
const steps = [
  [
    "Explore the company",
    "Review indicative prices, financial statements, ownership and investor documents.",
  ],
  [
    "Request a quote",
    "Choose your quantity and send a buy or sell enquiry. Our desk confirms availability and an executable price.",
  ],
  [
    "Complete verification",
    "The desk explains the required identity, eligibility and demat-account checks, together with the charges and terms.",
  ],
  [
    "Confirm and settle",
    "Review the agreed terms before proceeding. The desk coordinates the off-market transfer and confirms settlement.",
  ],
];
const faqs = [
  [
    "Are these live exchange prices?",
    "No. Unlisted shares do not trade on a public exchange. Prices shown here are indicative quotes from UnlistedKraft; availability and executable prices need confirmation.",
  ],
  [
    "Where does the historical chart come from?",
    "The chart imports dated records published by the source and adds Finvoq’s daily quote observations. We do not generate prices for missing days. A dashed connector indicates a gap in the records.",
  ],
  [
    "How often are prices updated?",
    "The catalog checks for quotes every 15 minutes while the backend is running. It keeps the latest successful quoted price for each India calendar day. Historical records and document listings are checked at least every six hours.",
  ],
  [
    "Can I download reports and price data?",
    "Use the investor document filters to find a report, preview its PDF or download it. Export CSV on the chart downloads recorded prices for the selected date range.",
  ],
  [
    "Can I sell shares I already hold?",
    "Send a sell enquiry with your holding quantity. The desk will review buyer availability, your holding and settlement requirements before confirming any terms.",
  ],
  [
    "What should I check before investing?",
    "Review liquidity, valuation, company disclosures and settlement terms. An IPO or listing date is not guaranteed. Confirm applicable restrictions, charges and tax treatment with the relevant advisers.",
  ],
];

export default function UnlistedDetail({ slug }: { slug: string }) {
  const { items, loading, error } = useUnlisted(slug);
  const item = items[0];
  const [intent, setIntent] = useState<"buy" | "sell" | null>(null);
  const [units, setUnits] = useState(1);
  const [financial, setFinancial] = useState(0);
  const wa = useWhatsApp();
  useEffect(() => {
    setUnits(item?.min_units || 1);
    setFinancial(0);
    setIntent(null);
  }, [item?.name, item?.min_units]);
  if (!item)
    return (
      <main className="us-page">
        <div className="container us-empty-page">
          <span className="us-eyebrow">PRIVATE MARKETS</span>
          <h1>
            {loading
              ? "Loading company details…"
              : error
                ? "Company details are temporarily unavailable"
                : "Company not found"}
          </h1>
          <p>
            {error
              ? "Please try again shortly."
              : loading
                ? "Fetching the latest available records."
                : "This company may no longer be in the source catalog."}
          </p>
          <Link href="/unlisted">← All unlisted shares</Link>
        </div>
      </main>
    );
  const tables = item.financials || [],
    table = tables[financial] || tables[0];
  const quoted = item.price > 0 && item.quote_status !== "unverified";
  const validUnits = Number.isSafeInteger(units) && units >= item.min_units;
  const amount = quoted && Number.isFinite(units) ? item.price * units : 0;
  const fees = amount * 0.00015;
  return (
    <main className="us-page">
      <div className="container us-container">
        <Link href="/unlisted" className="us-back">
          ← All unlisted shares
        </Link>
        <header className="us-company-header">
          <div className="us-company-identity">
            <div className="us-company-logo">
              {item.logo_url ? (
                <img src={item.logo_url} alt={`${item.name} logo`} />
              ) : (
                <span>{item.initial}</span>
              )}
            </div>
            <div>
              <span className="us-eyebrow">
                UNLISTED EQUITY · {item.sector}
              </span>
              <h1>{item.name}</h1>
              <div className="us-company-tags">
                <span>{item.company_status || "Unlisted shares"}</span>
                <span>ISIN {item.fundamentals?.ISIN || "Not provided"}</span>
              </div>
            </div>
          </div>
          <WatchlistButton
            symbol={makeUnlistedSymbol(item.name)}
            name={item.name}
            price={item.price}
            kind="unlisted"
          />
        </header>
        <div className="us-freshness">
          <span className="us-status-dot" />
          Quote checked {stamp(item.source_checked_at)}
          <span>·</span>
          <span>Indicative price · INR</span>
          {error && (
            <span className="us-negative">
              Refresh failed; showing last available data
            </span>
          )}
        </div>
        <nav className="us-section-nav" aria-label="Company sections">
          {[
            ["price-history", "Price chart"],
            ["fundamentals", "Fundamentals"],
            ["financials", "Financials"],
            ["documents", "Documents"],
            ["ownership", "Ownership"],
            ["how-it-works", "How to invest"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="us-layout">
          <div className="us-main-column">
            <UnlistedPriceChart
              key={item.name}
              name={item.name}
              history={item.price_history || []}
              dailyQuotes={item.daily_quotes}
            />
            <section className="us-card" id="fundamentals">
              <div className="us-section-heading">
                <div>
                  <span className="us-eyebrow">AT A GLANCE</span>
                  <h2>Company fundamentals</h2>
                </div>
              </div>
              <dl className="us-fundamentals">
                {[
                  [
                    "Current price",
                    quoted ? money(item.price) : "Price on request",
                  ],
                  ["Market capitalization", item.market_cap],
                  ["P/E ratio", item.pe],
                  ["ISIN", item.fundamentals?.ISIN],
                  ["Face value", item.fundamentals?.["Face Value"]],
                  ["Earnings per share", item.fundamentals?.EPS],
                  ["P/B ratio", item.fundamentals?.["P/B Ratio"]],
                  ["Book value", item.fundamentals?.["Book Value"]],
                  [
                    "Debt to equity",
                    item.fundamentals?.["Debt to Equity Ratio"],
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "Not provided"}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="us-card" id="financials">
              <div className="us-section-heading">
                <div>
                  <span className="us-eyebrow">BEHIND THE NUMBERS</span>
                  <h2>Financial statements</h2>
                </div>
              </div>
              {tables.length ? (
                <>
                  <div
                    className="us-table-tabs"
                    aria-label="Financial statement"
                  >
                    {tables.map((t, i) => (
                      <button
                        key={i}
                        aria-pressed={financial === i}
                        onClick={() => setFinancial(i)}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                  <div
                    className="us-table-scroll"
                    tabIndex={0}
                    role="region"
                    aria-label={table.title}
                  >
                    <table>
                      <caption>
                        {table.title} · figures and units as published by the
                        source
                      </caption>
                      <thead>
                        <tr>
                          {table.rows[0]?.map((cell, i) => (
                            <th key={i} scope="col">
                              {cell}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.slice(1).map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) =>
                              j === 0 ? (
                                <th key={j} scope="row">
                                  {cell}
                                </th>
                              ) : (
                                <td key={j}>{cell}</td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="us-footnote">
                    Scroll horizontally to compare periods. Source statement
                    figures may use different units; check the original reports.
                  </p>
                </>
              ) : (
                <p className="us-empty">
                  No financial statements are available from the source yet.
                </p>
              )}
            </section>
            <UnlistedDocuments
              key={item.name + "-documents"}
              documents={item.documents || []}
            />
            <section className="us-card" id="ownership">
              <div className="us-section-heading">
                <div>
                  <span className="us-eyebrow">PEOPLE & OWNERSHIP</span>
                  <h2>Who’s behind the company</h2>
                </div>
              </div>
              <h3>Shareholding pattern</h3>
              {item.shareholding?.length ? (
                <div className="us-holders">
                  {item.shareholding.map((holder, i) => (
                    <div key={i}>
                      <div>
                        <span>{holder.name}</span>
                        <strong>{holder.holding}</strong>
                      </div>
                      <div className="us-holding-track">
                        <span
                          style={{
                            width: `${Math.max(0, Math.min(100, parseFloat(holder.holding) || 0))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="us-muted">
                  Shareholding information is not provided by the source.
                </p>
              )}
              <h3 className="us-subheading">Promoters & leadership</h3>
              {item.promoters?.length ? (
                <div className="us-promoters">
                  {item.promoters.map((person, i) => (
                    <div key={i}>
                      <span className="us-person-icon">
                        {person.name.charAt(0)}
                      </span>
                      <div>
                        <strong>{person.name}</strong>
                        <p>{person.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="us-muted">
                  Promoter details are not provided by the source.
                </p>
              )}
              <p className="us-footnote">
                Ownership and leadership are shown as reported by the source and
                may relate to an earlier reporting period.
              </p>
            </section>
            <section className="us-card" id="how-it-works">
              <span className="us-eyebrow">YOUR NEXT STEPS</span>
              <h2>From research to a conversation.</h2>
              <ol className="us-invest-steps">
                {steps.map(([title, description], i) => (
                  <li key={title}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <button className="us-primary" onClick={() => setIntent("buy")}>
                Start a buy enquiry ↗
              </button>
            </section>
            <section className="us-card">
              <span className="us-eyebrow">GOOD TO KNOW</span>
              <h2>Questions, answered.</h2>
              <div className="us-faqs">
                {faqs.map(([question, answer]) => (
                  <details key={question}>
                    <summary>
                      {question}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </section>
            <p className="us-attribution">
              Data:{" "}
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                UnlistedKraft ↗
              </a>
              . Last quote check: {stamp(item.source_checked_at)}. Unlisted
              investments can be illiquid and carry a risk of capital loss. A
              quote or enquiry does not constitute a confirmed trade.
            </p>
          </div>
          <aside className="us-sidebar">
            <div className="us-quote-card us-card">
              <span className="us-eyebrow">YOUR PRIVATE MARKETS DESK</span>
              <h2>{quoted ? money(item.price) : "Price on request"}</h2>
              <p className="us-muted">Indicative price per share</p>
              <div className="us-quote-facts">
                <div>
                  <span>Minimum quantity</span>
                  <strong>
                    {item.min_units.toLocaleString("en-IN")} units
                  </strong>
                </div>
                <div>
                  <span>Sector</span>
                  <strong>{item.sector}</strong>
                </div>
              </div>
              <label className="us-quantity">
                Number of units
                <input
                  type="number"
                  aria-label="Investment units"
                  min={item.min_units}
                  step={1}
                  value={units || ""}
                  onChange={(e) => setUnits(Number(e.target.value))}
                />
              </label>
              {!validUnits && (
                <p className="us-input-error">
                  Enter a whole number of at least {item.min_units} units.
                </p>
              )}
              <div className="us-estimate">
                {quoted ? (
                  <>
                    <div>
                      <span>Indicative value</span>
                      <strong>{money(amount)}</strong>
                    </div>
                    <div>
                      <span>Stamp duty estimate (0.015%)</span>
                      <strong>{money(fees)}</strong>
                    </div>
                    <div className="us-estimate-total">
                      <span>Estimated total</span>
                      <strong>{money(amount + fees)}</strong>
                    </div>
                  </>
                ) : (
                  <p>Request a quote to confirm the price and charges.</p>
                )}
              </div>
              <button
                className="us-primary"
                disabled={!validUnits}
                onClick={() => setIntent("buy")}
              >
                Enquire to buy ↗
              </button>
              <button
                className="us-secondary"
                onClick={() => setIntent("sell")}
              >
                Sell your shares
              </button>
              <a
                className="us-whatsapp"
                href={wa.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Discuss a bulk deal ↗
              </a>
              <p className="us-footnote">
                The desk confirms availability, final charges and settlement
                terms before any commitment.
              </p>
            </div>
          </aside>
        </div>
        <InvestModal
          open={!!intent}
          intent={intent || "buy"}
          initialUnits={units}
          onClose={() => setIntent(null)}
          company={item}
        />
      </div>
    </main>
  );
}

"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

type Product = {
  icon: string;
  title: string;
  body: string;
  cta: string;
  soon?: boolean;
  slug?: string;
};

const FALLBACK: Product[] = [
  { icon: "i-trending-up", title: "Equities",            body: "Track listed shares with live price feeds, sparkline trends, and watchlist-driven discovery.",        cta: "Explore", slug: "equities" },
  { icon: "i-bar-chart",   title: "Mutual Funds",        body: "SIP & lump sum across 40+ AMCs. Goal-based planning with built-in calculators.",                       cta: "Explore", slug: "mutual-funds" },
  { icon: "i-gem",         title: "Portfolio Management (PMS)",  body: "Bespoke investment solutions tailored for HNI and UHNI investors.", cta: "Explore", slug: "pms" },
  { icon: "i-gem",         title: "Alternative Investments (AIF)",  body: "Access sophisticated private market opportunities and hedge funds.", cta: "Explore", slug: "aif" },
  { icon: "i-building",    title: "Bonds & G-Sec",       body: "Government securities, corporate bonds, tax-free bonds, and NCD opportunities.",                       cta: "Explore", slug: "bonds" },
  { icon: "i-shield",      title: "Insurance",           body: "Term life, health, and ULIP products from top insurers with comparison tools.",                        cta: "Explore", slug: "insurance" },
  { icon: "i-building",    title: "Fixed Deposits",      body: "Secure, high-yield fixed deposits from top-rated banks and NBFCs for stable returns.",                 cta: "Explore", slug: "fixed-deposits" },
  { icon: "i-gem",         title: "Gift City",           body: "Explore offshore investment opportunities and global diversification via Gift City.",                    cta: "Explore", slug: "gift-city" }
];

const TITLE_TO_SLUG: Record<string, string> = {
  "Equities": "equities",
  "Mutual Funds": "mutual-funds",
  "Portfolio Management (PMS)": "pms",
  "Alternative Investments (AIF)": "aif",
  "Bonds & G-Sec": "bonds",
  "Insurance": "insurance",
  "Fixed Deposits": "fixed-deposits",
  "Gift City": "gift-city"
};

export default function Marketplace() {
  const { data } = useSWR<{ items: Product[] }>("/api/products", fetcher);
  const items = data?.items?.length ? data.items : FALLBACK;

  return (
    <section id="products" className="marketplace">
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">Marketplace</div>
          <h2 className="stitle">
            Every financial product, <em>one destination</em>
          </h2>
          <p className="sdesc">
            From equities to alternative investments — explore, compare, and
            invest with guidance at every step.
          </p>
        </div>

        <div className="product-grid reveal-stagger">
          {items.map((p) => {
            const slug = p.slug || TITLE_TO_SLUG[p.title];
            const card = (
              <article className="product reveal" data-tilt key={p.title}>
                <div className="p-icon">
                  <svg>
                    <use href={`#${p.icon}`} />
                  </svg>
                </div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className={`p-link${p.soon ? " soon" : ""}`}>
                  {p.cta} <i>→</i>
                </span>
              </article>
            );
            return slug ? (
              <Link
                key={p.title}
                href={p.title === "Equities" ? "/watchlist" : `/products/${slug}`}
                style={{ display: "contents" }}
              >
                {card}
              </Link>
            ) : (
              card
            );
          })}
        </div>
      </div>
    </section>
  );
}

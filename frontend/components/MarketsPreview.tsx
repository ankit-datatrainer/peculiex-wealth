"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetcher } from "@/lib/api";
import { fmtINR2, randomSpark, sparkPath, sparkLastPoint, getCompanyDomain, getCompanyLogo } from "@/lib/util";
import WatchlistButton from "./WatchlistButton";

type Stock = {
  name: string;
  sym: string;
  price: number;
  chg: number;
  vol: string;
  cap: string;
  cat: "up" | "stable" | "watch";
};

const FALLBACK: Stock[] = [
  { name: "Reliance Ind.", sym: "RELIANCE", price: 2840.55, chg: 1.42, vol: "8.2M", cap: "₹19.2L Cr", cat: "up" },
  { name: "TCS", sym: "TCS", price: 3920.10, chg: 0.85, vol: "2.4M", cap: "₹14.3L Cr", cat: "up" },
  { name: "HDFC Bank", sym: "HDFCBANK", price: 1672.30, chg: -0.32, vol: "6.8M", cap: "₹12.7L Cr", cat: "stable" },
  { name: "Infosys", sym: "INFY", price: 1845.65, chg: 1.10, vol: "4.1M", cap: "₹7.6L Cr", cat: "up" }
];

export default function MarketsPreview() {
  const [stocks, setStocks] = useState<Stock[]>(FALLBACK);

  useEffect(() => {
    let killed = false;
    const fetchLive = () => {
      fetcher<{ items: Stock[] }>("/api/stocks")
        .then((j) => {
          if (!killed && j?.items?.length) setStocks(j.items.slice(0, 4));
        })
        .catch(() => {});
    };
    fetchLive();
    const timer = setInterval(fetchLive, 30000);
    return () => {
      killed = true;
      clearInterval(timer);
    };
  }, []);

  const [sparks, setSparks] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const map: Record<string, number[]> = {};
    stocks.forEach((s, i) => (map[s.sym] = randomSpark(i * 3)));
    setSparks(map);
  }, [stocks]);

  return (
    <section className="preview-sec">
      <div className="container">
        <div className="preview-head reveal">
          <div>
            <div className="label">Listed Markets</div>
            <h2>
              Live <em>equities</em>
            </h2>
          </div>
          <Link href="/markets" className="preview-cta">
            View all stocks →
          </Link>
        </div>

        <div className="stock-grid reveal-stagger" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {stocks.slice(0, 4).map((s, i) => {
            const up = s.chg >= 0;
            const vals = sparks[s.sym] || [100, 100, 100, 100, 100]; // fallback spark
            return (
              <article className="stock reveal visible" key={s.sym}>
                <Link href={`/markets/${encodeURIComponent(s.sym)}`} className="stock-link" aria-label={`Open ${s.name} details`}>
                  <div className="stock-head">
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <img 
                        src={getCompanyLogo(getCompanyDomain(s.sym, s.name))}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 999, objectFit: "contain", background: "#fff", border: "1px solid rgba(0,0,0,0.05)" }}
                        onError={(e) => {
                          const t = e.currentTarget;
                          t.style.display = "none";
                          const fb = t.nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.display = "grid";
                        }}
                      />
                      <span className="unl-logo-fallback" style={{ display: "none", width: 32, height: 32, borderRadius: 999, background: "#13735d", color: "#fff", placeItems: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: 1 }}>
                        {s.sym.slice(0, 2)}
                      </span>
                      <div>
                        <div className="stock-name">{s.name}</div>
                        <div className="stock-sym">{s.sym}</div>
                      </div>
                    </div>
                    <span className={`stock-pill ${up ? "up" : "dn"}`}>
                      <svg className="trend-icon">
                        <use href={`#i-arrow-${up ? "up" : "down"}`} />
                      </svg>{" "}
                      {Math.abs(s.chg).toFixed(2)}%
                    </span>
                  </div>
                  <div className="stock-price">
                    <b>₹{fmtINR2(s.price)}</b>
                  </div>
                <svg className="stock-spark" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path d={sparkPath(vals)} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth="1.0" strokeLinejoin="round" />
                  </svg>
                  <div className="stock-meta">
                    <span>Vol {s.vol}</span>
                    <span>Mcap {s.cap}</span>
                  </div>
                </Link>
                <div className="stock-actions">
                  <WatchlistButton
                    symbol={s.sym}
                    name={s.name}
                    price={s.price}
                    kind="listed"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


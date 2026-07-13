"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";

type Item = { q: string; a: string };

const FALLBACK: Item[] = [
  { q: "Is my money safe with Finvoq?", a: "Yes. Your demat account is held with SEBI-registered partners and funds move via RBI-regulated banking rails. Finvoq never holds custody of your assets — we are an advisor and execution layer only, and every transaction settles directly into your name." },
  { q: "What's the minimum amount to start investing?", a: "You can start a SIP from ₹1,000 per month or a lump sum from ₹500. PMS and AIF have higher statutory minimums (₹50L and ₹1Cr respectively) as mandated by SEBI. Unlisted shares vary by lot size — typically ₹25,000 to ₹1L per opportunity." },
  { q: "How is Finvoq different from a discount broker?", a: "Discount brokers give you a tool. Finvoq gives you an advisor, a curated product list across 8 asset classes, and a single dashboard that ties it all together. You get curation, accountability, and a relationship — not just access to an order screen." },
  { q: "Can I withdraw or sell my investments anytime?", a: "For listed equity, mutual funds, and bonds — yes, subject to standard settlement cycles (T+1 or T+2). Unlisted shares, PMS, and AIF have lock-in periods that vary by product. Each lock-in is clearly disclosed before you invest, never buried in fine print." },
  { q: "What does Finvoq charge?", a: "A flat advisory fee starting at 0.25% per year on assets advised — billed quarterly, transparent to the rupee. We earn nothing from product manufacturers, distributors, or anyone else. Your fee is our only revenue, so our incentives stay aligned with yours." },
  { q: "Who is my advisor and how do I reach them?", a: "Every investor is paired with a SEBI-registered advisor based on goals, time horizon, and portfolio size. You can reach them via WhatsApp, email, or scheduled video call — typical response time is under 30 minutes during market hours." },
  { q: "How do I track my portfolio performance?", a: "You can track your portfolio performance through our unified dashboard. It provides real-time updates across all asset classes, detailed analytics, and personalized insights." },
  { q: "What are the tax implications of my investments?", a: "Taxation varies by asset class. We provide a comprehensive annual tax statement and capital gains report to make filing easy. However, we recommend consulting a tax advisor for personalized advice." },
  { q: "Is there a lock-in period for my investments?", a: "Lock-in periods depend on the specific product. Listed equities and mutual funds generally have no lock-in (except ELSS). Unlisted shares, PMS, and AIFs may have varying lock-in periods, which are clearly stated before investing." }
];

export default function FAQ() {
  const [items, setItems] = useState<Item[]>(FALLBACK);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Item[] }>("/api/faqs")
      .then((j) => {
        if (!killed && j?.items?.length) setItems(j.items);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="faq-sec">
      <div className="container">
        <div className="sec-head sec-head-center reveal">
          <div className="label">FAQ</div>
          <h2 className="stitle">
            Questions, <em>answered.</em>
          </h2>
          <p className="sdesc">
            Everything investors ask before getting started — straight answers,
            no jargon.
          </p>
        </div>

        <ul className="faq-list">
          {items.map((it, i) => (
            <li className="faq-item reveal" data-open={openIndex === i} key={i}>
              <button 
                className="faq-q" 
                type="button" 
                aria-expanded={openIndex === i}
                onClick={() => toggle(i)}
              >
                <span>{it.q}</span>
                <span className="faq-icon">
                  <svg viewBox="0 0 14 14" aria-hidden="true">
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              <div className="faq-a">
                <p>{it.a}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

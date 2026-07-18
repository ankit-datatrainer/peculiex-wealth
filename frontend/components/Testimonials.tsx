"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";

type T = { quote: string; author: string; role: string; color: string; initials: string };

const FALLBACK: T[] = [
  { quote: "Finally a platform that treats unlisted shares with the same rigor as listed ones. The diligence is exceptional.", author: "Aarav Shah", role: "Founder, Lumen Studios", color: "#0E3F76", initials: "AS" },
  { quote: "I moved my entire portfolio over after my first call with their advisor. The depth of research is unmatched.", author: "Priya Kapoor", role: "Director, MIT-K Capital", color: "#7c3aed", initials: "PK" },
  { quote: "Most platforms feel like brokerage apps. Finvoq actually feels like a private bank — without the markup.", author: "Vikram Iyer", role: "Managing Partner, Iyer Family Office", color: "#13735d", initials: "VI" },
  { quote: "The unified dashboard alone saves me three hours a week. I can finally see every asset class in one place.", author: "Neha Reddy", role: "CFO, Zenith Health", color: "#ea7c1c", initials: "NR" },
  { quote: "I've been investing for 25 years. This is the first platform that actually serves me, not the other way around.", author: "Rajesh Bansal", role: "Retd. Senior Banker", color: "#16a34a", initials: "RB" },
  { quote: "The PMS access alone justifies the platform. The team made onboarding feel personal — rare these days.", author: "Karan Mehta", role: "Founder, Stride Ventures", color: "#dc2626", initials: "KM" },
  { quote: "Their advisory team helped me allocate across 5 asset classes in under a week. Truly seamless experience.", author: "Sneha Patel", role: "CTO, NovaByte Systems", color: "#0891b2", initials: "SP" },
  { quote: "What impressed me most was the transparency. Every fee, every allocation — crystal clear from day one.", author: "Arjun Menon", role: "Partner, Meridian Capital", color: "#9333ea", initials: "AM" },
  { quote: "From unlisted pre-IPO to bonds — everything under one roof. My CA loves the tax reports they generate.", author: "Deepa Krishnan", role: "Founder, Aura Interiors", color: "#c2410c", initials: "DK" },
  { quote: "The relationship manager actually picks up the phone. In 2024, that alone is worth its weight in gold.", author: "Rohit Sharma", role: "VP Engineering, ScaleStack", color: "#0d9488", initials: "RS" },
];

function Card({ t, isBig, onClick }: { t: T, isBig?: boolean, onClick?: () => void }) {
  return (
    <article className={`testi-card ${isBig ? 'testi-card-big' : ''}`} onClick={onClick}>
      <div className="testi-card-author">
        <span className="testi-card-avatar" style={{ background: t.color }}>
          {t.initials}
        </span>
        <div className="testi-card-info">
          <strong>{t.author}</strong>
          <span>{t.role}</span>
        </div>
      </div>
      <p className="testi-card-quote">{t.quote}</p>
    </article>
  );
}

export default function Testimonials() {
  const [items, setItems] = useState<T[]>(FALLBACK);
  const [selected, setSelected] = useState<T | null>(null);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: T[] }>("/api/testimonials")
      .then((j) => {
        if (!killed && j?.items?.length) {
          const merged = [...j.items];
          for (const fb of FALLBACK) {
            if (!merged.find((m) => m.author === fb.author)) merged.push(fb);
          }
          setItems(merged);
        }
      })
      .catch(() => {});
    return () => { killed = true; };
  }, []);

  const mid = Math.ceil(items.length / 2);
  const row1 = items.slice(0, mid);
  const row2 = items.slice(mid);

  const row1Loop = [...row1, ...row1, ...row1];
  const row2Loop = [...row2, ...row2, ...row2];

  return (
    <section id="testimonials" className="testi-sec">
      <div className="container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="sec-head sec-head-center reveal rv-blur">
          <div className="label">Trust</div>
          <h2 className="stitle">
            What investors <em>say about us.</em>
          </h2>
          <p className="sdesc">
            Quotes from founders, family offices, CXOs, and professionals
            managing serious wealth on Finvoq.
          </p>
        </div>
      </div>

      <div className="testi-marquees-wrapper">
        <div className="testi-marquee-row">
          <div className="testi-ribbon testi-ribbon-left">
            {row1Loop.map((t, i) => (
              <Card t={t} key={`r1-${i}`} isBig={i % 2 === 0} onClick={() => setSelected(t)} />
            ))}
          </div>
        </div>

        <div className="testi-marquee-row">
          <div className="testi-ribbon testi-ribbon-right">
            {row2Loop.map((t, i) => (
              <Card t={t} key={`r2-${i}`} isBig={i % 2 !== 0} onClick={() => setSelected(t)} />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="testi-modal-overlay" onClick={() => setSelected(null)}>
          <div className="testi-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="testi-modal-close" onClick={() => setSelected(null)}>&times;</button>
            <div className="testi-card-author">
              <span className="testi-card-avatar" style={{ background: selected.color }}>
                {selected.initials}
              </span>
              <div className="testi-card-info">
                <strong>{selected.author}</strong>
                <span>{selected.role}</span>
              </div>
            </div>
            <p className="testi-card-quote" style={{ marginTop: '24px', fontSize: '1.15rem' }}>
              {selected.quote}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

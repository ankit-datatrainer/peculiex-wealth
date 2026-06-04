"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";

type T = { quote: string; author: string; role: string; color: string; initials: string };

const FALLBACK: T[] = [
  { quote: "Finally a platform that treats unlisted shares with the same rigor as listed ones. The diligence is exceptional.", author: "Aarav Shah", role: "Founder, Lumen Studios", color: "#0E3F76", initials: "AS" },
  { quote: "I moved my entire portfolio over after my first call with their advisor. The depth of research is unmatched.", author: "Priya Kapoor", role: "Director, MIT-K Capital", color: "#7c3aed", initials: "PK" },
  { quote: "Most platforms feel like brokerage apps. Peculiex actually feels like a private bank — without the markup.", author: "Vikram Iyer", role: "Managing Partner, Iyer Family Office", color: "#01696f", initials: "VI" },
  { quote: "The unified dashboard alone saves me three hours a week. I can finally see every asset class in one place.", author: "Neha Reddy", role: "CFO, Zenith Health", color: "#ea7c1c", initials: "NR" },
  { quote: "I've been investing for 25 years. This is the first platform that actually serves me, not the other way around.", author: "Rajesh Bansal", role: "Retd. Senior Banker", color: "#16a34a", initials: "RB" },
  { quote: "The PMS access alone justifies the platform. The team made onboarding feel personal — rare these days.", author: "Karan Mehta", role: "Founder, Stride Ventures", color: "#dc2626", initials: "KM" }
];

export default function Testimonials() {
  const [items, setItems] = useState<T[]>(FALLBACK);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: T[] }>("/api/testimonials")
      .then((j) => {
        if (!killed && j?.items?.length) setItems(j.items);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

  // duplicate for seamless loop
  const looped = [...items, ...items.slice(0, 3)];

  return (
    <section id="testimonials" className="testi-sec">
      <div className="container">
        <div className="sec-head sec-head-center reveal">
          <div className="label">Trust</div>
          <h2 className="stitle">
            What investors <em>say about us.</em>
          </h2>
          <p className="sdesc">
            Quotes from founders, family offices, CXOs, and professionals
            managing serious wealth on Peculiex.
          </p>
        </div>
      </div>

      <div className="testi-marquee">
        <div className="testi-track">
          {looped.map((t, i) => (
            <article className="testi" key={i}>
              <p>"{t.quote}"</p>
              <div className="testi-foot">
                <span
                  className="testi-avatar"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </span>
                <div>
                  <b>{t.author}</b>
                  <i>{t.role}</i>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

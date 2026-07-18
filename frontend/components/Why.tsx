"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Card = {
  icon: string;
  titlePrefix: string;
  titleImg: string;
  titleSuffix: string;
  body: string;
  meta: string;
};

const CARDS: Card[] = [
  {
    icon: "i-shield",
    titlePrefix: "Bank-grade",
    titleImg: "/why_security.png",
    titleSuffix: "security",
    body: "RBI & SEBI compliant. End-to-end encryption. Annual third-party audits. Your wealth, fully protected.",
    meta: "SOC 2 · ISO 27001"
  },
  {
    icon: "i-gem",
    titlePrefix: "Curated by",
    titleImg: "/why_experts.png",
    titleSuffix: "experts",
    body: "Every product is hand-picked by SEBI-registered advisors. We say no to nine out of ten opportunities we evaluate.",
    meta: "15+ years experience"
  },
  {
    icon: "i-grid",
    titlePrefix: "One unified",
    titleImg: "/why_platform.png",
    titleSuffix: "platform",
    body: "Equities, mutual funds, unlisted, PMS, AIF, bonds, insurance — and a single dashboard that ties it all together.",
    meta: "8 asset classes"
  },
  {
    icon: "i-star",
    titlePrefix: "Premium",
    titleImg: "/why_support.png",
    titleSuffix: "support",
    body: "A dedicated relationship manager for every investor. WhatsApp, email, or call — your advisor is reachable in minutes.",
    meta: "Dedicated RM included"
  },
  {
    icon: "i-trending-up",
    titlePrefix: "Real-time",
    titleImg: "/why_execution.png",
    titleSuffix: "execution",
    body: "From research to investing — completed in seconds. No paperwork. No fragmentation. No waiting on multiple platforms.",
    meta: "< 60 seconds to invest"
  }
];

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
// Smoothstep easing for buttery cross-fades / slides.
const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

export default function Why() {
  const trackRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  /* Scroll progress across the tall track (0 → 1). Each card owns a 1/N slice,
     so one scroll ≈ one card. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = track.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
        setProgress(scrollable > 0 ? scrolled / scrollable : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const N = CARDS.length;
  const seg = 1 / N;
  const active = Math.min(N - 1, Math.floor(progress / seg + 0.0001));

  return (
    <section
      id="why"
      className="why-pin"
      ref={trackRef}
      style={{ height: `${N * 100}vh` }}
    >
      <div className="why-pin-stage">
        {/* Left decorative sphere / glow */}
        <div className="why-pin-orb" aria-hidden="true" />

        {/* Section eyebrow + progress counter */}
        <div className="why-pin-eyebrow">
          <span className="why-pin-kicker">Why Finvoq</span>
          <span className="why-pin-count">
            <b>{String(active + 1).padStart(2, "0")}</b>
            <i>/</i>
            {String(N).padStart(2, "0")}
          </span>
        </div>

        {/* Cards — cross-faded one at a time */}
        <div className="why-pin-cards">
          {CARDS.map((c, i) => {
            const p = (progress - i * seg) / seg; // 0..1 within this card
            const shown = p >= -0.35 && p <= 1.35;
            // First card is already in at the start; last card holds at the end.
            const enter = i === 0 ? 1 : smooth(p / 0.3); // 0→1 as it slides in
            const exit = i === N - 1 ? 0 : smooth((p - 0.7) / 0.3); // 0→1 as it leaves
            const opacity = Math.min(enter, i === N - 1 ? 1 : 1 - exit);
            // Text enters from the left → right; image from the right → left.
            const textX = (1 - enter) * -80 + exit * 50;
            const imgX = (1 - enter) * 80 - exit * 50;
            return (
              <article
                key={c.titlePrefix}
                className="why-pin-card"
                style={{
                  opacity,
                  transform: "translateY(-50%)",
                  pointerEvents: opacity > 0.6 ? "auto" : "none"
                }}
                aria-hidden={!shown}
              >
                <div
                  className="why-pin-text"
                  style={{ transform: `translateX(${textX}px)` }}
                >
                  <div className="why-pin-icon">
                    <svg>
                      <use href={`#${c.icon}`} />
                    </svg>
                  </div>
                  <h2 className="why-pin-title">
                    {c.titlePrefix} {c.titleSuffix}
                  </h2>
                  <p className="why-pin-body">{c.body}</p>
                  <div className="why-pin-meta">
                    <span className="status-dot" />
                    {c.meta}
                  </div>
                </div>
                <div
                  className="why-pin-visual"
                  style={{ transform: `translateX(${imgX}px)` }}
                >
                  <Image
                    src={c.titleImg}
                    alt={`${c.titlePrefix} ${c.titleSuffix}`}
                    width={460}
                    height={345}
                    quality={82}
                    // All 5 are mounted up front and cross-faded by scroll (not
                    // lazily swapped in), so every one must be eagerly fetched —
                    // otherwise a fast scroll reaches a card before its image
                    // has loaded, which reads as "lag" / a blank flash.
                    priority
                    sizes="(max-width: 900px) 78vw, 460px"
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="why-pin-dots" aria-hidden="true">
          {CARDS.map((c, i) => (
            <span key={c.titlePrefix} className={i === active ? "on" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}

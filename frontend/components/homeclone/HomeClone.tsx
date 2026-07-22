"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { postJSON } from "@/lib/api";
import {
  ArrowDown,
  ArrowUpRight,
  Layers,
  LineChart,
  Play,
  Share2,
  ShieldCheck,
  Zap
} from "lucide-react";
import ScrollGlobe from "./ScrollGlobe";

/* ────────────────────────────────────────────────────────────────────────────
   SecuredFi-style homepage — a 1:1 layout port of the clone build
   ("securedfi.studiovoila.com clone/"), re-worded with Finvoq content.
   The palette is intentionally fixed (indigo/navy/mint) and does NOT follow
   the site theme: the homepage stays blue in light and dark mode alike.
   ──────────────────────────────────────────────────────────────────────────── */

/* Small IntersectionObserver reveal that stands in for motion/react's
   whileInView entrances in the original clone. */
function Reveal({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "-10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sfc-reveal${inView ? " in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    desc: "RBI & SEBI compliant. End-to-end encryption and annual third-party audits. Your wealth, fully protected."
  },
  {
    icon: LineChart,
    title: "Curated by experts",
    desc: "Every product is hand-picked by SEBI-registered advisors. We say no to nine out of ten opportunities we evaluate."
  },
  {
    icon: Layers,
    title: "One unified platform",
    desc: "Equities, mutual funds, unlisted, PMS, AIF, bonds, insurance — and a single dashboard that ties it all together."
  },
  {
    icon: Zap,
    title: "Real-time execution",
    desc: "From research to investing — completed in seconds. Live NSE & BSE prices, no paperwork, no waiting."
  }
];

const STATS = [
  { v: "₹182Cr+", l: "Assets managed" },
  { v: "4,000+", l: "Trusted investors" },
  { v: "10+", l: "Product categories" },
  { v: "10 yrs+", l: "Industry experience" }
];

/* Same partner logo assets the rest of the site uses (see PartnerLogos.tsx).
   Rendered on white tiles so the artwork reads identically in light and dark
   theme — the tile is the constant background, never the page. */
const PARTNERS: Array<{ name: string; img: string }> = [
  { name: "HDFC", img: "/partners/1.png" },
  { name: "Canara Robeco", img: "/partners/2.png" },
  { name: "Invesco", img: "/partners/3.png" },
  { name: "ICICI Prudential", img: "/partners/4.png" },
  { name: "Nippon India", img: "/partners/5.png" },
  { name: "Motilal Oswal", img: "/partners/6.png" },
  { name: "Quant", img: "/partners/7.png" },
  { name: "SBI Mutual Fund", img: "/partners/8.png" },
  { name: "Kotak Mutual Fund", img: "/partners/12.png" },
  { name: "Tata Mutual Fund", img: "/partners/14.png" },
  { name: "DSP Mutual Fund", img: "/partners/15.png" },
  { name: "LIC Mutual Fund", img: "/partners/16.png" },
  { name: "UTI Mutual Fund", img: "/partners/17.png" },
  { name: "Axis Mutual Fund", img: "/partners/18.png" },
  { name: "HSBC Mutual Fund", img: "/partners/19.png" },
  { name: "Aditya Birla Capital", img: "/partners/20.png" }
];

const POSTS = [
  {
    tag: "Markets",
    date: "Live",
    title: "Track every NSE & BSE share with real-time prices and watchlists"
  },
  {
    tag: "Insights",
    date: "Weekly",
    title: "How our advisors curate unlisted opportunities before they list"
  },
  {
    tag: "Company",
    date: "Beta",
    title: "Finvoq opens its doors — India's advisory-led investment marketplace"
  }
];

export default function HomeClone() {
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const onSubscribe = async () => {
    const input = emailRef.current;
    if (!input?.value || !input.checkValidity()) {
      input?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await postJSON("/api/newsletter", { email: input.value });
      setSubscribed(true);
      input.value = "";
      setTimeout(() => setSubscribed(false), 4000);
    } catch {
      /* stay quiet — the footer form is decorative on this page */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="sfc">
      <ScrollGlobe />

      <div className="sfc-content">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="intro" className="sfc-hero">
          <div className="sfc-hero-inner">
            {/* Centered headline — SecuredFi composition */}
            <h1 className="sfc-h1 sfc-up sfc-d1">
              Invest with clarity across every{" "}
              <span className="sfc-h1-em">
                asset&nbsp;class.
                <span className="sfc-h1-underline sfc-d3" />
              </span>
            </h1>

            {/* Portrait floating on the right edge, mid-height */}
            <a href="#platform" className="sfc-portrait sfc-up sfc-d2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/homeclone-portrait.jpg" alt="Your Finvoq advisor" />
              <span className="sfc-portrait-play">
                <Play size={15} fill="currentColor" />
              </span>
            </a>

            {/* Bottom row: link left · buttons CENTER · share right */}
            <div className="sfc-hero-bottom sfc-up sfc-d3">
              <Link href="/get-started" className="sfc-mini-link sfc-hb-left">
                Start investing
              </Link>

              <div className="sfc-hero-ctas">
                <a href="#platform" className="sfc-btn-ghost">
                  Explore <ArrowDown size={15} />
                </a>
                <Link href="/signup" className="sfc-btn-mint">
                  Open Account
                </Link>
              </div>

              <button
                type="button"
                className="sfc-mini-link sfc-share"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({ title: "Finvoq", url: window.location.href })
                      .catch(() => {});
                  }
                }}
              >
                Share <Share2 size={11} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Intro copy — three globe screens ─────────────────────────── */}
        <section className="sfc-screen">
          <Stars />
          <div className="sfc-screen-grid">
            <div />
            <Reveal>
              <h2 className="sfc-h2">
                New era
                <br />
                of investing
              </h2>
              <p className="sfc-lead">
                We&apos;re on the verge of a new investing era — where
                opportunities once reserved for institutions open up to every
                serious investor in India.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="sfc-screen">
          <Stars seed={9} />
          <div className="sfc-screen-grid">
            <Reveal>
              <h2 className="sfc-h2">
                Every asset,
                <br />
                one platform
              </h2>
              <p className="sfc-lead">
                Listed shares, unlisted opportunities, mutual funds, PMS, AIF,
                bonds and insurance — curated by experts and executed in
                seconds.
              </p>
            </Reveal>
            <div />
          </div>
        </section>

        <section className="sfc-screen">
          <Stars seed={17} />
          <div className="sfc-screen-grid">
            <div />
            <Reveal>
              <h2 className="sfc-h2">
                Building
                <br />
                your future
              </h2>
              <p className="sfc-lead">
                We connect India&apos;s leading asset managers with a clean,
                advisory-led platform — elegant infrastructure that takes your
                wealth to the future.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Platform ─────────────────────────────────────────────────── */}
        <section id="platform" className="sfc-platform">
          <div className="sfc-wrap">
            <div className="sfc-sec-head">
              <p className="sfc-eyebrow sfc-eyebrow-indigo">The Platform</p>
              <h2 className="sfc-h2-serif">
                A curated marketplace built like an institution and open to
                everyone.
              </h2>
            </div>

            <div className="sfc-feature-grid">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="sfc-feature">
                    <f.icon className="sfc-feature-icon" />
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────────────────── */}
        <section id="about" className="sfc-about">
          <div className="sfc-wrap sfc-about-grid">
            <div>
              <p className="sfc-eyebrow sfc-eyebrow-mint">About Finvoq</p>
              <h2 className="sfc-h2-serif">
                We&apos;re bringing the discipline of private banking to every
                investor.
              </h2>
            </div>
            <div className="sfc-about-copy">
              <p>
                Our team has spent a decade inside India&apos;s wealth industry
                building portfolios for families and institutions. We&apos;re
                rebuilding that experience as a platform any investor can walk
                into — advisory-led, transparent, and SEBI-registered.
              </p>
              <p>
                Finvoq is a marketplace for real ownership across asset classes
                — not another trading app. Every product carries real diligence,
                clear costs and a human advisor behind it.
              </p>
            </div>
          </div>

          <div className="sfc-wrap sfc-stats">
            {STATS.map((s, i) => (
              <Reveal key={s.l} delay={i * 100}>
                <div className="sfc-stat">
                  <div className="sfc-stat-v">{s.v}</div>
                  <div className="sfc-stat-l">{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Partners marquee ─────────────────────────────────────────── */}
        <section id="investors" className="sfc-partners">
          <div className="sfc-wrap">
            <p className="sfc-eyebrow sfc-eyebrow-indigo">Partnered with</p>
            <h2 className="sfc-h2-serif sfc-navy">
              India&apos;s leading asset managers and institutions.
            </h2>
          </div>
          <div className="sfc-marquee">
            <div className="sfc-marquee-track">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <div key={i} className="sfc-partner-tile" title={p.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── News ─────────────────────────────────────────────────────── */}
        <section id="news" className="sfc-news">
          <div className="sfc-wrap">
            <div className="sfc-news-head">
              <h2 className="sfc-h2-serif">Latest from Finvoq.</h2>
              <Link href="/news" className="sfc-mini-link">
                All news
              </Link>
            </div>

            <div className="sfc-news-grid">
              {POSTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 100}>
                  <Link href="/news" className="sfc-news-card">
                    <div className="sfc-news-meta">
                      <span>{p.tag}</span>
                      <span>{p.date}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <span className="sfc-news-read">
                      Read more <ArrowUpRight size={15} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer / CTA ─────────────────────────────────────────────── */}
        <footer id="signup" className="sfc-footer">
          <div className="sfc-wrap">
            <div className="sfc-footer-cta">
              <h2 className="sfc-h2-serif sfc-footer-title">
                Build your wealth&apos;s future with us.
              </h2>
              <div className="sfc-footer-form">
                <label>Get the weekly market brief</label>
                <div className="sfc-footer-input">
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="you@email.com"
                    aria-label="Email address"
                  />
                  <button
                    type="button"
                    onClick={onSubscribe}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Sending…"
                      : subscribed
                        ? "Subscribed ✓"
                        : "Sign up"}
                  </button>
                </div>
                <p>Curated insights every Monday. No promotions, no spam.</p>
              </div>
            </div>

            <div className="sfc-footer-links">
              <div className="sfc-footer-brand">
                <div className="sfc-footer-logo">
                  <span className="sfc-dot" />
                  <span>Finvoq</span>
                </div>
                <p>
                  India&apos;s premium investment marketplace. Multiple asset
                  classes, one platform, advisory-led.
                </p>
                <div className="sfc-footer-reg">
                  <span className="sfc-dot" />
                  SEBI Registered Investment Distributor
                </div>
              </div>
              <div>
                <div className="sfc-footer-col-title">Products</div>
                <ul>
                  <li>
                    <Link href="/products/equities">Equities</Link>
                  </li>
                  <li>
                    <Link href="/products/mutual-funds">Mutual Funds</Link>
                  </li>
                  <li>
                    <Link href="/products/pms">PMS</Link>
                  </li>
                  <li>
                    <Link href="/products/aif">AIF</Link>
                  </li>
                  <li>
                    <Link href="/products/fixed-deposits">FDs</Link>
                  </li>
                  <li>
                    <Link href="/products/bonds">Bonds</Link>
                  </li>
                  <li>
                    <Link href="/products/insurance">Insurance</Link>
                  </li>
                  <li>
                    <Link href="/unlisted">Unlisted</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="sfc-footer-col-title">Company</div>
                <ul>
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                  <li>
                    <Link href="/stories">Investor stories</Link>
                  </li>
                  <li>
                    <Link href="/faq">FAQ</Link>
                  </li>
                  <li>
                    <Link href="/get-started">Get started</Link>
                  </li>
                  <li>
                    <Link href="/careers">Careers</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="sfc-footer-col-title">Resources</div>
                <ul>
                  <li>
                    <Link href="/news">News</Link>
                  </li>
                  <li>
                    <Link href="/calculator">SIP Calculator</Link>
                  </li>
                  <li>
                    <Link href="/calculator/lumpsum">Lumpsum Calculator</Link>
                  </li>
                  <li>
                    <Link href="/calculator/goal-planner">Goal Planner</Link>
                  </li>
                  <li>
                    <Link href="/insights">Market Insights</Link>
                  </li>
                  <li>
                    <Link href="/glossary">Glossary</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="sfc-footer-col-title">Legal</div>
                <ul>
                  <li>
                    <Link href="/legal/terms">Terms of service</Link>
                  </li>
                  <li>
                    <Link href="/legal/privacy">Privacy policy</Link>
                  </li>
                  <li>
                    <Link href="/legal/risk-disclosure">Risk disclosure</Link>
                  </li>
                  <li>
                    <Link href="/legal/grievance">Grievance redressal</Link>
                  </li>
                  <li>
                    <Link href="/legal/investor-charter">Investor charter</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="sfc-footer-disclaim">
              <p>
                <strong>
                  Investments in securities markets are subject to market
                  risks.
                </strong>{" "}
                Read all related documents carefully before investing. Past
                performance does not guarantee future returns. Finvoq Wealth
                Pvt. Ltd. is a SEBI Registered Investment Distributor. Demat
                services are provided by SEBI registered portfolio management
                distributor.
              </p>
              <p>
                Risk Factors – Investments in Mutual Funds are subject to
                Market Risks. Read all scheme related documents carefully
                before investing. Mutual Fund Schemes do not assure or
                guarantee any returns. Past performances of any Mutual Fund
                Scheme may or may not be sustained in future. There is no
                guarantee that the investment objective of any suggested scheme
                shall be achieved. We deal in Regular Plans only for Mutual
                Fund Schemes and earn a Trailing Commission on client
                investments. Disclosure for commission earnings is made to
                clients at the time of investment. Option of Direct Plan for
                every Mutual Fund Scheme is available to investors offering
                advantage of lower expense ratio. We are not entitled to earn
                any commission on Direct plans; hence we do not deal in Direct
                Plans.
              </p>
            </div>

            <div className="sfc-footer-base">
              <span>
                © {new Date().getFullYear()} Finvoq Wealth Pvt. Ltd. — All
                rights reserved.
              </span>
              <span className="sfc-footer-made">
                Crafted with care · Delhi, India
              </span>
              <a href="#intro">Back to top ↑</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Scoped styles — the clone's exact palette, homepage only ───── */}
      <style jsx global>{`
        .sfc {
          --sfc-indigo: oklch(0.56 0.24 275);
          --sfc-navy: oklch(0.16 0.07 265);
          --sfc-mint: oklch(0.9 0.13 155);
          --sfc-base: oklch(0.1 0.05 265);
          position: relative;
          background-color: var(--sfc-base);
          color: #fff;
          font-family: var(--font-display);
        }
        .sfc-content {
          position: relative;
          z-index: 1;
        }
        .sfc-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }
        @media (min-width: 768px) {
          .sfc-wrap {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        /* Entrances */
        @keyframes sfcUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .sfc-up {
          opacity: 0;
          animation: sfcUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .sfc-d1 { animation-delay: 0.1s; }
        .sfc-d2 { animation-delay: 0.45s; }
        .sfc-d3 { animation-delay: 0.7s; }
        .sfc-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sfc-reveal.in {
          opacity: 1;
          transform: none;
        }

        /* ── Hero ── */
        .sfc-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background-color: oklch(0.56 0.24 275 / 0.92);
        }
        .sfc-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 158px 24px 40px;
        }
        @media (min-width: 768px) {
          .sfc-hero-inner {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        .sfc-h1 {
          font-weight: 300;
          color: #fff;
          font-size: clamp(2.5rem, 6.2vw, 6.6rem);
          line-height: 1.06;
          letter-spacing: -0.02em;
          /* SecuredFi composition: headline centered on the screen */
          text-align: center;
          max-width: 1150px;
          margin: clamp(24px, 7vh, 90px) auto 0;
        }
        .sfc-h1-em {
          position: relative;
          display: inline-block;
          font-style: italic;
        }
        .sfc-h1-underline {
          position: absolute;
          left: 0;
          right: 8px;
          bottom: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--sfc-mint);
          transform: scaleX(0);
          transform-origin: left;
          animation: sfcUnderline 0.7s ease-out forwards;
          animation-delay: 1s;
        }
        @keyframes sfcUnderline {
          to {
            transform: scaleX(1);
          }
        }
        .sfc-portrait {
          /* Floats on the right edge at mid-height, like the reference */
          position: absolute;
          right: clamp(16px, 4vw, 72px);
          top: 44%;
          transform: translateY(-50%);
          display: none;
          height: clamp(140px, 13vw, 190px);
          width: clamp(140px, 13vw, 190px);
          z-index: 3;
        }
        @media (min-width: 768px) {
          .sfc-portrait {
            display: block;
          }
        }
        /* Own entrance keyframes — the generic sfcUp ends at transform:none,
           which would erase this element's translateY(-50%) centring. */
        .sfc-portrait.sfc-up {
          animation-name: sfcPortraitIn;
        }
        @keyframes sfcPortraitIn {
          from {
            opacity: 0;
            transform: translateY(calc(-50% + 22px));
          }
          to {
            opacity: 1;
            transform: translateY(-50%);
          }
        }
        .sfc-portrait img {
          height: 100%;
          width: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        .sfc-portrait-play {
          position: absolute;
          bottom: -4px;
          right: -4px;
          display: flex;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff;
          color: var(--sfc-navy);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
          transition: transform 0.25s ease;
        }
        .sfc-portrait:hover .sfc-portrait-play {
          transform: scale(1.1);
        }
        .sfc-hero-bottom {
          /* link left · CTAs dead-centre · share right (reference layout) */
          margin-top: auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          gap: 16px;
          padding-top: 64px;
        }
        .sfc-hb-left {
          justify-self: start;
        }
        .sfc-hero-bottom .sfc-hero-ctas {
          justify-self: center;
        }
        .sfc-hero-bottom .sfc-share {
          justify-self: end;
        }
        @media (max-width: 767px) {
          .sfc-hero-bottom {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 20px;
          }
          .sfc-hb-left {
            justify-self: center;
          }
        }
        .sfc-mini-link {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.6);
          padding-bottom: 4px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          cursor: pointer;
        }
        .sfc-mini-link:hover {
          color: #fff;
        }
        .sfc-share {
          display: none;
        }
        @media (min-width: 768px) {
          .sfc-share {
            display: inline-flex;
          }
        }
        .sfc-hero-ctas {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sfc-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          transition: background 0.2s ease;
        }
        .sfc-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .sfc-btn-mint {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          background: var(--sfc-mint);
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 600;
          color: var(--sfc-navy);
          transition: filter 0.2s ease;
        }
        .sfc-btn-mint:hover {
          filter: brightness(0.95);
        }

        /* ── Intro screens ── */
        .sfc-screen {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: transparent;
        }
        .sfc-screen-grid {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          padding: 128px 24px;
        }
        @media (min-width: 768px) {
          .sfc-screen-grid {
            grid-template-columns: 1fr 1fr;
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        .sfc-h2 {
          font-weight: 300;
          font-size: clamp(2.5rem, 6vw, 6rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .sfc-lead {
          margin-top: 32px;
          max-width: 28rem;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.65;
        }
        .sfc-stars {
          pointer-events: none;
          position: absolute;
          inset: 0;
        }
        .sfc-stars span {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
        }

        /* ── Platform ── */
        .sfc-platform {
          position: relative;
          padding: 128px 0;
        }
        .sfc-sec-head {
          max-width: 48rem;
        }
        .sfc-eyebrow {
          font-size: 12px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }
        .sfc-eyebrow-indigo {
          color: oklch(0.72 0.17 275);
        }
        .sfc-eyebrow-mint {
          color: var(--sfc-mint);
        }
        .sfc-h2-serif {
          font-size: clamp(2.4rem, 5vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          font-weight: 400;
          margin: 0;
        }
        .sfc-feature-grid {
          margin-top: 80px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (min-width: 768px) {
          .sfc-feature-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .sfc-feature {
          background: rgba(255, 255, 255, 0.05);
          padding: 48px 40px;
          height: 100%;
          transition: background 0.25s ease;
        }
        .sfc-feature:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .sfc-feature-icon {
          height: 32px;
          width: 32px;
          color: var(--sfc-mint);
          margin-bottom: 32px;
        }
        .sfc-feature h3 {
          font-size: 28px;
          font-weight: 300;
          margin: 0 0 12px;
        }
        .sfc-feature p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.65;
          max-width: 28rem;
          margin: 0;
        }

        /* ── About ── */
        .sfc-about {
          position: relative;
          padding: 128px 0;
          background-color: var(--sfc-navy);
        }
        .sfc-about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
        }
        @media (min-width: 1024px) {
          .sfc-about-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .sfc-about-copy {
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.65;
        }
        @media (min-width: 1024px) {
          .sfc-about-copy {
            padding-top: 80px;
          }
        }
        .sfc-about-copy p {
          margin: 0;
        }
        .sfc-stats {
          margin-top: 96px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .sfc-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .sfc-stat {
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          padding-top: 24px;
        }
        .sfc-stat-v {
          font-size: clamp(2.6rem, 4vw, 3.6rem);
          font-weight: 400;
        }
        .sfc-stat-l {
          margin-top: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        /* ── Partners ── */
        .sfc-partners {
          background: #fff;
          color: var(--sfc-navy);
          padding: 128px 0;
        }
        .sfc-navy {
          color: var(--sfc-navy);
          max-width: 42rem;
        }
        .sfc-partners .sfc-wrap {
          margin-bottom: 64px;
        }
        .sfc-marquee {
          position: relative;
          overflow: hidden;
        }
        .sfc-marquee-track {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: sfcMarquee 40s linear infinite;
        }
        @keyframes sfcMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .sfc-marquee-item {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 48px;
          font-size: clamp(20px, 2.4vw, 30px);
          color: oklch(0.16 0.07 265 / 0.45);
        }
        /* Partner logo tiles — constant white ground so the artwork reads the
           same in light and dark theme. */
        .sfc-partner-tile {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 92px;
          width: 172px;
          margin: 0 14px;
          padding: 16px 22px;
          background: #fff;
          border: 1px solid oklch(0.16 0.07 265 / 0.12);
          border-radius: 18px;
          box-shadow: 0 8px 22px oklch(0.16 0.07 265 / 0.07);
        }
        .sfc-partner-tile img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          display: block;
        }
        .sfc-dot {
          display: inline-block;
          height: 6px;
          width: 6px;
          border-radius: 50%;
          background: var(--sfc-mint);
          flex-shrink: 0;
        }

        /* ── News ── */
        .sfc-news {
          position: relative;
          padding: 128px 0;
        }
        .sfc-news-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 64px;
          flex-wrap: wrap;
          gap: 24px;
        }
        .sfc-news-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .sfc-news-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .sfc-news-card {
          display: block;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          padding: 32px;
          height: 100%;
          transition: background 0.25s ease;
        }
        .sfc-news-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .sfc-news-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 32px;
        }
        .sfc-news-card h3 {
          font-size: 24px;
          font-weight: 400;
          line-height: 1.3;
          margin: 0 0 56px;
          min-height: 6rem;
          color: #fff;
        }
        .sfc-news-read {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--sfc-mint);
          transition: gap 0.2s ease;
        }
        .sfc-news-card:hover .sfc-news-read {
          gap: 12px;
        }

        /* ── Footer ── */
        .sfc-footer {
          position: relative;
          padding: 96px 0 40px;
        }
        .sfc-footer-cta {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
          padding-bottom: 64px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        @media (min-width: 1024px) {
          .sfc-footer-cta {
            grid-template-columns: 1.4fr 1fr;
          }
        }
        .sfc-footer-title {
          font-size: clamp(2.8rem, 6.4vw, 6.4rem);
          line-height: 0.98;
        }
        .sfc-footer-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .sfc-footer-form {
            padding-top: 32px;
          }
        }
        .sfc-footer-form label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.6);
        }
        .sfc-footer-input {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          padding-bottom: 8px;
        }
        .sfc-footer-input input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: none;
          font-size: 18px;
          color: #fff;
          min-width: 0;
        }
        .sfc-footer-input input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .sfc-footer-input button {
          border-radius: 999px;
          background: var(--sfc-mint);
          padding: 8px 24px;
          font-size: 14px;
          font-weight: 600;
          color: var(--sfc-navy);
          border: 0;
          cursor: pointer;
          white-space: nowrap;
        }
        .sfc-footer-input button:hover {
          filter: brightness(0.95);
        }
        .sfc-footer-form > p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }
        .sfc-footer-links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px 32px;
          padding: 64px 0;
          font-size: 14px;
        }
        @media (min-width: 1024px) {
          .sfc-footer-links {
            grid-template-columns: 1.7fr 1fr 1fr 1fr 1fr;
          }
        }
        .sfc-footer-brand {
          grid-column: span 2;
        }
        @media (min-width: 1024px) {
          .sfc-footer-brand {
            grid-column: span 1;
          }
        }
        .sfc-footer-reg {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 18px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
        }
        .sfc-footer-disclaim {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding: 28px 0 8px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sfc-footer-disclaim p {
          margin: 0;
          font-size: 11.5px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.45);
        }
        .sfc-footer-disclaim strong {
          color: rgba(255, 255, 255, 0.65);
        }
        .sfc-footer-made {
          display: none;
        }
        @media (min-width: 768px) {
          .sfc-footer-made {
            display: inline;
          }
        }
        .sfc-footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 24px;
        }
        .sfc-footer-brand p {
          color: rgba(255, 255, 255, 0.6);
          max-width: 24rem;
          line-height: 1.6;
          margin: 0;
        }
        .sfc-footer-col-title {
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 11px;
          margin-bottom: 16px;
        }
        .sfc-footer-links ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sfc-footer-links a:hover {
          color: var(--sfc-mint);
        }
        .sfc-footer-base {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          padding-top: 16px;
        }
        .sfc-footer-base a {
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .sfc-footer-base a:hover {
          color: #fff;
        }

        /* ── Homepage-only nav restyle (SecuredFi chrome) ──────────────────
           These globals live inside this page's styled-jsx, so they apply
           ONLY while the homepage is mounted and vanish on navigation:
           the full-width pill becomes a standalone logo pill on the left
           and a floating links/CTA pill on the RIGHT, like the clone. */
        .main-nav .nav-inner,
        .dark .main-nav .nav-inner {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
          max-width: 1400px;
        }
        /* One consistent pill height for every piece of the chrome. */
        .main-nav .logo {
          background: #fff;
          border-radius: 999px;
          height: 60px;
          display: flex;
          align-items: center;
          padding: 0 22px;
          box-shadow: 0 10px 30px rgba(4, 10, 40, 0.25);
        }
        /* Links + theme toggle + account join into a SINGLE right-side pill:
           the two elements are flush (no gap), each contributing one rounded
           end, sharing the same height and background. */
        .main-nav .nav-inner > nav {
          margin-left: auto;
          background: #fff;
          height: 60px;
          display: flex;
          align-items: center;
          border-radius: 999px 0 0 999px;
          padding: 0 6px 0 16px;
          box-shadow: 0 10px 30px rgba(4, 10, 40, 0.25);
        }
        .main-nav .nav-cta {
          background: #fff;
          height: 60px;
          align-items: center;
          border-radius: 0 999px 999px 0;
          padding: 0 12px 0 6px !important;
          margin-left: 0 !important;
          box-shadow: 0 10px 30px rgba(4, 10, 40, 0.25);
        }
        /* Dark theme keeps its dark pills (so the dark-mode logo stays
           visible) — the page behind them is blue either way. */
        .dark .main-nav .logo,
        .dark .main-nav .nav-inner > nav,
        .dark .main-nav .nav-cta {
          background: #0d1f1a;
        }
        @media (max-width: 760px) {
          .main-nav .nav-inner {
            margin: 0 14px !important;
          }
          .main-nav .logo {
            height: 52px;
            padding: 0 16px;
          }
          /* Links are hidden on phones — the controls become a full pill. */
          .main-nav .nav-cta {
            height: 52px;
            border-radius: 999px;
            padding: 0 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sfc-up,
          .sfc-h1-underline {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .sfc-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .sfc-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

/* Deterministic star-field overlay, same math as the clone. */
function Stars({ seed = 1 }: { seed?: number }) {
  const dots = Array.from({ length: 80 });
  return (
    <div className="sfc-stars" aria-hidden>
      {dots.map((_, i) => {
        const j = i + seed;
        const top = (j * 37) % 100;
        const left = (j * 53) % 100;
        const size = (j % 3) + 1;
        return (
          <span
            key={i}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: size,
              height: size,
              opacity: 0.3 + (j % 5) / 10
            }}
          />
        );
      })}
    </div>
  );
}

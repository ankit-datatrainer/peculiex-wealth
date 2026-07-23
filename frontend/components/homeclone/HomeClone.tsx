"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { postJSON } from "@/lib/api";
import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  Layers,
  LineChart,
  Menu,
  PieChart,
  Play,
  Search,
  Settings,
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
  const heroTrackRef = useRef<HTMLDivElement | null>(null);

  /* Drive the hero choreography (giant "Platform" sweep, headline lift,
     device parallax) with a single CSS variable set from scroll progress. */
  useEffect(() => {
    const el = heroTrackRef.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const total = Math.max(r.height - window.innerHeight, 1);
      const p = Math.min(1, Math.max(0, -r.top / total));
      if (Math.abs(p - last) > 0.0005) {
        el.style.setProperty("--hp", p.toFixed(4));
        last = p;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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
        {/* ── Hero — SecuredFi reference clone: centred headline over the
               particle globe dome, portrait right, docs/CTA/share row ──── */}
        <section id="intro" className="sfc-hero">
          <div className="sfc-hero-inner">
            <h1 className="sfc-h1 sfc-up sfc-d1">
              India&apos;s Curated Investment{" "}
              <br className="sfc-h1-br" />
              Marketplace meets{" "}
              <span className="sfc-h1-em">
                Advisory.
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

        {/* ── Pinned "All-in-one platform" panel — sits just before About */}
        <div className="sfc-hero-track" ref={heroTrackRef}>
          <Stars seed={3} />
          <section className="sfc-hero-panel">
            {/* Giant mint word sweeping across as you scroll */}
            <div className="sfc-giantword" aria-hidden>
              Platform
            </div>

            <div className="sfc-hero-inner">
              <h1 className="sfc-h1 sfc-up sfc-d1">
                All-in-one investment{" "}
                <span className="sfc-h1-em">
                  platform
                  <span className="sfc-h1-underline sfc-d3" />
                </span>{" "}
                for serious Indian investors
              </h1>

              <div className="sfc-hero-ctas sfc-up sfc-d2">
                <a href="#platform" className="sfc-btn-ghost">
                  Explore <ArrowDown size={15} />
                </a>
                <Link href="/signup" className="sfc-btn-mint">
                  Open Account
                </Link>
              </div>
            </div>

            {/* Device mockups — tablet + phone, cropped by the panel edge */}
            <div className="sfc-devices sfc-up sfc-d2" aria-hidden>
              <div className="sfc-tablet">
                <div className="sfc-tablet-screen">
                  <div className="sfc-tab-side">
                    <span className="sfc-tab-logo">
                      <span className="sfc-dot" />
                    </span>
                    <span className="sfc-tab-ico">
                      <PieChart size={16} />
                    </span>
                    <span className="sfc-tab-ico">
                      <LineChart size={16} />
                    </span>
                    <span className="sfc-tab-ico">
                      <Settings size={16} />
                    </span>
                  </div>
                  <div className="sfc-tab-main">
                    <div className="sfc-tab-head">
                      <div>
                        <b>Wealth Dashboard</b>
                        <span>By Finvoq</span>
                      </div>
                      <span className="sfc-tab-search">
                        <Search size={14} />
                      </span>
                    </div>
                    <div className="sfc-tab-tabs">
                      <span className="on">INVEST</span>
                      <span>TRACK</span>
                    </div>
                    <div className="sfc-tab-metric">
                      <label>PORTFOLIO XIRR</label>
                      <strong>18.20%</strong>
                    </div>
                    <div className="sfc-tab-row">
                      <span>ASSET</span>
                      <b>Nifty 50 Index Fund</b>
                    </div>
                    <div className="sfc-tab-row">
                      <span>SIP DATE</span>
                      <b>1st of every month</b>
                    </div>
                    <div className="sfc-tab-cta">DONE</div>
                  </div>
                </div>
              </div>

              <div className="sfc-phone">
                <div className="sfc-phone-screen">
                  <div className="sfc-ph-top">
                    <span className="sfc-ph-burger">
                      <Menu size={13} />
                    </span>
                    <span className="sfc-ph-ico">
                      <Bell size={12} />
                    </span>
                    <span className="sfc-ph-ico">
                      <Search size={12} />
                    </span>
                    <span className="sfc-ph-avatar" />
                  </div>
                  <label>BALANCE</label>
                  <strong>₹2.4Cr</strong>
                  <div className="sfc-ph-chart">
                    <span className="sfc-ph-chip">+18.2%</span>
                    <svg viewBox="0 0 220 96" preserveAspectRatio="none">
                      <path
                        d="M0,88 C34,86 48,44 76,42 C102,40 112,66 138,34 C158,10 186,16 220,12"
                        fill="none"
                        stroke="oklch(0.9 0.13 155)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="138"
                        cy="34"
                        r="4.5"
                        fill="oklch(0.9 0.13 155)"
                      />
                    </svg>
                  </div>
                  <div className="sfc-ph-dates">
                    <span>SEP 25</span>
                    <span>DEC 25</span>
                    <span>MAR 26</span>
                    <span>JUN 26</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Overlay card — rises over the pinned hero panel ──────────── */}
        <section id="platform" className="sfc-overcard">
          <div className="sfc-wrap">
            <div className="sfc-sec-head">
              <p className="sfc-eyebrow sfc-eyebrow-indigo">The Platform</p>
              <h2 className="sfc-h2-serif">
                A curated marketplace built like an institution and open to
                everyone.
              </h2>
            </div>

            <div className="sfc-feature-grid sfc-feature-grid-light">
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
              {[...PARTNERS.slice(0, 8), ...PARTNERS.slice(0, 8)].map(
                (p, i) => (
                  <div key={i} className="sfc-partner-tile" title={p.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </div>
                )
              )}
            </div>
            <div className="sfc-marquee-track sfc-marquee-rev">
              {[...PARTNERS.slice(8), ...PARTNERS.slice(8)].map((p, i) => (
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

        /* ── Hero — reference clone: centred headline over the globe dome ──
           NO background here: the ScrollGlobe canvas paints the hero blue
           itself (and cross-fades it to navy as the planet rises), so the
           solid planet + wave-band show through exactly like the reference. */
        .sfc-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }
        .sfc-hero .sfc-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          /* Fixed viewport height so the CTA row always sits in view at the
             bottom — content is sized to fit, never to push it below fold. */
          height: 100svh;
          min-height: 620px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(120px, 16svh, 170px) 24px 44px;
        }
        @media (min-width: 768px) {
          .sfc-hero .sfc-hero-inner {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        .sfc-hero .sfc-h1 {
          text-align: center;
          text-wrap: balance;
          font-size: clamp(2.3rem, 5vw, 5.4rem);
          max-width: 1100px;
          margin: clamp(8px, 4svh, 48px) auto 0;
        }
        /* Keep the centred headline clear of the floating portrait: cap its
           width so its right edge never reaches the portrait zone. The
           portrait only renders ≥1100px, so the cap applies there too. */
        @media (min-width: 1100px) {
          .sfc-hero .sfc-h1 {
            max-width: min(1100px, calc(100vw - 580px));
          }
        }
        .sfc-h1-br {
          display: none;
        }
        @media (min-width: 1024px) {
          .sfc-h1-br {
            display: block;
          }
        }
        .sfc-portrait {
          position: absolute;
          right: clamp(16px, 4vw, 72px);
          top: 44%;
          transform: translateY(-50%);
          display: none;
          height: clamp(140px, 13vw, 190px);
          width: clamp(140px, 13vw, 190px);
          z-index: 3;
        }
        /* Only render where the capped headline leaves it clear space */
        @media (min-width: 1100px) {
          .sfc-portrait {
            display: block;
          }
        }
        /* Own entrance keyframes — generic sfcUp ends at transform:none,
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
        .sfc-share {
          display: none;
        }
        @media (min-width: 768px) {
          .sfc-share {
            display: inline-flex;
          }
        }

        /* ── Pinned platform panel + overlay handoff ──
           The track is taller than the viewport; the blue panel pins inside
           it while the giant word sweeps, then the white overlay card
           (margin-top: -100vh) rises over the still-pinned panel. */
        .sfc-hero-track {
          --hp: 0;
          position: relative;
          height: 280vh;
          z-index: 1;
        }
        .sfc-hero-track > .sfc-stars {
          position: fixed;
          height: 100vh;
        }
        .sfc-hero-panel {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          margin: 0 10px;
          border-radius: 0 0 44px 44px;
          background-color: oklch(0.56 0.24 275);
          box-shadow: 0 40px 90px oklch(0.1 0.05 265 / 0.55);
        }
        @media (min-width: 768px) {
          .sfc-hero-panel {
            border-radius: 44px;
            margin: 12px 12px 0;
            height: calc(100vh - 12px);
          }
        }
        /* Giant mint word — sweeps right-to-left with scroll */
        .sfc-giantword {
          position: absolute;
          bottom: -0.28em;
          left: 0;
          z-index: 1;
          font-size: clamp(220px, 34vw, 560px);
          font-weight: 300;
          letter-spacing: -0.045em;
          line-height: 1;
          white-space: nowrap;
          color: var(--sfc-mint);
          pointer-events: none;
          opacity: min(1, calc(var(--hp) * 3));
          transform: translateX(calc(30vw - var(--hp) * 95vw));
          will-change: transform, opacity;
        }
        .sfc-hero-panel .sfc-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: clamp(120px, 18vh, 190px) 24px 40px;
          transform: translateY(calc(var(--hp) * -14vh));
          opacity: calc(1 - var(--hp) * 1.6);
          will-change: transform, opacity;
        }
        @media (min-width: 768px) {
          .sfc-hero-panel .sfc-hero-inner {
            padding-left: clamp(40px, 5vw, 88px);
            padding-right: 40px;
          }
        }
        .sfc-h1 {
          font-weight: 300;
          color: #fff;
          font-size: clamp(2.6rem, 5.6vw, 6rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          margin: 0;
        }
        /* Panel composition: headline left-aligned, upper half */
        .sfc-hero-panel .sfc-h1 {
          text-align: left;
          max-width: 13em;
        }
        .sfc-hero-panel .sfc-hero-ctas {
          margin-top: clamp(28px, 4.5vh, 48px);
        }
        /* Device mockups, bottom-right, cropped by the panel edge */
        .sfc-devices {
          position: absolute;
          z-index: 2;
          right: max(-60px, -4vw);
          bottom: -70px;
          display: none;
          transform: translateY(calc(var(--hp) * 10vh));
          will-change: transform;
        }
        @media (min-width: 900px) {
          .sfc-devices {
            display: block;
          }
        }
        .sfc-tablet {
          width: clamp(520px, 46vw, 760px);
          border-radius: 34px;
          background: #0b0b10;
          padding: 16px;
          box-shadow: 0 50px 100px oklch(0.1 0.05 265 / 0.5);
        }
        .sfc-tablet-screen {
          display: flex;
          gap: 14px;
          border-radius: 22px;
          background: #fbfaf7;
          padding: 18px;
          min-height: 380px;
          color: var(--sfc-navy);
        }
        .sfc-tab-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          background: var(--sfc-indigo);
          padding: 14px 10px;
          color: #fff;
        }
        .sfc-tab-logo {
          display: flex;
          height: 30px;
          width: 30px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.16);
          margin-bottom: 6px;
        }
        .sfc-tab-ico {
          display: flex;
          height: 34px;
          width: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
        }
        .sfc-tab-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 6px 8px;
        }
        .sfc-tab-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .sfc-tab-head b {
          display: block;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .sfc-tab-head span:not(.sfc-tab-search) {
          font-size: 11px;
          color: oklch(0.16 0.07 265 / 0.5);
        }
        .sfc-tab-search {
          display: flex;
          height: 32px;
          width: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid oklch(0.16 0.07 265 / 0.15);
        }
        .sfc-tab-tabs {
          display: flex;
          border-radius: 12px;
          background: oklch(0.16 0.07 265 / 0.06);
          padding: 4px;
          font-size: 11px;
          letter-spacing: 0.14em;
          font-weight: 600;
        }
        .sfc-tab-tabs span {
          flex: 1;
          text-align: center;
          padding: 8px 0;
          border-radius: 9px;
          color: oklch(0.16 0.07 265 / 0.45);
        }
        .sfc-tab-tabs span.on {
          background: #fff;
          color: var(--sfc-navy);
          box-shadow: 0 2px 8px oklch(0.16 0.07 265 / 0.12);
        }
        .sfc-tab-metric {
          border-radius: 14px;
          border: 1px solid oklch(0.16 0.07 265 / 0.1);
          background: #fff;
          padding: 14px 16px;
        }
        .sfc-tab-metric label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: oklch(0.16 0.07 265 / 0.5);
          margin-bottom: 4px;
        }
        .sfc-tab-metric strong {
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .sfc-tab-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 12px;
          background: #fff;
          border: 1px solid oklch(0.16 0.07 265 / 0.08);
          padding: 11px 16px;
          font-size: 13px;
        }
        .sfc-tab-row span {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: oklch(0.16 0.07 265 / 0.5);
        }
        .sfc-tab-cta {
          margin-top: auto;
          border-radius: 12px;
          background: var(--sfc-indigo);
          color: #fff;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.2em;
          font-weight: 600;
          padding: 13px 0;
        }
        .sfc-phone {
          position: absolute;
          left: -150px;
          bottom: 26px;
          width: 250px;
          border-radius: 38px;
          background: #0b0b10;
          padding: 10px;
          box-shadow: 0 40px 80px oklch(0.1 0.05 265 / 0.55);
        }
        .sfc-phone-screen {
          border-radius: 30px;
          background: var(--sfc-indigo);
          padding: 18px 16px 22px;
          color: #fff;
          min-height: 330px;
          display: flex;
          flex-direction: column;
        }
        .sfc-ph-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
        }
        .sfc-ph-burger {
          display: flex;
          height: 30px;
          width: 30px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff;
          color: var(--sfc-navy);
        }
        .sfc-ph-ico {
          display: flex;
          height: 26px;
          width: 26px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.14);
          margin-left: auto;
        }
        .sfc-ph-ico + .sfc-ph-ico {
          margin-left: 0;
        }
        .sfc-ph-avatar {
          height: 26px;
          width: 26px;
          border-radius: 50%;
          background: var(--sfc-mint);
        }
        .sfc-phone-screen label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.65);
        }
        .sfc-phone-screen strong {
          font-size: 40px;
          font-weight: 500;
          letter-spacing: -0.02em;
          margin-top: 2px;
        }
        .sfc-ph-chart {
          position: relative;
          margin-top: 18px;
          flex: 1;
        }
        .sfc-ph-chart svg {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
        }
        .sfc-ph-chip {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 999px;
          background: var(--sfc-mint);
          color: var(--sfc-navy);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          z-index: 1;
        }
        .sfc-ph-dates {
          display: flex;
          justify-content: space-between;
          font-size: 8.5px;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 12px;
        }

        /* ── Overlay card — rises over the pinned hero ── */
        .sfc-overcard {
          position: relative;
          z-index: 3;
          margin-top: -100vh;
          border-radius: 44px 44px 0 0;
          background: #f6f4ef;
          color: var(--sfc-navy);
          padding: clamp(96px, 12vh, 150px) 0 128px;
          box-shadow: 0 -30px 80px oklch(0.1 0.05 265 / 0.35);
        }
        .sfc-overcard .sfc-h2-serif {
          color: var(--sfc-navy);
        }
        .sfc-feature-grid-light {
          background: oklch(0.16 0.07 265 / 0.1);
          border-color: oklch(0.16 0.07 265 / 0.1);
        }
        .sfc-feature-grid-light .sfc-feature {
          background: #fff;
        }
        .sfc-feature-grid-light .sfc-feature:hover {
          background: #fbfaf6;
        }
        .sfc-feature-grid-light .sfc-feature-icon {
          color: var(--sfc-indigo);
        }
        .sfc-feature-grid-light .sfc-feature p {
          color: oklch(0.16 0.07 265 / 0.65);
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
          padding: 18px 0 34px;
          /* Soft edge fade so tiles glide in/out instead of hard-cutting */
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
        }
        .sfc-marquee-track {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: sfcMarquee 46s linear infinite;
        }
        .sfc-marquee:hover .sfc-marquee-track {
          animation-play-state: paused;
        }
        /* Second row glides the opposite way, slightly slower */
        .sfc-marquee-rev {
          margin-top: 24px;
          animation-direction: reverse;
          animation-duration: 54s;
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
        /* Partner logo tiles — premium treatment: quiet monochrome cards
           that bloom to full colour and lift on hover. Constant white ground
           so the artwork reads the same in light and dark theme. */
        .sfc-partner-tile {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 104px;
          width: 208px;
          margin: 0 12px;
          padding: 24px 34px;
          background: linear-gradient(180deg, #fff 0%, #fafbfd 100%);
          border: 1px solid oklch(0.16 0.07 265 / 0.08);
          border-radius: 20px;
          box-shadow:
            0 1px 2px oklch(0.16 0.07 265 / 0.05),
            0 12px 32px -14px oklch(0.16 0.07 265 / 0.16);
          transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.35s ease;
          cursor: default;
        }
        .sfc-partner-tile:hover {
          transform: translateY(-6px);
          border-color: oklch(0.56 0.24 275 / 0.35);
          box-shadow:
            0 1px 2px oklch(0.16 0.07 265 / 0.05),
            0 24px 48px -16px oklch(0.56 0.24 275 / 0.3);
        }
        .sfc-partner-tile img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          display: block;
          filter: grayscale(1) opacity(0.62);
          transition: filter 0.35s ease, transform 0.35s ease;
        }
        .sfc-partner-tile:hover img {
          filter: none;
          transform: scale(1.05);
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

        /* ── Homepage nav ──────────────────────────────────────────────────
           The site's own nav pill already matches the reference chrome: ONE
           continuous white pill holding the logo, links, theme toggle and
           account together — no separators. No overrides needed; only widen
           it to this page's 1400px container so it lines up with the hero. */
        .main-nav .nav-inner {
          max-width: 1400px;
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

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
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Zap
} from "lucide-react";
import ScrollGlobe from "./ScrollGlobe";
import HeroInfinityStage from "./HeroInfinityStage";
import HeroHeadlineAdditions from "./HeroHeadlineAdditions";

import Logo from "../Logo";
import CountUp from "../CountUp";
import { useContent, imgSrc } from "@/lib/content";
import {
  DEMAT_DISCLOSURE,
  REGISTRATION_CODES_LINE,
  REGISTRATION_LINE,
  REGISTRATION_NUMBER,
  REGULATORY_LABEL
} from "@/lib/siteFacts";
import { SOCIAL_ICON_PATHS } from "@/lib/socialIcons";
import {
  contactFrom,
  footerColumnsFrom,
  socialFrom,
  whatsappFrom,
  type FooterColumn
} from "@/lib/siteSettings";

/** Render a CMS multi-line value, keeping the author's line breaks. */
function lines(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

/* Feature-card icons, keyed by the name stored in the content manager. */
const ICONS: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  chart: LineChart,
  layers: Layers,
  zap: Zap
};

/* ────────────────────────────────────────────────────────────────────────────
   SecuredFi-style homepage, a 1:1 layout port of the clone build
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

/* Footer link columns as they ship; the CMS (Global → Footer link columns)
   replaces these wholesale. Kept so the footer still navigates if the content
   API is unreachable. */
const HOME_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Products",
    links: [
      { label: "Equities", href: "/products/equities" },
      { label: "Mutual Funds", href: "/products/mutual-funds" },
      { label: "PMS", href: "/products/pms" },
      { label: "AIF", href: "/products/aif" },
      { label: "FDs", href: "/products/fixed-deposits" },
      { label: "Bonds", href: "/products/bonds" },
      { label: "Insurance", href: "/products/insurance" },
      { label: "Unlisted", href: "/unlisted" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Investor stories", href: "/stories" },
      { label: "FAQ", href: "/faq" },
      { label: "Get started", href: "/get-started" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "News", href: "/news" },
      { label: "SIP Calculator", href: "/calculator" },
      { label: "Lumpsum Calculator", href: "/calculator/lumpsum" },
      { label: "Goal Planner", href: "/calculator/goal-planner" },
      { label: "Market Insights", href: "/insights" },
      { label: "Glossary", href: "/glossary" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Risk disclosure", href: "/legal/risk-disclosure" },
      { label: "Grievance redressal", href: "/legal/grievance" },
      { label: "Investor charter", href: "/legal/investor-charter" }
    ]
  }
];

/* Fallbacks: what renders until a super admin edits these in the CMS. */
const FEATURES = [
  {
    icon: "shield",
    title: "Bank-grade security",
    desc: "RBI & SEBI compliant. End-to-end encryption and annual third-party audits. Your wealth, fully protected."
  },
  {
    icon: "chart",
    title: "Curated by experts",
    desc: "Every product is hand-picked by SEBI-registered advisors. We say no to nine out of ten opportunities we evaluate."
  },
  {
    icon: "layers",
    title: "One unified platform",
    desc: "Equities, mutual funds, unlisted, PMS, AIF, bonds, insurance, and a single dashboard that ties it all together."
  },
  {
    icon: "zap",
    title: "Real-time execution",
    desc: "From research to investing, completed in seconds. Live BSE prices, no paperwork, no waiting."
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
   theme: the tile is the constant background, never the page. */
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

// Each card gets its own destination and its own link text: three cards that
// all pointed at /news behind an identical "Read more" anchor were a
// usability, SEO and screen-reader problem at once.
const POSTS = [
  {
    tag: "Markets",
    date: "Live",
    title: "Track every BSE share with real-time prices and watchlists",
    href: "/markets",
    cta: "Open live markets"
  },
  {
    tag: "Insights",
    date: "Weekly",
    title: "How our advisors curate unlisted opportunities before they list",
    href: "/unlisted",
    cta: "Browse unlisted opportunities"
  },
  {
    tag: "Company",
    date: "Beta",
    title: "Finvoq opens its doors: India's advisory-led investment marketplace",
    href: "/about",
    cta: "About Finvoq"
  }
];

export default function HomeClone() {
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const heroTrackRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  // Copy and imagery come from the super-admin content manager, falling back
  // to the values below whenever a field has not been edited.
  const c = useContent("home");
  /* Site chrome (nav/footer/WhatsApp/social) lives on the `global` page, so
     editing the number or a footer column updates this footer and the one on
     every other page from a single place in the Content Manager. */
  const g = useContent("global");
  const footerColumns = footerColumnsFrom(g, HOME_FOOTER_COLUMNS);
  const social = socialFrom(g);
  const whatsapp = whatsappFrom(g);
  const contact = contactFrom(g);
  /* Optional uploaded artwork for the hero mark. Empty by default, in which
     case the drawn <GoldInfinity /> is used instead. */
  const heroInfinity = c.t("hero", "infinity", "").trim();

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

  /* Green pigment that follows the cursor across the white hero.
     The listener only records the last position; the CSS variables are
     written once per frame, so a fast mouse can't cause a style write per
     mousemove event (which is what makes cursor glows feel janky). */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A cursor glow is meaningless on touch, where there is no hover.
    if (!window.matchMedia("(hover: hover)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let dirty = false;

    const flush = () => {
      raf = 0;
      if (!dirty) return;
      dirty = false;
      el.style.setProperty("--sfc-mx", `${x.toFixed(1)}px`);
      el.style.setProperty("--sfc-my", `${y.toFixed(1)}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      dirty = true;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onEnter = () => el.style.setProperty("--sfc-glow", "1");
    const onLeave = () => el.style.setProperty("--sfc-glow", "0");

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
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
        {/* ── Hero: SecuredFi reference clone: centred headline over the
               particle globe dome, portrait right, docs/CTA/share row ──── */}
        <section
          id="intro"
          className="sfc-hero"
          data-nav-theme="light"
          ref={heroRef}
        >
          {/* Cursor-tracked green pigment. Decorative, so it is inert to
              pointer events and never intercepts a click on the CTAs. */}
          <span className="sfc-hero-pigment" aria-hidden="true" />
          <div className="sfc-hero-inner">
            {/* Mark + headline share one flex child so the inner column keeps
                its original two-child space-between rhythm. */}
            {/* Headline left, animated mark right. Both live in one flex
                child so the inner column keeps its two-child rhythm. */}
            <div className="sfc-hero-lede">
              <div className="sfc-hero-headline-wrap">
                <h1 className="sfc-h1 sfc-up sfc-d1">
                  {c.t("hero", "titleA", "Invest with clarity")}{" "}
                  <br className="sfc-h1-br" />
                  {c.t("hero", "titleB", "across every")}{" "}
                  <span className="sfc-h1-em">
                    {c.t("hero", "titleAccent", "asset class.")}
                  </span>
                </h1>

                {/* Trust Radar & Micro-Metrics Strip */}
                <HeroHeadlineAdditions />
              </div>

              {/* Golden Infinity Artwork */}
              <div className="sfc-hero-mark sfc-up sfc-d2">
                <HeroInfinityStage heroInfinity={heroInfinity} />
              </div>
            </div>

            {/* Bottom row: link left · share right */}
            <div className="sfc-hero-bottom sfc-up sfc-d3">
              <Link
                href={c.t("hero", "linkHref", "/get-started")}
                className="sfc-mini-link sfc-hb-left"
              >
                {c.t("hero", "linkLabel", "Start investing")}
              </Link>

              <button
                type="button"
                className="sfc-mini-link sfc-share"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({ title: "Finvoq", url: window.location.href })
                      .catch(() => { });
                  }
                }}
              >
                Share <Share2 size={11} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Intro copy: three globe screens ─────────────────────────── */}
        <section className="sfc-screen" data-nav-theme="dark">
          <Stars />
          <div className="sfc-screen-grid">
            <div />
            <Reveal>
              <h2 className="sfc-h2">{lines(c.t("screens", "oneTitle", "New era\nof investing"))}</h2>
              <p className="sfc-lead">{c.t("screens", "oneBody", "We’re on the verge of a new investing era, where opportunities once reserved for institutions open up to every serious investor in India.")}</p>
            </Reveal>
          </div>
        </section>

        <section className="sfc-screen" data-nav-theme="dark">
          <Stars seed={9} />
          <div className="sfc-screen-grid">
            <Reveal>
              <h2 className="sfc-h2">{lines(c.t("screens", "twoTitle", "Every asset,\none platform"))}</h2>
              <p className="sfc-lead">{c.t("screens", "twoBody", "Listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds and insurance: curated by experts and executed in seconds.")}</p>
            </Reveal>
            <div />
          </div>
        </section>

        <section className="sfc-screen" data-nav-theme="dark">
          <Stars seed={17} />
          <div className="sfc-screen-grid">
            <div />
            <Reveal>
              <h2 className="sfc-h2">{lines(c.t("screens", "threeTitle", "Building\nyour future"))}</h2>
              <p className="sfc-lead">{c.t("screens", "threeBody", "We connect India's leading asset managers with a clean, advisory-led platform: elegant infrastructure that takes your wealth to the future.")}</p>
            </Reveal>
          </div>
        </section>

        {/* ── Pinned "All-in-one platform" panel: sits just before About */}
        <div className="sfc-hero-track" data-nav-theme="dark" ref={heroTrackRef}>
          <Stars seed={3} />
          <section className="sfc-hero-panel">
            {/* Giant mint word sweeping across as you scroll */}
            <div className="sfc-giantword" aria-hidden>{c.t("platform", "sweepWord", "Platform")}</div>

            <div className="sfc-hero-inner">
              <h1 className="sfc-h1 sfc-up sfc-d1">
                {c.t("platform", "titleA", "All-in-one investment")}{" "}
                <span className="sfc-h1-em">{c.t("platform", "titleAccent", "platform")}</span>{" "}{c.t("platform", "titleB", "for serious Indian investors")}
              </h1>

              <div className="sfc-hero-ctas sfc-up sfc-d2">
                <a href={c.t("platform", "ctaGhostHref", "#platform")} className="sfc-btn-ghost">
                  {c.t("platform", "ctaGhost", "Explore")} <ArrowDown size={15} />
                </a>
                <Link href={c.t("platform", "ctaPrimaryHref", "/signup")} className="sfc-btn-mint">
                  {c.t("platform", "ctaPrimary", "Open Account")}
                </Link>
              </div>
            </div>

            {/* Device mockups: tablet + phone, cropped by the panel edge */}
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
                        <b>{c.t("platform", "deviceTitle", "Wealth Dashboard")}</b>
                        <span>{c.t("platform", "deviceSubtitle", "By Finvoq")}</span>
                      </div>
                      <span className="sfc-tab-search">
                        <Search size={14} />
                      </span>
                    </div>
                    <div className="sfc-tab-tabs">
                      <span className="on">{c.t("platform", "tabOne", "INVEST")}</span>
                      <span>{c.t("platform", "tabTwo", "TRACK")}</span>
                    </div>
                    <div className="sfc-tab-metric">
                      <label>{c.t("platform", "metricLabel", "PORTFOLIO XIRR")}</label>
                      <strong>{c.t("platform", "metricValue", "18.20%")}</strong>
                    </div>
                    <div className="sfc-tab-row">
                      <span>{c.t("platform", "rowOneLabel", "ASSET")}</span>
                      <b>{c.t("platform", "rowOneValue", "Nifty 50 Index Fund")}</b>
                    </div>
                    <div className="sfc-tab-row">
                      <span>{c.t("platform", "rowTwoLabel", "SIP DATE")}</span>
                      <b>{c.t("platform", "rowTwoValue", "1st of every month")}</b>
                    </div>
                    <div className="sfc-tab-cta">{c.t("platform", "deviceCta", "DONE")}</div>
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
                  <label>{c.t("platform", "phoneLabel", "BALANCE")}</label>
                  <strong>{c.t("platform", "phoneValue", "₹2.4Cr")}</strong>
                  <div className="sfc-ph-chart">
                    <span className="sfc-ph-chip">{c.t("platform", "phoneChip", "+18.2%")}</span>
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

        {/* ── Overlay card: rises over the pinned hero panel ──────────── */}
        <section id="platform" className="sfc-overcard">
          <div className="sfc-wrap">
            <div className="sfc-sec-head">
              <p className="sfc-eyebrow sfc-eyebrow-indigo">{c.t("features", "eyebrow", "The Platform")}</p>
              <h2 className="sfc-h2-serif">{c.t("features", "title", "A curated marketplace built like an institution and open to everyone.")}</h2>
            </div>

            <div className="sfc-feature-grid sfc-feature-grid-light">
              {c.list("features", "items", FEATURES).map((f: any, i: number) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="sfc-feature">
                    {(() => { const I = ICONS[f.icon] || ShieldCheck; return <I className="sfc-feature-icon" />; })()}
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────────────────── */}
        <section id="about" className="sfc-about" data-nav-theme="dark">
          <div className="sfc-wrap sfc-about-grid">
            <div>
              <p className="sfc-eyebrow sfc-eyebrow-mint">{c.t("about", "eyebrow", "About Finvoq")}</p>
              <h2 className="sfc-h2-serif">{c.t("about", "title", "We’re bringing the discipline of private banking to every investor.")}</h2>
            </div>
            <div className="sfc-about-copy">
              <p>
                {c.t(
                  "about",
                  "bodyOne",
                  "Our team has spent a decade inside India's wealth industry building portfolios for families and institutions. We're rebuilding that experience as a platform any investor can walk into: advisory-led, transparent, and SEBI-registered."
                )}
              </p>
              <p>
                {c.t(
                  "about",
                  "bodyTwo",
                  "Finvoq is a marketplace for real ownership across asset classes, not another trading app. Every product carries real diligence, clear costs and a human advisor behind it."
                )}
              </p>
            </div>
          </div>

          <div className="sfc-wrap sfc-stats">
            {c.list("about", "stats", STATS).map((s, i) => (
              <Reveal key={s.l} delay={i * 100}>
                <div className="sfc-stat">
                  <div className="sfc-stat-v"><CountUp value={s.v} /></div>
                  <div className="sfc-stat-l">{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Partners marquee ─────────────────────────────────────────── */}
        <section id="investors" className="sfc-partners">
          <div className="sfc-wrap">
            <p className="sfc-eyebrow sfc-eyebrow-indigo">{c.t("partners", "eyebrow", "Partnered with")}</p>
            <h2 className="sfc-h2-serif sfc-navy">{c.t("partners", "title", "India's leading asset managers and institutions.")}</h2>
            {/* A logo wall with no caption reads as endorsement. State the
                relationship plainly so it can't be misread. */}
            <p className="sfc-partners-note">
              {c.t(
                "partners",
                "note",
                "We distribute products from these asset managers. Their marks are shown to identify the funds available on Finvoq and do not imply any endorsement of Finvoq by them."
              )}
            </p>
          </div>
          {/* Split down the middle so both marquee rows stay full however many
              logos an admin adds — a fixed slice(0,8) left the second row
              empty as soon as the list shrank. */}
          {(() => {
            const logos = c.list<{ name: string; img: string }>(
              "partners",
              "items",
              PARTNERS
            ).filter((p) => p.img?.trim());
            const half = Math.ceil(logos.length / 2);
            const rowA = logos.slice(0, half);
            const rowB = logos.slice(half).length ? logos.slice(half) : rowA;
            return (
              <div className="sfc-marquee">
                <div className="sfc-marquee-track">
                  {[...rowA, ...rowA].map((p, i) => (
                    <div key={i} className="sfc-partner-tile" title={p.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgSrc(p.img)} alt={p.name} loading="lazy" />
                    </div>
                  ))}
                </div>
                <div className="sfc-marquee-track sfc-marquee-rev">
                  {[...rowB, ...rowB].map((p, i) => (
                    <div key={i} className="sfc-partner-tile" title={p.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgSrc(p.img)} alt={p.name} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── News ─────────────────────────────────────────────────────── */}
        <section id="news" className="sfc-news" data-nav-theme="dark">
          <div className="sfc-wrap">
            <div className="sfc-news-head">
              <h2 className="sfc-h2-serif">{c.t("news", "title", "Latest from Finvoq.")}</h2>
              <Link href={c.t("news", "linkHref", "/news")} className="sfc-mini-link">
                {c.t("news", "linkLabel", "All news")}
              </Link>
            </div>

            <div className="sfc-news-grid">
              {c.list("news", "items", POSTS).map((p: any, i: number) => (
                <Reveal key={p.title} delay={i * 100}>
                  <Link
                    href={p.href || "/news"}
                    className="sfc-news-card"
                    aria-label={`Read: ${p.title}`}
                  >
                    <div className="sfc-news-meta">
                      <span>{p.tag}</span>
                      <span>{p.date}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <span className="sfc-news-read">
                      {p.cta || "Read the full story"} <ArrowUpRight size={15} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer / CTA ─────────────────────────────────────────────── */}
        <footer id="signup" className="sfc-footer" data-nav-theme="dark">
          <div className="sfc-wrap">
            <div className="sfc-footer-cta">
              <h2 className="sfc-h2-serif sfc-footer-title">{c.t("footerCta", "title", "Build your wealth’s future with us.")}</h2>
              <div className="sfc-footer-form">
                <label>{c.t("footerCta", "formLabel", "Get the weekly market brief")}</label>
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
                        : c.t("footerCta", "button", "Sign up")}
                  </button>
                </div>
                <p>{c.t("footerCta", "note", "Curated insights every Monday. No promotions, no spam.")}</p>
              </div>
            </div>

            <div className="sfc-footer-links">
              <div className="sfc-footer-brand">
                <div className="sfc-footer-logo">
                  {/* This footer is navy in BOTH themes, so the logo must be
                      pinned to the light-ink file. Following the site theme
                      here serves the dark-ink logo in light mode, which is
                      invisible against the navy. */}
                  <Logo width={176} height={70} forceDark />
                </div>
                <p>
                  {c.t("footerCta", "blurb", "India's premium investment marketplace. Multiple asset classes, one platform, advisory-led.")}
                </p>
                <div className="sfc-footer-reg">
                  <span className="sfc-dot" />{c.t("footerCta", "badge", REGISTRATION_LINE)}
                </div>
                {/* Direct routes + socials. The homepage footer had neither,
                    so the highest-traffic page was the one page with no way
                    to reach us without another click. */}
                <ul className="sfc-footer-contact">
                  {whatsapp.href ? (
                    <li>
                      <a href={whatsapp.href} target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                          <path d={SOCIAL_ICON_PATHS.whatsapp} />
                        </svg>
                        WhatsApp {whatsapp.display}
                      </a>
                    </li>
                  ) : null}
                  <li>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </li>
                </ul>
                {social.length > 0 ? (
                  <div className="sfc-footer-social" aria-label="Social links">
                    {social.map((s) => (
                      <a
                        key={s.id}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
                          <path d={SOCIAL_ICON_PATHS[s.id]} />
                        </svg>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <div className="sfc-footer-col-title">{col.title}</div>
                  <ul>
                    {col.links.map((l) => (
                      <li key={`${l.href}-${l.label}`}>
                        <Link href={l.href}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="sfc-footer-disclaim">
              <p>
                <strong>
                  Investments in securities markets are subject to market
                  risks.
                </strong>{" "}
                Read all related documents carefully before investing. Past
                performance does not guarantee future returns. Finvoq Wealth
                Pvt. Ltd. is an {REGULATORY_LABEL}
                {REGISTRATION_NUMBER ? ` (${REGISTRATION_NUMBER})` : ""}.{" "}
                {DEMAT_DISCLOSURE}
              </p>
              {/* Mandated risk-factor text, collapsed. Keeps the disclosure
                  complete without ending the homepage in 200 words of grey. */}
              <details className="sfc-footer-legal">
                <summary>
                  <span>Full risk factors &amp; commission disclosure</span>
                  <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                    <path
                      d="M2.5 4.5L6 8l3.5-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <p>
                  Risk Factors: Investments in Mutual Funds are subject to
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
              </details>
              {REGISTRATION_CODES_LINE ? (
                <p className="sfc-footer-codes">{REGISTRATION_CODES_LINE}</p>
              ) : null}
            </div>

            {/* Oversized wordmark closes the page deliberately. Decorative:
                the accessible brand name is in the footer logo above. */}
            <div className="sfc-footer-wordmark" aria-hidden="true">
              <span>Finvoq</span>
            </div>

            <div className="sfc-footer-base">
              <span>
                © {new Date().getFullYear()} Finvoq Wealth Pvt. Ltd. All
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

      {/* ── Scoped styles: the clone's exact palette, homepage only ───── */}
      <style jsx global>{`
        .sfc {
          --sfc-indigo: oklch(0.56 0.24 275);
          --sfc-navy: oklch(0.16 0.07 265);
          --sfc-mint: oklch(0.9 0.13 155);
          --sfc-base: oklch(0.1 0.05 265);
          /* Hero ground is white, so the hero needs its own dark ink and a
             brand green for accents. The story screens below stay navy and
             keep using #fff, hence these are hero-scoped in use. */
          --sfc-ink: #0f2a2b;
          --sfc-green: #13735d;
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
          /* Seeded off-centre so the pigment is already composed on load,
             before the pointer has reported a position. */
          --sfc-mx: 62%;
          --sfc-my: 38%;
          --sfc-glow: 0;
        }
        /* Green pigment following the cursor. Sits above the globe canvas
           (which is fixed at z-index 0) but below the hero content at
           z-index 2, so it tints the white ground and the dome without
           washing out the headline. */
        .sfc-hero-pigment {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: var(--sfc-glow);
          transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          background:
            radial-gradient(
              circle 260px at var(--sfc-mx) var(--sfc-my),
              rgba(19, 115, 93, 0.085),
              rgba(19, 115, 93, 0.038) 42%,
              transparent 72%
            ),
            radial-gradient(
              circle 560px at var(--sfc-mx) var(--sfc-my),
              rgba(19, 115, 93, 0.038),
              transparent 70%
            );
        }
        /* A faint static wash keeps the hero from reading as flat paper even
           before the pointer arrives — and it is all a touch device gets. */
        .sfc-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            120% 80% at 78% 18%,
            rgba(19, 115, 93, 0.035),
            transparent 62%
          );
        }
        @media (prefers-reduced-motion: reduce) {
          .sfc-hero-pigment {
            display: none;
          }
        }
        .sfc-hero .sfc-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          /* Top padding clears the fixed nav + ticker so the content
             starts right below. */
          padding: 108px 24px 24px;
          justify-content: flex-start !important;
          align-items: stretch;
        }
        @media (min-width: 768px) {
          .sfc-hero .sfc-hero-inner {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        /* Headline left, animated mark right — opposite sides of the hero.
           Single column below 900px, where two would crush both. */
        .sfc-hero-lede {
          margin: 0;
          padding: 0;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          gap: clamp(18px, 3vw, 48px);
        }
        @media (min-width: 900px) {
          .sfc-hero-lede {
            /* Mark gets slightly more than the headline so it can read as
               large artwork rather than an accent beside the type. */
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
          }
        .sfc-hero-headline-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .sfc-hero-mark {
          position: relative;
          justify-self: center;
          width: clamp(340px, 52vw, 780px);
          max-height: 48svh;
        }
        @media (min-width: 900px) {
          .sfc-hero-mark {
            justify-self: end;
            margin-right: clamp(-40px, -2vw, 0px);
          }
        }
        .sfc-hero-mark-img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 48svh;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .sfc-hero .sfc-h1 {
          text-align: left;
          text-wrap: balance;
          font-size: clamp(2.8rem, 5.8vw, 6.2rem);
          line-height: 1.08;
          max-width: 26ch;
          margin: 0;
          color: #0f2a2b !important;
          text-shadow: none;
        }
        .sfc-hero .sfc-h1-em {
          color: #13735d !important;
        }
        .sfc-hero .sfc-mini-link {
          color: #0f2a2b;
          border-bottom-color: rgba(15, 42, 43, 0.3);
        }
        .sfc-hero .sfc-mini-link:hover {
          color: #13735d;
          border-bottom-color: #13735d;
        }

        /* ── Dark theme hero ─────────────────────────────────────────────── */
        .dark .sfc-hero .sfc-h1,
        :global(.dark) .sfc-hero .sfc-h1,
        :global(html.dark) .sfc-hero .sfc-h1 {
          color: #f4f7f6 !important;
        }
        .dark .sfc-hero .sfc-h1-em,
        :global(.dark) .sfc-hero .sfc-h1-em,
        :global(html.dark) .sfc-hero .sfc-h1-em {
          color: var(--sfc-mint) !important;
        }
        .dark .sfc-hero .sfc-mini-link,
        :global(.dark) .sfc-hero .sfc-mini-link,
        :global(html.dark) .sfc-hero .sfc-mini-link {
          color: rgba(244, 247, 246, 0.86);
          border-bottom-color: rgba(244, 247, 246, 0.32);
        }
        .dark .sfc-hero .sfc-mini-link:hover,
        :global(.dark) .sfc-hero .sfc-mini-link:hover,
        :global(html.dark) .sfc-hero .sfc-mini-link:hover {
          color: var(--sfc-mint);
          border-bottom-color: var(--sfc-mint);
        }
        .dark .sfc-hero-mark-img,
        :global(.dark) .sfc-hero-mark-img,
        :global(html.dark) .sfc-hero-mark-img {
          mix-blend-mode: screen;
        }
        .dark .sfc-hero-pigment,
        :global(.dark) .sfc-hero-pigment,
        :global(html.dark) .sfc-hero-pigment {
          background:
            radial-gradient(
              circle 260px at var(--sfc-mx) var(--sfc-my),
              rgba(120, 235, 190, 0.13),
              rgba(120, 235, 190, 0.06) 42%,
              transparent 72%
            ),
            radial-gradient(
              circle 560px at var(--sfc-mx) var(--sfc-my),
              rgba(120, 235, 190, 0.06),
              transparent 70%
            );
        }
        .dark .sfc-hero::before,
        :global(.dark) .sfc-hero::before,
        :global(html.dark) .sfc-hero::before {
          background: radial-gradient(
            120% 80% at 78% 18%,
            rgba(120, 235, 190, 0.06),
            transparent 62%
          );
        }
        .sfc-h1-br {
          display: block;
        }
        .sfc-hero-bottom {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 16px;
        }
        .sfc-hb-left {
          justify-self: start;
        }
        .sfc-hero-bottom .sfc-share {
          justify-self: end;
        }
        .sfc-share {
          display: none;
        }
        @media (min-width: 768px) {
          .sfc-share {
            display: inline-flex;
          }
        }

        /* ── Mobile hero tuning: crisp, centered, and proportional on all phones */
        @media (max-width: 768px) {
          .sfc-hero .sfc-hero-inner {
            padding: 86px 16px 20px;
            min-height: auto;
            justify-content: flex-start !important;
            align-items: center;
          }
          .sfc-hero-lede {
            grid-template-columns: 1fr;
            gap: 14px;
            align-items: center;
            text-align: center;
          }
          .sfc-hero-headline-wrap {
            align-items: center;
            text-align: center;
            width: 100%;
          }
          .sfc-hero .sfc-h1 {
            text-align: center;
            font-size: clamp(1.85rem, 7.8vw, 2.6rem);
            line-height: 1.14;
            max-width: 100%;
            margin: 0 auto;
          }
          .sfc-h1-br {
            display: inline;
          }
          .sfc-hero-mark {
            width: min(280px, 78vw);
            max-height: 28svh;
            margin: 6px auto 0;
            justify-self: center;
          }
          .sfc-hero-bottom {
            margin-top: 14px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            width: 100%;
          }
          .sfc-hb-left {
            justify-self: center;
          }
          .sfc-hero-ctas {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
          .sfc-hero-ctas .sfc-btn-ghost,
          .sfc-hero-ctas .sfc-btn-mint {
            padding: 10px 20px;
            font-size: 13px;
          }
        }
        @media (max-width: 380px) {
          .sfc-hero .sfc-h1 {
            font-size: 1.65rem;
          }
          .sfc-hero-mark {
            width: min(240px, 80vw);
          }
        }

        /* ── Short viewports ────────────────────────────────────────────
           Landscape phones and short laptops are a WIDTH-query blind spot:
           a phone on its side is ~812px wide but only ~375px tall, so it
           picks up the desktop rules. Those pin the inner column to a
           100svh height with a 620px min-height floor inside an
           overflow-hidden section, which pushed the bottom row far below the
           fold AND clipped it. Height-based queries let the hero size to its
           content instead of to a fixed floor.

           WARNING: this whole stylesheet is a template literal. Never put a
           backtick in here, not even inside a comment: it terminates the
           literal, and format-on-save then reparses ~1200 lines of CSS as
           TypeScript and mangles every hyphenated property. */
        @media (max-height: 700px) {
          /* Preserve fixed-nav clearance on short screens. The hero may grow
             beyond one viewport so the artwork remains visible rather than
             being clipped or hidden. */
          .sfc-hero .sfc-hero-inner {
            padding-top: 108px;
            padding-bottom: 26px;
          }
          .sfc-hero-lede {
            gap: clamp(10px, 2vw, 22px);
          }
          .sfc-hero-bottom {
            padding-top: 28px;
          }
        }
        @media (max-height: 560px) {
          /* Keep the infinity visible at a compact, responsive size instead
             of removing the hero's primary artwork. */
          .sfc-hero-mark {
            display: block;
            width: min(300px, 72vw);
          }
          .sfc-hero-lede {
            grid-template-columns: 1fr;
          }
          .sfc-hero .sfc-h1 {
            font-size: clamp(1.55rem, 4.2vw, 2.5rem);
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
          .sfc-hero-panel.sfc-hero-inner {
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
        .sfc-partners-note {
          max-width: 720px;
        margin: 18px auto 0;
        font-size: 0.86rem;
        line-height: 1.6;
        color: rgba(15, 23, 42, 0.62);
        }
        .sfc-marquee {
          position: relative;
        overflow: hidden;
        padding: 28px 0 44px;
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
        /* Partner logo tiles — colorful while moving, zoom-in effect on hover. */
        .sfc-partner-tile {
          flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 104px;
        width: 208px;
        margin: 0 14px;
        padding: 22px 30px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafd 100%);
        border: 1px solid oklch(0.16 0.07 265 / 0.1);
        border-radius: 20px;
        box-shadow:
        0 2px 6px oklch(0.16 0.07 265 / 0.06),
        0 12px 32px -14px oklch(0.16 0.07 265 / 0.16);
        transition:
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
        border-color 0.4s ease;
        cursor: pointer;
        position: relative;
        z-index: 1;
        }
        .sfc-partner-tile:hover {
          transform: translateY(-6px);
        border-color: oklch(0.56 0.24 275 / 0.35);
        box-shadow:
        0 1px 2px oklch(0.16 0.07 265 / 0.05),
        0 24px 48px -16px oklch(0.56 0.24 275 / 0.3);
        }
        /* Logos always ride in full brand colour; hover just brings them
           forward with a springy zoom. */
        .sfc-partner-tile img {
          max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        display: block;
        transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sfc-partner-tile:hover img {
          transform: scale(1.16);
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
        padding: 96px 0 32px;
        /* Contains the oversized wordmark, which is intentionally wider
           than its text box at small viewports. */
        overflow: hidden;
        isolation: isolate;
        }
        /* Ambient indigo bloom behind the CTA. Large and faint: it should
           register as depth on the navy, never as a visible shape. */
        .sfc-footer::after {
          content: "";
        position: absolute;
        z-index: -1;
        top: -14%;
        left: 50%;
        width: min(1200px, 130%);
        aspect-ratio: 2 / 1;
        transform: translateX(-50%);
        background: radial-gradient(
        ellipse at center,
        var(--sfc-indigo) 0%,
        transparent 70%
        );
        opacity: 0.16;
        pointer-events: none;
        }
        .sfc-footer-cta {
          display: grid;
        grid-template-columns: 1fr;
        gap: 64px;
        padding-bottom: 24px;
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
        padding: 40px 0 56px;
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
        /* Soft-cornered card, not a pill: this label wraps to two lines at
           most widths now that the ARN is appended, and a 999px radius fights
           a wrapped line. */
        .sfc-footer-reg {
          display: inline-flex;
        align-items: flex-start;
        gap: 9px;
        margin-top: 20px;
        padding: 10px 15px;
        max-width: 21rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.05);
        font-size: 11.5px;
        font-weight: 600;
        line-height: 1.5;
        text-align: left;
        color: rgba(255, 255, 255, 0.78);
        backdrop-filter: blur(6px);
        }
        /* Direct routes + socials, under the registration badge. */
        .sfc-footer-contact {
          list-style: none;
          margin: 16px 0 0;
          padding: 0;
          display: grid;
          gap: 7px;
        }
        /* Scoped through .sfc-footer-links to outrank the .sfc-footer-links li a
           nav-column link style — these rows sit inside that container but
           are contact routes, not nav items, so they must not inherit its
           block layout or its decorative ::before bullet. */
        .sfc-footer-links .sfc-footer-contact a::before {
          content: none;
        }
        .sfc-footer-links .sfc-footer-contact a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          transition: color 0.2s ease;
          overflow-wrap: anywhere;
        }
        .sfc-footer-links .sfc-footer-contact a:hover,
        .sfc-footer-links .sfc-footer-contact a:focus-visible {
          color: #fff;
          transform: none;
        }
        .sfc-footer-contact svg {
          flex: 0 0 auto;
          color: #25d366;
        }
        .sfc-footer-social {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }
        .sfc-footer-links .sfc-footer-social a::before {
          content: none;
        }
        .sfc-footer-links .sfc-footer-social a {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.78);
          transition: color 0.2s ease, border-color 0.2s ease,
            background 0.2s ease, transform 0.2s ease;
        }
        .sfc-footer-links .sfc-footer-social a:hover,
        .sfc-footer-links .sfc-footer-social a:focus-visible {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.42);
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }
        @media (prefers-reduced-motion: reduce) {
          .sfc-footer-social a:hover {
            transform: none;
          }
        }
        .sfc-footer-reg .sfc-dot {
          flex: 0 0 auto;
        margin-top: 5px;
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
        /* Registration codes: slightly brighter than the disclaimer and
           letter-spaced, so an investor can read a code off the navy ground. */
        .sfc-footer-codes {
          font-size: 11px;
        letter-spacing: 0.04em;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.58) !important;
        font-variant-numeric: tabular-nums;
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
        margin-bottom: 18px;
        }
        .sfc-footer-logo img {
          height: 70px;
        width: auto;
        }
        @media (max-width: 760px) {
          .sfc-footer-logo img {
          height: 56px;
          }
        }
        .sfc-footer-brand p {
          color: rgba(255, 255, 255, 0.6);
        max-width: 24rem;
        line-height: 1.6;
        margin: 0;
        }
        .sfc-footer-col-title {
          color: rgba(255, 255, 255, 0.38);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 10.5px;
        font-weight: 700;
        margin-bottom: 18px;
        }
        .sfc-footer-links ul {
          list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
        }
        /* Hairlines give the link columns a deliberate editorial grid, so the
           shorter columns don't read as floating in empty space. */
        @media (min-width: 1024px) {
          .sfc-footer-links > div + div {
          padding-left: 32px;
        border-left: 1px solid rgba(255, 255, 255, 0.09);
          }
        }
        .sfc-footer-links li a {
          position: relative;
        display: block;
        width: fit-content;
        max-width: 100%;
        padding: 6px 0;
        color: rgba(255, 255, 255, 0.62);
        transition: color 0.28s cubic-bezier(0.2, 0.7, 0.2, 1),
        transform 0.34s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sfc-footer-links li a::before {
          content: "";
        position: absolute;
        left: 0;
        bottom: 4px;
        width: 100%;
        height: 1px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sfc-footer-links li a:hover,
        .sfc-footer-links li a:focus-visible {
          color: var(--sfc-mint);
        transform: translateX(4px);
        }
        .sfc-footer-links li a:hover::before,
        .sfc-footer-links li a:focus-visible::before {
          transform: scaleX(1);
        }

        /* Collapsible mandated small print. */
        .sfc-footer-legal summary {
          display: inline-flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        list-style: none;
        padding: 5px 12px 5px 13px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.55);
        transition: color 0.25s, border-color 0.25s, background 0.25s;
        }
        .sfc-footer-legal summary::-webkit-details-marker {
          display: none;
        }
        .sfc-footer-legal summary:hover {
          color: var(--sfc-mint);
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.08);
        }
        .sfc-footer-legal summary svg {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sfc-footer-legal[open] summary svg {
          transform: rotate(180deg);
        }
        .sfc-footer-legal[open] summary {
          margin-bottom: 12px;
        }
        .sfc-footer-legal > p {
          color: rgba(255, 255, 255, 0.38) !important;
        }

        /* Oversized wordmark: fills the container width at any viewport
           without a media query, and fades out toward its baseline. */
        .sfc-footer-wordmark {
          padding: 12px 0 0;
        /* Not so tight that the Q descender clips against the overflow
           below — the gradient already fades the lower third. */
        line-height: 0.9;
        overflow: hidden;
        user-select: none;
        }
        .sfc-footer-wordmark span {
          display: block;
        font-size: clamp(3.5rem, 15.5vw, 15rem);
        font-weight: 600;
        letter-spacing: -0.055em;
        text-transform: uppercase;
        background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0) 118%
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        opacity: 0.3;
        }

        @media (prefers-reduced-motion: reduce) {
          .sfc-footer-links li a,
        .sfc-footer-links li a::before {
          transition: none;
          }
        .sfc-footer-links li a:hover {
          transform: none;
          }
        }
        .sfc-footer-base {
          display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 11.5px;
        letter-spacing: 0.02em;
        color: rgba(255, 255, 255, 0.38);
        padding-top: 20px;
        margin-top: 4px;
        border-top: 1px solid rgba(255, 255, 255, 0.09);
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
           account together: no separators. No overrides needed; only widen
           it to this page's 1400px container so it lines up with the hero. */
        /* The nav keeps its own slim 1200px width here too, so the glass
           pill reads the same on the homepage as everywhere else. */

        /* (The hero ground follows the theme now — see the dark-hero block
           above — so the nav's own theme ink is correct over it in both
           modes, and the old dark-ink pin for the pre-scroll window is gone.
           Re-adding it would put dark ink on the dark hero.) */

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

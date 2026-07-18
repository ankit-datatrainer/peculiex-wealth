"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Mock = {
  sym: string;
  name: string;
  price: number;
  chg: number;
  brand: string;
  sector: string;
};

const MOCKS: Mock[] = [
  { sym: "RELIANCE", name: "Reliance Industries", price: 2840.55, chg: 1.42, brand: "#13735d", sector: "Energy" },
  { sym: "INFY", name: "Infosys Ltd", price: 1845.65, chg: 1.10, brand: "#2563eb", sector: "IT" },
  { sym: "HDFCBANK", name: "HDFC Bank", price: 1672.30, chg: -0.32, brand: "#a3262d", sector: "Banking" },
  { sym: "MARUTI", name: "Maruti Suzuki", price: 12480.0, chg: 1.62, brand: "#0ea5e9", sector: "Auto" },
  { sym: "TCS", name: "Tata Consultancy", price: 4120.85, chg: 0.84, brand: "#7c3aed", sector: "IT" },
];

const UNLIST_MOCKS = [
  { name: "PharmEasy", sector: "Healthcare", iv: "₹3.2–4.8 Cr", tag: "Trending", brand: "#16a34a" },
  { name: "OYO Rooms", sector: "Hospitality", iv: "₹38–42", tag: "Available", brand: "#ea7c1c" },
  { name: "Swiggy", sector: "Food-tech", iv: "₹360–390", tag: "Pre-IPO", brand: "#ef4444" },
];

export default function GuestView() {
  const [rows, setRows] = useState<Mock[]>(MOCKS);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);



  // Hero spotlight
  useEffect(() => {
    const hero = heroRef.current;
    const spot = spotRef.current;
    if (!hero || !spot) return;
    let tx = 0.7, ty = 0.4, x = tx, y = ty;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };
    hero.addEventListener("mousemove", onMove);
    const tick = () => {
      x = x + (tx - x) * 0.08;
      y = y + (ty - y) * 0.08;
      spot.style.setProperty("--sx", (x * 100).toFixed(2) + "%");
      spot.style.setProperty("--sy", (y * 100).toFixed(2) + "%");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="gv-wrap" style={{ paddingTop: '100px' }}>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="gv-hero" ref={heroRef as any}>
        <div className="gv-hero-bg" />
        <div className="gv-grid-pattern" />
        <div className="gv-spotlight" ref={spotRef as any} />
        <div className="gv-orb" />
        <div className="gv-orb-2" />

        <div className="gv-hero-inner">
          {/* Left: Copy */}
          <div className="gv-copy">
            <div className="hero-pill reveal visible">
              <span className="pill-dot" />
              Personal Markets Cockpit
            </div>
            <h1 className="gv-title">
              Track every stock,<br />
              <em>listed</em> &amp; unlisted.
            </h1>
            <p className="gv-sub">
              Live NSE prices, pre-IPO valuations, sparkline trends — your
              personal portfolio radar, beautifully synced across all devices.
            </p>
            <div className="gv-chips">
              <span className="hchip">Equities</span>
              <span className="hchip">Pre-IPO</span>
              <span className="hchip">Mutual Funds</span>
              <span className="hchip">Bonds</span>
              <span className="hchip">PMS</span>
            </div>
            <div className="gv-ctas">
              <Link href="/signup?next=/watchlist" className="btn btn-primary btn-lg btn-arrow" data-magnetic>
                <span>Open a free account</span>
                <span className="btn-arrow-track" aria-hidden="true">
                  <svg viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <svg viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </Link>
              <Link href="/login?next=/watchlist" className="btn btn-ghost btn-lg" data-magnetic>
                Login <span className="arrow">→</span>
              </Link>
            </div>
            <p className="gv-trust">
              ✓ Email-OTP secured &nbsp;&nbsp; ✓ No credit card &nbsp;&nbsp; ✓ 30-second setup
            </p>
          </div>

          {/* Right: Floating Mock Card */}
          <div className="gv-stage">
            <div className="gv-card gv-card-main">
              <div className="gv-card-head">
                <div className="gv-card-dots">
                  <span style={{ background: "#ff5f57" }} />
                  <span style={{ background: "#ffbd2e" }} />
                  <span style={{ background: "#28ca41" }} />
                </div>
                <span className="gv-card-title">Your Watchlist</span>
                <span className="gv-live">
                  <span className="pulse-dot" />
                  LIVE
                </span>
              </div>
              <div className="gv-stock-list">
                {rows.map((r) => {
                  const up = r.chg >= 0;
                  return (
                    <div className="gv-stock-row" key={r.sym}>
                      <div className="gv-stock-logo" style={{ background: r.brand }}>
                        {r.sym.slice(0, 2)}
                      </div>
                      <div className="gv-stock-meta">
                        <strong>{r.sym}</strong>
                        <span>{r.name}</span>
                      </div>
                      <div className="gv-stock-price">
                        <span className="gv-price">
                          ₹{r.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`gv-chg ${up ? "up" : "dn"}`}>
                          {up ? "+" : ""}{r.chg.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating mini stat card */}
            <div className="gv-card gv-card-stat">
              <div className="gv-stat-label">Portfolio Today</div>
              <div className="gv-stat-val">+₹18,420</div>
              <div className="gv-stat-sub">↑ 4.2% from yesterday</div>
            </div>

            {/* Floating alert card */}
            <div className="gv-card gv-card-alert">
              <span className="pulse-dot" />
              <span>INFY target hit · ₹1,850</span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="gv-stats-bar">
          <div className="gv-stat-item">
            <div className="gv-snum">₹182 Cr</div>
            <div className="gv-slabel">Assets Managed</div>
          </div>
          <div className="gv-stat-divider" />
          <div className="gv-stat-item">
            <div className="gv-snum">1200+</div>
            <div className="gv-slabel">Active Investors</div>
          </div>
          <div className="gv-stat-divider" />
          <div className="gv-stat-item">
            <div className="gv-snum">10+</div>
            <div className="gv-slabel">Product Categories</div>
          </div>
          <div className="gv-stat-divider" />
          <div className="gv-stat-item">
            <div className="gv-snum">10 yrs +</div>
            <div className="gv-slabel">Industry Experience</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section className="gv-features">
        <div className="gv-features-head sec-head reveal">
          <div className="label">Platform Features</div>
          <h2 className="stitle">Everything you need,<br /><em>nothing you don't.</em></h2>
          <p className="sdesc">Built for serious retail investors who want clarity over noise.</p>
        </div>
        <div className="gv-features-grid reveal-children">
          <div className="gv-feat-card">
            <div className="gv-feat-icon" style={{ background: "#13735d14", color: "#13735d" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>
            </div>
            <h3>Live Price Feed</h3>
            <p>Real-time NSE data refreshing automatically. No page reloads, no stale numbers.</p>
          </div>
          <div className="gv-feat-card">
            <div className="gv-feat-icon" style={{ background: "#2563eb14", color: "#2563eb" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="8" height="14" rx="1.5" /><rect x="14" y="3" width="8" height="18" rx="1.5" /></svg>
            </div>
            <h3>Listed + Unlisted</h3>
            <p>Track Reliance alongside pre-IPO names like Swiggy and OYO in one unified view.</p>
          </div>
          <div className="gv-feat-card">
            <div className="gv-feat-icon" style={{ background: "#7c3aed14", color: "#7c3aed" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <h3>Sparkline Trends</h3>
            <p>Visual price trend charts for every stock so patterns leap out instantly.</p>
          </div>
          <div className="gv-feat-card">
            <div className="gv-feat-icon" style={{ background: "#ea7c1c14", color: "#ea7c1c" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <h3>Price Alerts</h3>
            <p>Set your target price and get notified the moment a stock hits it.</p>
          </div>
          <div className="gv-feat-card">
            <div className="gv-feat-icon" style={{ background: "#16a34a14", color: "#16a34a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
            </div>
            <h3>Syncs Everywhere</h3>
            <p>One account, every device. Phone, tablet, desktop — always in sync.</p>
          </div>
          <div className="gv-feat-card">
            <div className="gv-feat-icon" style={{ background: "#a3262d14", color: "#a3262d" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <h3>Secure &amp; Private</h3>
            <p>Passwordless OTP login. Zero tracking, zero spam. Your data stays yours.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ UNLISTED PREVIEW ═══════════════════════ */}
      <section className="gv-unlisted">
        <div className="gv-unlisted-inner">
          <div className="gv-unlisted-copy">
            <div className="label">Exclusive Access</div>
            <h2 className="stitle">Track pre-IPO names<br /><em>before they list.</em></h2>
            <p className="sdesc">
              India's most sought-after unlisted shares with indicative valuations,
              sector tags, and availability status — all in your watchlist.
            </p>
            <Link href="/unlisted" className="btn btn-ghost btn-lg" style={{ marginTop: "1.5rem" }}>
              Explore Unlisted →
            </Link>
          </div>
          <div className="gv-unlisted-cards reveal-children">
            {UNLIST_MOCKS.map((u) => (
              <div className="gv-unl-card" key={u.name}>
                <div className="gv-unl-logo" style={{ background: u.brand }}>
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="gv-unl-meta">
                  <strong>{u.name}</strong>
                  <span>{u.sector}</span>
                </div>
                <div className="gv-unl-right">
                  <span className="gv-unl-iv">{u.iv}</span>
                  <span className="gv-unl-tag">{u.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="gv-how">
        <div className="sec-head reveal" style={{ textAlign: "center" }}>
          <div className="label" style={{ justifyContent: "center" }}>How It Works</div>
          <h2 className="stitle" style={{ textAlign: "center" }}>Up and running in<br /><em>30 seconds.</em></h2>
        </div>
        <div className="gv-steps reveal-children">
          {[
            { n: "01", title: "Create your account", desc: "Enter your email, verify with OTP — no credit card, no KYC for watchlist." },
            { n: "02", title: "Search any stock", desc: "Type a ticker or company name. Listed and unlisted results appear instantly." },
            { n: "03", title: "Track & analyse", desc: "Watch live prices, sparklines, and changes update in real time on any device." },
          ].map((s) => (
            <div className="gv-step" key={s.n}>
              <div className="gv-step-num">{s.n}</div>
              <div className="gv-step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section className="gv-testi">
        <div className="sec-head reveal" style={{ textAlign: "center" }}>
          <div className="label" style={{ justifyContent: "center" }}>Trusted by Investors</div>
          <h2 className="stitle" style={{ textAlign: "center" }}>What our <em>investors</em> say.</h2>
        </div>
        <div className="gv-testi-grid reveal-children">
          {[
            { quote: "The only watchlist that shows both listed and unlisted names in one place. It's become my morning ritual.", name: "Arjun Mehta", role: "Angel Investor, Mumbai" },
            { quote: "Clean, fast, and beautifully designed. I check Finvoq before I check WhatsApp every morning.", name: "Priya Sharma", role: "Portfolio Manager, Delhi" },
            { quote: "Love the live price updates without refreshing. The sparklines help me spot trends in seconds.", name: "Rohan Kapoor", role: "Retail Investor, Bangalore" },
          ].map((t) => (
            <div className="gv-testi-card" key={t.name}>
              <p className="gv-testi-quote">"{t.quote}"</p>
              <div className="gv-testi-author">
                <div className="gv-testi-avatar">{t.name.charAt(0)}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ BOTTOM CTA ═══════════════════════ */}
      <section className="gv-cta-section">
        <div className="gv-cta-box">
          <div className="gv-cta-bg" />
          <div className="gv-cta-grid" />
          <div className="gv-cta-content">
            <div className="label" style={{ color: "rgba(255,255,255,0.6)", justifyContent: "center" }}>
              Get Started Free
            </div>
            <h2 className="gv-cta-title">
              Your markets cockpit<br /><em>awaits.</em>
            </h2>
            <p className="gv-cta-sub">
              Join 4,000+ investors tracking their favorite stocks on Finvoq.
              Free forever. No credit card required.
            </p>
            <div className="gv-cta-btns">
              <Link href="/signup?next=/watchlist" className="gv-cta-primary" data-magnetic>
                Create Your Watchlist →
              </Link>
              <Link href="/markets" className="gv-cta-ghost" data-magnetic>
                Explore Markets
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .gv-wrap {
          display: flex;
          flex-direction: column;
        }

        /* ── HERO ── */
        .gv-hero {
          min-height: 100vh;
          padding: 120px 0 80px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .gv-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 78% 35%, rgba(206,220,216,.55) 0%, transparent 65%),
            radial-gradient(ellipse 30% 40% at 12% 70%, rgba(10, 160, 128,.06) 0%, transparent 60%);
        }
        .gv-grid-pattern {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(10, 160, 128,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 160, 128,.045) 1px, transparent 1px);
          background-size: 64px 64px;
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 45%, black 0%, transparent 100%);
          mask-image: radial-gradient(ellipse 70% 70% at 50% 45%, black 0%, transparent 100%);
        }
        .gv-spotlight {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle 480px at var(--sx, 70%) var(--sy, 40%),
            rgba(10, 160, 128,.14) 0%, rgba(10, 160, 128,.04) 35%, transparent 60%);
          transition: background .15s linear;
          mix-blend-mode: multiply;
        }
        .gv-orb {
          position: absolute; right: -2%; top: 38%; transform: translateY(-50%);
          width: 520px; height: 520px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(ellipse, rgba(10, 160, 128,.07) 0%, transparent 70%);
          border: 1px solid rgba(10, 160, 128,.10);
          animation: breathe 7s ease-in-out infinite;
        }
        .gv-orb-2 {
          position: absolute; right: 6%; top: 38%;
          width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
          border: 1px dashed rgba(10, 160, 128,.14);
          transform: translateY(-50%);
          animation: rotateSlow 50s linear infinite;
        }
        @keyframes breathe { 0%,100%{transform:translateY(-50%) scale(1)} 50%{transform:translateY(-50%) scale(1.04)} }
        @keyframes rotateSlow { to { transform: translateY(-50%) rotate(360deg); } }

        .gv-hero-inner {
          max-width: 1320px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px;
          align-items: center; position: relative; z-index: 2;
        }
        @media (max-width: 960px) {
          .gv-hero-inner { grid-template-columns: 1fr; gap: 3rem; }
          .gv-stage { display: none; }
        }

        /* Copy */
        .gv-title {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: clamp(34px, 6.4vw, 82px);
          font-weight: 500; line-height: 1.06; letter-spacing: -.025em;
          color: var(--color-text, #1e1c18);
          margin: 0.3rem 0 1.2rem;
        }
        .gv-title em {
          font-style: italic;
          background: linear-gradient(120deg, #13735d 0%, #2ea2a8 45%, #13735d 100%);
          background-size: 220% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: var(--color-primary, #13735d);
          color: var(--color-primary, #13735d);
          animation: shineText 5s linear infinite;
        }
        @keyframes shineText { to { background-position: -220% center; } }
        .gv-sub {
          font-family: var(--font-body, 'Barlow', sans-serif);
          color: var(--color-text-muted, #333333);
          font-size: 1.0625rem; line-height: 1.65;
          max-width: 520px; margin-bottom: 1.5rem;
        }
        .gv-chips {
          display: flex; flex-wrap: nowrap; gap: 8px;
          margin-bottom: 2rem; overflow-x: auto;
          scrollbar-width: none;
        }
        .gv-chips::-webkit-scrollbar { display: none; }
        .gv-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .gv-trust {
          font-family: var(--font-body, 'Barlow', sans-serif);
          font-size: 0.82rem; color: var(--color-text-faint, #555555); font-weight: 500;
        }

        /* Floating card stage */
        .gv-stage { position: relative; height: 520px; perspective: 1400px; }

        .gv-card {
          position: absolute;
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-border, #d4d1ca);
          border-radius: 16px;
          box-shadow: var(--shadow-lg, 0 12px 32px rgba(30,28,24,.12));
          overflow: hidden;
          font-family: var(--font-body, 'Barlow', sans-serif);
        }
        .gv-card-main {
          width: 360px; top: 40px; left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          animation: floatA 6s ease-in-out infinite;
        }
        @keyframes floatA {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-10px); }
        }
        .gv-card-stat {
          width: 200px; top: 10px; right: -10px;
          padding: 16px 18px; z-index: 3;
          animation: floatB 7s ease-in-out infinite .4s;
          transform: rotate(3deg);
        }
        @keyframes floatB {
          0%,100% { transform: rotate(3deg) translateY(0); }
          50%      { transform: rotate(3deg) translateY(-8px); }
        }
        .gv-card-alert {
          bottom: 30px; left: -10px;
          padding: 10px 16px; z-index: 3;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; color: var(--color-text, #1e1c18);
          transform: rotate(-2deg);
          animation: floatC 8s ease-in-out infinite .8s;
          white-space: nowrap;
        }
        @keyframes floatC {
          0%,100% { transform: rotate(-2deg) translateY(0); }
          50%      { transform: rotate(-2deg) translateY(-10px); }
        }

        .gv-card-head {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-divider, #e0ddd8);
          background: var(--color-surface, #f9f8f5);
        }
        .gv-card-dots { display: flex; gap: 6px; }
        .gv-card-dots span {
          width: 10px; height: 10px; border-radius: 50%;
        }
        .gv-card-title {
          margin-left: 8px; font-size: 11px;
          color: var(--color-text-muted, #333333);
          letter-spacing: .1em; text-transform: uppercase; font-weight: 600;
          flex: 1;
        }
        .gv-live {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; letter-spacing: .12em;
          color: var(--color-success, #16a34a);
        }

        .gv-stock-list { padding: 4px 0 8px; }
        .gv-stock-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 16px;
          border-bottom: 1px solid rgba(30,28,24,.04);
          transition: background .15s;
        }
        .gv-stock-row:last-child { border-bottom: none; }
        .gv-stock-row:hover { background: rgba(10, 160, 128,.03); }
        .gv-stock-logo {
          width: 34px; height: 34px; border-radius: 8px;
          color: #fff; font-weight: 700; font-size: 0.72rem;
          display: flex; align-items: center; justify-content: center;
          flex: 0 0 auto; letter-spacing: .04em;
        }
        .gv-stock-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .gv-stock-meta strong { font-size: 0.88rem; font-weight: 700; color: var(--color-text, #1e1c18); }
        .gv-stock-meta span { font-size: 0.72rem; color: var(--color-text-muted, #333333); margin-top: 1px; }
        .gv-stock-price { display: flex; flex-direction: column; align-items: flex-end; }
        .gv-price { font-size: 0.88rem; font-weight: 700; color: var(--color-text, #1e1c18); font-variant-numeric: tabular-nums; }
        .gv-chg { font-size: 0.75rem; font-weight: 600; margin-top: 1px; font-variant-numeric: tabular-nums; }
        .gv-chg.up { color: var(--color-success, #16a34a); }
        .gv-chg.dn { color: var(--color-danger, #dc2626); }

        .gv-stat-label { font-size: 11px; color: var(--color-text-muted, #333333); letter-spacing: .08em; text-transform: uppercase; font-weight: 500; margin-bottom: 4px; }
        .gv-stat-val { font-family: var(--font-display, 'Barlow', sans-serif); font-size: 22px; font-weight: 500; color: var(--color-success, #16a34a); letter-spacing: -.01em; }
        .gv-stat-sub { font-size: 11px; color: var(--color-text-muted, #333333); margin-top: 2px; }

        /* Stats bar */
        .gv-stats-bar {
          max-width: 1320px; margin: 60px auto 0; padding: 0 32px;
          display: flex; align-items: center;
          border-top: 1px solid var(--color-divider, #e0ddd8);
          padding-top: 40px; position: relative; z-index: 2;
        }
        .gv-stat-item { flex: 1; text-align: center; }
        .gv-snum {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 500;
          color: var(--color-primary, #13735d);
          letter-spacing: -0.01em;
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .gv-slabel {
          font-size: 12px;
          letter-spacing: .04em;
          color: var(--color-text-muted, #333333);
          font-weight: 500;
          text-transform: uppercase;
        }
        .gv-stat-divider {
          width: 1px; height: 40px; background: var(--color-divider, #e0ddd8); flex-shrink: 0;
        }

        /* ── FEATURES ── */
        .gv-features {
          padding: 110px 0;
          max-width: 1320px; margin: 0 auto; width: 100%;
        }
        .gv-features-head { text-align: center; margin-bottom: 56px; }
        .gv-features-head .label { justify-content: center; }
        .gv-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding: 0 32px;
        }
        @media (max-width: 900px) { .gv-features-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .gv-features-grid { grid-template-columns: 1fr; } }
        .gv-feat-card {
          padding: 1.75rem;
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-border, #d4d1ca);
          border-radius: 18px;
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s var(--ease-out, cubic-bezier(.16,1,.3,1)), box-shadow 0.25s;
        }
        .gv-feat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(10, 160, 128,.06), var(--shadow-md);
          border-color: rgba(10, 160, 128,.2);
        }
        .gv-feat-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
          flex-shrink: 0;
        }
        .gv-feat-icon svg {
          width: 22px; height: 22px;
          stroke-width: 2;
          flex-shrink: 0;
        }
        .gv-feat-card h3 {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: 1.05rem; font-weight: 700;
          color: var(--color-text, #1e1c18); margin-bottom: 0.5rem;
        }
        .gv-feat-card p {
          font-size: 0.9rem; color: var(--color-text-muted, #333333);
          line-height: 1.5; margin: 0;
        }

        /* ── UNLISTED ── */
        .gv-unlisted {
          background: var(--color-surface, #f9f8f5);
          padding: 110px 32px;
        }
        .gv-unlisted-inner {
          max-width: 1320px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        @media (max-width: 900px) { .gv-unlisted-inner { grid-template-columns: 1fr; gap: 2rem; } }
        .gv-unlisted-cards { display: flex; flex-direction: column; gap: 1rem; }
        .gv-unl-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-border, #d4d1ca);
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
          transition: all .25s var(--ease-out);
        }
        .gv-unl-card:hover {
          transform: translateX(6px);
          border-color: rgba(10, 160, 128,.2);
          box-shadow: var(--shadow-md);
        }
        .gv-unl-logo {
          width: 40px; height: 40px; border-radius: 10px; flex: 0 0 auto;
          color: #fff; font-weight: 700; font-size: 0.78rem;
          display: flex; align-items: center; justify-content: center;
        }
        .gv-unl-meta { flex: 1; display: flex; flex-direction: column; }
        .gv-unl-meta strong { font-weight: 700; font-size: 0.95rem; color: var(--color-text, #1e1c18); }
        .gv-unl-meta span { font-size: 0.78rem; color: var(--color-text-muted, #333333); margin-top: 2px; }
        .gv-unl-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .gv-unl-iv { font-weight: 600; font-size: 0.88rem; color: var(--color-text, #1e1c18); font-variant-numeric: tabular-nums; }
        .gv-unl-tag {
          font-size: 0.65rem; font-weight: 700; letter-spacing: .06em;
          text-transform: uppercase; padding: 2px 8px; border-radius: 4px;
          background: rgba(10, 160, 128,.08); color: var(--color-primary, #13735d);
        }

        /* ── HOW IT WORKS ── */
        .gv-how {
          padding: 110px 32px;
          max-width: 1320px; margin: 0 auto;
        }
        .gv-steps {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem;
        }
        @media (max-width: 700px) { .gv-steps { grid-template-columns: 1fr; } }
        .gv-step {
          display: flex; gap: 1.25rem; align-items: flex-start;
        }
        .gv-step-num {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: 2.5rem; font-weight: 700; color: var(--color-primary-highlight, #cedcd8);
          line-height: 1; flex: 0 0 auto; letter-spacing: -.03em;
        }
        .gv-step-body h3 {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: 1.1rem; font-weight: 700;
          color: var(--color-text, #1e1c18); margin-bottom: .4rem;
        }
        .gv-step-body p { font-size: 0.9rem; color: var(--color-text-muted, #333333); line-height: 1.55; margin: 0; }

        /* ── TESTIMONIALS ── */
        .gv-testi {
          background: var(--color-surface, #f9f8f5);
          padding: 110px 32px;
        }
        .gv-testi-grid {
          max-width: 1320px; margin: 3rem auto 0;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        @media (max-width: 900px) { .gv-testi-grid { grid-template-columns: 1fr; } }
        .gv-testi-card {
          padding: 2rem;
          background: var(--color-surface-2, #ffffff);
          border: 1px solid var(--color-border, #d4d1ca);
          border-radius: 18px; box-shadow: var(--shadow-sm);
          display: flex; flex-direction: column; gap: 1.5rem;
          transition: all .25s var(--ease-out);
        }
        .gv-testi-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(10, 160, 128,.15);
        }
        .gv-testi-quote {
          font-size: 1rem; line-height: 1.6;
          color: var(--color-text, #1e1c18);
          flex: 1;
          font-style: italic;
        }
        .gv-testi-author { display: flex; align-items: center; gap: .75rem; }
        .gv-testi-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--color-primary, #13735d);
          color: #fff; font-weight: 700; font-size: 1rem;
          display: flex; align-items: center; justify-content: center;
          flex: 0 0 auto;
        }
        .gv-testi-author strong { display: block; font-weight: 700; font-size: 0.9rem; color: var(--color-text, #1e1c18); }
        .gv-testi-author span { font-size: 0.78rem; color: var(--color-text-muted, #333333); }

        /* ── CTA ── */
        .gv-cta-section { padding: 80px 32px; }
        .gv-cta-box {
          max-width: 1320px; margin: 0 auto;
          border-radius: 24px; overflow: hidden;
          position: relative;
          min-height: 360px;
          display: flex; align-items: center; justify-content: center;
        }
        .gv-cta-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #0b2730 0%, #13735d 100%);
        }
        .gv-cta-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .gv-cta-content {
          position: relative; z-index: 2;
          text-align: center; padding: 4rem 2rem;
          color: #fff;
        }
        .gv-cta-title {
          font-family: var(--font-display, 'Barlow', sans-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 500; line-height: 1.1;
          letter-spacing: -.02em; margin: .5rem 0 1rem; color: #fff;
        }
        .gv-cta-title em { font-style: italic; color: #7de8ec; }
        .gv-cta-sub { font-size: 1rem; color: rgba(255,255,255,.75); max-width: 480px; margin: 0 auto 2rem; line-height: 1.6; }
        .gv-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .gv-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; font-size: 14px; font-weight: 600;
          background: #fff; color: var(--color-primary, #13735d);
          border-radius: 999px;
          font-family: var(--font-display, 'Barlow', sans-serif);
          transition: all .25s var(--ease-out);
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
        }
        .gv-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
        .gv-cta-ghost {
          display: inline-flex; align-items: center;
          padding: 14px 28px; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.25);
          border-radius: 999px;
          font-family: var(--font-display, 'Barlow', sans-serif);
          transition: all .25s var(--ease-out);
        }
        .gv-cta-ghost:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.5); }
      `}</style>
    </div>
  );
}

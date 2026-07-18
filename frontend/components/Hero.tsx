"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Cinematic scroll-video hero — SecuredFi composition.
 *
 * The particle sphere plays as a FULL-SCREEN background that stays pinned
 * (sticky) for the length of a tall track. A solid brand "cover" sits over it
 * at the top holding the opening headline; as you scroll a little the cover
 * fades away, revealing the sphere filling the whole background while its
 * play-head is scrubbed by scroll. Text "beats" reveal one after another over
 * the live sphere, then the page hands off underneath.
 */

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
// map v from [a,b] → [0,1]
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export default function Hero() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  /* ---- Scroll-scrubbed video engine ---- */
  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;
    let raf = 0;
    let target = 0;

    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const p = scrollable > 0 ? scrolled / scrollable : 0;
      setProgress(p);
      // Scrub the whole clip across the full scroll — smooth, frame by frame.
      const dur = (video.duration || 10) - 0.05;
      target = p * dur;
    };

    // Chase the target time each frame with easing → smooth, not jumpy.
    const tick = () => {
      if (video.readyState >= 2 && Number.isFinite(target)) {
        const diff = target - video.currentTime;
        if (Math.abs(diff) > 0.008) video.currentTime += diff * 0.28;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  const src = isMobile ? "/videos/hero-mint-mobile.mp4" : "/videos/hero-mint.mp4";
  const poster = "/videos/hero-mint-poster.jpg";

  /* ---- Progress-driven choreography (slow & smooth, NO dead scroll) ----
     0.00–0.35  Green hero + headline; the mint circle rises and grows.
     0.35–0.92  Headline fades; the circle keeps growing until it just barely
                covers the screen right at the END of the track — so the
                instant it's full, the page hands straight to the next section.
     The radius max is sized to the minimum that covers the screen corner (not
     a big overshoot), so "visually full" and "track end" happen together —
     no stretch of scrolling through an already-full-screen video.              */
  const domeR = 26 + range(progress, 0.08, 0.94) * 96; // 26 (dome) → 122 (just covers, ends with track)
  const domeDetail = 1 - range(progress, 0.5, 0.85); // rim/glow fade as it fills

  const beat1 = clamp(1 - range(progress, 0.32, 0.48)); // opening headline
  const beat1Lift = -range(progress, 0, 0.48) * 44;

  const cueOpacity = clamp(1 - progress / 0.08);

  return (
    <>
      <a id="top" />

      {/* Tall track — its scroll distance scrubs the sphere + drives the beats */}
      <div className="hero-track" ref={trackRef}>
        <section
          className="hero-cine-stage"
          id="hero"
          style={{
            ["--dome-r" as string]: String(domeR),
            ["--dome-detail" as string]: String(domeDetail),
          } as React.CSSProperties}
        >
          {/* Full-screen video at native resolution; a circular mask (radius
              driven by --dome-r) reveals it as a dome rising from the bottom
              and growing to cover the screen — no zoom, so it stays crisp. */}
          <div className="hero-cine-dome" aria-hidden="true">
            <video
              ref={videoRef}
              key={src}
              className="hero-video"
              src={src}
              poster={poster}
              muted
              playsInline
              preload="auto"
            />
          </div>
          <div className="hero-dome-ring" aria-hidden="true" />
          <div className="hero-dome-scrim" aria-hidden="true" />

          {/* Beat 1 — opening headline (on the cover) */}
          <div
            className="hero-beat hero-beat-1"
            style={{
              opacity: beat1,
              transform: `translateY(${beat1Lift}px)`,
              pointerEvents: beat1 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="hero-pill hero-fade-1">
              <span className="pill-dot" />
              SEBI Registered · Trusted by 4,000+ investors
            </div>
            <h1 className="hero-title hero-cine-title hero-fade-2">
              Invest with <em>clarity</em> across every asset class.
            </h1>
            <p className="hero-sub hero-fade-3">
              Listed shares, unlisted opportunities, mutual funds, PMS, AIF,
              bonds, and insurance — curated by experts, executed in seconds.
            </p>
            <div className="hero-ctas hero-fade-4">
              <a
                href="/get-started"
                className="btn btn-primary btn-lg btn-arrow"
                data-magnetic
              >
                <span>Start Investing</span>
                <span className="btn-arrow-track" aria-hidden="true">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
              <a href="/markets" className="btn btn-hero-ghost btn-lg" data-magnetic>
                Explore Markets <span className="arrow">→</span>
              </a>
            </div>
          </div>

          {/* Scroll cue */}
          <div
            className="hero-scroll-cue"
            style={{ opacity: cueOpacity }}
            aria-hidden="true"
          >
            <span>Scroll</span>
            <span className="hero-scroll-cue-line" />
          </div>
        </section>
      </div>

      {/* Trust marquee — sits below the scroll track */}
      <div className="hero-trust reveal">
        <span className="trust-label">Regulated &amp; Trusted by</span>
        <div className="trust-track">
          <div className="trust-row">
            <a href="https://www.sebi.gov.in/" target="_blank" rel="noopener noreferrer"><img src="/logos/sebi.png" alt="SEBI" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer"><img src="/logos/rbi.png" alt="RBI" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.nseindia.com/" target="_blank" rel="noopener noreferrer"><img src="/logos/nse.png" alt="NSE" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.bseindia.com/" target="_blank" rel="noopener noreferrer"><img src="/logos/bse.png" alt="BSE" className="regulated-logo" /></a>
            <i></i>
            <a href="https://nsdl.co.in/" target="_blank" rel="noopener noreferrer"><img src="/logos/nsdl.png" alt="NSDL" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.cdslindia.com/" target="_blank" rel="noopener noreferrer"><img src="/logos/cdsl.png" alt="CDSL" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.sebi.gov.in/" target="_blank" rel="noopener noreferrer"><img src="/logos/sebi.png" alt="SEBI" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer"><img src="/logos/rbi.png" alt="RBI" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.nseindia.com/" target="_blank" rel="noopener noreferrer"><img src="/logos/nse.png" alt="NSE" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.bseindia.com/" target="_blank" rel="noopener noreferrer"><img src="/logos/bse.png" alt="BSE" className="regulated-logo" /></a>
            <i></i>
            <a href="https://nsdl.co.in/" target="_blank" rel="noopener noreferrer"><img src="/logos/nsdl.png" alt="NSDL" className="regulated-logo" /></a>
            <i></i>
            <a href="https://www.cdslindia.com/" target="_blank" rel="noopener noreferrer"><img src="/logos/cdsl.png" alt="CDSL" className="regulated-logo" /></a>
            <i></i>
          </div>
        </div>
      </div>
    </>
  );
}

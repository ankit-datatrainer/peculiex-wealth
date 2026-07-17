"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Cinematic scroll-video hero.
 *
 * A tall invisible track holds a sticky, full-screen particle video whose
 * play-head is driven by scroll (the "scroll = timeline" trick from the
 * cinematic-scroll playbook). The hero content is staged in over it one beat
 * at a time via a 0→1 scroll-progress number, then hands off into the page.
 */

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

export default function Hero() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
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
      target = p * ((video.duration || 10) - 0.05);
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

  /* ---- Char-split title reveal ---- */
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const segs = Array.from(title.querySelectorAll<HTMLElement>(".seg"));
    let total = 0;
    segs.forEach((seg) => {
      const text = seg.textContent || "";
      seg.textContent = "";
      const words = text.split(" ");
      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement("span");
        wordSpan.style.whiteSpace = "nowrap";
        [...word].forEach((ch) => {
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = ch;
          span.style.transitionDelay = total * 22 + "ms";
          wordSpan.appendChild(span);
          total++;
        });
        seg.appendChild(wordSpan);
        if (wIdx < words.length - 1) {
          const space = document.createElement("span");
          space.className = "char";
          space.textContent = " ";
          space.style.transitionDelay = total * 22 + "ms";
          seg.appendChild(space);
          total++;
        }
      });
    });
    const t = setTimeout(() => title.classList.add("in"), 250);
    return () => clearTimeout(t);
  }, []);

  const src = isMobile ? "/videos/hero-mobile.mp4" : "/videos/hero-desktop.mp4";
  const poster = isMobile
    ? "/videos/hero-poster-mobile.jpg"
    : "/videos/hero-poster.jpg";

  /* ---- Progress-driven choreography (the director's cue sheet) ----
     SecuredFi-style: the particle video stays pinned while content BEATS
     cross-fade over it, one at a time, as the user scrolls. Each beat has a
     scroll window; it slides up + fades in, holds, then fades out as the next
     beat arrives. Only the final beat holds to the end before the page begins. */
  const beat = (start: number, end: number, opts?: { holdEnd?: boolean }) => {
    const fade = 0.09;
    if (progress < start || progress > end) return { opacity: 0, y: progress < start ? 26 : -26 };
    const inP = clamp((progress - start) / fade);
    const outP = opts?.holdEnd ? 1 : clamp(1 - (progress - (end - fade)) / fade);
    const opacity = Math.min(inP, outP);
    // Slide from +26px (below) to 0 on entry, drift to -26px on exit.
    const y = (1 - inP) * 26 - (1 - outP) * 26;
    return { opacity, y };
  };

  const beatA = beat(0.0, 0.4); // pill + headline
  const beatB = beat(0.36, 0.72); // sub + asset chips
  const beatC = beat(0.68, 1.0, { holdEnd: true }); // CTAs + stats
  const cueOpacity = clamp(1 - progress / 0.12);

  return (
    <>
      <a id="top" />

      {/* Tall track — the scrollbar scrubs the pinned video; beats fly over it */}
      <div className="hero-track" ref={trackRef}>
        <section className="hero-sticky" id="hero">
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
          {/* Readability veil — dark at top & bottom, transparent middle */}
          <div className="hero-video-veil" aria-hidden="true" />

          <div className="hero-beats">
            {/* Beat A — brand headline */}
            <div
              className="hero-beat"
              style={{ opacity: beatA.opacity, transform: `translateY(${beatA.y}px)`, pointerEvents: beatA.opacity > 0.5 ? "auto" : "none" }}
            >
              <div className="hero-pill">
                <span className="pill-dot"></span>
                SEBI Registered · Trusted by 4,000+ investors
              </div>
              <h1 className="hero-title" id="heroTitle" ref={titleRef}>
                <span className="seg">Invest</span>{" "}
                <span className="seg">with</span>{" "}
                <em className="seg seg-em">clarity</em>{" "}
                <span className="seg">across</span>{" "}
                <span className="seg">every</span>{" "}
                <span className="seg">asset</span>{" "}
                <span className="seg">class.</span>
              </h1>
            </div>

            {/* Beat B — what we offer */}
            <div
              className="hero-beat"
              style={{ opacity: beatB.opacity, transform: `translateY(${beatB.y}px)`, pointerEvents: beatB.opacity > 0.5 ? "auto" : "none" }}
            >
              <p className="hero-sub">
                Listed shares, unlisted opportunities, mutual funds, PMS, AIF,
                bonds, and insurance. Curated by experts and executed in seconds.
              </p>
              <div className="hero-chips">
                <span className="hchip">Equities</span>
                <span className="hchip">Mutual Funds</span>
                <span className="hchip">PMS</span>
                <span className="hchip">AIF</span>
                <span className="hchip">FDs</span>
                <span className="hchip">Bonds</span>
                <span className="hchip">Insurance</span>
                <span className="hchip">Unlisted</span>
              </div>
            </div>

            {/* Beat C — CTAs + proof */}
            <div
              className="hero-beat"
              style={{ opacity: beatC.opacity, transform: `translateY(${beatC.y}px)`, pointerEvents: beatC.opacity > 0.5 ? "auto" : "none" }}
            >
              <div className="hero-ctas">
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
                <a href="/markets" className="btn btn-ghost btn-lg" data-magnetic>
                  Explore Markets <span className="arrow">→</span>
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-num">
                    ₹<span className="counter" data-target="182" data-suffix="">0</span>Cr
                  </div>
                  <div className="stat-label">Assets Managed</div>
                </div>
                <div className="stat">
                  <div className="stat-num">
                    <span className="counter" data-target="1200" data-suffix="+">0</span>
                  </div>
                  <div className="stat-label">Active Investors</div>
                </div>
                <div className="stat">
                  <div className="stat-num">
                    <span className="counter" data-target="10" data-suffix="+">0</span>
                  </div>
                  <div className="stat-label">Product Categories</div>
                </div>
                <div className="stat">
                  <div className="stat-num">
                    <span className="counter" data-target="10" data-suffix=" yrs +">0</span>
                  </div>
                  <div className="stat-label">Industry Experience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll cue — fades out as soon as the user starts */}
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

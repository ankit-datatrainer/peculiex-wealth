"use client";
import { useEffect, useRef } from "react";
import { lerp } from "@/lib/util";
import AskAI from "./AskAI";


export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const heroLineRef = useRef<SVGPathElement | null>(null);
  const heroAreaRef = useRef<SVGPathElement | null>(null);

  /* Char-split title reveal */
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
          space.textContent = "\u00A0";
          space.style.transitionDelay = total * 22 + "ms";
          seg.appendChild(space);
          total++;
        }
      });
    });
    const t = setTimeout(() => title.classList.add("in"), 250);
    return () => clearTimeout(t);
  }, []);

  /* Hero spotlight (mouse-tracked) */
  useEffect(() => {
    const hero = heroRef.current;
    const spot = spotRef.current;
    if (!hero || !spot) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    let tx = 0.7,
      ty = 0.3,
      x = tx,
      y = ty;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };
    hero.addEventListener("mousemove", onMove);
    const tick = () => {
      x = lerp(x, tx, 0.08);
      y = lerp(y, ty, 0.08);
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

  /* Hero stage card depth parallax */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".hero-card"));
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach((c) => {
        const d = parseFloat((c as any).dataset.depth) || 1;
        c.style.translate = `${(px * d * 18).toFixed(2)}px ${(
          py *
          d *
          18
        ).toFixed(2)}px`;
      });
    };
    const onLeave = () => {
      cards.forEach((c) => (c.style.translate = "0 0"));
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* Hero card sparkline (one-shot) */
  useEffect(() => {
    if (!heroLineRef.current || !heroAreaRef.current) return;
    const vals: number[] = [];
    let v = 60;
    for (let i = 0; i < 30; i++) {
      v += (Math.random() - 0.35) * 6;
      vals.push(v);
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const r = max - min || 1;
    const w = 320;
    const h = 110;
    const path = vals
      .map((y, i) => {
        const x = (i / (vals.length - 1)) * w;
        const yy = h - ((y - min) / r) * h;
        return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + yy.toFixed(1);
      })
      .join(" ");
    heroLineRef.current.setAttribute("d", path);
    heroAreaRef.current.setAttribute("d", `${path} L${w},${h} L0,${h} Z`);
  }, []);

  return (
    <>
      <a id="top" />
      <section className="hero" id="hero" ref={heroRef as any}>
        <div className="hero-bg"></div>
        <div className="hero-grid-pattern" data-parallax="0.04"></div>
        <div className="hero-spotlight" id="heroSpotlight" ref={spotRef as any}></div>
        <div className="hero-orb" data-parallax="-0.10"></div>
        <div className="hero-orb-2" data-parallax="0.06"></div>

        <div className="container hero-shell">
          <div className="hero-content">
            <div className="hero-pill reveal">
              <span className="pill-dot"></span>
              SEBI Registered · Trusted by 4,000+ investors
            </div>

            <h1 className="hero-title" id="heroTitle" ref={titleRef as any}>
              <span className="seg">Invest</span>{" "}
              <span className="seg">with</span>{" "}
              <em className="seg seg-em">clarity</em>{" "}
              <span className="seg">across</span>{" "}
              <span className="seg">every</span>{" "}
              <span className="seg">asset</span>{" "}
              <span className="seg">class.</span>
            </h1>

            <p className="hero-sub reveal">
              Listed shares, unlisted opportunities, mutual funds, PMS, AIF,
              bonds, and insurance. Curated by experts and executed in seconds.
            </p>

            <div className="hero-chips reveal">
              <span className="hchip">Equities</span>
              <span className="hchip">Mutual Funds</span>
              <span className="hchip">PMS</span>
              <span className="hchip">AIF</span>
              <span className="hchip">FDs</span>
              <span className="hchip">Bonds</span>
              <span className="hchip">Insurance</span>
              <span className="hchip">Unlisted</span>
            </div>

            <div className="hero-ctas reveal">
              <a
                href="/get-started"
                className="btn btn-primary btn-lg btn-arrow"
                data-magnetic
              >
                <span>Start Investing</span>
                <span className="btn-arrow-track" aria-hidden="true">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 7h12m0 0L8 2m5 5l-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <svg viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 7h12m0 0L8 2m5 5l-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
              <a href="/markets" className="btn btn-ghost btn-lg" data-magnetic>
                Explore Markets <span className="arrow">→</span>
              </a>

            </div>

            <AskAI />

            <div className="hero-stats reveal">
              <div className="stat">
                <div className="stat-num">
                  ₹
                  <span className="counter" data-target="450" data-suffix="">
                    0
                  </span>
                  Cr+
                </div>
                <div className="stat-label">Assets Managed</div>
              </div>
              <div className="stat">
                <div className="stat-num">
                  <span className="counter" data-target="4000" data-suffix="+">
                    0
                  </span>
                </div>
                <div className="stat-label">Active Investors</div>
              </div>
              <div className="stat">
                <div className="stat-num">
                  <span className="counter" data-target="8" data-suffix="+">
                    0
                  </span>
                </div>
                <div className="stat-label">Product Categories</div>
              </div>
              <div className="stat">
                <div className="stat-num">
                  <span className="counter" data-target="15" data-suffix="yr">
                    0
                  </span>
                </div>
                <div className="stat-label">Industry Experience</div>
              </div>
            </div>
          </div>

          {/* Floating cards stack */}
          <div className="hero-stage" id="heroStage" ref={stageRef as any}>
            {/* Allocation Rings card */}
            <div className="hero-card hc-alloc reveal" data-depth="0.5" data-tilt>
              <div className="hc-head">
                <span className="hc-mini">Asset Mix</span>
                <span className="hc-pct hc-up">
                  <svg className="trend-icon">
                    <use href="#i-arrow-up" />
                  </svg>{" "}
                  4.2%
                </span>
              </div>
              <div className="hc-body alloc-body">
                <svg viewBox="0 0 140 140" className="alloc-rings" id="allocRings">
                  <circle
                    cx="70"
                    cy="70"
                    r="58"
                    stroke="rgba(30,28,24,.06)"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="46"
                    stroke="rgba(30,28,24,.06)"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="34"
                    stroke="rgba(30,28,24,.06)"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    id="ring1"
                    className="ring"
                    cx="70"
                    cy="70"
                    r="58"
                    stroke="#01696f"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="0 999"
                    transform="rotate(-90 70 70)"
                  />
                  <circle
                    id="ring2"
                    className="ring"
                    cx="70"
                    cy="70"
                    r="46"
                    stroke="#2563eb"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="0 999"
                    transform="rotate(-90 70 70)"
                  />
                  <circle
                    id="ring3"
                    className="ring"
                    cx="70"
                    cy="70"
                    r="34"
                    stroke="#16a34a"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="0 999"
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <ul className="alloc-mini">
                  <li>
                    <span style={{ background: "#01696f" }}></span>Equity{" "}
                    <i>42%</i>
                  </li>
                  <li>
                    <span style={{ background: "#2563eb" }}></span>MF <i>22%</i>
                  </li>
                  <li>
                    <span style={{ background: "#16a34a" }}></span>Unlisted{" "}
                    <i>14%</i>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Portfolio card */}
            <div className="hero-card hc-main reveal" data-depth="1" data-tilt>
              <div className="hc-head">
                <div className="hc-dot dot-r"></div>
                <div className="hc-dot dot-y"></div>
                <div className="hc-dot dot-g"></div>
                <span className="hc-title">Live Equity Portfolio</span>
                <span className="hc-live">
                  <span className="pulse-dot"></span>LIVE
                </span>
              </div>
              <div className="hc-body">
                <div className="hc-row">
                  <div>
                    <div className="hc-mini">Total AUM</div>
                    <div className="hc-big">₹2,84,12,500</div>
                  </div>
                  <div className="hc-pct up">
                    <svg className="trend-icon">
                      <use href="#i-arrow-up" />
                    </svg>{" "}
                    4.2% MTD
                  </div>
                </div>
                <svg
                  className="hc-chart"
                  viewBox="0 0 320 110"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#01696f"
                        stopOpacity=".25"
                      />
                      <stop
                        offset="100%"
                        stopColor="#01696f"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    id="heroArea"
                    d=""
                    fill="url(#heroGrad)"
                    ref={heroAreaRef as any}
                  ></path>
                  <path
                    id="heroLine"
                    d=""
                    fill="none"
                    stroke="#01696f"
                    strokeWidth="1.8"
                    ref={heroLineRef as any}
                  ></path>
                </svg>
                <div className="hc-foot">
                  <div>
                    <span className="hc-mini">1D</span>
                    <strong className="up">+₹18,420</strong>
                  </div>
                  <div>
                    <span className="hc-mini">1M</span>
                    <strong className="up">+₹1,12,840</strong>
                  </div>
                  <div>
                    <span className="hc-mini">1Y</span>
                    <strong className="up">+18.4%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Transactions card */}
            <div className="hero-card hc-tx reveal" data-depth="1.4" data-tilt>
              <div className="hc-head">
                <span className="pulse-dot"></span>
                <span className="hc-title">Activity · just now</span>
              </div>
              <ul className="tx-list">
                <li className="tx-row">
                  <span className="tx-icon up">
                    <svg>
                      <use href="#i-arrow-up" />
                    </svg>
                  </span>
                  <div className="tx-meta">
                    <b>SIP · HDFC Flexi Cap</b>
                    <i>Auto-debit · 10:00 AM</i>
                  </div>
                  <strong>₹10,000</strong>
                </li>
                <li className="tx-row">
                  <span className="tx-icon up">
                    <svg>
                      <use href="#i-arrow-up" />
                    </svg>
                  </span>
                  <div className="tx-meta">
                    <b>Buy · Reliance Ind.</b>
                    <i>NSE · 12:42 PM</i>
                  </div>
                  <strong>₹2,840</strong>
                </li>
                <li className="tx-row">
                  <span className="tx-icon dn">
                    <svg>
                      <use href="#i-arrow-down" />
                    </svg>
                  </span>
                  <div className="tx-meta">
                    <b>Sell · TCS</b>
                    <i>NSE · 02:18 PM</i>
                  </div>
                  <strong>₹3,920</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust marquee */}
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

        <div className="hero-scroll-hint">
          <span></span>
          <p>scroll</p>
        </div>
      </section>
    </>
  );
}

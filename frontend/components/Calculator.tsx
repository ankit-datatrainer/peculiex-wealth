"use client";
import { useEffect, useRef, useState } from "react";
import { fmtINR } from "@/lib/util";
import { postJSON } from "@/lib/api";

const C = 2 * Math.PI * 92; // donut circumference

function animateText(
  el: HTMLElement | SVGTextElement | null,
  from: number,
  to: number,
  fmt: (n: number) => string
) {
  if (!el) return;
  const dur = 500;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = from + (to - from) * eased;
    el.textContent = fmt(v);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function Calculator() {
  const [amt, setAmt] = useState(10000);
  const [rate, setRate] = useState(14);
  const [yr, setYr] = useState(10);
  const [projection, setProjection] = useState<{year: number, invested: number, total: number}[]>([]);

  const oInv = useRef<HTMLElement | null>(null);
  const oRet = useRef<HTMLElement | null>(null);
  const oTot = useRef<HTMLElement | null>(null);
  const dTot = useRef<SVGTextElement | null>(null);
  const dInv = useRef<SVGCircleElement | null>(null);
  const dGain = useRef<SVGCircleElement | null>(null);
  const sliderAmt = useRef<HTMLInputElement | null>(null);
  const sliderRate = useRef<HTMLInputElement | null>(null);
  const sliderYr = useRef<HTMLInputElement | null>(null);
  const lastVals = useRef({ inv: 0, ret: 0, tot: 0 });

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareErr, setShareErr] = useState<string | null>(null);

  useEffect(() => {
    [sliderAmt.current, sliderRate.current, sliderYr.current].forEach((el) => {
      if (!el) return;
      const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
      el.style.setProperty("--p", pct + "%");
    });

    const P = amt;
    const r = rate / 100 / 12;
    const n = yr * 12;
    const FV = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const gains = FV - invested;

    animateText(oInv.current, lastVals.current.inv || invested, invested, fmtINR);
    animateText(oRet.current, lastVals.current.ret || gains, gains, fmtINR);
    animateText(oTot.current, lastVals.current.tot || FV, FV, fmtINR);
    animateText(dTot.current, lastVals.current.tot || FV, FV, fmtINR);
    lastVals.current = { inv: invested, ret: gains, tot: FV };

    const pInv = invested / FV;
    const pGain = gains / FV;
    if (dInv.current) {
      dInv.current.setAttribute(
        "stroke-dasharray",
        `${(pInv * C).toFixed(2)} ${C}`
      );
    }
    if (dGain.current) {
      dGain.current.setAttribute(
        "stroke-dasharray",
        `${(pGain * C).toFixed(2)} ${C}`
      );
      dGain.current.setAttribute(
        "stroke-dashoffset",
        `${(-pInv * C).toFixed(2)}`
      );
    }

    const data = [];
    for (let i = 1; i <= yr; i++) {
       const mn = i * 12;
       const val = r === 0 ? P * mn : P * ((Math.pow(1 + r, mn) - 1) / r) * (1 + r);
       data.push({ year: i, invested: P * mn, total: val });
    }
    setProjection(data);

  }, [amt, rate, yr]);

  const onShare = async () => {
    setShareErr(null);
    try {
      const r = await postJSON<{ url: string; id: string }>(
        "/api/sip/share",
        { amount: amt, rate, years: yr }
      );
      setShareUrl(window.location.origin + "/sip/" + r.id);
    } catch (e: any) {
      setShareErr(e?.message || "Could not create share link.");
    }
  };

  const maxVal = projection.length > 0 ? projection[projection.length - 1].total : 0;

  return (
    <section id="calculator" className="calc-sec">
      <div className="container calc-grid">
        <div className="calc-left reveal">
          <div className="label">Mutual Funds</div>
          <h2 className="stitle">
            Plan your <em>SIP returns</em>
          </h2>
          <p className="sdesc">
            Visualise how systematic investments compound over time.
          </p>

          <div className="calc-card">
            <div className="slider-row">
              <div className="slider-head">
                <span>Monthly SIP</span>
                <strong id="sipAmtLabel">{fmtINR(amt)}</strong>
              </div>
              <input
                ref={sliderAmt}
                type="range"
                id="sipAmt"
                min={500}
                max={200000}
                step={500}
                value={amt}
                onChange={(e) => setAmt(+e.target.value)}
                className="range"
              />
              <div className="range-meta">
                <span>₹500</span>
                <span>₹2,00,000</span>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-head">
                <span>Expected annual return</span>
                <strong id="sipRateLabel">{rate.toFixed(1)}%</strong>
              </div>
              <input
                ref={sliderRate}
                type="range"
                id="sipRate"
                min={1}
                max={30}
                step={0.5}
                value={rate}
                onChange={(e) => setRate(+e.target.value)}
                className="range"
              />
              <div className="range-meta">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-head">
                <span>Duration</span>
                <strong id="sipYrLabel">
                  {yr} {yr === 1 ? "Year" : "Years"}
                </strong>
              </div>
              <input
                ref={sliderYr}
                type="range"
                id="sipYr"
                min={1}
                max={40}
                step={1}
                value={yr}
                onChange={(e) => setYr(+e.target.value)}
                className="range"
              />
              <div className="range-meta">
                <span>1 yr</span>
                <span>40 yrs</span>
              </div>
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={onShare}
                className="btn btn-outline"
                data-magnetic
              >
                Share my projection
              </button>
              {shareUrl && (
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--color-primary)",
                    fontSize: "0.9rem",
                    wordBreak: "break-all"
                  }}
                >
                  {shareUrl}
                </a>
              )}
              {shareErr && (
                <span style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>
                  {shareErr}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="calc-right reveal" data-tilt>
          <div className="donut-wrap">
            <svg viewBox="0 0 220 220" className="donut">
              <circle
                cx="110"
                cy="110"
                r="92"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="22"
                fill="none"
              />
              <circle
                id="donutInvest"
                ref={dInv as any}
                cx="110"
                cy="110"
                r="92"
                stroke="var(--color-primary-highlight)"
                strokeWidth="22"
                fill="none"
                strokeDasharray="0 999"
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
              <circle
                id="donutGain"
                ref={dGain as any}
                cx="110"
                cy="110"
                r="92"
                stroke="var(--color-primary)"
                strokeWidth="22"
                fill="none"
                strokeDasharray="0 999"
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
              <text
                id="donutTotal"
                ref={dTot as any}
                x="110"
                y="105"
                textAnchor="middle"
                fill="var(--color-text)"
                fontFamily="Instrument Serif"
                fontSize="22"
              >
                ₹0
              </text>
              <text
                x="110"
                y="128"
                textAnchor="middle"
                fill="var(--color-text-faint)"
                fontSize="11"
                letterSpacing="2"
              >
                TOTAL VALUE
              </text>
            </svg>
          </div>
          <div className="calc-stats">
            <div className="cs-row">
              <span className="dotI" style={{backgroundColor: "var(--color-primary-highlight)"}}></span>You invest
              <strong id="sipInvested" ref={oInv as any}>
                ₹0
              </strong>
            </div>
            <div className="cs-row">
              <span className="dotG" style={{backgroundColor: "var(--color-primary)"}}></span>Est. returns
              <strong id="sipReturns" ref={oRet as any}>
                ₹0
              </strong>
            </div>
            <div className="cs-row total">
              <span></span>Total value
              <strong id="sipTotal" ref={oTot as any}>
                ₹0
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="container calc-graph reveal" style={{ marginTop: "4rem" }}>
         <div className="graph-header" style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 500 }}>Wealth Progression</h3>
            <p style={{ color: "var(--color-text-faint)", fontSize: "0.95rem" }}>Projected growth over {yr} years</p>
         </div>
         <div className="chart-container" style={{ position: "relative", height: "300px", width: "100%", overflow: "visible", display: "flex", alignItems: "flex-end", gap: "3px" }}>
            {projection.map((pt, i) => {
              const hInvested = maxVal > 0 ? (pt.invested / maxVal) * 100 : 0;
              const hGains = maxVal > 0 ? ((pt.total - pt.invested) / maxVal) * 100 : 0;
              
              return (
                <div key={i} className="chart-bar-group" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", position: "relative" }}>
                  <div className="chart-tooltip">
                     <strong>Year {pt.year}</strong><br/>
                     Total: {fmtINR(pt.total)}<br/>
                     Invested: {fmtINR(pt.invested)}
                  </div>
                  <div 
                    className="bar-gains" 
                    style={{ height: `${hGains}%`, width: "100%", backgroundColor: "var(--color-primary)", borderTopLeftRadius: "3px", borderTopRightRadius: "3px", transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  ></div>
                  <div 
                    className="bar-invested" 
                    style={{ height: `${hInvested}%`, width: "100%", backgroundColor: "var(--color-primary-highlight)", transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)", borderBottomLeftRadius: "3px", borderBottomRightRadius: "3px" }}
                  ></div>
                </div>
              );
            })}
         </div>
         <div className="chart-axis" style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", color: "var(--color-text-faint)", fontSize: "0.85rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem" }}>
            <span>Year 1</span>
            <span>Year {Math.floor(yr / 2) || 1}</span>
            <span>Year {yr}</span>
         </div>
      </div>

      <div className="container insights-grid" style={{ marginTop: "5rem" }}>
        <div className="sec-head reveal" style={{ gridColumn: "1/-1" }}>
          <div className="label">Insights</div>
          <h2 className="stitle">
            Why SIP <em>works</em>
          </h2>
          <p className="sdesc">
            Small monthly investments, compounded over time, build significant
            wealth.
          </p>
        </div>
        <div className="insight reveal" data-tilt>
          <h4>Rupee cost averaging</h4>
          <p>
            Buy more units when prices are low, fewer when high —
            automatically.
          </p>
        </div>
        <div className="insight reveal" data-tilt>
          <h4>Power of compounding</h4>
          <p>Your returns earn returns. Time is the greatest multiplier.</p>
        </div>
        <div className="insight reveal" data-tilt>
          <h4>Start from ₹1,000</h4>
          <p>No large lump sum needed. Begin with what's comfortable.</p>
        </div>
        <div className="advisor-cta reveal">
          <h4>Need help choosing a fund?</h4>
          <p>
            Our advisors will match funds to your goals, risk profile, and
            timeline.
          </p>
          <a href="/get-started" className="btn btn-gold" data-magnetic>
            Talk to Advisor
          </a>
        </div>
      </div>
    </section>
  );
}

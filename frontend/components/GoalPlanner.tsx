"use client";
import { useEffect, useRef, useState } from "react";
import { fmtINR } from "@/lib/util";
import { postJSON } from "@/lib/api";

const C = 2 * Math.PI * 92;

function animateText(el: HTMLElement | SVGTextElement | null, from: number, to: number, fmt: (n: number) => string) {
  if (!el) return;
  const dur = 500;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function GoalPlanner() {
  const [goal, setGoal] = useState(5000000);   // target corpus
  const [yr, setYr] = useState(15);
  const [rate, setRate] = useState(12);
  const [projection, setProjection] = useState<{year: number, invested: number, total: number}[]>([]);

  const oSip = useRef<HTMLElement | null>(null);
  const oInv = useRef<HTMLElement | null>(null);
  const oGain = useRef<HTMLElement | null>(null);
  const dTot = useRef<SVGTextElement | null>(null);
  const dInv = useRef<SVGCircleElement | null>(null);
  const dGain = useRef<SVGCircleElement | null>(null);
  const sliderGoal = useRef<HTMLInputElement | null>(null);
  const sliderYr = useRef<HTMLInputElement | null>(null);
  const sliderRate = useRef<HTMLInputElement | null>(null);
  const last = useRef({ sip: 0, inv: 0, gain: 0, tot: 0 });

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareErr, setShareErr] = useState<string | null>(null);

  useEffect(() => {
    [sliderGoal.current, sliderYr.current, sliderRate.current].forEach((el) => {
      if (!el) return;
      const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
      el.style.setProperty("--p", pct + "%");
    });
    // Required monthly SIP for given FV: P = FV * r / ((1+r)^n - 1) / (1+r)
    const r = rate / 100 / 12;
    const n = yr * 12;
    const sip = r === 0 ? goal / n : (goal * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
    const invested = sip * n;
    const gains = goal - invested;

    animateText(oSip.current, last.current.sip || sip, sip, fmtINR);
    animateText(oInv.current, last.current.inv || invested, invested, fmtINR);
    animateText(oGain.current, last.current.gain || gains, gains, fmtINR);
    animateText(dTot.current, last.current.tot || goal, goal, fmtINR);
    last.current = { sip, inv: invested, gain: gains, tot: goal };

    const pInv = Math.max(0, invested / goal);
    const pGain = Math.max(0, gains / goal);
    dInv.current?.setAttribute("stroke-dasharray", `${(pInv * C).toFixed(2)} ${C}`);
    dGain.current?.setAttribute("stroke-dasharray", `${(pGain * C).toFixed(2)} ${C}`);
    dGain.current?.setAttribute("stroke-dashoffset", `${(-pInv * C).toFixed(2)}`);

    const data = [];
    for (let i = 1; i <= yr; i++) {
       const mn = i * 12;
       const val = r === 0 ? sip * mn : sip * ((Math.pow(1 + r, mn) - 1) / r) * (1 + r);
       data.push({ year: i, invested: sip * mn, total: val });
    }
    setProjection(data);
  }, [goal, yr, rate]);

  const onShare = async () => {
    setShareErr(null);
    try {
      const r = await postJSON<{ url: string; id: string }>(
        "/api/sip/share",
        { amount: goal, rate, years: yr, type: 'goal' }
      );
      setShareUrl(window.location.origin + "/sip/" + r.id);
    } catch (e: any) {
      setShareErr(e?.message || "Could not create share link.");
    }
  };

  const maxVal = projection.length > 0 ? projection[projection.length - 1].total : 0;

  return (
    <section className="calc-sec" id="goal">
      <div className="container calc-grid">
        <div className="calc-left reveal">
          <div className="label">Goal Planner</div>
          <h2 className="stitle">Reach your <em>target corpus</em></h2>
          <p className="sdesc">
            Tell us your goal and time horizon. We work backward to the monthly SIP you need.
          </p>

          <div className="calc-card">
            <div className="slider-row">
              <div className="slider-head"><span>Target corpus</span><strong>{fmtINR(goal)}</strong></div>
              <input ref={sliderGoal} type="range" min={100000} max={100000000} step={50000} value={goal} onChange={(e) => setGoal(+e.target.value)} className="range" />
              <div className="range-meta"><span>₹1L</span><span>₹10 Cr</span></div>
            </div>
            <div className="slider-row">
              <div className="slider-head"><span>Time horizon</span><strong>{yr} {yr === 1 ? "Year" : "Years"}</strong></div>
              <input ref={sliderYr} type="range" min={1} max={40} step={1} value={yr} onChange={(e) => setYr(+e.target.value)} className="range" />
              <div className="range-meta"><span>1 yr</span><span>40 yrs</span></div>
            </div>
            <div className="slider-row">
              <div className="slider-head"><span>Expected annual return</span><strong>{rate.toFixed(1)}%</strong></div>
              <input ref={sliderRate} type="range" min={1} max={30} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} className="range" />
              <div className="range-meta"><span>1%</span><span>30%</span></div>
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" onClick={onShare} className="btn btn-outline" data-magnetic>Share my projection</button>
              {shareUrl && <a href={shareUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", fontSize: "0.9rem", wordBreak: "break-all" }}>{shareUrl}</a>}
              {shareErr && <span style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{shareErr}</span>}
            </div>
          </div>
        </div>

        <div className="calc-right reveal" data-tilt>
          <div className="donut-wrap">
            <svg viewBox="0 0 220 220" className="donut">
              <circle cx="110" cy="110" r="92" stroke="rgba(255,255,255,0.05)" strokeWidth="22" fill="none"/>
              <circle ref={dInv as any} cx="110" cy="110" r="92" stroke="var(--color-primary-highlight)" strokeWidth="22" fill="none" strokeDasharray="0 999" strokeLinecap="round" transform="rotate(-90 110 110)"/>
              <circle ref={dGain as any} cx="110" cy="110" r="92" stroke="var(--color-primary)" strokeWidth="22" fill="none" strokeDasharray="0 999" strokeLinecap="round" transform="rotate(-90 110 110)"/>
              <text ref={dTot as any} x="110" y="105" textAnchor="middle" fill="var(--color-text)" fontFamily="Instrument Serif" fontSize="22">₹0</text>
              <text x="110" y="128" textAnchor="middle" fill="var(--color-text-faint)" fontSize="11" letterSpacing="2">TARGET CORPUS</text>
            </svg>
          </div>
          <div className="calc-stats">
            <div className="cs-row total" style={{ borderTop: "none", paddingTop: 0, marginBottom: "0.6rem" }}>
              <span></span>Required SIP / month<strong ref={oSip as any}>₹0</strong>
            </div>
            <div className="cs-row"><span className="dotI" style={{backgroundColor: "var(--color-primary-highlight)"}}></span>You invest<strong ref={oInv as any}>₹0</strong></div>
            <div className="cs-row"><span className="dotG" style={{backgroundColor: "var(--color-primary)"}}></span>Est. returns<strong ref={oGain as any}>₹0</strong></div>
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
    </section>
  );
}

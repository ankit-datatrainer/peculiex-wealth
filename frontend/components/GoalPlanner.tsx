"use client";
import { useEffect, useRef, useState } from "react";
import { fmtINR } from "@/lib/util";

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
  }, [goal, yr, rate]);

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
          </div>
        </div>

        <div className="calc-right reveal" data-tilt>
          <div className="donut-wrap">
            <svg viewBox="0 0 220 220" className="donut">
              <circle cx="110" cy="110" r="92" stroke="rgba(255,255,255,0.05)" strokeWidth="22" fill="none"/>
              <circle ref={dInv as any} cx="110" cy="110" r="92" stroke="#555555" strokeWidth="22" fill="none" strokeDasharray="0 999" strokeLinecap="round" transform="rotate(-90 110 110)"/>
              <circle ref={dGain as any} cx="110" cy="110" r="92" stroke="#01696f" strokeWidth="22" fill="none" strokeDasharray="0 999" strokeLinecap="round" transform="rotate(-90 110 110)"/>
              <text ref={dTot as any} x="110" y="105" textAnchor="middle" fill="#1e1c18" fontFamily="Instrument Serif" fontSize="22">₹0</text>
              <text x="110" y="128" textAnchor="middle" fill="#333333" fontSize="11" letterSpacing="2">TARGET CORPUS</text>
            </svg>
          </div>
          <div className="calc-stats">
            <div className="cs-row total" style={{ borderTop: "none", paddingTop: 0, marginBottom: "0.6rem" }}>
              <span></span>Required SIP / month<strong ref={oSip as any}>₹0</strong>
            </div>
            <div className="cs-row"><span className="dotI"></span>You invest<strong ref={oInv as any}>₹0</strong></div>
            <div className="cs-row"><span className="dotG"></span>Est. returns<strong ref={oGain as any}>₹0</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

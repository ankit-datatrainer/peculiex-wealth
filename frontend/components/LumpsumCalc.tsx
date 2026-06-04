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

export default function LumpsumCalc() {
  const [amt, setAmt] = useState(500000);
  const [rate, setRate] = useState(12);
  const [yr, setYr] = useState(10);

  const oInv = useRef<HTMLElement | null>(null);
  const oRet = useRef<HTMLElement | null>(null);
  const oTot = useRef<HTMLElement | null>(null);
  const dTot = useRef<SVGTextElement | null>(null);
  const dInv = useRef<SVGCircleElement | null>(null);
  const dGain = useRef<SVGCircleElement | null>(null);
  const sliderAmt = useRef<HTMLInputElement | null>(null);
  const sliderRate = useRef<HTMLInputElement | null>(null);
  const sliderYr = useRef<HTMLInputElement | null>(null);
  const last = useRef({ inv: 0, ret: 0, tot: 0 });

  useEffect(() => {
    [sliderAmt.current, sliderRate.current, sliderYr.current].forEach((el) => {
      if (!el) return;
      const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
      el.style.setProperty("--p", pct + "%");
    });
    const total = amt * Math.pow(1 + rate / 100, yr);
    const gains = total - amt;

    animateText(oInv.current, last.current.inv || amt, amt, fmtINR);
    animateText(oRet.current, last.current.ret || gains, gains, fmtINR);
    animateText(oTot.current, last.current.tot || total, total, fmtINR);
    animateText(dTot.current, last.current.tot || total, total, fmtINR);
    last.current = { inv: amt, ret: gains, tot: total };

    const pInv = amt / total;
    const pGain = gains / total;
    dInv.current?.setAttribute("stroke-dasharray", `${(pInv * C).toFixed(2)} ${C}`);
    dGain.current?.setAttribute("stroke-dasharray", `${(pGain * C).toFixed(2)} ${C}`);
    dGain.current?.setAttribute("stroke-dashoffset", `${(-pInv * C).toFixed(2)}`);
  }, [amt, rate, yr]);

  return (
    <section className="calc-sec" id="lumpsum">
      <div className="container calc-grid">
        <div className="calc-left reveal">
          <div className="label">Mutual Funds</div>
          <h2 className="stitle">Lumpsum <em>compound calculator</em></h2>
          <p className="sdesc">
            See what a one-time investment grows to over time, at your assumed rate of return.
          </p>

          <div className="calc-card">
            <div className="slider-row">
              <div className="slider-head"><span>Lumpsum amount</span><strong>{fmtINR(amt)}</strong></div>
              <input ref={sliderAmt} type="range" min={10000} max={50000000} step={10000} value={amt} onChange={(e) => setAmt(+e.target.value)} className="range" />
              <div className="range-meta"><span>₹10,000</span><span>₹5 Cr</span></div>
            </div>
            <div className="slider-row">
              <div className="slider-head"><span>Expected annual return</span><strong>{rate.toFixed(1)}%</strong></div>
              <input ref={sliderRate} type="range" min={1} max={30} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} className="range" />
              <div className="range-meta"><span>1%</span><span>30%</span></div>
            </div>
            <div className="slider-row">
              <div className="slider-head"><span>Duration</span><strong>{yr} {yr === 1 ? "Year" : "Years"}</strong></div>
              <input ref={sliderYr} type="range" min={1} max={40} step={1} value={yr} onChange={(e) => setYr(+e.target.value)} className="range" />
              <div className="range-meta"><span>1 yr</span><span>40 yrs</span></div>
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
              <text x="110" y="128" textAnchor="middle" fill="#333333" fontSize="11" letterSpacing="2">TOTAL VALUE</text>
            </svg>
          </div>
          <div className="calc-stats">
            <div className="cs-row"><span className="dotI"></span>You invest<strong ref={oInv as any}>₹0</strong></div>
            <div className="cs-row"><span className="dotG"></span>Est. returns<strong ref={oRet as any}>₹0</strong></div>
            <div className="cs-row total"><span></span>Total value<strong ref={oTot as any}>₹0</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

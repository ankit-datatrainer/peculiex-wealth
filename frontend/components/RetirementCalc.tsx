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

export default function RetirementCalc() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [expenses, setExpenses] = useState(50000);
  const [projection, setProjection] = useState<{year: number, invested: number, total: number}[]>([]);

  const oCorpus = useRef<HTMLElement | null>(null);
  const oSip = useRef<HTMLElement | null>(null);
  const oInv = useRef<HTMLElement | null>(null);
  const oGain = useRef<HTMLElement | null>(null);
  
  const dTot = useRef<SVGTextElement | null>(null);
  const dInv = useRef<SVGCircleElement | null>(null);
  const dGain = useRef<SVGCircleElement | null>(null);
  
  const sliderCurrentAge = useRef<HTMLInputElement | null>(null);
  const sliderRetireAge = useRef<HTMLInputElement | null>(null);
  const sliderExpenses = useRef<HTMLInputElement | null>(null);
  const last = useRef({ corpus: 0, sip: 0, inv: 0, gain: 0 });

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareErr, setShareErr] = useState<string | null>(null);

  useEffect(() => {
    [sliderCurrentAge.current, sliderRetireAge.current, sliderExpenses.current].forEach((el) => {
      if (!el) return;
      const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
      el.style.setProperty("--p", pct + "%");
    });
    
    const yearsToRetire = Math.max(1, retireAge - currentAge);
    const inflation = 0.06;
    const expectedReturn = 0.12;
    
    // Monthly expenses at retirement
    const expensesAtRetirement = expenses * Math.pow(1 + inflation, yearsToRetire);
    // Required Corpus (Simple rule: 25x annual expenses at retirement)
    const corpus = expensesAtRetirement * 12 * 25;
    
    const r = expectedReturn / 12;
    const n = yearsToRetire * 12;
    // SIP needed for Corpus
    const sip = r === 0 ? corpus / n : (corpus * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
    const invested = sip * n;
    const gains = corpus - invested;

    animateText(oCorpus.current, last.current.corpus || corpus, corpus, fmtINR);
    animateText(oSip.current, last.current.sip || sip, sip, fmtINR);
    animateText(oInv.current, last.current.inv || invested, invested, fmtINR);
    animateText(oGain.current, last.current.gain || gains, gains, fmtINR);
    animateText(dTot.current, last.current.corpus || corpus, corpus, fmtINR);
    last.current = { corpus, sip, inv: invested, gain: gains };

    const pInv = Math.max(0, invested / corpus);
    const pGain = Math.max(0, gains / corpus);
    dInv.current?.setAttribute("stroke-dasharray", `${(pInv * C).toFixed(2)} ${C}`);
    dGain.current?.setAttribute("stroke-dasharray", `${(pGain * C).toFixed(2)} ${C}`);
    dGain.current?.setAttribute("stroke-dashoffset", `${(-pInv * C).toFixed(2)}`);
    
    const data = [];
    for (let i = 1; i <= yearsToRetire; i++) {
       const mn = i * 12;
       const val = r === 0 ? sip * mn : sip * ((Math.pow(1 + r, mn) - 1) / r) * (1 + r);
       data.push({ year: i, invested: sip * mn, total: val });
    }
    setProjection(data);
  }, [currentAge, retireAge, expenses]);

  const onShare = async () => {
    setShareErr(null);
    try {
      const r = await postJSON<{ url: string; id: string }>(
        "/api/sip/share",
        { currentAge, retireAge, expenses }
      );
      setShareUrl(window.location.origin + "/sip/" + r.id);
    } catch (e: any) {
      setShareErr(e?.message || "Could not create share link.");
    }
  };

  const maxVal = projection.length > 0 ? projection[projection.length - 1].total : 0;

  return (
    <section className="calc-sec" id="retirement">
      <div className="container calc-grid">
        <div className="calc-left reveal">
          <div className="label">Retirement Planner</div>
          <h2 className="stitle">Secure your <em>golden years</em></h2>
          <p className="sdesc">
            Calculate the corpus needed for retirement and the SIP required to get there.
          </p>

          <div className="calc-card">
            <div className="slider-row">
              <div className="slider-head"><span>Current Age</span><strong>{currentAge} Years</strong></div>
              <input ref={sliderCurrentAge} type="range" min={18} max={60} step={1} value={currentAge} onChange={(e) => {
                const val = +e.target.value;
                setCurrentAge(val);
                if (val >= retireAge) setRetireAge(val + 1);
              }} className="range" />
              <div className="range-meta"><span>18 yrs</span><span>60 yrs</span></div>
            </div>
            <div className="slider-row">
              <div className="slider-head"><span>Retirement Age</span><strong>{retireAge} Years</strong></div>
              <input ref={sliderRetireAge} type="range" min={40} max={70} step={1} value={retireAge} onChange={(e) => {
                const val = +e.target.value;
                setRetireAge(val);
                if (val <= currentAge) setCurrentAge(val - 1);
              }} className="range" />
              <div className="range-meta"><span>40 yrs</span><span>70 yrs</span></div>
            </div>
            <div className="slider-row">
              <div className="slider-head"><span>Current Monthly Expenses</span><strong>{fmtINR(expenses)}</strong></div>
              <input ref={sliderExpenses} type="range" min={10000} max={1000000} step={5000} value={expenses} onChange={(e) => setExpenses(+e.target.value)} className="range" />
              <div className="range-meta"><span>₹10K</span><span>₹10L</span></div>
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
              <text x="110" y="128" textAnchor="middle" fill="var(--color-text-faint)" fontSize="11" letterSpacing="2">REQUIRED CORPUS</text>
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
            <p style={{ color: "var(--color-text-faint)", fontSize: "0.95rem" }}>Projected growth over {Math.max(1, retireAge - currentAge)} years</p>
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
            <span>Year {Math.floor(Math.max(1, retireAge - currentAge) / 2) || 1}</span>
            <span>Year {Math.max(1, retireAge - currentAge)}</span>
         </div>
      </div>
    </section>
  );
}

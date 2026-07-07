"use client";
import { useState } from "react";
import Link from "next/link";

type Fund = {
  name: string;
  category: string;
  r1: number; // 1Y %
  r3: number; // 3Y CAGR %
  r5: number; // 5Y CAGR %
  rating: number;
};

// Illustrative performance data. Wire to a live NAV/returns feed when available.
const FUNDS: Fund[] = [
  { name: "Quant Small Cap Fund", category: "Small Cap", r1: 32.4, r3: 28.1, r5: 34.2, rating: 5 },
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", r1: 24.8, r3: 20.3, r5: 24.6, rating: 5 },
  { name: "Nippon India Small Cap", category: "Small Cap", r1: 29.1, r3: 26.4, r5: 31.0, rating: 5 },
  { name: "HDFC Flexi Cap Fund", category: "Flexi Cap", r1: 27.6, r3: 22.9, r5: 22.1, rating: 5 },
  { name: "Motilal Oswal Midcap", category: "Mid Cap", r1: 35.2, r3: 29.7, r5: 27.8, rating: 5 },
  { name: "ICICI Pru Bluechip", category: "Large Cap", r1: 21.3, r3: 17.8, r5: 18.9, rating: 4 },
  { name: "Mirae Asset Large & Mid", category: "Large & Mid", r1: 23.9, r3: 18.4, r5: 21.7, rating: 4 },
  { name: "SBI Contra Fund", category: "Contra", r1: 26.5, r3: 25.2, r5: 26.1, rating: 5 }
];

const HORIZONS = [
  { key: "r1", label: "1Y" },
  { key: "r3", label: "3Y" },
  { key: "r5", label: "5Y" }
] as const;

export default function MfPerformance() {
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]["key"]>("r3");
  const sorted = [...FUNDS].sort((a, b) => b[horizon] - a[horizon]);
  const max = Math.max(...sorted.map((f) => f[horizon]));

  return (
    <section className="mfperf-sec" id="mf-performance">
      <div className="container">
        <div className="sec-head sec-head-center reveal">
          <div className="label">Mutual Fund Performance</div>
          <h2 className="stitle">
            Top-performing funds, <em>ranked by returns.</em>
          </h2>
          <p className="sdesc">
            Consistent outperformers across horizons — hand-tracked by our research desk.
          </p>
        </div>

        <div className="mfperf-card reveal">
          <div className="mfperf-toggle" role="tablist" aria-label="Return horizon">
            {HORIZONS.map((h) => (
              <button
                key={h.key}
                role="tab"
                aria-selected={horizon === h.key}
                className={`mfperf-tab${horizon === h.key ? " active" : ""}`}
                onClick={() => setHorizon(h.key)}
              >
                {h.label} {h.key === "r1" ? "Return" : "CAGR"}
              </button>
            ))}
          </div>

          <ul className="mfperf-list">
            {sorted.map((f, i) => (
              <li key={f.name} className="mfperf-row">
                <span className="mfperf-rank">{i + 1}</span>
                <span className="mfperf-meta">
                  <strong>{f.name}</strong>
                  <em>
                    {f.category} · {"★".repeat(f.rating)}
                    <span className="mfperf-star-off">{"★".repeat(5 - f.rating)}</span>
                  </em>
                </span>
                <span className="mfperf-bar-wrap">
                  <span className="mfperf-bar" style={{ width: `${(f[horizon] / max) * 100}%` }} />
                </span>
                <span className="mfperf-val">{f[horizon].toFixed(1)}%</span>
              </li>
            ))}
          </ul>

          <div className="mfperf-foot">
            <span>Returns are illustrative and past performance is not indicative of future results.</span>
            <Link href="/products/mutual-funds" className="btn btn-primary">
              Explore mutual funds →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

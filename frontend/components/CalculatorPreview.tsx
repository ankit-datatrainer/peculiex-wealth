"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fmtINR } from "@/lib/util";

export default function CalculatorPreview() {
  const [amt, setAmt] = useState(10000);
  const [yr, setYr] = useState(15);
  const rate = 12;

  const { total, invested, gains } = useMemo(() => {
    const r = rate / 100 / 12;
    const n = yr * 12;
    const FV = r === 0 ? amt * n : amt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const inv = amt * n;
    return { total: FV, invested: inv, gains: FV - inv };
  }, [amt, yr]);

  // set slider fill
  useEffect(() => {
    const fill = (id: string, min: number, max: number, val: number) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.style.setProperty("--p", (((val - min) / (max - min)) * 100) + "%");
    };
    fill("cp-amt", 500, 200000, amt);
    fill("cp-yr", 1, 40, yr);
  }, [amt, yr]);

  return (
    <section className="preview-sec">
      <div className="container">
        <div className="preview-head reveal">
          <div>
            <div className="label">SIP Calculator</div>
            <h2>
              Plan your <em>monthly investment</em>
            </h2>
          </div>
          <Link href="/calculator" className="preview-cta">
            Open full calculator →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 32,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-divider)",
            borderRadius: 20,
            padding: 32,
            alignItems: "center"
          }}
          className="cp-shell"
        >
          <div>
            <div className="slider-row">
              <div className="slider-head">
                <span>Monthly SIP</span>
                <strong>{fmtINR(amt)}</strong>
              </div>
              <input
                id="cp-amt"
                type="range"
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
                <span>Duration</span>
                <strong>{yr} {yr === 1 ? "Year" : "Years"}</strong>
              </div>
              <input
                id="cp-yr"
                type="range"
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
            <div style={{ marginTop: 18, fontSize: "0.88rem", color: "var(--color-text-muted)" }}>
              Assumed return: <strong style={{ color: "var(--color-text)" }}>{rate}% p.a.</strong> ·{" "}
              <Link href="/calculator" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                tweak rate &amp; share →
              </Link>
            </div>
          </div>

          <div
            style={{
              borderLeft: "1px solid var(--color-divider)",
              paddingLeft: 32,
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
            className="cp-results"
          >
            <div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Total value
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.1rem",
                  fontWeight: 500,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.01em"
                }}
              >
                {fmtINR(total)}
              </div>
            </div>
            <div style={{ fontSize: "0.92rem", color: "var(--color-text-muted)" }}>
              You invest <strong style={{ color: "var(--color-text)" }}>{fmtINR(invested)}</strong>
            </div>
            <div style={{ fontSize: "0.92rem", color: "var(--color-text-muted)" }}>
              Est. returns <strong style={{ color: "#16a34a" }}>{fmtINR(gains)}</strong>
            </div>
            <Link href="/calculator" className="btn btn-primary" data-magnetic style={{ marginTop: 8 }}>
              Run full projection →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .cp-shell { grid-template-columns: 1fr !important; }
          .cp-results { border-left: 0 !important; padding-left: 0 !important; padding-top: 24px; border-top: 1px solid var(--color-divider); }
        }
      `}</style>
    </section>
  );
}

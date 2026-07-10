"use client";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { trailingReturn, sortNavAscending, type NavPoint } from "@/lib/mfCalc";
import AmcSchemeSelect, { type SchemeOption } from "./AmcSchemeSelect";

const PERIODS = [
  { label: "1M", years: 1 / 12 },
  { label: "3M", years: 0.25 },
  { label: "6M", years: 0.5 },
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "5Y", years: 5 }
];

type Returns = Record<string, number | null>;

export default function MfPerformanceTool() {
  const [amc, setAmc] = useState("");
  const [scheme, setScheme] = useState<SchemeOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returns, setReturns] = useState<Returns | null>(null);
  const [meta, setMeta] = useState<{ fund_house?: string; scheme_category?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReturns(null);
    if (!scheme) return setError("Please select an AMC and scheme.");

    setLoading(true);
    try {
      const r = await fetch(apiUrl(`/api/mf/scheme/${scheme.schemeCode}`));
      const data = await r.json();
      const series = sortNavAscending((data.data || []) as NavPoint[]);
      setMeta(data.meta || null);

      const out: Returns = {};
      for (const p of PERIODS) {
        const tr = trailingReturn(series, p.years);
        out[p.label] = tr ? tr.pct : null;
      }
      setReturns(out);
    } catch {
      setError("Couldn't fetch NAV data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>MF Performance</h2>
        <p>Real trailing returns computed from historical NAV — 1M through 5Y, annualised beyond 1 year.</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleSubmit}>
        <AmcSchemeSelect idPrefix="perf" amc={amc} onAmcChange={setAmc} scheme={scheme} onSchemeChange={setScheme} />
        <div className="mf-form-actions">
          <button type="submit" className="mf-btn-primary" disabled={loading}>
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </div>
      </form>

      {error && <p className="mf-error">{error}</p>}

      {returns && (
        <div className="mf-perf-result">
          {meta && (
            <p className="mf-perf-meta">
              {meta.fund_house} · {meta.scheme_category}
            </p>
          )}
          <div className="mf-result-grid">
            {PERIODS.map((p) => {
              const v = returns[p.label];
              return (
                <div className="mf-result-card" key={p.label}>
                  <span>{p.label} Return</span>
                  <strong className={v == null ? "" : v >= 0 ? "up" : "down"}>
                    {v == null ? "N/A" : `${v.toFixed(2)}%`}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

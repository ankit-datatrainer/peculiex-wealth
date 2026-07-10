"use client";
import { useState } from "react";
import { SCHEME_CATEGORIES } from "@/lib/mfData";
import { apiUrl } from "@/lib/api";
import { trailingReturn, sortNavAscending, fmtINR2, type NavPoint } from "@/lib/mfCalc";
import AmcSchemeSelect, { type SchemeOption } from "./AmcSchemeSelect";

type Meta = {
  fund_house?: string;
  scheme_type?: string;
  scheme_category?: string;
  scheme_name?: string;
  isin_growth?: string | null;
};

export default function FundFactsheets() {
  const [category, setCategory] = useState<string>("Equity");
  const [amc, setAmc] = useState("");
  const [scheme, setScheme] = useState<SchemeOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [latestNav, setLatestNav] = useState<{ nav: number; date: string } | null>(null);
  const [returns, setReturns] = useState<{ label: string; pct: number | null }[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMeta(null);
    setLatestNav(null);
    setReturns(null);
    if (!scheme) return setError("Please select an AMC and scheme.");

    setLoading(true);
    try {
      const r = await fetch(apiUrl(`/api/mf/scheme/${scheme.schemeCode}`));
      const data = await r.json();
      const series = sortNavAscending((data.data || []) as NavPoint[]);
      setMeta(data.meta || null);

      const last = series[series.length - 1];
      if (last) setLatestNav({ nav: last.nav, date: last.date.toLocaleDateString("en-IN") });

      const periods = [
        { label: "1Y", years: 1 },
        { label: "3Y", years: 3 },
        { label: "5Y", years: 5 }
      ];
      setReturns(periods.map((p) => ({ label: p.label, pct: trailingReturn(series, p.years)?.pct ?? null })));
    } catch {
      setError("Couldn't fetch scheme data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const officialSearchUrl = meta
    ? `https://www.google.com/search?q=${encodeURIComponent(`${meta.scheme_name || scheme?.schemeName} factsheet pdf`)}`
    : null;

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>Fund Factsheets</h2>
        <p>A real, live quick-factsheet built from actual fund data — with a link to the official published PDF.</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleSubmit}>
        <div className="mf-form-row">
          <label>Category</label>
          <div className="mf-radio-group">
            {SCHEME_CATEGORIES.map((c) => (
              <label key={c} className="mf-radio-item">
                <input
                  type="radio"
                  name="factsheet-category"
                  value={c}
                  checked={category === c}
                  onChange={() => setCategory(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <AmcSchemeSelect idPrefix="fact" amc={amc} onAmcChange={setAmc} scheme={scheme} onSchemeChange={setScheme} />

        <div className="mf-form-actions">
          <button type="submit" className="mf-btn-primary" disabled={loading}>
            {loading ? "Loading…" : "View Factsheet"}
          </button>
        </div>
      </form>

      {error && <p className="mf-error">{error}</p>}

      {meta && (
        <div className="mf-factsheet-card">
          <h3>{meta.scheme_name}</h3>
          <div className="mf-factsheet-meta">
            <div>
              <span>Fund House</span>
              <strong>{meta.fund_house}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{meta.scheme_category}</strong>
            </div>
            <div>
              <span>Type</span>
              <strong>{meta.scheme_type}</strong>
            </div>
            <div>
              <span>ISIN</span>
              <strong>{meta.isin_growth || "—"}</strong>
            </div>
            {latestNav && (
              <div>
                <span>Latest NAV</span>
                <strong>
                  {fmtINR2(latestNav.nav)} ({latestNav.date})
                </strong>
              </div>
            )}
          </div>

          {returns && (
            <div className="mf-result-grid">
              {returns.map((r) => (
                <div className="mf-result-card" key={r.label}>
                  <span>{r.label} Return</span>
                  <strong className={r.pct == null ? "" : r.pct >= 0 ? "up" : "down"}>
                    {r.pct == null ? "N/A" : `${r.pct.toFixed(2)}%`}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {officialSearchUrl && (
            <a href={officialSearchUrl} target="_blank" rel="noopener noreferrer" className="mf-btn-primary mf-factsheet-link">
              Find official factsheet PDF ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

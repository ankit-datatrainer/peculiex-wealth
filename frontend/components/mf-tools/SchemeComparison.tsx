"use client";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { trailingReturn, sortNavAscending, type NavPoint } from "@/lib/mfCalc";
import AmcSchemeSelect, { type SchemeOption } from "./AmcSchemeSelect";

const PERIODS = [
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "5Y", years: 5 }
];

type Column = {
  scheme: SchemeOption;
  meta: { fund_house?: string; scheme_category?: string } | null;
  returns: Record<string, number | null>;
};

export default function SchemeComparison() {
  const [amcA, setAmcA] = useState("");
  const [schemeA, setSchemeA] = useState<SchemeOption | null>(null);
  const [amcB, setAmcB] = useState("");
  const [schemeB, setSchemeB] = useState<SchemeOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[] | null>(null);

  const fetchColumn = async (scheme: SchemeOption): Promise<Column> => {
    const r = await fetch(apiUrl(`/api/mf/scheme/${scheme.schemeCode}`));
    const data = await r.json();
    const series = sortNavAscending((data.data || []) as NavPoint[]);
    const returns: Record<string, number | null> = {};
    for (const p of PERIODS) {
      const tr = trailingReturn(series, p.years);
      returns[p.label] = tr ? tr.pct : null;
    }
    return { scheme, meta: data.meta || null, returns };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setColumns(null);
    if (!schemeA || !schemeB) return setError("Please select two schemes to compare.");

    setLoading(true);
    try {
      const [a, b] = await Promise.all([fetchColumn(schemeA), fetchColumn(schemeB)]);
      setColumns([a, b]);
    } catch {
      setError("Couldn't fetch NAV data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>Scheme Comparison</h2>
        <p>Compare two schemes' real trailing returns side by side.</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleSubmit}>
        <div className="mf-compare-cols">
          <div>
            <div className="mf-compare-label">Scheme A</div>
            <AmcSchemeSelect idPrefix="cmpA" amc={amcA} onAmcChange={setAmcA} scheme={schemeA} onSchemeChange={setSchemeA} />
          </div>
          <div>
            <div className="mf-compare-label">Scheme B</div>
            <AmcSchemeSelect idPrefix="cmpB" amc={amcB} onAmcChange={setAmcB} scheme={schemeB} onSchemeChange={setSchemeB} />
          </div>
        </div>
        <div className="mf-form-actions">
          <button type="submit" className="mf-btn-primary" disabled={loading}>
            {loading ? "Comparing…" : "Compare"}
          </button>
        </div>
      </form>

      {error && <p className="mf-error">{error}</p>}

      {columns && (
        <div className="mf-table-wrap">
          <table className="mf-table mf-compare-table">
            <thead>
              <tr>
                <th>Metric</th>
                {columns.map((c) => (
                  <th key={c.scheme.schemeCode}>{c.scheme.schemeName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fund House</td>
                {columns.map((c) => (
                  <td key={c.scheme.schemeCode}>{c.meta?.fund_house || "—"}</td>
                ))}
              </tr>
              <tr>
                <td>Category</td>
                {columns.map((c) => (
                  <td key={c.scheme.schemeCode}>{c.meta?.scheme_category || "—"}</td>
                ))}
              </tr>
              {PERIODS.map((p) => (
                <tr key={p.label}>
                  <td>{p.label} Return</td>
                  {columns.map((c) => {
                    const v = c.returns[p.label];
                    return (
                      <td key={c.scheme.schemeCode} className={v == null ? "" : v >= 0 ? "up" : "down"}>
                        {v == null ? "N/A" : `${v.toFixed(2)}%`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

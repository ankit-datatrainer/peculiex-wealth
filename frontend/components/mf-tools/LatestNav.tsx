"use client";
import { useState } from "react";
import { AMC_LIST, amcSearchTerm } from "@/lib/mfData";
import { apiUrl } from "@/lib/api";
import { fmtINR2 } from "@/lib/mfCalc";

type Row = { schemeCode: number; schemeName: string; nav: number | null; date: string | null };

export default function LatestNav() {
  const [amc, setAmc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRows([]);
    const amcEntry = AMC_LIST.find((a) => a.name === amc);
    if (!amcEntry) return setError("Please select an AMC.");

    setLoading(true);
    try {
      const r = await fetch(apiUrl(`/api/mf/search?q=${encodeURIComponent(amcSearchTerm(amcEntry.name))}`));
      const list: { schemeCode: number; schemeName: string }[] = await r.json();
      const top = (Array.isArray(list) ? list : []).slice(0, 25);

      const withNav = await Promise.all(
        top.map(async (s) => {
          try {
            const lr = await fetch(apiUrl(`/api/mf/scheme/${s.schemeCode}/latest`));
            const ld = await lr.json();
            const point = ld?.data?.[0];
            return {
              schemeCode: s.schemeCode,
              schemeName: s.schemeName,
              nav: point ? parseFloat(point.nav) : null,
              date: point ? point.date : null
            };
          } catch {
            return { schemeCode: s.schemeCode, schemeName: s.schemeName, nav: null, date: null };
          }
        })
      );
      setRows(withNav);
      if (!withNav.length) setError("No schemes found for this AMC.");
    } catch {
      setError("Couldn't fetch NAV data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>Latest NAV</h2>
        <p>Live, real NAV data — pick an AMC to see its schemes' latest published NAV.</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleSubmit}>
        <div className="mf-form-row">
          <label>AMC</label>
          <select value={amc} onChange={(e) => setAmc(e.target.value)} className="mf-input">
            <option value="">Select</option>
            {AMC_LIST.map((a) => (
              <option key={a.code} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mf-form-actions">
          <button type="submit" className="mf-btn-primary" disabled={loading}>
            {loading ? "Loading…" : "Submit"}
          </button>
        </div>
      </form>

      {error && <p className="mf-error">{error}</p>}

      {rows.length > 0 && (
        <div className="mf-table-wrap">
          <table className="mf-table">
            <thead>
              <tr>
                <th>Scheme</th>
                <th>NAV</th>
                <th>As of</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.schemeCode}>
                  <td>{row.schemeName}</td>
                  <td>{row.nav != null ? fmtINR2(row.nav) : "—"}</td>
                  <td>{row.date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { simulateSwp, sortNavAscending, fmtINR, type NavPoint } from "@/lib/mfCalc";
import AmcSchemeSelect, { type SchemeOption } from "./AmcSchemeSelect";

type Result = ReturnType<typeof simulateSwp>;

export default function SwpCalculator() {
  const [amc, setAmc] = useState("");
  const [scheme, setScheme] = useState<SchemeOption | null>(null);
  const [initial, setInitial] = useState("500000");
  const [withdrawal, setWithdrawal] = useState("10000");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!scheme) return setError("Please select an AMC and scheme.");
    const initAmt = Number(initial);
    const wAmt = Number(withdrawal);
    if (!initAmt || initAmt <= 0) return setError("Enter a valid initial amount.");
    if (!wAmt || wAmt <= 0) return setError("Enter a valid withdrawal amount.");
    if (!fromDate || !toDate) return setError("Select both From and To dates.");
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from >= to) return setError("From date must be before To date.");

    setLoading(true);
    try {
      const r = await fetch(apiUrl(`/api/mf/scheme/${scheme.schemeCode}`));
      const data = await r.json();
      const series = sortNavAscending((data.data || []) as NavPoint[]);
      const sim = simulateSwp(series, initAmt, wAmt, from, to);
      if (!sim) {
        setError("No NAV data available for this scheme in the selected range.");
      } else {
        setResult(sim);
      }
    } catch {
      setError("Couldn't fetch NAV data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>SWP Calculator</h2>
        <p>Real historical NAV-based simulation of a Systematic Withdrawal Plan.</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleCalculate}>
        <AmcSchemeSelect idPrefix="swp" amc={amc} onAmcChange={setAmc} scheme={scheme} onSchemeChange={setScheme} />

        <div className="mf-form-row split">
          <div className="mf-form-col">
            <label>Initial Amount (Rs.)</label>
            <input type="number" min={1000} value={initial} onChange={(e) => setInitial(e.target.value)} className="mf-input" />
          </div>
          <div className="mf-form-col">
            <label>Withdrawal Amount (Rs./mo)</label>
            <input type="number" min={100} value={withdrawal} onChange={(e) => setWithdrawal(e.target.value)} className="mf-input" />
          </div>
        </div>

        <div className="mf-form-row split">
          <div className="mf-form-col">
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mf-input" />
          </div>
          <div className="mf-form-col">
            <label>To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mf-input" />
          </div>
        </div>

        {error && <p className="mf-error">{error}</p>}

        <div className="mf-form-actions">
          <button type="submit" className="mf-btn-primary" disabled={loading}>
            {loading ? "Calculating…" : "Calculate SWP Transaction"}
          </button>
        </div>
      </form>

      {result && (
        <div className="mf-result-grid">
          <div className="mf-result-card">
            <span>Withdrawals Made</span>
            <strong>{result.withdrawals}</strong>
          </div>
          <div className="mf-result-card">
            <span>Total Withdrawn</span>
            <strong>{fmtINR(result.totalWithdrawn)}</strong>
          </div>
          <div className="mf-result-card">
            <span>{result.depletedOn ? "Depleted On" : "Remaining Value"}</span>
            <strong className={result.depletedOn ? "down" : ""}>
              {result.depletedOn
                ? result.depletedOn.toLocaleDateString("en-IN")
                : fmtINR(result.remainingValue)}
            </strong>
          </div>
          {!result.depletedOn && (
            <div className="mf-result-card">
              <span>Remaining Units</span>
              <strong>{result.remainingUnits.toFixed(3)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { SIP_DATES } from "@/lib/mfData";
import { apiUrl } from "@/lib/api";
import { simulateSip, sortNavAscending, fmtINR, fmtINR2, type NavPoint } from "@/lib/mfCalc";
import AmcSchemeSelect, { type SchemeOption } from "./AmcSchemeSelect";

type Result = ReturnType<typeof simulateSip>;

export default function PastSipPerformance() {
  const [amc, setAmc] = useState("");
  const [scheme, setScheme] = useState<SchemeOption | null>(null);
  const [installment, setInstallment] = useState("5000");
  const [sipDate, setSipDate] = useState("1");
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
    const amt = Number(installment);
    if (!amt || amt <= 0) return setError("Enter a valid installment amount.");
    if (!fromDate || !toDate) return setError("Select both From and To dates.");
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from >= to) return setError("From date must be before To date.");

    setLoading(true);
    try {
      const r = await fetch(apiUrl(`/api/mf/scheme/${scheme.schemeCode}`));
      const data = await r.json();
      const series = sortNavAscending((data.data || []) as NavPoint[]);
      const sim = simulateSip(series, amt, Number(sipDate), from, to);
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
        <h2>Past SIP Performance</h2>
        <p>Real historical NAV-based calculation — pick any scheme and see how a SIP would have performed.</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleCalculate}>
        <AmcSchemeSelect
          idPrefix="sip"
          amc={amc}
          onAmcChange={setAmc}
          scheme={scheme}
          onSchemeChange={setScheme}
        />

        <div className="mf-form-row split">
          <div className="mf-form-col">
            <label>Installment Amount (Rs.)</label>
            <input
              type="number"
              min={100}
              value={installment}
              onChange={(e) => setInstallment(e.target.value)}
              className="mf-input"
              placeholder="e.g. 5000"
            />
          </div>
          <div className="mf-form-col">
            <label>SIP Date</label>
            <select value={sipDate} onChange={(e) => setSipDate(e.target.value)} className="mf-input">
              {SIP_DATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
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
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </div>
      </form>

      {result && (
        <div className="mf-result-grid">
          <div className="mf-result-card">
            <span>Installments</span>
            <strong>{result.installments}</strong>
          </div>
          <div className="mf-result-card">
            <span>Total Invested</span>
            <strong>{fmtINR(result.totalInvested)}</strong>
          </div>
          <div className="mf-result-card">
            <span>Current Value</span>
            <strong>{fmtINR(result.currentValue)}</strong>
          </div>
          <div className="mf-result-card">
            <span>Gain / Loss</span>
            <strong className={result.gain >= 0 ? "up" : "down"}>
              {result.gain >= 0 ? "+" : ""}
              {fmtINR(result.gain)} ({result.gainPct.toFixed(2)}%)
            </strong>
          </div>
          <div className="mf-result-card">
            <span>Annualised Return</span>
            <strong className={result.cagr >= 0 ? "up" : "down"}>{result.cagr.toFixed(2)}%</strong>
          </div>
          <div className="mf-result-card">
            <span>As of</span>
            <strong>
              {result.asOfDate.toLocaleDateString("en-IN")} · NAV {fmtINR2(result.asOfNav)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

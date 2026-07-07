"use client";
import { useState } from "react";

export default function PastSipPerformance() {
  const [amc, setAmc] = useState("");
  const [category, setCategory] = useState("");
  const [scheme, setScheme] = useState("");
  const [installment, setInstallment] = useState("");
  const [sipDate, setSipDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Calculate SIP Performance feature coming soon!");
  };

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>Past SIP Performance</h2>
        <p>Analyze historical returns of systematic investment plans</p>
      </div>

      <form className="mf-tool-form" onSubmit={handleCalculate}>
        <div className="mf-form-row">
          <label>AMC</label>
          <select value={amc} onChange={e => setAmc(e.target.value)} className="mf-input">
            <option value="">Select</option>
            <option value="sbi">SBI Mutual Fund</option>
            <option value="hdfc">HDFC Mutual Fund</option>
            <option value="icici">ICICI Prudential Mutual Fund</option>
            <option value="nippon">Nippon India Mutual Fund</option>
          </select>
        </div>

        <div className="mf-form-row">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="mf-input">
            <option value="">---</option>
            <option value="equity">Equity</option>
            <option value="debt">Debt</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="mf-form-row">
          <label>Scheme</label>
          <select value={scheme} onChange={e => setScheme(e.target.value)} className="mf-input">
            <option value="">Select</option>
            <option value="sbi-small-cap">SBI Small Cap Fund</option>
            <option value="hdfc-mid-cap">HDFC Mid-Cap Opportunities</option>
            <option value="icici-bluechip">ICICI Pru Bluechip Fund</option>
          </select>
        </div>

        <div className="mf-form-row split">
          <div className="mf-form-col">
            <label>Installment Amount (Rs.)</label>
            <input 
              type="number" 
              value={installment} 
              onChange={e => setInstallment(e.target.value)} 
              className="mf-input" 
              placeholder="e.g. 5000"
            />
          </div>
          <div className="mf-form-col">
            <label>SIP Date</label>
            <select value={sipDate} onChange={e => setSipDate(e.target.value)} className="mf-input">
              <option value="">Select</option>
              {[1, 5, 10, 15, 20, 25].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mf-form-row split">
          <div className="mf-form-col">
            <label>From Date</label>
            <input 
              type="date" 
              value={fromDate} 
              onChange={e => setFromDate(e.target.value)} 
              className="mf-input" 
            />
          </div>
          <div className="mf-form-col">
            <label>To Date</label>
            <input 
              type="date" 
              value={toDate} 
              onChange={e => setToDate(e.target.value)} 
              className="mf-input" 
            />
          </div>
        </div>

        <div className="mf-form-actions">
          <button type="submit" className="mf-btn-primary">Calculate</button>
        </div>
      </form>
    </div>
  );
}

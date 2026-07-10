"use client";
import { useState } from "react";
import Link from "next/link";
import { SCHEME_CATEGORIES } from "@/lib/mfData";

export default function CurrentNfos() {
  const [category, setCategory] = useState<string>("Equity");

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>Current NFOs</h2>
        <p>New Fund Offers open for subscription right now.</p>
      </div>

      <div className="mf-tool-form">
        <div className="mf-form-row">
          <label>Category</label>
          <div className="mf-radio-group">
            {SCHEME_CATEGORIES.map((c) => (
              <label key={c} className="mf-radio-item">
                <input
                  type="radio"
                  name="nfo-category"
                  value={c}
                  checked={category === c}
                  onChange={() => setCategory(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mf-empty-state">
        <div className="icon">📋</div>
        <h3>No live NFO feed connected yet</h3>
        <p>
          New Fund Offers open and close on a rolling basis, so we don&apos;t publish unverified listings here.
          Our advisory desk tracks every {category.toLowerCase()} NFO currently open and can tell you the exact
          subscription window, minimum investment, and whether it fits your portfolio.
        </p>
        <Link href="/get-started" className="btn btn-primary">
          Ask about current NFOs →
        </Link>
      </div>
    </div>
  );
}

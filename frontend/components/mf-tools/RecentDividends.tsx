"use client";
import { useState } from "react";
import Link from "next/link";
import { SCHEME_CATEGORIES } from "@/lib/mfData";

export default function RecentDividends() {
  const [category, setCategory] = useState<string>("Equity");

  return (
    <div className="mf-tool-container">
      <div className="mf-tool-header">
        <h2>Recent Announced Dividends</h2>
        <p>Latest dividend / IDCW payouts declared by mutual fund schemes.</p>
      </div>

      <div className="mf-tool-form">
        <div className="mf-form-row">
          <label>Category</label>
          <div className="mf-radio-group">
            {SCHEME_CATEGORIES.map((c) => (
              <label key={c} className="mf-radio-item">
                <input
                  type="radio"
                  name="dividend-category"
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
        <div className="icon">💰</div>
        <h3>No live dividend feed connected yet</h3>
        <p>
          Dividend/IDCW announcements are declared by AMCs on a rolling basis. Rather than show stale or
          unverified figures, our advisory desk can confirm the latest {category.toLowerCase()} scheme
          payouts and record dates for you directly.
        </p>
        <Link href="/get-started" className="btn btn-primary">
          Ask about recent dividends →
        </Link>
      </div>
    </div>
  );
}

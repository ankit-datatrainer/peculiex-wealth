"use client";
import { useState } from "react";
import Link from "next/link";
import { SCHEME_CATEGORIES } from "@/lib/mfData";
import MfToolHeader from "./MfToolHeader";
import { useContent } from "@/lib/content";
import { fill } from "@/lib/template";

export default function RecentDividends() {
  const [category, setCategory] = useState<string>("Equity");
  const cms = useContent("resources-mf");
  const t = (field: string, fallback: string) => cms.t("emptyStates", field, fallback);

  return (
    <div className="mf-tool-container">
      <MfToolHeader
        id="dividends"
        title="Recent Announced Dividends"
        intro="Latest dividend / IDCW payouts declared by mutual fund schemes."
      />

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
        <h3>{t("divTitle", "No live dividend feed connected yet")}</h3>
        <p>
          {fill(
            t(
              "divBody",
              "Dividend/IDCW announcements are declared by AMCs on a rolling basis. Rather than show stale or unverified figures, our advisory desk can confirm the latest {category} scheme payouts and record dates for you directly."
            ),
            { category: category.toLowerCase() }
          )}
        </p>
        <Link href={t("divHref", "/get-started")} className="btn btn-primary">
          {t("divCta", "Ask about recent dividends →")}
        </Link>
      </div>
    </div>
  );
}

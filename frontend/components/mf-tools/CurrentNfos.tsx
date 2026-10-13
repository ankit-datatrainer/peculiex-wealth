"use client";
import { useState } from "react";
import Link from "next/link";
import { SCHEME_CATEGORIES } from "@/lib/mfData";
import MfToolHeader from "./MfToolHeader";
import { useContent } from "@/lib/content";
import { fill } from "@/lib/template";

export default function CurrentNfos() {
  const [category, setCategory] = useState<string>("Equity");
  const cms = useContent("resources-mf");
  const t = (field: string, fallback: string) => cms.t("emptyStates", field, fallback);

  return (
    <div className="mf-tool-container">
      <MfToolHeader
        id="currentNfo"
        title="Current NFOs"
        intro="New Fund Offers open for subscription right now."
      />

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
        <h3>{t("nfoTitle", "No live NFO feed connected yet")}</h3>
        <p>
          {fill(
            t(
              "nfoBody",
              "New Fund Offers open and close on a rolling basis, so we don't publish unverified listings here. Our advisory desk tracks every {category} NFO currently open and can tell you the exact subscription window, minimum investment, and whether it fits your portfolio."
            ),
            { category: category.toLowerCase() }
          )}
        </p>
        <Link href={t("nfoHref", "/get-started")} className="btn btn-primary">
          {t("nfoCta", "Ask about current NFOs →")}
        </Link>
      </div>
    </div>
  );
}

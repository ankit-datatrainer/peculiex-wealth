"use client";

/**
 * The Rank Math / Yoast style analysis readout: one score, then every test
 * grouped the way those plugins group them, each with the fix spelled out.
 *
 * The analysis itself lives in lib/seoAnalysis.ts — this is only the
 * presentation.
 */

import { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import {
  SEO_GROUP_LABELS,
  type SeoGroup,
  type SeoReport,
  type SeoStatus
} from "@/lib/seoAnalysis";
import "./seo-panel.css";

const GROUP_ORDER: SeoGroup[] = ["basic", "additional", "title", "readability"];

function statusIcon(status: SeoStatus) {
  if (status === "good") return <CheckCircle2 size={15} className="sp-i-good" />;
  if (status === "warn") return <AlertTriangle size={15} className="sp-i-warn" />;
  return <AlertCircle size={15} className="sp-i-bad" />;
}

export default function SeoPanel({ report }: { report: SeoReport }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const map: Record<SeoGroup, typeof report.checks> = {
      basic: [],
      additional: [],
      title: [],
      readability: []
    };
    for (const c of report.checks) map[c.group].push(c);
    return map;
  }, [report]);

  const tone =
    report.score >= 80 ? "great" : report.score >= 50 ? "ok" : report.score > 0 ? "poor" : "none";

  // Rendered as a conic sweep so the ring needs no SVG or extra markup.
  const ringStyle = {
    background: `conic-gradient(var(--sp-tone) ${report.score * 3.6}deg, rgba(148,163,184,0.18) 0deg)`
  } as React.CSSProperties;

  const failing = report.checks.filter((c) => c.status !== "good").length;

  return (
    <div className={`sp sp-${tone}`}>
      <div className="sp-top">
        <div className="sp-ring" style={ringStyle}>
          <div className="sp-ring-in">
            <strong>{report.score}</strong>
            <span>/ 100</span>
          </div>
        </div>
        <div className="sp-top-copy">
          <h4>{report.grade}</h4>
          <p>
            {failing === 0
              ? "Every test passes. This post is ready to publish."
              : `${failing} test${failing === 1 ? "" : "s"} still to address.`}
          </p>
          <div className="sp-stats">
            <span>
              <b>{report.stats.words}</b> words
            </span>
            <span>
              <b>{report.stats.readingMinutes}</b> min read
            </span>
            <span>
              <b>{report.stats.keywordDensity}%</b> density
            </span>
            <span>
              <b>{report.stats.headings}</b> subheads
            </span>
            <span>
              <b>{report.stats.images}</b> images
            </span>
            <span>
              <b>{report.stats.internalLinks}</b> internal
            </span>
            <span>
              <b>{report.stats.externalLinks}</b> external
            </span>
            <span title={`Flesch reading ease ${report.stats.flesch}`}>
              <b>{report.stats.fleschLabel}</b> to read
            </span>
          </div>
        </div>
      </div>

      {GROUP_ORDER.map((g) => {
        const list = grouped[g];
        if (!list.length) return null;
        const passed = list.filter((c) => c.status === "good").length;
        const isCollapsed = collapsed[g];
        return (
          <section className="sp-group" key={g}>
            <button
              type="button"
              className="sp-group-head"
              aria-expanded={!isCollapsed}
              onClick={() => setCollapsed((c) => ({ ...c, [g]: !c[g] }))}
            >
              <ChevronDown size={14} className={isCollapsed ? "sp-chev is-closed" : "sp-chev"} />
              <span className="sp-group-name">{SEO_GROUP_LABELS[g]}</span>
              <span className="sp-group-count">
                {passed} / {list.length}
              </span>
            </button>
            {!isCollapsed && (
              <ul className="sp-list">
                {list.map((c) => (
                  <li className={`sp-item sp-${c.status}`} key={c.id}>
                    {statusIcon(c.status)}
                    <div>
                      <strong>{c.label}</strong>
                      <span>{c.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

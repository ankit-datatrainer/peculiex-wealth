"use client";
import { useMemo, useState } from "react";

type Q = { id: string; group: "Marcom" | "Centricity"; label: string };

const QUESTIONS: Q[] = [
  { id: "brand", group: "Marcom", label: "Brand & messaging consistency across channels" },
  { id: "content", group: "Marcom", label: "Quality & cadence of educational content" },
  { id: "digital", group: "Marcom", label: "Digital reach (social, email, web) effectiveness" },
  { id: "clarity", group: "Marcom", label: "Clarity & transparency of product communication" },
  { id: "response", group: "Centricity", label: "Speed of response to client queries" },
  { id: "personal", group: "Centricity", label: "Personalisation of advice to client goals" },
  { id: "trust", group: "Centricity", label: "Trust & relationship depth with clients" },
  { id: "retention", group: "Centricity", label: "Proactive reviews & retention efforts" }
];

function band(score: number) {
  if (score >= 80) return { label: "Excellent", color: "#16a34a" };
  if (score >= 60) return { label: "Strong", color: "#0ea5e9" };
  if (score >= 40) return { label: "Developing", color: "#f59e0b" };
  return { label: "Needs work", color: "#dc2626" };
}

export default function Reckoner() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, 6]))
  );

  const set = (id: string, v: number) => setScores((s) => ({ ...s, [id]: v }));

  const { total, marcom, centricity } = useMemo(() => {
    const avg = (grp: Q["group"]) => {
      const items = QUESTIONS.filter((q) => q.group === grp);
      const sum = items.reduce((a, q) => a + (scores[q.id] || 0), 0);
      return Math.round((sum / (items.length * 10)) * 100);
    };
    const m = avg("Marcom");
    const c = avg("Centricity");
    return { marcom: m, centricity: c, total: Math.round((m + c) / 2) };
  }, [scores]);

  const b = band(total);

  return (
    <section className="calc-sec">
      <div className="container reckoner">
        <div className="reckoner-form reveal">
          {(["Marcom", "Centricity"] as const).map((grp) => (
            <div key={grp} className="reckoner-group">
              <h3>{grp === "Marcom" ? "Marketing Communication" : "Client Centricity"}</h3>
              {QUESTIONS.filter((q) => q.group === grp).map((q) => (
                <label key={q.id} className="reckoner-item">
                  <span className="reckoner-label">
                    {q.label} <b>{scores[q.id]}/10</b>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={scores[q.id]}
                    onChange={(e) => set(q.id, +e.target.value)}
                  />
                </label>
              ))}
            </div>
          ))}
        </div>

        <aside className="reckoner-result reveal">
          <div className="reckoner-score" style={{ borderColor: b.color }}>
            <span className="reckoner-score-num" style={{ color: b.color }}>{total}</span>
            <span className="reckoner-score-of">/ 100</span>
            <span className="reckoner-band" style={{ background: b.color }}>{b.label}</span>
          </div>
          <ul className="reckoner-breakdown">
            <li><span>Marcom score</span><b>{marcom}%</b></li>
            <li><span>Centricity score</span><b>{centricity}%</b></li>
          </ul>
          <p className="reckoner-note">
            The reckoner blends your marketing-communication and client-centricity ratings into a
            single readiness score. Use it to spot the weakest lever and prioritise where to invest next.
          </p>
        </aside>
      </div>
    </section>
  );
}

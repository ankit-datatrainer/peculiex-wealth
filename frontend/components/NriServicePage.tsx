"use client";
import { useState } from "react";
import PageHero from "./PageHero";
import NriServiceForm from "./NriServiceForm";

type Faq = { q: string; a: string };
type Step = { title: string; body: string };
type Highlight = { title: string; body: string };

export type NriServiceContent = {
  label: string;
  title: React.ReactNode;
  subtitle: string;
  intro: string;
  highlights: Highlight[];
  steps: Step[];
  documents: string[];
  faqs: Faq[];
  serviceName: string;
};

export default function NriServicePage({ content }: { content: NriServiceContent }) {
  const { label, title, subtitle, intro, highlights, steps, documents, faqs, serviceName } = content;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <PageHero label={label} title={title} subtitle={subtitle} />

      <section style={{ padding: "0 0 30px" }}>
        <div className="container">
          <p className="nri-svc-intro">{intro}</p>
        </div>
      </section>

      <section style={{ padding: "40px 0 90px" }}>
        <div className="container nri-svc-layout">
          {/* Left: content */}
          <div className="nri-svc-content">
            <div className="sec-head reveal">
              <div className="label">What's included</div>
              <h2 className="stitle">
                Everything handled, <em>end to end.</em>
              </h2>
            </div>
            <div className="nri-svc-highlights">
              {highlights.map((h) => (
                <article className="why-card why-card-static reveal" key={h.title} style={{ minHeight: "auto" }}>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </article>
              ))}
            </div>

            <div className="sec-head reveal" style={{ marginTop: 56 }}>
              <div className="label">Process</div>
              <h2 className="stitle">
                How it <em>works.</em>
              </h2>
            </div>
            <ol className="steps" style={{ gridTemplateColumns: "1fr" }}>
              {steps.map((s, i) => (
                <li className="reveal" key={s.title}>
                  <span className="step-no">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="sec-head reveal" style={{ marginTop: 56 }}>
              <div className="label">Documents</div>
              <h2 className="stitle">
                What you'll <em>need.</em>
              </h2>
            </div>
            <ul className="nri-svc-doc-list reveal">
              {documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <div className="sec-head reveal" style={{ marginTop: 56 }}>
              <div className="label">FAQ</div>
              <h2 className="stitle">
                Common <em>questions.</em>
              </h2>
            </div>
            <ul className="faq-list">
              {faqs.map((f, i) => (
                <li className="faq-item reveal" data-open={openFaq === i} key={f.q}>
                  <button
                    className="faq-q"
                    type="button"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="faq-icon">
                      <svg viewBox="0 0 14 14" aria-hidden="true">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div className="faq-a">
                    <p>{f.a}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: sticky inquiry form */}
          <aside className="nri-svc-sidebar">
            <NriServiceForm serviceName={serviceName} />
          </aside>
        </div>
      </section>
    </>
  );
}

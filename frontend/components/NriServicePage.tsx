"use client";
import { useState } from "react";
import PageHero from "./PageHero";
import NriServiceForm from "./NriServiceForm";
import { accent, useContent } from "@/lib/content";

/** "How it *works.*" -> JSX with the <em> accent the design uses. */
function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? <span key={i}>{part}</span> : <em key={i}>{part.em}</em>
  );
}

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

export default function NriServicePage({ content, page }: { content: NriServiceContent; page?: string }) {
  const cms = useContent(page || "");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const intro = cms.t("service", "intro", content.intro);
  const serviceName = cms.t("service", "serviceName", content.serviceName);
  const highlights = cms.list<Highlight>("service", "highlights", content.highlights);
  const steps = cms.list<Step>("service", "steps", content.steps);
  const documents = cms
    .list<{ text: string }>(
      "service",
      "documents",
      content.documents.map((text) => ({ text }))
    )
    .map((d) => d.text)
    .filter(Boolean);
  const faqs = cms.list<Faq>("service", "faqs", content.faqs);
  const h = (field: string, fallback: string) => cms.t("headings", field, fallback);

  return (
    <>
      <PageHero page={page} label={content.label} title={content.title} subtitle={content.subtitle} />

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
              <div className="label">{h("includedLabel", "What's included")}</div>
              <h2 className="stitle">
                {renderAccented(h("includedTitle", "Everything handled, *end to end.*"))}
              </h2>
            </div>
            <div className="nri-svc-highlights">
              {highlights.map((x, i) => (
                <article className="why-card why-card-static reveal" key={`${i}-${x.title}`} style={{ minHeight: "auto" }}>
                  <h3>{x.title}</h3>
                  <p>{x.body}</p>
                </article>
              ))}
            </div>

            <div className="sec-head reveal" style={{ marginTop: 56 }}>
              <div className="label">{h("processLabel", "Process")}</div>
              <h2 className="stitle">{renderAccented(h("processTitle", "How it *works.*"))}</h2>
            </div>
            <ol className="steps" style={{ gridTemplateColumns: "1fr" }}>
              {steps.map((s, i) => (
                <li className="reveal" key={`${i}-${s.title}`}>
                  <span className="step-no">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="sec-head reveal" style={{ marginTop: 56 }}>
              <div className="label">{h("docsLabel", "Documents")}</div>
              <h2 className="stitle">{renderAccented(h("docsTitle", "What you'll *need.*"))}</h2>
            </div>
            <ul className="nri-svc-doc-list reveal">
              {documents.map((d, i) => (
                <li key={`${i}-${d}`}>{d}</li>
              ))}
            </ul>

            <div className="sec-head reveal" style={{ marginTop: 56 }}>
              <div className="label">{h("faqLabel", "FAQ")}</div>
              <h2 className="stitle">{renderAccented(h("faqTitle", "Common *questions.*"))}</h2>
            </div>
            <ul className="faq-list">
              {faqs.map((f, i) => (
                <li className="faq-item reveal" data-open={openFaq === i} key={`${i}-${f.q}`}>
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
            <NriServiceForm serviceName={serviceName} page={page} />
          </aside>
        </div>
      </section>
    </>
  );
}

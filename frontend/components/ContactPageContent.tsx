"use client";

import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import RegulatoryCredentials from "@/components/RegulatoryCredentials";
import ContactRoutes from "@/components/ContactRoutes";
import { useContent, accent } from "@/lib/content";

function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? <span key={i}>{part}</span> : <em key={i}>{part.em}</em>
  );
}

const cardStyle: React.CSSProperties = {
  padding: "20px 22px",
  borderRadius: 14,
  border: "1px solid var(--color-border, rgba(0,0,0,0.1))",
  background: "var(--color-surface, #fff)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--color-text-muted)",
  marginBottom: 6,
};

export default function ContactPageContent() {
  const cms = useContent("contact");

  const formTitle = cms.t("form", "title", "Send us a message");
  const formSubtitle = cms.t("form", "subtitle", "We reply within one working day.");

  const grievanceTitle = cms.t("grievance", "title", "Grievances");
  const grievanceBody = cms.t(
    "grievance",
    "body",
    "If we haven't resolved something to your satisfaction, our grievance procedure and escalation path are set out here."
  );
  const grievanceLabel = cms.t("grievance", "linkLabel", "Grievance redressal →");
  const grievanceHref = cms.t("grievance", "linkHref", "/legal/grievance");

  const regTitle = cms.t("regulatory", "title", "Regulatory registration");
  const regNote = cms.t(
    "regulatory",
    "note",
    "Quote our EUIN on every transaction. It ties the advice you received to the person who gave it."
  );

  return (
    <>
      <PageHero
        page="contact"
        label="Contact"
        title={<>Talk to a <em>real person.</em></>}
        subtitle="Advice is the product. Ask us anything — about a specific fund, a mandate you're weighing up, or an investment you already hold."
      />

      <section style={{ padding: "0 0 80px" }}>
        <div className="container" style={{ maxWidth: 1040 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
              gap: 40,
              alignItems: "start",
            }}
            className="contact-grid"
          >
            {/* Form */}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 500, marginBottom: 6 }}>
                {formTitle}
              </h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                {formSubtitle}
              </p>
              <ContactForm />
            </div>

            {/* Direct routes */}
            <aside style={{ display: "grid", gap: 16 }}>
              <ContactRoutes cardStyle={cardStyle} labelStyle={labelStyle} />

              <div style={cardStyle}>
                <div style={labelStyle}>{grievanceTitle}</div>
                <p style={{ margin: "0 0 8px", lineHeight: 1.7, fontSize: "0.9rem" }}>
                  {grievanceBody}
                </p>
                <a href={grievanceHref} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  {grievanceLabel}
                </a>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>{regTitle}</div>
                <RegulatoryCredentials
                  heading={null}
                  variant="inline"
                  note={regNote}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `@media (max-width: 860px){.contact-grid{grid-template-columns:1fr !important;gap:32px !important}}`,
        }}
      />
    </>
  );
}

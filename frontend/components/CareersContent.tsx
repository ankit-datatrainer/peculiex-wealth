"use client";

import PageHero from "@/components/PageHero";
import { useContent, accent } from "@/lib/content";

function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? <span key={i}>{part}</span> : <em key={i}>{part.em}</em>
  );
}

const DEFAULT_PRINCIPLES = [
  {
    title: "Small teams, large surface.",
    body: "Our largest team has six people. You'll ship code or recommendations that touch every active investor on the platform."
  },
  {
    title: "Compliance is engineering.",
    body: "SEBI compliance isn't a checklist somewhere else. Whoever ships the feature owns the regulatory surface it touches."
  },
  {
    title: "No revenue from product manufacturers.",
    body: "We charge investors a flat advisory fee. Sales targets do not exist on the advisory team."
  }
];

const DEFAULT_ROLES = [
  {
    title: "Commission Agent",
    team: "Management",
    location: "On-site",
    type: "Full-time",
    applyEmail: "info@finvoq.com"
  },
  {
    title: "Social Media Managers",
    team: "Management",
    location: "Delhi, Mumbai, Bangalore, Hyderabad, Goa, Pune, Kolkata, Chandigarh",
    type: "Full-time",
    applyEmail: "info@finvoq.com"
  },
  {
    title: "Business Developers",
    team: "Sales",
    location: "Remote",
    type: "Full-time",
    applyEmail: "info@finvoq.com"
  }
];

export default function CareersContent() {
  const cms = useContent("careers");

  const howHeading = cms.t("howWeWork", "heading", "How we work");
  const principles = cms.list<{ title: string; body: string }>(
    "howWeWork",
    "items",
    DEFAULT_PRINCIPLES
  );

  const rolesEyebrow = cms.t("openRoles", "eyebrow", "Open roles");
  const rolesTitle = cms.t(
    "openRoles",
    "title",
    "We're hiring across *product, advisory & research.*"
  );
  const roles = cms.list<{
    title: string;
    team: string;
    location: string;
    type: string;
    applyEmail?: string;
  }>("openRoles", "roles", DEFAULT_ROLES);

  const calloutText = cms.t(
    "openRoles",
    "calloutText",
    "Don't see a fit but think you'd add value? Email"
  );
  const calloutEmail = cms.t("openRoles", "calloutEmail", "info@finvoq.com");
  const calloutSub = cms.t(
    "openRoles",
    "calloutSub",
    "with what you'd want to build, and a link to your best work."
  );

  return (
    <>
      <PageHero
        page="careers"
        label="Careers"
        title={<>Build the platform <em>India's investors deserve.</em></>}
        subtitle="We're a small team rebuilding the wealth-management experience from first principles. We hire for craft, ownership, and unglamorous reliability."
      />

      <section style={{ padding: "0 0 80px" }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 500,
              marginBottom: 16
            }}
          >
            {howHeading}
          </h2>
          {principles.map((p, idx) => (
            <p key={idx} style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
              <strong>{p.title}</strong> {p.body}
            </p>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head">
            <div className="label">{rolesEyebrow}</div>
            <h2 className="stitle">{renderAccented(rolesTitle)}</h2>
          </div>
          <div className="role-grid">
            {roles.map((r, i) => (
              <div className="role-card" key={i}>
                <h3>{r.title}</h3>
                <div className="role-meta">
                  <span>{r.team}</span>
                  <span>·</span>
                  <span>{r.location}</span>
                </div>
                <div className="role-meta">
                  <span style={{ color: "var(--color-primary)" }}>{r.type}</span>
                </div>
                <a href={`mailto:${r.applyEmail || "info@finvoq.com"}`}>Apply →</a>
              </div>
            ))}
          </div>

          <p style={{ color: "var(--color-text-muted)", marginTop: 40, fontSize: "0.95rem" }}>
            {calloutText}{" "}
            <a href={`mailto:${calloutEmail}`} style={{ color: "var(--color-primary)" }}>
              {calloutEmail}
            </a>{" "}
            {calloutSub}
          </p>
        </div>
      </section>
    </>
  );
}

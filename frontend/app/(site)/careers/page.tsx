import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Careers at Peculiex",
  description:
    "We're building India's premium investment marketplace. If you care about what you build and how it's sold, we'd love to hear from you."
};

const ROLES = [
  { title: "Senior Frontend Engineer", team: "Product Engineering", location: "Mumbai · Hybrid", type: "Full-time" },
  { title: "Backend Engineer (Node + Postgres)", team: "Platform", location: "Mumbai / Remote India", type: "Full-time" },
  { title: "Investment Advisor (SEBI RIA)", team: "Advisory", location: "Mumbai · On-site", type: "Full-time" },
  { title: "Equity Research Analyst", team: "Research", location: "Mumbai · On-site", type: "Full-time" },
  { title: "Compliance & Risk Lead", team: "Compliance", location: "Mumbai · On-site", type: "Full-time" },
  { title: "Senior Product Designer", team: "Design", location: "Mumbai / Remote India", type: "Full-time" }
];

export default function CareersPage() {
  return (
    <>
      <PageHero
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
            How we work
          </h2>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
            <strong>Small teams, large surface.</strong> Our largest team has six people. You'll
            ship code or recommendations that touch every active investor on the platform.
          </p>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
            <strong>Compliance is engineering.</strong> SEBI compliance isn't a checklist somewhere
            else. Whoever ships the feature owns the regulatory surface it touches.
          </p>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
            <strong>No revenue from product manufacturers.</strong> We charge investors a flat
            advisory fee. Sales targets do not exist on the advisory team.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="sec-head">
            <div className="label">Open roles</div>
            <h2 className="stitle">
              We're hiring across <em>product, advisory & research.</em>
            </h2>
          </div>
          <div className="role-grid">
            {ROLES.map((r) => (
              <div className="role-card" key={r.title}>
                <h3>{r.title}</h3>
                <div className="role-meta">
                  <span>{r.team}</span>
                  <span>·</span>
                  <span>{r.location}</span>
                </div>
                <div className="role-meta">
                  <span style={{ color: "var(--color-primary)" }}>{r.type}</span>
                </div>
                <a href="mailto:careers@peculiex.example.com">Apply →</a>
              </div>
            ))}
          </div>

          <p style={{ color: "var(--color-text-muted)", marginTop: 40, fontSize: "0.95rem" }}>
            Don't see a fit but think you'd add value? Email{" "}
            <a href="mailto:careers@peculiex.example.com" style={{ color: "var(--color-primary)" }}>
              careers@peculiex.example.com
            </a>{" "}
            with what you'd want to build, and a link to your best work.
          </p>
        </div>
      </section>
    </>
  );
}

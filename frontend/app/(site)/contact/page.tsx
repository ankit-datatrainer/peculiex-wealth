import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import RegulatoryCredentials from "@/components/RegulatoryCredentials";
import {
  CONTACT,
  CITY,
  SOCIAL_LINKS,
  WHATSAPP_DISPLAY,
  WHATSAPP_LINK,
} from "@/lib/siteFacts";
import { SOCIAL_ICON_PATHS } from "@/lib/socialIcons";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Finvoq — talk to an adviser",
  description:
    "Reach the Finvoq team by phone, email or message. Questions about mutual funds, PMS, AIF, bonds, unlisted equity or NRI services — we reply within one working day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Finvoq — talk to an adviser",
    description:
      "Reach the Finvoq team by phone, email or message. We reply within one working day.",
    url: "/contact",
    images: [OG_IMAGE],
  },
};

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

export default function ContactPage() {
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
                Send us a message
              </h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                We reply within one working day.
              </p>
              <ContactForm />
            </div>

            {/* Direct routes */}
            <aside style={{ display: "grid", gap: 16 }}>
              {/* WhatsApp first: it is the fastest route to a human, and the
                  link opens the thread with a message already typed. */}
              {WHATSAPP_LINK ? (
                <div style={cardStyle}>
                  <div style={labelStyle}>WhatsApp</div>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      color: "var(--color-primary)",
                      fontWeight: 600,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="#25D366" width="18" height="18" aria-hidden="true">
                      <path d={SOCIAL_ICON_PATHS.whatsapp} />
                    </svg>
                    {WHATSAPP_DISPLAY}
                  </a>
                  <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                    Message us on WhatsApp for a quick answer — usually within the hour
                    during working hours.
                  </p>
                </div>
              ) : null}

              <div style={cardStyle}>
                <div style={labelStyle}>Email</div>
                <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  {CONTACT.email}
                </a>
                <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  For anything about an existing investment, please include your registered email
                  address so we can find your account.
                </p>
              </div>

              {CONTACT.phoneDisplay ? (
                <div style={cardStyle}>
                  <div style={labelStyle}>Phone</div>
                  <a href={`tel:${CONTACT.phone}`} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                    {CONTACT.phoneDisplay}
                  </a>
                  <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    {CONTACT.hours}
                  </p>
                </div>
              ) : null}

              <div style={cardStyle}>
                <div style={labelStyle}>Working hours</div>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{CONTACT.hours}</p>
                <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Messages sent outside these hours are answered the next working day.
                </p>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Grievances</div>
                <p style={{ margin: "0 0 8px", lineHeight: 1.7, fontSize: "0.9rem" }}>
                  If we haven&apos;t resolved something to your satisfaction, our grievance
                  procedure and escalation path are set out here.
                </p>
                <a href="/legal/grievance" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  Grievance redressal →
                </a>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Registered office</div>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{CITY}, India</p>
              </div>

              {SOCIAL_LINKS.some((s) => s.href) ? (
                <div style={cardStyle}>
                  <div style={labelStyle}>Follow us</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {SOCIAL_LINKS.filter((s) => s.href).map((s) => (
                      <a
                        key={s.id}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          border: "1px solid var(--color-border, rgba(0,0,0,0.1))",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
                          <path d={SOCIAL_ICON_PATHS[s.id]} />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Registration codes belong next to the contact routes: an
                  investor verifying us on the AMFI register is doing it at
                  exactly the moment they are deciding whether to get in touch. */}
              <div style={cardStyle}>
                <div style={labelStyle}>Regulatory registration</div>
                <RegulatoryCredentials
                  heading={null}
                  variant="inline"
                  note="Quote our EUIN on every transaction. It ties the advice you received to the person who gave it."
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

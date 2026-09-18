"use client";

import { useState } from "react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import RegulatoryCredentials from "@/components/RegulatoryCredentials";
import ContactRoutes from "@/components/ContactRoutes";
import { useContent, accent } from "@/lib/content";
import { contactFrom } from "@/lib/siteSettings";
import { MapPin, ExternalLink, Copy, Check, Navigation } from "lucide-react";

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
  const globalCms = useContent("global");
  const defaultContact = contactFrom(globalCms);

  const [copied, setCopied] = useState(false);

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

  // Office Location & Google Map configuration (CMS editable)
  const officeAddress = cms.t(
    "office",
    "address",
    defaultContact.address
  );
  const officeTitle = cms.t("office", "title", "Visit Our Office");
  const officeEyebrow = cms.t("office", "eyebrow", "Headquarters");
  const officeLandmark = cms.t(
    "office",
    "landmark",
    "Near Rajendra Place Metro Station (Blue Line) · Pusa Road"
  );

  const defaultMapUrl = `https://maps.google.com/?q=${encodeURIComponent(officeAddress)}`;
  const defaultMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(officeAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const mapUrl = cms.t("office", "mapUrl", defaultContact.mapUrl || defaultMapUrl) || defaultMapUrl;
  const mapEmbedUrl = cms.t("office", "mapEmbedUrl", defaultContact.mapEmbedUrl || defaultMapEmbedUrl) || defaultMapEmbedUrl;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(officeAddress).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

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

          {/* Office Location & Google Map Card */}
          <div
            className="contact-map-card"
            style={{
              marginTop: 48,
              borderRadius: 20,
              border: "1px solid var(--color-border, rgba(0,0,0,0.1))",
              background: "var(--color-surface, #fff)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.04)",
              overflow: "hidden",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <div
              style={{
                padding: "28px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 24,
                flexWrap: "wrap",
                borderBottom: "1px solid var(--color-border, rgba(0,0,0,0.08))",
              }}
            >
              <div style={{ flex: "1 1 500px", minWidth: 280 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#10b981",
                    marginBottom: 8,
                  }}
                >
                  <MapPin size={13} /> {officeEyebrow}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.45rem",
                    fontWeight: 600,
                    margin: "0 0 10px",
                    color: "var(--color-text, #0f172a)",
                  }}
                >
                  {officeTitle}
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    color: "var(--color-text, #1e293b)",
                    margin: "0 0 8px",
                    fontWeight: 500,
                  }}
                >
                  {officeAddress}
                </p>
                {officeLandmark && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted, #64748b)",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Navigation size={13} style={{ color: "#10b981", flexShrink: 0 }} />
                    {officeLandmark}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-outline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 999,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: copied ? "rgba(16,185,129,0.1)" : undefined,
                    borderColor: copied ? "#10b981" : undefined,
                    color: copied ? "#10b981" : undefined,
                    transition: "all 0.2s ease",
                  }}
                  title="Copy office address to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Address Copied!" : "Copy Address"}</span>
                </button>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 22px",
                    borderRadius: 999,
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                  }}
                >
                  <ExternalLink size={15} /> Open in Google Maps
                </a>
              </div>
            </div>

            {/* Google Map Embed Frame */}
            <div
              style={{
                width: "100%",
                height: 380,
                position: "relative",
                background: "var(--color-surface-offset, #f8fafc)",
              }}
            >
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="380"
                style={{
                  border: 0,
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Finvoq Registered Office Location Map"
              />
            </div>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 860px){
              .contact-grid{grid-template-columns:1fr !important;gap:32px !important}
            }
            [data-theme="dark"] .contact-map-card,
            .dark .contact-map-card {
              background: rgba(255, 255, 255, 0.03) !important;
              border-color: rgba(255, 255, 255, 0.1) !important;
              box-shadow: 0 12px 36px rgba(0,0,0,0.3) !important;
            }
          `,
        }}
      />
    </>
  );
}

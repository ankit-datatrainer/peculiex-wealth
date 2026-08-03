"use client";

/**
 * The direct-contact cards on /contact: WhatsApp, phone, hours, office and the
 * social row.
 *
 * Split out of the page because /contact is a server component and these read
 * live CMS values — the super admin edits the number in Global → WhatsApp chat
 * and this repaints without a deploy or even a refresh. The card chrome is
 * passed in so it stays identical to the server-rendered cards around it.
 */

import { SOCIAL_ICON_PATHS } from "@/lib/socialIcons";
import { contactFrom, socialFrom, whatsappFrom } from "@/lib/siteSettings";
import { useContent } from "@/lib/content";

export default function ContactRoutes({
  cardStyle,
  labelStyle,
}: {
  cardStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}) {
  const cms = useContent("global");
  const wa = whatsappFrom(cms);
  const social = socialFrom(cms);
  const contact = contactFrom(cms);

  const linkStyle: React.CSSProperties = {
    color: "var(--color-primary)",
    fontWeight: 600,
  };
  const noteStyle: React.CSSProperties = {
    margin: "10px 0 0",
    fontSize: "0.85rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.6,
  };

  return (
    <>
      {/* WhatsApp first: it is the fastest route to a human, and the link
          opens the thread with a message already typed. */}
      {wa.href ? (
        <div style={cardStyle}>
          <div style={labelStyle}>WhatsApp</div>
          <a
            href={wa.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <svg viewBox="0 0 24 24" fill="#25D366" width="18" height="18" aria-hidden="true">
              <path d={SOCIAL_ICON_PATHS.whatsapp} />
            </svg>
            {wa.display}
          </a>
          <p style={noteStyle}>
            Message us on WhatsApp for a quick answer — usually within the hour
            during working hours.
          </p>
        </div>
      ) : null}

      {contact.phoneDisplay ? (
        <div style={cardStyle}>
          <div style={labelStyle}>Phone</div>
          <a href={`tel:${contact.phone}`} style={linkStyle}>
            {contact.phoneDisplay}
          </a>
          <p style={noteStyle}>{contact.hours}</p>
        </div>
      ) : null}

      <div style={cardStyle}>
        <div style={labelStyle}>Working hours</div>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{contact.hours}</p>
        <p style={noteStyle}>
          Messages sent outside these hours are answered the next working day.
        </p>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Registered office</div>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{contact.address}</p>
      </div>

      {social.length > 0 ? (
        <div style={cardStyle}>
          <div style={labelStyle}>Follow us</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {social.map((s) => (
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
    </>
  );
}

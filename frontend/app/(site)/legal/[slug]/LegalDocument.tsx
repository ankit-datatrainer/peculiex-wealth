"use client";

/**
 * One /legal/<slug> document, editable from the Content Manager (Legal pages).
 *
 * The page server-renders the built-in JSX body and passes it in as the
 * fallback, so crawlers and a cold load get the full text immediately. Once
 * the content API answers, the admin's HTML takes over; its default is that
 * same body rendered to HTML, so an unedited page reads identically.
 */

import PageHero from "@/components/PageHero";
import ContentBody from "@/components/ContentBody";
import { useContent } from "@/lib/content";
import { useAmfi } from "@/lib/amfi";

type Props = {
  section: string;
  label: string;
  title: string;
  subtitle: string;
  updated: string;
  children: React.ReactNode;
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The body is written by a super admin, but it is still stripped of anything
 * executable so a pasted snippet can never run script on a public page.
 */
function safeHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|link|meta|base)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["']?)\s*(javascript|vbscript|data):/gi, "$1=$2#");
}

export default function LegalDocument({ section, label, title, subtitle, updated, children }: Props) {
  const cms = useContent("legal");
  const amfi = useAmfi();
  const t = (field: string, fallback: string) => cms.t(section, field, fallback);

  const body = cms.t(section, "body", "");
  // {{registration}} is the live AMFI line, exactly as <RegistrationLine /> renders it.
  const registration =
    `<strong>${escapeHtml(amfi.registrationLine)}</strong>` +
    (amfi.euin ? ` (EUIN ${escapeHtml(amfi.euin)})` : "");

  return (
    <>
      <PageHero label={t("label", label)} title={t("title", title)} subtitle={t("subtitle", subtitle)} />
      <ContentBody>
        <p
          style={{
            color: "var(--color-text-faint)",
            fontSize: "0.85rem",
            marginBottom: "2rem"
          }}
        >
          {t("updated", updated)}
        </p>
        {body ? (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: safeHtml(body).replace(/\{\{\s*registration\s*\}\}/g, registration)
            }}
          />
        ) : (
          children
        )}
      </ContentBody>
    </>
  );
}

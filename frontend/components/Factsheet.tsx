"use client";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { accent, useContent } from "@/lib/content";

/**
 * Compact, premium, text-only "document card" for a product's factsheet PDF
 * — title, description, and View/Download actions. No inline PDF preview.
 * Prefers a super-admin-uploaded file (served from the backend) and falls
 * back to a static file at /public/factsheets/<slug>.pdf. Non-technical
 * admins replace the PDF from Admin → Factsheets, no code changes.
 *
 * The card's copy is shared by every product and editable from the CMS
 * (`product-factsheet` → `card`); `{product}` / `{productLower}` in those
 * strings are swapped for this product's name.
 */
type Status = "checking" | "ready" | "empty";

export default function Factsheet({ slug, label }: { slug: string; label: string }) {
  const staticUrl = `/factsheets/${slug}.pdf`;
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("checking");
  const cms = useContent("product-factsheet");
  const t = (field: string, fallback: string) =>
    cms
      .t("card", field, fallback)
      .replace(/\{productLower\}/g, label.toLowerCase())
      .replace(/\{product\}/g, label);

  useEffect(() => {
    let killed = false;

    const useStatic = async () => {
      try {
        const r = await fetch(staticUrl, { method: "HEAD" });
        if (!killed) {
          if (r.ok) {
            setUrl(staticUrl);
            setStatus("ready");
          } else {
            setStatus("empty");
          }
        }
      } catch {
        if (!killed) setStatus("empty");
      }
    };

    fetch(apiUrl(`/api/factsheets/${slug}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (killed) return;
        if (data && data.exists) {
          const v = data.updatedAt ? `?v=${encodeURIComponent(data.updatedAt)}` : "";
          setUrl(apiUrl(`/api/factsheets/file/${slug}`) + v);
          setStatus("ready");
        } else {
          useStatic();
        }
      })
      .catch(() => {
        if (!killed) useStatic();
      });

    return () => {
      killed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Nothing to show and nothing to check — hide the section.
  if (status === "empty") return null;

  return (
    <section style={{ padding: "0 0 90px" }}>
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">{t("eyebrow", "Documents")}</div>
          <h2 className="stitle">
            {accent(t("title", "{product} *factsheet.*")).map((part, i) =>
              typeof part === "string" ? part : <em key={i}>{part.em}</em>
            )}
          </h2>
        </div>

        <div className="factsheet-card factsheet-card-text-only reveal">
          <div className="factsheet-card-body">
            <span className="factsheet-badge">{t("badge", "PDF Document")}</span>
            <h3>{t("cardTitle", "{product} Factsheet")}</h3>
            <p>
              {t(
                "cardBody",
                "The latest {productLower} factsheet, curated by our research desk."
              )}
            </p>
            {url && status === "ready" && (
              <div className="factsheet-card-actions">
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  {t("viewLabel", "View factsheet")}
                </a>
                <a href={url} download className="btn btn-ghost">
                  {t("downloadLabel", "Download ↓")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

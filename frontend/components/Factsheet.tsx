"use client";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

/**
 * Compact, premium, text-only "document card" for a product's factsheet PDF
 * — title, description, and View/Download actions. No inline PDF preview.
 * Prefers a super-admin-uploaded file (served from the backend) and falls
 * back to a static file at /public/factsheets/<slug>.pdf. Non-technical
 * admins replace the PDF from Admin → Factsheets, no code changes.
 */
type Status = "checking" | "ready" | "empty";

export default function Factsheet({ slug, label }: { slug: string; label: string }) {
  const staticUrl = `/factsheets/${slug}.pdf`;
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("checking");

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
          <div className="label">Documents</div>
          <h2 className="stitle">
            {label} <em>factsheet.</em>
          </h2>
        </div>

        <div className="factsheet-card factsheet-card-text-only reveal">
          <div className="factsheet-card-body">
            <span className="factsheet-badge">PDF Document</span>
            <h3>{label} Factsheet</h3>
            <p>The latest {label.toLowerCase()} factsheet, curated by our research desk.</p>
            {url && status === "ready" && (
              <div className="factsheet-card-actions">
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  View factsheet
                </a>
                <a href={url} download className="btn btn-ghost">
                  Download ↓
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

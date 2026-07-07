"use client";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

/**
 * Renders a product's factsheet PDF. Prefers a super-admin-uploaded file
 * (served from the backend) and falls back to a static file placed manually
 * at /public/factsheets/<slug>.pdf. Non-technical admins can replace the PDF
 * from Admin → Factsheets with no code changes.
 */
export default function Factsheet({ slug, label }: { slug: string; label: string }) {
  const staticUrl = `/factsheets/${slug}.pdf`;
  const [url, setUrl] = useState(staticUrl);

  useEffect(() => {
    let killed = false;
    fetch(apiUrl(`/api/factsheets/${slug}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (killed || !data || !data.exists) return;
        // Cache-bust so a freshly uploaded PDF shows immediately.
        const v = data.updatedAt ? `?v=${encodeURIComponent(data.updatedAt)}` : "";
        setUrl(apiUrl(`/api/factsheets/file/${slug}`) + v);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, [slug]);

  return (
    <section style={{ padding: "0 0 100px" }}>
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">Documents</div>
          <h2 className="stitle">
            {label} <em>factsheet &amp; brochure.</em>
          </h2>
        </div>
        <div className="pdf-embed reveal">
          <object data={url} type="application/pdf" className="pdf-embed-frame" aria-label={`${label} factsheet`}>
            <div className="pdf-embed-fallback">
              <p>Your browser can’t display the PDF inline.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Open factsheet
              </a>
            </div>
          </object>
          <div className="pdf-embed-actions">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Download PDF ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

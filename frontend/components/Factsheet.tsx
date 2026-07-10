"use client";
import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

/**
 * Renders a product's factsheet PDF as native-looking page content (rendered
 * with pdf.js to crisp images) rather than an embedded PDF viewer, so it blends
 * into the site. Prefers a super-admin-uploaded file (served from the backend)
 * and falls back to a static file at /public/factsheets/<slug>.pdf.
 * Non-technical admins replace the PDF from Admin → Factsheets, no code changes.
 */
type Status = "loading" | "ready" | "empty";

export default function Factsheet({ slug, label }: { slug: string; label: string }) {
  const staticUrl = `/factsheets/${slug}.pdf`;
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const pagesRef = useRef<HTMLDivElement | null>(null);

  // 1. Resolve which PDF to show: uploaded (backend) → else static file.
  useEffect(() => {
    let killed = false;
    fetch(apiUrl(`/api/factsheets/${slug}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (killed) return;
        if (data && data.exists) {
          const v = data.updatedAt ? `?v=${encodeURIComponent(data.updatedAt)}` : "";
          setUrl(apiUrl(`/api/factsheets/file/${slug}`) + v);
        } else {
          setUrl(staticUrl);
        }
      })
      .catch(() => !killed && setUrl(staticUrl));
    return () => {
      killed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 2. Render the PDF pages to canvases once the URL is known.
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const container = pagesRef.current;
      if (!container) return;
      try {
        const pdfjs: any = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) {
          pdf.destroy?.();
          return;
        }

        container.innerHTML = "";
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = container.clientWidth || 800;

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = width / base.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement("canvas");
          canvas.className = "factsheet-page";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          container.appendChild(canvas);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        if (!cancelled) {
          setStatus(container.childElementCount > 0 ? "ready" : "empty");
          cleanup = () => pdf.destroy?.();
        }
      } catch {
        if (!cancelled) setStatus("empty");
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [url]);

  // Nothing to show (no uploaded file and no static file) — hide the section.
  if (status === "empty") return null;

  return (
    <section style={{ padding: "0 0 100px" }}>
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">Documents</div>
          <h2 className="stitle">
            {label} <em>factsheet.</em>
          </h2>
        </div>

        <div className="factsheet-doc reveal">
          {status === "loading" && (
            <div className="factsheet-skeleton" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
          <div className="factsheet-pages" ref={pagesRef} />
          {url && status === "ready" && (
            <div className="factsheet-actions">
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Download PDF ↓
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

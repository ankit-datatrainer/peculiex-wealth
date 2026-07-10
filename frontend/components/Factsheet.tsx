"use client";
import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

/**
 * Compact, premium "document card" for a product's factsheet PDF — a small
 * thumbnail of the first page plus View/Download actions, rather than
 * embedding the full PDF inline. Prefers a super-admin-uploaded file (served
 * from the backend) and falls back to a static file at
 * /public/factsheets/<slug>.pdf. Non-technical admins replace the PDF from
 * Admin → Factsheets, no code changes.
 */
type Status = "loading" | "ready" | "empty";

export default function Factsheet({ slug, label }: { slug: string; label: string }) {
  const staticUrl = `/factsheets/${slug}.pdf`;
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);

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

  // 2. Render only page 1 as a small thumbnail (not the full document).
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const container = thumbRef.current;
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

        const page = await pdf.getPage(1);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const thumbWidth = 168;
        const base = page.getViewport({ scale: 1 });
        const scale = thumbWidth / base.width;
        const viewport = page.getViewport({ scale: scale * dpr });

        const canvas = document.createElement("canvas");
        canvas.className = "factsheet-thumb-canvas";
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no context");
        container.innerHTML = "";
        container.appendChild(canvas);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled) {
          setPageCount(pdf.numPages);
          setStatus("ready");
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
    <section style={{ padding: "0 0 90px" }}>
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">Documents</div>
          <h2 className="stitle">
            {label} <em>factsheet.</em>
          </h2>
        </div>

        <div className="factsheet-card reveal">
          <div className="factsheet-thumb" ref={thumbRef}>
            {status === "loading" && <div className="factsheet-thumb-skeleton" aria-hidden="true" />}
          </div>
          <div className="factsheet-card-body">
            <span className="factsheet-badge">PDF Document</span>
            <h3>{label} Factsheet</h3>
            <p>
              The latest {label.toLowerCase()} factsheet, curated by our research desk
              {pageCount ? ` · ${pageCount} page${pageCount > 1 ? "s" : ""}` : ""}.
            </p>
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

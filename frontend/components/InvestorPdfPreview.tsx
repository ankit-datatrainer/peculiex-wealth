"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

/** Render one page at a time so PDFs also work on mobile and embedded browsers. */
export default function InvestorPdfPreview({ url }: { url: string }) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(700);
  const [error, setError] = useState("");
  const [rendering, setRendering] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let stopped = false;
    let task: import("pdfjs-dist").PDFDocumentLoadingTask | undefined;
    setDocument(null);
    setPage(1);
    setError("");
    (async () => {
      const pdf = await import("pdfjs-dist");
      pdf.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs?v=${pdf.version}`;
      if (stopped) return;
      const loading = pdf.getDocument({ url, isEvalSupported: false });
      task = loading;
      const loaded = await loading.promise;
      if (!stopped) setDocument(loaded);
    })().catch(() => {
      if (!stopped)
        setError(
          "This PDF could not be displayed. Use Open PDF or Download below.",
        );
    });
    return () => {
      stopped = true;
      task?.destroy();
    };
  }, [url]);
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(250, entries[0].contentRect.width - 36)),
    );
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!document || !canvas.current) return;
    let stopped = false;
    let task: import("pdfjs-dist").RenderTask | undefined;
    setRendering(true);
    (async () => {
      const pdfPage = await document.getPage(page);
      if (stopped || !canvas.current) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({
        scale: (Math.min(width, 1200) / base.width) * zoom,
      });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const element = canvas.current;
      element.width = Math.floor(viewport.width * ratio);
      element.height = Math.floor(viewport.height * ratio);
      element.style.width = `${viewport.width}px`;
      element.style.height = `${viewport.height}px`;
      task = pdfPage.render({
        canvasContext: element.getContext("2d")!,
        viewport,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      await task.promise;
      if (!stopped) setRendering(false);
    })().catch((e) => {
      if (!stopped && e.name !== "RenderingCancelledException")
        setError(
          "This page could not be rendered. You can still download the original PDF.",
        );
    });
    return () => {
      stopped = true;
      task?.cancel();
    };
  }, [document, page, width, zoom]);
  return (
    <div className="us-pdf-renderer">
      <div className="us-pdf-toolbar">
        <button
          disabled={!document || page === 1}
          onClick={() => setPage((p) => p - 1)}
          aria-label="Previous PDF page"
        >
          ←
        </button>
        <label>
          Page{" "}
          <input
            type="number"
            aria-label="PDF page"
            min={1}
            max={document?.numPages || 1}
            value={page}
            onChange={(e) =>
              setPage(
                Math.max(
                  1,
                  Math.min(
                    document?.numPages || 1,
                    Number(e.target.value) || 1,
                  ),
                ),
              )
            }
          />
        </label>
        <span>of {document?.numPages || "…"}</span>
        <button
          disabled={!document || page === document.numPages}
          onClick={() => setPage((p) => p + 1)}
          aria-label="Next PDF page"
        >
          →
        </button>
        <select
          aria-label="PDF zoom"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        >
          <option value={1}>Fit width</option>
          <option value={1.25}>125%</option>
          <option value={1.5}>150%</option>
        </select>
      </div>
      <div ref={host} className="us-pdf-pages" aria-busy={rendering}>
        <div role="status">
          {error ||
            (!document
              ? "Loading investor document…"
              : rendering
                ? `Rendering page ${page}…`
                : "")}
        </div>
        <canvas ref={canvas} aria-label={`PDF page ${page}`} />
      </div>
    </div>
  );
}

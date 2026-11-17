"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import { type InvestorDocument } from "@/lib/unlisted-types";
import dynamic from "next/dynamic";
const InvestorPdfPreview = dynamic(() => import("./InvestorPdfPreview"), {
  ssr: false,
  loading: () => <p className="us-empty">Loading PDF viewer…</p>,
});

export default function UnlistedDocuments({
  documents,
}: {
  documents: InvestorDocument[];
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [selected, setSelected] = useState<InvestorDocument | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const visible = documents.filter(
    (d) =>
      (!type || d.type === type) &&
      (!year || d.year === year) &&
      `${d.title} ${d.type} ${d.year}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const path = (document: InvestorDocument) =>
    apiUrl(`/api/unlisted-documents/${document.id}`);
  return (
    <section
      className="us-card"
      id="documents"
      aria-labelledby="documents-title"
    >
      <div className="us-section-heading">
        <div>
          <span className="us-eyebrow">THE READING ROOM</span>
          <h2 id="documents-title">Investor documents</h2>
        </div>
        <span className="us-count">{documents.length} PDFs</span>
      </div>
      <p className="us-muted">
        Annual reports, presentations and filings made available by the source.
      </p>
      {documents.length > 0 ? (
        <>
          <div className="us-document-filters">
            <label className="us-doc-search">
              Search documents
              <input
                placeholder="Search reports & filings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label>
              Document type
              <select
                aria-label="Document type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All types</option>
                {[...new Set(documents.map((d) => d.type))].sort().map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Financial year
              <select
                aria-label="Financial year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">All years</option>
                {[...new Set(documents.map((d) => d.year).filter(Boolean))]
                  .sort()
                  .reverse()
                  .map((y) => (
                    <option key={y}>{y}</option>
                  ))}
              </select>
            </label>
          </div>
          <div className="us-document-list">
            {visible.map((document) => (
              <article className="us-document" key={document.id}>
                <span className="us-pdf-icon" aria-hidden="true">
                  PDF
                </span>
                <div>
                  <strong>{document.title}</strong>
                  <small>
                    {document.type}
                    {document.year ? ` · FY ${document.year}` : ""}
                  </small>
                </div>
                <div className="us-document-actions">
                  {document.available === false ? (
                    <span className="us-negative">Source unavailable</span>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelected(document)}
                        aria-label={`Preview ${document.title}`}
                      >
                        Preview
                      </button>
                      <a
                        href={`${path(document)}?download=1`}
                        aria-label={`Download ${document.title}`}
                      >
                        Download ↓
                      </a>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <p className="us-empty">
              No documents match these filters.{" "}
              <button
                className="us-text-button"
                onClick={() => {
                  setSearch("");
                  setType("");
                  setYear("");
                }}
              >
                Clear filters
              </button>
            </p>
          )}
        </>
      ) : (
        <p className="us-empty">
          No public investor PDFs are available from the source for this company
          yet.
        </p>
      )}
      <p className="us-footnote">
        Documents are supplied by third parties. Check their publication date
        and disclosures before relying on them.
      </p>
      <dialog
        ref={dialog}
        className="us-pdf-dialog"
        onClose={() => setSelected(null)}
        aria-label={selected?.title || "Investor document preview"}
      >
        {selected && (
          <>
            <header>
              <div>
                <small>INVESTOR DOCUMENT</small>
                <h3>{selected.title}</h3>
              </div>
              <button
                onClick={() => {
                  dialog.current?.close();
                  setSelected(null);
                }}
                aria-label="Close PDF preview"
              >
                ✕
              </button>
            </header>
            <InvestorPdfPreview url={path(selected)} />
            <footer>
              <span>Read the report here or download the original PDF.</span>
              <a
                href={path(selected)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF ↗
              </a>
              <a href={`${path(selected)}?download=1`}>Download ↓</a>
            </footer>
          </>
        )}
      </dialog>
    </section>
  );
}

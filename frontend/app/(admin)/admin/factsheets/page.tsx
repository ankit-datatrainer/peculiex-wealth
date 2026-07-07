"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCTS } from "@/lib/productContent";
import { apiFetch, apiUrl } from "@/lib/api";

type ManifestEntry = { filename?: string; size?: number; updatedAt?: string; updatedBy?: string };
type Manifest = Record<string, ManifestEntry>;

const PRODUCT_LIST = Object.values(PRODUCTS).map((p) => ({ slug: p.slug, label: p.label }));

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function prettySize(n?: number) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminFactsheetsPage() {
  const [manifest, setManifest] = useState<Manifest>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const reload = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: Manifest }>("/api/factsheets");
      setManifest(data.items || {});
    } catch {
      setManifest({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onUpload = async (slug: string, file: File) => {
    setError(null);
    setMsg(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large (max 20 MB).");
      return;
    }
    setBusy(slug);
    try {
      const dataBase64 = await fileToBase64(file);
      const res = await apiFetch<{ ok: boolean } & ManifestEntry>("/api/factsheets", {
        method: "POST",
        body: JSON.stringify({ slug, filename: file.name, dataBase64 }),
        headers: { "Content-Type": "application/json" }
      });
      setManifest((m) => ({ ...m, [slug]: res }));
      setMsg(`Uploaded factsheet for “${slug}”. It’s now live on the website.`);
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    } finally {
      setBusy(null);
      if (inputs.current[slug]) inputs.current[slug]!.value = "";
    }
  };

  const onDelete = async (slug: string) => {
    if (!confirm(`Remove the uploaded factsheet for “${slug}”?`)) return;
    setBusy(slug);
    setError(null);
    setMsg(null);
    try {
      await apiFetch(`/api/factsheets/${slug}`, { method: "DELETE" });
      setManifest((m) => {
        const next = { ...m };
        delete next[slug];
        return next;
      });
      setMsg(`Removed the uploaded factsheet for “${slug}”.`);
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Factsheets</h1>
          <p className="admin-page-sub">
            Upload a PDF for any product. It appears automatically on that product’s page —
            no code changes needed. Uploading again replaces the existing file.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={reload}>
          Refresh
        </button>
      </header>

      {msg && <div className="admin-success">{msg}</div>}
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading factsheets…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current file</th>
                <th>Updated</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_LIST.map((p) => {
                const entry = manifest[p.slug];
                const uploading = busy === p.slug;
                return (
                  <tr key={p.slug}>
                    <td>
                      <strong>{p.label}</strong>
                      <div style={{ fontSize: ".78rem", color: "var(--color-text-muted)" }}>{p.slug}</div>
                    </td>
                    <td>
                      {entry ? (
                        <a
                          href={apiUrl(`/api/factsheets/file/${p.slug}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {entry.filename || `${p.slug}.pdf`}
                        </a>
                      ) : (
                        <span style={{ color: "var(--color-text-muted)" }}>
                          No upload (using static file if present)
                        </span>
                      )}
                      {entry?.size ? (
                        <span style={{ color: "var(--color-text-muted)" }}> · {prettySize(entry.size)}</span>
                      ) : null}
                    </td>
                    <td style={{ color: "var(--color-text-muted)", fontSize: ".84rem" }}>
                      {entry?.updatedAt ? new Date(entry.updatedAt).toLocaleString() : "—"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <input
                        ref={(el) => {
                          inputs.current[p.slug] = el;
                        }}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onUpload(p.slug, f);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={uploading}
                        onClick={() => inputs.current[p.slug]?.click()}
                      >
                        {uploading ? "Uploading…" : entry ? "Replace PDF" : "Upload PDF"}
                      </button>
                      {entry && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ marginLeft: 8, color: "#dc2626", borderColor: "#fca5a5" }}
                          disabled={uploading}
                          onClick={() => onDelete(p.slug)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: ".84rem", color: "var(--color-text-muted)" }}>
        Only PDF files up to 20 MB are accepted. Uploads take effect immediately on the live site.
      </p>
    </div>
  );
}

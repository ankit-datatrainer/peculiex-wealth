"use client";

/**
 * Content Manager: edit the copy and imagery of every public page.
 *
 * The form is generated from the schema the backend serves, so adding a
 * field to backend/src/content/schema.js makes it appear here with no
 * changes to this file. Saving writes to the database and pushes the new
 * copy to every open browser over the WebSocket, so the live site updates
 * without a refresh.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch, apiUrl, tokenStore } from "@/lib/api";

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "url" | "select" | "list";
  default?: unknown;
  hint?: string;
  options?: string[];
  fields?: Field[];
};
type Section = { key: string; label: string; fields: Field[] };
type Page = { key: string; label: string; path: string; sections: Section[] };
type Status = Record<string, { edited: boolean; updatedAt?: string | null }>;
type Row = Record<string, string>;
type Content = Record<string, Record<string, string | Row[]>>;

const when = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
};

export default function ContentManagerPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [status, setStatus] = useState<Status>({});
  const [all, setAll] = useState<Record<string, Content>>({});
  const [active, setActive] = useState<string>("home");
  const [draft, setDraft] = useState<Content>({});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  /* ── load schema + current content ── */
  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch<{ pages: Page[]; status: Status; content: Record<string, Content> }>(
          "/api/content/schema"
        );
        setPages(r.pages || []);
        setStatus(r.status || {});
        setAll(r.content || {});
        const first = r.pages?.[0]?.key || "home";
        setActive(first);
        setDraft(JSON.parse(JSON.stringify(r.content?.[first] || {})));
        setOpenSection(r.pages?.[0]?.sections?.[0]?.key || null);
      } catch (e: any) {
        setErr(e?.message || "Could not load the content schema.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const page = useMemo(() => pages.find((p) => p.key === active), [pages, active]);

  const selectPage = (key: string) => {
    if (dirty && !confirm("Discard unsaved changes on this page?")) return;
    setActive(key);
    setDraft(JSON.parse(JSON.stringify(all[key] || {})));
    setDirty(false);
    setMsg(null);
    setErr(null);
    setOpenSection(pages.find((p) => p.key === key)?.sections?.[0]?.key || null);
  };

  const setField = (sec: string, field: string, value: string) => {
    setDraft((d) => ({ ...d, [sec]: { ...(d[sec] || {}), [field]: value } }));
    setDirty(true);
  };

  const setRows = (sec: string, field: string, rows: Row[]) => {
    setDraft((d) => ({ ...d, [sec]: { ...(d[sec] || {}), [field]: rows } }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const r = await apiFetch<{ content: Content }>(`/api/content/${active}`, {
        method: "PUT",
        body: JSON.stringify({ content: draft })
      });
      setAll((a) => ({ ...a, [active]: r.content }));
      setDraft(JSON.parse(JSON.stringify(r.content)));
      setStatus((s) => ({ ...s, [active]: { edited: true, updatedAt: new Date().toISOString() } }));
      setDirty(false);
      setMsg("Saved. The live site has been updated.");
      setTimeout(() => setMsg(null), 4000);
    } catch (e: any) {
      setErr(e?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset this page to the original copy? Your edits will be removed.")) return;
    setSaving(true);
    setErr(null);
    try {
      const r = await apiFetch<{ content: Content }>(`/api/content/${active}`, {
        method: "DELETE"
      });
      setAll((a) => ({ ...a, [active]: r.content }));
      setDraft(JSON.parse(JSON.stringify(r.content)));
      setStatus((s) => ({ ...s, [active]: { edited: false } }));
      setDirty(false);
      setMsg("Reset to the original copy.");
      setTimeout(() => setMsg(null), 4000);
    } catch (e: any) {
      setErr(e?.message || "Could not reset.");
    } finally {
      setSaving(false);
    }
  };

  const shown = pages.filter(
    (p) =>
      !filter.trim() ||
      p.label.toLowerCase().includes(filter.toLowerCase()) ||
      p.path.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading content…</p>
      </div>
    );
  }

  return (
    <div className="cms">
      <header className="cms-head">
        <div>
          <h1>Content Manager</h1>
          <p>
            Edit the text and images of every public page. Changes save to the
            database and appear on the live site immediately.
          </p>
        </div>
      </header>

      {err && <div className="admin-error">{err}</div>}
      {msg && <div className="admin-success">{msg}</div>}

      <div className="cms-body">
        {/* ── page list ── */}
        <aside className="cms-list">
          <input
            className="admin-input cms-search"
            placeholder="Search pages…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="cms-list-scroll">
            {shown.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`cms-page${p.key === active ? " active" : ""}`}
                onClick={() => selectPage(p.key)}
              >
                <span className="cms-page-label">{p.label}</span>
                <span className="cms-page-path">{p.path}</span>
                {status[p.key]?.edited && <span className="cms-dot" title="Customised" />}
              </button>
            ))}
            {!shown.length && <p className="admin-empty">No pages match.</p>}
          </div>
        </aside>

        {/* ── editor ── */}
        <section className="cms-editor">
          {page && (
            <>
              <div className="cms-toolbar">
                <div>
                  <h2>{page.label}</h2>
                  <span className="cms-meta">
                    {status[active]?.edited
                      ? `Customised${
                          status[active]?.updatedAt ? ` · ${when(status[active]?.updatedAt)}` : ""
                        }`
                      : "Using the original copy"}
                  </span>
                </div>
                <div className="cms-actions">
                  <Link href={page.path} target="_blank" className="btn btn-outline">
                    View page ↗
                  </Link>
                  {status[active]?.edited && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={reset}
                      disabled={saving}
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={save}
                    disabled={saving || !dirty}
                  >
                    {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
                  </button>
                </div>
              </div>

              {page.sections.map((sec) => {
                const open = openSection === sec.key;
                return (
                  <div key={sec.key} className={`cms-section${open ? " open" : ""}`}>
                    <button
                      type="button"
                      className="cms-section-head"
                      onClick={() => setOpenSection(open ? null : sec.key)}
                    >
                      <span>{sec.label}</span>
                      <span className="cms-caret">{open ? "−" : "+"}</span>
                    </button>
                    {open && (
                      <div className="cms-fields">
                        {sec.fields.map((field) =>
                          field.type === "list" ? (
                            <ListField
                              key={field.key}
                              field={field}
                              rows={(draft[sec.key]?.[field.key] as Row[]) || []}
                              onChange={(rows) => setRows(sec.key, field.key, rows)}
                            />
                          ) : (
                            <FieldInput
                              key={field.key}
                              field={field}
                              value={(draft[sec.key]?.[field.key] as string) ?? ""}
                              onChange={(v) => setField(sec.key, field.key, v)}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </section>
      </div>

      <style jsx global>{`
        .cms-head h1 {
          font-size: 1.6rem;
          margin: 0 0 4px;
        }
        .cms-head p {
          margin: 0 0 20px;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .cms-body {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .cms-body {
            grid-template-columns: 1fr;
          }
        }
        .cms-list {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 12px;
          position: sticky;
          top: 16px;
        }
        .cms-search {
          margin-bottom: 10px;
        }
        .cms-list-scroll {
          max-height: 70vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cms-page {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
          padding: 9px 12px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: var(--color-text);
          cursor: pointer;
          font-family: inherit;
        }
        .cms-page:hover {
          background: var(--color-surface-offset);
        }
        .cms-page.active {
          background: var(--color-primary);
          color: var(--color-on-primary);
        }
        .cms-page-label {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .cms-page-path {
          font-size: 0.72rem;
          opacity: 0.7;
        }
        .cms-dot {
          position: absolute;
          top: 12px;
          right: 10px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-primary-ink);
        }
        .cms-page.active .cms-dot {
          background: var(--color-on-primary);
        }
        .cms-editor {
          min-width: 0;
        }
        .cms-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .cms-toolbar h2 {
          margin: 0;
          font-size: 1.15rem;
        }
        .cms-meta {
          font-size: 0.78rem;
          color: var(--color-text-faint);
        }
        .cms-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cms-section {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-surface-2);
          margin-bottom: 10px;
          overflow: hidden;
        }
        .cms-section-head {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: transparent;
          border: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-text);
          font-family: inherit;
        }
        .cms-section.open .cms-section-head {
          border-bottom: 1px solid var(--color-border);
        }
        .cms-caret {
          font-size: 1.1rem;
          color: var(--color-text-faint);
        }
        .cms-fields {
          padding: 16px;
          display: grid;
          gap: 14px;
        }
        .cms-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 5px;
          color: var(--color-text-muted);
        }
        .cms-field textarea {
          min-height: 80px;
          resize: vertical;
        }
        .cms-hint {
          font-size: 0.72rem;
          color: var(--color-text-faint);
          margin-top: 4px;
        }
        .cms-img-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .cms-img-prev {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          object-fit: contain;
          background: var(--color-surface);
          flex-shrink: 0;
        }
        .cms-img-controls {
          flex: 1;
          min-width: 0;
          display: grid;
          gap: 6px;
        }
        .cms-list-rows {
          display: grid;
          gap: 10px;
        }
        .cms-row {
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 12px;
          background: var(--color-surface);
          display: grid;
          gap: 10px;
        }
        .cms-row-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-faint);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .cms-row-btns {
          display: flex;
          gap: 4px;
        }
        .cms-mini {
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          color: var(--color-text);
          border-radius: 7px;
          padding: 3px 9px;
          cursor: pointer;
          font-size: 0.78rem;
          font-family: inherit;
        }
        .cms-mini:hover {
          border-color: var(--color-primary-ink);
        }
        .cms-mini.danger:hover {
          border-color: #dc2626;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}

/* ── one scalar field ─────────────────────────────────────────── */

function FieldInput({
  field,
  value,
  onChange
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "image") {
    return <ImageField field={field} value={value} onChange={onChange} />;
  }
  return (
    <div className="cms-field">
      <label>{field.label}</label>
      {field.type === "textarea" ? (
        <textarea
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.hint && <p className="cms-hint">{field.hint}</p>}
    </div>
  );
}

/* ── image field with upload ──────────────────────────────────── */

function ImageField({
  field,
  value,
  onChange
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => reject(new Error("Could not read the file."));
        fr.readAsDataURL(file);
      });
      const res = await fetch(apiUrl("/api/content/upload"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get() || ""}`
        },
        body: JSON.stringify({ image: dataUrl })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed.");
      onChange(j.url);
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const src = value?.startsWith("/api/") ? apiUrl(value) : value;

  return (
    <div className="cms-field">
      <label>{field.label}</label>
      <div className="cms-img-row">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="cms-img-prev" />
        ) : (
          <div className="cms-img-prev" />
        )}
        <div className="cms-img-controls">
          <input
            className="admin-input"
            value={value}
            placeholder="/image.png or https://…"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="cms-row-btns">
            <button
              type="button"
              className="cms-mini"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                className="cms-mini danger"
                onClick={() => onChange("")}
              >
                Clear
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {error && <p className="cms-hint" style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

/* ── repeatable list ──────────────────────────────────────────── */

function ListField({
  field,
  rows,
  onChange
}: {
  field: Field;
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const blank = () =>
    Object.fromEntries((field.fields || []).map((f) => [f.key, ""])) as Row;

  const update = (i: number, key: string, v: string) => {
    const next = rows.map((r, n) => (n === i ? { ...r, [key]: v } : r));
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="cms-field">
      <label>{field.label}</label>
      <div className="cms-list-rows">
        {rows.map((row, i) => (
          <div key={i} className="cms-row">
            <div className="cms-row-head">
              <span>
                {field.label} {i + 1}
              </span>
              <span className="cms-row-btns">
                <button type="button" className="cms-mini" onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="cms-mini" onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="cms-mini danger"
                  onClick={() => onChange(rows.filter((_, n) => n !== i))}
                >
                  Remove
                </button>
              </span>
            </div>
            {(field.fields || []).map((sub) =>
              sub.type === "image" ? (
                <ImageField
                  key={sub.key}
                  field={sub}
                  value={row[sub.key] || ""}
                  onChange={(v) => update(i, sub.key, v)}
                />
              ) : (
                <FieldInput
                  key={sub.key}
                  field={sub}
                  value={row[sub.key] || ""}
                  onChange={(v) => update(i, sub.key, v)}
                />
              )
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="cms-mini"
        style={{ marginTop: 8 }}
        onClick={() => onChange([...rows, blank()])}
      >
        + Add {field.label.replace(/s$/, "").toLowerCase()}
      </button>
    </div>
  );
}

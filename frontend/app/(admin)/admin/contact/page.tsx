"use client";

import { useEffect, useState } from "react";
import {
  fetchContactMessages,
  deleteContactMessage,
  type AdminContactMessage
} from "@/lib/admin-api";

export default function AdminContactPage() {
  const [items, setItems] = useState<AdminContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AdminContactMessage | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchContactMessages());
    } catch (e: any) {
      setError(e?.message || "Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onDelete = async (m: AdminContactMessage) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    try {
      await deleteContactMessage(m.id);
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      if (open?.id === m.id) setOpen(null);
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Contact Messages</h1>
          <p className="admin-page-sub">
            Submissions from the public contact form.
          </p>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading messages…</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            No messages yet. (In seed mode submissions are not persisted.)
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Preview</th>
                <th>Received</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.name}</strong>
                    <div className="admin-table-meta">{m.email}</div>
                  </td>
                  <td>{m.subject}</td>
                  <td className="admin-msg-cell">
                    {m.message.length > 90
                      ? m.message.slice(0, 90) + "…"
                      : m.message}
                  </td>
                  <td>{formatDate(m.created_at)}</td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => setOpen(m)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-danger"
                      onClick={() => onDelete(m)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="admin-modal" onClick={() => setOpen(null)}>
          <div
            className="admin-modal-body"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h2>{open.subject}</h2>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </header>
            <div className="admin-msg-detail">
              <div>
                <strong>{open.name}</strong>
                <div className="admin-table-meta">
                  {open.email} · {formatDate(open.created_at)}
                </div>
              </div>
              <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
                {open.message}
              </p>
            </div>
            <footer className="admin-modal-foot">
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(
                  "Re: " + open.subject
                )}`}
                className="btn btn-outline"
              >
                Reply via email
              </a>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onDelete(open)}
                style={{ background: "#dc2626", color: "#fff" }}
              >
                Delete message
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(s: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

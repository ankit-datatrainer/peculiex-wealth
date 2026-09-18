"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchContactMessages,
  deleteContactMessage,
  type AdminContactMessage
} from "@/lib/admin-api";
import { MapPin, ExternalLink, Settings } from "lucide-react";

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
            Submissions from the public contact form. Looking to edit website copy and hero metrics? Go to{" "}
            <Link
              href="/admin/content"
              style={{
                color: "var(--color-primary, #13735d)",
                fontWeight: 600,
                textDecoration: "underline"
              }}
            >
              Content Manager
            </Link>.
          </p>
        </div>
      </header>

      {/* Office & Google Map Shortcut */}
      <div
        className="admin-card"
        style={{
          marginBottom: 24,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          background: "var(--color-surface, #fff)",
          border: "1px solid var(--color-border, rgba(0,0,0,0.08))",
          borderRadius: 14,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#10b981",
              marginBottom: 4,
            }}
          >
            <MapPin size={13} /> Registered Office & Google Map
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink, #0f172a)" }}>
            B-5, Ashoka Chambers, G/F, Pusa Rd, Block A, Rajendra Park, Rajendra Place, New Delhi, Delhi, 110060
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--ink-sub, #64748b)", marginTop: 2 }}>
            Connected to Google Maps on the public /contact page.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="https://maps.google.com/?q=B-5,+Ashoka+Chambers,+G/F,+Pusa+Rd,+Block+A,+Rajendra+Park,+Rajendra+Place,+New+Delhi,+Delhi+110060"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ExternalLink size={14} /> View Map
          </a>
          <Link
            href="/admin/header-footer"
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Settings size={14} /> Edit in Settings
          </Link>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading messages…</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            No messages yet. (In seed mode submissions are not persisted.)
          </div>
        ) : (
          <div className="admin-table-scroll" data-lenis-prevent>
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
          </div>
        )}
      </div>

      {open && (
        <div className="admin-modal" onClick={() => setOpen(null)}>
          <div
            className="admin-modal-body"
            data-lenis-prevent
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

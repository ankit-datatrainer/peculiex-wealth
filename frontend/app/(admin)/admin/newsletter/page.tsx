"use client";

import { useEffect, useState } from "react";
import {
  fetchNewsletter,
  deleteSubscriber,
  type AdminSubscriber
} from "@/lib/admin-api";

export default function AdminNewsletterPage() {
  const [items, setItems] = useState<AdminSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchNewsletter());
    } catch (e: any) {
      setError(e?.message || "Could not load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onDelete = async (s: AdminSubscriber) => {
    if (!confirm(`Remove ${s.email} from the newsletter?`)) return;
    try {
      await deleteSubscriber(s.email);
      setItems((prev) => prev.filter((x) => x.email !== s.email));
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  };

  const exportCSV = () => {
    if (!items.length) return;
    const rows = ["email,joined,unsubscribed"];
    for (const s of items) {
      rows.push(
        [s.email, s.created_at, s.unsubscribed ? "yes" : "no"]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finvoq-newsletter-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Newsletter</h1>
          <p className="admin-page-sub">
            {items.length} subscribers. Export to CSV for bulk operations.
          </p>
        </div>
        {items.length > 0 && (
          <button type="button" className="btn btn-outline" onClick={exportCSV}>
            Export CSV
          </button>
        )}
      </header>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading subscribers…</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            No subscribers yet. (In seed mode the backend doesn&apos;t persist
            sign-ups — connect Supabase to enable.)
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.email}>
                  <td>{s.email}</td>
                  <td>{formatDate(s.created_at)}</td>
                  <td>
                    {s.unsubscribed ? (
                      <span className="admin-tag admin-tag-lim">
                        Unsubscribed
                      </span>
                    ) : (
                      <span className="admin-tag admin-tag-up">Active</span>
                    )}
                  </td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-danger"
                      onClick={() => onDelete(s)}
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
    </div>
  );
}

function formatDate(s: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

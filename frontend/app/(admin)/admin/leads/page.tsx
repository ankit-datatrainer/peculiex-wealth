"use client";

import { useEffect, useState } from "react";
import {
  fetchLeads,
  updateLeadStatus,
  deleteLead,
  type AdminLead
} from "@/lib/admin-api";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

export default function AdminLeadsPage() {
  const [items, setItems] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedMode, setSeedMode] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchLeads();
      setItems(list);
      // In seed mode, the backend returns [] for submission tables — surface
      // that visibly so the admin understands no DB is wired up.
      setSeedMode(list.length === 0);
    } catch (e: any) {
      setError(e?.message || "Could not load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const setStatus = async (id: AdminLead["id"], status: string) => {
    try {
      const updated = await updateLeadStatus(id, status);
      setItems((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (e: any) {
      alert(e?.message || "Status update failed.");
    }
  };

  const onDelete = async (l: AdminLead) => {
    if (!confirm(`Delete lead from ${l.name}?`)) return;
    try {
      await deleteLead(l.id);
      setItems((prev) => prev.filter((x) => x.id !== l.id));
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Leads</h1>
          <p className="admin-page-sub">
            Onboarding submissions from /api/leads. Update status as you work
            them.
          </p>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading leads…</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            {seedMode
              ? "No leads stored. (Submission tables only persist when Supabase is configured. In seed mode, the backend logs but doesn't store leads.)"
              : "No leads yet."}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Interest</th>
                <th>Budget</th>
                <th>Message</th>
                <th>Status</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.name}</strong>
                  </td>
                  <td>
                    <div>{l.email}</div>
                    <div className="admin-table-meta">{l.phone}</div>
                  </td>
                  <td>{l.interest}</td>
                  <td>{l.budget}</td>
                  <td className="admin-msg-cell">
                    {l.message || <em>—</em>}
                  </td>
                  <td>
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l.id, e.target.value)}
                      className={`admin-status admin-status-${l.status}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(l.created_at)}</td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-danger"
                      onClick={() => onDelete(l)}
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
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

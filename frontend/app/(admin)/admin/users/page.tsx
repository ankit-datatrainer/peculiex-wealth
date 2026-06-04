"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  updateUser,
  deleteUser,
  type AdminUser
} from "@/lib/admin-api";
import { useAuth } from "@/lib/auth-context";

type EditState = {
  id: string;
  name: string;
  mobile: string;
  role: AdminUser["role"];
  password: string;
};

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  user: "User",
  admin: "Admin",
  superadmin: "Super-admin"
};

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<EditState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const reload = async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUsers(q);
      setUsers(list);
    } catch (e: any) {
      setError(e?.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Debounced search → server-side filter so it stays fast at 1000s of rows.
  useEffect(() => {
    const t = setTimeout(() => reload(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const adminCount = useMemo(
    () =>
      users.filter((u) => u.role === "admin" || u.role === "superadmin")
        .length,
    [users]
  );

  const startEdit = (u: AdminUser) => {
    setEdit({
      id: u.id,
      name: u.name,
      mobile: u.mobile || "",
      role: u.role,
      password: ""
    });
    setEditError(null);
  };

  const closeEdit = () => {
    setEdit(null);
    setEditError(null);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setEditError(null);

    if (!edit.name.trim() || edit.name.trim().length < 2)
      return setEditError("Name must be at least 2 characters.");
    if (edit.password && edit.password.length < 6)
      return setEditError("Password must be at least 6 characters.");

    const patch: Record<string, unknown> = {
      name: edit.name.trim(),
      mobile: edit.mobile.trim() || null,
      role: edit.role
    };
    if (edit.password) patch.password = edit.password;

    setSubmitting(true);
    try {
      await updateUser(edit.id, patch);
      closeEdit();
      await reload(search);
    } catch (e: any) {
      setEditError(e?.message || "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (u: AdminUser) => {
    if (me?.id === u.id) {
      alert("You can't delete your own account.");
      return;
    }
    if (!confirm(`Delete ${u.email}? This removes all of their data.`)) return;
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Users</h1>
          <p className="admin-page-sub">
            {users.length} accounts · {adminCount} with admin access
          </p>
        </div>
      </header>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by email, name or mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input"
        />
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    {me?.id === u.id && (
                      <span className="admin-self-badge">You</span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.mobile || "—"}</td>
                  <td>
                    <span className={`admin-role admin-role-${u.role}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => startEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-danger"
                      onClick={() => onDelete(u)}
                      disabled={me?.id === u.id}
                      title={
                        me?.id === u.id
                          ? "You can't delete yourself"
                          : "Delete user"
                      }
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

      {edit && (
        <div className="admin-modal" onClick={closeEdit}>
          <form
            className="admin-modal-body"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSave}
          >
            <header>
              <h2>Edit user</h2>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={closeEdit}
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            {editError && <div className="admin-error">{editError}</div>}

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>Name *</span>
                <input
                  type="text"
                  value={edit.name}
                  onChange={(e) =>
                    setEdit({ ...edit, name: e.target.value })
                  }
                  required
                />
              </label>
              <label className="admin-field admin-field-wide">
                <span>Mobile</span>
                <input
                  type="text"
                  value={edit.mobile}
                  onChange={(e) =>
                    setEdit({ ...edit, mobile: e.target.value })
                  }
                  placeholder="+91…"
                />
              </label>
              <label className="admin-field">
                <span>Role</span>
                <select
                  value={edit.role}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      role: e.target.value as AdminUser["role"]
                    })
                  }
                  disabled={me?.id === edit.id}
                  title={
                    me?.id === edit.id
                      ? "You can't change your own role"
                      : undefined
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super-admin</option>
                </select>
              </label>
              <label className="admin-field admin-field-wide">
                <span>New password (leave blank to keep)</span>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={edit.password}
                    onChange={(e) =>
                      setEdit({ ...edit, password: e.target.value })
                    }
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted, #333333)",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px"
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </label>
            </div>

            <footer className="admin-modal-foot">
              <button
                type="button"
                className="btn btn-outline"
                onClick={closeEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save changes"}
              </button>
            </footer>
          </form>
        </div>
      )}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompanyLogo } from "@/lib/util";
import { apiFetch } from "@/lib/api";
import {
  fetchUnlisted,
  createUnlisted,
  updateUnlisted,
  deleteUnlisted,
  uploadUnlistedLogo,
  type AdminUnlisted
} from "@/lib/admin-api";

type FormState = {
  id: string | null;
  name: string;
  domain: string;
  sector: string;
  brand: string;
  initial: string;
  price: string;
  iv: string;
  tag: "trend" | "avail" | "lim";
  logo_url: string;
  min_units: number;
  market_cap: string;
  pe: string;
};

const blank = (): FormState => ({
  id: null,
  name: "",
  domain: "",
  sector: "",
  brand: "#13735d",
  initial: "",
  price: "",
  iv: "10",
  tag: "avail",
  logo_url: "",
  min_units: 0,
  market_cap: "",
  pe: "N/A"
});

const TAG_LABEL = { trend: "Trending", avail: "Available", lim: "Limited" };

export default function AdminUnlistedPage() {
  const [items, setItems] = useState<AdminUnlisted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "trend" | "avail" | "lim">("all");

  const [form, setForm] = useState<FormState>(blank());
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUnlisted();
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Could not load unlisted shares.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((u) => {
      if (filter !== "all" && u.tag !== filter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.domain.toLowerCase().includes(q) ||
        u.sector.toLowerCase().includes(q)
      );
    });
  }, [items, search, filter]);

  const startCreate = () => {
    setForm(blank());
    setLogoFile(null);
    setLogoPreview(null);
    setShowForm(true);
    setFormError(null);
  };

  const startEdit = (u: AdminUnlisted) => {
    setForm({
      id: u.id,
      name: u.name,
      domain: u.domain,
      sector: u.sector,
      brand: u.brand,
      initial: u.initial,
      price: String(u.price),
      iv: u.iv,
      tag: u.tag,
      logo_url: u.logo_url || "",
      min_units: u.min_units || 0,
      market_cap: u.market_cap || "",
      pe: u.pe || "N/A"
    });
    setLogoFile(null);
    setLogoPreview(null);
    setShowForm(true);
    setFormError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (!file) {
      setLogoPreview(null);
      return;
    }
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      setFormError("Please choose a PNG, JPG, GIF or WEBP image.");
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image is too large (max 5 MB).");
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setFormError(null);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic client-side validation; server still re-validates.
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.domain.trim()) return setFormError("Domain is required.");
    if (!form.sector.trim()) return setFormError("Sector is required.");
    if (!form.initial.trim()) return setFormError("Initial is required.");
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return setFormError("Price must be a non-negative number.");

    const payload = {
      name: form.name.trim(),
      domain: form.domain.trim(),
      sector: form.sector.trim(),
      brand: form.brand.trim(),
      initial: form.initial.trim().slice(0, 2),
      price: priceNum,
      iv: form.iv.trim(),
      tag: form.tag,
      logo_url: form.logo_url.trim() || null,
      min_units: Number(form.min_units) || 0,
      market_cap: form.market_cap.trim(),
      pe: form.pe.trim()
    };

    setSubmitting(true);
    try {
      let id = form.id;
      if (id) {
        await updateUnlisted(id, payload);
      } else {
        const created = await createUnlisted(payload);
        id = created.id;
      }
      // If a logo file was picked, upload it now — this persists logo_url
      // on the item server-side and overrides whatever URL was typed above.
      if (logoFile && id) {
        setUploadingLogo(true);
        try {
          await uploadUnlistedLogo(id, logoFile);
        } finally {
          setUploadingLogo(false);
        }
      }
      closeForm();
      await reload();
    } catch (e: any) {
      setFormError(e?.message || "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (u: AdminUnlisted) => {
    if (!confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    try {
      await deleteUnlisted(u.id);
      setItems((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  };

  return (
    <div className="admin-page">
      <style>{SYNC_CSS}</style>
      <header className="admin-page-head">
        <div>
          <h1>Unlisted Shares</h1>
          <p className="admin-page-sub">
            Add, edit, price and brand the unlisted inventory shown on the public
            site. Upload a logo URL to override the default Clearbit fallback.
          </p>
        </div>
        <div className="ul-sync-head-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowSync((v) => !v)}
            aria-expanded={showSync}
            aria-controls="ul-sync-panel"
          >
            {showSync ? "Close market sync" : "Sync with market source"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={startCreate}
          >
            + Add unlisted share
          </button>
        </div>
      </header>

      {showSync && (
        <UnlistedSyncPanel
          onClose={() => setShowSync(false)}
          onApplied={async (message) => {
            setToast(message);
            await reload();
          }}
        />
      )}

      {toast && (
        <div className="ul-sync-toast" role="status" aria-live="polite">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name, sector or domain…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input"
        />
        <div className="admin-chip-row">
          {(["all", "trend", "avail", "lim"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`admin-chip${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : TAG_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            No unlisted shares match your filter.
          </div>
        ) : (
          <div className="admin-table-scroll" data-lenis-prevent>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Sector</th>
                <th>Domain</th>
                <th>Tag</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th style={{ textAlign: "right" }}>Min Units</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <UnlistedLogo item={u} />
                  </td>
                  <td>
                    <strong>{u.name}</strong>
                    <div className="admin-table-meta">
                      <span
                        className="admin-color-dot"
                        style={{ background: u.brand }}
                      />
                      <span>{u.brand}</span>
                    </div>
                  </td>
                  <td>{u.sector}</td>
                  <td>
                    <a
                      href={`https://${u.domain}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {u.domain}
                    </a>
                  </td>
                  <td>
                    <span className={`admin-tag admin-tag-${u.tag}`}>
                      {TAG_LABEL[u.tag]}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    ₹{u.price.toLocaleString("en-IN")}
                  </td>
                  <td style={{ textAlign: "right" }}>{u.min_units || "—"}</td>
                  <td className="admin-row-actions">
                    <button
                      className="admin-icon-btn"
                      onClick={() => startEdit(u)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="admin-icon-btn admin-icon-danger"
                      onClick={() => onDelete(u)}
                      type="button"
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

      {showForm && (
        <div className="admin-modal" onClick={closeForm}>
          <form
            className="admin-modal-body"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
          >
            <header>
              <h2>{form.id ? "Edit unlisted share" : "Add unlisted share"}</h2>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={closeForm}
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            {formError && <div className="admin-error">{formError}</div>}

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>Name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Reliance Retail"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Sector *</span>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) =>
                    setForm({ ...form, sector: e.target.value })
                  }
                  placeholder="e.g. Retail"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Domain *</span>
                <input
                  type="text"
                  value={form.domain}
                  onChange={(e) =>
                    setForm({ ...form, domain: e.target.value })
                  }
                  placeholder="e.g. relianceretail.com"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Price (₹) *</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  required
                />
              </label>

              <label className="admin-field">
                <span>Min Units</span>
                <input
                  type="number"
                  min="0"
                  value={form.min_units}
                  onChange={(e) => setForm({ ...form, min_units: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                />
              </label>

              <label className="admin-field">
                <span>Market Cap</span>
                <input
                  type="text"
                  value={form.market_cap}
                  onChange={(e) => setForm({ ...form, market_cap: e.target.value })}
                  placeholder="1000 Cr"
                />
              </label>

              <label className="admin-field">
                <span>P/E Ratio</span>
                <input
                  type="text"
                  value={form.pe}
                  onChange={(e) => setForm({ ...form, pe: e.target.value })}
                  placeholder="25.5"
                />
              </label>

              <label className="admin-field">
                <span>Tag</span>
                <select
                  value={form.tag}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tag: e.target.value as FormState["tag"]
                    })
                  }
                >
                  <option value="trend">Trending</option>
                  <option value="avail">Available</option>
                  <option value="lim">Limited</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Initial (1–2 chars)</span>
                <input
                  type="text"
                  maxLength={2}
                  value={form.initial}
                  onChange={(e) =>
                    setForm({ ...form, initial: e.target.value })
                  }
                  placeholder="R"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Brand colour (hex)</span>
                <div className="admin-color-input">
                  <input
                    type="color"
                    value={
                      /^#[0-9a-fA-F]{6}$/.test(form.brand)
                        ? form.brand
                        : "#13735d"
                    }
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    placeholder="#13735d"
                  />
                </div>
              </label>

              <label className="admin-field admin-field-wide">
                <span>Upload logo (PNG, JPG, GIF or WEBP, max 5 MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={onLogoFileChange}
                />
                <small className="admin-field-hint">
                  {form.id
                    ? "Uploading a new file replaces the current logo when you save."
                    : "The logo uploads once the share is created (saving happens in one click)."}
                </small>
              </label>

              <label className="admin-field admin-field-wide">
                <span>Or paste a logo URL instead (optional)</span>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) =>
                    setForm({ ...form, logo_url: e.target.value })
                  }
                  placeholder="https://example.com/logo.png, leave empty to use Clearbit fallback"
                  disabled={!!logoFile}
                />
                <small className="admin-field-hint">
                  Ignored if you upload a file above. When neither is set, the
                  public site auto-fetches a logo from the company&apos;s domain.
                </small>
              </label>

              {(logoPreview || form.logo_url) && (
                <div className="admin-field admin-field-wide">
                  <span>Logo preview</span>
                  <div className="admin-logo-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview || form.logo_url}
                      alt="Logo preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.2";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <footer className="admin-modal-foot">
              <button
                type="button"
                className="btn btn-outline"
                onClick={closeForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? uploadingLogo
                    ? "Uploading logo…"
                    : "Saving…"
                  : form.id
                  ? "Save changes"
                  : "Add share"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------
// Market source sync
// Monitor the automatic mirror and request an immediate complete refresh.
// --------------------------------------------------------------

type MirrorStatus = { daily_quote_date: string | null; history_companies: number; document_count: number; enabled: boolean; running: boolean; interval_minutes: number; last_success_at: string | null; company_count: number; last_error: string | null };

function UnlistedSyncPanel({ onClose, onApplied }: {
  onClose: () => void;
  onApplied: (message: string) => void | Promise<void>;
}) {
  const [status, setStatus] = useState<MirrorStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [starting, setStarting] = useState(false);
  useEffect(() => {
    let active = true;
    let lastSuccess: string | null = null;
    const refresh = () => apiFetch<MirrorStatus>("/api/admin/unlisted/sync/status")
      .then(async value => {
        if (!active) return;
        setStatus(value);
        if (lastSuccess && value.last_success_at !== lastSuccess) await onApplied("Market catalog refreshed.");
        lastSuccess = value.last_success_at;
      })
      .catch(e => { if (active) setError(e.message); });
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const sync = async () => {
    setStarting(true); setError(null);
    try {
      await apiFetch("/api/admin/unlisted/sync/run", { method: "POST" });
      const text = "Sync started. The catalog updates after all company details and logos are checked.";
      setMessage(text);
      setStatus(await apiFetch<MirrorStatus>("/api/admin/unlisted/sync/status"));
      await onApplied(text);
    } catch (e: any) { setError(e.message || "Could not start sync."); }
    finally { setStarting(false); }
  };
  return <section className="admin-card ul-sync" id="ul-sync-panel" aria-label="Sync with market source">
    <header className="ul-sync-top">
      <div><h2>Automatic market sync</h2><p className="ul-sync-muted">The full catalog follows UnlistedKraft, including company details, logos, additions and removals.</p></div>
      <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close market sync">✕</button>
    </header>
    {error && <div className="admin-error">{error}</div>}
    {message && <p role="status">{message}</p>}
    {status && <>
      <p>{status.enabled ? `Automatic sync every ${status.interval_minutes} minutes` : "Automatic sync disabled"}. {status.running ? "A sync is running." : "Ready."}</p>
      <p>{status.company_count} source companies. Last successful check: {status.last_success_at ? new Date(status.last_success_at).toLocaleString("en-IN") : "Pending"}.</p>
      <p>Daily quote date (India): {status.daily_quote_date || "Pending"}. {status.history_companies} companies with recorded prices; {status.document_count} investor documents.</p>
      {status.last_error && <p className="admin-error">Last sync failed: {status.last_error}. The previous catalog is retained.</p>}
    </>}
    <button type="button" className="btn btn-primary" onClick={sync} disabled={starting || status?.running}>Sync entire catalog now</button>
  </section>;
}

const SYNC_CSS = `
.ul-sync-head-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.ul-sync {
  --ul-up: #15803d; --ul-down: #b91c1c; --ul-warn: #b45309;
  --ul-tint: rgba(19, 115, 93, 0.06);
  display: flex; flex-direction: column; gap: 16px;
  padding: 20px 22px; margin-bottom: 18px; min-width: 0;
}
.dark .ul-sync, [data-theme="dark"] .ul-sync {
  --ul-up: #4ade80; --ul-down: #f87171; --ul-warn: #fbbf24;
  --ul-tint: rgba(43, 169, 138, 0.1);
}
.ul-sync h2 { margin: 0 0 4px; font-size: 1.15rem; font-weight: 600; }
.ul-sync h3 { margin: 0; font-size: 0.98rem; font-weight: 600; }
.ul-sync a { color: var(--color-primary); }
.ul-sync-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
.ul-sync-top-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.ul-sync-muted { color: var(--color-text-muted); opacity: 0.85; }
.ul-sync-top p { margin: 0; font-size: 0.86rem; max-width: 68ch; }
.ul-sync-meta { margin: 0; font-size: 0.82rem; }
.ul-sync-small { font-size: 0.78rem; margin: 4px 0 0; }
.ul-sync-stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.ul-sync-stat {
  border: 1px solid var(--color-border); border-radius: 12px; padding: 10px 12px;
  background: var(--ul-tint); display: flex; flex-direction: column; gap: 2px; min-width: 0;
}
.ul-sync-stat b { font-size: 1.25rem; font-weight: 700; color: var(--color-text); }
.ul-sync-stat span { font-size: 0.74rem; color: var(--color-text-muted); }
.ul-sync-note {
  border: 1px solid var(--color-border); border-left: 3px solid var(--ul-warn);
  border-radius: 10px; padding: 10px 14px; font-size: 0.84rem; color: var(--color-text);
}
.ul-sync-section { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ul-sync-section-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.ul-sync-toggles { display: flex; gap: 8px 14px; flex-wrap: wrap; align-items: center; }
.ul-sync-check { display: inline-flex; gap: 8px; align-items: center; font-size: 0.84rem; cursor: pointer; color: var(--color-text); }
.ul-sync-check input { width: 16px; height: 16px; accent-color: var(--color-primary); }
.ul-sync-table { border: 1px solid var(--color-border); border-radius: 12px; }
.ul-sync-table .admin-table-scroll { overflow-x: auto; }
.ul-sync-table .admin-table { min-width: 640px; }
.ul-sync-table .admin-table tbody td { padding: 10px 14px; }
.ul-sync-others { font-size: 0.8rem; line-height: 1.5; }
.ul-sync-old { color: var(--color-text-muted); text-decoration: line-through; opacity: 0.8; }
.ul-sync-up { color: var(--ul-up); font-weight: 600; }
.ul-sync-down { color: var(--ul-down); font-weight: 600; }
.ul-sync-warn { color: var(--ul-warn); font-weight: 600; }
.ul-sync-off { opacity: 0.5; }
.ul-sync-add-name { cursor: pointer; }
.ul-sync-more { align-self: flex-start; }
.ul-sync-list { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 6px 16px; font-size: 0.84rem; }
.ul-sync-list li { min-width: 0; overflow-wrap: anywhere; }
.ul-sync-issues { margin: 8px 0 0; padding-left: 18px; font-size: 0.82rem; }
.ul-sync-foot {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
  border-top: 1px solid var(--color-border); padding-top: 14px; font-size: 0.84rem;
}
.ul-sync-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.ul-sync-toast {
  position: fixed; right: 20px; bottom: 20px; z-index: 120; max-width: min(420px, calc(100vw - 32px));
  display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 12px;
  background: #065f46; color: #ecfdf5; font-size: 0.88rem; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
}
.ul-sync-toast button { background: none; border: 0; color: inherit; cursor: pointer; font-size: 0.9rem; padding: 0 2px; }
@media (max-width: 900px) {
  .ul-sync-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .ul-sync { padding: 16px 14px; }
  .ul-sync-top { flex-direction: column; }
  .ul-sync-top-actions { width: 100%; justify-content: space-between; }
  .ul-sync-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ul-sync-head-actions { width: 100%; }
  .ul-sync-head-actions .btn { flex: 1 1 auto; }
  .ul-sync-foot .btn { width: 100%; }
  .ul-sync-toast { left: 16px; right: 16px; bottom: 16px; max-width: none; }
}
`;

function UnlistedLogo({ item }: { item: AdminUnlisted }) {
  const [src, setSrc] = useState(
    item.logo_url || getCompanyLogo(item.domain)
  );
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setSrc(item.logo_url || getCompanyLogo(item.domain));
    setErrored(false);
  }, [item.id, item.logo_url, item.domain]);

  if (errored) {
    return (
      <div className="admin-logo-cell" style={{ background: item.brand }}>
        {item.initial}
      </div>
    );
  }
  return (
    <div className="admin-logo-cell">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={item.name} onError={() => {
        if (!src.includes('google.com')) {
          setSrc(getCompanyLogo(item.domain));
        } else {
          setErrored(true);
        }
      }} />
    </div>
  );
}


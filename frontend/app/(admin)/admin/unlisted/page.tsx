"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompanyLogo } from "@/lib/util";
import {
  fetchUnlisted,
  createUnlisted,
  updateUnlisted,
  deleteUnlisted,
  uploadUnlistedLogo,
  previewUnlistedSync,
  applyUnlistedSync,
  type AdminUnlisted,
  type UnlistedSyncPreview
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
// Preview what the live source listing would change, pick what to apply.
// Existing shares only ever get price / min units / market cap / P/E (and
// sector when opted in); nothing is deleted.
// --------------------------------------------------------------

const UPDATES_PAGE = 20;

const inr = (n: number) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function pctChange(from: number, to: number) {
  if (!from) return null;
  return ((to - from) / from) * 100;
}

function UnlistedSyncPanel({
  onClose,
  onApplied
}: {
  onClose: () => void;
  onApplied: (message: string) => void | Promise<void>;
}) {
  const [preview, setPreview] = useState<UnlistedSyncPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [resultIssues, setResultIssues] = useState<string[]>([]);

  const [applyUpdates, setApplyUpdates] = useState(true);
  const [applySectors, setApplySectors] = useState(false);
  const [selectedAdds, setSelectedAdds] = useState<Set<string>>(new Set());
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    setResultMsg(null);
    setResultIssues([]);
    try {
      const p = await previewUnlistedSync();
      setPreview(p);
      setShowAllUpdates(false);
      // Pre-tick new shares, except ones that look like a share we already
      // list under another name — those need a human look first.
      setSelectedAdds(
        new Set(p.diff.additions.filter((a) => a.similarTo.length === 0).map((a) => a.name))
      );
    } catch (e: any) {
      setError(e?.message || "Could not fetch the market source.");
    } finally {
      setLoading(false);
    }
  };

  const diff = preview?.diff;

  // Updates that would actually write something with the current toggles.
  const effectiveUpdates = useMemo(() => {
    if (!diff || !applyUpdates) return 0;
    return diff.updates.filter((u) =>
      Object.keys(u.changes).some((k) => k !== "sector" || applySectors)
    ).length;
  }, [diff, applyUpdates, applySectors]);

  const nothingSelected = effectiveUpdates === 0 && selectedAdds.size === 0;

  const toggleAdd = (name: string) =>
    setSelectedAdds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const onApply = async () => {
    if (!diff || nothingSelected) return;
    const parts = [];
    if (effectiveUpdates) parts.push(`update ${effectiveUpdates} existing share${effectiveUpdates === 1 ? "" : "s"}`);
    if (selectedAdds.size) parts.push(`add ${selectedAdds.size} new share${selectedAdds.size === 1 ? "" : "s"}`);
    if (!confirm(`This will ${parts.join(" and ")}. Continue?`)) return;

    setApplying(true);
    setError(null);
    try {
      const r = await applyUnlistedSync({
        applyUpdates: applyUpdates && effectiveUpdates > 0,
        applySectors,
        addIds: Array.from(selectedAdds)
      });
      const { counts, result } = r;
      const msg =
        `Market sync done: ${counts.updated} updated, ${counts.added} added` +
        (counts.skipped ? `, ${counts.skipped} skipped` : "") +
        (counts.errors ? `, ${counts.errors} failed` : "") +
        ".";
      setResultMsg(msg);
      setResultIssues([
        ...result.errors.map((e) => `${e.name}: ${e.error}`),
        ...result.skipped.map((s) => `${s.name}: ${s.reason}`),
        ...result.added
          .filter((a) => !a.logo_url)
          .map((a) => `${a.name}: no logo could be fetched, the initial badge will show`),
        ...r.notes
      ]);
      setPreview(null);
      setSelectedAdds(new Set());
      await onApplied(msg);
    } catch (e: any) {
      setError(e?.message || "Sync failed.");
    } finally {
      setApplying(false);
    }
  };

  const visibleUpdates = diff
    ? showAllUpdates
      ? diff.updates
      : diff.updates.slice(0, UPDATES_PAGE)
    : [];

  return (
    <section className="admin-card ul-sync" id="ul-sync-panel" aria-label="Sync with market source">
      <header className="ul-sync-top">
        <div>
          <h2>Sync with market source</h2>
          <p className="ul-sync-muted">
            Compares every share with the live listing on{" "}
            <a href="https://www.unlistedkraft.in/stocks/live" target="_blank" rel="noreferrer">
              unlistedkraft.in
            </a>
            . Review the changes, then apply only what you want. Names, logos,
            brand colours and tags are never changed and nothing is deleted.
          </p>
        </div>
        <div className="ul-sync-top-actions">
          <button type="button" className="btn btn-primary" onClick={fetchPreview} disabled={loading || applying}>
            {loading ? "Fetching…" : preview ? "Refresh preview" : "Fetch preview"}
          </button>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close market sync">
            ✕
          </button>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      {resultMsg && (
        <div className="admin-success">
          <strong>{resultMsg}</strong>
          {resultIssues.length > 0 && (
            <ul className="ul-sync-issues">
              {resultIssues.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading && !preview && <div className="admin-loading">Reading the market source…</div>}

      {diff && preview && (
        <>
          <p className="ul-sync-muted ul-sync-meta">
            {diff.counts.source} shares on the source, {diff.counts.existing} in our inventory · fetched{" "}
            {new Date(preview.source.fetchedAt).toLocaleString("en-IN")}
          </p>

          <div className="ul-sync-stats">
            <div className="ul-sync-stat">
              <b>{diff.counts.priceChanges}</b>
              <span>Price changes</span>
            </div>
            <div className="ul-sync-stat">
              <b>{diff.counts.updates - diff.counts.priceChanges}</b>
              <span>Other field changes only</span>
            </div>
            <div className="ul-sync-stat">
              <b>{diff.counts.additions}</b>
              <span>New on source</span>
            </div>
            <div className="ul-sync-stat">
              <b>{diff.counts.invalid}</b>
              <span>Invalid source price</span>
            </div>
            <div className="ul-sync-stat">
              <b>{diff.counts.missingFromSource}</b>
              <span>Not on source</span>
            </div>
          </div>

          {preview.notes.map((n, i) => (
            <div key={i} className="ul-sync-note">{n}</div>
          ))}

          {/* ---- updates ---- */}
          <div className="ul-sync-section">
            <div className="ul-sync-section-head">
              <h3>Changes to existing shares ({diff.updates.length})</h3>
              <div className="ul-sync-toggles">
                <label className="ul-sync-check">
                  <input
                    type="checkbox"
                    checked={applyUpdates}
                    onChange={(e) => setApplyUpdates(e.target.checked)}
                  />
                  <span>Apply price, min units, market cap &amp; P/E</span>
                </label>
                <label className="ul-sync-check">
                  <input
                    type="checkbox"
                    checked={applySectors}
                    disabled={!applyUpdates}
                    onChange={(e) => setApplySectors(e.target.checked)}
                  />
                  <span>Also update sector labels ({diff.counts.sectorChanges})</span>
                </label>
              </div>
            </div>
            {diff.updates.length === 0 ? (
              <div className="admin-empty">Every matched share is already up to date.</div>
            ) : (
              <div className="admin-table-wrap ul-sync-table">
                <div className="admin-table-scroll" data-lenis-prevent>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Share</th>
                        <th style={{ textAlign: "right" }}>Price</th>
                        <th style={{ textAlign: "right" }}>Change</th>
                        <th>Other changes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUpdates.map((u) => {
                        const p = u.changes.price;
                        const pct = p ? pctChange(p.from, p.to) : null;
                        const others: { label: string; from: string; to: string; off?: boolean }[] = [];
                        if (u.changes.min_units)
                          others.push({ label: "Min units", from: String(u.changes.min_units.from || "—"), to: String(u.changes.min_units.to) });
                        if (u.changes.market_cap)
                          others.push({ label: "Mkt cap", from: u.changes.market_cap.from || "—", to: u.changes.market_cap.to });
                        if (u.changes.pe)
                          others.push({ label: "P/E", from: u.changes.pe.from || "—", to: u.changes.pe.to });
                        if (u.changes.sector)
                          others.push({ label: "Sector", from: u.changes.sector.from || "—", to: u.changes.sector.to, off: !applySectors });
                        return (
                          <tr key={u.id} className={applyUpdates ? undefined : "ul-sync-off"}>
                            <td>
                              <strong>{u.name}</strong>
                              {u.sourceName !== u.name && (
                                <div className="ul-sync-muted ul-sync-small">Source: {u.sourceName}</div>
                              )}
                            </td>
                            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              {p ? (
                                <>
                                  <span className="ul-sync-old">{inr(p.from)}</span>
                                  <span aria-hidden="true"> → </span>
                                  <strong>{inr(p.to)}</strong>
                                </>
                              ) : (
                                <span className="ul-sync-muted">No change</span>
                              )}
                            </td>
                            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              {pct == null ? (
                                <span className="ul-sync-muted">—</span>
                              ) : (
                                <span className={pct >= 0 ? "ul-sync-up" : "ul-sync-down"}>
                                  {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                                </span>
                              )}
                            </td>
                            <td className="ul-sync-others">
                              {others.length === 0 ? (
                                <span className="ul-sync-muted">—</span>
                              ) : (
                                others.map((o) => (
                                  <div key={o.label} className={o.off ? "ul-sync-off" : undefined}>
                                    <span className="ul-sync-muted">{o.label}:</span> {o.from} → {o.to}
                                    {o.off && <em className="ul-sync-muted"> (not applied)</em>}
                                  </div>
                                ))
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {diff.updates.length > UPDATES_PAGE && (
              <button
                type="button"
                className="admin-chip ul-sync-more"
                onClick={() => setShowAllUpdates((v) => !v)}
              >
                {showAllUpdates ? "Show fewer" : `Show all ${diff.updates.length} changes`}
              </button>
            )}
          </div>

          {/* ---- additions ---- */}
          <div className="ul-sync-section">
            <div className="ul-sync-section-head">
              <h3>New shares on the source ({diff.additions.length})</h3>
              {diff.additions.length > 0 && (
                <div className="ul-sync-toggles">
                  <button
                    type="button"
                    className="admin-chip"
                    onClick={() => setSelectedAdds(new Set(diff.additions.map((a) => a.name)))}
                  >
                    Select all
                  </button>
                  <button type="button" className="admin-chip" onClick={() => setSelectedAdds(new Set())}>
                    Select none
                  </button>
                </div>
              )}
            </div>
            {diff.additions.length === 0 ? (
              <div className="admin-empty">No new companies on the source.</div>
            ) : (
              <div className="admin-table-wrap ul-sync-table">
                <div className="admin-table-scroll" data-lenis-prevent>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 44 }}>
                          <span className="ul-sync-sr">Add</span>
                        </th>
                        <th>Company</th>
                        <th>Sector</th>
                        <th style={{ textAlign: "right" }}>Price</th>
                        <th style={{ textAlign: "right" }}>Min units</th>
                        <th>Market cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diff.additions.map((a) => {
                        const checked = selectedAdds.has(a.name);
                        const id = `ul-sync-add-${a.name.replace(/[^a-z0-9]+/gi, "-")}`;
                        return (
                          <tr key={a.name} className={checked ? "row-selected" : undefined}>
                            <td>
                              <input
                                id={id}
                                type="checkbox"
                                className="admin-table-checkbox"
                                checked={checked}
                                onChange={() => toggleAdd(a.name)}
                              />
                            </td>
                            <td>
                              <label htmlFor={id} className="ul-sync-add-name">
                                <strong>{a.name}</strong>
                              </label>
                              {a.similarTo.length > 0 && (
                                <div className="ul-sync-warn ul-sync-small">
                                  Possible duplicate of {a.similarTo.join(", ")}
                                </div>
                              )}
                            </td>
                            <td>{a.sector || "—"}</td>
                            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{inr(a.price)}</td>
                            <td style={{ textAlign: "right" }}>{a.min_units || "—"}</td>
                            <td style={{ whiteSpace: "nowrap" }}>{a.market_cap || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {diff.additions.length > 0 && (
              <p className="ul-sync-muted ul-sync-small">
                New shares are added as &ldquo;Available&rdquo; with face value ₹10, a generated brand
                colour and the source logo saved to our own storage. Edit any of them afterwards like
                any other share.
              </p>
            )}
          </div>

          {/* ---- info-only lists ---- */}
          {diff.invalid.length > 0 && (
            <div className="ul-sync-section">
              <h3>Invalid prices on the source ({diff.invalid.length})</h3>
              <p className="ul-sync-muted ul-sync-small">
                The source shows a placeholder price for these (often a sold-out share). They are left
                exactly as they are.
              </p>
              <ul className="ul-sync-list">
                {diff.invalid.map((i) => (
                  <li key={`${i.name}-${i.matchedId || ""}`}>
                    <strong>{i.matchedName || i.name}</strong>
                    <span className="ul-sync-muted">
                      {" "}
                      source shows {i.rawPrice || "nothing"}
                      {i.currentPrice != null ? ` · ours stays ${inr(i.currentPrice)}` : " · not in our list"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.missingFromSource.length > 0 && (
            <div className="ul-sync-section">
              <h3>Not on the source ({diff.missingFromSource.length})</h3>
              <p className="ul-sync-muted ul-sync-small">
                For information only. These stay on the site until you edit or delete them yourself.
              </p>
              <ul className="ul-sync-list">
                {diff.missingFromSource.map((m) => (
                  <li key={m.id}>
                    <strong>{m.name}</strong>
                    <span className="ul-sync-muted"> {inr(m.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.ambiguous.length > 0 && (
            <div className="ul-sync-section">
              <h3>Unclear matches ({diff.ambiguous.length})</h3>
              <p className="ul-sync-muted ul-sync-small">
                More than one source company fits these names, so they were skipped. Update them by hand.
              </p>
              <ul className="ul-sync-list">
                {diff.ambiguous.map((a) => (
                  <li key={a.id}>
                    <strong>{a.name}</strong>
                    <span className="ul-sync-muted"> → {a.candidates.join(" / ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <footer className="ul-sync-foot">
            <span className="ul-sync-muted">
              {effectiveUpdates} update{effectiveUpdates === 1 ? "" : "s"} and {selectedAdds.size} new share
              {selectedAdds.size === 1 ? "" : "s"} selected
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onApply}
              disabled={applying || nothingSelected}
            >
              {applying ? "Applying…" : "Apply selected"}
            </button>
          </footer>
        </>
      )}
    </section>
  );
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


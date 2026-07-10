"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompanyLogo } from "@/lib/util";
import {
  fetchUnlisted,
  createUnlisted,
  updateUnlisted,
  deleteUnlisted,
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
  brand: "#01696f",
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
    setShowForm(true);
    setFormError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
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
      if (form.id) {
        await updateUnlisted(form.id, payload);
      } else {
        await createUnlisted(payload);
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
      <header className="admin-page-head">
        <div>
          <h1>Unlisted Shares</h1>
          <p className="admin-page-sub">
            Add, edit, price and brand the unlisted inventory shown on the public
            site. Upload a logo URL to override the default Clearbit fallback.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={startCreate}
        >
          + Add unlisted share
        </button>
      </header>

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
        )}
      </div>

      {showForm && (
        <div className="admin-modal" onClick={closeForm}>
          <form
            className="admin-modal-body"
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
                        : "#01696f"
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
                    placeholder="#01696f"
                  />
                </div>
              </label>

              <label className="admin-field admin-field-wide">
                <span>Logo URL (optional)</span>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) =>
                    setForm({ ...form, logo_url: e.target.value })
                  }
                  placeholder="https://example.com/logo.png — leave empty to use Clearbit fallback"
                />
                <small className="admin-field-hint">
                  When set, this image is used instead of the auto-fetched
                  Clearbit logo on the public site.
                </small>
              </label>

              {form.logo_url && (
                <div className="admin-field admin-field-wide">
                  <span>Logo preview</span>
                  <div className="admin-logo-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.logo_url}
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
                  ? "Saving…"
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


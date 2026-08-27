"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
  type AdminBlog
} from "@/lib/admin-api";
import { apiUrl } from "@/lib/api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Tag,
  FileText,
  Smartphone,
  Monitor,
  Share2
} from "lucide-react";

type FormState = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_url: string;
  author: string;
  category: string;
  published: boolean;
  position: number;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  meta_keywords: string;
  tags: string[];
  canonical_url: string;
  og_image: string;
};

const DEFAULT_CATEGORIES = [
  "Wealth Advisory",
  "Private Equity & Pre-IPO",
  "Portfolio Strategy",
  "Market Insights",
  "Fixed Income & Debt",
  "Investment Vehicles",
  "Tax Planning & Estate",
  "Alternative Assets"
];

const blank = (): FormState => ({
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  image_url: "",
  author: "Finvoq Admin",
  category: "Wealth Advisory",
  published: true,
  position: 0,
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  meta_keywords: "",
  tags: ["Investing", "Wealth", "Markets"],
  canonical_url: "",
  og_image: ""
});

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export default function AdminBlogsPage() {
  const [items, setItems] = useState<AdminBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPub, setFilterPub] = useState<"all" | "published" | "draft">("all");
  const [filterCat, setFilterCat] = useState("all");

  const [form, setForm] = useState<FormState>(blank());
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "preview">("content");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchBlogs();
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Could not load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_CATEGORIES.forEach((c) => set.add(c));
    items.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      if (filterPub === "published" && !b.published) return false;
      if (filterPub === "draft" && b.published) return false;
      if (filterCat !== "all" && b.category !== filterCat) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, search, filterPub, filterCat]);

  const startCreate = () => {
    setForm(blank());
    setImageFile(null);
    setImagePreview(null);
    setActiveTab("content");
    setShowForm(true);
    setFormError(null);
    setTagInput("");
  };

  const startEdit = (item: AdminBlog) => {
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      body: item.body || "",
      image_url: item.image_url || "",
      author: item.author || "Finvoq Admin",
      category: item.category || "Wealth Advisory",
      published: item.published,
      position: item.position || 0,
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
      focus_keyword: item.focus_keyword || "",
      meta_keywords: item.meta_keywords || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      canonical_url: item.canonical_url || "",
      og_image: item.og_image || ""
    });
    setImageFile(null);
    setImagePreview(item.image_url ? apiUrl(item.image_url) : null);
    setActiveTab("content");
    setShowForm(true);
    setFormError(null);
    setTagInput("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((tag) => tag !== t) }));
  };

  const seoAudit = useMemo(() => {
    const focus = form.focus_keyword.trim().toLowerCase();
    const title = form.title.toLowerCase();
    const seoTitle = (form.meta_title || form.title).toLowerCase();
    const slug = (form.slug || slugify(form.title)).toLowerCase();
    const desc = (form.meta_description || form.excerpt).toLowerCase();
    const body = form.body.toLowerCase();

    const titleHasFocus = focus ? title.includes(focus) || seoTitle.includes(focus) : false;
    const slugHasFocus = focus ? slug.includes(slugify(focus)) : false;
    const descHasFocus = focus ? desc.includes(focus) : false;
    const bodyHasFocus = focus ? body.includes(focus) : false;

    const titleLength = (form.meta_title || form.title).length;
    const titleGood = titleLength >= 35 && titleLength <= 65;

    const descLength = (form.meta_description || form.excerpt).length;
    const descGood = descLength >= 100 && descLength <= 165;

    const hasImage = Boolean(form.image_url || imagePreview);
    const hasTags = form.tags.length > 0;

    let score = 0;
    if (focus) {
      if (titleHasFocus) score += 20;
      if (slugHasFocus) score += 15;
      if (descHasFocus) score += 15;
      if (bodyHasFocus) score += 15;
    } else {
      score += 30;
    }
    if (titleGood) score += 15;
    if (descGood) score += 10;
    if (hasImage) score += 5;
    if (hasTags) score += 5;

    score = Math.min(100, score);

    return {
      score,
      focus,
      titleHasFocus,
      slugHasFocus,
      descHasFocus,
      bodyHasFocus,
      titleGood,
      titleLength,
      descGood,
      descLength,
      hasImage,
      hasTags
    };
  }, [form, imagePreview]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const slug = form.slug || slugify(form.title);
      const payload = {
        title: form.title,
        slug,
        excerpt: form.excerpt,
        body: form.body,
        image_url: form.image_url || null,
        author: form.author,
        category: form.category || "Wealth Advisory",
        published: form.published,
        position: form.position,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        focus_keyword: form.focus_keyword || null,
        meta_keywords: form.meta_keywords || null,
        tags: form.tags,
        canonical_url: form.canonical_url || null,
        og_image: form.og_image || form.image_url || null
      };

      let saved: AdminBlog;
      if (form.id) {
        saved = await updateBlog(form.id, payload);
      } else {
        saved = await createBlog(payload as any);
      }

      if (imageFile && saved.id) {
        setUploadingImage(true);
        try {
          const result = await uploadBlogImage(saved.id, imageFile);
          saved = result.item;
        } catch (imgErr: any) {
          setFormError(`Blog saved, but image upload failed: ${imgErr.message}`);
        } finally {
          setUploadingImage(false);
        }
      }

      setShowForm(false);
      setForm(blank());
      setImageFile(null);
      setImagePreview(null);
      await reload();
    } catch (err: any) {
      setFormError(err?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteBlog(id);
      await reload();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  const togglePublished = async (item: AdminBlog) => {
    try {
      await updateBlog(item.id, { published: !item.published });
      await reload();
    } catch (err: any) {
      alert(err?.message || "Update failed");
    }
  };

  return (
    <div className="admin-page" style={{ padding: "20px 24px" }}>
      <style>{`
        /* ── Unified No-Scroll Theme Styles for Admin Blogs ── */
        .ab-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        @media (max-width: 900px) {
          .ab-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .ab-stat-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          padding: 14px 18px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .dark .ab-stat-card,
        [data-theme="dark"] .ab-stat-card {
          background: var(--color-surface-2, #10192d);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .ab-stat-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted, #64748b);
        }
        .ab-stat-value {
          font-size: 22px;
          font-weight: 800;
          color: var(--color-text, #0f172a);
          line-height: 1.1;
        }
        .dark .ab-stat-value,
        [data-theme="dark"] .ab-stat-value {
          color: #ffffff;
        }
        .ab-stat-value.pub {
          color: #10b981;
        }
        .ab-stat-value.draft {
          color: #f59e0b;
        }
        .ab-stat-value.cat {
          color: #6366f1;
        }

        /* ── Toolbar ── */
        .ab-toolbar {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          padding: 10px 14px;
          border-radius: 12px;
        }
        .dark .ab-toolbar,
        [data-theme="dark"] .ab-toolbar {
          background: var(--color-surface-2, #10192d);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ab-search-wrap {
          position: relative;
          flex: 1;
        }
        .ab-search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #cbd5e1);
          background: var(--color-surface-offset, #f8fafc);
          color: var(--color-text, #0f172a);
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .dark .ab-search-input,
        [data-theme="dark"] .ab-search-input {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
        .ab-search-input:focus {
          border-color: #10b981;
        }
        .ab-select {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #cbd5e1);
          background: var(--color-surface-offset, #f8fafc);
          color: var(--color-text, #0f172a);
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .dark .ab-select,
        [data-theme="dark"] .ab-select {
          background: #152238;
          border-color: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        /* ── Full Width Single Screen Table Card (Zero Overflow Scroll) ── */
        .ab-table-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 14px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .dark .ab-table-card,
        [data-theme="dark"] .ab-table-card {
          background: var(--color-surface-2, #10192d);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .ab-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        .ab-table thead tr {
          background: var(--color-surface-offset, #f8fafc);
          border-bottom: 1px solid var(--color-border, #e2e8f0);
        }
        .dark .ab-table thead tr,
        [data-theme="dark"] .ab-table thead tr {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ab-table th {
          padding: 11px 12px;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted, #64748b);
          text-align: left;
        }
        .dark .ab-table th,
        [data-theme="dark"] .ab-table th {
          color: #94a3b8;
        }
        .ab-table tbody tr {
          border-bottom: 1px solid var(--color-divider, #f1f5f9);
          transition: background 0.12s ease;
        }
        .dark .ab-table tbody tr,
        [data-theme="dark"] .ab-table tbody tr {
          border-color: rgba(255, 255, 255, 0.05);
        }
        .ab-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.015);
        }
        .dark .ab-table tbody tr:hover,
        [data-theme="dark"] .ab-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.025);
        }
        .ab-table td {
          padding: 10px 12px;
          vertical-align: middle;
          font-size: 13px;
          color: var(--color-text, #0f172a);
          overflow: hidden;
        }
        .dark .ab-table td,
        [data-theme="dark"] .ab-table td {
          color: #e2e8f0;
        }
        .ab-post-title {
          font-weight: 700;
          font-size: 13.5px;
          color: var(--ink, #0f172a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dark .ab-post-title,
        [data-theme="dark"] .ab-post-title {
          color: #ffffff;
        }
        .ab-slug-code {
          background: rgba(0, 0, 0, 0.04);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11px;
          font-family: monospace;
          color: var(--color-text-muted, #475569);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
          display: inline-block;
        }
        .dark .ab-slug-code,
        [data-theme="dark"] .ab-slug-code {
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
        }
        .ab-cat-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 700;
          color: #0284c7;
          background: rgba(2, 132, 199, 0.1);
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid rgba(2, 132, 199, 0.2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 110px;
        }
        .dark .ab-cat-badge,
        [data-theme="dark"] .ab-cat-badge {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border-color: rgba(56, 189, 248, 0.25);
        }
        .ab-tag-mini {
          font-size: 10px;
          background: rgba(0, 0, 0, 0.04);
          color: var(--color-text-muted, #64748b);
          padding: 1px 5px;
          border-radius: 3px;
          white-space: nowrap;
        }
        .dark .ab-tag-mini,
        [data-theme="dark"] .ab-tag-mini {
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
        }
        .ab-seo-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          white-space: nowrap;
        }
        .ab-seo-badge.ok {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .dark .ab-seo-badge.ok,
        [data-theme="dark"] .ab-seo-badge.ok {
          background: rgba(52, 211, 153, 0.15);
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.3);
        }
        .ab-seo-badge.warn {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
        .dark .ab-seo-badge.warn,
        [data-theme="dark"] .ab-seo-badge.warn {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.3);
        }
        .ab-status-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .ab-status-btn.live {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border-color: rgba(16, 185, 129, 0.25);
        }
        .dark .ab-status-btn.live,
        [data-theme="dark"] .ab-status-btn.live {
          background: rgba(52, 211, 153, 0.15);
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.3);
        }
        .ab-status-btn.draft {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border-color: rgba(245, 158, 11, 0.25);
        }
        .dark .ab-status-btn.draft,
        [data-theme="dark"] .ab-status-btn.draft {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.3);
        }

        /* ── Action Buttons with Crisp Visible Icons ── */
        .ab-act-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 30px;
          padding: 0 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--color-border, #cbd5e1);
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #0f172a);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .dark .ab-act-btn,
        [data-theme="dark"] .ab-act-btn {
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .ab-act-btn svg {
          display: block;
          flex-shrink: 0;
        }
        .ab-act-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.2);
        }
        .dark .ab-act-btn:hover,
        [data-theme="dark"] .ab-act-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }
        .ab-act-btn.icon-only {
          width: 30px;
          padding: 0;
        }
        .ab-act-btn.view {
          color: #64748b;
          background: rgba(100, 116, 139, 0.08);
          border-color: rgba(100, 116, 139, 0.2);
        }
        .dark .ab-act-btn.view,
        [data-theme="dark"] .ab-act-btn.view {
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .ab-act-btn.view:hover {
          color: #0284c7;
          border-color: rgba(2, 132, 199, 0.35);
          background: rgba(2, 132, 199, 0.12);
        }
        .dark .ab-act-btn.view:hover,
        [data-theme="dark"] .ab-act-btn.view:hover {
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.35);
          background: rgba(56, 189, 248, 0.12);
        }
        .ab-act-btn.edit {
          color: #047857;
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.28);
        }
        .dark .ab-act-btn.edit,
        [data-theme="dark"] .ab-act-btn.edit {
          color: #34d399;
          background: rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.32);
        }
        .ab-act-btn.edit:hover {
          background: rgba(16, 185, 129, 0.24);
          color: #065f46;
        }
        .dark .ab-act-btn.edit:hover,
        [data-theme="dark"] .ab-act-btn.edit:hover {
          background: rgba(16, 185, 129, 0.28);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.5);
        }
        .ab-act-btn.del {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.25);
        }
        .dark .ab-act-btn.del,
        [data-theme="dark"] .ab-act-btn.del {
          color: #f87171;
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.32);
        }
        .ab-act-btn.del:hover {
          background: rgba(239, 68, 68, 0.22);
          color: #b91c1c;
        }
        .dark .ab-act-btn.del:hover,
        [data-theme="dark"] .ab-act-btn.del:hover {
          background: rgba(239, 68, 68, 0.28);
          color: #ffffff;
          border-color: rgba(239, 68, 68, 0.5);
        }

        /* ── Modal Dark/Light Theme ── */
        .ab-modal-shell {
          background: var(--color-surface, #ffffff);
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          border: 1px solid var(--color-border, #e2e8f0);
        }
        .dark .ab-modal-shell,
        [data-theme="dark"] .ab-modal-shell {
          background: #0f172a;
          border-color: rgba(255, 255, 255, 0.12);
        }
        .ab-modal-head {
          padding: 16px 24px;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-surface-offset, #f8fafc);
        }
        .dark .ab-modal-head,
        [data-theme="dark"] .ab-modal-head {
          background: #0b1120;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ab-modal-tab-bar {
          display: flex;
          gap: 4px;
          padding: 0 24px;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          background: var(--color-surface, #ffffff);
        }
        .dark .ab-modal-tab-bar,
        [data-theme="dark"] .ab-modal-tab-bar {
          background: #0f172a;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ab-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--color-text-muted, #64748b);
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.15s ease;
        }
        .dark .ab-tab-btn,
        [data-theme="dark"] .ab-tab-btn {
          color: #94a3b8;
        }
        .ab-tab-btn.active {
          color: #10b981;
          border-bottom-color: #10b981;
        }
        .dark .ab-tab-btn.active,
        [data-theme="dark"] .ab-tab-btn.active {
          color: #34d399;
          border-bottom-color: #34d399;
        }
        .ab-form-input, .ab-form-textarea, .ab-form-select {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #cbd5e1);
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #0f172a);
          font-size: 13.5px;
          outline: none;
        }
        .dark .ab-form-input,
        .dark .ab-form-textarea,
        .dark .ab-form-select,
        [data-theme="dark"] .ab-form-input,
        [data-theme="dark"] .ab-form-textarea,
        [data-theme="dark"] .ab-form-select {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
        .ab-form-input:focus, .ab-form-textarea:focus, .ab-form-select:focus {
          border-color: #10b981;
        }
        .ab-box-section {
          background: var(--color-surface-offset, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          padding: 14px 18px;
          border-radius: 10px;
        }
        .dark .ab-box-section,
        [data-theme="dark"] .ab-box-section {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ab-modal-foot {
          padding: 14px 24px;
          border-top: 1px solid var(--color-border, #e2e8f0);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-surface-offset, #f8fafc);
        }
        .dark .ab-modal-foot,
        [data-theme="dark"] .ab-modal-foot {
          background: #0b1120;
          border-color: rgba(255, 255, 255, 0.08);
        }
      `}</style>

      {/* Header & Action Bar */}
      <header className="admin-page-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24 }}>Blog & SEO Engine</h1>
          <p className="admin-page-sub" style={{ margin: 0, fontSize: 13.5 }}>
            Create, optimize, and manage dynamic wealth management blogs. Fully equipped with meta tags, keyword analysis, SERP simulator, and OpenGraph social shares.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={startCreate}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px" }}
        >
          <Plus size={15} color="#ffffff" /> New Blog Post
        </button>
      </header>

      {/* Quick Summary Stat Cards */}
      <div className="ab-stat-grid">
        <div className="ab-stat-card">
          <span className="ab-stat-label">Total Articles</span>
          <div className="ab-stat-value">{items.length}</div>
        </div>
        <div className="ab-stat-card">
          <span className="ab-stat-label">Published Live</span>
          <div className="ab-stat-value pub">
            {items.filter((b) => b.published).length}
          </div>
        </div>
        <div className="ab-stat-card">
          <span className="ab-stat-label">Drafts</span>
          <div className="ab-stat-value draft">
            {items.filter((b) => !b.published).length}
          </div>
        </div>
        <div className="ab-stat-card">
          <span className="ab-stat-label">Categories</span>
          <div className="ab-stat-value cat">{categories.length}</div>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Search + Filter Controls */}
      <div className="ab-toolbar">
        <div className="ab-search-wrap">
          <Search
            size={15}
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            className="ab-search-input"
            placeholder="Search blogs, tags, authors, slugs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterPub}
          onChange={(e) => setFilterPub(e.target.value as any)}
          className="ab-select"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Live</option>
          <option value="draft">Drafts Only</option>
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="ab-select"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Blogs Table — Single Screen Without Horizontal Scrollbar */}
      {loading ? (
        <div className="admin-spinner" style={{ margin: "50px auto" }} />
      ) : (
        <div className="ab-table-card">
          <table className="ab-table">
            <colgroup>
              <col style={{ width: 56 }} />
              <col style={{ width: "34%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Cover</th>
                <th>Post Details & URL</th>
                <th>Category & Tags</th>
                <th>SEO Health</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                    {items.length === 0 ? "No blog posts yet. Click '+ New Blog Post' to publish your first!" : "No posts match your filters."}
                  </td>
                </tr>
              )}
              {filtered.map((b) => {
                const hasSeoMeta = Boolean(b.meta_title || b.meta_description || b.focus_keyword);
                return (
                  <tr key={b.id}>
                    {/* Cover */}
                    <td>
                      {b.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={apiUrl(b.image_url)}
                          alt=""
                          style={{ width: 44, height: 30, objectFit: "cover", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "block" }}
                        />
                      ) : (
                        <span style={{ display: "inline-grid", placeItems: "center", width: 44, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontSize: 9, border: "1px dashed rgba(255,255,255,0.15)" }}>
                          None
                        </span>
                      )}
                    </td>

                    {/* Details */}
                    <td>
                      <div className="ab-post-title" title={b.title}>{b.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
                        <code className="ab-slug-code" title={`/blog/${b.slug}`}>/blog/{b.slug}</code>
                        <span style={{ whiteSpace: "nowrap" }}>• {b.author || "Finvoq Admin"}</span>
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
                        <span className="ab-cat-badge" title={b.category || "Wealth Advisory"}>
                          {b.category || "Wealth Advisory"}
                        </span>
                        {(b.tags || []).slice(0, 1).map((t) => (
                          <span key={t} className="ab-tag-mini">
                            #{t}
                          </span>
                        ))}
                        {(b.tags || []).length > 1 && (
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>+{b.tags!.length - 1}</span>
                        )}
                      </div>
                    </td>

                    {/* SEO Health */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div className={`ab-seo-badge ${hasSeoMeta ? "ok" : "warn"}`}>
                          <Sparkles size={11} color={hasSeoMeta ? "#34d399" : "#fbbf24"} />
                          {hasSeoMeta ? "Configured" : "Missing"}
                        </div>
                        {b.focus_keyword && (
                          <span style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }} title={b.focus_keyword}>
                            <strong style={{ color: "#38bdf8" }}>{b.focus_keyword}</strong>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Pill in Single Line */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => togglePublished(b)}
                        className={`ab-status-btn ${b.published ? "live" : "draft"}`}
                        title="Click to toggle publish state"
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: b.published ? "#34d399" : "#fbbf24",
                            display: "inline-block"
                          }}
                        />
                        <span>{b.published ? "Live" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Actions with Explicit Bold Icons */}
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {/* Live Link Button */}
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ab-act-btn icon-only view"
                          title="View live article on website"
                        >
                          <ExternalLink size={14} strokeWidth={2.2} />
                        </a>

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="ab-act-btn edit"
                          onClick={() => startEdit(b)}
                          title="Edit article and SEO"
                        >
                          <Edit2 size={13} strokeWidth={2.2} /> Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="ab-act-btn icon-only del"
                          onClick={() => onDelete(b.id, b.title)}
                          title="Delete blog article"
                        >
                          <Trash2 size={14} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Blog & SEO Editor Modal */}
      {showForm && (
        <div
          className="admin-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="ab-modal-shell">
            {/* Modal Header */}
            <div className="ab-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text, #ffffff)" }}>
                  {form.id ? "Edit Blog Article & SEO" : "Create New Blog Article"}
                </h2>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Configure article content, images, SEO meta tags, and live Google preview.
                </span>
              </div>

              {/* SEO Score Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: seoAudit.score >= 70 ? "rgba(16, 185, 129, 0.15)" : seoAudit.score >= 40 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${seoAudit.score >= 70 ? "rgba(16, 185, 129, 0.3)" : seoAudit.score >= 40 ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  padding: "5px 12px",
                  borderRadius: 999
                }}
              >
                <Sparkles size={13} color={seoAudit.score >= 70 ? "#34d399" : seoAudit.score >= 40 ? "#fbbf24" : "#f87171"} />
                <span style={{ fontSize: 12, fontWeight: 700, color: seoAudit.score >= 70 ? "#34d399" : seoAudit.score >= 40 ? "#fbbf24" : "#f87171" }}>
                  SEO Score: {seoAudit.score}/100
                </span>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="ab-modal-tab-bar">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`ab-tab-btn ${activeTab === "content" ? "active" : ""}`}
              >
                <FileText size={15} color={activeTab === "content" ? "#34d399" : "#94a3b8"} /> Content & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`ab-tab-btn ${activeTab === "seo" ? "active" : ""}`}
              >
                <Globe size={15} color={activeTab === "seo" ? "#34d399" : "#94a3b8"} /> SEO & Meta Tags
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`ab-tab-btn ${activeTab === "preview" ? "active" : ""}`}
              >
                <Eye size={15} color={activeTab === "preview" ? "#34d399" : "#94a3b8"} /> Google SERP Simulator & Audit
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {formError && (
                  <div className="admin-error" style={{ marginBottom: 16 }}>
                    {formError}
                  </div>
                )}

                {/* ── TAB 1: CONTENT & MEDIA ── */}
                {activeTab === "content" && (
                  <div style={{ display: "grid", gap: 16 }}>
                    {/* Title */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Article Title *</span>
                        <span style={{ fontSize: 11.5, color: form.title.length > 70 ? "#f87171" : "#94a3b8" }}>
                          {form.title.length} characters
                        </span>
                      </div>
                      <input
                        required
                        value={form.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setForm((f) => ({
                            ...f,
                            title,
                            slug: f.id ? f.slug : slugify(title)
                          }));
                        }}
                        placeholder="e.g. The Art of Multi-Asset Allocation in 2026"
                        className="ab-form-input"
                      />
                    </label>

                    {/* Slug + Category */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>URL Permalink Slug</span>
                        <input
                          value={form.slug}
                          onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                          placeholder="article-url-slug"
                          className="ab-form-input"
                          style={{ fontFamily: "monospace" }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Category</span>
                        <select
                          value={form.category}
                          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                          className="ab-form-select"
                        >
                          {DEFAULT_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {/* Author & Position */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Author Byline</span>
                        <input
                          value={form.author}
                          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                          placeholder="e.g. Finvoq Admin"
                          className="ab-form-input"
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Sort Position (Rank)</span>
                        <input
                          type="number"
                          value={form.position}
                          onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) || 0 }))}
                          className="ab-form-input"
                        />
                      </label>
                    </div>

                    {/* Cover Image Upload & Preview */}
                    <div className="ab-box-section">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "block", marginBottom: 8 }}>
                        Featured Cover Image
                      </span>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ fontSize: 12.5, marginBottom: 6, color: "#94a3b8" }}
                          />
                          <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                            Or specify existing image path:
                          </div>
                          <input
                            value={form.image_url}
                            onChange={(e) => {
                              setForm((f) => ({ ...f, image_url: e.target.value }));
                              setImagePreview(e.target.value ? apiUrl(e.target.value) : null);
                            }}
                            placeholder="/images/blogs/blog-1.jpg"
                            className="ab-form-input"
                            style={{ fontSize: 12, marginTop: 4 }}
                          />
                        </div>
                        {imagePreview && (
                          <div style={{ position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagePreview}
                              alt="Cover preview"
                              style={{ width: 120, height: 75, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)" }}
                            />
                          </div>
                        )}
                      </div>
                      {uploadingImage && <span style={{ fontSize: 12, color: "#38bdf8" }}>Uploading image…</span>}
                    </div>

                    {/* Excerpt */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Excerpt (Summary)</span>
                        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{form.excerpt.length} chars</span>
                      </div>
                      <textarea
                        rows={2}
                        value={form.excerpt}
                        onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                        placeholder="A concise 1-2 sentence preview for blog listing cards and social feeds…"
                        className="ab-form-textarea"
                      />
                    </label>

                    {/* Body HTML */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Article Body (HTML)</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, body: f.body + "\n<h2>Section Heading</h2>\n<p>Your paragraph text here...</p>\n" }))}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", cursor: "pointer" }}
                          >
                            + Add Heading & Text
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, body: f.body + "\n<blockquote>\"Insightful quote here\"</blockquote>\n" }))}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", cursor: "pointer" }}
                          >
                            + Quote
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={9}
                        value={form.body}
                        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                        placeholder="<h2>Why Portfolio Concentration Matters</h2>\n<p>Write your detailed blog post here using standard HTML...</p>"
                        className="ab-form-textarea"
                        style={{ fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.5 }}
                      />
                    </label>

                    {/* Published toggle */}
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingTop: 2 }}>
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                        style={{ width: 16, height: 16, accentColor: "#10b981" }}
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>
                        Publish this blog live on website immediately
                      </span>
                    </label>
                  </div>
                )}

                {/* ── TAB 2: SEO & META TAGS ── */}
                {activeTab === "seo" && (
                  <div style={{ display: "grid", gap: 16 }}>
                    {/* Focus Keyword */}
                    <div style={{ background: "rgba(2, 132, 199, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: 14, borderRadius: 10 }}>
                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", display: "flex", alignItems: "center", gap: 6 }}>
                          <Sparkles size={14} color="#38bdf8" /> Focus Keyword / Keyphrase
                        </span>
                        <input
                          value={form.focus_keyword}
                          onChange={(e) => setForm((f) => ({ ...f, focus_keyword: e.target.value }))}
                          placeholder="e.g. advisory led investing"
                          className="ab-form-input"
                        />
                      </label>
                      <span style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4, display: "block" }}>
                        The primary search query you want this article to rank for on Google and AI search platforms.
                      </span>
                    </div>

                    {/* SEO Meta Title */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>SEO Title Tag (Meta Title)</span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: seoAudit.titleGood ? "#34d399" : seoAudit.titleLength > 65 ? "#f87171" : "#fbbf24"
                          }}
                        >
                          {form.meta_title ? form.meta_title.length : form.title.length} / 60 characters
                        </span>
                      </div>
                      <input
                        value={form.meta_title}
                        onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
                        placeholder={form.title ? `${form.title} | Finvoq` : "Custom search engine title"}
                        className="ab-form-input"
                      />
                    </label>

                    {/* Meta Description */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Meta Description (Search Snippet)</span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: seoAudit.descGood ? "#34d399" : seoAudit.descLength > 165 ? "#f87171" : "#fbbf24"
                          }}
                        >
                          {form.meta_description ? form.meta_description.length : form.excerpt.length} / 160 characters
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={form.meta_description}
                        onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                        placeholder={form.excerpt || "Enter a compelling description for Google search snippets..."}
                        className="ab-form-textarea"
                      />
                    </label>

                    {/* Meta Keywords & Canonical URL */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Meta Keywords</span>
                        <input
                          value={form.meta_keywords}
                          onChange={(e) => setForm((f) => ({ ...f, meta_keywords: e.target.value }))}
                          placeholder="investing, wealth, bonds, equities"
                          className="ab-form-input"
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>Canonical URL</span>
                        <input
                          value={form.canonical_url}
                          onChange={(e) => setForm((f) => ({ ...f, canonical_url: e.target.value }))}
                          placeholder="https://finvoq.com/blog/..."
                          className="ab-form-input"
                        />
                      </label>
                    </div>

                    {/* Tags Input with Chips */}
                    <div className="ab-box-section">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <Tag size={14} color="#38bdf8" /> Article Tags
                      </span>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="Type tag and press enter (e.g. Pre-IPO)..."
                          className="ab-form-input"
                          style={{ flex: 1 }}
                        />
                        <button type="button" onClick={addTag} className="btn btn-outline btn-sm" style={{ padding: "6px 12px" }}>
                          + Add
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {form.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11.5,
                              fontWeight: 600,
                              background: "rgba(255, 255, 255, 0.08)",
                              color: "#cbd5e1",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              padding: "2px 8px",
                              borderRadius: 999
                            }}
                          >
                            #{t}
                            <button
                              type="button"
                              onClick={() => removeTag(t)}
                              style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 0, fontSize: 13 }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Share / OG Image */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Share2 size={14} color="#38bdf8" /> OpenGraph Social Image URL (Optional)
                      </span>
                      <input
                        value={form.og_image}
                        onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
                        placeholder={form.image_url || "/images/blogs/blog-1.jpg"}
                        className="ab-form-input"
                      />
                    </label>
                  </div>
                )}

                {/* ── TAB 3: GOOGLE SERP SIMULATOR & SEO AUDIT ── */}
                {activeTab === "preview" && (
                  <div style={{ display: "grid", gap: 20 }}>
                    {/* Device Toggle */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text, #ffffff)" }}>
                        Live Google Search Result Preview
                      </span>
                      <div style={{ display: "flex", gap: 4, background: "rgba(255, 255, 255, 0.06)", padding: 3, borderRadius: 8 }}>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "none",
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            background: previewDevice === "desktop" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                            color: previewDevice === "desktop" ? "#ffffff" : "#94a3b8"
                          }}
                        >
                          <Monitor size={13} /> Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "none",
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            background: previewDevice === "mobile" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                            color: previewDevice === "mobile" ? "#ffffff" : "#94a3b8"
                          }}
                        >
                          <Smartphone size={13} /> Mobile
                        </button>
                      </div>
                    </div>

                    {/* Google SERP Card Preview */}
                    <div
                      style={{
                        background: "#1f2937",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: previewDevice === "mobile" ? 14 : 8,
                        padding: previewDevice === "mobile" ? "14px 18px" : "16px 20px",
                        maxWidth: previewDevice === "mobile" ? 360 : 620,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        margin: previewDevice === "mobile" ? "0 auto" : "0"
                      }}
                    >
                      {/* URL Snippet */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#10b981", display: "grid", placeItems: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                          F
                        </div>
                        <div style={{ fontSize: 11.5, color: "#e5e7eb", lineHeight: 1.2 }}>
                          <div>Finvoq Wealth</div>
                          <div style={{ color: "#9ca3af", fontSize: 10.5 }}>
                            https://finvoq.com › blog › {form.slug || slugify(form.title || "sample-slug")}
                          </div>
                        </div>
                      </div>

                      {/* SERP Title */}
                      <h3
                        style={{
                          margin: "3px 0 5px",
                          fontSize: previewDevice === "mobile" ? 16 : 18.5,
                          fontWeight: 400,
                          color: "#818cf8",
                          lineHeight: 1.3,
                          cursor: "pointer"
                        }}
                      >
                        {form.meta_title || form.title || "Add a blog title to see Google search snippet preview"}
                      </h3>

                      {/* SERP Description */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          color: "#d1d5db",
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {form.meta_description || form.excerpt || "Enter a compelling meta description or excerpt to optimize your click-through rate from search engines."}
                      </p>
                    </div>

                    {/* SEO Health Audit Recommendations Checklist */}
                    <div className="ab-box-section">
                      <h4 style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 700, color: "var(--color-text, #ffffff)" }}>
                        SEO Health Check & Recommendations
                      </h4>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          {seoAudit.focus ? (
                            seoAudit.titleHasFocus ? (
                              <CheckCircle2 size={15} color="#34d399" />
                            ) : (
                              <AlertCircle size={15} color="#fbbf24" />
                            )
                          ) : (
                            <AlertCircle size={15} color="#94a3b8" />
                          )}
                          <span>
                            Focus keyword in title tag:{" "}
                            <strong>{seoAudit.focus ? (seoAudit.titleHasFocus ? "Yes (Optimized)" : "Missing from title") : "No focus keyword set"}</strong>
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          {seoAudit.focus ? (
                            seoAudit.slugHasFocus ? (
                              <CheckCircle2 size={15} color="#34d399" />
                            ) : (
                              <AlertCircle size={15} color="#fbbf24" />
                            )
                          ) : (
                            <AlertCircle size={15} color="#94a3b8" />
                          )}
                          <span>
                            Focus keyword in URL permalink slug:{" "}
                            <strong>{seoAudit.focus ? (seoAudit.slugHasFocus ? "Yes (Optimized)" : "Missing from slug") : "No focus keyword set"}</strong>
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          {seoAudit.focus ? (
                            seoAudit.descHasFocus ? (
                              <CheckCircle2 size={15} color="#34d399" />
                            ) : (
                              <AlertCircle size={15} color="#fbbf24" />
                            )
                          ) : (
                            <AlertCircle size={15} color="#94a3b8" />
                          )}
                          <span>
                            Focus keyword in meta description:{" "}
                            <strong>{seoAudit.focus ? (seoAudit.descHasFocus ? "Yes (Optimized)" : "Missing from snippet") : "No focus keyword set"}</strong>
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          {seoAudit.titleGood ? (
                            <CheckCircle2 size={15} color="#34d399" />
                          ) : (
                            <AlertCircle size={15} color="#fbbf24" />
                          )}
                          <span>
                            SEO Title length:{" "}
                            <strong>{seoAudit.titleLength} chars ({seoAudit.titleGood ? "Ideal 40-60" : "Recommended: 40-65 chars"})</strong>
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          {seoAudit.descGood ? (
                            <CheckCircle2 size={15} color="#34d399" />
                          ) : (
                            <AlertCircle size={15} color="#fbbf24" />
                          )}
                          <span>
                            Meta description length:{" "}
                            <strong>{seoAudit.descLength} chars ({seoAudit.descGood ? "Ideal 120-160" : "Recommended: 100-165 chars"})</strong>
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          {seoAudit.hasImage ? (
                            <CheckCircle2 size={15} color="#34d399" />
                          ) : (
                            <AlertCircle size={15} color="#f87171" />
                          )}
                          <span>
                            Cover image / OpenGraph visual:{" "}
                            <strong>{seoAudit.hasImage ? "Attached" : "Missing cover image"}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="ab-modal-foot">
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {form.published ? "🟢 Ready to publish live" : "🟡 Saving as draft"}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                    style={{ minWidth: 110 }}
                  >
                    {submitting ? "Saving…" : form.id ? "Update Post & SEO" : "Publish Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

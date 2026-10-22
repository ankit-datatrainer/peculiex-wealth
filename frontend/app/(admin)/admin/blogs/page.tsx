"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  type AdminBlog
} from "@/lib/admin-api";
import { apiUrl } from "@/lib/api";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaPicker, { resolveMediaUrl } from "@/components/admin/MediaPicker";
import SeoPanel from "@/components/admin/SeoPanel";
import { analyseSeo } from "@/lib/seoAnalysis";
import PublishControls from "@/components/admin/PublishControls";
import {
  blogStatus,
  formatSchedule,
  formatScheduleShort,
  fromLocalInput,
  timeUntil,
  toLocalInput,
  type PublishMode
} from "@/lib/blogSchedule";
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
  Share2,
  Calendar,
  CalendarClock,
  Save
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
  /** Draft / publish now / schedule — drives `published` + `publish_at` on save. */
  publish_mode: PublishMode;
  /** datetime-local value for scheduling, "YYYY-MM-DDTHH:mm". */
  schedule_at: string;
  position: number;
  article_date: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  meta_keywords: string;
  tags: string[];
  canonical_url: string;
  og_image: string;
  image_alt: string;
  secondary_keywords: string;
  og_title: string;
  og_description: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  schema_type: string;
  robots_noindex: boolean;
  robots_nofollow: boolean;
  pillar_content: boolean;
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

/** YYYY-MM-DD in the browser's own timezone (an IST editor must not see
    an ISO date that UTC has rolled back a day). */
function localDateStr(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  publish_mode: "now",
  schedule_at: "",
  position: 0,
  article_date: getTodayDateStr(),
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  meta_keywords: "",
  tags: ["Investing", "Wealth", "Markets"],
  canonical_url: "",
  og_image: "",
  image_alt: "",
  secondary_keywords: "",
  og_title: "",
  og_description: "",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  schema_type: "BlogPosting",
  robots_noindex: false,
  robots_nofollow: false,
  pillar_content: false
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
  const [filterPub, setFilterPub] = useState<"all" | "published" | "scheduled" | "draft">("all");
  // Re-evaluates Live/Scheduled every 30s so a post flips to Live in the list
  // at its go-live minute without a reload.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);
  const [filterCat, setFilterCat] = useState("all");

  const [form, setForm] = useState<FormState>(blank());
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "preview">("content");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /* The cover is uploaded the moment it is chosen rather than deferred to
     save, so the preview is real and a draft can carry an image before it
     has an id. */
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [socialPicker, setSocialPicker] = useState<"og" | "tw" | null>(null);
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
      const st = blogStatus(b, now);
      if (filterPub === "published" && st !== "live") return false;
      if (filterPub === "scheduled" && st !== "scheduled") return false;
      if (filterPub === "draft" && st !== "draft") return false;
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
  }, [items, search, filterPub, filterCat, now]);

  /** Upcoming scheduled posts, soonest first. */
  const scheduledQueue = useMemo(
    () =>
      items
        .filter((b) => blogStatus(b, now) === "scheduled")
        .sort((a, b) => new Date(a.publish_at!).getTime() - new Date(b.publish_at!).getTime()),
    [items, now]
  );

  const startCreate = () => {
    setForm(blank());
    setActiveTab("content");
    setShowForm(true);
    setFormError(null);
    setTagInput("");
  };

  const startEdit = (item: AdminBlog) => {
    // The article date is created_at. updated_at is bumped on every save,
    // so seeding the picker from it reset old posts to "today" on re-save.
    const rawDate = item.created_at || item.updated_at;
    let initialDate = getTodayDateStr();
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) initialDate = localDateStr(d);
    }

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
      publish_mode:
        blogStatus(item) === "draft" ? "draft" : blogStatus(item) === "scheduled" ? "schedule" : "now",
      schedule_at: blogStatus(item) === "scheduled" ? toLocalInput(item.publish_at) : "",
      position: item.position || 0,
      article_date: initialDate,
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
      focus_keyword: item.focus_keyword || "",
      meta_keywords: item.meta_keywords || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      canonical_url: item.canonical_url || "",
      og_image: item.og_image || "",
      image_alt: item.image_alt || "",
      secondary_keywords: item.secondary_keywords || "",
      og_title: item.og_title || "",
      og_description: item.og_description || "",
      twitter_title: item.twitter_title || "",
      twitter_description: item.twitter_description || "",
      twitter_image: item.twitter_image || "",
      schema_type: item.schema_type || "BlogPosting",
      robots_noindex: Boolean(item.robots_noindex),
      robots_nofollow: Boolean(item.robots_nofollow),
      pillar_content: Boolean(item.pillar_content)
    });
    setActiveTab("content");
    setShowForm(true);
    setFormError(null);
    setTagInput("");
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

  /* Full Rank-Math-style analysis. Recomputed as you type; the engine is
     pure string work so it is cheap enough to run on every keystroke. */
  const report = useMemo(
    () =>
      analyseSeo({
        title: form.title,
        metaTitle: form.meta_title,
        metaDescription: form.meta_description,
        excerpt: form.excerpt,
        slug: form.slug || slugify(form.title),
        bodyHtml: form.body,
        focusKeyword: form.focus_keyword,
        secondaryKeywords: form.secondary_keywords,
        coverImage: form.image_url,
        coverAlt: form.image_alt,
        // Lets the "keyword used only once" test see the rest of the blog.
        otherKeywords: items
          .filter((b) => b.id !== form.id)
          .map((b) => b.focus_keyword || "")
          .filter(Boolean),
        siteHost: "finvoq.com"
      }),
    [form, items]
  );

  // The header badge and the two character counters read from this.
  const seoAudit = useMemo(
    () => ({
      score: report.score,
      titleLength: report.stats.titleLength,
      titleGood: report.stats.titleLength >= 40 && report.stats.titleLength <= 60,
      descLength: report.stats.descriptionLength,
      descGood: report.stats.descriptionLength >= 120 && report.stats.descriptionLength <= 160
    }),
    [report]
  );

  /** Turns the chosen publish mode into stored fields, or an error message. */
  const resolvePublishing = ():
    | { published: boolean; publish_at: string | null }
    | { error: string } => {
    if (form.publish_mode === "draft") return { published: false, publish_at: null };
    if (form.publish_mode === "now") return { published: true, publish_at: null };
    const iso = fromLocalInput(form.schedule_at);
    if (!iso) return { error: "Pick a date and time to schedule this post." };
    if (new Date(iso).getTime() <= Date.now() + 30000) {
      return { error: "The scheduled time must be in the future. Pick a later time, or choose Publish now." };
    }
    return { published: true, publish_at: iso };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const publishing = resolvePublishing();
    if ("error" in publishing) {
      setFormError(publishing.error);
      setActiveTab("content");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const slug = form.slug || slugify(form.title);
      const nowIso = new Date().toISOString();
      let chosenDateIso = nowIso;
      // Build the date from its parts in local time. `new Date("YYYY-MM-DD")`
      // is UTC midnight, which is the previous day west of Greenwich.
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(form.article_date || "");
      if (m) {
        const now = new Date();
        const d = new Date(
          Number(m[1]),
          Number(m[2]) - 1,
          Number(m[3]),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        );
        if (!isNaN(d.getTime())) chosenDateIso = d.toISOString();
      }

      const payload = {
        title: form.title,
        slug,
        excerpt: form.excerpt,
        body: form.body,
        image_url: form.image_url || null,
        author: form.author,
        category: form.category || "Wealth Advisory",
        published: publishing.published,
        publish_at: publishing.publish_at,
        position: form.position,
        // A scheduled post's article date is its go-live time.
        created_at: publishing.publish_at || chosenDateIso,
        updated_at: nowIso,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        focus_keyword: form.focus_keyword || null,
        meta_keywords: form.meta_keywords || null,
        tags: form.tags,
        canonical_url: form.canonical_url || null,
        og_image: form.og_image || form.image_url || null,
        image_alt: form.image_alt || null,
        secondary_keywords: form.secondary_keywords || null,
        og_title: form.og_title || null,
        og_description: form.og_description || null,
        twitter_title: form.twitter_title || null,
        twitter_description: form.twitter_description || null,
        twitter_image: form.twitter_image || null,
        schema_type: form.schema_type || "BlogPosting",
        robots_noindex: form.robots_noindex,
        robots_nofollow: form.robots_nofollow,
        pillar_content: form.pillar_content
      };

      if (form.id) {
        await updateBlog(form.id, payload);
      } else {
        await createBlog(payload as any);
      }

      setShowForm(false);
      setForm(blank());
      await reload();
    } catch (err: any) {
      setFormError(err?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const draftTitle = form.title.trim() || (form.id ? "Draft Post" : "Untitled Draft");
      const slug = (form.slug.trim() || slugify(draftTitle)) || `draft-${Date.now()}`;
      const nowIso = new Date().toISOString();
      let chosenDateIso = nowIso;
      // Build the date from its parts in local time. `new Date("YYYY-MM-DD")`
      // is UTC midnight, which is the previous day west of Greenwich.
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(form.article_date || "");
      if (m) {
        const now = new Date();
        const d = new Date(
          Number(m[1]),
          Number(m[2]) - 1,
          Number(m[3]),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        );
        if (!isNaN(d.getTime())) chosenDateIso = d.toISOString();
      }

      const payload = {
        title: draftTitle,
        slug,
        excerpt: form.excerpt,
        body: form.body,
        image_url: form.image_url || null,
        author: form.author,
        category: form.category || "Wealth Advisory",
        published: false,
        publish_at: null,
        position: form.position,
        created_at: chosenDateIso,
        updated_at: nowIso,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        focus_keyword: form.focus_keyword || null,
        meta_keywords: form.meta_keywords || null,
        tags: form.tags,
        canonical_url: form.canonical_url || null,
        og_image: form.og_image || form.image_url || null,
        image_alt: form.image_alt || null,
        secondary_keywords: form.secondary_keywords || null,
        og_title: form.og_title || null,
        og_description: form.og_description || null,
        twitter_title: form.twitter_title || null,
        twitter_description: form.twitter_description || null,
        twitter_image: form.twitter_image || null,
        schema_type: form.schema_type || "BlogPosting",
        robots_noindex: form.robots_noindex,
        robots_nofollow: form.robots_nofollow,
        pillar_content: form.pillar_content
      };

      if (form.id) {
        await updateBlog(form.id, payload);
      } else {
        await createBlog(payload as any);
      }

      setShowForm(false);
      setForm(blank());
      await reload();
    } catch (err: any) {
      setFormError(err?.message || "Save as draft failed");
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
      // Live or scheduled -> draft; draft -> live right now.
      const toLive = blogStatus(item) === "draft";
      if (
        blogStatus(item) === "scheduled" &&
        !window.confirm(`Unschedule "${item.title}"? It will become a draft.`)
      ) {
        return;
      }
      await updateBlog(item.id, { published: toLive, publish_at: null });
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
          grid-template-columns: repeat(5, 1fr);
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
        .ab-stat-value.sched {
          color: #2563eb;
        }
        .dark .ab-stat-value.sched,
        [data-theme="dark"] .ab-stat-value.sched {
          color: #60a5fa;
        }
        .ab-status-btn.scheduled {
          color: #1d4ed8;
          background: rgba(37, 99, 235, 0.1);
          border-color: rgba(37, 99, 235, 0.3);
        }
        .dark .ab-status-btn.scheduled,
        [data-theme="dark"] .ab-status-btn.scheduled {
          color: #93c5fd;
          background: rgba(96, 165, 250, 0.12);
          border-color: rgba(96, 165, 250, 0.35);
        }
        .ab-sched-when {
          display: block;
          margin-top: 4px;
          font-size: 10.5px;
          line-height: 1.3;
          color: var(--color-text-faint, #64748b);
          white-space: nowrap;
        }
        .ab-queue {
          margin-bottom: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(37, 99, 235, 0.28);
          background: rgba(37, 99, 235, 0.05);
        }
        .ab-queue-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text, #0f172a);
        }
        .ab-queue-list {
          display: grid;
          gap: 6px;
        }
        .ab-queue-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 12px;
          align-items: center;
          padding: 8px 10px;
          border-radius: 8px;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          font-size: 12.5px;
        }
        .dark .ab-queue-row,
        [data-theme="dark"] .ab-queue-row {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(148, 163, 184, 0.2);
        }
        .ab-queue-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
          color: var(--color-text, #0f172a);
        }
        .ab-queue-when {
          color: #1d4ed8;
          font-weight: 600;
          white-space: nowrap;
        }
        .dark .ab-queue-when,
        [data-theme="dark"] .ab-queue-when {
          color: #93c5fd;
        }
        .ab-queue-in {
          color: var(--color-text-faint, #64748b);
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .ab-queue-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 2px;
          }
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
            {items.filter((b) => blogStatus(b, now) === "live").length}
          </div>
        </div>
        <div className="ab-stat-card">
          <span className="ab-stat-label">Scheduled</span>
          <div className="ab-stat-value sched">{scheduledQueue.length}</div>
        </div>
        <div className="ab-stat-card">
          <span className="ab-stat-label">Drafts</span>
          <div className="ab-stat-value draft">
            {items.filter((b) => blogStatus(b, now) === "draft").length}
          </div>
        </div>
        <div className="ab-stat-card">
          <span className="ab-stat-label">Categories</span>
          <div className="ab-stat-value cat">{categories.length}</div>
        </div>
      </div>

      {/* Publishing queue */}
      {scheduledQueue.length > 0 && (
        <div className="ab-queue">
          <div className="ab-queue-head">
            <CalendarClock size={15} color="#2563eb" /> Scheduled to publish ({scheduledQueue.length})
          </div>
          <div className="ab-queue-list">
            {scheduledQueue.map((b) => (
              <div className="ab-queue-row" key={b.id}>
                <button
                  type="button"
                  className="ab-queue-title"
                  onClick={() => startEdit(b)}
                  style={{ border: 0, background: "none", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}
                  title="Edit or reschedule"
                >
                  {b.title}
                </button>
                <span className="ab-queue-when">{formatSchedule(b.publish_at)}</span>
                <span className="ab-queue-in">{timeUntil(b.publish_at, now)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <option value="scheduled">Scheduled</option>
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
                        {(b.created_at || b.updated_at) && (
                          <span style={{ whiteSpace: "nowrap", color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Calendar size={11} />
                            {new Date((b.created_at || b.updated_at)!).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        )}
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
                      {(() => {
                        const st = blogStatus(b, now);
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => togglePublished(b)}
                              className={`ab-status-btn ${st}`}
                              title={
                                st === "scheduled"
                                  ? `Goes live ${formatSchedule(b.publish_at)}. Click to unschedule.`
                                  : st === "live"
                                    ? "Live. Click to move back to draft."
                                    : "Draft. Click to publish now."
                              }
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background:
                                    st === "live" ? "#34d399" : st === "scheduled" ? "#3b82f6" : "#fbbf24",
                                  display: "inline-block"
                                }}
                              />
                              <span>{st === "live" ? "Live" : st === "scheduled" ? "Scheduled" : "Draft"}</span>
                            </button>
                            {st === "scheduled" && (
                              <span className="ab-sched-when">{formatScheduleShort(b.publish_at)}</span>
                            )}
                          </>
                        );
                      })()}
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
                <Eye size={15} color={activeTab === "preview" ? "#34d399" : "#94a3b8"} /> SEO Analysis
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

                    {/* Author, Article Date & Position */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: 14 }}>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={13} color="#38bdf8" /> Article Date
                          </span>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, article_date: getTodayDateStr() }))}
                            style={{
                              fontSize: 11,
                              color: "#10b981",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              fontWeight: 600
                            }}
                          >
                            Set to Today
                          </button>
                        </div>
                        <input
                          type="date"
                          value={form.article_date}
                          onChange={(e) => setForm((f) => ({ ...f, article_date: e.target.value }))}
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

                    {/* Featured image — upload, paste a link, or reuse one */}
                    <div className="ab-box-section">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "block", marginBottom: 8 }}>
                        Featured image
                      </span>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                        {form.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={resolveMediaUrl(form.image_url)}
                            alt={form.image_alt || "Cover preview"}
                            style={{ width: 168, height: 105, objectFit: "cover", borderRadius: 9, border: "1px solid rgba(255,255,255,0.15)", background: "#0f172a" }}
                            onLoad={() => setCoverUploadError(null)}
                            onError={() =>
                              setCoverUploadError(
                                "That image could not be loaded. Check the URL, or upload the file instead."
                              )
                            }
                          />
                        ) : (
                          <div style={{ width: 168, height: 105, borderRadius: 9, border: "1px dashed rgba(148,163,184,0.4)", display: "grid", placeItems: "center", color: "#64748b", fontSize: 11.5, textAlign: "center", padding: 8 }}>
                            No image yet
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 240, display: "grid", gap: 8 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setCoverPickerOpen(true)}
                            >
                              {form.image_url ? "Replace image" : "Upload or choose image"}
                            </button>
                            {form.image_url && (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setForm((f) => ({ ...f, image_url: "", image_alt: "" }))}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                              Image URL — upload above, or paste any link
                            </span>
                            <input
                              value={form.image_url}
                              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                              placeholder="https://example.com/cover.jpg  or  /images/blogs/post.jpg"
                              className="ab-form-input"
                              style={{ fontSize: 12 }}
                            />
                          </label>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                              Alt text — describes the image to Google and screen readers
                            </span>
                            <input
                              value={form.image_alt}
                              onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
                              placeholder="e.g. Advisor reviewing a portfolio allocation chart"
                              className="ab-form-input"
                              style={{ fontSize: 12 }}
                            />
                          </label>
                        </div>
                      </div>
                      {coverUploadError && (
                        <span style={{ fontSize: 12, color: "#f87171" }}>{coverUploadError}</span>
                      )}
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

                    {/* Article body — visual editor, Code view behind a toggle */}
                    <div style={{ display: "grid", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>
                        Article body
                      </span>
                      <RichTextEditor
                        value={form.body}
                        onChange={(html) => setForm((f) => ({ ...f, body: html }))}
                        placeholder="Write the article here. Use the toolbar for headings, lists, quotes, links and images."
                      />
                    </div>

                    {/* Publishing: draft / publish now / schedule */}
                    <PublishControls
                      mode={form.publish_mode}
                      scheduleAt={form.schedule_at}
                      isLiveAlready={Boolean(
                        form.id && blogStatus(items.find((x) => x.id === form.id) || {}, now) === "live"
                      )}
                      onModeChange={(m) =>
                        setForm((f) => ({
                          ...f,
                          publish_mode: m,
                          published: m !== "draft",
                          // Pre-fill tomorrow 9 AM the first time Schedule is picked.
                          schedule_at:
                            m === "schedule" && !f.schedule_at
                              ? (() => {
                                  const d = new Date();
                                  d.setDate(d.getDate() + 1);
                                  d.setHours(9, 0, 0, 0);
                                  return toLocalInput(d.toISOString());
                                })()
                              : f.schedule_at
                        }))
                      }
                      onScheduleChange={(v) => setForm((f) => ({ ...f, schedule_at: v }))}
                    />
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

                    {/* Secondary keywords */}
                    <label style={{ display: "grid", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)" }}>
                        Secondary keywords{" "}
                        <em style={{ fontWeight: 500, fontStyle: "normal", color: "#94a3b8" }}>
                          &mdash; comma separated, checked against the body
                        </em>
                      </span>
                      <input
                        value={form.secondary_keywords}
                        onChange={(e) => setForm((f) => ({ ...f, secondary_keywords: e.target.value }))}
                        placeholder="portfolio management services, pms minimum investment"
                        className="ab-form-input"
                      />
                    </label>

                    {/* Social overrides */}
                    <div className="ab-box-section">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Share2 size={14} color="#38bdf8" /> Social sharing
                      </span>
                      <p style={{ margin: "0 0 10px", fontSize: 11.5, color: "#94a3b8" }}>
                        Leave any of these blank and it falls back to the SEO title, description and featured image.
                      </p>
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Facebook / LinkedIn title</span>
                            <input
                              value={form.og_title}
                              onChange={(e) => setForm((f) => ({ ...f, og_title: e.target.value }))}
                              placeholder={form.meta_title || form.title || "Share title"}
                              className="ab-form-input"
                              style={{ fontSize: 12 }}
                            />
                          </label>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>X / Twitter title</span>
                            <input
                              value={form.twitter_title}
                              onChange={(e) => setForm((f) => ({ ...f, twitter_title: e.target.value }))}
                              placeholder={form.meta_title || form.title || "Share title"}
                              className="ab-form-input"
                              style={{ fontSize: 12 }}
                            />
                          </label>
                        </div>
                        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Facebook / LinkedIn description</span>
                            <textarea
                              rows={2}
                              value={form.og_description}
                              onChange={(e) => setForm((f) => ({ ...f, og_description: e.target.value }))}
                              placeholder={form.meta_description || form.excerpt || "Share description"}
                              className="ab-form-textarea"
                              style={{ fontSize: 12 }}
                            />
                          </label>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>X / Twitter description</span>
                            <textarea
                              rows={2}
                              value={form.twitter_description}
                              onChange={(e) => setForm((f) => ({ ...f, twitter_description: e.target.value }))}
                              placeholder={form.meta_description || form.excerpt || "Share description"}
                              className="ab-form-textarea"
                              style={{ fontSize: 12 }}
                            />
                          </label>
                        </div>
                        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>OpenGraph image URL</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <input
                                value={form.og_image}
                                onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
                                placeholder={form.image_url || "Falls back to the featured image"}
                                className="ab-form-input"
                                style={{ fontSize: 12 }}
                              />
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSocialPicker("og")}>
                                Pick
                              </button>
                            </div>
                          </label>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>X / Twitter image URL</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <input
                                value={form.twitter_image}
                                onChange={(e) => setForm((f) => ({ ...f, twitter_image: e.target.value }))}
                                placeholder={form.og_image || form.image_url || "Falls back to OpenGraph"}
                                className="ab-form-input"
                                style={{ fontSize: 12 }}
                              />
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSocialPicker("tw")}>
                                Pick
                              </button>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Search-engine directives */}
                    <div className="ab-box-section">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #ffffff)", display: "block", marginBottom: 10 }}>
                        Advanced
                      </span>
                      <label style={{ display: "grid", gap: 4, maxWidth: 260 }}>
                        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Schema type</span>
                        <select
                          value={form.schema_type}
                          onChange={(e) => setForm((f) => ({ ...f, schema_type: e.target.value }))}
                          className="ab-form-input"
                          style={{ fontSize: 12 }}
                        >
                          <option value="BlogPosting">BlogPosting</option>
                          <option value="Article">Article</option>
                          <option value="NewsArticle">NewsArticle</option>
                          <option value="AnalysisNewsArticle">AnalysisNewsArticle</option>
                        </select>
                      </label>
                      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                        {([
                          ["robots_noindex", "No-index \u2014 keep this post out of search results"],
                          ["robots_nofollow", "No-follow \u2014 do not pass authority through its links"],
                          ["pillar_content", "Pillar content \u2014 a cornerstone post other articles link to"]
                        ] as const).map(([key, label]) => (
                          <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={form[key]}
                              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                              style={{ width: 15, height: 15, accentColor: "#38bdf8" }}
                            />
                            <span style={{ fontSize: 12.5, color: "#cbd5e1" }}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
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

                    {/* Social share previews — Facebook/LinkedIn and X */}
                    <div className="ab-box-section">
                      <h4 style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 700, color: "var(--color-text, #ffffff)" }}>
                        Social share preview
                      </h4>
                      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                        {([
                          {
                            key: "og",
                            badge: "Facebook / LinkedIn",
                            img: form.og_image || form.image_url,
                            head: form.og_title || form.meta_title || form.title,
                            body: form.og_description || form.meta_description || form.excerpt
                          },
                          {
                            key: "tw",
                            badge: "X / Twitter",
                            img: form.twitter_image || form.og_image || form.image_url,
                            head: form.twitter_title || form.meta_title || form.title,
                            body: form.twitter_description || form.meta_description || form.excerpt
                          }
                        ] as const).map((card) => (
                          <div
                            key={card.key}
                            style={{
                              border: "1px solid rgba(148,163,184,0.25)",
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "#1f2937"
                            }}
                          >
                            {card.img ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={resolveMediaUrl(card.img)}
                                alt=""
                                style={{ width: "100%", height: 132, objectFit: "cover", display: "block" }}
                              />
                            ) : (
                              <div style={{ height: 132, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11.5, background: "#111827" }}>
                                No share image
                              </div>
                            )}
                            <div style={{ padding: "10px 12px" }}>
                              <div style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>
                                {card.badge} · finvoq.com
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.35, marginBottom: 3 }}>
                                {card.head || "Untitled post"}
                              </div>
                              <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {card.body || "Add a description so shares read well."}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Full Rank-Math-style analysis */}
                    <SeoPanel report={report} />
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="ab-modal-foot">
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {form.publish_mode === "draft"
                    ? "🟡 Saving as draft"
                    : form.publish_mode === "schedule"
                      ? fromLocalInput(form.schedule_at)
                        ? `🔵 Scheduled for ${formatSchedule(fromLocalInput(form.schedule_at))}`
                        : "🔵 Pick a go-live time"
                      : "🟢 Ready to publish live"}
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
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={saveAsDraft}
                    disabled={submitting}
                    style={{
                      minWidth: 120,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      borderColor: "#f59e0b",
                      color: "#f59e0b"
                    }}
                    title="Save the post without publishing it live"
                  >
                    <Save size={14} />
                    {submitting ? "Saving…" : "Save as Draft"}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                    style={{ minWidth: 110 }}
                  >
                    {submitting
                      ? "Saving…"
                      : form.publish_mode === "schedule"
                        ? "Schedule Post"
                        : form.publish_mode === "draft"
                          ? "Save Draft"
                          : form.id
                            ? "Update Post & SEO"
                            : "Publish Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured image chooser */}
      <MediaPicker
        open={coverPickerOpen}
        title="Featured image"
        initialAlt={form.image_alt}
        onClose={() => setCoverPickerOpen(false)}
        onChoose={({ url, alt }) => {
          setCoverUploadError(null);
          setForm((f) => ({ ...f, image_url: url, image_alt: alt || f.image_alt }));
          setCoverPickerOpen(false);
        }}
      />

      {/* Social share image chooser, shared by both networks */}
      <MediaPicker
        open={socialPicker !== null}
        title={socialPicker === "tw" ? "X / Twitter share image" : "OpenGraph share image"}
        onClose={() => setSocialPicker(null)}
        onChoose={({ url }) => {
          setForm((f) =>
            socialPicker === "tw" ? { ...f, twitter_image: url } : { ...f, og_image: url }
          );
          setSocialPicker(null);
        }}
      />
    </div>
  );
}

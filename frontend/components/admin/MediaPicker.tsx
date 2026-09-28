"use client";

/**
 * WordPress-style media chooser.
 *
 * Three ways in, because that is what people expect: drop/browse a file,
 * paste a URL from somewhere else, or pick something already uploaded. The
 * upload goes straight to the media endpoint rather than waiting for the post
 * to be saved, so a picture can be dropped into a draft that does not exist
 * yet.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Link2, Trash2, UploadCloud, X } from "lucide-react";
import { apiFetch, apiPostJSON, apiUrl } from "@/lib/api";
import { compressImageForUpload } from "@/lib/imageCompress";
import "./media-picker.css";

export type MediaChoice = { url: string; alt: string };

type MediaItem = {
  filename: string;
  url: string;
  size: number;
  sizeLabel: string;
  uploadedAt: string;
};

/**
 * Absolute URLs belong to somebody else's host and must be left alone;
 * only our own `/api/...` and `/images/...` paths get the API base.
 */
export function resolveMediaUrl(url: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u) || u.startsWith("data:") || u.startsWith("blob:")) return u;
  return apiUrl(u.startsWith("/") ? u : `/${u}`);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Could not read that file."));
    r.readAsDataURL(file);
  });
}

/** Uploads one file and returns its served URL. Shared with the cover field. */
export async function uploadMediaFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That is not an image file.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Images must be under 15 MB.");
  }
  // Automatically compress and resize high-res images in browser before upload
  // so payloads never exceed reverse proxy (Nginx) body size limits.
  const dataBase64 = await compressImageForUpload(file);
  try {
    const res = await apiPostJSON<{ ok: boolean; url: string }>(
      "/api/blog-images/media",
      { dataBase64, filename: file.name }
    );
    return res.url;
  } catch (err: any) {
    if (err?.status === 413) {
      throw new Error(
        "Image too large for the server proxy (413). Please choose a slightly smaller image or update client_max_body_size in Nginx on the VPS."
      );
    }
    throw err;
  }
}

export default function MediaPicker({
  open,
  title = "Select or upload image",
  initialAlt = "",
  requireAlt = false,
  onClose,
  onChoose
}: {
  open: boolean;
  title?: string;
  initialAlt?: string;
  /** Body images should always be described; a cover can defer. */
  requireAlt?: boolean;
  onClose: () => void;
  onChoose: (choice: MediaChoice) => void;
}) {
  const [tab, setTab] = useState<"upload" | "url" | "library">("upload");
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState("");
  const [alt, setAlt] = useState(initialAlt);
  const [urlDraft, setUrlDraft] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const loadLibrary = useCallback(async () => {
    setLoadingLib(true);
    try {
      const r = await apiFetch<{ items: MediaItem[] }>("/api/blog-images/media");
      setLibrary(r.items || []);
    } catch {
      setLibrary([]);
    } finally {
      setLoadingLib(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setChosen("");
    setUrlDraft("");
    setAlt(initialAlt);
    setTab("upload");
    loadLibrary();
  }, [open, initialAlt, loadLibrary]);

  // Escape closes, matching every other modal in the admin.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const doUpload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const url = await uploadMediaFile(file);
      setChosen(url);
      if (!alt) {
        // A filename is a poor caption but a decent starting point.
        setAlt(
          file.name
            .replace(/\.[^.]*$/, "")
            .replace(/[-_]+/g, " ")
            .trim()
        );
      }
      await loadLibrary();
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const canConfirm = Boolean(chosen) && (!requireAlt || alt.trim().length > 0);

  return (
    <div className="mp-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mp-panel">
        <div className="mp-head">
          <h3>{title}</h3>
          <button type="button" className="mp-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="mp-tabs" role="tablist">
          {(
            [
              ["upload", "Upload", UploadCloud],
              ["url", "From URL", Link2],
              ["library", "Media library", ImageIcon]
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`mp-tab${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="mp-body">
          {tab === "upload" && (
            <div
              className={`mp-drop${dragging ? " is-drag" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) doUpload(f);
              }}
              onClick={() => fileRef.current?.click()}
            >
              <UploadCloud size={28} />
              <strong>{busy ? "Processing & Uploading…" : "Drop an image here, or click to browse"}</strong>
              <span>PNG, JPG, GIF or WebP · up to 10 MB (Auto-optimized)</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) doUpload(f);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {tab === "url" && (
            <div className="mp-url">
              <label>
                <span>Image URL</span>
                <input
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  onBlur={() => setChosen(urlDraft.trim())}
                  placeholder="https://example.com/photo.jpg  or  /images/blogs/my-post.jpg"
                  autoFocus
                />
              </label>
              <button
                type="button"
                className="mp-use"
                onClick={() => setChosen(urlDraft.trim())}
                disabled={!urlDraft.trim()}
              >
                Use this URL
              </button>
              <p className="mp-hint">
                Paste a link from anywhere, or a path already on this site. Nothing is
                re-uploaded — the post points straight at it.
              </p>
            </div>
          )}

          {tab === "library" && (
            <div className="mp-lib">
              {loadingLib && <p className="mp-empty">Loading…</p>}
              {!loadingLib && !library.length && (
                <p className="mp-empty">Nothing uploaded yet. Use the Upload tab.</p>
              )}
              <div className="mp-grid">
                {library.map((m) => (
                  <button
                    type="button"
                    key={m.filename}
                    className={`mp-thumb${chosen === m.url ? " is-chosen" : ""}`}
                    onClick={() => setChosen(m.url)}
                    title={`${m.filename} · ${m.sizeLabel}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveMediaUrl(m.url)} alt="" loading="lazy" />
                    <span
                      className="mp-thumb-del"
                      role="button"
                      tabIndex={-1}
                      aria-label={`Delete ${m.filename}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm(`Delete ${m.filename} from the library?`)) return;
                        try {
                          await apiFetch(
                            `/api/blog-images/media/${encodeURIComponent(m.filename)}`,
                            { method: "DELETE" }
                          );
                          if (chosen === m.url) setChosen("");
                          await loadLibrary();
                        } catch {
                          setError("Could not delete that file.");
                        }
                      }}
                    >
                      <Trash2 size={12} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="mp-error">{error}</p>}

          {chosen && (
            <div className="mp-selected">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveMediaUrl(chosen)} alt="" />
              <div className="mp-selected-meta">
                <code>{chosen}</code>
                <label>
                  <span>
                    Alt text{" "}
                    {requireAlt ? (
                      <b className="mp-req">required</b>
                    ) : (
                      <em>— describes the image to search engines and screen readers</em>
                    )}
                  </span>
                  <input
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="e.g. Chart showing PMS returns versus the Nifty 500"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mp-foot">
          <button type="button" className="mp-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="mp-btn mp-btn-primary"
            disabled={!canConfirm || busy}
            onClick={() => onChoose({ url: chosen, alt: alt.trim() })}
          >
            {requireAlt && chosen && !alt.trim() ? "Add alt text to continue" : "Use image"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PRODUCTS } from "@/lib/productContent";
import { apiFetch } from "@/lib/api";

type VariantMeta = { size?: number; updatedAt?: string; updatedBy?: string };
type Entry = { base?: VariantMeta; light?: VariantMeta; dark?: VariantMeta };
type Manifest = Record<string, Entry>;
type Variant = "light" | "dark";

const PRODUCT_LIST = Object.values(PRODUCTS).map((p) => ({ slug: p.slug, label: p.label }));

function prettySize(n?: number) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * The instruction block the admin pastes into ChatGPT/Claude together with
 * their PDF. The sample factsheet is appended at the end so the whole thing
 * is one copy — no assembling required by the person using it.
 */
function buildPrompt(productLabel: string, template: string) {
  return `I am going to give you a PDF factsheet and a sample HTML file.

Your job: rebuild the sample HTML file using the data from my PDF, and give me back one complete HTML file.

Rules:
1. Keep the sample's design, layout, colours, fonts and structure EXACTLY as they are. Do not restyle anything.
2. Replace only the CONTENT — the heading, the "as on" date, and all the data rows — with the real data from my PDF.
3. In the sample, the data lives in a JavaScript array near the bottom called FV_CATEGORIES, in the format
   [name, AUM, 1Y%, 3Y%, 5Y%, SinceInception%]. Put my PDF's data into that same array in that same format.
   Use null (not 0, not "-") wherever the PDF has no value.
4. Update the headline, the sub-heading and the "Performance as on ..." date to match my PDF.
5. Copy the disclaimer text at the bottom exactly as it appears in my PDF.
6. Do not add any new sections, logos, branding or commentary that is not in my PDF.
7. It must stay fully responsive on mobile — do not remove any @media rules.
8. Give me the ENTIRE file as one single HTML code block, starting at <!DOCTYPE html> and ending at </html>.
   Do not split it, do not summarise it, do not leave any "..." placeholders.

This factsheet is for: ${productLabel}

Here is the sample HTML file to use as the template:

${template}`;
}

export default function AdminFactsheetHtmlPage() {
  const [manifest, setManifest] = useState<Manifest>({});
  const [defaults, setDefaults] = useState<string[]>([]);
  const [slug, setSlug] = useState(PRODUCT_LIST[0]?.slug || "mutual-funds");
  const [variant, setVariant] = useState<Variant>("light");
  const [html, setHtml] = useState("");
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: Manifest; defaults: string[] }>("/api/factsheet-html");
      setManifest(data.items || {});
      setDefaults(data.defaults || []);
    } catch {
      setManifest({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    apiFetch<{ html: string }>("/api/factsheet-html/__template")
      .then((d) => setTemplate(d.html || ""))
      .catch(() => setTemplate(""));
  }, []);

  // Load what's currently live for the selected product + theme variant.
  useEffect(() => {
    let cancelled = false;
    setMsg(null);
    setError(null);
    apiFetch<{ exists: boolean; html?: string; servedVariant?: string }>(
      `/api/factsheet-html/${slug}?theme=${variant}`
    )
      .then((d) => {
        if (!cancelled) setHtml(d.html || "");
      })
      .catch(() => {
        if (!cancelled) setHtml("");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, variant]);

  const product = PRODUCT_LIST.find((p) => p.slug === slug);
  const entry = manifest[slug];
  const variantMeta = entry?.[variant];
  const hasDefault = defaults.includes(slug);
  // Does this product have ANY custom upload (base or either variant)?
  const hasAnyCustom = !!entry && (!!entry.base || !!entry.light || !!entry.dark);

  const onCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildPrompt(product?.label || slug, template));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Couldn't copy automatically — open the prompt and copy it manually.");
    }
  };

  const onSave = async () => {
    setError(null);
    setMsg(null);
    if (!html.trim()) {
      setError("Paste the HTML code first.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<{ ok: boolean } & VariantMeta>(`/api/factsheet-html/${slug}`, {
        method: "POST",
        body: JSON.stringify({ html, variant }),
        headers: { "Content-Type": "application/json" }
      });
      setManifest((m) => ({
        ...m,
        [slug]: { ...(m[slug] || {}), [variant]: res }
      }));
      setMsg(
        `Saved the ${variant} factsheet for ${product?.label}. It's now live for visitors in ${variant} mode.`
      );
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!confirm(`Remove the ${variant} HTML factsheet for “${product?.label}”?`)) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await apiFetch(`/api/factsheet-html/${slug}?variant=${variant}`, { method: "DELETE" });
      setManifest((m) => {
        const next = { ...m };
        const e = { ...(next[slug] || {}) };
        delete e[variant];
        if (Object.keys(e).length === 0) delete next[slug];
        else next[slug] = e;
        return next;
      });
      setMsg(`Removed the ${variant} factsheet. Visitors in ${variant} mode now see the fallback.`);
      const d = await apiFetch<{ exists: boolean; html?: string }>(
        `/api/factsheet-html/${slug}?theme=${variant}`
      ).catch(() => null);
      setHtml(d?.html || "");
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>HTML Factsheets</h1>
          <p className="admin-page-sub">
            Paste an HTML factsheet for any product and it appears on that product&apos;s page
            straight away — no code changes. Use the prompt below to generate the HTML from a
            PDF with ChatGPT or Claude.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={reload}>
          Refresh
        </button>
      </header>

      {msg && <div className="admin-success">{msg}</div>}
      {error && <div className="admin-error">{error}</div>}

      {/* ── How-to ── */}
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: 10 }}>How to make a factsheet</h2>
        <ol style={{ paddingLeft: 20, margin: "0 0 16px", lineHeight: 1.85, fontSize: ".9rem" }}>
          <li>Pick the product below.</li>
          <li>
            Click <strong>Copy prompt</strong> — this copies the instructions <em>and</em> the sample
            factsheet together.
          </li>
          <li>Open ChatGPT or Claude, paste the prompt, and attach your PDF factsheet.</li>
          <li>It replies with a full HTML file. Copy that code.</li>
          <li>
            Paste it in the box below and click <strong>Save &amp; publish</strong>.
          </li>
        </ol>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCopyPrompt}
            disabled={!template}
          >
            {copied ? "✓ Prompt copied" : "Copy prompt"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowPrompt((s) => !s)}
            disabled={!template}
          >
            {showPrompt ? "Hide prompt" : "View prompt"}
          </button>
          {!template && (
            <span style={{ fontSize: ".82rem", color: "var(--color-text-muted)" }}>
              Loading sample template…
            </span>
          )}
        </div>
        {showPrompt && template && (
          <textarea
            readOnly
            value={buildPrompt(product?.label || slug, template)}
            onFocus={(e) => e.currentTarget.select()}
            style={{
              width: "100%",
              height: 260,
              marginTop: 14,
              padding: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: ".76rem",
              lineHeight: 1.5,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              resize: "vertical"
            }}
          />
        )}
      </div>

      {/* ── Editor ── */}
      <div className="admin-card">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            marginBottom: 14
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: ".8rem", fontWeight: 600 }}>Product</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
                fontFamily: "inherit",
                fontSize: ".9rem"
              }}
            >
              {PRODUCT_LIST.map((p) => {
                const e = manifest[p.slug];
                const tags = e
                  ? [e.light && "L", e.dark && "D", e.base && "•"].filter(Boolean).join("")
                  : "";
                return (
                  <option key={p.slug} value={p.slug}>
                    {p.label}
                    {tags ? `  ● ${tags}` : defaults.includes(p.slug) ? "  ○ built-in" : ""}
                  </option>
                );
              })}
            </select>
          </label>

          {/* Light / Dark variant tabs */}
          <div className="fsv-tabs" role="tablist" aria-label="Theme variant">
            {(["light", "dark"] as Variant[]).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={variant === v}
                className="fsv-tab"
                data-active={variant === v}
                onClick={() => setVariant(v)}
              >
                {v === "light" ? "☀ Light" : "🌙 Dark"}
                {entry?.[v] ? <span className="fsv-dot" title="uploaded" /> : null}
              </button>
            ))}
          </div>

          <a
            href={`/products/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "auto", fontSize: ".84rem", fontWeight: 600 }}
          >
            View product page ↗
          </a>
        </div>

        <div style={{ marginBottom: 12, fontSize: ".82rem", color: "var(--color-text-muted)" }}>
          {loading
            ? "Loading…"
            : variantMeta
            ? `${variant[0].toUpperCase() + variant.slice(1)} variant · ${prettySize(variantMeta.size)} · updated ${
                variantMeta.updatedAt ? new Date(variantMeta.updatedAt).toLocaleString() : "—"
              }${variantMeta.updatedBy ? ` by ${variantMeta.updatedBy}` : ""}`
            : entry?.base
            ? `No dedicated ${variant} version — visitors in ${variant} mode see the shared upload. Paste one here to override it.`
            : hasDefault
            ? `No ${variant} version — ${variant}-mode visitors see the built-in factsheet.`
            : `No ${variant} factsheet yet — ${variant}-mode visitors see nothing until you add one.`}
        </div>

        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          placeholder="Paste the full HTML code here — starting with <!DOCTYPE html> and ending with </html>"
          style={{
            width: "100%",
            height: 380,
            padding: 14,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: ".78rem",
            lineHeight: 1.5,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            resize: "vertical",
            whiteSpace: "pre",
            overflowWrap: "normal",
            overflowX: "auto"
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginTop: 12
          }}
        >
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={busy}>
            {busy ? "Saving…" : `Save & publish (${variant})`}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setPreview(html)}
            disabled={!html.trim()}
          >
            Preview
          </button>
          {variantMeta && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ color: "#dc2626", borderColor: "#fca5a5" }}
              onClick={onRemove}
              disabled={busy}
            >
              Remove {variant} version
            </button>
          )}
          <span style={{ fontSize: ".78rem", color: "var(--color-text-muted)" }}>
            {prettySize(new Blob([html]).size)} · max 2 MB
          </span>
        </div>
      </div>

      {/* ── Preview modal ── */}
      {preview !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            padding: 24
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              maxWidth: 1280,
              width: "100%",
              margin: "0 auto"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: "1px solid #e5e7eb",
                background: "#fafafa"
              }}
            >
              <strong style={{ fontSize: ".9rem", color: "#111" }}>
                Preview — {product?.label}
              </strong>
              <button type="button" className="btn btn-outline" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            {/* Same sandbox as the live site, so the preview is honest. */}
            <iframe
              title="Factsheet preview"
              srcDoc={preview}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              style={{ flex: 1, width: "100%", border: 0, background: "#fff" }}
            />
          </div>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: ".82rem", color: "var(--color-text-muted)" }}>
        Factsheets run in a sandboxed frame, so their styling can never affect the rest of the
        site. Mutual Funds ships with a built-in factsheet; saving your own replaces it, and
        removing yours brings the built-in one back.
      </p>
    </div>
  );
}

"use client";

/**
 * Visual editor for the blog body — the WordPress "Visual / Text" pair.
 *
 * You format with the toolbar instead of typing HTML, and flip to Code when
 * you want the markup. The document is still plain HTML underneath, which is
 * what the public blog page already renders, so nothing downstream changes.
 *
 * `document.execCommand` is formally deprecated but is the only rich-text
 * primitive every browser implements without a dependency, and it degrades
 * predictably. The awkward part it leaves us is caret management: React must
 * not rewrite the contenteditable while someone is typing in it, so the
 * incoming `value` is only pushed into the DOM when it genuinely differs from
 * what the editor last emitted.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Code2,
  Eye,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2
} from "lucide-react";
import MediaPicker, { type MediaChoice, resolveMediaUrl } from "./MediaPicker";
import "./rich-text-editor.css";

const ALLOWED_TAGS = new Set([
  "P", "BR", "H2", "H3", "H4", "H5", "UL", "OL", "LI", "STRONG", "B", "EM",
  "I", "U", "S", "STRIKE", "A", "BLOCKQUOTE", "IMG", "HR", "FIGURE",
  "FIGCAPTION", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "CODE", "PRE",
  "SPAN", "DIV"
]);

const KEEP_ATTRS: Record<string, string[]> = {
  A: ["href", "title", "target", "rel"],
  IMG: ["src", "alt", "title", "width", "height"]
};

/**
 * Strip pasted markup back to the tags the blog template styles. Word and
 * Google Docs paste a mountain of inline styles and `<span>` soup that
 * otherwise ends up in the published post.
 */
function sanitizePaste(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) walk(child);

    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    const keep = KEEP_ATTRS[node.tagName] || [];
    for (const attr of Array.from(node.attributes)) {
      if (!keep.includes(attr.name.toLowerCase())) node.removeAttribute(attr.name);
    }
    // A bare span or div carries no meaning once its styling is gone.
    if ((node.tagName === "SPAN" || node.tagName === "DIV") && !node.attributes.length) {
      if (node.tagName === "DIV") {
        const p = doc.createElement("p");
        p.append(...Array.from(node.childNodes));
        node.replaceWith(p);
      } else {
        node.replaceWith(...Array.from(node.childNodes));
      }
    }
  };
  Array.from(doc.body.children).forEach(walk);
  return doc.body.innerHTML;
}

function wordsIn(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);
  /** What we last handed the parent — the yardstick for "did value change?". */
  const lastEmitted = useRef<string>(value);

  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [showLink, setShowLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [words, setWords] = useState(() => wordsIn(value));

  /* Push the parent's value in only when it is genuinely new, so typing
     never rewrites the node under the caret. */
  useEffect(() => {
    if (mode !== "visual") return;
    const el = editorRef.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    el.innerHTML = value || "";
    lastEmitted.current = value;
    setWords(wordsIn(value));
  }, [value, mode]);

  // Re-hydrate after a trip through Code view.
  useEffect(() => {
    if (mode !== "visual") return;
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || "";
      lastEmitted.current = value;
    }
  }, [mode, value]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastEmitted.current = html;
    setWords(wordsIn(html));
    onChange(html);
  }, [onChange]);

  const saveSelection = useCallback(() => {
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  /* Only falls back to the saved range when the live selection has left the
     editor — clicking a toolbar button keeps it, but typing in the link box
     does not, and restoring over a live selection would undo the user's
     highlight. */
  const restoreSelection = useCallback(() => {
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) return;
    const r = savedRange.current;
    if (!r || !sel) return;
    sel.removeAllRanges();
    sel.addRange(r);
  }, []);

  const exec = useCallback(
    (cmd: string, arg?: string) => {
      editorRef.current?.focus();
      restoreSelection();
      try {
        document.execCommand(cmd, false, arg);
      } catch {
        /* Command unsupported in this browser — leave the document alone. */
      }
      emit();
    },
    [emit, restoreSelection]
  );

  /** Drop an arbitrary node in at the caret. */
  const insertHtml = useCallback(
    (html: string) => {
      editorRef.current?.focus();
      restoreSelection();
      try {
        document.execCommand("insertHTML", false, html);
      } catch {
        if (editorRef.current) editorRef.current.innerHTML += html;
      }
      emit();
    },
    [emit, restoreSelection]
  );

  const applyLink = () => {
    const href = linkDraft.trim();
    if (!href) return;
    restoreSelection();
    const sel = window.getSelection();
    const text = sel?.toString() || href;
    const rel = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
    insertHtml(`<a href="${href.replace(/"/g, "&quot;")}"${rel}>${text}</a>`);
    setShowLink(false);
    setLinkDraft("");
  };

  const onPickImage = (choice: MediaChoice) => {
    setPickerOpen(false);
    const src = choice.url.replace(/"/g, "&quot;");
    const alt = (choice.alt || "").replace(/"/g, "&quot;");
    insertHtml(
      `<figure><img src="${src}" alt="${alt}" />` +
        (choice.alt ? `<figcaption>${choice.alt}</figcaption>` : "") +
        `</figure><p><br /></p>`
    );
  };

  const Btn = ({
    icon: Icon,
    title,
    onClick,
    active
  }: {
    icon: typeof Bold;
    title: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      type="button"
      className={`rte-btn${active ? " is-on" : ""}`}
      title={title}
      aria-label={title}
      // mousedown, not click: click would blur the editor and lose the caret.
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <Icon size={15} />
    </button>
  );

  return (
    <div className="rte">
      <div className="rte-bar">
        <div className="rte-group">
          <Btn icon={Pilcrow} title="Paragraph" onClick={() => exec("formatBlock", "<p>")} />
          <Btn icon={Heading2} title="Heading 2" onClick={() => exec("formatBlock", "<h2>")} />
          <Btn icon={Heading3} title="Heading 3" onClick={() => exec("formatBlock", "<h3>")} />
          <Btn icon={Heading4} title="Heading 4" onClick={() => exec("formatBlock", "<h4>")} />
        </div>
        <div className="rte-group">
          <Btn icon={Bold} title="Bold (Ctrl+B)" onClick={() => exec("bold")} />
          <Btn icon={Italic} title="Italic (Ctrl+I)" onClick={() => exec("italic")} />
          <Btn icon={Underline} title="Underline (Ctrl+U)" onClick={() => exec("underline")} />
          <Btn icon={Strikethrough} title="Strikethrough" onClick={() => exec("strikeThrough")} />
        </div>
        <div className="rte-group">
          <Btn icon={List} title="Bulleted list" onClick={() => exec("insertUnorderedList")} />
          <Btn icon={ListOrdered} title="Numbered list" onClick={() => exec("insertOrderedList")} />
          <Btn icon={Quote} title="Quote" onClick={() => exec("formatBlock", "<blockquote>")} />
        </div>
        <div className="rte-group">
          <Btn
            icon={Link2}
            title="Insert link"
            onClick={() => {
              saveSelection();
              setShowLink((v) => !v);
            }}
            active={showLink}
          />
          <Btn icon={Link2Off} title="Remove link" onClick={() => exec("unlink")} />
          <Btn
            icon={ImageIcon}
            title="Insert image"
            onClick={() => {
              saveSelection();
              setPickerOpen(true);
            }}
          />
          <Btn
            icon={TableIcon}
            title="Insert 3-column table"
            onClick={() =>
              insertHtml(
                "<table><thead><tr><th>Column</th><th>Column</th><th>Column</th></tr></thead>" +
                  "<tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>" +
                  "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br /></p>"
              )
            }
          />
          <Btn
            icon={Minus}
            title="Divider"
            onClick={() => insertHtml("<hr /><p><br /></p>")}
          />
        </div>
        <div className="rte-group">
          <Btn icon={Undo2} title="Undo" onClick={() => exec("undo")} />
          <Btn icon={Redo2} title="Redo" onClick={() => exec("redo")} />
          <Btn
            icon={RemoveFormatting}
            title="Clear formatting"
            onClick={() => exec("removeFormat")}
          />
        </div>

        <div className="rte-spacer" />

        <div className="rte-modes">
          <button
            type="button"
            className={`rte-mode${mode === "visual" ? " is-on" : ""}`}
            onClick={() => setMode("visual")}
          >
            <Eye size={13} /> Visual
          </button>
          <button
            type="button"
            className={`rte-mode${mode === "code" ? " is-on" : ""}`}
            onClick={() => {
              if (mode === "visual" && editorRef.current) emit();
              setMode("code");
            }}
          >
            <Code2 size={13} /> Code
          </button>
        </div>
      </div>

      {showLink && (
        <div className="rte-linkbar">
          <input
            autoFocus
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setShowLink(false);
            }}
            placeholder="https://example.com  or  /products/pms"
          />
          <label>
            <input
              type="checkbox"
              checked={linkNewTab}
              onChange={(e) => setLinkNewTab(e.target.checked)}
            />
            New tab
          </label>
          <button type="button" className="rte-link-apply" onClick={applyLink}>
            Add link
          </button>
          <button type="button" className="rte-link-cancel" onClick={() => setShowLink(false)}>
            Cancel
          </button>
        </div>
      )}

      {mode === "visual" ? (
        <div
          ref={editorRef}
          className="rte-canvas blog-body"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Article body"
          data-placeholder={placeholder || "Write your article…"}
          onInput={emit}
          onBlur={emit}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={(e) => {
            e.preventDefault();
            const html = e.clipboardData.getData("text/html");
            const text = e.clipboardData.getData("text/plain");
            if (html) {
              insertHtml(sanitizePaste(html));
            } else if (text) {
              // Blank lines become paragraphs, the way a paste should behave.
              const escaped = text
                .split(/\n{2,}/)
                .map(
                  (block) =>
                    `<p>${block
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/\n/g, "<br />")}</p>`
                )
                .join("");
              insertHtml(escaped);
            }
          }}
          onDrop={(e) => {
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("image/")) {
              // Route dropped files through the picker so they get alt text.
              e.preventDefault();
              saveSelection();
              setPickerOpen(true);
            }
          }}
        />
      ) : (
        <textarea
          className="rte-code"
          value={value}
          spellCheck={false}
          onChange={(e) => {
            lastEmitted.current = e.target.value;
            setWords(wordsIn(e.target.value));
            onChange(e.target.value);
          }}
          placeholder="<h2>Section heading</h2>\n<p>…</p>"
        />
      )}

      <div className="rte-foot">
        <span>
          {words} word{words === 1 ? "" : "s"}
        </span>
        <span>·</span>
        <span>{Math.max(1, Math.round(words / 200))} min read</span>
        <span className="rte-spacer" />
        <span className="rte-foot-hint">
          {mode === "visual"
            ? "Pasted formatting is cleaned automatically"
            : "Editing raw HTML"}
        </span>
      </div>

      <MediaPicker
        open={pickerOpen}
        title="Insert image into the article"
        requireAlt
        onClose={() => setPickerOpen(false)}
        onChoose={onPickImage}
      />
    </div>
  );
}

export { resolveMediaUrl };

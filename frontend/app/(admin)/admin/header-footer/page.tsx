"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ExternalLink,
  GripVertical,
  LayoutPanelTop,
  Link2,
  Menu,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import styles from "./page.module.css";

type Row = Record<string, string>;
type Section = Record<string, string | Row[]>;
type Content = Record<string, Section>;
type MenuItem = { label: string; href: string; children: Row[] };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const rows = (value: string | Row[] | undefined): Row[] =>
  Array.isArray(value) ? value : [];
const text = (value: string | Row[] | undefined): string =>
  typeof value === "string" ? value : "";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function menusFrom(content: Content): MenuItem[] {
  const top = rows(content.nav?.items);
  const children = rows(content.nav?.dropdown);
  return top.map((item) => ({
    label: item.label || "",
    href: item.href || "",
    children: children
      .filter(
        (child) =>
          (child.parent || "").trim().toLowerCase() ===
          (item.label || "").trim().toLowerCase()
      )
      .map((child) => ({ label: child.label || "", href: child.href || "" }))
  }));
}

export default function HeaderFooterPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<Content>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"header" | "footer" | "contact">("header");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "superadmin") return;
    apiFetch<{ content: Record<string, Content> }>("/api/content/schema")
      .then((result) => setDraft(clone(result.content?.global || {})))
      .catch((err) => setError(err?.message || "Could not load site navigation."))
      .finally(() => setLoading(false));
  }, [user?.role]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const menus = useMemo(() => menusFrom(draft), [draft]);
  const countLinks = menus.reduce((sum, item) => sum + item.children.length, 0);
  const footerCount = [1, 2, 3, 4].reduce(
    (sum, number) => sum + rows(draft.footerLinks?.[`col${number}`]).length,
    0
  );

  const change = (section: string, field: string, value: string | Row[]) => {
    setDraft((current) => ({
      ...current,
      [section]: { ...(current[section] || {}), [field]: value }
    }));
    setDirty(true);
    setMessage(null);
  };

  const setMenus = (next: MenuItem[]) => {
    setDraft((current) => ({
      ...current,
      nav: {
        ...(current.nav || {}),
        items: next.map(({ label, href }) => ({ label, href })),
        dropdown: next.flatMap((item) =>
          item.children.map((child) => ({
            parent: item.label,
            label: child.label || "",
            href: child.href || ""
          }))
        )
      }
    }));
    setDirty(true);
    setMessage(null);
  };

  const save = async () => {
    const invalidMenu = menus.some(
      (item) =>
        !item.label.trim() ||
        !item.href.trim() ||
        item.children.some((child) => !child.label?.trim() || !child.href?.trim())
    );
    const invalidFooter = [1, 2, 3, 4].some((number) =>
      rows(draft.footerLinks?.[`col${number}`]).some(
        (item) => !item.label?.trim() || !item.href?.trim()
      )
    );
    if (invalidMenu || invalidFooter) {
      setError("Every visible link needs both a label and a destination before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetch<{ content: Content }>("/api/content/global", {
        method: "PUT",
        body: JSON.stringify({ content: draft })
      });
      setDraft(clone(result.content));
      setDirty(false);
      setMessage("Header and footer saved. The public website is now up to date.");
    } catch (err: any) {
      setError(err?.message || "Could not save header and footer.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Restore the original header and footer? All custom changes will be removed.")) return;
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetch<{ content: Content }>("/api/content/global", {
        method: "DELETE"
      });
      setDraft(clone(result.content));
      setDirty(false);
      setMessage("The original header and footer have been restored.");
    } catch (err: any) {
      setError(err?.message || "Could not restore the original settings.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "superadmin") {
    return (
      <div className="admin-no-access">
        <h1>Super-admin access required</h1>
        <p>Only a super admin can change the website header and footer.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><LayoutPanelTop size={15} /> Website structure</span>
          <h1>Header &amp; Footer</h1>
          <p>Manage navigation menus, dropdown pages, footer columns and contact details from one place.</p>
        </div>
        <div className={styles.heroActions}>
          <Link href="/about" target="_blank" className="btn btn-outline">
            Preview site <ExternalLink size={15} />
          </Link>
          <button className="btn btn-primary" onClick={save} disabled={!dirty || saving}>
            <Save size={16} /> {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </header>

      <div className={styles.metrics}>
        <div><strong>{menus.length}</strong><span>Header items</span></div>
        <div><strong>{countLinks}</strong><span>Dropdown pages</span></div>
        <div><strong>4</strong><span>Footer sections</span></div>
        <div><strong>{footerCount}</strong><span>Footer links</span></div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {message && <div className="admin-success">{message}</div>}

      <nav className={styles.tabs} aria-label="Header and footer settings">
        <button className={tab === "header" ? styles.activeTab : ""} onClick={() => setTab("header")}>
          <Menu size={17} /> Header navigation
        </button>
        <button className={tab === "footer" ? styles.activeTab : ""} onClick={() => setTab("footer")}>
          <LayoutPanelTop size={17} /> Footer sections
        </button>
        <button className={tab === "contact" ? styles.activeTab : ""} onClick={() => setTab("contact")}>
          <Link2 size={17} /> Contact &amp; social
        </button>
      </nav>

      {tab === "header" && (
        <div className={styles.stack}>
          <SectionCard
            title="Main navigation"
            description="Each card is a top-level page. Add as many dropdown pages as you need under Company, About, Products, or any other menu."
            action={
              <button className={styles.addButton} onClick={() => setMenus([...menus, { label: "New menu", href: "/", children: [] }])}>
                <Plus size={15} /> Add menu item
              </button>
            }
          >
            <div className={styles.menuList}>
              {menus.map((item, index) => (
                <div className={styles.menuCard} key={index}>
                  <div className={styles.menuTop}>
                    <GripVertical size={19} className={styles.grip} />
                    <div className={styles.twoInputs}>
                      <Field label="Menu label" value={item.label} onChange={(value) => {
                        const next = clone(menus); next[index].label = value; setMenus(next);
                      }} />
                      <Field label="Page / URL" value={item.href} onChange={(value) => {
                        const next = clone(menus); next[index].href = value; setMenus(next);
                      }} />
                    </div>
                    <ItemActions
                      index={index}
                      length={menus.length}
                      onMove={(direction) => setMenus(moveItem(menus, index, direction))}
                      onRemove={() => setMenus(menus.filter((_, itemIndex) => itemIndex !== index))}
                    />
                  </div>
                  <div className={styles.dropdownArea}>
                    <div className={styles.dropdownHead}>
                      <span><ChevronDown size={15} /> Dropdown pages <b>{item.children.length}</b></span>
                      <button onClick={() => {
                        const next = clone(menus);
                        next[index].children.push({ label: "New page", href: "/" });
                        setMenus(next);
                      }}><Plus size={14} /> Add page</button>
                    </div>
                    {item.children.length === 0 ? (
                      <p className={styles.empty}>No dropdown. This menu links directly to its page.</p>
                    ) : item.children.map((child, childIndex) => (
                      <div className={styles.linkRow} key={childIndex}>
                        <Field label="Page label" value={child.label || ""} onChange={(value) => {
                          const next = clone(menus); next[index].children[childIndex].label = value; setMenus(next);
                        }} />
                        <Field label="Page / URL" value={child.href || ""} onChange={(value) => {
                          const next = clone(menus); next[index].children[childIndex].href = value; setMenus(next);
                        }} />
                        <ItemActions
                          compact
                          index={childIndex}
                          length={item.children.length}
                          onMove={(direction) => {
                            const next = clone(menus);
                            next[index].children = moveItem(next[index].children, childIndex, direction);
                            setMenus(next);
                          }}
                          onRemove={() => {
                            const next = clone(menus);
                            next[index].children.splice(childIndex, 1);
                            setMenus(next);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!menus.length && <EmptyState text="The header has no menu pages. Add one to get started." />}
            </div>
          </SectionCard>

          <SectionCard title="Header account buttons" description="Control the logged-out actions shown on desktop and mobile.">
            <div className={styles.formGrid}>
              <Toggle label="Show login button" value={text(draft.nav?.loginEnabled) || "yes"} onChange={(value) => change("nav", "loginEnabled", value)} />
              <Field label="Login button label" value={text(draft.nav?.loginLabel)} onChange={(value) => change("nav", "loginLabel", value)} />
              <Toggle label="Show open-account button" value={text(draft.nav?.signupEnabled) || "yes"} onChange={(value) => change("nav", "signupEnabled", value)} />
              <Field label="Open-account label" value={text(draft.nav?.signupLabel)} onChange={(value) => change("nav", "signupLabel", value)} />
              <Field label="Open-account destination" value={text(draft.nav?.signupHref)} onChange={(value) => change("nav", "signupHref", value)} />
            </div>
          </SectionCard>

          <SectionCard title="NRI mega menu" description="The NRI menu uses its own two-column layout on the public website.">
            <div className={styles.formGrid}>
              <Field label="Investment column heading" value={text(draft.navNri?.investLabel)} onChange={(value) => change("navNri", "investLabel", value)} />
              <Field label="Services column heading" value={text(draft.navNri?.servicesLabel)} onChange={(value) => change("navNri", "servicesLabel", value)} />
            </div>
            <h3 className={styles.subheading}>Investment links</h3>
            <LinkList rows={rows(draft.navNri?.investLinks)} onChange={(value) => change("navNri", "investLinks", value)} />
            <h3 className={styles.subheading}>Service cards</h3>
            <ServiceList rows={rows(draft.navNri?.services)} onChange={(value) => change("navNri", "services", value)} />
          </SectionCard>
        </div>
      )}

      {tab === "footer" && (
        <div className={styles.stack}>
          <SectionCard title="Footer link sections" description="Edit all four columns. Removing every link from a column hides that column on the website.">
            <div className={styles.footerGrid}>
              {[1, 2, 3, 4].map((number) => (
                <div className={styles.footerColumn} key={number}>
                  <div className={styles.columnNumber}>Section {number}</div>
                  <Field label="Heading" value={text(draft.footerLinks?.[`col${number}Title`])} onChange={(value) => change("footerLinks", `col${number}Title`, value)} />
                  <LinkList rows={rows(draft.footerLinks?.[`col${number}`])} onChange={(value) => change("footerLinks", `col${number}`, value)} compact />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Footer content" description="Manage the brand copy, newsletter strip and final copyright line.">
            <div className={styles.formGrid}>
              <Field textarea label="Brand description" value={text(draft.footer?.blurb)} onChange={(value) => change("footer", "blurb", value)} />
              <div className={styles.group}>
                <Toggle label="Show registration badge" value={text(draft.footer?.badgeEnabled) || "yes"} onChange={(value) => change("footer", "badgeEnabled", value)} />
                <Field label="Registration badge" value={text(draft.footer?.badge)} onChange={(value) => change("footer", "badge", value)} />
              </div>
              <div className={styles.group}>
                <Toggle label="Show newsletter section" value={text(draft.footer?.newsletterEnabled) || "yes"} onChange={(value) => change("footer", "newsletterEnabled", value)} />
                <Field label="Newsletter heading" value={text(draft.footer?.newsletterTitle)} onChange={(value) => change("footer", "newsletterTitle", value)} />
                <Field textarea label="Newsletter description" value={text(draft.footer?.newsletterBody)} onChange={(value) => change("footer", "newsletterBody", value)} />
              </div>
              <Field label="Company / distributor legal name" value={text(draft.footer?.companyName) || "East Side Global"} onChange={(value) => change("footer", "companyName", value)} />
              <Field label="Copyright line" value={text(draft.footer?.copyright) || "East Side Global. All rights reserved."} onChange={(value) => change("footer", "copyright", value)} />
              <Field label="Location line" value={text(draft.footer?.madeIn)} onChange={(value) => change("footer", "madeIn", value)} />
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "contact" && (
        <div className={styles.stack}>
          <SectionCard title="Footer contact details" description="These details appear in the brand area of the footer and other shared contact surfaces.">
            <div className={styles.formGrid}>
              <Field label="Email address" value={text(draft.contact?.email)} onChange={(value) => change("contact", "email", value)} />
              <Field label="Phone link" value={text(draft.contact?.phone)} onChange={(value) => change("contact", "phone", value)} />
              <Field label="Phone as displayed" value={text(draft.contact?.phoneDisplay)} onChange={(value) => change("contact", "phoneDisplay", value)} />
              <Field label="Working hours" value={text(draft.contact?.hours)} onChange={(value) => change("contact", "hours", value)} />
              <Field textarea label="Registered office" value={text(draft.contact?.address)} onChange={(value) => change("contact", "address", value)} />
              <Field label="Google Map link (URL)" value={text(draft.contact?.mapUrl)} onChange={(value) => change("contact", "mapUrl", value)} />
              <Field label="Google Map embed iframe URL" value={text(draft.contact?.mapEmbedUrl)} onChange={(value) => change("contact", "mapEmbedUrl", value)} />
            </div>
          </SectionCard>

          <SectionCard title="WhatsApp" description="One setting controls the floating chat button and the footer shortcut.">
            <div className={styles.formGrid}>
              <Toggle label="Show WhatsApp button" value={text(draft.whatsapp?.enabled) || "yes"} onChange={(value) => change("whatsapp", "enabled", value)} />
              <Field label="Number with country code" value={text(draft.whatsapp?.number)} onChange={(value) => change("whatsapp", "number", value.replace(/\D/g, ""))} />
              <Field label="Number as displayed" value={text(draft.whatsapp?.display)} onChange={(value) => change("whatsapp", "display", value)} />
              <Field label="Button label" value={text(draft.whatsapp?.buttonLabel)} onChange={(value) => change("whatsapp", "buttonLabel", value)} />
              <Field textarea label="Pre-filled message" value={text(draft.whatsapp?.message)} onChange={(value) => change("whatsapp", "message", value)} />
            </div>
          </SectionCard>

          <SectionCard title="Social profiles" description="Add, remove or reorder the social icons shown in the footer.">
            <SocialList rows={rows(draft.social?.items)} onChange={(value) => change("social", "items", value)} />
          </SectionCard>
        </div>
      )}

      <div className={styles.bottomBar}>
        <span>{dirty ? "You have unsaved changes" : "All changes are saved"}</span>
        <div>
          <button className={styles.resetButton} onClick={reset} disabled={saving}><RotateCcw size={15} /> Restore defaults</button>
          <button className="btn btn-primary" onClick={save} disabled={!dirty || saving}><Save size={16} /> {saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className={styles.card}>
    <header className={styles.cardHead}><div><h2>{title}</h2><p>{description}</p></div>{action}</header>
    <div className={styles.cardBody}>{children}</div>
  </section>;
}

function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className={styles.field}><span>{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

function Toggle({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const enabled = value !== "no";
  return <label className={styles.toggle}><span><b>{label}</b><small>{enabled ? "Visible on the website" : "Hidden from the website"}</small></span><input type="checkbox" checked={enabled} onChange={(event) => onChange(event.target.checked ? "yes" : "no")} /><i /></label>;
}

function ItemActions({ index, length, onMove, onRemove, compact = false }: { index: number; length: number; onMove: (direction: -1 | 1) => void; onRemove: () => void; compact?: boolean }) {
  return <div className={`${styles.itemActions} ${compact ? styles.compactActions : ""}`}>
    <button aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={15} /></button>
    <button aria-label="Move down" disabled={index === length - 1} onClick={() => onMove(1)}><ArrowDown size={15} /></button>
    <button aria-label="Remove" className={styles.danger} onClick={onRemove}><Trash2 size={15} /></button>
  </div>;
}

function LinkList({ rows: items, onChange, compact = false }: { rows: Row[]; onChange: (rows: Row[]) => void; compact?: boolean }) {
  return <div className={styles.linkList}>
    {items.map((item, index) => <div className={`${styles.linkRow} ${compact ? styles.compactRow : ""}`} key={index}>
      <Field label="Label" value={item.label || ""} onChange={(value) => { const next = clone(items); next[index].label = value; onChange(next); }} />
      <Field label="Page / URL" value={item.href || ""} onChange={(value) => { const next = clone(items); next[index].href = value; onChange(next); }} />
      <ItemActions compact index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
    </div>)}
    {!items.length && <p className={styles.empty}>No links in this section.</p>}
    <button className={styles.addInline} onClick={() => onChange([...items, { label: "New page", href: "/" }])}><Plus size={14} /> Add link</button>
  </div>;
}

function ServiceList({ rows: items, onChange }: { rows: Row[]; onChange: (rows: Row[]) => void }) {
  return <div className={styles.linkList}>
    {items.map((item, index) => <div className={styles.serviceRow} key={index}>
      <div className={styles.twoInputs}><Field label="Title" value={item.title || ""} onChange={(value) => { const next = clone(items); next[index].title = value; onChange(next); }} /><Field label="Page / URL" value={item.href || ""} onChange={(value) => { const next = clone(items); next[index].href = value; onChange(next); }} /></div>
      <Field textarea label="Description" value={item.body || ""} onChange={(value) => { const next = clone(items); next[index].body = value; onChange(next); }} />
      <ItemActions index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
    </div>)}
    <button className={styles.addInline} onClick={() => onChange([...items, { title: "New service", body: "", href: "/" }])}><Plus size={14} /> Add service</button>
  </div>;
}

function SocialList({ rows: items, onChange }: { rows: Row[]; onChange: (rows: Row[]) => void }) {
  const options = ["linkedin", "instagram", "x", "whatsapp", "facebook", "youtube"];
  return <div className={styles.linkList}>
    {items.map((item, index) => <div className={styles.linkRow} key={index}>
      <label className={styles.field}><span>Platform</span><select value={item.platform || "linkedin"} onChange={(event) => { const next = clone(items); next[index].platform = event.target.value; onChange(next); }}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
      <Field label="Profile URL" value={item.href || ""} onChange={(value) => { const next = clone(items); next[index].href = value; onChange(next); }} />
      <ItemActions compact index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
    </div>)}
    {!items.length && <p className={styles.empty}>No social profiles are shown.</p>}
    <button className={styles.addInline} onClick={() => onChange([...items, { platform: "linkedin", href: "" }])}><Plus size={14} /> Add social profile</button>
  </div>;
}

function EmptyState({ text: value }: { text: string }) {
  return <div className={styles.emptyState}><Menu size={24} /><p>{value}</p></div>;
}

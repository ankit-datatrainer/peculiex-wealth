/**
 * Global, CMS-editable site chrome: WhatsApp, social profiles, nav and footer.
 *
 * Every one of these appears on more than one surface — the WhatsApp number
 * alone is on the floating button, both footers, /contact and the invest
 * modal — so they read from one place (the `global` CMS page) and fall back to
 * lib/siteFacts when the API is unreachable. That fallback is the reason a
 * dropped backend degrades to the shipped copy instead of an empty header.
 *
 * Client-only: these hooks subscribe to the same live channel as useContent,
 * so a super-admin's save repaints the nav and footer without a refresh.
 * Server components must use the plain constants in lib/siteFacts instead.
 */

"use client";

import { useContent, type Reader } from "./content";
import {
  SOCIAL_LINKS,
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGE,
  WHATSAPP_NUMBER,
  whatsappLink as staticWhatsappLink,
} from "./siteFacts";
import type { SocialId } from "./socialIcons";

/** The `global` page holds every piece of chrome shared across the site. */
export const GLOBAL_PAGE = "global";

export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { children?: NavLink[] };
export type SocialLink = { id: SocialId; label: string; href: string };
export type NriService = { title: string; body: string; href: string };

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  youtube: "YouTube",
};

/** Drop rows an admin left half-filled rather than rendering a blank link. */
const usable = (r: { label?: string; href?: string }) =>
  Boolean(r.label?.trim() && r.href?.trim());

/* ── WhatsApp ───────────────────────────────────────────────────── */

export type WhatsAppSettings = {
  /** Digits only. Empty when the admin has cleared it. */
  number: string;
  display: string;
  message: string;
  buttonLabel: string;
  enabled: boolean;
  /** Ready-to-use link with the default message, or '' when unconfigured. */
  href: string;
  /** Build a link with a message tailored to where the user clicked. */
  link: (message?: string) => string;
};

function buildLink(number: string, message: string): string {
  if (number.length < 10) return "";
  const params = new URLSearchParams({
    phone: number,
    text: message,
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

/** Read WhatsApp settings off an existing `global` reader. */
export function whatsappFrom(cms: Reader): WhatsAppSettings {
  const number = cms.t("whatsapp", "number", WHATSAPP_NUMBER).replace(/\D/g, "");
  const message = cms.t("whatsapp", "message", WHATSAPP_MESSAGE);
  return {
    number,
    display: cms.t("whatsapp", "display", WHATSAPP_DISPLAY),
    message,
    buttonLabel: cms.t("whatsapp", "buttonLabel", "Chat with us"),
    // Anything but an explicit "no" keeps the button up: a typo in this field
    // should not silently remove the site's main contact route.
    enabled: cms.t("whatsapp", "enabled", "yes") !== "no",
    href: buildLink(number, message),
    link: (m?: string) => buildLink(number, m ?? message),
  };
}

export function useWhatsApp(): WhatsAppSettings {
  return whatsappFrom(useContent(GLOBAL_PAGE));
}

/* ── Social ─────────────────────────────────────────────────────── */

/**
 * Social profiles, in the admin's chosen order. The WhatsApp row is special:
 * leaving its URL blank means "use the chat number", which is what an admin
 * expects after editing the number one section above.
 */
export function socialFrom(cms: Reader): SocialLink[] {
  const wa = whatsappFrom(cms);
  const rows = cms.list<{ platform: string; href: string }>("social", "items", []);

  const source = rows.length
    ? rows
    : SOCIAL_LINKS.map((s) => ({ platform: s.id as string, href: s.href }));

  return source
    .map((r) => {
      const id = (r.platform || "").trim().toLowerCase();
      const href = (r.href || "").trim() || (id === "whatsapp" ? wa.href : "");
      return { id: id as SocialId, label: SOCIAL_LABELS[id] || id, href };
    })
    .filter((s) => s.href && SOCIAL_LABELS[s.id]);
}

export function useSocialLinks(): SocialLink[] {
  return socialFrom(useContent(GLOBAL_PAGE));
}

/* ── Navigation ─────────────────────────────────────────────────── */

/**
 * Assemble the nav from the two flat CMS lists. Children name their parent by
 * its top-level label (the admin editor has no nested-list widget), matched
 * case-insensitively so "products" still lands under "Products".
 */
export function navFrom(cms: Reader, fallback: NavItem[]): NavItem[] {
  const items = cms.list<NavLink>("nav", "items", []).filter(usable);
  if (!items.length) return fallback;

  const kids = cms
    .list<{ parent: string; label: string; href: string }>("nav", "dropdown", [])
    .filter(usable);

  const byParent = new Map<string, NavLink[]>();
  for (const k of kids) {
    const key = (k.parent || "").trim().toLowerCase();
    if (!key) continue;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push({ label: k.label, href: k.href });
  }

  return items.map((it) => {
    const children = byParent.get(it.label.trim().toLowerCase());
    return children?.length ? { ...it, children } : { ...it };
  });
}

export function nriMenuFrom(cms: Reader) {
  return {
    investLabel: cms.t("navNri", "investLabel", "Investment"),
    investLinks: cms.list<NavLink>("navNri", "investLinks", []).filter(usable),
    servicesLabel: cms.t("navNri", "servicesLabel", "NRI Services"),
    services: cms
      .list<NriService>("navNri", "services", [])
      .filter((s) => s.title?.trim() && s.href?.trim()),
  };
}

/* ── Footer ─────────────────────────────────────────────────────── */

export type FooterColumn = { title: string; links: NavLink[] };

/**
 * The four footer link columns. A column whose list an admin has emptied is
 * dropped entirely, so the grid closes up instead of leaving a stray heading.
 */
export function footerColumnsFrom(
  cms: Reader,
  fallback: FooterColumn[]
): FooterColumn[] {
  const cols: FooterColumn[] = [1, 2, 3, 4].map((n, i) => ({
    title: cms.t("footerLinks", `col${n}Title`, fallback[i]?.title || ""),
    links: cms
      .list<NavLink>("footerLinks", `col${n}`, fallback[i]?.links || [])
      .filter(usable),
  }));
  const kept = cols.filter((c) => c.title.trim() && c.links.length);
  return kept.length ? kept : fallback;
}

/** Direct contact routes shown under the footer brand blurb. */
export function contactFrom(cms: Reader) {
  return {
    email: cms.t("contact", "email", "info@finvoq.com"),
    phone: cms.t("contact", "phone", ""),
    phoneDisplay: cms.t("contact", "phoneDisplay", ""),
    hours: cms.t("contact", "hours", ""),
    address: cms.t("contact", "address", "Delhi, India"),
  };
}

/** Everything the chrome needs, from one subscription. */
export function useSiteChrome() {
  const cms = useContent(GLOBAL_PAGE);
  return {
    cms,
    whatsapp: whatsappFrom(cms),
    social: socialFrom(cms),
    contact: contactFrom(cms),
  };
}

/** Static equivalent for server components (no live updates). */
export const staticWhatsAppHref = staticWhatsappLink();

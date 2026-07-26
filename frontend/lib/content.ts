/**
 * Site content: the client half of the super-admin CMS.
 *
 * Pages call `useContent("about")` and get back a `t(section, field)` reader.
 * Content arrives from the backend, which merges the admin's saved overrides
 * on top of the defaults declared in backend/src/content/schema.js, so a
 * field nobody has edited still renders the copy that ships in the code.
 *
 * Updates land without a refresh: the editor's save broadcasts
 * CONTENT_UPDATED over the same WebSocket the price ticker uses, and every
 * mounted page swaps in the new copy. If the socket is unavailable the hook
 * falls back to a slow poll, so live editing still works behind any proxy.
 */

"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "./api";
import { wsBaseUrl } from "./markets";

export type Section = Record<string, string | Row[]>;
export type Row = Record<string, string>;
export type PageContent = Record<string, Section>;

/* ── shared cache so every component on a page shares one fetch ── */

let cache: Record<string, PageContent> | null = null;
let inflight: Promise<Record<string, PageContent>> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

async function loadAll(): Promise<Record<string, PageContent>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch(apiUrl("/api/content"), { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { pages: {} }))
    .then((j) => {
      cache = j.pages || {};
      inflight = null;
      notify();
      return cache!;
    })
    .catch(() => {
      cache = {};
      inflight = null;
      return cache!;
    });
  return inflight;
}

/** Merge one page's fresh content into the cache (used by the live socket). */
export function applyContentUpdate(page: string, content: PageContent) {
  cache = { ...(cache || {}), [page]: content };
  notify();
}

/* ── live channel ───────────────────────────────────────────────── */

let socket: WebSocket | null = null;
let poller: number | null = null;
let subscribers = 0;

function openLiveChannel() {
  if (typeof window === "undefined" || socket) return;
  try {
    socket = new WebSocket(wsBaseUrl());
    socket.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === "CONTENT_UPDATED" && msg.payload?.page) {
          applyContentUpdate(msg.payload.page, msg.payload.content);
        }
      } catch {
        /* not our frame */
      }
    };
    socket.onclose = () => {
      socket = null;
      startPolling();
    };
    socket.onerror = () => {
      try {
        socket?.close();
      } catch {
        /* already gone */
      }
    };
  } catch {
    startPolling();
  }
}

/** Fallback when the socket cannot be established (e.g. no /ws proxy). */
function startPolling() {
  if (poller !== null || typeof window === "undefined") return;
  poller = window.setInterval(async () => {
    if (subscribers === 0) return;
    try {
      const r = await fetch(apiUrl("/api/content"), { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      if (j.pages && JSON.stringify(j.pages) !== JSON.stringify(cache)) {
        cache = j.pages;
        notify();
      }
    } catch {
      /* offline: keep the copy we already have */
    }
  }, 20000);
}

/* ── public hook ────────────────────────────────────────────────── */

export type Reader = {
  /** Text field, falling back to the value compiled into the page. */
  t: (section: string, field: string, fallback?: string) => string;
  /** Repeatable list, falling back to the rows compiled into the page. */
  list: <T extends Row>(section: string, field: string, fallback: T[]) => T[];
  /** True once the server content has arrived. */
  ready: boolean;
};

export function useContent(page: string): Reader {
  const [, force] = useState(0);
  const [ready, setReady] = useState(cache !== null);

  useEffect(() => {
    let alive = true;
    const rerender = () => {
      if (alive) force((n) => n + 1);
    };
    listeners.add(rerender);
    subscribers += 1;

    loadAll().then(() => {
      if (alive) setReady(true);
    });
    openLiveChannel();

    return () => {
      alive = false;
      listeners.delete(rerender);
      subscribers -= 1;
    };
  }, []);

  const section = (name: string): Section | undefined => cache?.[page]?.[name];

  return {
    ready,
    t: (s, field, fallback = "") => {
      const v = section(s)?.[field];
      return typeof v === "string" && v.trim() !== "" ? v : fallback;
    },
    list: <T extends Row>(s: string, field: string, fallback: T[]): T[] => {
      const v = section(s)?.[field];
      return Array.isArray(v) && v.length ? (v as T[]) : fallback;
    }
  };
}

/**
 * Resolve an image field. Uploads are served by the API, everything else
 * (a path in /public, or an external URL) is used as-is.
 */
export function imgSrc(value: string): string {
  return value && value.startsWith("/api/") ? apiUrl(value) : value;
}

/**
 * Render *accented* text: the CMS marks the highlighted words of a heading
 * with asterisks, which map onto the <em> the designs already style.
 */
export function accent(text: string): (string | { em: string })[] {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? { em: part } : part
  );
}

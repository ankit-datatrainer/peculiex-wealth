"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { apiFetch, apiPostJSON } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import LoginPrompt from "./LoginPrompt";

/**
 * Reusable star button for any stock card. Self-contained styling (no
 * styled-jsx, no shared CSS dependency) so it renders consistently on
 * every host card — Markets, Unlisted, previews, watchlist itself.
 *
 * - When the user isn't signed in, clicking opens an inline LoginPrompt
 *   instead of redirecting away mid-browse.
 * - All instances on the page share an in-memory cache so toggling one
 *   card immediately updates every other card showing the same symbol.
 * - The button is intentionally NOT disabled while the auth context
 *   bootstraps; clicking before boot is harmless (the prompt opens).
 */

export type WatchlistButtonProps = {
  /** Stable storage key. Listed: ticker (RELIANCE). Unlisted: UNL-OYO-HOTELS. */
  symbol: string;
  /** Display name persisted with the entry. */
  name: string;
  /** Optional current price snapshot — stored as the "added price". */
  price?: number;
  /** Optional badge to mark unlisted entries on the watchlist page. */
  kind?: "listed" | "unlisted";
  /** Visual style. Default: "icon" (compact circular star). */
  variant?: "icon" | "pill";
  /** Override default tooltip / a11y label. */
  label?: string;
};

/* ---------------- shared session-level cache ---------------- */

type Listener = (set: Set<string>) => void;

const cache = {
  set: new Set<string>(),
  loaded: false,
  loading: null as null | Promise<void>,
  listeners: new Set<Listener>(),

  notify() {
    this.listeners.forEach((l) => l(this.set));
  },
  add(sym: string) {
    this.set.add(sym);
    this.notify();
  },
  remove(sym: string) {
    this.set.delete(sym);
    this.notify();
  },
  reset() {
    this.set = new Set();
    this.loaded = false;
    this.notify();
  },
  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  async load() {
    if (this.loaded) return;
    if (this.loading) return this.loading;
    this.loading = (async () => {
      try {
        const r = await apiFetch<{ items: { symbol: string }[] }>(
          "/api/watchlist"
        );
        this.set = new Set((r.items || []).map((i) => i.symbol));
        this.loaded = true;
        this.notify();
      } catch {
        /* unauth / network — silent */
      } finally {
        this.loading = null;
      }
    })();
    return this.loading;
  }
};

/* ---------------- floating toast ---------------- */

let toastEl: HTMLDivElement | null = null;
let toastTimer: number | null = null;

function flashToast(msg: string) {
  if (typeof document === "undefined") return;
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    Object.assign(toastEl.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%) translateY(20px)",
      background: "rgba(15,23,42,0.94)",
      color: "#fff",
      padding: "0.7rem 1.1rem",
      borderRadius: "999px",
      fontSize: "0.88rem",
      fontWeight: "500",
      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
      zIndex: "90",
      backdropFilter: "blur(8px)",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.2s, transform 0.25s ease"
    } as CSSStyleDeclaration);
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  void toastEl.offsetWidth; // force reflow
  toastEl.style.opacity = "1";
  toastEl.style.transform = "translateX(-50%) translateY(0)";
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (!toastEl) return;
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(-50%) translateY(20px)";
  }, 2400);
}

/* ---------------- styles ---------------- */

const baseIcon: CSSProperties = {
  width: 32,
  height: 32,
  display: "inline-grid",
  placeItems: "center",
  borderRadius: 9999,
  background: "#ffffff",
  color: "#333333",
  border: "1px solid rgba(0,0,0,0.10)",
  cursor: "pointer",
  transition:
    "color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
  fontFamily: "inherit",
  padding: 0,
  flex: "0 0 auto",
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)"
};

const onIcon: CSSProperties = {
  background: "rgba(1, 105, 111, 0.12)",
  color: "#01696f",
  borderColor: "rgba(1, 105, 111, 0.45)"
};

const hoverIcon: CSSProperties = {
  color: "#01696f",
  borderColor: "rgba(1, 105, 111, 0.45)",
  background: "rgba(1, 105, 111, 0.08)",
  transform: "translateY(-1px)",
  boxShadow: "0 4px 10px rgba(1,105,111,0.15)"
};

const basePill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.42rem 0.85rem",
  borderRadius: 9999,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "#ffffff",
  fontSize: "0.78rem",
  fontWeight: 600,
  fontFamily: "inherit",
  color: "#333333",
  cursor: "pointer",
  transition:
    "color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
  flex: "0 0 auto",
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)"
};

const onPill: CSSProperties = {
  background: "rgba(1, 105, 111, 0.12)",
  color: "#01696f",
  borderColor: "rgba(1, 105, 111, 0.45)"
};

/* ---------------- component ---------------- */

export default function WatchlistButton({
  symbol,
  name,
  price,
  kind = "listed",
  variant = "icon",
  label
}: WatchlistButtonProps) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const mounted = useRef(true);

  // subscribe to shared cache
  useEffect(() => {
    mounted.current = true;
    const apply = (set: Set<string>) => {
      if (mounted.current) setIsWatched(set.has(symbol));
    };
    apply(cache.set);
    const unsub = cache.subscribe(apply);
    return () => {
      mounted.current = false;
      unsub();
    };
  }, [symbol]);

  // populate the cache on login; clear on logout
  useEffect(() => {
    if (!ready) return;
    if (user) {
      void cache.load();
    } else if (cache.loaded) {
      cache.reset();
    }
  }, [user, ready]);

  const onToggle = async () => {
    if (busy) return;
    // If auth hasn't booted yet OR there's no user, prompt for login.
    if (!ready || !user) {
      setShowPrompt(true);
      return;
    }
    const wasWatched = isWatched;
    setBusy(true);
    if (wasWatched) cache.remove(symbol);
    else cache.add(symbol);
    try {
      if (wasWatched) {
        await apiFetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
          method: "DELETE"
        });
        flashToast(`${name} removed from watchlist`);
      } else {
        await apiPostJSON("/api/watchlist", {
          symbol,
          name,
          price,
          note: kind === "unlisted" ? "unlisted" : undefined
        });
        flashToast(`${name} added to your watchlist`);
      }
    } catch (e: any) {
      // rollback on failure
      if (wasWatched) cache.add(symbol);
      else cache.remove(symbol);
      flashToast(e?.message || "Could not update watchlist");
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const a11y =
    label ||
    (isWatched
      ? `Remove ${name} from watchlist`
      : `Add ${name} to watchlist`);

  const tooltip =
    !user && ready
      ? "Login to save to your watchlist"
      : isWatched
      ? "Remove from watchlist"
      : "Add to watchlist";

  if (variant === "pill") {
    const style: CSSProperties = {
      ...basePill,
      ...(isWatched ? onPill : null),
      ...(hover && !isWatched ? hoverIcon : null),
      ...(busy ? { opacity: 0.6, cursor: "progress" } : null)
    };
    return (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            void onToggle();
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={a11y}
          aria-pressed={isWatched}
          title={tooltip}
          style={style}
        >
          <Star filled={isWatched} />
          <span>{isWatched ? "Watching" : "+ Watch"}</span>
        </button>
        <LoginPrompt
          open={showPrompt}
          onClose={() => setShowPrompt(false)}
          next={pathname || "/"}
        />
      </>
    );
  }

  // icon variant (default)
  const style: CSSProperties = {
    ...baseIcon,
    ...(isWatched ? onIcon : null),
    ...(hover && !isWatched ? hoverIcon : null),
    ...(busy ? { opacity: 0.6, cursor: "progress" } : null)
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          void onToggle();
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={a11y}
        aria-pressed={isWatched}
        title={tooltip}
        style={style}
      >
        <Star filled={isWatched} />
      </button>
      <LoginPrompt
        open={showPrompt}
        onClose={() => setShowPrompt(false)}
        next={pathname || "/"}
      />
    </>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path d="M12 3l2.9 6 6.6 1-4.7 4.6 1.1 6.6L12 18l-5.9 3.2 1.1-6.6L2.5 10l6.6-1z" />
    </svg>
  );
}

/** Helper exported for callers that need to convert a free-form name into
 *  a stable, regex-safe symbol. We use this for unlisted shares that don't
 *  have a real ticker. e.g. "Oyo Hotels" -> "UNL-OYO-HOTELS" */
export function makeUnlistedSymbol(name: string): string {
  const clean = String(name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return "UNL-" + (clean || "ITEM");
}

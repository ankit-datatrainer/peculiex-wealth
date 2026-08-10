"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { canAccessAdmin, useAuth } from "@/lib/auth-context";

/**
 * AdminMobileNav — phone/tablet chrome for the admin panel.
 *
 * The admin shell is a fixed 264px sidebar + content grid, which leaves
 * ~120px of usable width on a 390px phone. Below 1024px the responsive
 * layer turns `.admin-side` into an off-canvas drawer; this component
 * supplies the top bar and the control that opens it, plus the scrim.
 *
 * It renders nothing at all on desktop (CSS `display:none` at >=1024px)
 * and nothing at any width for visitors who cannot see the shell, so the
 * desktop layout is byte-for-byte what it was before.
 *
 * State lives on <html data-admin-drawer="open"> so the drawer itself —
 * which is markup owned by AdminShell — can be moved with CSS alone.
 */
export default function AdminMobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const allowed = !!user && canAccessAdmin(user);

  const close = useCallback(() => setOpen(false), []);

  // Reflect state onto <html> so CSS can drive the drawer, and stop the
  // page behind the drawer from scrolling while it is open.
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.setAttribute("data-admin-drawer", "open");
    else root.removeAttribute("data-admin-drawer");
    return () => root.removeAttribute("data-admin-drawer");
  }, [open]);

  // Close on navigation — every sidebar link is a route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus into the drawer when it opens so keyboard users land there.
  useEffect(() => {
    if (!open) return;
    const first = document.querySelector<HTMLElement>(
      ".admin-side .admin-nav-item"
    );
    first?.focus();
  }, [open]);

  if (!allowed) return null;

  return (
    <>
      <div className="admin-mbar">
        <button
          ref={btnRef}
          type="button"
          className="admin-mbar-toggle"
          aria-expanded={open}
          aria-label={open ? "Close admin navigation" : "Open admin navigation"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="admin-mbar-bars" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </button>
        <span className="admin-mbar-title">Admin</span>
      </div>

      <div
        className="admin-mbar-scrim"
        data-open={open ? "true" : "false"}
        onClick={close}
        aria-hidden
      />
    </>
  );
}

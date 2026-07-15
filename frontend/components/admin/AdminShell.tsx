"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdminUser, isManagerUser, canAccessAdmin, useAuth } from "@/lib/auth-context";

/**
 * AdminShell — wraps every /admin page in a sidebar layout.
 *
 *  - While auth is booting, shows a centered loader.
 *  - If the user is not logged in, redirects to /login?next=/admin.
 *  - If the user is logged in but lacks admin/superadmin role, shows a
 *    "no access" message rather than silently bouncing — clearer feedback.
 *  - When authorised, renders the sidebar + the page content.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const ICON = {
  dashboard: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        fill="currentColor"
      />
    </svg>
  ),
  factsheet: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  unlisted: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M12 2 4 6v6c0 5 3.5 9.3 8 10 4.5-.7 8-5 8-10V6l-8-4z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
  leads: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M4 4h16v14H5l-1 3V4z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M3 6h18v12H3z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m3 7 9 7 9-7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  ),
  exit: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: ICON.dashboard },
  { href: "/admin/unlisted", label: "Unlisted Shares", icon: ICON.unlisted },
  { href: "/admin/factsheet-html", label: "Factsheets", icon: ICON.factsheet },
  { href: "/admin/users", label: "Users", icon: ICON.users },
  { href: "/admin/leads", label: "Leads", icon: ICON.leads },
  { href: "/admin/newsletter", label: "Newsletter", icon: ICON.mail },
  { href: "/admin/contact", label: "Contact Messages", icon: ICON.contact }
];

export default function AdminShell({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect unauthenticated users to login.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=" + encodeURIComponent(pathname || "/admin"));
    }
  }, [ready, user, router, pathname]);

  if (!ready) {
    return (
      <div className="admin-boot">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!user) {
    // Effect above will fire a redirect to /login. Render a useful screen
    // in the meantime instead of a blank page, in case the redirect is
    // blocked or the user manually navigates back here.
    const loginHref =
      "/login?next=" + encodeURIComponent(pathname || "/admin");
    return (
      <div className="admin-boot">
        <div className="admin-no-access">
          <h1>Sign in required</h1>
          <p>
            You need to sign in with an admin account to view the Finvoq
            admin panel.
          </p>
          <div className="admin-no-access-actions">
            <Link href="/" className="btn btn-outline">
              Back to site
            </Link>
            <Link href={loginHref} className="btn btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Managers may access ONLY the Unlisted Shares page. Redirect them there
  // if they try to open any other admin route.
  const managerOnly = isManagerUser(user);
  const allowedForManager = (href: string) =>
    href === "/admin/unlisted" || href.startsWith("/admin/unlisted");

  if (managerOnly && pathname && !allowedForManager(pathname)) {
    if (typeof window !== "undefined") router.replace("/admin/unlisted");
    return (
      <div className="admin-boot">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!canAccessAdmin(user)) {
    return (
      <div className="admin-boot">
        <div className="admin-no-access">
          <h1>You don&apos;t have admin access</h1>
          <p>
            Signed in as <strong>{user.email}</strong>. This account doesn&apos;t
            have admin privileges. Ask a super-admin to upgrade your role, or
            sign in with a different account.
          </p>
          <div className="admin-no-access-actions">
            <Link href="/" className="btn btn-outline">
              Back to site
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await logout();
                router.replace("/login?next=/admin");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <Link href="/" className="admin-logo">
            <span className="admin-logo-mark">f</span>
            <span className="admin-logo-text">
              finvo<em>q</em>
            </span>
          </Link>
          <span className="admin-brand-tag">
            {user.role === "superadmin"
              ? "Super Admin"
              : user.role === "manager"
              ? "Manager"
              : "Admin"}
          </span>
        </div>

        <nav className="admin-nav">
          {(managerOnly ? NAV.filter((it) => allowedForManager(it.href)) : NAV).map((it) => {
            const active =
              it.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`admin-nav-item${active ? " active" : ""}`}
              >
                <span className="admin-nav-ico">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-side-foot">
          <div className="admin-user-card">
            <div className="admin-avatar">
              {user.name
                ?.split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("") || "A"}
            </div>
            <div className="admin-user-meta">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="admin-side-actions">
            <Link href="/" className="admin-side-link">
              View site →
            </Link>
            <button
              type="button"
              className="admin-side-link admin-side-signout"
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {ICON.exit} Sign out
              </span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}

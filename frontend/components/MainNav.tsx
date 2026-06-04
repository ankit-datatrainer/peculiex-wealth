"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth, isAdminUser } from "@/lib/auth-context";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/watchlist", label: "Watchlist" },
  { href: "/unlisted", label: "Unlisted" },
  { href: "/products", label: "Products" },
  { href: "/calculator", label: "SIP Calculator" },
  { href: "/news", label: "News" }
];

export default function MainNav() {
  const linksRef = useRef<HTMLUListElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close account menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-account-menu]")) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  const onLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  const initials = (user?.name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="main-nav" id="mainNav">
      <div className="nav-inner">
        <Link href="/" className="logo" data-magnetic>
          <span className="logo-mark">
            <span>P</span>
          </span>
          <span className="logo-text">
            PECULI<em>EX</em>
          </span>
        </Link>
        <nav>
          <ul className={`nav-links${mobileOpen ? " mobile-open" : ""}`} ref={linksRef}>
            {mobileOpen && (
              <button
                type="button"
                className="mobile-close-btn"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
            {NAV_ITEMS.map((it) => {
              const isActive =
                it.href.startsWith("/") &&
                !it.href.includes("#") &&
                (pathname === it.href ||
                  (it.href !== "/" && pathname.startsWith(it.href)));
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`nav-link${isActive ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
            {/* Mobile-only User Profile or Auth buttons */}
            <li className="mobile-only">
              {user ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "var(--color-primary, #01696f)",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        letterSpacing: "0.02em"
                      }}
                    >
                      {initials || "U"}
                    </span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--color-text)" }}>{user.name}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>{user.email}</div>
                    </div>
                  </div>
                  <Link href="/dashboard" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  {isAdminUser(user) && (
                    <Link href="/admin" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                  )}
                  <button className="btn btn-outline" style={{ width: "100%", color: "#dc2626", borderColor: "#fca5a5", justifyContent: "center", marginTop: "10px" }} onClick={onLogout}>Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} data-magnetic onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/signup" className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} data-magnetic onClick={() => setMobileOpen(false)}>Open Account</Link>
                </>
              )}
            </li>
          </ul>
        </nav>
        <div className="nav-cta" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ThemeToggle />
          {!ready ? (
            // Tiny placeholder during boot — avoids "logged-out flash" before
            // /api/auth/me resolves.
            <span style={{ width: 36, height: 36, display: "inline-block" }} />
          ) : user ? (
            <div
              data-account-menu
              style={{ position: "relative" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.4rem 0.55rem 0.4rem 0.4rem",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--color-primary, #01696f)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.02em"
                  }}
                >
                  {initials || "U"}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--color-text, #131313)",
                    maxWidth: 90,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.name.split(" ")[0]}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 14,
                    minWidth: 220,
                    boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                    overflow: "hidden",
                    zIndex: 60
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      fontSize: "0.78rem"
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--color-text, #131313)",
                        fontSize: "0.9rem"
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        color: "var(--color-text-muted, #333333)",
                        marginTop: 2
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                  <Link
                    href="/watchlist"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.7rem 1rem",
                      fontSize: "0.88rem",
                      color: "var(--color-text, #131313)",
                      textDecoration: "none"
                    }}
                  >
                    My watchlist
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.7rem 1rem",
                      fontSize: "0.88rem",
                      color: "var(--color-text, #131313)",
                      textDecoration: "none"
                    }}
                  >
                    Dashboard
                  </Link>
                  {isAdminUser(user) && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        padding: "0.7rem 1rem",
                        fontSize: "0.88rem",
                        color: "var(--color-primary, #01696f)",
                        textDecoration: "none",
                        fontWeight: 600,
                        background:
                          "linear-gradient(90deg, rgba(1,105,111,0.06), transparent)"
                      }}
                    >
                      <span>Admin Panel</span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#fff",
                          background: "var(--color-primary, #01696f)",
                          padding: "2px 7px",
                          borderRadius: 999
                        }}
                      >
                        {user.role === "superadmin" ? "Super" : "Admin"}
                      </span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={onLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.7rem 1rem",
                      fontSize: "0.88rem",
                      color: "#dc2626",
                      background: "transparent",
                      border: 0,
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline" data-magnetic>
                Login
              </Link>
              <Link href="/signup" className="btn btn-gold" data-magnetic>
                Open Account
              </Link>
            </>
          )}
          <button
            className="mobile-toggle"
            id="mobileToggle"
            aria-label="menu"
            ref={toggleRef}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

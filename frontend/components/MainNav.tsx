"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth, isAdminUser } from "@/lib/auth-context";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string; disabled?: boolean }[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/watchlist", label: "Watchlist" },
  {
    href: "/products",
    label: "Products",
    children: [
      { href: "/products/mutual-funds", label: "Mutual Funds" },
      { href: "/products/pms", label: "Portfolio Management (PMS)" },
      { href: "/products/aif", label: "Alternative Investments (AIF)" },
      { href: "/products/bonds", label: "Bonds & G-Sec" },
      { href: "/products/insurance", label: "Insurance" },
      { href: "/products/fixed-deposits", label: "Fixed Deposits" },
      { href: "/products/gift-city", label: "Gift City" },
      { href: "#sif", label: "SIF (Coming Soon)", disabled: true }
    ]
  },
  { href: "/unlisted", label: "Unlisted" },
  {
    href: "/nri",
    label: "NRI Corner",
    children: [
      { href: "/products/mutual-funds", label: "Mutual Funds" },
      { href: "/nri/services", label: "Services" }
    ]
  },

  {
    href: "/calculator",
    label: "Calculators",
    children: [
      { href: "/calculator", label: "SIP Calculator" },
      { href: "/calculator/lumpsum", label: "Lumpsum Calculator" },
      { href: "/calculator/retirement", label: "Retirement Calculator" },
      { href: "/calculator/goal-planner", label: "Goal Planner" },
      { href: "/resources/mutual-funds", label: "Mutual Fund Resources" }
    ]
  },
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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
    setOpenGroup(null);
  }, [pathname]);

  // Collapse any expanded accordion group when the mobile menu closes.
  useEffect(() => {
    if (!mobileOpen) setOpenGroup(null);
  }, [mobileOpen]);

  const toggleGroup = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenGroup((g) => (g === href ? null : href));
  };

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
            <span>f</span>
          </span>
          <span className="logo-text">
            finvo<em>q</em>
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
              if (it.children) {
                if (it.label === "NRI Corner") {
                  return (
                    <li
                      key={it.href}
                      className={`nav-has-dropdown nri-mega-menu-container${
                        openGroup === it.href ? " open" : ""
                      }`}
                    >
                      <div className="nav-parent-row">
                        <Link
                          href={it.href}
                          className={`nav-link nav-link-parent${isActive ? " active" : ""}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {it.label}
                        </Link>
                        <button
                          type="button"
                          className="nav-caret-btn"
                          aria-label={`Toggle ${it.label} menu`}
                          aria-expanded={openGroup === it.href}
                          onClick={toggleGroup(it.href)}
                        >
                          <svg className="nav-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                      <div className="nav-dropdown nri-mega-dropdown">
                        <div className="nri-dropdown-inner">
                          {/* Left Column: Investment */}
                          <div className="nri-column nri-left-col">
                            <span className="nri-col-label">Investment</span>
                            <ul className="nri-links">
                              <li><Link href="/products/mutual-funds" className="nri-dropdown-link" onClick={() => setMobileOpen(false)}>Mutual Funds</Link></li>
                              <li><Link href="/products/pms" className="nri-dropdown-link" onClick={() => setMobileOpen(false)}>Portfolio Management (PMS)</Link></li>
                              <li><Link href="/products/aif" className="nri-dropdown-link" onClick={() => setMobileOpen(false)}>Alternative Investments (AIF)</Link></li>
                              <li><Link href="/unlisted" className="nri-dropdown-link" onClick={() => setMobileOpen(false)}>Unlisted Shares</Link></li>
                              <li><Link href="/products/gift-city" className="nri-dropdown-link" onClick={() => setMobileOpen(false)}>Gift City Offshore</Link></li>
                              <li><Link href="/products/bonds" className="nri-dropdown-link" onClick={() => setMobileOpen(false)}>Bonds & G-Sec</Link></li>
                            </ul>
                          </div>
                          {/* Right Column: Services */}
                          <div className="nri-column nri-right-col">
                            <span className="nri-col-label">NRI Services</span>
                            <div className="nri-services-grid">
                              <Link href="/nri/tax-filing" className="nri-service-card" onClick={() => setMobileOpen(false)}>
                                <div className="nri-icon-wrapper">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="19" y1="5" x2="5" y2="19"/><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/></svg>
                                </div>
                                <div className="nri-service-text">
                                  <h4>India Tax Filing</h4>
                                  <p>File your income tax in India with expert support</p>
                                </div>
                              </Link>

                              <Link href="/nri/pan-application" className="nri-service-card" onClick={() => setMobileOpen(false)}>
                                <div className="nri-icon-wrapper">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                </div>
                                <div className="nri-service-text">
                                  <h4>Apply for PAN</h4>
                                  <p>Get your PAN card quickly and hassle-free</p>
                                </div>
                              </Link>
                              <Link href="/nri/update-citizenship" className="nri-service-card" onClick={() => setMobileOpen(false)}>
                                <div className="nri-icon-wrapper">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zm-6 4h2v2H8v-2zm6 0h2v2h-2v-2zm-6 4h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>
                                </div>
                                <div className="nri-service-text">
                                  <h4>Update Citizenship</h4>
                                  <p>Keep your records accurate across financial systems</p>
                                </div>
                              </Link>

                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                }
                return (
                  <li
                    key={it.href}
                    className={`nav-has-dropdown${openGroup === it.href ? " open" : ""}`}
                  >
                    <div className="nav-parent-row">
                      <Link
                        href={it.href}
                        className={`nav-link nav-link-parent${isActive ? " active" : ""}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {it.label}
                      </Link>
                      <button
                        type="button"
                        className="nav-caret-btn"
                        aria-label={`Toggle ${it.label} menu`}
                        aria-expanded={openGroup === it.href}
                        onClick={toggleGroup(it.href)}
                      >
                        <svg className="nav-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    <ul className="nav-dropdown">
                      {it.children.map((c) => (
                        <li key={c.label}>
                          {c.disabled ? (
                            <span
                              className="nav-dropdown-link"
                              style={{ opacity: 0.5, cursor: "default" }}
                            >
                              {c.label}
                            </span>
                          ) : (
                            <Link
                              href={c.href}
                              className="nav-dropdown-link"
                              onClick={() => setMobileOpen(false)}
                            >
                              {c.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
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
                        background: "var(--color-primary, #0a7d64)",
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
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface, #fff)",
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--color-primary, #0a7d64)",
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
                    background: "var(--color-surface, #fff)",
                    border: "1px solid var(--color-border)",
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
                      borderBottom: "1px solid var(--color-border)",
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
                        color: "var(--color-primary, #0a7d64)",
                        textDecoration: "none",
                        fontWeight: 600,
                        background:
                          "linear-gradient(90deg, rgba(10, 160, 128,0.06), transparent)"
                      }}
                    >
                      <span>Admin Panel</span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#fff",
                          background: "var(--color-primary, #0a7d64)",
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

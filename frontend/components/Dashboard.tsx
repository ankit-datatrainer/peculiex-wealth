"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { fmtINR2, sparkPath, randomSpark, getCompanyDomain, getCompanyLogo } from "@/lib/util";
import { fetchQuotes, type LiveQuote, fmtPrice, fmtPct, fmtCompactINR, isIndex } from "@/lib/markets";

/* ─── Types ─── */
type WatchlistItem = {
  id: string;
  symbol: string;
  name?: string;
  kind?: string;
  price?: number;
  created_at?: string;
};

type DashTab = "overview" | "portfolio" | "markets" | "watchlist" | "settings";

/* ─── Greeting helper ─── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Quick‐stats sparkline component ─── */
function MiniSpark({ vals, up }: { vals: number[]; up: boolean }) {
  const d = sparkPath(vals, 80, 28);
  return (
    <svg viewBox="0 0 80 28" preserveAspectRatio="none" style={{ width: 80, height: 28 }}>
      <path d={d} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState<DashTab>("overview");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [wlLoading, setWlLoading] = useState(true);
  const chartRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPathElement | null>(null);

  // Change Password state
  const { requestChangePassword, verifyChangePassword } = useAuth();
  const [cpStep, setCpStep] = useState<"idle" | "otp" | "done">("idle");
  const [cpOtp, setCpOtp] = useState("");
  const [cpNewPassword, setCpNewPassword] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);

  /* Build portfolio chart */
  useEffect(() => {
    if (!chartRef.current || !areaRef.current) return;
    const vals: number[] = [];
    let v = 100;
    for (let i = 0; i < 50; i++) {
      v += (Math.random() - 0.35) * 6;
      vals.push(v);
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const r = max - min || 1;
    const w = 600;
    const h = 180;
    const path = vals
      .map((y, i) => {
        const x = (i / (vals.length - 1)) * w;
        const yy = h - ((y - min) / r) * (h - 20) - 10;
        return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + yy.toFixed(1);
      })
      .join(" ");
    chartRef.current.setAttribute("d", path);
    areaRef.current.setAttribute("d", `${path} L${w},${h} L0,${h} Z`);
  }, [tab]);

  /* Fetch watchlist */
  useEffect(() => {
    if (!ready || !user) return;
    setWlLoading(true);
    apiFetch<{ items: WatchlistItem[] }>("/api/watchlist")
      .then((r) => setWatchlist(r.items || []))
      .catch(() => setWatchlist([]))
      .finally(() => setWlLoading(false));
  }, [ready, user]);

  /* Fetch live quotes for watchlist symbols */
  useEffect(() => {
    if (!watchlist.length) return;
    const listedSyms = watchlist
      .filter((w) => w.kind !== "unlisted")
      .map((w) => w.symbol);
    if (!listedSyms.length) return;
    fetchQuotes(listedSyms)
      .then((qs) => {
        const map: Record<string, LiveQuote> = {};
        qs.forEach((q) => {
          map[q.symbol] = q;
        });
        setQuotes(map);
      })
      .catch(() => {});
  }, [watchlist]);

  /* ─── Computed values ─── */
  const firstName = user?.name?.split(" ")[0] || "User";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Portfolio metrics from watchlist
  const portfolioValue = useMemo(() => {
    let total = 0;
    watchlist.forEach((w) => {
      const q = quotes[w.symbol];
      if (q?.price) total += q.price;
      else if (w.price) total += w.price;
    });
    return total;
  }, [watchlist, quotes]);

  const todayPnL = useMemo(() => {
    let pnl = 0;
    watchlist.forEach((w) => {
      const q = quotes[w.symbol];
      if (q?.change) pnl += q.change;
    });
    return pnl;
  }, [watchlist, quotes]);

  const gainers = useMemo(() => {
    return watchlist
      .map((w) => ({ ...w, quote: quotes[w.symbol] }))
      .filter((w) => w.quote && (w.quote.changePercent ?? 0) > 0)
      .sort(
        (a, b) =>
          (b.quote?.changePercent ?? 0) - (a.quote?.changePercent ?? 0)
      );
  }, [watchlist, quotes]);

  const losers = useMemo(() => {
    return watchlist
      .map((w) => ({ ...w, quote: quotes[w.symbol] }))
      .filter((w) => w.quote && (w.quote.changePercent ?? 0) < 0)
      .sort(
        (a, b) =>
          (a.quote?.changePercent ?? 0) - (b.quote?.changePercent ?? 0)
      );
  }, [watchlist, quotes]);

  /* ─── Not logged in ─── */
  if (ready && !user) {
    return (
      <section className="ud-section">
        <div className="container">
          <div className="ud-login-prompt">
            <div className="ud-prompt-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2>Welcome to Peculiex</h2>
            <p>Please sign in to access your personalized dashboard with live portfolio tracking, watchlist management, and market insights.</p>
            <div className="ud-prompt-actions">
              <Link href="/login" className="btn btn-primary">Sign In</Link>
              <Link href="/signup" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Loading ─── */
  if (!ready) {
    return (
      <section className="ud-section">
        <div className="container">
          <div className="ud-loading">
            <div className="ud-loader" />
            <p>Loading your dashboard…</p>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Sidebar menu items ─── */
  const menuItems: { key: DashTab; icon: string; label: string }[] = [
    { key: "overview", icon: "#i-grid", label: "Overview" },
    { key: "portfolio", icon: "#i-pie", label: "Portfolio" },
    { key: "markets", icon: "#i-line-chart", label: "Markets" },
    { key: "watchlist", icon: "#i-star", label: "Watchlist" },
    { key: "settings", icon: "#i-settings", label: "Settings" },
  ];

  return (
    <section className="ud-section">
      <div className="container">
        <div className="ud-shell">
          {/* ─── Sidebar ─── */}
          <aside className="ud-sidebar">
            <div className="ud-sidebar-brand">
              <Link href="/">PECULI<em>EX</em></Link>
              <span>Dashboard</span>
            </div>

            <div className="ud-user-card">
              <div className="ud-avatar" style={{ background: "#01696f" }}>
                {initials}
              </div>
              <div className="ud-user-info">
                <strong>{user?.name || "User"}</strong>
                <small>{user?.email}</small>
              </div>
            </div>

            <nav className="ud-nav">
              {menuItems.map((m) => (
                <button
                  key={m.key}
                  className={`ud-nav-item${tab === m.key ? " active" : ""}`}
                  onClick={() => setTab(m.key)}
                  type="button"
                >
                  <svg className="ud-nav-icon">
                    <use href={m.icon} />
                  </svg>
                  {m.label}
                </button>
              ))}
            </nav>

            <div className="ud-sidebar-footer">
              <Link href="/watchlist" className="ud-sidebar-link">
                <svg className="ud-nav-icon"><use href="#i-star" /></svg>
                Full Watchlist
              </Link>
              <Link href="/markets" className="ud-sidebar-link">
                <svg className="ud-nav-icon"><use href="#i-line-chart" /></svg>
                All Markets
              </Link>
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <main className="ud-main">
            {/* Greeting */}
            <header className="ud-header">
              <div>
                <h1 className="ud-greeting">
                  {getGreeting()}, <em>{firstName}</em>
                </h1>
                <p className="ud-sub">
                  {watchlist.length > 0
                    ? `You have ${watchlist.length} stock${watchlist.length !== 1 ? "s" : ""} in your watchlist.`
                    : "Start building your watchlist to track stocks here."}
                </p>
              </div>
              <div className="ud-header-actions">
                <Link href="/markets" className="btn btn-outline btn-sm">Explore Markets</Link>
                <Link href="/watchlist" className="btn btn-primary btn-sm">My Watchlist</Link>
              </div>
            </header>

            {/* ─── Overview Tab ─── */}
            {tab === "overview" && (
              <div className="ud-tab-content">
                {/* KPI Cards */}
                <div className="ud-kpis">
                  <div className="ud-kpi">
                    <div className="ud-kpi-label">Watchlist Stocks</div>
                    <div className="ud-kpi-value">{watchlist.length}</div>
                    <div className="ud-kpi-sub">
                      <Link href="/watchlist">View all →</Link>
                    </div>
                  </div>
                  <div className="ud-kpi">
                    <div className="ud-kpi-label">Today&apos;s P&amp;L</div>
                    <div className={`ud-kpi-value ${todayPnL >= 0 ? "up" : "dn"}`}>
                      {todayPnL >= 0 ? "+" : "−"}₹{Math.abs(todayPnL).toFixed(2)}
                    </div>
                    <div className="ud-kpi-sub">
                      <span className={todayPnL >= 0 ? "up" : "dn"}>
                        {todayPnL >= 0 ? "↑" : "↓"} Across watchlist
                      </span>
                    </div>
                  </div>
                  <div className="ud-kpi">
                    <div className="ud-kpi-label">Top Gainers</div>
                    <div className="ud-kpi-value up">{gainers.length}</div>
                    <div className="ud-kpi-sub">
                      {gainers[0]?.symbol || "—"}
                    </div>
                  </div>
                  <div className="ud-kpi">
                    <div className="ud-kpi-label">Top Losers</div>
                    <div className="ud-kpi-value dn">{losers.length}</div>
                    <div className="ud-kpi-sub">
                      {losers[0]?.symbol || "—"}
                    </div>
                  </div>
                </div>

                <div className="ud-grid-2">
                  {/* Portfolio Chart */}
                  <div className="ud-card">
                    <div className="ud-card-head">
                      <h3>Portfolio Trend</h3>
                      <span className="ud-badge up">Live</span>
                    </div>
                    <svg
                      className="ud-chart-svg"
                      viewBox="0 0 600 180"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="udGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#01696f" stopOpacity=".25" />
                          <stop offset="100%" stopColor="#01696f" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path fill="url(#udGrad)" d="" ref={areaRef as any} />
                      <path
                        fill="none"
                        stroke="#01696f"
                        strokeWidth="2"
                        d=""
                        ref={chartRef as any}
                      />
                    </svg>
                  </div>

                  {/* Quick Actions */}
                  <div className="ud-card">
                    <div className="ud-card-head">
                      <h3>Quick Actions</h3>
                    </div>
                    <div className="ud-quick-actions">
                      <Link href="/markets" className="ud-action-btn">
                        <div className="ud-action-icon" style={{ background: "linear-gradient(135deg, #01696f, #0ea5e9)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                        <span>Live Markets</span>
                      </Link>
                      <Link href="/watchlist" className="ud-action-btn">
                        <div className="ud-action-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                        <span>Watchlist</span>
                      </Link>
                      <Link href="/calculator" className="ud-action-btn">
                        <div className="ud-action-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
                        </div>
                        <span>SIP Calculator</span>
                      </Link>
                      <Link href="/unlisted" className="ud-action-btn">
                        <div className="ud-action-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>
                        <span>Pre-IPO</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Watchlist Snapshot */}
                <div className="ud-card">
                  <div className="ud-card-head">
                    <h3>Watchlist Snapshot</h3>
                    <Link href="/watchlist" className="ud-link">View All →</Link>
                  </div>
                  {wlLoading ? (
                    <div className="ud-empty">Loading watchlist…</div>
                  ) : watchlist.length === 0 ? (
                    <div className="ud-empty">
                      <p>Your watchlist is empty.</p>
                      <Link href="/markets" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                        Browse Markets
                      </Link>
                    </div>
                  ) : (
                    <div className="ud-wl-table">
                      <div className="ud-wl-thead">
                        <span>Stock</span>
                        <span>Price</span>
                        <span>Change</span>
                        <span>Trend</span>
                      </div>
                      {watchlist.slice(0, 8).map((w, i) => {
                        const q = quotes[w.symbol];
                        const price = q?.price ?? w.price ?? 0;
                        const chg = q?.changePercent ?? 0;
                        const up = chg >= 0;
                        const spark = randomSpark(i * 7);
                        return (
                          <Link
                            href={`/markets/${encodeURIComponent(w.symbol)}`}
                            className="ud-wl-row"
                            key={w.id || w.symbol}
                          >
                            <span className="ud-wl-stock">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image
                                src={getCompanyLogo(getCompanyDomain(w.symbol, w.name || w.symbol))}
                                alt=""
                                className="ud-wl-logo"
                                width={32}
                                height={32}
                                onError={(e) => {
                                  const t = e.currentTarget as HTMLImageElement;
                                  if (!t.src.includes("google.com")) {
                                    t.src = getCompanyLogo(getCompanyDomain(w.symbol, w.name || w.symbol));
                                  } else {
                                    t.style.display = "none";
                                    const fb = t.nextElementSibling as HTMLElement | null;
                                    if (fb) fb.style.display = "grid";
                                  }
                                }}
                              />
                              <span className="ud-wl-logo-fb" style={{ display: "none" }}>
                                {w.symbol.slice(0, 2)}
                              </span>
                              <span>
                                <strong>{w.name || w.symbol}</strong>
                                <small>{w.symbol}</small>
                              </span>
                            </span>
                            <div className="ud-wl-price-col">
                              <span className="ud-wl-price">{isIndex(w.symbol) ? "" : "₹"}{fmtINR2(price)}</span>
                              <span className={`ud-wl-chg ${up ? "up" : "dn"}`}>
                                {up ? "+" : "−"}{Math.abs(chg).toFixed(2)}%
                              </span>
                            </div>
                            <span className="ud-wl-spark">
                              <MiniSpark vals={spark} up={up} />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Market Insights */}
                <div className="ud-grid-3">
                  <div className="ud-card ud-insight-card">
                    <div className="ud-insight-icon" style={{ background: "linear-gradient(135deg, #01696f, #0ea5e9)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <h4>Market Hours</h4>
                    <p>NSE/BSE trading hours: <strong>9:15 AM – 3:30 PM IST</strong></p>
                    <small>Monday to Friday (except holidays)</small>
                  </div>
                  <div className="ud-card ud-insight-card">
                    <div className="ud-insight-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2 1 3.9 2.5 5.2a5.5 5.5 0 0 1 1.5 3.8v2h6v-2a5.5 5.5 0 0 1 1.5-3.8A7 7 0 0 0 12 2z"/></svg>
                    </div>
                    <h4>Pro Tip</h4>
                    <p>Add stocks to your watchlist to track them here in real-time.</p>
                    <small>Use the ★ button on any stock page</small>
                  </div>
                  <div className="ud-card ud-insight-card">
                    <div className="ud-insight-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h4>Account Security</h4>
                    <p>Your account is secured with email OTP verification.</p>
                    <small>
                      {user?.email_verified ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-success)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          Email verified
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-danger)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          Verify your email
                        </span>
                      )}
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Portfolio Tab ─── */}
            {tab === "portfolio" && (
              <div className="ud-tab-content">
                <div className="ud-card">
                  <div className="ud-card-head">
                    <h3>Your Portfolio</h3>
                  </div>
                  {watchlist.length === 0 ? (
                    <div className="ud-empty">
                      <p>No holdings found. Start tracking by adding stocks to your watchlist.</p>
                      <Link href="/markets" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                        Browse Markets
                      </Link>
                    </div>
                  ) : (
                    <div className="ud-wl-table">
                      <div className="ud-wl-thead">
                        <span>Stock</span>
                        <span>LTP</span>
                        <span>Change</span>
                        <span>Day Range</span>
                      </div>
                      {watchlist.map((w, i) => {
                        const q = quotes[w.symbol];
                        const price = q?.price ?? w.price ?? 0;
                        const chg = q?.changePercent ?? 0;
                        const up = chg >= 0;
                        const dayH = q?.dayHigh ?? price;
                        const dayL = q?.dayLow ?? price;
                        return (
                          <Link
                            href={`/markets/${encodeURIComponent(w.symbol)}`}
                            className="ud-wl-row"
                            key={w.id || w.symbol}
                          >
                            <span className="ud-wl-stock">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image
                                src={getCompanyLogo(getCompanyDomain(w.symbol, w.name || w.symbol))}
                                alt=""
                                className="ud-wl-logo"
                                width={32}
                                height={32}
                                onError={(e) => {
                                  const t = e.currentTarget as HTMLImageElement;
                                  if (!t.src.includes("google.com")) {
                                    t.src = getCompanyLogo(getCompanyDomain(w.symbol, w.name || w.symbol));
                                  }
                                }}
                              />
                              <span>
                                <strong>{w.name || w.symbol}</strong>
                                <small>{w.symbol}</small>
                              </span>
                            </span>
                            <div className="ud-wl-price-col">
                              <span className="ud-wl-price">{isIndex(w.symbol) ? "" : "₹"}{fmtINR2(price)}</span>
                              <span className={`ud-wl-chg ${up ? "up" : "dn"}`}>
                                {up ? "+" : ""}
                                {chg.toFixed(2)}%
                              </span>
                              {dayL > 0 && dayH > 0 && (
                                <small>{isIndex(w.symbol) ? "" : "₹"}{fmtINR2(dayL)} – {isIndex(w.symbol) ? "" : "₹"}{fmtINR2(dayH)}</small>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Markets Tab ─── */}
            {tab === "markets" && (
              <div className="ud-tab-content">
                <div className="ud-card">
                  <div className="ud-card-head">
                    <h3>Live Markets</h3>
                    <Link href="/markets" className="ud-link">Full View →</Link>
                  </div>
                  <div className="ud-empty">
                    <p>Explore the complete Indian stock market with real-time data.</p>
                    <Link href="/markets" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                      Go to Markets
                    </Link>
                  </div>
                </div>
                <div className="ud-grid-2" style={{ marginTop: 20 }}>
                  <Link href="/unlisted" className="ud-card ud-action-card">
                    <h4>Pre-IPO / Unlisted Shares</h4>
                    <p>Explore exclusive unlisted investment opportunities before they go public.</p>
                    <span className="ud-link">Explore →</span>
                  </Link>
                  <Link href="/calculator" className="ud-card ud-action-card">
                    <h4>SIP Calculator</h4>
                    <p>Plan your systematic investment and calculate potential returns.</p>
                    <span className="ud-link">Calculate →</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ─── Watchlist Tab ─── */}
            {tab === "watchlist" && (
              <div className="ud-tab-content">
                <div className="ud-card">
                  <div className="ud-card-head">
                    <h3>Your Watchlist</h3>
                    <Link href="/watchlist" className="ud-link">Manage →</Link>
                  </div>
                  {wlLoading ? (
                    <div className="ud-empty">Loading…</div>
                  ) : watchlist.length === 0 ? (
                    <div className="ud-empty">
                      <p>No stocks in your watchlist yet.</p>
                      <Link href="/markets" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                        Browse Markets
                      </Link>
                    </div>
                  ) : (
                    <div className="ud-wl-table">
                      <div className="ud-wl-thead">
                        <span>Stock</span>
                        <span>Price</span>
                        <span>Change</span>
                        <span>Trend</span>
                      </div>
                      {watchlist.map((w, i) => {
                        const q = quotes[w.symbol];
                        const price = q?.price ?? w.price ?? 0;
                        const chg = q?.changePercent ?? 0;
                        const up = chg >= 0;
                        const spark = randomSpark(i * 7);
                        return (
                          <Link
                            href={`/markets/${encodeURIComponent(w.symbol)}`}
                            className="ud-wl-row"
                            key={w.id || w.symbol}
                          >
                            <span className="ud-wl-stock">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image
                                src={getCompanyLogo(getCompanyDomain(w.symbol, w.name || w.symbol))}
                                alt=""
                                className="ud-wl-logo"
                                width={32}
                                height={32}
                                onError={(e) => {
                                  const t = e.currentTarget as HTMLImageElement;
                                  if (!t.src.includes("google.com")) {
                                    t.src = getCompanyLogo(getCompanyDomain(w.symbol, w.name || w.symbol));
                                  }
                                }}
                              />
                              <span>
                                <strong>{w.name || w.symbol}</strong>
                                <small>{w.symbol}</small>
                              </span>
                            </span>
                            <div className="ud-wl-price-col">
                              <span className="ud-wl-price">{isIndex(w.symbol) ? "" : "₹"}{fmtINR2(price)}</span>
                              <span className={`ud-wl-chg ${up ? "up" : "dn"}`}>
                                {up ? "+" : "−"}{Math.abs(chg).toFixed(2)}%
                              </span>
                            </div>
                            <span className="ud-wl-spark">
                              <MiniSpark vals={spark} up={up} />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Settings Tab ─── */}
            {tab === "settings" && (
              <div className="ud-tab-content">
                <div className="ud-card">
                  <div className="ud-card-head">
                    <h3>Account Settings</h3>
                  </div>
                  <div className="ud-settings">
                    <div className="ud-setting-row">
                      <label>Full Name</label>
                      <span>{user?.name || "—"}</span>
                    </div>
                    <div className="ud-setting-row">
                      <label>Email</label>
                      <span>
                        {user?.email || "—"}
                        {user?.email_verified && (
                          <span className="ud-verified-badge">✓ Verified</span>
                        )}
                      </span>
                    </div>
                    <div className="ud-setting-row">
                      <label>Mobile</label>
                      <span>{user?.mobile || "Not provided"}</span>
                    </div>
                    <div className="ud-setting-row">
                      <label>Account Type</label>
                      <span className="ud-role-badge">{user?.role || "user"}</span>
                    </div>
                    <div className="ud-setting-row">
                      <label>Watchlist Items</label>
                      <span>{watchlist.length} stocks</span>
                    </div>
                    <div className="ud-setting-row" style={{ borderBottom: "none", paddingTop: 24, paddingBottom: 0 }}>
                      <label>Password</label>
                      <div style={{ flex: 1, maxWidth: 400 }}>
                        {cpStep === "idle" && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={async () => {
                              setCpLoading(true);
                              setCpError(null);
                              try {
                                await requestChangePassword();
                                setCpStep("otp");
                              } catch (e: any) {
                                setCpError(e?.message || "Could not request change.");
                              } finally {
                                setCpLoading(false);
                              }
                            }}
                            disabled={cpLoading}
                          >
                            {cpLoading ? "Sending OTP..." : "Change Password"}
                          </button>
                        )}

                        {cpStep === "otp" && (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (cpOtp.length !== 6 || cpNewPassword.length < 6) {
                                setCpError("Enter 6-digit OTP and at least 6 char password.");
                                return;
                              }
                              setCpLoading(true);
                              setCpError(null);
                              try {
                                await verifyChangePassword(cpOtp, cpNewPassword);
                                setCpStep("done");
                              } catch (e: any) {
                                setCpError(e?.message || "Could not verify change.");
                              } finally {
                                setCpLoading(false);
                              }
                            }}
                            style={{ display: "flex", flexDirection: "column", gap: 12 }}
                          >
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                              We sent a 6-digit OTP to your email. Enter it below along with your new password.
                            </p>
                            <input
                              type="text"
                              placeholder="6-digit OTP"
                              maxLength={6}
                              value={cpOtp}
                              onChange={(e) => setCpOtp(e.target.value.replace(/\D/g, ""))}
                              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}
                            />
                            <input
                              type="password"
                              placeholder="New Password (min 6 chars)"
                              value={cpNewPassword}
                              onChange={(e) => setCpNewPassword(e.target.value)}
                              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}
                            />
                            <div style={{ display: "flex", gap: 12 }}>
                              <button type="submit" className="btn btn-primary btn-sm" disabled={cpLoading}>
                                {cpLoading ? "Verifying..." : "Update Password"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  setCpStep("idle");
                                  setCpOtp("");
                                  setCpNewPassword("");
                                  setCpError(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}

                        {cpStep === "done" && (
                          <div style={{ color: "var(--color-success)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            Password successfully updated!
                          </div>
                        )}

                        {cpError && <div style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: 8 }}>{cpError}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStats, type AdminStats } from "@/lib/admin-api";

const KPIS: Array<{
  key: keyof Omit<AdminStats, "db">;
  label: string;
  href: string;
  hint: string;
}> = [
  { key: "users", label: "Users", href: "/admin/users", hint: "Registered investors" },
  { key: "unlisted", label: "Unlisted Shares", href: "/admin/unlisted", hint: "Inventory items" },
  { key: "leads", label: "Leads", href: "/admin/leads", hint: "Onboarding submissions" },
  { key: "newsletter", label: "Newsletter", href: "/admin/newsletter", hint: "Email subscribers" },
  { key: "contact", label: "Messages", href: "/admin/contact", hint: "Contact form replies" }
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let killed = false;
    setLoading(true);
    fetchStats()
      .then((s) => {
        if (!killed) setStats(s);
      })
      .catch((e) => {
        if (!killed) setError(e?.message || "Could not load stats");
      })
      .finally(() => {
        if (!killed) setLoading(false);
      });
    return () => {
      killed = true;
    };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page-sub">
            Overview of platform activity and content inventory.
          </p>
        </div>
        {stats && (
          <span
            className={`admin-pill ${
              stats.db === "connected" ? "admin-pill-ok" : "admin-pill-warn"
            }`}
          >
            DB: {stats.db}
          </span>
        )}
      </header>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-kpi-grid">
        {KPIS.map((k) => (
          <Link className="admin-kpi" key={k.key} href={k.href}>
            <div className="admin-kpi-label">{k.label}</div>
            <div className="admin-kpi-value">
              {loading ? "—" : stats ? stats[k.key] : "—"}
            </div>
            <div className="admin-kpi-hint">{k.hint}</div>
          </Link>
        ))}
      </div>

      <section className="admin-card">
        <h2>Quick actions</h2>
        <p className="admin-page-sub">
          Jump straight into the most common tasks.
        </p>
        <div className="admin-quick">
          <Link href="/admin/unlisted" className="btn btn-primary">
            Add unlisted share
          </Link>
          <Link href="/admin/users" className="btn btn-outline">
            Manage users
          </Link>
          <Link href="/admin/leads" className="btn btn-outline">
            View leads
          </Link>
        </div>
      </section>
    </div>
  );
}

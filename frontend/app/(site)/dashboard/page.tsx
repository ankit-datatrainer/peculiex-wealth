import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard. Your Wealth at a Glance",
  description:
    "A unified portfolio view across all asset classes with performance analytics, allocation insights, and real-time tracking.",
  // Signed-in view: a crawler only ever sees the logged-out shell, so indexing
  // this yields a thin page competing with the real landing pages.
  robots: { index: false, follow: true }
};

export default function DashboardPage() {
  return <Dashboard />;
}

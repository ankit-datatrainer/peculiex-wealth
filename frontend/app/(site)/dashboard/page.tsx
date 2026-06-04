import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Your Wealth at a Glance",
  description:
    "A unified portfolio view across all asset classes with performance analytics, allocation insights, and real-time tracking."
};

export default function DashboardPage() {
  return <Dashboard />;
}

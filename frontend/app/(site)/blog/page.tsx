import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BlogListingClient from "./BlogListingClient";

export const metadata: Metadata = pageMeta({
  title: "Blog",
  description:
    "Insights, market analysis, and investment perspectives from the Finvoq team. Stay informed with our latest articles on wealth management, unlisted shares, and financial planning.",
  path: "/blog",
  ogTitle: "Blog — Finvoq"
});

export default function BlogPage() {
  return <BlogListingClient />;
}

import type { Metadata } from "next";
import ArticlePage from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "Financial News Reader — Finvoq",
  description: "Read clean, distraction-free financial updates, stock market trends, and economic news."
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ArticlePage params={{ slug: params.slug }} />;
}

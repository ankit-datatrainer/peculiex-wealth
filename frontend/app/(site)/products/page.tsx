import type { Metadata } from "next";
import ProductsPage from "@/components/ProductsPage";

export const metadata: Metadata = {
  title: "Products — Finvoq",
  description: "Explore our comprehensive suite of financial products designed to build, protect, and grow your wealth."
};

export default function ProductsRoute() {
  return <ProductsPage />;
}

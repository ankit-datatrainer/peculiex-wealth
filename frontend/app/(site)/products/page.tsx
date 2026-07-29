import type { Metadata } from "next";
import ProductsPage from "@/components/ProductsPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Products — mutual funds, PMS, AIF, bonds & more",
  description:
    "Compare every asset class Finvoq offers: mutual funds, PMS, AIF, bonds, listed and unlisted equity and insurance, each with real diligence and clearly stated costs.",
  path: "/products"
});

export default function ProductsRoute() {
  return <ProductsPage />;
}

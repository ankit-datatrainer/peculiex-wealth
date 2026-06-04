"use client";

import Link from "next/link";
import { PRODUCTS } from "@/lib/productContent";
import "./products.css";

// Maps to the icons used in Marketplace.tsx
const PRODUCT_ICONS: Record<string, string> = {
  equities: "i-trending-up",
  "unlisted-shares": "i-lock",
  "mutual-funds": "i-bar-chart",
  "pms-aif": "i-gem",
  bonds: "i-building",
  insurance: "i-shield",
  "real-estate": "i-home",
  "gold-commodities": "i-coin"
};

export default function ProductsPage() {
  const productSlugs = Object.keys(PRODUCTS);

  return (
    <main className="products-page">
      <div className="container">
        {/* Hero Section */}
        <section className="products-hero reveal">
          <span className="label">Our Marketplace</span>
          <h1>
            Wealth creation, <em>simplified.</em>
          </h1>
          <p>
            Explore our comprehensive suite of financial products designed to build, protect, and grow your wealth.
          </p>
        </section>

        {/* Product List */}
        <section className="products-list">
          {productSlugs.map((slug) => {
            const product = PRODUCTS[slug];
            const iconId = PRODUCT_ICONS[slug] || "i-trending-up";

            return (
              <article key={slug} className="product-row reveal" data-tilt>
                <div className="product-content">
                  <h2>{product.label}</h2>
                  <p className="subtitle">{product.subtitle}</p>
                  
                  {/* Metrics */}
                  <div className="product-metrics">
                    {product.metrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="metric-item">
                        <div className="metric-val">{m.value}</div>
                        <div className="metric-lbl">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Highlights preview */}
                  <ul className="product-features">
                    {product.highlights.slice(0, 3).map((h, idx) => (
                      <li key={idx}>
                        <strong>{h.title}:</strong> {h.body.substring(0, 70)}...
                      </li>
                    ))}
                  </ul>

                  <Link href={`/products/${slug}`} className="btn btn-primary">
                    {product.cta.label}
                  </Link>
                </div>

                <div className="product-visual">
                  <div className="visual-icon">
                    <svg>
                      <use href={`#${iconId}`} />
                    </svg>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

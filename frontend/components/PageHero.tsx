"use client";

import Logo from "./Logo";
import { useContent, accent } from "@/lib/content";

type Props = {
  label: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  /**
   * Content-manager key for this page. When set, the super admin's saved
   * copy replaces the props above; anything they have not edited falls back
   * to what is passed in here, so the page never renders empty.
   */
  page?: string;
};

/** "Wealth management, *without the markup.*" -> JSX with the <em> accent. */
function renderAccented(text: string) {
  return accent(text).map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <em key={i}>{part.em}</em>
    )
  );
}

export default function PageHero({ label, title, subtitle, align = "left", page }: Props) {
  const c = useContent(page || "");
  const center = align === "center";

  const cmsLabel = page ? c.t("hero", "label") : "";
  const cmsTitle = page ? c.t("hero", "title") : "";
  const cmsSubtitle = page ? c.t("hero", "subtitle") : "";

  return (
    <section className="page-hero">
      <div className="container">
        <div className={`sec-head${center ? " sec-head-center" : ""}`}>
          {/* Finvoq branding above the page heading */}
          <Logo
            width={148}
            height={58}
            className="page-hero-logo"
            style={center ? { margin: "0 auto 22px" } : { margin: "0 0 22px" }}
          />
          <div className="label">{cmsLabel || label}</div>
          {/* Floor is 1.8rem, not 2.4rem: 5vw already resolves to 3.2rem at the
              1024px desktop breakpoint, so the floor only ever engages on
              phones/small tablets and the desktop render is unchanged. */}
          <h1 className="stitle" style={{ fontSize: "clamp(1.8rem, 5vw, 3.6rem)" }}>
            {cmsTitle ? renderAccented(cmsTitle) : title}
          </h1>
          {(cmsSubtitle || subtitle) && (
            <p className="sdesc">{cmsSubtitle || subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}

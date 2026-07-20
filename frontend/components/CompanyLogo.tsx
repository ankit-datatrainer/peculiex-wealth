"use client";

import { useState } from "react";
import { getCompanyDomain, getCompanyLogo } from "@/lib/util";

type Props = {
  symbol: string;
  name?: string | null;
  size?: number;
  /** Rounded-square (Groww-style) by default; set true for a circle. */
  round?: boolean;
};

/**
 * Company logo tile for a listed instrument.
 *
 * Remote logo lookups are best-effort (we resolve a domain from the ticker,
 * which can't be right for every listing), so this always renders a branded
 * fallback tile underneath — a deterministic colour derived from the symbol
 * plus the company initial. The <img> simply paints over it when it loads,
 * which means a failed/slow logo degrades to something intentional-looking
 * instead of an empty box.
 */
export default function CompanyLogo({
  symbol,
  name,
  size = 48,
  round = false
}: Props) {
  const [failed, setFailed] = useState(false);

  const base = (symbol || "").split(".")[0];
  const initial = (name || base || "?").trim().charAt(0).toUpperCase();
  const src = getCompanyLogo(getCompanyDomain(symbol, name || ""));

  // Deterministic hue per symbol so a company always gets the same colour.
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;

  return (
    <span
      className="company-logo"
      style={{
        width: size,
        height: size,
        borderRadius: round ? "50%" : Math.round(size * 0.26),
        background: `linear-gradient(135deg, hsl(${hue} 58% 42%), hsl(${(hue + 38) % 360} 54% 32%))`,
        fontSize: Math.round(size * 0.42)
      }}
      aria-hidden="true"
    >
      <span className="company-logo-initial">{initial}</span>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="company-logo-img"
          style={{ borderRadius: round ? "50%" : Math.round(size * 0.26) }}
        />
      )}
    </span>
  );
}

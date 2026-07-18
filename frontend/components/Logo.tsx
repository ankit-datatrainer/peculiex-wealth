"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Theme-aware logo component.
 * Shows logo_light.svg in light mode and logo_dark.svg in dark mode.
 */
export default function Logo({
  width = 140,
  height = 56,
  className = "",
  forceLight = false,
}: {
  width?: number;
  height?: number;
  className?: string;
  /** Always use the light-mode (dark-ink) logo, e.g. on a surface that stays
   *  white in both themes (like the floating nav pill). */
  forceLight?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Before mounting, render the light logo as a safe default (avoids hydration mismatch)
  const src = !forceLight && mounted && resolvedTheme === "dark"
    ? "/logo_dark.svg"
    : "/logo_light.svg";

  return (
    <img
      src={src}
      alt="Finvoq"
      width={width}
      height={height}
      className={className}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

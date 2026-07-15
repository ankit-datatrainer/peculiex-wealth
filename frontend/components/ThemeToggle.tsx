"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  // resolvedTheme, not theme: with enableSystem the stored value can be
  // "system", in which case `theme` is neither "light" nor "dark" and a
  // comparison against it silently picks the wrong branch.
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 36, height: 36 }} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 36,
        height: 36,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        border: "1px solid var(--color-border, rgba(0,0,0,0.08))",
        background: "var(--color-surface, #fff)",
        color: "var(--color-text, #131313)",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

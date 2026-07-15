"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Switches the whole site into dark mode when a premium (PMS/AIF) page is
 * opened. The change is persisted by next-themes, so the rest of the site
 * stays dark as the user navigates on — these pages set the site's theme
 * rather than theming themselves in isolation.
 *
 * Mount-only on purpose: re-running would fight the user if they choose to
 * toggle back to light while still on the page.
 */
export default function PremiumThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

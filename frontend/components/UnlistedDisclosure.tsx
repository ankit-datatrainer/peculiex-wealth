"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function UnlistedDisclosure() {
  const pathname = usePathname();
  const unlisted = pathname === "/unlisted" || pathname?.startsWith("/unlisted/");
  const ref = useRef<HTMLElement>(null);

  // Account for wrapping and text zoom when positioning the main navigation.
  useLayoutEffect(() => {
    const bar = ref.current;
    if (!unlisted || !bar) return;
    const update = () => {
      document.body.style.setProperty("--unlisted-disclosure-height", `${bar.offsetHeight}px`);
    };
    const observer = new ResizeObserver(update);
    update();
    observer.observe(bar);
    return () => {
      observer.disconnect();
      document.body.style.removeProperty("--unlisted-disclosure-height");
    };
  }, [unlisted]);

  if (!unlisted) return null;
  return (
    <aside ref={ref} className="unlisted-disclosure" aria-label="Unlisted share disclosure">
      <span>An <strong>information platform</strong> for unlisted &amp; pre-IPO shares</span>
      <span><strong>Not</strong> a SEBI-recognised stock exchange or trading platform</span>
      <span>All prices are <strong>indicative</strong></span>
    </aside>
  );
}

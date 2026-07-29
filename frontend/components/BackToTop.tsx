"use client";
import { useEffect, useRef } from "react";

/** Circumference of the r=24 ring, used to drive stroke-dashoffset. */
const RING = 2 * Math.PI * 24;

export default function BackToTop() {
  const ref = useRef<HTMLButtonElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = () => {
      btn.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
      // The ring traces how far through the page the reader is.
      const ring = ringRef.current;
      if (ring) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        ring.style.strokeDashoffset = String(RING * (1 - p));
      }
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    const onClick = () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    btn.addEventListener("click", onClick);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      btn.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <button
      className="back-top"
      id="backTop"
      type="button"
      aria-label="Back to top"
      ref={ref}
    >
      <svg className="back-top-ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle
          ref={ringRef}
          cx="26"
          cy="26"
          r="24"
          style={{ strokeDasharray: RING, strokeDashoffset: RING }}
        />
      </svg>
      <svg className="back-top-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

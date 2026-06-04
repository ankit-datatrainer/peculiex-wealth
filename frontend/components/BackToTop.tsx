"use client";
import { useEffect, useRef } from "react";

export default function BackToTop() {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () =>
      btn.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
    addEventListener("scroll", onScroll, { passive: true });
    const onClick = () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    btn.addEventListener("click", onClick);
    return () => {
      removeEventListener("scroll", onScroll);
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
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

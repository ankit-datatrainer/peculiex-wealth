"use client";
import { useEffect, useRef, useState } from "react";

export default function Preloader() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Smoothly climb toward 90% while loading; snap to 100% on dismiss.
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const target = Math.min(90, (elapsed / 1800) * 90);
      setPct((p) => (p < target ? Math.ceil(target) : p));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const dismiss = () => {
      cancelAnimationFrame(raf);
      setPct(100);
      setTimeout(() => ref.current?.classList.add("gone"), 260);
    };
    if (document.readyState === "complete") {
      const t = setTimeout(dismiss, 400);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }
    const onLoad = () => setTimeout(dismiss, 600);
    window.addEventListener("load", onLoad);
    const hard = setTimeout(dismiss, 2200);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      clearTimeout(hard);
    };
  }, []);

  return (
    <div className="preloader" id="preloader" ref={ref}>
      <div className="pre-inner">
        <div className="pre-logo">
          <span className="pre-letter">f</span>
          <span className="pre-letter">i</span>
          <span className="pre-letter">n</span>
          <span className="pre-letter">v</span>
          <span className="pre-letter">o</span>
          <span className="pre-letter pre-em">q</span>
        </div>
        <div className="pre-bar">
          <span style={{ width: `${pct}%` }}></span>
        </div>
        <div className="pre-status">
          <span>Curating markets…</span>
          <span className="pre-pct">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

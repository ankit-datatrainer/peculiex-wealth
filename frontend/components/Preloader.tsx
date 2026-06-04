"use client";
import { useEffect, useRef } from "react";

export default function Preloader() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dismiss = () => ref.current?.classList.add("gone");
    if (document.readyState === "complete") {
      const t = setTimeout(dismiss, 400);
      return () => clearTimeout(t);
    }
    const onLoad = () => setTimeout(dismiss, 600);
    window.addEventListener("load", onLoad);
    const hard = setTimeout(dismiss, 2200);
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(hard);
    };
  }, []);

  return (
    <div className="preloader" id="preloader" ref={ref}>
      <div className="pre-inner">
        <div className="pre-logo">
          <span className="pre-letter">P</span>
          <span className="pre-letter">E</span>
          <span className="pre-letter">C</span>
          <span className="pre-letter">U</span>
          <span className="pre-letter">L</span>
          <span className="pre-letter">I</span>
          <span className="pre-letter pre-em">E</span>
          <span className="pre-letter pre-em">X</span>
        </div>
        <div className="pre-bar">
          <span></span>
        </div>
        <div className="pre-status">Curating markets…</div>
      </div>
    </div>
  );
}

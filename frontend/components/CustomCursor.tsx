"use client";
import { useEffect, useRef } from "react";
import { lerp } from "@/lib/util";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || reduceMotion) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx,
      ry = my,
      dx = mx,
      dy = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const tick = () => {
      dx = lerp(dx, mx, 0.35);
      dy = lerp(dy, my, 0.35);
      rx = lerp(rx, mx, 0.14);
      ry = lerp(ry, my, 0.14);
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    const sel =
      "a, button, .product, .stock, .unl-card, .insight, .kpi, .chip, [data-magnetic], input, select, textarea, .dash-menu li";
    const handleEnter = () => {
      ring.classList.add("hover");
      dot.classList.add("hover");
    };
    const handleLeave = () => {
      ring.classList.remove("hover");
      dot.classList.remove("hover");
    };

    // delegated listener: walk up to nearest matching ancestor
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest && t.closest(sel)) handleEnter();
    };
    const onOut = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest && t.closest(sel)) handleLeave();
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" id="cursorDot" ref={dotRef} />
      <div className="cursor-ring" id="cursorRing" ref={ringRef} />
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Static golden infinity for the homepage hero.
 *
 * Drawn once to a transparent canvas — no animation loop, no rAF. The look
 * comes from stacking ~110 stroked lemniscate paths, each offset a little
 * perpendicular to the ideal curve, which is what produces the many fine
 * parallel strands of the reference art rather than a single fat outline.
 *
 * Two details do most of the work:
 *
 *  · The ribbon's width is modulated along the curve by `envelope()`, so it
 *    swells across the two lobes and pinches at the crossing. A constant
 *    width reads as a flat cartoon ribbon; the pinch is what makes it look
 *    like a real light-painting caught mid-sweep.
 *  · Strand colour walks the gold ramp from deep bronze at the outer edges to
 *    near-white at the centre, so the bundle has depth instead of looking
 *    like one colour at one opacity.
 *
 * The canvas is never filled, only stroked, so the background stays fully
 * transparent and the hero's white ground and green pigment show through.
 *
 * Decorative: hidden from assistive tech.
 */

const TAU = Math.PI * 2;
const STRANDS = 112;
const STEPS = 240;

/** Deep bronze → near-white gold. Index 0 is the outer edge of the bundle. */
const RAMP: [number, number, number][] = [
  [120, 78, 12],
  [163, 112, 22],
  [201, 155, 44],
  [231, 189, 74],
  [248, 218, 120],
  [255, 246, 205]
];

function rampAt(u: number): [number, number, number] {
  const x = Math.min(0.9999, Math.max(0, u)) * (RAMP.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = RAMP[i];
  const b = RAMP[Math.min(RAMP.length - 1, i + 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f)
  ];
}

/** Deterministic pseudo-random — identical picture on every render. */
const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export default function GoldInfinity() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const A = w * 0.44;
      const B = h * 0.88;
      const spread = h * 0.2;

      /* Ribbon half-width along the curve: widest across the lobes, pinched
         to almost nothing where the two strands cross at the centre. */
      const envelope = (t: number) => 0.16 + 0.84 * Math.abs(Math.cos(t));

      /* Gerono lemniscate with a perpendicular offset.
         x = A·cos t , y = (B/2)·sin 2t */
      const at = (t: number, off: number) => {
        const x = A * Math.cos(t);
        const y = (B / 2) * Math.sin(2 * t);
        const dx = -A * Math.sin(t);
        const dy = B * Math.cos(2 * t);
        const len = Math.hypot(dx, dy) || 1;
        const o = off * envelope(t) * spread;
        return { x: cx + x + (-dy / len) * o, y: cy + y + (dx / len) * o };
      };

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // ── Strand bundle ───────────────────────────────────────────────
      for (let s = 0; s < STRANDS; s++) {
        const u = s / (STRANDS - 1); // 0..1 across the ribbon
        const off = u * 2 - 1; // -1..1
        // Brightness peaks mid-bundle and falls to the edges.
        const centreness = 1 - Math.abs(off);
        // Jitter each strand slightly so the bundle isn't mechanically even.
        const wobble = (rnd(s, 1) - 0.5) * 0.06;
        const [r, g, b] = rampAt(centreness * 0.85 + rnd(s, 2) * 0.15);
        const alpha = 0.05 + centreness * 0.3 + rnd(s, 3) * 0.06;

        ctx.beginPath();
        for (let i = 0; i <= STEPS; i++) {
          const t = (i / STEPS) * TAU;
          const p = at(t, off + wobble);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 0.6 + rnd(s, 4) * 1.1;
        ctx.stroke();
      }

      // ── Bright core along the ideal path ────────────────────────────
      ctx.beginPath();
      for (let i = 0; i <= STEPS; i++) {
        const t = (i / STEPS) * TAU;
        const p = at(t, 0);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "rgba(255, 248, 222, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Sparkles ───────────────────────────────────────────────────
      const SPARKS = 260;
      for (let i = 0; i < SPARKS; i++) {
        const t = rnd(i, 11) * TAU;
        const off = (rnd(i, 12) * 2 - 1) * 0.96;
        const p = at(t, off);
        const size = 0.4 + rnd(i, 13) * 1.5;
        const bright = 0.25 + rnd(i, 14) * 0.65;
        const [r, g, b] = rampAt(0.55 + rnd(i, 15) * 0.45);
        // halo then core, so the brighter sparks read as points of light
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bright * 0.16})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 250, 228, ${bright})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, TAU);
        ctx.fill();
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="gi" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} className="gi-canvas" />
      <style jsx>{`
        .gi {
          position: relative;
          width: 100%;
          aspect-ratio: 1.62 / 1;
          /* Warm bloom beneath the strands so the gold reads as emitting
             light rather than being drawn in gold ink. */
          background: radial-gradient(
            56% 58% at 50% 50%,
            rgba(212, 175, 55, 0.13),
            rgba(212, 175, 55, 0.045) 46%,
            transparent 72%
          );
        }
        .gi-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

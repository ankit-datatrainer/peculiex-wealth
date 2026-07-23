"use client";

import { useEffect, useRef } from "react";

/**
 * SecuredFi-style scroll globe — studied frame by frame from the reference:
 *
 *  p 0..1  HERO      solid dark planet docked at the bottom of the blue
 *                    screen, bright cyan wave-band across its surface; as you
 *                    scroll it rises + shrinks to a full centred sphere while
 *                    the page background cross-fades blue → deep navy.
 *  p 1..2  SCREEN 1  sphere slides left, copy sits right ("New era…").
 *  p 2..3  SCREEN 2  sphere dissolves into a diagonal particle WAVE sweeping
 *                    to the right, copy sits left ("Every asset…").
 *  p 3..4  SCREEN 3  wave twists into a HELIX on the left, copy right
 *                    ("Building your future").
 *  p 4..5  EXIT      helix disperses into a full-screen starfield.
 *
 * The canvas also paints the page background (blue → navy) so the planet
 * reads as sitting ON the blue hero exactly like the reference.
 * Palette is intentionally fixed — homepage only, theme-independent.
 */

const BLUE = [88, 92, 246]; // hero indigo  ~ oklch(0.56 0.24 275)
const NAVY = [9, 14, 36]; //  page base    ~ oklch(0.10 0.05 265)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

export default function ScrollGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = 6000;
    let W = 0,
      H = 0,
      DPR = 1;
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Fibonacci sphere + per-point longitude for the surface wave-band
    const sphere: { x: number; y: number; z: number; lon: number }[] = [];
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      sphere.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        lon: theta % (Math.PI * 2)
      });
    }

    // Diagonal wave — a broad band undulating from lower-left to upper-right
    const wave: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const u = (t * 14) % 1;
      const row = Math.floor(t * 14);
      const x = (u - 0.5) * 3.4;
      const diag = -x * 0.34; // tilt the band
      const y =
        diag +
        Math.sin(x * 1.5 + row * 0.42) * 0.34 +
        (row - 7) * 0.05 +
        Math.sin(i * 0.71) * 0.04;
      const z =
        Math.cos(x * 1.5 + row * 0.42) * 0.38 + Math.sin(i * 0.29) * 0.12;
      wave.push({ x, y, z });
    }

    // Helix / DNA
    const helix: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const strand = i % 2 === 0 ? 0 : Math.PI;
      const a = t * Math.PI * 8 + strand;
      const jitter = (i % 7) * 0.006;
      helix.push({
        x: Math.cos(a) * (0.55 + jitter),
        y: (t - 0.5) * 2.6,
        z: Math.sin(a) * (0.55 + jitter)
      });
    }

    // Dispersed starfield (deterministic pseudo-random spread)
    const scatter: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const rx = Math.sin(i * 127.1) * 43758.5453;
      const ry2 = Math.sin(i * 311.7) * 24634.6345;
      const rz = Math.sin(i * 74.7) * 13758.5453;
      scatter.push({
        x: ((rx - Math.floor(rx)) * 2 - 1) * 1.7,
        y: ((ry2 - Math.floor(ry2)) * 2 - 1) * 1.1,
        z: (rz - Math.floor(rz)) * 1.2 - 0.6
      });
    }

    /* Scroll progress: 0..1 across the hero (whatever its height), then +1
       per story screen — anchored to the first .sfc-screen so the beats line
       up with the copy regardless of section heights. */
    let sTop = 0;
    const measure = () => {
      const first = document.querySelector<HTMLElement>(".sfc-screen");
      sTop = first
        ? first.getBoundingClientRect().top + window.scrollY
        : window.innerHeight;
      if (sTop < 1) sTop = 1;
    };
    measure();

    let target = 0;
    let scrollProgress = 0;
    const onScroll = () => {
      const y = window.scrollY;
      target =
        y < sTop ? y / sTop : 1 + (y - sTop) / window.innerHeight;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    onScroll();

    // Shape blend per beat: sphere / wave / helix / scatter
    const shapeAt = (p: number) => {
      if (p < 2) return { s: 1, w: 0, h: 0, sc: 0 };
      if (p < 3) {
        const k = smooth(p - 2);
        return { s: 1 - k, w: k, h: 0, sc: 0 };
      }
      if (p < 4) {
        const k = smooth(p - 3);
        return { s: 0, w: 1 - k, h: k, sc: 0 };
      }
      if (p < 5) {
        const k = smooth(p - 4);
        return { s: 0, w: 0, h: 1 - k, sc: k };
      }
      return { s: 0, w: 0, h: 0, sc: 1 };
    };

    // Screen-space layout: Rs is the projected on-screen radius
    const layoutAt = (p: number) => {
      const RsHero = Math.max(W * 0.56, H * 0.62);
      const RsFull = Math.min(W, H) * 0.44;
      if (p < 1) {
        const k = smooth(p);
        return {
          cx: W / 2,
          cy: lerp(H * 1.46, H * 0.52, k),
          Rs: lerp(RsHero, RsFull, k),
          rotX: lerp(0.42, 0.25, k),
          opacity: 1
        };
      }
      if (p < 2) {
        const k = smooth(p - 1);
        return {
          cx: lerp(W * 0.5, W * 0.33, k),
          cy: H * 0.52,
          Rs: RsFull,
          rotX: 0.25,
          opacity: 1
        };
      }
      if (p < 3) {
        const k = smooth(p - 2);
        return {
          cx: lerp(W * 0.33, W * 0.62, k),
          cy: H * 0.5,
          Rs: lerp(RsFull, Math.min(W, H) * 0.5, k),
          rotX: lerp(0.25, -0.18, k),
          opacity: 1
        };
      }
      if (p < 4) {
        const k = smooth(p - 3);
        return {
          cx: lerp(W * 0.62, W * 0.4, k),
          cy: H * 0.5,
          Rs: lerp(Math.min(W, H) * 0.5, Math.min(W, H) * 0.52, k),
          rotX: lerp(-0.18, -0.05, k),
          opacity: 1
        };
      }
      const k = smooth(Math.min(p - 4, 1));
      return {
        cx: W * 0.5,
        cy: H * 0.5,
        Rs: lerp(Math.min(W, H) * 0.52, Math.max(W, H) * 0.8, k),
        rotX: -0.05,
        opacity: lerp(1, 0.75, k)
      };
    };

    let rafId = 0;
    let ry = 0;

    const render = () => {
      scrollProgress += (target - scrollProgress) * 0.08;
      const p = scrollProgress;

      /* Page background painted here: hero blue cross-fades to deep navy as
         the planet rises (reference frames 1→3), then stays navy. */
      const mix = smooth((p - 0.5) / 0.48);
      const bg = `rgb(${Math.round(lerp(BLUE[0], NAVY[0], mix))}, ${Math.round(
        lerp(BLUE[1], NAVY[1], mix)
      )}, ${Math.round(lerp(BLUE[2], NAVY[2], mix))})`;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const { s, w, h, sc } = shapeAt(p);
      const { cx, cy, Rs, rotX, opacity } = layoutAt(p);
      const R = Rs * 2.2; // world radius → projected Rs at z=0

      ry += 0.0016;
      const cosY = Math.cos(ry),
        sinY = Math.sin(ry);
      const cosX = Math.cos(rotX),
        sinX = Math.sin(rotX);

      /* Solid planet body — the reference sphere is OPAQUE dark navy with a
         soft teal glow near the top, not a see-through particle shell. */
      if (s > 0.02) {
        const bodyA = s * opacity;
        const g = ctx.createRadialGradient(
          cx,
          cy - Rs * 0.45,
          Rs * 0.08,
          cx,
          cy,
          Rs
        );
        g.addColorStop(0, `rgba(22, 46, 74, ${bodyA})`);
        g.addColorStop(0.45, `rgba(12, 24, 52, ${bodyA})`);
        g.addColorStop(1, `rgba(7, 11, 30, ${bodyA})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, Rs, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < N; i++) {
        const a = sphere[i];
        const b = wave[i];
        const c = helix[i];
        const d = scatter[i];

        const px = a.x * s + b.x * w + c.x * h + d.x * sc;
        const py = a.y * s + b.y * w + c.y * h + d.y * sc;
        const pz = a.z * s + b.z * w + c.z * h + d.z * sc;

        // rotate Y then X
        let x = px * cosY + pz * sinY;
        let z = -px * sinY + pz * cosY;
        let y = py;
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2;
        z = z2;

        // Solid sphere: back hemisphere is hidden behind the body
        if (s > 0.6 && z < -0.12) continue;

        // Guard: points at/behind the camera plane flip persp negative,
        // which made ctx.arc() throw IndexSizeError (negative radius).
        const denom = 2.2 - z;
        if (denom <= 0.05) continue;
        const persp = 1 / denom;
        const sx = cx + x * R * persp;
        const sy = cy + y * R * persp;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;

        const depth = (z + 1) / 2;

        /* Surface wave-band — the bright cyan river flowing across the
           planet in the reference. Band strength fades as the sphere
           dissolves into wave/helix (those glow on their own). */
        const v = Math.sin(a.y * 4.2 + a.lon * 2.0 + ry * 2.4);
        const m = Math.max(0, 1 - Math.abs(v) * 1.55) * (s * 0.85 + 0.15);

        const q = clamp01(0.18 * depth + 0.95 * m + (1 - s) * 0.3 * depth);
        const alpha = clamp01(
          (0.05 + depth * 0.28 + m * 0.5) * opacity * (sc > 0 ? 1 - sc * 0.35 : 1)
        );
        const size =
          (0.42 + depth * 1.15 + m * 1.05) * persp * 1.25 * (1 - sc * 0.35);
        if (size <= 0 || alpha <= 0) continue;

        // dim indigo → electric cyan
        const r8 = Math.round(lerp(58, 118, q));
        const g8 = Math.round(lerp(82, 228, q));
        const b8 = Math.round(lerp(196, 255, q));

        ctx.fillStyle = `rgba(${r8}, ${g8}, ${b8}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
  );
}

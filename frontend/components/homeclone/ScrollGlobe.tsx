"use client";

import { useEffect, useRef } from "react";

/**
 * A fixed-position canvas that renders a particle field morphing between
 * shapes based on the document scroll progress:
 *   0 .. 1  sphere (half-visible, bottom of hero)
 *   1 .. 2  full centered sphere
 *   2 .. 3  wave / diagonal band
 *   3 .. 4  helix / DNA
 * Each unit corresponds to roughly one viewport height.
 *
 * Ported 1:1 from the SecuredFi clone build — colours intentionally stay the
 * clone's blue/cyan regardless of site theme (the homepage keeps its look).
 */
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

    // Precompute base sphere points (Fibonacci)
    const sphere: { x: number; y: number; z: number }[] = [];
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      sphere.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }

    // Wave shape: horizontal band that undulates in y and z
    const wave: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const u = (t * 12) % 1;
      const row = Math.floor(t * 12);
      const x = (u - 0.5) * 3.2;
      const baseY = Math.sin(x * 1.4 + row * 0.3) * 0.4 + (row - 6) * 0.03;
      const y = baseY + Math.sin(i * 0.7) * 0.05;
      const z = Math.cos(x * 1.4 + row * 0.3) * 0.4 + Math.sin(i * 0.31) * 0.1;
      wave.push({ x, y, z });
    }

    // Helix / DNA
    const helix: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const strand = i % 2 === 0 ? 0 : Math.PI;
      const a = t * Math.PI * 8 + strand;
      const y = (t - 0.5) * 2.6;
      const jitter = (i % 7) * 0.005;
      helix.push({
        x: Math.cos(a) * (0.55 + jitter),
        y,
        z: Math.sin(a) * (0.55 + jitter)
      });
    }

    let scrollProgress = 0; // in units of viewport heights
    let target = 0;
    const onScroll = () => {
      target = window.scrollY / window.innerHeight;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let rafId = 0;
    let ry = 0;

    // Shape config per section index
    const shapeAt = (p: number) => {
      // sphereFactor, waveFactor, helixFactor
      if (p < 1) return { s: 1, w: 0, h: 0 };
      if (p < 2) return { s: 1, w: 0, h: 0 };
      if (p < 3) {
        const k = p - 2;
        return { s: 1 - k, w: k, h: 0 };
      }
      if (p < 4) {
        const k = p - 3;
        return { s: 0, w: 1 - k, h: k };
      }
      return { s: 0, w: 0, h: 1 };
    };

    // Center + scale + rotation for the field, driven by scroll
    const layoutAt = (p: number) => {
      // Hero: large sphere sitting at bottom, only top half visible
      if (p < 1) {
        const k = p;
        return {
          cx: W / 2,
          cy: H * (1.15 - k * 0.55),
          R: Math.min(W, H) * (0.85 - k * 0.25),
          rotX: 0.25,
          opacity: 1 - k * 0.1
        };
      }
      // Intro copy: full centered, shifted left so text sits right
      if (p < 2) {
        const k = p - 1;
        return {
          cx: W * (0.5 - k * 0.2),
          cy: H * 0.5,
          R: Math.min(W, H) * 0.45,
          rotX: 0.25,
          opacity: 0.95
        };
      }
      // Wave / yield curve
      if (p < 3) {
        const k = p - 2;
        return {
          cx: W * 0.55,
          cy: H * 0.5,
          R: Math.min(W, H) * (0.45 + k * 0.05),
          rotX: 0.2 - k * 0.4,
          opacity: 0.9
        };
      }
      // Helix / building the future
      const k = Math.min(p - 3, 1);
      return {
        cx: W * (0.4 + k * 0.05),
        cy: H * 0.5,
        R: Math.min(W, H) * 0.5,
        rotX: -0.1,
        opacity: 0.9
      };
    };

    const render = () => {
      // ease progress
      scrollProgress += (target - scrollProgress) * 0.08;
      const p = scrollProgress;

      ctx.clearRect(0, 0, W, H);

      const { s, w, h } = shapeAt(p);
      const { cx, cy, R, rotX, opacity } = layoutAt(p);

      ry += 0.0015;
      const cosY = Math.cos(ry),
        sinY = Math.sin(ry);
      const cosX = Math.cos(rotX),
        sinX = Math.sin(rotX);

      // additive-ish glow blending
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < N; i++) {
        const a = sphere[i];
        const b = wave[i];
        const c = helix[i];

        const px = a.x * s + b.x * w + c.x * h;
        const py = a.y * s + b.y * w + c.y * h;
        const pz = a.z * s + b.z * w + c.z * h;

        // rotate Y
        let x = px * cosY + pz * sinY;
        let z = -px * sinY + pz * cosY;
        let y = py;
        // rotate X
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2;
        z = z2;

        const persp = 1 / (2.2 - z);
        const sx = cx + x * R * persp;
        const sy = cy + y * R * persp;

        // Cull to viewport for perf
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;

        const depth = (z + 1) / 2;
        const alpha = (0.08 + depth * 0.55) * opacity;
        const size = (0.4 + depth * 1.6) * persp * 1.3;

        // Front-facing particles: bright cyan; back: deeper indigo
        let r8: number, g8: number, b8: number;
        if (depth > 0.55) {
          // cyan highlight
          const t = (depth - 0.55) / 0.45;
          r8 = Math.round(40 + t * 80);
          g8 = Math.round(200 + t * 40);
          b8 = 255;
        } else {
          // indigo/violet body
          const t = depth / 0.55;
          r8 = Math.round(50 + t * 40);
          g8 = Math.round(60 + t * 100);
          b8 = Math.round(180 + t * 60);
        }
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

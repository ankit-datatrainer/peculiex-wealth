"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GlobalUX() {
  const pathname = usePathname();
  useEffect(() => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $$ = <T extends Element = Element>(s: string, p: ParentNode = document) =>
      Array.from(p.querySelectorAll<T>(s));

    const cleanups: Array<() => void> = [];

    /* nav scroll state */
    const nav = document.getElementById("mainNav");
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 30);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => removeEventListener("scroll", onScroll));

    /* smooth scroll w/ offset (same-page anchors only) */
    const anchorHandlers: Array<{ el: HTMLAnchorElement; fn: (e: Event) => void }> = [];
    $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      const fn = (e: Event) => {
        const id = a.getAttribute("href") || "";
        // only intercept pure same-page anchors like "#hero"
        if (!id.startsWith("#") || id.length < 2) return;
        const t = document.getElementById(id.slice(1));
        if (!t) return;
        e.preventDefault();
        const top =
          t.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      };
      a.addEventListener("click", fn);
      anchorHandlers.push({ el: a, fn });
    });
    cleanups.push(() =>
      anchorHandlers.forEach(({ el, fn }) => el.removeEventListener("click", fn))
    );

    /* reveal observer (run once now & also expose for late-added cards) */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    $$(".reveal, .reveal-stagger, .reveal-children").forEach((el) => io.observe(el));
    (window as any).__finvoqReveal = io;
    cleanups.push(() => io.disconnect());

    /* magnetic buttons */
    if (!reduceMotion) {
      const mag = $$('[data-magnetic]') as HTMLElement[];
      const handlers: Array<{ el: HTMLElement; mv: any; ml: any }> = [];
      mag.forEach((el) => {
        const strength = 22;
        const mv = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          el.style.transform = `translate(${(x / r.width) * strength}px, ${
            (y / r.height) * strength
          }px)`;
        };
        const ml = () => (el.style.transform = "");
        el.addEventListener("mousemove", mv);
        el.addEventListener("mouseleave", ml);
        handlers.push({ el, mv, ml });
      });
      cleanups.push(() =>
        handlers.forEach(({ el, mv, ml }) => {
          el.removeEventListener("mousemove", mv);
          el.removeEventListener("mouseleave", ml);
        })
      );
    }

    /* tilt cards */
    if (!reduceMotion) {
      const tiltEls = $$("[data-tilt], [data-tilt-strong]") as HTMLElement[];
      const handlers: Array<{ el: HTMLElement; mv: any; ml: any }> = [];
      tiltEls.forEach((el) => {
        const strong = el.hasAttribute("data-tilt-strong");
        const max = strong ? 6 : 9;
        el.style.transformStyle = "preserve-3d";
        el.style.transition = "transform .25s ease";
        const mv = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(
            2
          )}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
        };
        const ml = () => (el.style.transform = "");
        el.addEventListener("mousemove", mv);
        el.addEventListener("mouseleave", ml);
        handlers.push({ el, mv, ml });
      });
      cleanups.push(() =>
        handlers.forEach(({ el, mv, ml }) => {
          el.removeEventListener("mousemove", mv);
          el.removeEventListener("mouseleave", ml);
        })
      );
    }

    /* parallax */
    if (!reduceMotion) {
      const els = $$("[data-parallax]") as HTMLElement[];
      const onParallax = () => {
        const y = window.scrollY;
        els.forEach((el) => {
          const k = parseFloat((el as any).dataset.parallax) || 0.1;
          el.style.translate = `0 ${(y * k).toFixed(1)}px`;
        });
      };
      addEventListener("scroll", onParallax, { passive: true });
      cleanups.push(() => removeEventListener("scroll", onParallax));
    }

    /* counter numbers */
    const counters = $$(".counter") as HTMLElement[];
    const cIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const target = parseFloat(el.dataset.target || "0");
          const suffix = el.dataset.suffix || "";
          const dur = 1600;
          const start = performance.now();
          const ease = (t: number) => 1 - Math.pow(1 - t, 3);
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const v = target * ease(t);
            el.textContent =
              (v >= 1000
                ? Math.round(v).toLocaleString("en-IN")
                : v.toFixed(0)) + suffix;
            if (t < 1) requestAnimationFrame(step);
            else
              el.textContent =
                (target >= 1000
                  ? Math.round(target).toLocaleString("en-IN")
                  : target) + suffix;
          };
          requestAnimationFrame(step);
          cIO.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => cIO.observe(c));
    cleanups.push(() => cIO.disconnect());

    /* allocation list animation trigger */
    const allocList = document.querySelector(".alloc-list");
    if (allocList) {
      const ioAlloc = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) en.target.classList.add("in");
          });
        },
        { threshold: 0.25 }
      );
      ioAlloc.observe(allocList);
      cleanups.push(() => ioAlloc.disconnect());
    }

    /* allocation rings (#allocRings) — animate on view */
    (() => {
      const svg = document.getElementById("allocRings");
      if (!svg) return;
      const r1 = svg.querySelector("#ring1") as SVGCircleElement | null;
      const r2 = svg.querySelector("#ring2") as SVGCircleElement | null;
      const r3 = svg.querySelector("#ring3") as SVGCircleElement | null;
      if (!r1 || !r2 || !r3) return;
      const rings = [
        { el: r1, r: 58, pct: 0.42 },
        { el: r2, r: 46, pct: 0.22 },
        { el: r3, r: 34, pct: 0.14 }
      ];
      const animate = () => {
        rings.forEach(({ el, r, pct }) => {
          const C = 2 * Math.PI * r;
          el.setAttribute("stroke-dasharray", `${(C * pct).toFixed(2)} ${C}`);
        });
      };
      const ringIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) animate();
          });
        },
        { threshold: 0.3 }
      );
      ringIO.observe(svg);
      cleanups.push(() => ringIO.disconnect());
    })();

    /* FAQ accordion */
    const faqHandlers: Array<{ el: HTMLButtonElement; fn: any }> = [];
    $$<HTMLButtonElement>(".faq-q").forEach((btn) => {
      const fn = () => {
        const item = btn.closest(".faq-item");
        if (!item) return;
        const isOpen = item.classList.contains("open");
        $$(".faq-item.open").forEach((o) => {
          o.classList.remove("open");
          o.querySelector(".faq-q")?.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      };
      btn.addEventListener("click", fn);
      faqHandlers.push({ el: btn, fn });
    });
    cleanups.push(() =>
      faqHandlers.forEach(({ el, fn }) => el.removeEventListener("click", fn))
    );

    /* Onboard step progress fill */
    (() => {
      const list = document.querySelector(".steps") as HTMLElement | null;
      if (!list) return;
      const update = () => {
        const r = list.getBoundingClientRect();
        const total = r.height;
        const anchor = window.innerHeight * 0.55;
        const seen = Math.max(0, Math.min(total, anchor - r.top));
        const pct = total ? (seen / total) * 100 : 0;
        list.style.setProperty("--step-progress", pct.toFixed(1) + "%");
      };
      addEventListener("scroll", update, { passive: true });
      addEventListener("resize", update);
      update();
      cleanups.push(() => {
        removeEventListener("scroll", update);
        removeEventListener("resize", update);
      });
    })();

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}

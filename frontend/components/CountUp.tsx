"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a headline figure up when it first scrolls into view.
 *
 * Takes the finished string the CMS stores ("₹182Cr+", "4,000+", "10 yrs+")
 * and splits it into prefix / number / suffix, so an admin can edit the value
 * freely without anyone touching this component. Anything with no number in
 * it is rendered untouched.
 */
export default function CountUp({
  value,
  duration = 1600
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const m = value.match(/^(\D*?)([\d,]*\d(?:\.\d+)?)(.*)$/s);
    if (!m) {
      setShown(value);
      return;
    }
    const [, prefix, rawNum, suffix] = m;
    const target = parseFloat(rawNum.replace(/,/g, ""));
    if (!isFinite(target)) {
      setShown(value);
      return;
    }

    // Respect the reader's motion preference: show the final figure at once.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }

    const grouped = rawNum.includes(",");
    const decimals = (rawNum.split(".")[1] || "").length;
    const format = (n: number) => {
      const fixed = n.toFixed(decimals);
      const withGroups = grouped
        ? Number(fixed).toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          })
        : fixed;
      return `${prefix}${withGroups}${suffix}`;
    };

    setShown(format(0));

    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const tick = (t: number) => {
          if (!start) start = t;
          const p = Math.min(1, (t - start) / duration);
          // easeOutExpo: fast off the line, settles gently on the number.
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setShown(format(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
          else setShown(value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="countup">
      {shown}
    </span>
  );
}

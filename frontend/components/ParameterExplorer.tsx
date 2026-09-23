"use client";

/**
 * Shortlisting-parameter explorer: a tab rail beside a detail panel.
 *
 * Used by the PMS block and by both AIF screens (equity and debt), so the
 * rail geometry, keyboard handling and marker animation live here once.
 *
 * The marker is measured from the real tab boxes rather than computed, which
 * lets the same element serve the desktop vertical rail and the horizontally
 * scrolling chip row phones fall back to.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import "./premium-block.css";

export type Parameter = { name: string; rationale: string };

const pad = (n: number) => String(n).padStart(2, "0");

export default function ParameterExplorer({
  items,
  label,
  idPrefix,
  kicker = "Parameter"
}: {
  items: Parameter[];
  /** Accessible name for the tab list. */
  label: string;
  /** Unique per instance — two explorers can share a page. */
  idPrefix: string;
  kicker?: string;
}) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // The caller's list can change (CMS edit, or a branch switch on AIF).
  const idx = items.length ? Math.min(active, items.length - 1) : 0;
  const current = items[idx];

  const measure = useCallback(() => {
    const btn = tabRefs.current[idx];
    if (!railRef.current || !btn) return;
    setThumb({
      top: btn.offsetTop,
      left: btn.offsetLeft,
      width: btn.offsetWidth,
      height: btn.offsetHeight
    });
  }, [idx]);

  /* Keep the active chip centred once the rail scrolls horizontally — the
     phone layout. Scrolls the rail only, never the page. */
  const centre = useCallback(
    (behavior: ScrollBehavior) => {
      const rail = railRef.current;
      const btn = tabRefs.current[idx];
      if (!rail || !btn || rail.scrollWidth <= rail.clientWidth + 4) return;
      rail.scrollTo({
        left: Math.max(0, btn.offsetLeft - (rail.clientWidth - btn.offsetWidth) / 2),
        behavior
      });
    },
    [idx]
  );

  useEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;
    // Web fonts and reflow both change tab geometry after first paint, and a
    // width change can flip the rail between its column and row layouts.
    const onResize = () => {
      measure();
      centre("auto");
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(rail);
    tabRefs.current.forEach((b) => b && ro.observe(b));
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [measure, centre, items]);

  useEffect(() => {
    centre("smooth");
  }, [centre]);

  const onRailKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const n = items.length;
    if (!n) return;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (idx + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (idx - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  if (!items.length || !current) return null;

  return (
    <div className="fvpe-shell reveal">
      <div
        className="fvpe-rail"
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        ref={railRef}
        onKeyDown={onRailKey}
      >
        {thumb && (
          <span
            className="fvpe-thumb"
            aria-hidden="true"
            style={{
              top: thumb.top,
              left: thumb.left,
              width: thumb.width,
              height: thumb.height
            }}
          />
        )}
        {items.map((p, i) => (
          <button
            key={p.name}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${i}`}
            aria-controls={`${idPrefix}-panel`}
            aria-selected={i === idx}
            tabIndex={i === idx ? 0 : -1}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className={`fvpe-tab${i === idx ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="fvpe-tab-no">{pad(i + 1)}</span>
            <span className="fvpe-tab-name">{p.name}</span>
            <span className="fvpe-tab-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>

      <div
        className="fvpe-panel"
        role="tabpanel"
        id={`${idPrefix}-panel`}
        aria-labelledby={`${idPrefix}-tab-${idx}`}
        tabIndex={-1}
      >
        <span className="fvpe-watermark" aria-hidden="true">
          {pad(idx + 1)}
        </span>
        {/* Keyed so the entrance animation replays on every switch. */}
        <div className="fvpe-panel-in" key={idx}>
          <div className="fvpe-kicker">
            <span>{kicker}</span>
            <i aria-hidden="true" />
            <span>
              {pad(idx + 1)} / {pad(items.length)}
            </span>
          </div>
          <h3 className="fvpe-title">{current.name}</h3>
          <p className="fvpe-body">{current.rationale}</p>
        </div>
        {items.length > 1 && (
          <button
            type="button"
            className="fvpe-next"
            onClick={() => setActive((idx + 1) % items.length)}
          >
            <span className="fvpe-next-label">Next</span>
            <span className="fvpe-next-name">
              {items[(idx + 1) % items.length].name}
            </span>
            <span className="fvpe-next-arrow" aria-hidden="true">
              →
            </span>
          </button>
        )}
        <div className="fvpe-progress" aria-hidden="true">
          <span style={{ width: `${((idx + 1) / items.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

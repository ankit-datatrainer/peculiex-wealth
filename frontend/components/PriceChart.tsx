"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCandles,
  type CandleSeries,
  type Timeframe,
  TIMEFRAMES
} from "@/lib/markets";

type Props = {
  symbol: string;
  /** Used to decide line colour when the series itself doesn't tell us */
  fallbackUp?: boolean;
  isIndex?: boolean;
};

/**
 * SVG line chart with timeframe tabs (1D / 5D / 1M / 6M / 1Y / 5Y).
 * Hovering the chart shows a crosshair + price tooltip.
 *
 * Pure client component so it can manage its own state and pointer
 * interactions; no chart library to keep the bundle lean.
 */
export default function PriceChart({ symbol, fallbackUp = true, isIndex = false }: Props) {
  const [tf, setTf] = useState<Timeframe>("1D");
  const [series, setSeries] = useState<CandleSeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 600, h: 280 });

  // Load whenever symbol or timeframe changes
  useEffect(() => {
    let killed = false;
    setLoading(true);
    setError(null);
    fetchCandles(symbol, tf)
      .then((s) => {
        if (!killed) setSeries(s);
      })
      .catch((e) => {
        if (!killed) setError(e?.message || "Could not load chart");
      })
      .finally(() => {
        if (!killed) setLoading(false);
      });
    return () => {
      killed = true;
    };
  }, [symbol, tf]);

  // Subscribe to live WebSocket updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    const apiBaseStr = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
    const wsUrl = apiBaseStr.replace(/^http/, "ws").replace(/\/api\/?$/, "");

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws?.send(JSON.stringify({ action: "subscribe", symbols: [symbol] }));
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "PRICE_TICK" && msg.payload && msg.payload.symbol === symbol) {
            setSeries((prev) => {
              if (!prev) return prev;
              const price = msg.payload.price ?? msg.payload.c;
              if (price == null) return prev;
              const t = msg.payload.t ? msg.payload.t * 1000 : Date.now();
              return {
                ...prev,
                candles: [...prev.candles, { t, c: price, o: price, h: price, l: price, v: 0 }]
              };
            });
          }
        } catch (err) {}
      };
    } catch (err) {
      console.error("WebSocket connect error", err);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "unsubscribe", symbols: [symbol] }));
        ws.close();
      } else if (ws) {
        ws.close();
      }
    };
  }, [symbol]);

  // Track wrapper width so the chart fills its container
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.max(280, Math.floor(e.contentRect.width));
        setSize((s) => (s.w === w ? s : { ...s, w }));
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const points = useMemo(() => {
    if (!series || !series.candles.length) return [];
    return series.candles
      .filter((c) => c.c != null)
      .map((c) => ({ t: c.t, c: c.c as number }));
  }, [series]);

  const stats = useMemo(() => {
    if (!points.length) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const p of points) {
      if (p.c < min) min = p.c;
      if (p.c > max) max = p.c;
    }
    const first = points[0].c;
    const last = points[points.length - 1].c;
    const change = last - first;
    const pct = first ? (change / first) * 100 : 0;
    return { min, max, first, last, change, pct };
  }, [points]);

  const up = stats ? stats.change >= 0 : fallbackUp;
  const stroke = up ? "#16a34a" : "#dc2626";
  const fill = up ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)";

  // Geometry
  const PAD = { l: 8, r: 8, t: 12, b: 22 };
  const W = size.w;
  const H = size.h;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const timeBounds = useMemo(() => {
    if (!points.length) return { min: 0, max: 1, range: 1 };
    let minT = points[0].t;
    let maxT = points[points.length - 1].t;

    if (tf === "1D" && points.length > 0) {
      const firstDate = new Date(points[0].t);
      const openTime = new Date(firstDate);
      openTime.setHours(9, 15, 0, 0);
      const closeTime = new Date(firstDate);
      closeTime.setHours(15, 30, 0, 0);
      
      minT = openTime.getTime();
      maxT = closeTime.getTime();
      
      if (points[0].t < minT) minT = points[0].t;
      if (points[points.length - 1].t > maxT) maxT = points[points.length - 1].t;
    }
    
    const timeRange = maxT - minT || 1;
    return { min: minT, max: maxT, range: timeRange };
  }, [points, tf]);

  const path = useMemo(() => {
    if (!points.length || !stats) return "";
    const range = stats.max - stats.min || 1;
    return points
      .map((p, i) => {
        const x = PAD.l + ((p.t - timeBounds.min) / timeBounds.range) * innerW;
        const y = PAD.t + (1 - (p.c - stats.min) / range) * innerH;
        return (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
      })
      .join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, stats, innerW, innerH, timeBounds]);

  // Pointer to nearest point
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const xRel = e.clientX - rect.left - PAD.l;
    const ratio = Math.max(0, Math.min(1, xRel / innerW));
    
    const targetT = timeBounds.min + ratio * timeBounds.range;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs(points[i].t - targetT);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoverIdx(closestIdx);
  };
  const onLeave = () => setHoverIdx(null);

  const hover = hoverIdx != null ? points[hoverIdx] : null;
  const hoverX =
    hover && stats
      ? PAD.l + ((hover.t - timeBounds.min) / timeBounds.range) * innerW
      : 0;
  const hoverY =
    hover && stats
      ? PAD.t +
        (1 - (hover.c - stats.min) / Math.max(1, stats.max - stats.min)) *
          innerH
      : 0;

  const fmtTimeLabel = (t: number) => {
    const d = new Date(t);
    if (tf === "1D") {
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
    if (tf === "5D" || tf === "1M") {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
      });
    }
    return d.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit"
    });
  };

  return (
    <div className="pchart" ref={wrapRef}>


      <div className="pchart-canvas-wrap">
        {loading && !series && (
          <div className="pchart-loader">Loading chart…</div>
        )}
        {error && <div className="pchart-error">{error}</div>}
        {!error && points.length > 0 && stats && (
          <svg
            className="pchart-svg"
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >

            <path
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {hover && (
              <>
                <line
                  x1={hoverX}
                  x2={hoverX}
                  y1={PAD.t}
                  y2={PAD.t + innerH}
                  stroke="#9a958c"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hoverX}
                  cy={hoverY}
                  r="4"
                  fill="#fff"
                  stroke={stroke}
                  strokeWidth="2"
                />
              </>
            )}

            {/* x-axis labels: first / mid / last */}
            {points.length > 2 && (
              <>
                <text
                  x={PAD.l}
                  y={H - 6}
                  fontSize="10"
                  fill="#8a8680"
                >
                  {fmtTimeLabel(timeBounds.min)}
                </text>
                <text
                  x={PAD.l + innerW / 2}
                  y={H - 6}
                  fontSize="10"
                  fill="#8a8680"
                  textAnchor="middle"
                >
                  {fmtTimeLabel(timeBounds.min + timeBounds.range / 2)}
                </text>
                <text
                  x={PAD.l + innerW}
                  y={H - 6}
                  fontSize="10"
                  fill="#8a8680"
                  textAnchor="end"
                >
                  {fmtTimeLabel(timeBounds.max)}
                </text>
              </>
            )}
          </svg>
        )}

        {hover && stats && (
          <div
            className="pchart-tooltip"
            style={{
              left: Math.min(W - 140, Math.max(0, hoverX - 60)),
              top: 6
            }}
          >
            <div className="pchart-tooltip-price">
              {isIndex ? "" : "₹"}
              {hover.c.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div className="pchart-tooltip-time">
              {new Date(hover.t).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              })}
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="pchart-summary">
          <span className={`pchart-pct ${up ? "up" : "dn"}`}>
            {stats.pct >= 0 ? "+" : "−"}
            {Math.abs(stats.pct).toFixed(2)}% {tf}
          </span>
          <span className="pchart-range">
            Range {isIndex ? "" : "₹"}
            {stats.min.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}{" "}
            – {isIndex ? "" : "₹"}
            {stats.max.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
      )}

      <div className="pchart-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
        <div className="pchart-tabs-bottom" style={{ display: "flex", gap: "8px" }}>
          {TIMEFRAMES.map((f) => (
            <button
              key={f}
              type="button"
              className={`pchart-tab-pill${tf === f ? " active" : ""}`}
              onClick={() => setTf(f)}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border: tf === f ? "none" : "1px solid var(--color-divider)",
                background: tf === f ? "var(--color-primary)" : "transparent",
                color: tf === f ? "#fff" : "var(--color-text-muted)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <a 
          href={`/markets/${symbol}/terminal`} 
          target="_blank" 
          rel="noreferrer"
          className="pchart-terminal-btn"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Terminal
        </a>
      </div>
    </div>
  );
}

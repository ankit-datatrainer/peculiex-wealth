"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { type PricePoint } from "@/lib/unlisted-types";

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const time = (date: string) => Date.parse(`${date}T00:00:00Z`);
const DAY = 86400000;

export default function UnlistedPriceChart({
  name,
  history,
  dailyQuotes = [],
}: {
  name: string;
  history: PricePoint[];
  dailyQuotes?: PricePoint[];
}) {
  const all = useMemo(
    () =>
      history
        .filter((p) => p[1] > 0 && Number.isFinite(time(p[0])))
        .slice()
        .sort((a, b) => a[0].localeCompare(b[0])),
    [history],
  );
  const first = all[0]?.[0] || "",
    last = all.at(-1)?.[0] || "";
  const [range, setRange] = useState({ from: "", to: "", preset: "All" });
  const [hover, setHover] = useState<number | null>(null);
  const [inspected, setInspected] = useState<number | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const dateFrom = useRef<HTMLInputElement>(null),
    dateTo = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(680);
  const gradient = useId().replace(/:/g, "");
  const from = range.from || first,
    to = range.to || last;
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(260, entries[0].contentRect.width)),
    );
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (dateFrom.current) dateFrom.current.value = from;
    if (dateTo.current) dateTo.current.value = to;
  }, [from, to]);
  const points = useMemo(
    () => all.filter((p) => p[0] >= from && p[0] <= to),
    [all, from, to],
  );
  const invalid = !!from && !!to && from > to;
  const selectedIndex = Math.min(
    hover ?? inspected ?? points.length - 1,
    points.length - 1,
  );
  const selected = points[selectedIndex];
  const inspect = (index: number) => {
    setHover(null);
    setInspected(Math.min(points.length - 1, Math.max(0, index)));
  };
  const resetInspection = () => {
    setHover(null);
    setInspected(null);
  };
  const values = points.map((p) => p[1]);
  const low = values.length ? Math.min(...values) : 0,
    high = values.length ? Math.max(...values) : 0;
  const pad = (high - low) * 0.12 || Math.max(high * 0.04, 1);
  const min = Math.max(0, low - pad),
    max = high + pad;
  const left = 12,
    right = width - 78,
    top = 22,
    bottom = 274,
    height = 316;
  const start = time(from),
    end = time(to),
    span = Math.max(end - start, DAY);
  const dateTickCount = width < 400 ? 3 : 4;
  const dateTicks = [
    ...new Set(
      Array.from(
        { length: dateTickCount },
        (_, index) =>
          start +
          Math.round((((end - start) / DAY) * index) / (dateTickCount - 1)) *
            DAY,
      ),
    ),
  ];
  const x = (date: string) =>
    left + ((time(date) - start) / span) * (right - left);
  const y = (price: number) =>
    bottom - ((price - min) / (max - min || 1)) * (bottom - top);
  const segments: PricePoint[][] = [];
  for (const p of points) {
    const segment = segments.at(-1);
    if (!segment || time(p[0]) - time(segment.at(-1)![0]) > 5 * DAY)
      segments.push([p]);
    else segment.push(p);
  }
  const line = (segment: PricePoint[]) =>
    segment
      .map(
        (p, i) =>
          `${i ? "H" : "M"}${x(p[0]).toFixed(2)}${i ? " V" : ","}${y(p[1]).toFixed(2)}`,
      )
      .join(" ");
  const change = points.length > 1 ? points.at(-1)![1] - points[0][1] : 0;
  const percent = points[0]?.[1] ? (change / points[0][1]) * 100 : 0;
  const setPreset = (preset: string) => {
    const date = new Date(`${last}T00:00:00Z`);
    if (preset === "YTD") date.setUTCMonth(0, 1);
    else if (preset !== "All") {
      const day = date.getUTCDate();
      date.setUTCDate(1);
      date.setUTCMonth(
        date.getUTCMonth() -
          ({ "1M": 1, "3M": 3, "6M": 6, "1Y": 12 }[preset] || 0),
      );
      const month = date.getUTCMonth();
      date.setUTCDate(day);
      if (date.getUTCMonth() !== month) date.setUTCDate(0);
    }
    setRange({
      from:
        preset === "All"
          ? first
          : [first, date.toISOString().slice(0, 10)].sort().at(-1)!,
      to: last,
      preset,
    });
    resetInspection();
  };
  const exportCsv = () => {
    const csv =
      "Date,Price (INR),Record type\n" +
      points
        .map(
          (p) =>
            `${p[0]},${p[1]},${dailyQuotes.some((q) => q[0] === p[0]) ? "Finvoq daily observation" : "Source history"}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/[^a-z0-9]+/gi, "-")}-prices.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section
      className="us-card us-chart"
      id="price-history"
      aria-labelledby="price-history-title"
    >
      <div className="us-section-heading">
        <div>
          <span className="us-eyebrow">PRICE PERFORMANCE</span>
          <h2 id="price-history-title">Historical share price</h2>
        </div>
        <button
          className="us-text-button"
          onClick={exportCsv}
          disabled={!points.length}
        >
          Export CSV ↓
        </button>
      </div>
      <div className="us-chart-readout">
        <div className="us-chart-summary" aria-live="polite">
          <strong>{selected ? money(selected[1]) : "No price data"}</strong>
          <span className={change < 0 ? "us-negative" : "us-positive"}>
            {points.length > 1
              ? `${change >= 0 ? "+" : "−"}${money(Math.abs(change))} (${percent.toFixed(2)}%)`
              : "—"}
          </span>
          <small>
            {selected
              ? `${dateLabel(selected[0])} · ${dailyQuotes.some((p) => p[0] === selected[0]) ? "Daily observation" : "Source history"}`
              : "No quotes in this date range"}
          </small>
        </div>
        {points.length > 1 && (
          <div
            className="us-point-controls"
            role="group"
            aria-label="Inspect recorded prices"
          >
            <button
              type="button"
              aria-label="Previous price observation"
              disabled={selectedIndex === 0}
              onClick={() => inspect(selectedIndex - 1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next price observation"
              disabled={selectedIndex === points.length - 1}
              onClick={() => inspect(selectedIndex + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
      <div className="us-chart-controls">
        <div className="us-presets" aria-label="Chart period">
          {["1M", "3M", "6M", "YTD", "1Y", "All"].map((p) => (
            <button
              key={p}
              disabled={!all.length}
              aria-pressed={range.preset === p}
              onClick={() => setPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <form
          className="us-date-range"
          onSubmit={(e) => {
            e.preventDefault();
            setRange({
              from: dateFrom.current?.value || first,
              to: dateTo.current?.value || last,
              preset: "Custom",
            });
            resetInspection();
          }}
        >
          <label>
            From
            <input
              ref={dateFrom}
              aria-label="Chart start date"
              type="date"
              min={first}
              max={last}
              defaultValue={from}
              disabled={!all.length}
              required
            />
          </label>
          <label>
            To
            <input
              ref={dateTo}
              aria-label="Chart end date"
              type="date"
              min={first}
              max={last}
              defaultValue={to}
              disabled={!all.length}
              required
            />
          </label>
          <button
            type="submit"
            className="us-apply-dates"
            disabled={!all.length}
          >
            Apply
          </button>
        </form>
      </div>
      <div ref={host} className="us-chart-canvas">
        {!points.length || invalid ? (
          <div className="us-chart-empty" role="status">
            {invalid
              ? "Choose an end date on or after the start date."
              : all.length
                ? "No recorded quotes in this range. Try a wider period."
                : "Historical prices are not available from the source yet. Daily quoted prices will appear here as they are recorded."}
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-label={`${name} price chart. Use left and right arrow keys to inspect recorded prices.`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                inspect(
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? points.length - 1
                      : selectedIndex + (e.key === "ArrowLeft" ? -1 : 1),
                );
              }
            }}
            onPointerMove={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const target =
                start +
                ((((e.clientX - bounds.left) / bounds.width) * width - left) /
                  (right - left)) *
                  span;
              let index = 0;
              for (let i = 1; i < points.length; i++)
                if (
                  Math.abs(time(points[i][0]) - target) <
                  Math.abs(time(points[index][0]) - target)
                )
                  index = i;
              setHover(index);
            }}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0c8065" stopOpacity=".12" />
                <stop offset="100%" stopColor="#0c8065" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => {
              const value = min + ((max - min) * i) / 4;
              return (
                <g key={i}>
                  <line
                    x1={left}
                    x2={right}
                    y1={y(value)}
                    y2={y(value)}
                    stroke="#edf0ef"
                  />
                  <text
                    x={right + 12}
                    y={y(value) + 4}
                    fill="var(--us-muted)"
                    fontSize="13"
                  >
                    {value.toLocaleString("en-IN", {
                      maximumFractionDigits: high < 10 ? 2 : 1,
                      notation: high > 99999 ? "compact" : "standard",
                    })}
                  </text>
                </g>
              );
            })}
            {segments.map((segment, i) => (
              <g key={i}>
                <path
                  d={`${line(segment)} L${x(segment.at(-1)![0])},${bottom} L${x(segment[0][0])},${bottom} Z`}
                  fill={`url(#${gradient})`}
                />
                <path
                  d={line(segment)}
                  fill="none"
                  stroke="#11765e"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {segment.length === 1 && (
                  <circle
                    cx={x(segment[0][0])}
                    cy={y(segment[0][1])}
                    r="3"
                    fill="#11765e"
                  />
                )}
                {i > 0 && (
                  <line
                    x1={x(segments[i - 1].at(-1)![0])}
                    y1={y(segments[i - 1].at(-1)![1])}
                    x2={x(segment[0][0])}
                    y2={y(segment[0][1])}
                    stroke="#93a79e"
                    strokeDasharray="4 5"
                  />
                )}
              </g>
            ))}
            {dateTicks.map((tick, index) => {
              const date = new Date(tick);
              return (
                <text
                  key={tick}
                  x={x(date.toISOString().slice(0, 10))}
                  y={304}
                  textAnchor={
                    index === 0
                      ? "start"
                      : index === dateTicks.length - 1
                        ? "end"
                        : "middle"
                  }
                  fill="var(--us-muted)"
                  fontSize="13"
                >
                  {date.toLocaleDateString("en-GB", {
                    day: span <= 90 * DAY ? "numeric" : undefined,
                    month: "short",
                    year: span > 90 * DAY ? "2-digit" : undefined,
                    timeZone: "UTC",
                  })}
                </text>
              );
            })}
            {selected && (
              <g>
                <line
                  x1={x(selected[0])}
                  x2={x(selected[0])}
                  y1={top}
                  y2={bottom}
                  stroke="#9bafa6"
                  strokeDasharray="3 4"
                />
                <circle
                  cx={x(selected[0])}
                  cy={y(selected[1])}
                  r="4"
                  fill="#11765e"
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        )}
      </div>
      {all.length > 1 && (
        <div className="us-chart-navigator">
          <span>Adjust visible dates</span>
          <label>
            Start
            <input
              aria-label="Move chart start"
              type="range"
              min={0}
              max={all.length - 1}
              value={Math.max(
                0,
                all.findIndex((p) => p[0] >= from),
              )}
              onChange={(e) => {
                const date = all[Number(e.target.value)][0];
                setRange({
                  from: date,
                  to: date > to ? date : to,
                  preset: "Custom",
                });
                resetInspection();
              }}
            />
          </label>
          <label>
            End
            <input
              aria-label="Move chart end"
              type="range"
              min={0}
              max={all.length - 1}
              value={Math.max(
                0,
                all.findLastIndex((p) => p[0] <= to),
              )}
              onChange={(e) => {
                const date = all[Number(e.target.value)][0];
                setRange({
                  from: date < from ? date : from,
                  to: date,
                  preset: "Custom",
                });
                resetInspection();
              }}
            />
          </label>
        </div>
      )}
      <p className="us-footnote">
        {points.length.toLocaleString()} recorded prices in view. Indicative
        unlisted quotes, not exchange trades. Dashed lines mark gaps in
        available records; missing days are not filled. Daily observations use
        India time.
      </p>
    </section>
  );
}

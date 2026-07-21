"use client";
import { useEffect, useRef, useState } from "react";
import { fetchQuotes, subscribeTicks } from "@/lib/markets";

type Tick = { name: string; price: number; chg: number };

const SYMBOLS = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LT.NS", "BAJFINANCE.NS"];

const arrowSVG = (up: boolean) =>
  `<svg class="trend-icon" aria-hidden="true"><use href="#i-arrow-${
    up ? "up" : "down"
  }"/></svg>`;

export default function TickerBar() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Tick[]>([]);

  useEffect(() => {
    let active = true;
    fetchQuotes(SYMBOLS)
      .then((res) => {
        if (!active || !res) return;
        setItems((prev) => {
          const copy = [...prev];
          for (const q of res) {
            if (!copy.find((it) => it.name === q.symbol)) {
              copy.push({
                name: q.symbol,
                price: q.price || 0,
                chg: q.changePercent || 0
              });
            }
          }
          return copy;
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // WebSocket when available, automatic polling fallback when the upgrade
    // can't get through (e.g. proxy not forwarding it) so the ticker still moves.
    return subscribeTicks(SYMBOLS, (q) => {
      const price = q.price;
      if (price == null) return;
      const chg = q.changePercent ?? 0;
      setItems((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((it) => it.name === q.symbol);
        const tick = { name: q.symbol, price, chg };
        if (idx >= 0) copy[idx] = tick;
        else copy.push(tick);
        return copy;
      });
    });
  }, []);

  // Render ticker HTML twice for seamless marquee
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const html = items
      .map((t) => {
        const up = t.chg >= 0;
        const cls = up ? "up" : "dn";
        const price =
          t.price >= 1000
            ? t.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })
            : t.price.toFixed(2);
        return `<a class="ticker-item" href="/markets/${encodeURIComponent(
          t.name
        )}">
          <span class="ticker-name">${t.name}</span>
          <span class="ticker-price">${price}</span>
          <span class="ticker-chg ${cls}">${arrowSVG(up)} ${Math.abs(
          t.chg
        ).toFixed(2)}%</span>
        </a>`;
      })
      .join("");
    track.innerHTML = html + html;
  }, [items]);

  return (
    <div className="ticker-bar">
      <div className="ticker-track" id="tickerTrack" ref={trackRef} />
    </div>
  );
}

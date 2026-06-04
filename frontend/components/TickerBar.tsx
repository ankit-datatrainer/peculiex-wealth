"use client";
import { useEffect, useRef, useState } from "react";
import { fetcher } from "@/lib/api";

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
    let ws: WebSocket | null = null;
    const apiBaseStr = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
    const wsUrl = apiBaseStr.replace(/^http/, "ws").replace(/\/api\/?$/, "");
    
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws?.send(JSON.stringify({ action: "subscribe", symbols: SYMBOLS }));
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "PRICE_TICK" && msg.payload) {
            setItems((prev) => {
              const copy = [...prev];
              const idx = copy.findIndex((it) => it.name === msg.payload.symbol);
              const price = msg.payload.price ?? msg.payload.c;
              const chg = msg.payload.changePercent ?? msg.payload.dp ?? 0;
              if (price == null) return prev; // Avoid setting undefined if payload is weird

              const tick = {
                name: msg.payload.symbol,
                price: price,
                chg: chg
              };
              if (idx >= 0) {
                copy[idx] = tick;
              } else {
                copy.push(tick);
              }
              return copy;
            });
          }
        } catch (err) {}
      };
    } catch (err) {
      console.error("WebSocket connect error", err);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "unsubscribe", symbols: SYMBOLS }));
        ws.close();
      } else if (ws) {
        ws.close();
      }
    };
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

"use client";

import { useEffect, useRef } from "react";
import { notFound } from "next/navigation";

type Props = {
  params: { symbol: string };
};

let tvScriptLoadingPromise: Promise<void> | null = null;

export default function TerminalPage({ params }: Props) {
  const symbol = decodeURIComponent(params.symbol);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!symbol) return;

    const loadWidget = () => {
      if (typeof window !== "undefined" && window.tvWidget) {
        window.tvWidget.remove();
      }

      if (containerRef.current && window.TradingView) {
        // Map the symbol to TradingView format
        let tvSymbol = symbol;
        if (!tvSymbol.includes(":")) {
          if (["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "SENSEX", "BANKEX"].includes(symbol)) {
            tvSymbol = symbol === "SENSEX" || symbol === "BANKEX" ? `BSE:${symbol}` : `NSE:${symbol}`;
          } else {
            // Most Indian stocks map nicely to BSE on TradingView
            tvSymbol = `BSE:${symbol}`;
          }
        }

        window.tvWidget = new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: "light",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "#ffffff",
          gridColor: "rgba(240, 243, 250, 0)",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          withdateranges: true,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: false,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
        });
      }
    };

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => {
      loadWidget();
    });

    return () => {
      if (window.tvWidget) {
        try {
          window.tvWidget.remove();
          window.tvWidget = null;
        } catch (e) {
          console.error("Failed to remove TradingView widget", e);
        }
      }
    };
  }, [symbol]);

  if (!symbol) return notFound();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", width: "100%" }}>
      <header style={{ padding: "12px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-bg)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--c-text)" }}>{symbol}</h1>
            <span style={{ fontSize: "0.8rem", color: "var(--c-text-mut)", fontWeight: 500 }}>Advanced Interactive Terminal</span>
          </div>
        </div>
        <a 
          href={`/markets/${encodeURIComponent(symbol)}`}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: "1px solid var(--c-border)", 
            textDecoration: "none", 
            color: "var(--c-text)", 
            fontSize: "0.9rem", 
            fontWeight: 500,
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "var(--c-bg-hover)"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          Exit Terminal
        </a>
      </header>

      <main style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <div id="tv_chart_container" ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </main>
    </div>
  );
}

// Add TypeScript definitions for TradingView widget
declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
  }
}

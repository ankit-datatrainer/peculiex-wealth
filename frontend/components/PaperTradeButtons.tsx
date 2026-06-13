"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiPostJSON } from "@/lib/api";

export default function PaperTradeButtons({ symbol, currentPrice }: { symbol: string, currentPrice: number }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleTrade = async (type: "buy" | "sell") => {
    if (!user) {
      setMessage({ type: "error", text: "Please log in to paper trade." });
      return;
    }
    if (!currentPrice || currentPrice <= 0) {
      setMessage({ type: "error", text: "Price not available." });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      await apiPostJSON("/api/paper-trades", {
        symbol,
        type,
        quantity: 1, // Defaulting to 1 for simplicity in this MVP UI
        price: currentPrice
      });
      
      setMessage({ type: "success", text: `Successfully ${type === "buy" ? "bought" : "sold"} 1 share of ${symbol} at ₹${currentPrice}!` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className="btn btn-primary"
          style={{ background: "#16a34a", color: "white", borderColor: "#16a34a", flex: 1, padding: "0.5rem 1rem", fontSize: "0.9rem" }}
          onClick={() => handleTrade("buy")}
          disabled={loading}
        >
          Buy
        </button>
        <button
          className="btn btn-primary"
          style={{ background: "#dc2626", color: "white", borderColor: "#dc2626", flex: 1, padding: "0.5rem 1rem", fontSize: "0.9rem" }}
          onClick={() => handleTrade("sell")}
          disabled={loading}
        >
          Sell
        </button>
      </div>
      {message && (
        <div style={{ fontSize: "0.8rem", color: message.type === "error" ? "#dc2626" : "#16a34a", textAlign: "right" }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

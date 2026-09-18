"use client";

import { Fragment } from "react";
import { useContent, type Reader } from "@/lib/content";

export default function HeroHeadlineAdditions({
  content
}: {
  content?: Reader;
} = {}) {
  const defaultContent = useContent("home");
  const c = content || defaultContent;

  const trustBadgeBold = c.t(
    "hero",
    "trustBadgeBold",
    "India's Multi-Asset Investment Gateway"
  );
  const trustBadgeText = c.t("hero", "trustBadgeText", "SEBI-Registered");

  const stat1Value = c.t("hero", "stat1Value", "₹1,200Cr+");
  const stat1Label = c.t("hero", "stat1Label", "Monitored Assets");

  const stat2Value = c.t("hero", "stat2Value", "15,000+");
  const stat2Label = c.t("hero", "stat2Label", "Serious Investors");

  const stat3Value = c.t("hero", "stat3Value", "0%");
  const stat3Label = c.t("hero", "stat3Label", "Hidden Fees");

  const stat4Value = c.t("hero", "stat4Value", "");
  const stat4Label = c.t("hero", "stat4Label", "");

  const metrics = [
    { value: stat1Value, label: stat1Label },
    { value: stat2Value, label: stat2Label },
    { value: stat3Value, label: stat3Label },
    ...(stat4Value && stat4Label ? [{ value: stat4Value, label: stat4Label }] : [])
  ].filter((m) => m.value || m.label);

  return (
    <div className="hero-headline-enhancement sfc-up sfc-d2">
      {/* ── Top Floating Trust Radar Pill ────────────────────────── */}
      {(trustBadgeBold || trustBadgeText) && (
        <div className="hero-trust-pill">
          <span className="trust-pill-pulse">
            <span className="trust-pill-pulse-dot" />
            <span className="trust-pill-pulse-wave" />
          </span>
          <span className="trust-pill-text">
            {trustBadgeBold && <strong>{trustBadgeBold}</strong>}
            {trustBadgeBold && trustBadgeText && " · "}
            {trustBadgeText && <span>{trustBadgeText}</span>}
          </span>
        </div>
      )}

      {/* ── Hero Live Micro-Metrics Strip ───────────────────────── */}
      {metrics.length > 0 && (
        <div className="hero-metrics-strip">
          {metrics.map((m, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <div className="hero-metric-sep" />}
              <div className="hero-metric-item">
                <div className="hero-metric-num">{m.value}</div>
                <div className="hero-metric-lbl">{m.label}</div>
              </div>
            </Fragment>
          ))}
        </div>
      )}

      <style jsx>{`
        .hero-headline-enhancement {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
          width: 100%;
          max-width: 620px;
        }

        /* ── Top Trust Pill ───────────────────────────────────────── */
        .hero-trust-pill {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(19, 115, 93, 0.07);
          border: 1px solid rgba(19, 115, 93, 0.2);
          box-shadow: 0 4px 14px rgba(19, 115, 93, 0.05);
          font-size: 12px;
          color: #0f2a2b;
          backdrop-filter: blur(8px);
          transition: all 0.25s ease;
        }

        :global(.dark) .hero-trust-pill {
          background: rgba(120, 235, 190, 0.1);
          border-color: rgba(120, 235, 190, 0.25);
          color: #e6fff4;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }

        .hero-trust-pill strong {
          color: #13735d;
          font-weight: 600;
        }
        :global(.dark) .hero-trust-pill strong {
          color: #78ebbe;
        }

        .trust-pill-pulse {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trust-pill-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #13735d;
        }
        :global(.dark) .trust-pill-pulse-dot {
          background: #78ebbe;
        }

        .trust-pill-pulse-wave {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid #13735d;
          opacity: 0;
          animation: trustPulse 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        :global(.dark) .trust-pill-pulse-wave {
          border-color: #78ebbe;
        }

        @keyframes trustPulse {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        /* ── Micro-Metrics Strip ─────────────────────────────────── */
        .hero-metrics-strip {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-top: 4px;
          margin-top: 2px;
        }

        .hero-metric-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hero-metric-num {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0f2a2b;
        }
        :global(.dark) .hero-metric-num {
          color: #f4f7f6;
        }

        .hero-metric-lbl {
          font-size: 10.5px;
          color: rgba(15, 42, 43, 0.6);
          letter-spacing: 0.02em;
        }
        :global(.dark) .hero-metric-lbl {
          color: rgba(244, 247, 246, 0.6);
        }

        .hero-metric-sep {
          width: 1px;
          height: 24px;
          background: rgba(15, 42, 43, 0.12);
        }
        :global(.dark) .hero-metric-sep {
          background: rgba(255, 255, 255, 0.12);
        }

        @media (max-width: 768px) {
          .hero-headline-enhancement {
            align-items: center;
            text-align: center;
            margin-top: 10px;
            gap: 10px;
            max-width: 100%;
          }
          .hero-trust-pill {
            align-self: center;
            font-size: 11px;
            padding: 5px 12px;
          }
          .hero-metrics-strip {
            justify-content: center;
            gap: 14px;
          }
          .hero-metric-num {
            font-size: 14px;
          }
          .hero-metric-lbl {
            font-size: 9.5px;
          }
        }
      `}</style>
    </div>
  );
}

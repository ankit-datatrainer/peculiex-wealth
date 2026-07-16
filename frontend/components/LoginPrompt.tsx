"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

/**
 * A non-blocking, accessible login prompt modal. Shown when a guest tries
 * to interact with a feature that requires an account (e.g. saving a stock
 * to their watchlist). Mirrors the pattern used by Moneycontrol.
 */
export default function LoginPrompt({
  open,
  onClose,
  title = "Sign in to save to your watchlist",
  body = "Track live prices, get a personal watchlist across listed and unlisted shares, and pick up where you left off — across devices.",
  next
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
  next?: string;
}) {
  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  const nextParam = next ? `?next=${encodeURIComponent(next)}` : "";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lp-title"
      className="lp-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lp-card" role="document">
        <button
          type="button"
          className="lp-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="lp-icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3l2.9 6 6.6 1-4.7 4.6 1.1 6.6L12 18l-5.9 3.2 1.1-6.6L2.5 10l6.6-1z" />
          </svg>
        </div>

        <h2 id="lp-title" className="lp-title">
          {title}
        </h2>
        <p className="lp-body">{body}</p>

        <div className="lp-actions">
          <Link
            href={`/login${nextParam}`}
            className="btn btn-primary btn-lg"
            data-magnetic
            onClick={onClose}
          >
            Login
          </Link>
          <Link
            href={`/signup${nextParam}`}
            className="btn btn-outline btn-lg"
            data-magnetic
            onClick={onClose}
          >
            Open a free account
          </Link>
        </div>

        <p className="lp-foot">
          It takes under a minute. We&apos;ll never share your details.
        </p>
      </div>

      <style jsx>{`
        .lp-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(11, 18, 27, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: grid;
          place-items: center;
          padding: 1.25rem;
          z-index: 100;
          animation: lpFade 0.18s ease;
        }
        @keyframes lpFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .lp-card {
          position: relative;
          width: min(460px, 100%);
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 30px 60px rgba(11, 18, 27, 0.25);
          padding: 2.4rem 2rem 1.7rem;
          text-align: center;
          animation: lpRise 0.22s ease;
        }
        @keyframes lpRise {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .lp-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #fff;
          color: #333333;
          cursor: pointer;
          transition: all 0.15s;
        }
        .lp-close:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #131313;
        }
        .lp-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          border-radius: 999px;
          background: rgba(10, 160, 128, 0.1);
          color: var(--color-primary, #0a7d64);
          display: grid;
          place-items: center;
        }
        .lp-title {
          font-weight: 600;
          font-size: clamp(1.4rem, 2.6vw, 1.6rem);
          line-height: 1.2;
          margin: 0 0 0.6rem;
          color: var(--color-text, #131313);
        }
        .lp-body {
          color: var(--color-text-muted, #333333);
          font-size: 0.95rem;
          margin: 0 auto 1.2rem;
          max-width: 38ch;
          line-height: 1.45;
        }

        .lp-actions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 0.9rem;
        }
        .lp-actions :global(.btn) {
          width: 100%;
        }
        .lp-foot {
          font-size: 0.78rem;
          color: var(--color-text-muted, #333333);
          margin: 0;
        }
      `}</style>
    </div>,
    document.body
  );
}

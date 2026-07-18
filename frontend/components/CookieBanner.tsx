"use client";
import { useEffect, useRef } from "react";

export default function CookieBanner() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const banner = ref.current;
    if (!banner) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("finvoq-cookie-consent");
    } catch {}
    if (stored) return;

    const show = setTimeout(() => banner.classList.add("show"), 1800);

    const dismiss = (choice: string) => {
      try {
        localStorage.setItem("finvoq-cookie-consent", choice);
      } catch {}
      banner.classList.remove("show");
      banner.classList.add("gone");
      setTimeout(() => banner.remove(), 550);
    };

    const acc = banner.querySelector("#cookieAccept");
    const dec = banner.querySelector("#cookieDecline");
    const onAcc = () => dismiss("accepted");
    const onDec = () => dismiss("essential-only");
    acc?.addEventListener("click", onAcc);
    dec?.addEventListener("click", onDec);

    return () => {
      clearTimeout(show);
      acc?.removeEventListener("click", onAcc);
      dec?.removeEventListener("click", onDec);
    };
  }, []);

  return (
    <div
      className="cookie-banner"
      id="cookieBanner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      ref={ref}
    >
      <div className="cb-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.4A9 9 0 1 1 11.6 3a4 4 0 0 0 4 4 4 4 0 0 0 4 4 4 4 0 0 0 1.4 1.4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="10" r="1" fill="currentColor" />
          <circle cx="14" cy="14" r="1" fill="currentColor" />
          <circle cx="9" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
      <div className="cb-text">
        <strong>We use cookies to keep things working.</strong>
        <span>
          Essential cookies run the platform. Analytics cookies help us improve
          the experience. You can change this anytime in settings.
        </span>
      </div>
      <div className="cb-actions">
        <button className="btn btn-ghost" type="button" id="cookieDecline">
          Essential only
        </button>
        <button
          className="btn btn-primary"
          type="button"
          id="cookieAccept"
          data-magnetic
        >
          Accept all
        </button>
      </div>
    </div>
  );
}

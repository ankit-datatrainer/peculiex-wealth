"use client";

import { useAuth } from "@/lib/auth-context";
import GuestView from "./watchlist/GuestView";
import AuthedView from "./watchlist/AuthedView";

/**
 * /watchlist top-level component. Picks the right experience based on
 * auth state. While the auth context is still booting (waiting on /me),
 * we render a minimal placeholder so we don't flash the marketing page
 * to a logged-in returning user.
 */
export default function Watchlist() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <section
        className="container"
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "4rem 0"
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid rgba(10, 160, 128,0.15)",
            borderTopColor: "#0a7d64",
            animation: "wlspin 0.9s linear infinite"
          }}
        />
        <style jsx>{`
          @keyframes wlspin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </section>
    );
  }

  /* AuthedView uses the container internally (with full-bleed hero header).
     GuestView is full-width by design — no outer container needed. */
  if (user) {
    return (
      <div className="container">
        <AuthedView />
      </div>
    );
  }

  return <GuestView />;
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ExploreEquities() {
  return (
    <section className="explore-equities-section">
      <div className="explore-equities-container">
        {/* Left Content Area */}
        <div className="explore-equities-content reveal">
          <span className="explore-equities-eyebrow">
            <span className="ee-live-dot" />Live Markets
          </span>
          <h1 className="explore-equities-title">
            Explore <em>Live Equities</em> Here
          </h1>
          <p className="explore-equities-desc">
            Every market move. Delivered in real time.
          </p>
          <Link href="/watchlist" className="explore-equities-btn" data-magnetic>
            Explore <span className="btn-arrow">→</span>
          </Link>
        </div>

        {/* Right Image Area */}
        <div className="explore-equities-visual reveal">
          <div className="explore-equities-image-wrapper">
            <Image
              src="/trading_mockup.png"
              alt="Finvoq live equities watchlist dashboard"
              fill
              className="explore-equities-image"
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

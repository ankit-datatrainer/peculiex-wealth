"use client";

import { imgSrc } from "@/lib/content";

interface HeroInfinityStageProps {
  heroInfinity?: string;
}

export default function HeroInfinityStage({ heroInfinity }: HeroInfinityStageProps) {
  return (
    <div className="hero-infinity-stage">
      {/* ── Main Golden Infinity Artwork ───────────────────────────── */}
      <div className="hero-infinity-mark-wrap">
        {heroInfinity ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc(heroInfinity)}
            alt="Finvoq Multi-Asset Wealth"
            className="sfc-hero-mark-img"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/golden_infinity.png"
            alt="Finvoq Golden Infinity"
            className="sfc-hero-mark-img"
          />
        )}
      </div>

      <style jsx>{`
        .hero-infinity-stage {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-infinity-mark-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sfc-hero-mark-img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 48svh;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        :global(.dark) .sfc-hero-mark-img {
          mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
}

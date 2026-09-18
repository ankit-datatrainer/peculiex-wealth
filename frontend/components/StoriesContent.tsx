"use client";

import Link from "next/link";
import PageHero from "@/components/PageHero";
import { useContent } from "@/lib/content";

const AVATAR_PALETTES: Record<string, { bg: string; ring: string; glow: string }> = {
  "#0E3F76": {
    bg: "linear-gradient(135deg, #2563eb 0%, #0e3f76 60%, #081d38 100%)",
    ring: "rgba(37, 99, 235, 0.28)",
    glow: "rgba(14, 63, 118, 0.28)"
  },
  "#7c3aed": {
    bg: "linear-gradient(135deg, #a855f7 0%, #7c3aed 60%, #4c1d95 100%)",
    ring: "rgba(168, 85, 247, 0.28)",
    glow: "rgba(124, 58, 237, 0.28)"
  },
  "#13735d": {
    bg: "linear-gradient(135deg, #10b981 0%, #13735d 60%, #064e3b 100%)",
    ring: "rgba(16, 185, 129, 0.28)",
    glow: "rgba(19, 115, 93, 0.28)"
  },
  "#ea7c1c": {
    bg: "linear-gradient(135deg, #fb923c 0%, #ea580c 60%, #7c2d12 100%)",
    ring: "rgba(251, 146, 60, 0.28)",
    glow: "rgba(234, 124, 28, 0.28)"
  },
  "#16a34a": {
    bg: "linear-gradient(135deg, #34d399 0%, #16a34a 60%, #064e3b 100%)",
    ring: "rgba(52, 211, 153, 0.28)",
    glow: "rgba(22, 163, 74, 0.28)"
  },
  "#dc2626": {
    bg: "linear-gradient(135deg, #f87171 0%, #dc2626 60%, #7f1d1d 100%)",
    ring: "rgba(248, 113, 113, 0.28)",
    glow: "rgba(220, 38, 38, 0.28)"
  }
};

function getAvatarPalette(color?: string) {
  if (!color) {
    return {
      bg: "linear-gradient(135deg, #2563eb 0%, #0e3f76 60%, #081d38 100%)",
      ring: "rgba(37, 99, 235, 0.28)",
      glow: "rgba(14, 63, 118, 0.28)"
    };
  }
  const normalized = color.trim().toLowerCase();
  for (const [key, palette] of Object.entries(AVATAR_PALETTES)) {
    if (key.toLowerCase() === normalized) return palette;
  }
  return {
    bg: color.startsWith("linear")
      ? color
      : `linear-gradient(135deg, ${color} 0%, #0f172a 100%)`,
    ring: "rgba(0, 0, 0, 0.15)",
    glow: "rgba(0, 0, 0, 0.18)"
  };
}

const DEFAULT_STORIES = [
  {
    initials: "AS",
    color: "#0E3F76",
    name: "Aarav Shah",
    role: "Founder, Lumen Studios",
    headline: "From scattered demats to one ledger.",
    quote:
      "I had four demat accounts, two LIC policies I'd forgotten about, and ₹40L sitting in a savings account because I didn't know what to do with it. The Finvoq team consolidated everything inside two weeks and built me a 60-30-10 portfolio that actually fits my horizon.",
    metric: "₹2.1 Cr consolidated · 12 months"
  },
  {
    initials: "PK",
    color: "#7c3aed",
    name: "Priya Kapoor",
    role: "Director, MIT-K Capital",
    headline: "Finally got into the funds I'd been refused before.",
    quote:
      "As an HNI you get pitched a thousand AIFs, and almost none of them are worth the lock-up. Finvoq's research desk turned down two of the three I was leaning toward, for very specific reasons. The one we did go with is up 19% IRR after fees.",
    metric: "₹1.4 Cr deployed across two AIFs"
  },
  {
    initials: "VI",
    color: "#13735d",
    name: "Vikram Iyer",
    role: "Managing Partner, Iyer Family Office",
    headline: "Family-office service without family-office overheads.",
    quote:
      "We were quoted ₹12L/year by a private bank for what is essentially a quarterly review and a curated product list. Finvoq does the same for a fraction, and they take regulatory compliance seriously: every meeting is documented, every recommendation is auditable.",
    metric: "₹4.8 Cr managed · zero commissions"
  },
  {
    initials: "NR",
    color: "#ea7c1c",
    name: "Neha Reddy",
    role: "CFO, Zenith Health",
    headline: "Three hours a week back, every week.",
    quote:
      "I used to spend Sunday mornings logging into five different platforms to figure out what I owned. Now I open one tab. The dashboard alone justified the move, the advisory fees are gravy.",
    metric: "5 platforms → 1 dashboard"
  },
  {
    initials: "RB",
    color: "#16a34a",
    name: "Rajesh Bansal",
    role: "Retd. Senior Banker, 25-yr investor",
    headline: "First platform that actually serves the investor.",
    quote:
      "I've been investing through public-sector banks, private banks, three different brokers, and two robo-advisors. Finvoq is the first one where I felt like I was the customer, not the product. It shouldn't be a rare thing: but it is.",
    metric: "₹3.2 Cr portfolio, post-retirement"
  },
  {
    initials: "KM",
    color: "#dc2626",
    name: "Karan Mehta",
    role: "Founder, Stride Ventures",
    headline: "Got into a PMS that's beaten the index for 7 years.",
    quote:
      "The PMS I'd been wanting was closed to new HNI investors. Finvoq got me in via a partner allocation, with full disclosure of fees, exit terms, and historical drawdowns. No 'best returns' marketing: just the data and a recommendation I could pressure-test.",
    metric: "PMS · ₹75L · onboarded in 11 days"
  }
];

export default function StoriesContent() {
  const cms = useContent("stories");

  const stories = cms.list<{
    initials: string;
    color: string;
    name: string;
    role: string;
    headline: string;
    quote: string;
    metric?: string;
  }>("stories", "items", DEFAULT_STORIES);

  const buttonLabel = cms.t("cta", "buttonLabel", "Open your account →");
  const buttonHref = cms.t("cta", "buttonHref", "/get-started");

  return (
    <>
      <style>{`
        .story-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 28px;
        }

        .story-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-divider);
          border-radius: 20px;
          padding: 34px 30px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.025);
        }

        .story-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 42px -10px rgba(0, 0, 0, 0.09), 0 4px 14px rgba(0, 0, 0, 0.03);
          border-color: rgba(14, 63, 118, 0.25);
        }

        .story-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .story-avatar-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .story-card:hover .story-avatar-circle {
          transform: scale(1.06);
        }

        .story-avatar-initials {
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
          user-select: none;
        }

        .story-author-info {
          flex: 1;
          min-width: 0;
        }

        .story-author-name {
          font-size: 1.06rem;
          font-weight: 700;
          color: var(--color-text);
          letter-spacing: -0.012em;
          line-height: 1.3;
        }

        .story-author-role {
          font-size: 0.86rem;
          color: var(--color-text-muted);
          font-weight: 500;
          margin-top: 3px;
          line-height: 1.35;
        }

        .story-quote-icon {
          opacity: 0.14;
          color: var(--color-text);
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.25s ease, color 0.25s ease;
        }

        .story-card:hover .story-quote-icon {
          opacity: 0.35;
          color: var(--color-primary);
        }

        .story-card-headline {
          font-family: var(--font-display);
          font-size: 1.32rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          line-height: 1.35;
          color: var(--color-text);
          margin: 0;
        }

        .story-card-quote {
          color: var(--color-text-muted);
          line-height: 1.72;
          font-size: 0.96rem;
          margin: 0;
          flex: 1;
        }

        @media (max-width: 768px) {
          .story-cards-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .story-card {
            padding: 26px 22px;
          }
        }
      `}</style>

      <PageHero
        page="stories"
        label="Investor stories"
        title={<>Investors who chose <em>process over noise.</em></>}
        subtitle="No paid testimonials. These are real Finvoq clients, with the headline change in their portfolio in their own words."
      />

      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <div className="story-cards-grid">
            {stories.map((s, idx) => {
              const avatar = getAvatarPalette(s.color);
              return (
                <article
                  key={s.name || idx}
                  className="story-card"
                >
                  <div className="story-card-header">
                    <div
                      className="story-avatar-circle"
                      style={{
                        background: avatar.bg,
                        boxShadow: `0 0 0 3px var(--color-surface, #ffffff), 0 0 0 4.5px ${avatar.ring}, 0 8px 20px -3px ${avatar.glow}, inset 0 1.5px 2px rgba(255, 255, 255, 0.45)`
                      }}
                    >
                      <span className="story-avatar-initials">
                        {s.initials || s.name?.slice(0, 2).toUpperCase() || "IN"}
                      </span>
                    </div>

                    <div className="story-author-info">
                      <div className="story-author-name">{s.name}</div>
                      <div className="story-author-role">{s.role}</div>
                    </div>

                    <div className="story-quote-icon" aria-hidden="true">
                      <svg width="24" height="20" viewBox="0 0 24 20" fill="currentColor">
                        <path d="M9.6 0C5.1 2.4 2.1 6.3 1.2 11.2c-.3 1.5-.4 2.8-.4 3.8 0 2.8 1.9 5 4.8 5 2.7 0 4.6-2 4.6-4.7 0-2.6-1.9-4.5-4.4-4.5-.4 0-.8.1-1.2.2.6-3.3 2.6-6.1 5.6-7.8L9.6 0zm13.2 0c-4.5 2.4-7.5 6.3-8.4 11.2-.3 1.5-.4 2.8-.4 3.8 0 2.8 1.9 5 4.8 5 2.7 0 4.6-2 4.6-4.7 0-2.6-1.9-4.5-4.4-4.5-.4 0-.8.1-1.2.2.6-3.3 2.6-6.1 5.6-7.8L22.8 0z" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="story-card-headline">
                    {s.headline}
                  </h3>

                  <p className="story-card-quote">
                    &ldquo;{s.quote}&rdquo;
                  </p>
                </article>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 80 }}>
            <Link href={buttonHref} className="btn btn-primary btn-lg" data-magnetic>
              {buttonLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}


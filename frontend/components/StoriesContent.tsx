"use client";

import Link from "next/link";
import PageHero from "@/components/PageHero";
import { useContent } from "@/lib/content";

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
    metric: string;
  }>("stories", "items", DEFAULT_STORIES);

  const buttonLabel = cms.t("cta", "buttonLabel", "Open your account →");
  const buttonHref = cms.t("cta", "buttonHref", "/get-started");

  return (
    <>
      <PageHero
        page="stories"
        label="Investor stories"
        title={<>Investors who chose <em>process over noise.</em></>}
        subtitle="No paid testimonials. These are real Finvoq clients, with the headline change in their portfolio in their own words."
      />

      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
              gap: "24px"
            }}
          >
            {stories.map((s, idx) => (
              <article
                key={s.name || idx}
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: 18,
                  padding: 32,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span
                    className="testi-avatar"
                    style={{
                      background: s.color || "#0E3F76",
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem"
                    }}
                  >
                    {s.initials || s.name?.slice(0, 2).toUpperCase() || "IN"}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
                      {s.role}
                    </div>
                  </div>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.35rem",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3
                  }}
                >
                  {s.headline}
                </h3>
                <p
                  style={{
                    color: "var(--color-text)",
                    lineHeight: 1.65,
                    fontSize: "0.98rem"
                  }}
                >
                  &ldquo;{s.quote}&rdquo;
                </p>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-faint)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-divider)",
                    marginTop: "auto"
                  }}
                >
                  {s.metric}
                </div>
              </article>
            ))}
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

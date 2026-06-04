import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Market Insights",
  description:
    "Curated weekly research from the Peculiex desk — what we're watching across Indian equities, debt, unlisted, and global markets."
};

const POSTS = [
  {
    tag: "Equity Strategy",
    title: "After a 12% NIFTY run-up, where do we trim?",
    summary:
      "Mid-cap valuations have stretched well past their 10-year median P/E. We walk through three positions we're scaling back, the screen we used, and what we're rotating into.",
    date: "May 22, 2026",
    read: "8 min read"
  },
  {
    tag: "Mutual Funds",
    title: "Direct vs. regular plans: the real cost of a 1% expense ratio",
    summary:
      "Across a 20-year SIP at ₹25,000/month, the difference between a regular and direct plan adds up to ₹38L. We model it scheme-by-scheme.",
    date: "May 18, 2026",
    read: "6 min read"
  },
  {
    tag: "Unlisted",
    title: "Pre-IPO inventory: what's moving and what's not",
    summary:
      "NSE India and Tata Capital have firm pricing; Pharmeasy and Oyo are still in price discovery. Our quarterly cap-table refresh, with implied valuations.",
    date: "May 14, 2026",
    read: "10 min read"
  },
  {
    tag: "Fixed Income",
    title: "G-Sec curve at 7.18% — buying duration here?",
    summary:
      "With the RBI on a holding pattern and inflation easing toward target, longer-dated G-Secs are starting to look attractive. The math, the risks, and the alternatives.",
    date: "May 10, 2026",
    read: "7 min read"
  },
  {
    tag: "Tax & Compliance",
    title: "ELSS in May: is the late-tax-saver penalty worth it?",
    summary:
      "Buying ELSS in March is the worst time of year. Buying in May is among the best. We unpack why, and which schemes survived our quality screen.",
    date: "May 06, 2026",
    read: "5 min read"
  },
  {
    tag: "Behaviour",
    title: "The investor who beat the market — by doing nothing for 3 years",
    summary:
      "A real portfolio review of one of our investors who hit pause on rebalancing during the 2023–24 run, and outperformed by 3.4% p.a. as a result.",
    date: "May 01, 2026",
    read: "9 min read"
  },
  {
    tag: "Global",
    title: "What rising US yields mean for your Indian portfolio",
    summary:
      "FII flows, INR-USD, and the import-cost translation — three transmission channels and the asset classes most exposed.",
    date: "Apr 26, 2026",
    read: "6 min read"
  },
  {
    tag: "Insurance",
    title: "Term cover vs. whole-life: still the same answer in 2026",
    summary:
      "We re-ran the math at 2026 premium tables. The conclusion is unchanged: pure term plus mutual fund SIP beats whole-life by a wide margin.",
    date: "Apr 20, 2026",
    read: "5 min read"
  },
  {
    tag: "Real Estate",
    title: "REITs in 2026: yield is back, but is growth?",
    summary:
      "Embassy and Mindspace yields have recovered to 7%+, but rental escalations are slowing. We rate the four listed REITs on yield, growth, and balance-sheet strength.",
    date: "Apr 14, 2026",
    read: "7 min read"
  }
];

export default function InsightsPage() {
  return (
    <>
      <PageHero
        label="Market Insights"
        title={<>Research, before <em>the noise.</em></>}
        subtitle="Weekly notes from our research desk on Indian equities, debt, unlisted, and global flows. No tip sheets, no forecasts dressed up as facts."
      />

      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <div className="blog-grid">
            {POSTS.map((p, i) => (
              <article className="blog-card" key={i}>
                <div className="blog-tag">{p.tag}</div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <div className="blog-meta">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.read}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

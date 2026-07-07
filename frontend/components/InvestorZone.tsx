import Link from "next/link";

type Tool = {
  href: string;
  title: string;
  body: string;
  cta: string;
  icon: string;
};

const TOOLS: Tool[] = [
  {
    href: "/markets",
    title: "Live Markets",
    body: "Track indices, equities and real-time quotes across NSE & BSE with charts and watchlists.",
    cta: "Open markets",
    icon: "i-trending-up"
  },
  {
    href: "/watchlist",
    title: "My Watchlist",
    body: "Save the stocks, funds and unlisted names you care about and follow them in one place.",
    cta: "View watchlist",
    icon: "i-star"
  },
  {
    href: "/#mf-performance",
    title: "MF Performance",
    body: "See top-performing mutual funds ranked by 1Y, 3Y and 5Y returns, tracked by our desk.",
    cta: "See fund rankings",
    icon: "i-bar-chart"
  },
  {
    href: "/calculator",
    title: "SIP Calculator",
    body: "Model how monthly SIPs compound over time at different return and duration assumptions.",
    cta: "Calculate SIP",
    icon: "i-coin"
  },
  {
    href: "/calculator/reverse-sip",
    title: "Reverse SIP Calculator",
    body: "Start from a target corpus and work backward to the exact monthly SIP you need.",
    cta: "Plan my goal",
    icon: "i-grid"
  },
  {
    href: "/unlisted",
    title: "Unlisted Shares",
    body: "Explore curated pre-IPO and unlisted opportunities with transparent pricing.",
    cta: "Browse unlisted",
    icon: "i-lock"
  },
  {
    href: "/reckoner",
    title: "Marcom & Centricity Reckoner",
    body: "Score your marketing communication and client-centricity and see where to improve.",
    cta: "Run the reckoner",
    icon: "i-gem"
  },
  {
    href: "/news",
    title: "Market News",
    body: "The latest financial news aggregated from Yahoo India Finance and leading wires.",
    cta: "Read the news",
    icon: "i-building"
  }
];

export default function InvestorZone() {
  return (
    <main className="izone">
      <div className="container">
        <section className="izone-hero reveal">
          <span className="label">InvestorZone</span>
          <h1>
            Every tool an investor needs, <em>in one place.</em>
          </h1>
          <p>
            Your command center — live markets, calculators, fund performance, unlisted access and
            research, curated for the Visionary Trailblazers community.
          </p>
        </section>

        <section className="izone-grid">
          {TOOLS.map((t) => (
            <Link href={t.href} key={t.title} className="izone-card reveal" data-tilt>
              <div className="izone-icon">
                <svg>
                  <use href={`#${t.icon}`} />
                </svg>
              </div>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
              <span className="izone-cta">{t.cta} →</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

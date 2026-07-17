type Card = {
  icon: string;
  title: string;
  body: string;
  meta: string;
};

const CARDS: Card[] = [
  {
    icon: "i-shield",
    title: "Bank-grade security",
    body: "RBI & SEBI compliant. End-to-end encryption. Annual third-party audits. Your wealth, fully protected.",
    meta: "SOC 2 · ISO 27001"
  },
  {
    icon: "i-gem",
    title: "Curated by experts",
    body: "Every product is hand-picked by SEBI-registered advisors. We say no to nine out of ten opportunities we evaluate.",
    meta: "15+ years experience"
  },
  {
    icon: "i-grid",
    title: "One unified platform",
    body: "Equities, mutual funds, unlisted, PMS, AIF, bonds, insurance — and a single dashboard that ties it all together.",
    meta: "8 asset classes"
  },
  {
    icon: "i-coin",
    title: "Transparent pricing",
    body: "Flat advisory fees. Zero hidden charges. No revenue from product manufacturers — your interest is the only one we serve.",
    meta: "No commissions, ever"
  },
  {
    icon: "i-star",
    title: "Premium support",
    body: "A dedicated relationship manager for every investor. WhatsApp, email, or call — your advisor is reachable in minutes.",
    meta: "Dedicated RM included"
  },
  {
    icon: "i-trending-up",
    title: "Real-time execution",
    body: "From research to investing — completed in seconds. No paperwork. No fragmentation. No waiting on multiple platforms.",
    meta: "< 60 seconds to invest"
  }
];

export default function Why() {
  return (
    <section id="why" className="why-sec">
      <div className="container">
        <div className="sec-head sec-head-center reveal">
          <div className="label">Why Finvoq</div>
          <h2 className="stitle">
            Built for investors who <em>refuse to compromise.</em>
          </h2>
          <p className="sdesc">
            Six fundamentals that separate us from every other platform in
            India.
          </p>
        </div>

        <div className="why-grid reveal-stagger">
          {CARDS.map((c) => (
            <article className="why-card why-card-static reveal" key={c.title}>
              <div className="why-icon">
                <svg>
                  <use href={`#${c.icon}`} />
                </svg>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <div className="why-meta">
                <span className="status-dot"></span>
                {c.meta}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

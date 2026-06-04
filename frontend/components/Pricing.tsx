const Check = () => (
  <svg viewBox="0 0 14 14">
    <path
      d="M2 7l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default function Pricing() {
  return (
    <section id="pricing" className="pricing-sec">
      <div className="container">
        <div className="sec-head sec-head-center reveal">
          <div className="label">Pricing</div>
          <h2 className="stitle">
            Transparent. <em>Always.</em>
          </h2>
          <p className="sdesc">
            Pay for advice, never for products. We earn nothing from
            manufacturers, distributors, or anyone else — only from you.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Tier 1: Essentials */}
          <article className="price-card reveal" data-tilt>
            <div className="pc-head">
              <h3>Essentials</h3>
              <p className="pc-best">For self-directed investors</p>
            </div>
            <div className="pc-price">
              <span className="pc-currency">₹</span>
              <span className="pc-num">0</span>
              <span className="pc-per">/ month</span>
            </div>
            <p className="pc-summary">
              Full marketplace access without an advisor — for investors who
              already know what they want.
            </p>
            <ul className="pc-feats">
              <li>
                <Check />
                Marketplace access · 8 asset classes
              </li>
              <li>
                <Check />
                Live market data &amp; sparklines
              </li>
              <li>
                <Check />
                Calculator suite (SIP, lumpsum, goal)
              </li>
              <li>
                <Check />
                Unified portfolio dashboard
              </li>
              <li>
                <Check />
                Email support
              </li>
            </ul>
            <a href="/get-started" className="btn btn-ghost btn-lg pc-cta" data-magnetic>
              Get started
            </a>
          </article>



          {/* Tier 3: Private Client */}
          <article className="price-card reveal" data-tilt>
            <div className="pc-head">
              <h3>Private Client</h3>
              <p className="pc-best">For portfolios above ₹1 Cr</p>
            </div>
            <div className="pc-price">
              <span className="pc-num pc-custom">Custom</span>
              <span className="pc-per">tailored mandates</span>
            </div>
            <p className="pc-summary">
              Family-office-grade service for individuals, families, and
              institutions managing wealth at scale.
            </p>
            <ul className="pc-feats">
              <li>
                <Check />
                Everything in Essentials
              </li>
              <li>
                <Check />
                Dedicated family-office team
              </li>
              <li>
                <Check />
                Priority access · PMS, AIF, unlisted
              </li>
              <li>
                <Check />
                Custom investment mandates
              </li>
              <li>
                <Check />
                Estate &amp; succession planning
              </li>
              <li>
                <Check />
                Direct contact with research partners
              </li>
            </ul>
            <a href="/get-started" className="btn btn-ghost btn-lg pc-cta" data-magnetic>
              Contact us
            </a>
          </article>
        </div>


      </div>
    </section>
  );
}

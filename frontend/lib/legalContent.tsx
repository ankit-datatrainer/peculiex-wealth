export type LegalDoc = {
  slug: string;
  label: string;
  title: string;
  subtitle: string;
  updated: string;
  body: React.ReactNode;
};

export const LEGAL: Record<string, LegalDoc> = {
  terms: {
    slug: "terms",
    label: "Legal",
    title: "Terms of Service",
    subtitle:
      "The agreement between you and Finvoq Wealth Pvt. Ltd. when you use any of our services.",
    updated: "Last updated: 1 May 2026",
    body: (
      <>
        <h2>1. Acceptance of terms</h2>
        <p>
          By creating an account on Finvoq or using any feature of this website or its
          mobile app (the "Platform"), you agree to be bound by these Terms of Service
          ("Terms"). If you do not agree, do not use the Platform.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old, an Indian resident or NRI eligible to invest in
          Indian markets, and able to enter into a legally binding contract under the Indian
          Contract Act, 1872. You are responsible for the accuracy of every detail you
          provide during account opening and KYC.
        </p>

        <h2>3. Nature of services</h2>
        <p>
          Finvoq is a SEBI Registered Investment Adviser (RIA: INA000099999). We provide
          investment advisory services and an execution interface to SEBI-registered partner
          brokers, AMCs, and IRDAI-licensed insurers. Finvoq itself does not hold custody
          of your money or securities — every trade settles into your own demat or insurance
          policy.
        </p>

        <h2>4. Fees</h2>
        <p>
          Fees are billed quarterly in advance, calculated as a percentage of assets under
          advisory at the start of each quarter, plus applicable GST. The exact fee schedule
          is disclosed in your client onboarding agreement and is subject to change with 30
          days' written notice.
        </p>

        <h2>5. Investment risk</h2>
        <p>
          <strong>
            Investments in securities markets are subject to market risks. Read all related
            documents carefully before investing.
          </strong>{" "}
          Past performance is not indicative of future returns. Finvoq does not guarantee
          any specific return on any investment.
        </p>

        <h2>6. Your responsibilities</h2>
        <ul>
          <li>Keep your login credentials confidential and notify us immediately of any unauthorised access.</li>
          <li>Provide accurate, current, and complete information during onboarding and update it when material facts change.</li>
          <li>Comply with all applicable tax laws on your investments — Finvoq provides reports but does not file taxes for you.</li>
          <li>Use the Platform only for lawful, personal investment purposes.</li>
        </ul>

        <h2>7. Intellectual property</h2>
        <p>
          All content on the Platform — design, text, logos, research notes — is owned by
          Finvoq Wealth Pvt. Ltd. or licensed to us. You may use the content for your own
          investment decisions but may not redistribute, scrape, or commercially exploit it
          without written consent.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Finvoq's aggregate liability for any
          claim relating to the Platform is limited to the advisory fees you have paid us in
          the twelve months preceding the claim. We are not liable for indirect, incidental,
          consequential, or speculative losses.
        </p>

        <h2>9. Termination</h2>
        <p>
          You may terminate your relationship with Finvoq at any time by giving 30 days'
          written notice. We may terminate or suspend your account for breach of these
          Terms, suspected fraud, or regulatory requirement. Termination does not relieve
          either party of obligations accrued before the termination date.
        </p>

        <h2>10. Governing law &amp; dispute resolution</h2>
        <p>
          These Terms are governed by Indian law. Any dispute will first go through our{" "}
          <a href="/legal/grievance">grievance redressal</a> process, then to SEBI's SCORES
          portal where applicable, and finally to the courts in Mumbai.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:legal@finvoq.example.com">legal@finvoq.example.com</a>.
        </p>
      </>
    )
  },

  privacy: {
    slug: "privacy",
    label: "Legal",
    title: "Privacy Policy",
    subtitle:
      "How we collect, use, store, and protect your personal data — and the rights you have over it.",
    updated: "Last updated: 1 May 2026",
    body: (
      <>
        <h2>1. What we collect</h2>
        <ul>
          <li><strong>Identity data:</strong> name, PAN, Aadhaar (for eKYC only), date of birth.</li>
          <li><strong>Contact data:</strong> email, phone, address.</li>
          <li><strong>Financial data:</strong> bank account, demat details, investment portfolio, transaction history.</li>
          <li><strong>Usage data:</strong> pages viewed, features used, device and browser metadata.</li>
        </ul>

        <h2>2. Why we collect it</h2>
        <ul>
          <li>To complete KYC and open your investment account, as required by SEBI.</li>
          <li>To provide investment advisory services and execute transactions you authorise.</li>
          <li>To send you service updates, portfolio reports, and tax statements.</li>
          <li>To comply with legal and regulatory obligations (PMLA, SEBI, RBI, IT Department).</li>
          <li>To improve our products — only on aggregated, anonymised data.</li>
        </ul>

        <h2>3. Who we share it with</h2>
        <p>
          We share your data <strong>only</strong> with:
        </p>
        <ul>
          <li>SEBI-registered partner brokers, AMCs, and IRDAI-licensed insurers — as needed to execute the investments you authorise.</li>
          <li>Regulators (SEBI, RBI, IT Dept., FIU-IND) on lawful demand.</li>
          <li>Third-party service providers (e-sign, eKYC, hosting) under strict contractual data-protection terms.</li>
        </ul>
        <p>
          We <strong>do not</strong> sell your data, and we <strong>do not</strong> share it
          with marketing partners.
        </p>

        <h2>4. How we protect it</h2>
        <ul>
          <li>Encryption in transit (TLS 1.2+) and at rest (AES-256).</li>
          <li>Role-based access on the server side — least-privilege by default.</li>
          <li>Annual third-party security audits and quarterly internal reviews.</li>
          <li>Database row-level security: only server-side service-role keys can read sensitive data.</li>
        </ul>

        <h2>5. How long we keep it</h2>
        <p>
          Active client data is retained for the duration of our relationship. After you
          close your account, we retain records for 8 years as required by SEBI and PMLA,
          after which they are securely deleted.
        </p>

        <h2>6. Your rights</h2>
        <ul>
          <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> request correction of inaccurate data.</li>
          <li><strong>Deletion:</strong> request deletion (subject to regulatory retention requirements).</li>
          <li><strong>Portability:</strong> receive your data in a machine-readable format.</li>
          <li><strong>Withdrawal:</strong> revoke consent for non-essential processing.</li>
        </ul>
        <p>
          Email <a href="mailto:privacy@finvoq.example.com">privacy@finvoq.example.com</a>
          {" "}to exercise any of these rights. We respond within 30 days.
        </p>

        <h2>7. Cookies</h2>
        <p>
          We use essential cookies to keep you logged in and analytics cookies to understand
          how the Platform is used. You can change cookie preferences at any time via the
          banner shown on first visit.
        </p>

        <h2>8. Updates</h2>
        <p>
          When we update this policy materially, we'll notify you by email at least 14 days
          before the change takes effect.
        </p>
      </>
    )
  },

  "risk-disclosure": {
    slug: "risk-disclosure",
    label: "Legal",
    title: "Risk Disclosure",
    subtitle:
      "A frank disclosure of the risks you take when investing through Finvoq.",
    updated: "Last updated: 1 May 2026",
    body: (
      <>
        <h2>1. General market risk</h2>
        <p>
          The price of every traded security can go up or down based on market conditions,
          economic events, company-specific news, and investor sentiment. There is no such
          thing as a guaranteed-return investment in regulated markets.
        </p>

        <h2>2. Asset-class-specific risks</h2>
        <h3>Listed equities</h3>
        <p>
          Subject to daily price volatility. A diversified portfolio reduces single-stock
          risk but not market risk. Liquidity may be limited in mid- and small-caps during
          stressed market conditions.
        </p>
        <h3>Mutual funds</h3>
        <p>
          NAVs fluctuate daily with the underlying portfolio. Equity funds carry equity-market
          risk; debt funds carry interest-rate and credit risk. Read the Scheme Information
          Document (SID) before investing.
        </p>
        <h3>Unlisted shares</h3>
        <p>
          Significantly less liquid than listed equity. Price discovery is opaque. Lock-in
          periods (commonly 6 months post-IPO) apply. Companies may delay or cancel IPO
          plans, which can leave you with an illiquid position. Capital loss is possible.
        </p>
        <h3>PMS &amp; AIF</h3>
        <p>
          Concentrated portfolios with higher single-issuer risk than mutual funds. Lock-in
          periods, exit loads, and limited liquidity apply. Past manager performance may not
          repeat.
        </p>
        <h3>Bonds and G-Secs</h3>
        <p>
          Interest-rate risk: bond prices fall when yields rise. Credit risk: corporate
          issuers can default. Reinvestment risk: coupons may have to be reinvested at lower
          yields.
        </p>
        <h3>Insurance products</h3>
        <p>
          Term life and health products provide pure protection. Premiums lapse if not paid.
          Pre-existing conditions and waiting periods apply. We do not sell ULIPs or
          endowment plans.
        </p>

        <h2>3. Operational risks</h2>
        <ul>
          <li>Settlement delays at exchanges, banks, or RTAs can delay your transactions.</li>
          <li>System outages — at our end, our partner broker's, or the exchange's — can prevent timely execution.</li>
          <li>Cybersecurity incidents, despite our controls, remain a residual risk.</li>
        </ul>

        <h2>4. Regulatory risks</h2>
        <p>
          Tax laws, SEBI rules, and product-level regulations can change with limited notice.
          Some changes (e.g., long-term capital gains tax revisions) materially affect
          after-tax returns.
        </p>

        <h2>5. Advice is not a guarantee</h2>
        <p>
          Finvoq's research and recommendations are based on information available at the
          time and reasonable assumptions about future conditions. They are not predictions
          and should not be treated as such. The final investment decision is yours.
        </p>

        <h2>6. Investor responsibility</h2>
        <p>
          Read all relevant offer documents (KIM, SID, term sheet, prospectus) before
          investing. Invest only what you can afford to lose without affecting your
          essential needs. Maintain an emergency fund separate from your investment
          portfolio.
        </p>

        <hr />

        <p>
          Questions? Reach our advisory desk at{" "}
          <a href="mailto:advisory@finvoq.example.com">advisory@finvoq.example.com</a>.
        </p>
      </>
    )
  },

  grievance: {
    slug: "grievance",
    label: "Legal",
    title: "Grievance Redressal",
    subtitle:
      "How to raise a complaint with Finvoq, and how we resolve it — within SEBI-mandated timelines.",
    updated: "Last updated: 1 May 2026",
    body: (
      <>
        <h2>Three-stage process</h2>

        <h3>Stage 1 — Customer support</h3>
        <p>
          Email{" "}
          <a href="mailto:support@finvoq.example.com">support@finvoq.example.com</a> or
          message us through the in-app chat. Our team responds within{" "}
          <strong>one business day</strong> and aims to resolve straightforward issues within{" "}
          <strong>three business days</strong>.
        </p>

        <h3>Stage 2 — Compliance officer</h3>
        <p>
          If your issue isn't resolved at Stage 1, escalate to our Compliance Officer:
        </p>
        <ul>
          <li>
            <strong>Name:</strong> Ms. Anjali Sharma
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:compliance@finvoq.example.com">compliance@finvoq.example.com</a>
          </li>
          <li>
            <strong>Phone:</strong> +91 22 4900 0000 · Mon–Fri 10am–6pm IST
          </li>
          <li>
            <strong>Address:</strong> Finvoq Wealth Pvt. Ltd., 12th floor, Phoenix Building,
            Lower Parel, Mumbai 400013
          </li>
        </ul>
        <p>
          Compliance acknowledges within <strong>2 business days</strong> and resolves
          within <strong>15 business days</strong> per SEBI guidelines.
        </p>

        <h3>Stage 3 — SEBI SCORES</h3>
        <p>
          If you remain dissatisfied, escalate to SEBI's online complaint portal:{" "}
          <a href="https://scores.sebi.gov.in/" target="_blank" rel="noopener noreferrer">
            https://scores.sebi.gov.in/
          </a>
          . You'll need our SEBI registration number:{" "}
          <strong>RIA INA000099999</strong>.
        </p>

        <h2>What information to include</h2>
        <ul>
          <li>Your full name and registered email/mobile.</li>
          <li>Your client ID, if known.</li>
          <li>The transaction or recommendation in question, with dates.</li>
          <li>What outcome you want.</li>
          <li>Any attachments — emails, statements, screenshots.</li>
        </ul>

        <h2>Our service standards</h2>
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Acknowledge</th>
              <th>Resolve</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Customer support</td><td>1 business day</td><td>3 business days</td></tr>
            <tr><td>Compliance officer</td><td>2 business days</td><td>15 business days</td></tr>
            <tr><td>SEBI SCORES</td><td>Per SEBI</td><td>Per SEBI</td></tr>
          </tbody>
        </table>

        <h2>Records</h2>
        <p>
          Every complaint is logged with a unique reference ID. The full audit trail is
          available to you on request and to SEBI on demand.
        </p>
      </>
    )
  },

  "investor-charter": {
    slug: "investor-charter",
    label: "Legal",
    title: "Investor Charter",
    subtitle:
      "Your rights and our commitments as a SEBI Registered Investment Adviser.",
    updated: "Last updated: 1 May 2026",
    body: (
      <>
        <h2>Vision</h2>
        <p>
          To provide professional, fee-only investment advice that puts the investor's
          interest above all else, and to make every recommendation transparent, auditable,
          and aligned with the investor's long-term goals.
        </p>

        <h2>Mission</h2>
        <ul>
          <li>Render unbiased advice based on the investor's risk profile, time horizon, and goals.</li>
          <li>Maintain clear disclosure of fees, conflicts of interest, and limitations of advice.</li>
          <li>Use due diligence on every product before recommending it.</li>
          <li>Respect investor confidentiality and protect personal data.</li>
        </ul>

        <h2>Services we provide</h2>
        <ul>
          <li>Investment planning and goal-based portfolio construction.</li>
          <li>Asset-allocation recommendations across mutual funds, equity, debt, unlisted, REITs, gold, and insurance.</li>
          <li>Periodic portfolio review and rebalancing suggestions.</li>
          <li>Tax-efficient withdrawal planning.</li>
        </ul>

        <h2>Rights of the investor</h2>
        <ol>
          <li>The right to be treated fairly and with respect.</li>
          <li>The right to receive advice in your language of choice (English or Hindi).</li>
          <li>The right to know your advisor's SEBI registration and credentials.</li>
          <li>The right to a written agreement before advisory services begin.</li>
          <li>The right to know exactly what fees you pay and to whom.</li>
          <li>The right to be informed of any conflict of interest, before the recommendation.</li>
          <li>The right to confidentiality of your financial and personal data.</li>
          <li>The right to seek redressal through Finvoq's grievance process and SEBI SCORES.</li>
        </ol>

        <h2>Investor responsibilities</h2>
        <ol>
          <li>Provide complete and accurate information at onboarding.</li>
          <li>Inform us promptly of any change in your financial situation, goals, or contact details.</li>
          <li>Read and understand all offer documents before investing.</li>
          <li>Understand that all investments carry risk, including loss of principal.</li>
          <li>Maintain a written record of all advice received and instructions given.</li>
        </ol>

        <h2>Service standards</h2>
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Timeline</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Onboarding (post KYC)</td><td>1 business day</td></tr>
            <tr><td>Investment plan delivery</td><td>3 business days</td></tr>
            <tr><td>Portfolio review</td><td>Quarterly</td></tr>
            <tr><td>Grievance acknowledgement</td><td>1 business day</td></tr>
            <tr><td>Grievance resolution</td><td>15 business days</td></tr>
          </tbody>
        </table>

        <h2>Do's &amp; don'ts</h2>
        <h3>Do's</h3>
        <ul>
          <li>Verify the SEBI registration number before engaging.</li>
          <li>Ask for a written investment plan with clear fees.</li>
          <li>Keep records of every advisory recommendation.</li>
          <li>Review your portfolio at least annually.</li>
        </ul>
        <h3>Don'ts</h3>
        <ul>
          <li>Don't act on tips or recommendations from unregistered persons.</li>
          <li>Don't share your demat or login credentials with anyone — including us.</li>
          <li>Don't invest in products you don't understand.</li>
          <li>Don't chase past returns at the expense of your risk profile.</li>
        </ul>
      </>
    )
  }
};

/**
 * Content for the AIF explorer on /products/aif.
 *
 * Structured as two branches — equity and debt — because the page presents
 * them as a flow: AIF → Equity / Debt → the strategies under each. Every
 * branch supplies the same shape, so the UI renders one code path twice and
 * only the branch-specific extras (equity's categories and taxation matrix,
 * debt's feature ring) are optional.
 */

export type AifFund = {
  name: string;
  description: string;
  tenure: string;
  /** Debt funds in the source material carry no exit load column. */
  exitLoad?: string;
};

export type AifParameter = { name: string; rationale: string };

export type AifBranch = {
  key: "equity" | "debt";
  /** Short label for the flow node. */
  label: string;
  /** One line under the flow node. */
  tagline: string;
  /** Section heading once the branch is open. */
  title: string;
  lead: string;
  /** "Benefits" on equity, "Why one should invest" on debt. */
  benefitsTitle: string;
  benefits: { title: string; body?: string }[];
  featuresTitle: string;
  features: { title: string; body?: string }[];
  /** Equity only. */
  categories?: { name: string; body: string }[];
  /** Equity only: a tenure × category-column matrix. */
  taxation?: {
    title: string;
    columns: string[];
    rows: { tenure: string; full: string; cells: string[] }[];
    note: string;
  };
  /** Debt only: the "Features of Debt AIF" ring. */
  ring?: { hub: string; items: string[] };
  parameters: AifParameter[];
  fundsTitle: string;
  funds: AifFund[];
};

export const AIF_INTRO =
  "Alternate Investment Funds are funds established in India as a privately pooled investment vehicle in order to collect funds from sophisticated investors. AIFs invest in listed and unlisted asset classes but are more focused on investing in instruments other than conventional equity and debt.";

export const AIF_EQUITY: AifBranch = {
  key: "equity",
  label: "Equity AIF",
  tagline: "Listed, pre-IPO and private equity strategies",
  title: "Equity Alternative Investment Funds",
  lead: AIF_INTRO,
  benefitsTitle: "Benefits",
  benefits: [
    { title: "High return potential" },
    { title: "Diversification" },
    {
      title:
        "Participation in alternate asset classes that cannot be accessed by mutual funds"
    }
  ],
  featuresTitle: "Key features",
  features: [
    { title: "Pooling of funds", body: "Capital is pooled for investing in an AIF." },
    { title: "Minimum investment", body: "₹1 Crore." },
    {
      title: "Taxation",
      body: "Pass-through taxation applies to Category II AIFs; Category III AIFs are taxed at the fund's end."
    },
    {
      title: "Lock-in period",
      body: "AIF Category I & II are close-ended with a tenure of 3–5 years. Category III can be either open-ended or close-ended."
    }
  ],
  categories: [
    {
      name: "Category I AIF",
      body: "AIFs that invest in startups, infrastructure, SMEs, social enterprises, etc."
    },
    {
      name: "Category II AIF",
      body: "Funds that do not use leverage or borrow for any reason other than to cover operational needs, and typically invest in private companies."
    },
    {
      name: "Category III AIF",
      body: "Funds that invest in specifically designed public equity portfolios, including listed or unlisted derivatives. These can be both open-ended and close-ended."
    }
  ],
  taxation: {
    title: "Taxation",
    columns: [
      "AIF Cat I & II (Equity / Debt) — 24M",
      "AIF Cat III (Equity) — 12M"
    ],
    rows: [
      {
        tenure: "LTCG",
        full: "Long-term capital gains",
        cells: ["12.5% / Investor Slab", "12.50%"]
      },
      {
        tenure: "STCG",
        full: "Short-term capital gains",
        cells: ["Investor Slab / Investor Slab", "20%"]
      }
    ],
    note: "Indicative rates. The holding period shown in each column defines long term for that category. Cess and surcharge apply as per your income slab — please confirm the final position with your tax advisor."
  },
  parameters: [
    {
      name: "Fund Manager Expertise & Proven Track Record",
      rationale:
        "Evaluate the fund manager's experience, particularly in managing equity portfolios, and their historical performance across various market cycles."
    },
    {
      name: "Fund House Track Record",
      rationale:
        "Assess the fund house's overall reputation, history in managing AUM, and its ability to execute strategy and manage risk effectively."
    },
    {
      name: "Historical Performance (for CAT II & CAT III AIFs)",
      rationale:
        "Examine the fund's past performance relative to benchmarks and peers, focusing on risk-adjusted returns and consistency across varying market conditions."
    },
    {
      name: "Unique Investment Strategy",
      rationale:
        "Understand the fund's investment philosophy (e.g. growth vs. value investing) and approach to stock selection, portfolio construction, and risk management."
    },
    {
      name: "Risk Management Framework",
      rationale:
        "Review the fund house's approach to managing market, sectoral, and individual stock risks, including hedging strategies, diversification, and volatility control."
    }
  ],
  fundsTitle: "AIF — Equity",
  funds: [
    {
      name: "Carnelian Private Growth & Innovation Fund",
      description:
        "PGIF is a private equity strategy investing in high-growth businesses at key inflection points across Growth, Late Stage/Pre-IPO, and PIPE opportunities, aiming to maximise IRR, preserve capital, and enhance liquidity. It applies Carnelian's MAGIC framework, supported by CLEAR Forensic and Quality & Growth disciplines, to identify companies with accelerating earnings, strong fundamentals, and high-quality management.",
      tenure: "6 years 9 months",
      exitLoad: "Close ended"
    },
    {
      name: "InCred Growth Partners Fund II",
      description:
        "IGPF-II targets growth and late-stage, best-in-class privately owned companies — referred to as “SUPER 8 companies” — that demonstrate strong potential for value creation and successful exit. These companies are characterized by their scale, with revenues above ₹500 crore; a unique and defensible competitive edge; positive EBITDA indicating profitability; clear exit visibility through a potential IPO within 2 to 4 years; and attractive relative positioning, either through lower valuations compared to listed peers or higher growth trajectories.",
      tenure: "6 years from initial close",
      exitLoad: "Close ended"
    },
    {
      name: "360 One Early-Stage Fund Series I",
      description:
        "The fund targets early-stage companies from Seed to Series A across Fintech, Consumer Tech, Deep Tech, and Defence sectors in India. It aims to build a portfolio of companies that have demonstrated product-market fit, deploying an average ticket size of INR 15–20 crore per investment and targeting a meaningful 10–20% ownership stake in each. The investment team combines experience with the broader ecosystem, bringing founder networks, institutional relationships, and platform support to every portfolio company.",
      tenure: "10 years from initial close",
      exitLoad: "Close ended"
    },
    {
      name: "Emkay Emerging Stars Fund VII",
      description:
        "The fund blends the proven Golden Decade Portfolio strategy with pre-IPO investment opportunities, allocating 70% to listed equities and 30% to high-quality unlisted pre-IPO companies. The listed portfolio is based on the E-QUAL framework and five structural growth themes, while the unlisted allocation targets emerging leaders, offering exposure to both established compounders and future market leaders.",
      tenure: "Open ended",
      exitLoad:
        "2% for redemption within 24 months from date of allotment against final drawdown; nil after."
    },
    {
      name: "Alchemy Long Term Ventures Fund 3",
      description:
        "The fund invests across listed (small to micro) and unlisted companies with a long-term, growth-oriented approach. It focuses on emerging structural growth themes such as Data Centres & AI, Defence, Semiconductors, Green Energy and Biotech, targeting high-growth opportunities positioned to drive India's next phase of economic expansion.",
      tenure: "4 years (+1) from first close",
      exitLoad: "Close ended"
    },
    {
      name: "Vedartha India Opportunities Fund",
      description:
        "This fund follows a contra investing strategy focused mainly on mid- and small-cap stocks. It aims to generate alpha by identifying fundamentally strong but currently undervalued, mispriced or out-of-favour companies caused by market cycles, investor sentiment, or behavioural biases. The portfolio will be concentrated in 25–30 stocks across 4–7 high-conviction value opportunities, with the goal of benefiting from future valuation re-rating as market perceptions improve.",
      tenure: "5 years (+1+1)",
      exitLoad: "Post lock-in — 2% (year 1), 1% (years 2 & 3), nil thereafter."
    },
    {
      name: "Carnelian Bharat Amritkaal Fund",
      description:
        "The fund is designed to leverage opportunities arising from 7 mega trends emerging across 5 sectors. The team believes in investing in “quality growth at a reasonable price” and in “risk diversification through forensic analysis”. A 25–30 stock portfolio (Quality Growth at Reasonable Price), benchmarked against the S&P BSE 500 Index.",
      tenure: "Open ended",
      exitLoad: "2% if within 12 months"
    },
    {
      name: "Buoyant Capital — Opportunities Strategy",
      description:
        "It aims to take concentrated bets for the long term, following an altering balance in the aggressiveness-to-defensiveness continuum, which is attained through diversification of cash flow streams, the choice between predictable vs. growing cash flow streams, and cash calls.",
      tenure: "Open ended",
      exitLoad: "Nil"
    },
    {
      name: "Motilal Oswal Founders Fund Series VII",
      description:
        "A growth-driven investment fund designed to leverage India's entrepreneurial spirit by backing founder-led companies with significant growth potential. It follows a structured investment approach, prioritizing high-quality, high-growth businesses that align with India's economic trajectory. The fund focuses on companies with strong leadership, market leadership, and favourable sectoral trends, fostering long-term value creation.",
      tenure: "9 years from first close, +2 years extension provision",
      exitLoad: "For all classes — 1% until 24 months, nil thereafter"
    }
  ]
};

export const AIF_DEBT: AifBranch = {
  key: "debt",
  label: "Debt AIF",
  tagline: "Secured credit and infrastructure income",
  title: "Debt Alternate Investment Funds",
  lead:
    "Debt AIFs are usually structured as Category II AIFs. They are closed-ended instruments which invest primarily in debt or debt securities of listed or unlisted investee companies, according to the stated objectives of the fund.",
  benefitsTitle: "Why one should invest in a Debt AIF",
  benefits: [
    {
      title: "Diversification",
      body: "An AIF is a good option for portfolio diversification."
    },
    {
      title: "Volatility",
      body: "Most alternative investments are comparatively less volatile than stocks, which makes them a good choice for those looking for portfolio stability."
    },
    {
      title: "Better returns",
      body: "They offer significantly better returns in comparison to other traditional debt investments."
    },
    {
      title: "Passive income",
      body: "AIFs can be a good source of passive income for investors."
    }
  ],
  featuresTitle: "Features of a Debt AIF",
  features: [
    {
      title: "Lower-rated, higher-yielding credit",
      body: "Primarily invests in companies that have a lower credit rating and therefore higher yields."
    },
    {
      title: "Category II mandate",
      body: "Funds in Category II can invest only in units of other AIFs or in unlisted companies."
    },
    {
      title: "Corpus and ticket size",
      body: "A minimum ₹20 crore corpus is required to operate an AIF; the minimum investment cut-off is INR 1 crore."
    }
  ],
  ring: {
    hub: "Features of Debt AIF",
    items: [
      "Amount invested greater than ₹1 crore",
      "Locked in for a specific period",
      "Higher risk",
      "Credit rating usually AA and below",
      "Can invest in both listed and unlisted",
      "Not subject to restrictions such as sectoral exposure caps or sticking to one class of investments"
    ]
  },
  parameters: [
    {
      name: "Fund Manager Expertise & Proven Track Record",
      rationale:
        "Assess the manager's experience in managing fixed-income and debt portfolios, along with a strong track record in credit analysis and interest rate management."
    },
    {
      name: "Credit Rating of Debt Instruments",
      rationale:
        "Review the credit ratings of the underlying debt instruments to ensure the fund maintains a balance of risk and return, with a focus on investment-grade securities."
    },
    {
      name: "Underlying Investments & Cash Flow Stability",
      rationale:
        "Evaluate the quality and diversification of the debt assets, along with their cash flow predictability and liquidity, particularly in adverse market conditions."
    },
    {
      name: "Fund House Track Record",
      rationale:
        "The fund house's experience in managing debt-focused funds, including its success in risk management, returns generation, and adherence to regulatory standards."
    },
    {
      name: "Unique Investment Strategy",
      rationale:
        "Analyze the fund house's approach to managing interest rate risk, credit risk, and liquidity, along with any proprietary strategies for selecting bonds or structured products."
    },
    {
      name: "Liquidity Management",
      rationale:
        "Review the fund's liquidity strategy, ensuring adequate flexibility for redemptions and risk mitigation in case of market volatility or credit downgrades."
    }
  ],
  fundsTitle: "AIF — Debt",
  funds: [
    {
      name: "Mosaic Multiyield Fund Series II",
      description:
        "The fund invests in fully secured debt of 25–30 profitable companies in sectors like NBFCs, mid-income housing, rural finance, MSME lending, and vehicle finance, with strict selection, strong collateral, and the exclusion of high-risk assets for quality and risk control.",
      tenure: "~5 years"
    },
    {
      name: "Neo Infra Income Opportunities Fund II",
      description:
        "The fund follows a proven infrastructure strategy, allocating ~80% to operating solar and road assets with creditworthy counterparties, targeting ~20–21% annual returns. The remaining ~20% is invested in InvITs and opportunistic infrastructure segments, aiming for ~18–19% returns through pricing and access advantages.",
      tenure: "7 years"
    }
  ]
};

export const AIF_BRANCHES: AifBranch[] = [AIF_EQUITY, AIF_DEBT];

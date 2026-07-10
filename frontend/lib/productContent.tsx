export type ProductContent = {
  slug: string;
  label: string;
  title: React.ReactNode;
  subtitle: string;
  highlights: { title: string; body: string }[];
  howItWorks: { step: string; title: string; body: string }[];
  metrics: { value: string; label: string }[];
  closing: string;
  cta: { label: string; href: string };
  related?: string[];
};

export const PRODUCTS: Record<string, ProductContent> = {
  "mutual-funds": {
    slug: "mutual-funds",
    label: "Mutual Funds",
    title: <>Build wealth, one SIP at a <em>time.</em></>,
    subtitle:
      "Invest across 40+ AMCs and 1,500+ schemes — equity, debt, hybrid, ELSS — all on a single platform with goal-based planning and SEBI-registered advisor support.",
    highlights: [
      { title: "Direct plans only", body: "Zero commission. We charge a flat advisory fee, never a cut from the AMC. You keep the full alpha." },
      { title: "SIP & lump sum", body: "Start a SIP from ₹500 a month or invest a lump sum from ₹500. Set up auto-debits in seconds via UPI or NACH." },
      { title: "Goal-based portfolios", body: "Tell us your goal — retirement, a home, your child's education — and our advisors map the right scheme mix and review it quarterly." },
      { title: "ELSS for tax saving", body: "Section 80C deductions up to ₹1.5L, with the shortest 3-year lock-in among tax-saving instruments." },
      { title: "Direct AMC integration", body: "Orders settle directly with the AMC — your folios are in your name from day one. We never hold custody." },
      { title: "Tax & exit reports", body: "Capital gains statements, XIRR, and exit-load calculators built-in — ready for filing or rebalancing." }
    ],
    howItWorks: [
      { step: "01", title: "Discover", body: "Browse curated lists by category, AMC, or 5-star rating. Filter by expense ratio, fund size, or risk-adjusted returns." },
      { step: "02", title: "Plan", body: "Use our SIP / lumpsum / goal calculators to see how your contributions compound over time at different return assumptions." },
      { step: "03", title: "Invest", body: "One-click investments, auto-debits set up via UPI/NACH, all paperless and Aadhaar-verified." },
      { step: "04", title: "Track", body: "Watch every fund in your unified dashboard with daily NAV, allocation drift alerts, and rebalancing suggestions." }
    ],
    metrics: [
      { value: "1,500+", label: "Schemes available" },
      { value: "40+",    label: "Asset management cos." },
      { value: "₹500", label: "Minimum SIP" },
      { value: "0%",     label: "Commission" }
    ],
    closing:
      "Whether you're starting your first SIP or rebalancing a ₹5 Cr portfolio, our advisors map your fund mix to your goals — not to ours.",
    cta: { label: "Start a SIP →", href: "/calculator" },
    related: ["pms", "aif", "bonds", "insurance"]
  },

  "pms": {
    slug: "pms",
    label: "Portfolio Management (PMS)",
    title: <>Portfolio management for <em>serious capital.</em></>,
    subtitle:
      "Discretionary PMS strategies hand-picked for HNI investors. Bespoke mandates, transparent reporting, no hidden trails.",
    highlights: [
      { title: "Curated PMS strategies", body: "We onboard fewer than 1 in 8 PMS strategies we evaluate. Multi-cap, focused, sectoral, contra — only the ones with auditable track records survive." },
      { title: "Statutory minimums", body: "PMS from ₹50L (SEBI mandated). We help you decide which structure fits your tax position and liquidity needs." },
      { title: "Quarterly reviews with the manager", body: "Direct calls with the fund manager — not a relationship sales rep. You hear the thesis from the source." },
      { title: "Consolidated tax reporting", body: "Capital gains, LTCG/STCG — all consolidated across PMS investments." },
      { title: "Estate-aware structuring", body: "Trust, HUF, family-office structures — we coordinate with your CA and lawyer to keep the wrapper tax-efficient." }
    ],
    howItWorks: [
      { step: "01", title: "Risk profiling", body: "A 30-minute call with our advisor to understand your liquidity, time horizon, and existing portfolio gaps." },
      { step: "02", title: "Strategy shortlist", body: "We present 3–5 PMS strategies with full track-record disclosure and direct access to the fund team." },
      { step: "03", title: "Onboarding & funding", body: "Documentation, demat-linked execution, and regulatory disclosures handled end-to-end by our compliance team." },
      { step: "04", title: "Quarterly oversight", body: "Performance reviews, attribution analysis, and rebalancing — we sit with you, not the manufacturer." }
    ],
    metrics: [
      { value: "₹50L",   label: "PMS minimum" },
      { value: "20+",    label: "Curated strategies" },
      { value: "1 in 8", label: "Onboarding ratio" }
    ],
    closing:
      "PMS is not a retail product. The right strategy at the wrong moment can lock up capital for years. We help you avoid that.",
    cta: { label: "Talk to a private-client advisor →", href: "/get-started" },
    related: ["aif", "mutual-funds"]
  },

  "aif": {
    slug: "aif",
    label: "Alternative Investments (AIF)",
    title: <>Access sophisticated <em>private market funds.</em></>,
    subtitle:
      "SEBI-regulated Alternative Investment Funds for UHNI investors. Private equity, venture capital, and hedge funds with direct access.",
    highlights: [
      { title: "Category I, II & III AIFs", body: "Venture capital, real estate, private credit, long-short equity, structured credit. Direct access to fund managers, no aggregator markups." },
      { title: "Statutory minimums", body: "AIFs from ₹1Cr. We help you evaluate the illiquidity premium and risk profile." },
      { title: "Quarterly reviews with the manager", body: "Direct calls with the fund manager — hear the thesis straight from the source." },
      { title: "Consolidated tax reporting", body: "Capital gains and K-1 equivalents — all consolidated across AIF investments." },
      { title: "Estate-aware structuring", body: "Trust, HUF, family-office structures — coordinated with your CA and lawyer." }
    ],
    howItWorks: [
      { step: "01", title: "Risk profiling", body: "A 30-minute call with our advisor to understand your liquidity, time horizon, and existing portfolio gaps." },
      { step: "02", title: "Strategy shortlist", body: "We present 3–5 AIF strategies with full track-record disclosure and direct access to the fund team." },
      { step: "03", title: "Onboarding & funding", body: "Documentation, execution, and regulatory disclosures handled end-to-end by our compliance team." },
      { step: "04", title: "Quarterly oversight", body: "Performance reviews, attribution analysis, and rebalancing — we sit with you, not the manufacturer." }
    ],
    metrics: [
      { value: "₹1 Cr",  label: "AIF minimum" },
      { value: "15+",    label: "Curated strategies" },
      { value: "1 in 8", label: "Onboarding ratio" }
    ],
    closing:
      "AIFs provide non-correlated returns but come with illiquidity and complexity. We guide you to the right structures.",
    cta: { label: "Talk to a private-client advisor →", href: "/get-started" },
    related: ["pms", "mutual-funds"]
  },

  "bonds": {
    slug: "bonds",
    label: "Bonds & G-Sec",
    title: <>Predictable income from <em>regulated debt.</em></>,
    subtitle:
      "Government securities, AAA corporate bonds, tax-free bonds, sovereign gold bonds, and 54EC capital-gains bonds — all on transparent yield-to-maturity terms.",
    highlights: [
      { title: "Government securities", body: "T-Bills, dated G-Secs, State Development Loans — sovereign-rated, RBI-issued debt with daily liquidity." },
      { title: "AAA & PSU bonds", body: "Hand-picked corporate and PSU issues with credit ratings of AA+ or above. Yield-to-maturity transparent before you buy." },
      { title: "Tax-free bonds", body: "NHAI, REC, IRFC, PFC — interest exempt under Sec 10(15)(iv)(h). Especially attractive in higher tax brackets." },
      { title: "Sovereign Gold Bonds", body: "Earn 2.5% p.a. fixed interest plus the gold price upside — no storage cost, no GST, sovereign-backed." },
      { title: "54EC capital-gains bonds", body: "REC and PFC bonds for ₹50L+ tax exemption on long-term capital gains. 5-year lock-in." },
      { title: "Yield calculators", body: "Live YTM, accrued interest, and post-tax yield comparison so you compare like-for-like across issuers." }
    ],
    howItWorks: [
      { step: "01", title: "Browse the live-yield desk", body: "Filter by maturity, rating, and post-tax yield. Compare a G-Sec to a tax-free bond to a corporate FD side by side." },
      { step: "02", title: "Lock in the rate", body: "Place a buy order and lock the YTM. Settlement happens via RBI's NDS-OM or BSE/NSE bond platform — fully regulated." },
      { step: "03", title: "Earn coupon income", body: "Coupons credit directly to your bank, semi-annually or annually depending on the issue." },
      { step: "04", title: "Hold or trade", body: "Hold to maturity for full principal, or sell on the exchange before maturity — your call." }
    ],
    metrics: [
      { value: "7.0–8.5%", label: "Typical YTM range" },
      { value: "AAA",      label: "Average credit rating" },
      { value: "₹10,000",  label: "Minimum ticket" },
      { value: "Daily",    label: "Settlement cycle" }
    ],
    closing:
      "Most Indian portfolios are dangerously equity-heavy. Bonds add the ballast that lets you ride out drawdowns without selling your winners.",
    cta: { label: "See live yields →", href: "/markets" },
    related: ["mutual-funds", "fixed-deposits", "insurance"]
  },

  "insurance": {
    slug: "insurance",
    label: "Insurance",
    title: <>Insurance, the way it <em>should be sold.</em></>,
    subtitle:
      "Pure protection products — term life and health — from IRDAI-regulated insurers, recommended on coverage and claim-settlement ratio, never on agent commission.",
    highlights: [
      { title: "Pure term life", body: "₹1Cr cover for as little as ₹600/month for a healthy 30-year-old. We compare 14+ insurers on premium, claim ratio, and rider quality." },
      { title: "Family floater health", body: "₹10L–₹50L cover with no co-pay, no room-rent caps, and 7,500+ network hospitals. Pre-existing waiver options included." },
      { title: "Top-up & super top-up", body: "Stack a ₹5L base policy with a ₹95L super top-up for ~30% the cost of a single ₹1Cr policy." },
      { title: "Critical illness rider", body: "Lump-sum payout on diagnosis of 30+ critical conditions — independent of hospitalisation." },
      { title: "Claim-ratio first", body: "We rank every insurer by IRDAI's claim-settlement ratio, not by commission. You see the data, you choose." },
      { title: "ULIP-free zone", body: "We do not sell unit-linked or endowment plans. They mix insurance and investing badly. Buy term, invest the difference." }
    ],
    howItWorks: [
      { step: "01", title: "Get your number", body: "Coverage = 15–20× annual income for term, ₹10L+ per family member for health. We help you size it right." },
      { step: "02", title: "Compare", body: "Side-by-side premium, claim ratio, network, and rider quality across 14+ insurers — no sponsored placements." },
      { step: "03", title: "Apply paperless", body: "Aadhaar-based KYC, video medicals where required. Most policies issue in under 72 hours." },
      { step: "04", title: "Claim support", body: "If you ever need to claim, our team escalates to the insurer on your behalf. Documented record of every interaction." }
    ],
    metrics: [
      { value: "14+",   label: "IRDAI insurers" },
      { value: "98.5%", label: "Best claim-ratio insurer" },
      { value: "7,500+", label: "Network hospitals" },
      { value: "0",     label: "ULIPs sold" }
    ],
    closing:
      "Insurance protects your investments. We unbundle it from investing, sell pure protection at the right price, and refuse the kickbacks.",
    cta: { label: "Get a quote →", href: "/get-started" },
    related: ["mutual-funds", "bonds", "fixed-deposits"]
  },

  "fixed-deposits": {
    slug: "fixed-deposits",
    label: "Fixed Deposits",
    title: <>Secure, high-yield FDs for <em>stable returns.</em></>,
    subtitle:
      "Access a curated selection of corporate and bank fixed deposits. Lock in attractive interest rates with capital protection and predictable cash flows.",
    highlights: [
      { title: "Top-rated issuers", body: "We only list FDs from highly rated banks and NBFCs, ensuring your capital is protected by strong balance sheets." },
      { title: "Higher yields", body: "Corporate FDs typically offer 1-2% higher interest rates than traditional bank FDs, providing a solid boost to your fixed income." },
      { title: "Flexible tenures", body: "Choose lock-in periods ranging from 12 to 60 months, allowing you to ladder maturities and manage liquidity effectively." },
      { title: "Predictable income", body: "Opt for monthly, quarterly, or annual interest payouts to match your cash flow needs, or cumulative options for compounding." },
      { title: "Senior citizen benefits", body: "Additional interest rate bumps of 0.25% to 0.50% for senior citizens, maximizing returns for retirees." },
      { title: "Digital onboarding", body: "Zero paperwork. Complete your KYC and open an FD completely online in under 5 minutes." }
    ],
    howItWorks: [
      { step: "01", title: "Compare rates", body: "View our live board of FD rates across various tenures and issuers to find the best match for your needs." },
      { step: "02", title: "Choose payout", body: "Decide whether you want regular interest payouts or prefer to compound your interest until maturity." },
      { step: "03", title: "Invest digitally", body: "Complete an Aadhaar-based KYC process and transfer funds directly from your bank account." },
      { step: "04", title: "Track maturity", body: "Monitor accrued interest and upcoming maturity dates through your unified portfolio dashboard." }
    ],
    metrics: [
      { value: "7.5–9.0%", label: "Typical interest range" },
      { value: "AAA/AA+",  label: "Credit ratings" },
      { value: "₹10,000",  label: "Minimum investment" },
      { value: "0",        label: "Hidden fees" }
    ],
    closing:
      "Fixed deposits remain the bedrock of a conservative portfolio. By accessing corporate FDs, you can significantly enhance your yield without taking on equity market risk.",
    cta: { label: "View live FD rates →", href: "/markets" },
    related: ["bonds", "mutual-funds", "insurance"]
  },

  "equities": {
    slug: "equities",
    label: "Listed Equities",
    title: <>Direct shares, with <em>research that holds up.</em></>,
    subtitle:
      "Trade and invest in NSE/BSE-listed equities with live price feeds, watchlists, sparklines, and curated research — backed by execution at exchange best-bid.",
    highlights: [
      { title: "Live market data", body: "Real-time bid/ask, depth, and intraday sparklines on every stock card. No 15-minute delay." },
      { title: "Curated coverage", body: "We track ~250 stocks across NIFTY, NEXT 50, midcap, and high-quality smallcap. Quarterly updates after every result." },
      { title: "Smart watchlist", body: "Persistent watchlist that follows you across devices, with custom alerts on price, P/E, or earnings dates." },
      { title: "Direct execution", body: "Orders route to NSE/BSE via SEBI-registered partner brokers — no aggregator latency, no markup." },
      { title: "Tax-loss harvesting hints", body: "Year-end suggestions to offset gains by realising losses on positions we'd planned to exit anyway." },
      { title: "Quality scoring", body: "Each stock is scored on profitability, balance sheet, and capital-allocation discipline — not just price momentum." }
    ],
    howItWorks: [
      { step: "01", title: "Discover", body: "Filter by sector, market cap, momentum, or our internal quality score. Add to watchlist with one click." },
      { step: "02", title: "Research", body: "Read our quarterly notes, view 5-year financial trends, and check insider/promoter activity." },
      { step: "03", title: "Execute", body: "Place a market or limit order — settles via partner broker into your demat account directly." },
      { step: "04", title: "Track", body: "Position-level P&L, dividend history, and rebalancing prompts when allocations drift." }
    ],
    metrics: [
      { value: "250+", label: "Stocks under coverage" },
      { value: "Live", label: "Price feeds" },
      { value: "T+1",  label: "Settlement" },
      { value: "0",    label: "Hidden charges" }
    ],
    closing:
      "Direct equity is the highest-return asset class over long periods, and the easiest one to ruin with bad behaviour. Our role is to keep you on the right side of the data.",
    cta: { label: "Browse the markets →", href: "/markets" },
    related: ["mutual-funds", "bonds"]
  },

  "loan-against-mutual-funds": {
    slug: "loan-against-mutual-funds",
    label: "Loan Against Mutual Funds",
    title: <>Unlock liquidity <em>without selling.</em></>,
    subtitle:
      "Pledge your mutual fund units and get an instant overdraft at interest rates far below a personal loan — while your investments stay invested and keep compounding.",
    highlights: [
      { title: "Stay invested", body: "Your units are only pledged, never sold. You keep the upside, dividends, and long-term compounding while borrowing against them." },
      { title: "Rates from ~9% p.a.", body: "Interest is charged only on the amount you use, not the full sanctioned limit — dramatically cheaper than personal loans or credit cards." },
      { title: "Instant digital pledge", body: "Pledge equity or debt funds online via CAMS/KFintech in minutes. No paperwork, no branch visit, no income proof for most limits." },
      { title: "Overdraft, not EMI", body: "Draw and repay any amount, any time. Interest accrues only on the outstanding balance — ideal for short-term cash-flow gaps." },
      { title: "Loan-to-value up to 50–80%", body: "Borrow up to 80% against debt funds and up to 50% against equity funds, subject to lender norms and scheme eligibility." },
      { title: "No prepayment penalty", body: "Repay whenever you like without charges. Unpledge your units the moment the outstanding is cleared." }
    ],
    howItWorks: [
      { step: "01", title: "Check eligibility", body: "Share your mutual fund holdings. We compute your sanctioned limit across eligible equity and debt schemes instantly." },
      { step: "02", title: "Pledge online", body: "Authorise the lien digitally through CAMS/KFintech with an OTP. Your units are marked as pledged — you still own them." },
      { step: "03", title: "Draw funds", body: "The overdraft limit is activated in your account. Withdraw part or all of it whenever you need liquidity." },
      { step: "04", title: "Repay flexibly", body: "Pay interest only on what you use. Clear the balance any time and release the pledge on your units." }
    ],
    metrics: [
      { value: "~9%",   label: "Interest from (p.a.)" },
      { value: "80%",   label: "Max loan-to-value" },
      { value: "₹1 Cr+", label: "Sanction limits" },
      { value: "24 hrs", label: "Typical disbursal" }
    ],
    closing:
      "Selling good funds to raise cash is a decision you often regret at the next market high. A loan against mutual funds keeps you invested and liquid at the same time.",
    cta: { label: "Check my LAMF limit →", href: "/get-started" },
    related: ["mutual-funds", "pms", "bonds"]
  },

  "gift-city": {
    slug: "gift-city",
    label: "Gift City (IFSC)",
    title: <>Invest offshore, <em>from onshore India.</em></>,
    subtitle:
      "Access global markets, USD-denominated funds, and IFSC-regulated structures through GIFT City — India's International Financial Services Centre — with resident and NRI-friendly routing.",
    highlights: [
      { title: "USD-denominated investing", body: "Invest in global equities, US-listed ETFs, and offshore funds in dollars through IFSC units at GIFT City — a clean, regulated route out of INR." },
      { title: "IFSCA-regulated", body: "Every structure sits under the International Financial Services Centres Authority — a dedicated unified regulator, not a grey-market workaround." },
      { title: "Tax-efficient wrappers", body: "GIFT City funds and structures enjoy specific exemptions and concessional rates designed to make offshore access competitive with Singapore or Dubai." },
      { title: "LRS & NRI routing", body: "Residents can route via the Liberalised Remittance Scheme; NRIs and foreign investors get a familiar, English-law-adjacent framework." },
      { title: "Global diversification", body: "Hold assets outside the rupee and the Indian cycle — US tech, global bonds, and multi-currency portfolios in one IFSC account." },
      { title: "Institutional custody", body: "Assets are held with IFSC-registered custodians and administrators, with reporting built for HNI and family-office needs." }
    ],
    howItWorks: [
      { step: "01", title: "Eligibility & structure", body: "We assess whether an LRS remittance, an NRI route, or a fund structure fits your residency and objective." },
      { step: "02", title: "Open an IFSC account", body: "KYC and onboarding with an IFSC-registered intermediary at GIFT City — handled end-to-end by our desk." },
      { step: "03", title: "Fund & allocate", body: "Remit in USD and allocate across global funds, ETFs, or bespoke offshore mandates." },
      { step: "04", title: "Consolidated reporting", body: "Track your onshore and GIFT City holdings together, with tax-ready statements across jurisdictions." }
    ],
    metrics: [
      { value: "USD",     label: "Base currency" },
      { value: "IFSCA",   label: "Regulator" },
      { value: "Global",  label: "Market access" },
      { value: "NRI +",   label: "Resident routing" }
    ],
    closing:
      "GIFT City turns offshore investing from a compliance headache into a regulated, tax-aware decision — the same global access, without leaving the Indian framework.",
    cta: { label: "Explore Gift City options →", href: "/get-started" },
    related: ["pms", "aif", "mutual-funds", "bonds"]
  }
};

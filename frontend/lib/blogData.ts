export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_url: string | null;
  author: string;
  category?: string;
  published: boolean;
  position: number;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  meta_keywords?: string | null;
  tags?: string[];
  canonical_url?: string | null;
  og_image?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const DEFAULT_BLOGS: Blog[] = [
  {
    id: "b1-advisory-led-investing-beats-diy-2026",
    title: "Why Advisory-Led Investing Beats Pure DIY in 2026",
    slug: "advisory-led-investing-beats-diy-2026",
    excerpt:
      "Navigating volatile markets requires discipline and expert curation. Here's why personalized advisory creates durable wealth over pure DIY trading.",
    body: `<h2>The Limitations of Pure DIY Investing</h2>
<p>Over the last decade, discount brokerages democratized access to the stock markets. Anyone with a smartphone can now place an order within seconds. However, access to trade is not equivalent to investment expertise. Data published by SEBI repeatedly highlights that over 90% of individual active traders consistently lose capital.</p>
<p>The primary barrier to wealth creation is not lack of information, but the inability to filter market noise, manage behavioral biases, and execute a disciplined asset allocation framework.</p>

<h2>What Advisory-Led Wealth Management Delivers</h2>
<p>Advisory-led investing combines modern data analytics with human wisdom. Rather than chasing short-term market tips or panic-selling during routine drawdowns, an advisory partner provides:</p>
<ul>
  <li><strong>Goal-Aligned Portfolio Construction:</strong> Tailoring your asset mix to your time horizon, liquidity requirements, and risk appetite.</li>
  <li><strong>Curated Multi-Asset Access:</strong> Vetted opportunities across Equities, Mutual Funds, PMS, AIFs, Bonds, and Pre-IPO shares.</li>
  <li><strong>Emotional Circuit Breakers:</strong> Preventing impulse decisions during peak bull exuberance or deep market corrections.</li>
  <li><strong>Continuous Rebalancing:</strong> Locking in gains from outperforming sectors and accumulating undervalued assets systematically.</li>
</ul>

<blockquote>"Investing is not about beating the market in any single month; it is about building a compounding engine that endures market cycles."</blockquote>

<h2>The Finvoq Approach</h2>
<p>At Finvoq, we believe technology should empower, not replace, strategic financial guidance. Our platform unites 10+ asset classes in a single unified dashboard, backed by SEBI-registered expertise to help you build resilient, generational wealth.</p>`,
    image_url: "/images/blogs/blog-1.jpg",
    author: "Finvoq Admin",
    category: "Wealth Advisory",
    published: true,
    position: 1,
    meta_title: "Why Advisory-Led Investing Beats Pure DIY in 2026 | Finvoq",
    meta_description:
      "Discover why personalized wealth advisory outperforms pure DIY trading in 2026. Explore behavioral discipline, multi-asset allocation, and portfolio risk management.",
    focus_keyword: "advisory led investing",
    meta_keywords:
      "wealth management, advisory investing, sebi registered advisor, diy investing risks, asset allocation",
    tags: ["Advisory", "Investing", "SEBI", "Wealth Creation", "Market Strategy"],
    canonical_url: "https://finvoq.com/blog/advisory-led-investing-beats-diy-2026",
    og_image: "/images/blogs/blog-1.jpg",
    created_at: "2026-08-26T23:53:27.156Z"
  },
  {
    id: "b2-pre-ipo-unlisted-equities-alpha",
    title: "Pre-IPO & Unlisted Equities: The New Frontier of Alpha",
    slug: "pre-ipo-unlisted-equities-alpha",
    excerpt:
      "Discover how early access to India's high-growth private champions before their IPO can deliver outsized portfolio returns.",
    body: `<h2>Why the Biggest Value Creation Happens Before the IPO</h2>
<p>Companies are staying private much longer than they did twenty years ago. Industry leaders in fintech, quick commerce, green energy, and defense technology often achieve multi-billion dollar valuations and mature business models long before filing their Red Herring Prospectus (DRHP).</p>
<p>By the time a marquee company goes public on the NSE or BSE, the lion's share of early-stage growth and valuation multiple expansion has already been captured by institutional investors.</p>

<h2>Understanding the Risk-Reward Equation</h2>
<p>Investing in unlisted equities offers immense potential, but demands rigorous due diligence:</p>
<ul>
  <li><strong>Valuation Discipline:</strong> Comparing private transaction multiples against publicly listed peers.</li>
  <li><strong>Liquidity & Holding Periods:</strong> Pre-IPO shares generally require a 2 to 4 year investment horizon.</li>
  <li><strong>Regulatory Safeguards:</strong> Under SEBI guidelines, shares held prior to an IPO are subject to a mandatory lock-in period (typically 6 months) post-listing.</li>
</ul>

<h2>How Finvoq Democratizes Pre-IPO Investing</h2>
<p>Historically reserved for ultra-HNIs and venture funds, Finvoq opens direct access to verified unlisted shares with institutional-grade research, transparent pricing, and seamless demat delivery into your existing CDSL/NSDL account.</p>`,
    image_url: "/images/blogs/blog-2.jpg",
    author: "Finvoq Admin",
    category: "Private Equity & Pre-IPO",
    published: true,
    position: 2,
    meta_title: "Pre-IPO & Unlisted Equities: The New Frontier of Alpha | Finvoq",
    meta_description:
      "Learn how investing in India's top pre-IPO and unlisted shares before their public listing unlocks exponential portfolio alpha and early-stage compounding.",
    focus_keyword: "unlisted equities alpha",
    meta_keywords:
      "pre ipo shares, unlisted shares india, private equity investing, drhp filing, cdsl demat delivery",
    tags: ["Pre-IPO", "Unlisted Shares", "Alpha", "Private Markets", "Venture Growth"],
    canonical_url: "https://finvoq.com/blog/pre-ipo-unlisted-equities-alpha",
    og_image: "/images/blogs/blog-2.jpg",
    created_at: "2026-08-26T23:53:27.156Z"
  },
  {
    id: "b3-art-of-multi-asset-allocation",
    title: "The Art of Multi-Asset Allocation: Stocks, Bonds & Alternatives",
    slug: "art-of-multi-asset-allocation",
    excerpt:
      "Why true diversification goes beyond large-cap equities. A comprehensive framework for balancing risk and reward across 10+ asset classes.",
    body: `<h2>Beyond the Traditional 60/40 Portfolio</h2>
<p>For decades, standard financial advice recommended a basic 60% equity and 40% bond split. However, macroeconomic shifts, sticky inflation cycles, and changing interest rate regimes mean traditional correlation models are no longer sufficient.</p>

<h2>The 4 Pillars of a Resilient Modern Portfolio</h2>
<ol>
  <li><strong>Growth Engines (Equities & Mutual Funds):</strong> Providing long-term capital appreciation that beats inflation.</li>
  <li><strong>Yield & Capital Preservation (Bonds & Corporate FDs):</strong> Generating steady, predictable cash flows and downside defense.</li>
  <li><strong>Alpha Generators (PMS & Unlisted Shares):</strong> High-conviction concentrated strategies designed to outpace benchmark indices.</li>
  <li><strong>Alternative Assets (AIFs & Gold):</strong> Providing non-correlated returns during macroeconomic dislocations.</li>
</ol>

<h2>Dynamic Rebalancing in Action</h2>
<p>When equities surge, taking partial profits to reallocate into high-yielding fixed income locks in gains. When markets pull back, fixed income yield provides liquidity to acquire equities at discounted valuations.</p>`,
    image_url: "/images/blogs/blog-3.jpg",
    author: "Finvoq Admin",
    category: "Portfolio Strategy",
    published: true,
    position: 3,
    meta_title: "The Art of Multi-Asset Allocation: Stocks, Bonds & Alternatives | Finvoq",
    meta_description:
      "Master the modern 4-pillar multi-asset allocation framework beyond the 60/40 rule. Balance equity growth, fixed income yield, and alternative hedges.",
    focus_keyword: "multi-asset allocation",
    meta_keywords:
      "multi asset allocation, portfolio diversification, risk adjusted returns, dynamic rebalancing",
    tags: ["Asset Allocation", "Diversification", "Stocks", "Bonds", "Alternative Assets"],
    canonical_url: "https://finvoq.com/blog/art-of-multi-asset-allocation",
    og_image: "/images/blogs/blog-3.jpg",
    created_at: "2026-08-26T23:53:27.156Z"
  },
  {
    id: "b4-mastering-market-volatility-playbook",
    title: "Mastering Market Volatility: A Systematic Compounding Playbook",
    slug: "mastering-market-volatility-playbook",
    excerpt:
      "How institutional investors use market corrections to strategically rebalance and accelerate compound interest over decades.",
    body: `<h2>Volatility is the Toll for Long-Term Wealth</h2>
<p>Market corrections of 10% to 15% occur almost every year in equity markets. Yet, history consistently demonstrates that every major drawdown has eventually been surpassed by new highs in the Indian growth story.</p>

<h2>3 Rules to Turn Volatility Into an Advantage</h2>
<ul>
  <li><strong>Automate the Core (SIPs & STPs):</strong> Dollar-cost averaging ensures you buy more units when prices fall without emotional hesitation.</li>
  <li><strong>Maintain Strategic Cash Buffers:</strong> Keep liquid capital ready to deploy during market-wide panics when high-quality businesses go on sale.</li>
  <li><strong>Focus on Earnings Growth Over Stock Tickers:</strong> In the short run, the market is a voting machine; in the long run, it is a weighing machine.</li>
</ul>`,
    image_url: "/images/blogs/blog-4.jpg",
    author: "Finvoq Admin",
    category: "Market Insights",
    published: true,
    position: 4,
    meta_title: "Mastering Market Volatility: A Systematic Compounding Playbook | Finvoq",
    meta_description:
      "Turn market corrections into long-term compounding opportunities. Practical rules for institutional rebalancing, rupee-cost averaging, and equity cash buffers.",
    focus_keyword: "market volatility playbook",
    meta_keywords:
      "stock market volatility, market corrections, dollar cost averaging, long term compounding",
    tags: ["Market Volatility", "Compounding", "SIP", "Risk Management", "Disciplined Investing"],
    canonical_url: "https://finvoq.com/blog/mastering-market-volatility-playbook",
    og_image: "/images/blogs/blog-4.jpg",
    created_at: "2026-08-26T23:53:27.156Z"
  },
  {
    id: "b5-fixed-income-high-yield-bonds-fds",
    title: "Fixed Income Reimagined: High-Yield Corporate Bonds & FDs",
    slug: "fixed-income-high-yield-bonds-fds",
    excerpt:
      "Secure steady, predictable cash flows with senior secured bonds and AAA-rated fixed income securities in a shifting interest rate cycle.",
    body: `<h2>Why Fixed Income Deserves a Strategic Place</h2>
<p>With bank savings rates hovering at modest levels, smart investors are looking toward curated corporate bonds, senior debt instruments, and high-yield fixed deposits to generate superior risk-adjusted yields.</p>

<h2>Evaluating Corporate Debt Safely</h2>
<ul>
  <li><strong>Credit Ratings:</strong> Prioritize instruments rated AAA and AA+ by recognized agencies like CRISIL, ICRA, and CARE.</li>
  <li><strong>Seniority & Security:</strong> Understand whether the bond is senior secured (backed by company assets) or subordinated.</li>
  <li><strong>Cash Flow Matching:</strong> Structure maturity dates to align with upcoming financial commitments.</li>
</ul>`,
    image_url: "/images/blogs/blog-5.jpg",
    author: "Finvoq Admin",
    category: "Fixed Income & Debt",
    published: true,
    position: 5,
    meta_title: "Fixed Income Reimagined: High-Yield Corporate Bonds & FDs | Finvoq",
    meta_description:
      "Secure predictable cash flows with AAA-rated corporate bonds and fixed deposits. Understand credit ratings, seniority, and yield curve strategies in 2026.",
    focus_keyword: "high-yield corporate bonds",
    meta_keywords:
      "corporate bonds india, high yield fd, fixed income securities, crisil aaa bonds, debt instruments",
    tags: ["Bonds", "Corporate FDs", "Fixed Income", "Yield", "Capital Preservation"],
    canonical_url: "https://finvoq.com/blog/fixed-income-high-yield-bonds-fds",
    og_image: "/images/blogs/blog-5.jpg",
    created_at: "2026-08-26T23:53:27.156Z"
  },
  {
    id: "b6-pms-vs-mutual-funds-guide",
    title: "Portfolio Management Services (PMS) vs Mutual Funds",
    slug: "pms-vs-mutual-funds-guide",
    excerpt:
      "Unpacking the key differences in portfolio concentration, fee structures, and customization for high-net-worth investors.",
    body: `<h2>Choosing the Right Vehicle for Your Capital</h2>
<p>While Mutual Funds offer broad diversification for retail investors, Portfolio Management Services (PMS) cater to discerning investors seeking concentrated, theme-driven alpha.</p>

<h2>Direct Comparison Matrix</h2>
<ul>
  <li><strong>Portfolio Concentration:</strong> Mutual funds often hold 50–100 stocks; a PMS typically focuses on 15–25 high-conviction ideas.</li>
  <li><strong>Ownership:</strong> In a PMS, shares are held directly in your individual demat account.</li>
  <li><strong>Customization:</strong> PMS managers have the agility to hold tactical cash and customize sector exposure based on market regimes.</li>
</ul>`,
    image_url: "/images/blogs/blog-6.jpg",
    author: "Finvoq Admin",
    category: "Investment Vehicles",
    published: true,
    position: 6,
    meta_title: "Portfolio Management Services (PMS) vs Mutual Funds: A 2026 Guide | Finvoq",
    meta_description:
      "Comparing PMS and Mutual Funds on concentration, direct demat ownership, fee structures, and customization for high-net-worth investors.",
    focus_keyword: "pms vs mutual funds",
    meta_keywords:
      "pms vs mutual funds, portfolio management services, sebi pms regulations, hni investing india",
    tags: ["PMS", "Mutual Funds", "HNIs", "Portfolio Management", "Alpha Generation"],
    canonical_url: "https://finvoq.com/blog/pms-vs-mutual-funds-guide",
    og_image: "/images/blogs/blog-6.jpg",
    created_at: "2026-08-26T23:53:27.156Z"
  }
];

export function getFallbackBlogBySlug(slug: string): Blog | null {
  if (!slug) return null;
  const s = String(slug).trim().toLowerCase();
  return DEFAULT_BLOGS.find((b) => b.slug.toLowerCase() === s) || null;
}

export function getAllFallbackBlogs(): Blog[] {
  return [...DEFAULT_BLOGS];
}

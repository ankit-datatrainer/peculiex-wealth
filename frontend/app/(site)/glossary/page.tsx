import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Glossary — Investment Terms Explained",
  description:
    "A plain-English glossary of investment terms — from AIF and CAGR to SIP and YTM — for Indian investors."
};

const TERMS: { term: string; def: string }[] = [
  { term: "AIF (Alternative Investment Fund)", def: "A SEBI-regulated pooled investment vehicle for sophisticated investors. Comes in three categories: Cat I (VC, infra), Cat II (PE, real estate, debt), Cat III (long-short, hedge). Minimum ticket: ₹1 Cr." },
  { term: "AMC (Asset Management Company)", def: "The company that manages a mutual fund. HDFC AMC, ICICI Prudential AMC, SBI MF, Nippon India AMC, etc. Each AMC offers many schemes." },
  { term: "AUM (Assets Under Management)", def: "The total market value of investments managed on behalf of clients. A scheme's AUM and a firm's AUM are common health metrics." },
  { term: "CAGR (Compound Annual Growth Rate)", def: "The annualised rate at which an investment would have grown if it compounded at a steady rate. Useful for comparing returns over different time periods." },
  { term: "Demat Account", def: "An electronic account that holds your shares and securities in dematerialised (paperless) form. Required to invest in equity, bonds, REITs, and ETFs in India." },
  { term: "Direct Plan", def: "A mutual fund plan with no distributor commission baked into the expense ratio. Net returns are typically 0.5–1.0% higher than the equivalent regular plan." },
  { term: "ELSS (Equity-Linked Savings Scheme)", def: "Tax-saving equity mutual fund eligible for Section 80C deduction up to ₹1.5L per year. Comes with a 3-year lock-in — the shortest among 80C options." },
  { term: "ETF (Exchange Traded Fund)", def: "A basket of securities that trades on the stock exchange like a single stock. Generally tracks an index (NIFTY 50, S&P 500, gold). Lower expense ratios than active mutual funds." },
  { term: "Expense Ratio", def: "The annual fee a mutual fund charges, expressed as a percentage of AUM. Comes out of returns automatically. Direct plans: 0.2–1.0%. Regular plans: 1.0–2.5%." },
  { term: "FD (Fixed Deposit)", def: "A bank deposit at a fixed interest rate for a fixed term. Capital is RBI-insured up to ₹5L per bank per depositor (DICGC)." },
  { term: "G-Sec (Government Security)", def: "Debt issued by the Government of India through the RBI. Sovereign-rated, considered the safest rupee asset. Yields are the benchmark for all other Indian debt." },
  { term: "IRR (Internal Rate of Return)", def: "The annualised return on an investment with irregular cash flows — useful for SIPs, real estate, and PE/VC where money goes in and out at different times." },
  { term: "KYC (Know Your Customer)", def: "Identity-verification mandated by SEBI/RBI before you can invest. Aadhaar-based eKYC is the fastest path; PAN + address proof works otherwise." },
  { term: "LTCG (Long-Term Capital Gains)", def: "Profit on an asset held longer than the long-term threshold (1 year for listed equity, 2 years for real estate, 3 years for debt funds). Concessional tax rates apply." },
  { term: "Lumpsum", def: "A one-time investment, as opposed to a SIP. Useful when you have a windfall or after a significant market correction." },
  { term: "NAV (Net Asset Value)", def: "The per-unit market value of a mutual fund scheme, calculated daily after market close. Buying / selling happens at the next NAV." },
  { term: "NCD (Non-Convertible Debenture)", def: "A corporate bond that cannot be converted to equity. Listed NCDs trade on NSE/BSE; unlisted NCDs are private placements." },
  { term: "PMS (Portfolio Management Service)", def: "A SEBI-regulated discretionary mandate where a portfolio manager invests directly in your demat account on your behalf. Minimum ticket: ₹50L." },
  { term: "REIT (Real Estate Investment Trust)", def: "A SEBI-regulated trust that owns income-producing real estate, mostly Grade-A commercial. Listed on NSE/BSE; pays out ~90% of cash flow as distributions." },
  { term: "Risk Profile", def: "A classification (Conservative / Moderate / Aggressive) based on your time horizon, liquidity needs, and emotional capacity for drawdowns. Drives your asset allocation." },
  { term: "SIP (Systematic Investment Plan)", def: "Auto-debiting a fixed amount each month into a mutual fund. Builds the habit, smooths the entry price (rupee-cost averaging), and removes timing decisions." },
  { term: "STCG (Short-Term Capital Gains)", def: "Profit on an asset sold before the long-term threshold. Taxed at higher rates than LTCG — 15% for listed equity, slab rate for debt funds." },
  { term: "STP (Systematic Transfer Plan)", def: "Periodic transfers from one mutual fund (often a liquid fund) into another (often equity). A way to do staggered lump-sum entry while keeping cash earning interest." },
  { term: "SWP (Systematic Withdrawal Plan)", def: "The reverse of a SIP — periodic redemptions from a mutual fund into your bank account. Common in retirement portfolios." },
  { term: "Unlisted Share", def: "Equity in a company that is not yet listed on a public stock exchange. Liquidity is lower and price discovery happens through private secondary trades." },
  { term: "ULIP (Unit-Linked Insurance Plan)", def: "A hybrid product that mixes life insurance with investing. We don't sell them — they typically underperform on both legs compared to buying term + investing the difference separately." },
  { term: "XIRR (Extended Internal Rate of Return)", def: "IRR for irregular cash flows. The right metric for a SIP or any portfolio where money goes in at different times — most platforms now report XIRR by default." },
  { term: "YTM (Yield to Maturity)", def: "The total annualised return on a bond if held to maturity, accounting for coupons and the difference between purchase price and face value. The single most important number on a bond." }
];

export default function GlossaryPage() {
  return (
    <>
      <PageHero
        label="Glossary"
        title={<>Investing terms, in <em>plain English.</em></>}
        subtitle="From AIF and CAGR to SIP and YTM — definitions you can rely on, with the Indian regulatory context where it matters."
      />

      <section style={{ padding: "0 0 120px" }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div className="glossary-list">
            {TERMS.map((t) => (
              <div className="glossary-item" key={t.term}>
                <h3>{t.term}</h3>
                <p>{t.def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Featured mutual fund scheme names that rotate in the corner popup every 5s (#12).
const FEATURED_FUNDS = [
  "HDFC Flexi Cap Fund",
  "Parag Parikh Flexi Cap Fund",
  "SBI Contra Fund",
  "Nippon India Small Cap Fund",
  "ICICI Prudential Bluechip Fund",
  "Mirae Asset Large & Midcap Fund",
  "Quant Small Cap Fund",
  "Kotak Emerging Equity Fund",
  "Axis Midcap Fund",
  "Motilal Oswal Midcap Fund"
];

const ENTRY_KEY = "peculiex-entry-popup-seen";

export default function SiteModals() {
  const pathname = usePathname();
  const [entryOpen, setEntryOpen] = useState(false);
  const [fundIdx, setFundIdx] = useState(0);
  const [fundShown, setFundShown] = useState(false);

  // Entry popup — once per browser session, after a short delay (altportfunds-style).
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(ENTRY_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setEntryOpen(true), 2600);
    return () => clearTimeout(t);
  }, [pathname]);

  const closeEntry = () => {
    setEntryOpen(false);
    try {
      sessionStorage.setItem(ENTRY_KEY, "1");
    } catch {}
  };

  // Rotating featured-fund popup — cycles every 5 seconds.
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const start = setTimeout(() => setFundShown(true), 6000);
    const rotate = setInterval(() => {
      setFundShown(false);
      setTimeout(() => {
        setFundIdx((i) => (i + 1) % FEATURED_FUNDS.length);
        setFundShown(true);
      }, 500);
    }, 5000);
    return () => {
      clearTimeout(start);
      clearInterval(rotate);
    };
  }, [pathname]);

  return (
    <>
      {/* Entry / announcement modal */}
      {entryOpen && (
        <div className="entry-modal-overlay" onClick={closeEntry}>
          <div
            className="entry-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to Peculiex"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="entry-modal-close" aria-label="Close" onClick={closeEntry}>
              ✕
            </button>
            <div className="entry-modal-left">
              <span className="badge">START YOUR INVESTMENT JOURNEY</span>
              <h3>Talk To Our Experts:<br/><em>Start Investing Today</em></h3>
              <p>Explore curated investment opportunities across AIFs, PMS, Mutual Funds, International Funds, and Wealth Solutions designed to help you grow your portfolio with confidence.</p>
              
              <div className="contact-row">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div className="contact-info">
                  <span>Call us</span>
                  <strong><a href="tel:+919999999999" style={{ color: "inherit", textDecoration: "none" }}>+91 99999 99999</a></strong>
                </div>
              </div>
              
              <div className="contact-row">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="contact-info">
                  <span>Email us</span>
                  <strong><a href="mailto:contact@peculiex.com" style={{ color: "inherit", textDecoration: "none" }}>contact@peculiex.com</a></strong>
                </div>
              </div>

              <div className="regs">
                <div className="reg-item">
                  <span>APMI Reg.</span>
                  <strong>APRN00074</strong>
                </div>
                <div className="reg-item">
                  <span>AMFI ARN</span>
                  <strong>171040</strong>
                </div>
              </div>
            </div>
            <div className="entry-modal-right">
              <h3>Request A Callback:<br/><em>Start Investing Today</em></h3>
              <form className="entry-modal-form" onSubmit={(e) => { e.preventDefault(); closeEntry(); }}>
                <div className="entry-modal-form-row">
                  <input type="text" className="entry-modal-input" placeholder="First Name*" required />
                  <input type="text" className="entry-modal-input" placeholder="Last Name" />
                </div>
                <input type="email" className="entry-modal-input" placeholder="Email Id*" required />
                <div className="entry-modal-form-row">
                  <input type="tel" className="entry-modal-input" placeholder="+91 Mobile Number*" required />
                  <input type="text" className="entry-modal-input" placeholder="Current City*" required />
                </div>
                <select className="entry-modal-input entry-modal-select" required defaultValue="">
                  <option value="" disabled>Investment Interest*</option>
                  <option value="aif">AIFs</option>
                  <option value="pms">PMS</option>
                  <option value="mf">Mutual Funds</option>
                  <option value="other">Other Wealth Solutions</option>
                </select>
                <button type="submit" className="entry-modal-submit">Submit Form →</button>
              </form>
              <div className="entry-modal-disclaimer">
                <strong>Disclaimer:</strong> Investing in AIF, PMS, GIFT City or Mutual Funds is subject to market risk. Please read all related documents carefully before investing. By submitting you authorize Peculiex to call, email, or WhatsApp you.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rotating featured mutual fund popup */}
      <div className={`fund-popup${fundShown ? " show" : ""}`} aria-live="polite">
        <span className="fund-popup-label">Featured Fund</span>
        <span className="fund-popup-name">{FEATURED_FUNDS[fundIdx]}</span>
        <Link href="/products/mutual-funds" className="fund-popup-link">
          Explore →
        </Link>
      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Featured mutual fund scheme names that rotate in the corner popup
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



export default function SiteModals() {
  const pathname = usePathname();
  const [fundIdx, setFundIdx] = useState(0);
  const [fundShown, setFundShown] = useState(false);

  // Rotating featured-fund popup — cycles every 2 minutes starting at 2 minutes
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    
    let rotate: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setFundShown(true);
      setTimeout(() => setFundShown(false), 5000); // Hide after 5 seconds
      
      rotate = setInterval(() => {
        setFundIdx((i) => (i + 1) % FEATURED_FUNDS.length);
        setFundShown(true);
        setTimeout(() => setFundShown(false), 5000);
      }, 120000); // Repeat every 2 minutes
    }, 120000); // Start at 2 minutes

    return () => {
      clearTimeout(start);
      if (rotate) clearInterval(rotate);
    };
  }, [pathname]);



  return (
    <>
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

import { getCompanyLogo } from "@/lib/util";
import Link from "next/link";

type Partner = { name: string; domain?: string; imgUrl?: string };

const SETS: Record<string, { title: string; partners: Partner[] }> = {
  "mutual-funds": {
    title: "Our Partners",
    partners: [
      { name: "HDFC", imgUrl: "/partners/1.png" },
      { name: "Canara Robeco", imgUrl: "/partners/2.png" },
      { name: "Invesco", imgUrl: "/partners/3.png" },
      { name: "Nippon India", imgUrl: "/partners/5.png" },
      { name: "ICICI Prudential", imgUrl: "/partners/4.png" },
      { name: "Motilal Oswal", imgUrl: "/partners/6.png" },
      { name: "Quant", imgUrl: "/partners/7.png" },
      { name: "SBI Mutual Fund", imgUrl: "/partners/8.png" },
      { name: "PPFAS", imgUrl: "/partners/9.png" },
      { name: "PGIM India", imgUrl: "/partners/10.png" },
      { name: "Bandhan Mutual Fund", imgUrl: "/partners/11.png" },
      { name: "Kotak Mutual Fund", imgUrl: "/partners/12.png" },
      { name: "Shriram Mutual Fund", imgUrl: "/partners/13.png" },
      { name: "Tata Mutual Fund", imgUrl: "/partners/14.png" },
      { name: "DSP Mutual Fund", imgUrl: "/partners/15.png" },
      { name: "LIC Mutual Fund", imgUrl: "/partners/16.png" },
      { name: "UTI Mutual Fund", imgUrl: "/partners/17.png" },
      { name: "Axis Mutual Fund", imgUrl: "/partners/18.png" },
      { name: "HSBC Mutual Fund", imgUrl: "/partners/19.png" },
      { name: "Aditya Birla Capital", imgUrl: "/partners/20.png" },
      { name: "Mirae Asset", imgUrl: "/partners/22.png" },
      { name: "Bajaj Finserv", imgUrl: "/partners/23.png" },
      { name: "Old Bridge", imgUrl: "/partners/24.png" },
      { name: "Abakkus", imgUrl: "/partners/25.png" },
      { name: "Edelweiss Mutual Fund", imgUrl: "/partners/26.png" },
      { name: "Groww Mutual Fund", imgUrl: "/partners/27.png" },
      { name: "Helios Mutual Fund", imgUrl: "/partners/28.png" },
      { name: "WhiteOak Capital", imgUrl: "/partners/29.png" },
      { name: "BNP Paribas", imgUrl: "/partners/bnp.png" },
    ]
  },
  "pms-aif": {
    title: "Our PMS & AIF partners",
    partners: [
      { name: "Motilal Oswal PMS", domain: "motilaloswalamc.com" },
      { name: "ASK Investment Managers", domain: "askfinancials.com" },
      { name: "White Oak Capital", domain: "whiteoakamc.com" },
      { name: "Marcellus", domain: "marcellus.in" },
      { name: "Abakkus", domain: "abakkusinvest.com" },
      { name: "Nuvama Asset Mgmt", domain: "nuvama.com" },
      { name: "360 ONE", domain: "360.one" },
      { name: "Kotak PMS", domain: "kotak.com" },
      { name: "ICICI Pru PMS", domain: "icicipruamc.com" },
      { name: "Edelweiss AIF", domain: "edelweissalternatives.com" }
    ]
  }
};

export default function PartnerLogos({ productSlug }: { productSlug: string }) {
  const set = SETS[productSlug];
  if (!set) return null;

  const topPartners = set.partners.slice(0, 7);
  const marqueePartners = set.partners.slice(7);

  return (
    <section className="partner-logos-sec">
      <div className="partner-ring-wrap">
        <div className="partner-ring"></div>
        <div className="partner-ring"></div>
        <div className="partner-ring"></div>
      </div>
      
      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <div className="partner-floating-wrap reveal rv-zoom">
          {topPartners.map((p, i) => {
            const isCenter = i === 3;
            return (
              <div className={`partner-badge ${isCenter ? "center-badge" : ""}`} key={p.name} title={p.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imgUrl || getCompanyLogo(p.domain!)} alt={p.name} loading="lazy" />
              </div>
            );
          })}
        </div>

        <div className="reveal">
          <h2 className="stitle">
            The Trusted Wealth Partner <br /> For Growing Portfolios
          </h2>
          <p className="sdesc">
            Access institutional-grade investment products through our partnerships with India’s leading asset managers and financial institutions.
          </p>
          
          <div className="partner-cta">
            <Link href="/contact" className="btn-primary">
              Book a Consultation
            </Link>
            <Link href="/about" className="btn-link">
              Explore Platform Features
              <svg viewBox="0 0 14 14" fill="none" width="16" height="16">
                <path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {marqueePartners.length > 0 && (
          <div className="reveal">
            <p className="partner-bottom-txt">And {marqueePartners.length}+ more leading institutions</p>
            <div className="partner-marquee-wrap">
              <div className="partner-marquee-track">
                {[...marqueePartners, ...marqueePartners].map((p, i) => (
                  <div className="partner-marquee-logo" key={`${p.name}-${i}`} title={p.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imgUrl || getCompanyLogo(p.domain!)} alt={p.name} loading="lazy" />
                    {!p.imgUrl && <span style={{ marginLeft: "8px" }}>{p.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import { getCompanyLogo } from "@/lib/util";

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

  return (
    <section className="partner-logos-sec">
      <div className="container">
        <div className="sec-head reveal">
          <div className="label">Partners</div>
          <h2 className="stitle">{set.title}</h2>
        </div>
        <div className="partner-grid reveal">
          {set.partners.map((p) => (
            <div className="partner-logo" key={p.name} title={p.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imgUrl || getCompanyLogo(p.domain!)}
                alt={`${p.name} logo`}
                loading="lazy"
                style={p.imgUrl ? { width: '100%', height: 'auto', objectFit: 'contain' } : undefined}
              />
              {!p.imgUrl && <span>{p.name}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

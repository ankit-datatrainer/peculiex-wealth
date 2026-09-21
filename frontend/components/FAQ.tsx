"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";
import { useContent } from "@/lib/content";
import Link from "next/link";

type Item = { q: string; a: string };

const FALLBACK: Item[] = [
  {
    q: "What is Finvoq?",
    a: "Finvoq is a multi-asset investment platform that helps investors discover, evaluate and access curated investment opportunities across listed and unlisted equities, mutual funds, PMS, AIFs, bonds and other asset classes."
  },
  {
    q: "Can I invest in unlisted and pre-IPO shares through Finvoq?",
    a: "Yes. Finvoq provides access to selected unlisted and pre-IPO opportunities, along with research and relevant transaction information to help investors make informed decisions."
  },
  {
    q: "How does Finvoq select investment opportunities?",
    a: "Finvoq follows a research-led approach, evaluating opportunities across factors such as business fundamentals, financial performance, valuation, risks and overall investment suitability before presenting them to investors."
  },
  {
    q: "Are investments made through Finvoq risk-free?",
    a: "No. Every investment carries risk. Unlisted shares, in particular, can involve lower liquidity, limited price discovery, valuation risk and uncertainty around future IPO or listing timelines."
  },
  {
    q: "Does Finvoq offer investments beyond unlisted shares?",
    a: "Yes. Investors can explore multiple asset classes through Finvoq, including listed equities, mutual funds, PMS, AIFs, bonds, fixed deposits, insurance and GIFT City opportunities."
  },
  {
    q: "How can I start investing with Finvoq?",
    a: "You can get started by creating an account with Finvoq. Based on your investment goals, time horizon and portfolio requirements, you can then explore suitable opportunities and connect with the Finvoq team for assistance."
  }
];

export default function FAQ() {
  const cms = useContent("faq");
  const [apiItems, setApiItems] = useState<Item[]>(FALLBACK);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Item[] }>("/api/faqs")
      .then((j) => {
        if (!killed && j?.items?.length) setApiItems(j.items);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

  const cmsItems = cms.list<Item>("faqList", "items", []);
  const items = cmsItems.length > 0 ? cmsItems : apiItems;

  const badgeText = cms.t("main", "badgeText", "FAQ");
  const headingText = cms.t("main", "heading", "Frequently Asked\nQuestions");
  const contactHeading = cms.t("contactBox", "heading", "Still have a question?");
  const contactSub = cms.t("contactBox", "subheading", "Don't worry we're here for consultation.");
  const contactBtn = cms.t("contactBox", "buttonText", "Contact Us");
  const contactHref = cms.t("contactBox", "buttonHref", "/get-started");

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="faq-sec">
      <div className="container">
        <div className="faq-two-column-wrapper reveal rv-right">
          
          <div className="faq-left-col">
            <div className="faq-label-small">
              <span className="faq-dot"></span> {badgeText}
            </div>
            <h2 className="faq-title-main" style={{ whiteSpace: "pre-line" }}>
              {headingText}
            </h2>
            
            <div className="faq-contact-block">
              <h3>{contactHeading}</h3>
              <p>{contactSub}</p>
              <Link href={contactHref} className="btn-contact-theme">{contactBtn}</Link>
            </div>
          </div>

          <div className="faq-right-col">
            <ul className="faq-list">
              {items.map((it, i) => {
                const num = String(i + 1).padStart(2, '0');
                return (
                  <li className="faq-item" data-open={openIndex === i} key={i}>
                    <button 
                      className="faq-q" 
                      type="button" 
                      aria-expanded={openIndex === i}
                      onClick={() => toggle(i)}
                    >
                      <div className="faq-q-left">
                        <span className="faq-num">{num}</span>
                        <span className="faq-q-text">{it.q}</span>
                      </div>
                      <span className="faq-toggle-icon">
                        {openIndex === i ? '-' : '+'}
                      </span>
                    </button>
                    <div className="faq-a">
                      <p>{it.a}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
        </div>
      </div>
    </section>
  );
}

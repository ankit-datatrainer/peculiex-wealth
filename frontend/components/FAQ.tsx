"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";
import Link from "next/link";

type Item = { q: string; a: string };

const FALLBACK: Item[] = [
  { q: "Is there a free plan available?", a: "Yes. Your demat account is held with SEBI-registered partners and funds move via RBI-regulated banking rails. Finvoq never holds custody of your assets — we are an advisor and execution layer only." },
  { q: "Can I invite my team members?", a: "Absolutely. Invite teammates, assign roles, and collaborate in real time from a shared workspace." },
  { q: "Does it integrate with other tools?", a: "Yes, we offer seamless integrations with popular tools like Slack, Jira, and GitHub to streamline your workflow." },
  { q: "Can I upgrade or downgrade my plan anytime?", a: "Yes, you can easily change your plan at any time. Prorated charges or credits will be applied automatically." },
  { q: "Is my project data secure?", a: "Security is our top priority. All data is encrypted at rest and in transit, and we undergo regular third-party audits." }
];

export default function FAQ() {
  const [items, setItems] = useState<Item[]>(FALLBACK);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    let killed = false;
    fetcher<{ items: Item[] }>("/api/faqs")
      .then((j) => {
        if (!killed && j?.items?.length) setItems(j.items);
      })
      .catch(() => {});
    return () => {
      killed = true;
    };
  }, []);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="faq-sec">
      <div className="container">
        <div className="faq-two-column-wrapper reveal rv-right">
          
          <div className="faq-left-col">
            <div className="faq-label-small">
              <span className="faq-dot"></span> FAQ
            </div>
            <h2 className="faq-title-main">
              Frequently Asked<br/>Questions
            </h2>
            
            <div className="faq-contact-block">
              <h3>Still have a question?</h3>
              <p>Don't worry we're here for consultation.</p>
              <Link href="/get-started" className="btn-contact-theme">Contact Us</Link>
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

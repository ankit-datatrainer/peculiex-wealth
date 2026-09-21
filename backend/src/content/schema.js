"use strict";

/**
 * Site content registry.
 *
 * One declarative description of every editable page, its sections and their
 * fields. This single file drives three things at once:
 *
 *   1. the super-admin editor  (forms are generated from it, so a new field
 *      needs no admin-UI code),
 *   2. the public API defaults (a page that has never been edited still
 *      returns the copy that currently ships in the code), and
 *   3. validation on save      (unknown keys are dropped, so a bad payload
 *      can never corrupt a page).
 *
 * Field types
 *   text      single-line string
 *   textarea  multi-line string
 *   image     URL or an uploaded file path (the editor shows a picker)
 *   url       link target
 *   list      repeatable group; `fields` describes one row
 *
 * `default` must mirror what the component renders today, so switching a
 * page to CMS-driven copy is a no-op until someone actually edits it.
 */

const f = (key, label, type = "text", def = "", extra = {}) => ({
  key,
  label,
  type,
  default: def,
  ...extra
});

/* Every page built on the shared <PageHero> gets the same three fields. */
const hero = (label, title, subtitle) => ({
  key: "hero",
  label: "Page header",
  fields: [
    f("label", "Eyebrow label", "text", label),
    f("title", "Heading", "text", title, {
      hint: "Wrap the highlighted part in *asterisks* to accent it."
    }),
    f("subtitle", "Sub-heading", "textarea", subtitle)
  ]
});

const PAGES = [
  /* ─────────────────────────── Home ─────────────────────────── */
  {
    key: "home",
    label: "Home",
    path: "/",
    sections: [
      {
        key: "hero",
        label: "Hero",
        fields: [
          f("titleA", "Headline (line 1)", "text", "Invest with clarity"),
          f("titleB", "Headline (line 2)", "text", "across every"),
          f("titleAccent", "Headline accent word", "text", "asset class."),
          f("portrait", "Advisor portrait", "image", "/homeclone-portrait.jpg"),
          f("infinity", "Hero infinity mark (leave blank to use the drawn one)", "image", ""),
          f("linkLabel", "Left link text", "text", "Start investing"),
          f("linkHref", "Left link target", "url", "/get-started"),
          f("ctaGhost", "Secondary button", "text", "Explore"),
          f("ctaPrimary", "Primary button", "text", "Open Account"),
          f("ctaPrimaryHref", "Primary button target", "url", "/signup"),
          f("stat1Value", "Hero Stat 1 Value", "text", "182cr+"),
          f("stat1Label", "Hero Stat 1 Label", "text", "Assets Managed"),
          f("stat2Value", "Hero Stat 2 Value", "text", "400+"),
          f("stat2Label", "Hero Stat 2 Label", "text", "Trusted Investors"),
          f("stat3Value", "Hero Stat 3 Value", "text", "0%"),
          f("stat3Label", "Hero Stat 3 Label", "text", "Advisory Fee")
        ]
      },
      {
        key: "stats",
        label: "Key Statistics (182cr+, 400+, 0%)",
        fields: [
          {
            key: "items",
            label: "Headline figures",
            type: "list",
            hint: "Headline numbers shown on Homepage and About page. Super Admin can change values (e.g. 182cr+, 400+, 0%) and labels here.",
            fields: [f("v", "Value", "text", ""), f("l", "Label", "text", "")],
            default: [
              { v: "182cr+", l: "Assets managed" },
              { v: "400+", l: "Trusted investors" },
              { v: "0%", l: "Advisory fee" }
            ]
          }
        ]
      },
      {
        key: "screens",
        label: "Story screens",
        fields: [
          f("oneTitle", "Screen 1 heading", "text", "New era\nof investing"),
          f(
            "oneBody",
            "Screen 1 body",
            "textarea",
            "We're on the verge of a new investing era, where opportunities once reserved for institutions open up to every serious investor in India."
          ),
          f("twoTitle", "Screen 2 heading", "text", "Every asset,\none platform"),
          f(
            "twoBody",
            "Screen 2 body",
            "textarea",
            "Listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds and insurance, curated by experts and executed in seconds."
          ),
          f("threeTitle", "Screen 3 heading", "text", "Building\nyour future"),
          f(
            "threeBody",
            "Screen 3 body",
            "textarea",
            "We connect India's leading asset managers with a clean, advisory-led platform, elegant infrastructure that takes your wealth to the future."
          )
        ]
      },
      {
        key: "platform",
        label: "Platform panel",
        fields: [
          f("titleA", "Headline start", "text", "All-in-one investment"),
          f("titleAccent", "Headline accent", "text", "platform"),
          f("titleB", "Headline end", "text", "for serious Indian investors"),
          f("sweepWord", "Giant scrolling word", "text", "Platform"),
          f("deviceTitle", "Device screen title", "text", "Wealth Dashboard"),
          f("deviceSubtitle", "Device screen subtitle", "text", "By Finvoq"),
          f("metricLabel", "Device metric label", "text", "PORTFOLIO XIRR"),
          f("metricValue", "Device metric value", "text", "18.20%"),
          f("phoneLabel", "Phone label", "text", "BALANCE"),
          f("phoneValue", "Phone balance", "text", "₹2.4Cr"),
          f("phoneChip", "Phone chip", "text", "+18.2%"),
          f("ctaGhost", "Secondary button", "text", "Explore"),
          f("ctaGhostHref", "Secondary button target", "url", "#platform"),
          f("ctaPrimary", "Primary button", "text", "Open Account"),
          f("ctaPrimaryHref", "Primary button target", "url", "/signup"),
          f("tabOne", "Device tab 1", "text", "INVEST"),
          f("tabTwo", "Device tab 2", "text", "TRACK"),
          f("rowOneLabel", "Device row 1 label", "text", "ASSET"),
          f("rowOneValue", "Device row 1 value", "text", "Nifty 50 Index Fund"),
          f("rowTwoLabel", "Device row 2 label", "text", "SIP DATE"),
          f("rowTwoValue", "Device row 2 value", "text", "1st of every month"),
          f("deviceCta", "Device button", "text", "DONE")
        ]
      },
      {
        key: "features",
        label: "Feature cards",
        fields: [
          f("eyebrow", "Eyebrow", "text", "The Platform"),
          f(
            "title",
            "Heading",
            "textarea",
            "A curated marketplace built like an institution and open to everyone."
          ),
          {
            key: "items",
            label: "Cards",
            type: "list",
            fields: [
              f("icon", "Icon", "select", "shield", {
                options: ["shield", "chart", "layers", "zap"]
              }),
              f("title", "Title", "text", ""),
              f("desc", "Description", "textarea", "")
            ],
            default: [
              {
                icon: "shield",
                title: "Bank-grade security",
                desc: "RBI & SEBI compliant. End-to-end encryption and annual third-party audits. Your wealth, fully protected."
              },
              {
                icon: "chart",
                title: "Curated by experts",
                desc: "Every product is hand-picked by SEBI-registered advisors. We say no to nine out of ten opportunities we evaluate."
              },
              {
                icon: "layers",
                title: "One unified platform",
                desc: "Equities, mutual funds, unlisted, PMS, AIF, bonds, insurance, and a single dashboard that ties it all together."
              },
              {
                icon: "zap",
                title: "Real-time execution",
                desc: "From research to investing, completed in seconds. Live BSE prices, no paperwork, no waiting."
              }
            ]
          }
        ]
      },
      {
        key: "about",
        label: "About band",
        fields: [
          f("eyebrow", "Eyebrow", "text", "About Finvoq"),
          f(
            "title",
            "Heading",
            "textarea",
            "We're bringing the discipline of private banking to every investor."
          ),
          f(
            "bodyOne",
            "Paragraph 1",
            "textarea",
            "Our team has spent a decade inside India's wealth industry building portfolios for families and institutions. We're rebuilding that experience as a platform any investor can walk into: advisory-led, transparent, and SEBI-registered."
          ),
          f(
            "bodyTwo",
            "Paragraph 2",
            "textarea",
            "Finvoq is a marketplace for real ownership across asset classes, not another trading app. Every product carries real diligence, clear costs and a human advisor behind it."
          ),
          {
            key: "stats",
            label: "Statistics",
            type: "list",
            fields: [f("v", "Value", "text", ""), f("l", "Label", "text", "")],
            default: [
              { v: "182cr+", l: "Assets managed" },
              { v: "400+", l: "Trusted investors" },
              { v: "0%", l: "Advisory fee" }
            ]
          }
        ]
      },
      {
        key: "partners",
        label: "Partners",
        fields: [
          f("eyebrow", "Eyebrow", "text", "Partnered with"),
          f(
            "title",
            "Heading",
            "textarea",
            "India's leading asset managers and institutions."
          ),
          f(
            "note",
            "Note under the heading",
            "textarea",
            "We distribute products from these asset managers. Their marks are shown to identify the funds available on Finvoq and do not imply any endorsement of Finvoq by them."
          ),
          {
            key: "items",
            label: "Partner logos",
            type: "list",
            hint:
              "Split evenly across two marquee rows, so an even number of logos reads best.",
            fields: [
              f("name", "Name", "text", ""),
              f("img", "Logo", "image", "")
            ],
            default: [
              { name: "HDFC", img: "/partners/1.png" },
              { name: "Canara Robeco", img: "/partners/2.png" },
              { name: "Invesco", img: "/partners/3.png" },
              { name: "ICICI Prudential", img: "/partners/4.png" },
              { name: "Nippon India", img: "/partners/5.png" },
              { name: "Motilal Oswal", img: "/partners/6.png" },
              { name: "Quant", img: "/partners/7.png" },
              { name: "SBI Mutual Fund", img: "/partners/8.png" },
              { name: "Kotak Mutual Fund", img: "/partners/12.png" },
              { name: "Tata Mutual Fund", img: "/partners/14.png" },
              { name: "DSP Mutual Fund", img: "/partners/15.png" },
              { name: "LIC Mutual Fund", img: "/partners/16.png" },
              { name: "UTI Mutual Fund", img: "/partners/17.png" },
              { name: "Axis Mutual Fund", img: "/partners/18.png" },
              { name: "HSBC Mutual Fund", img: "/partners/19.png" },
              { name: "Aditya Birla Capital", img: "/partners/20.png" }
            ]
          }
        ]
      },
      {
        key: "news",
        label: "News teasers",
        fields: [
          f("title", "Heading", "text", "Latest from Finvoq."),
          f("linkLabel", "Link text", "text", "All news"),
          f("linkHref", "Link target", "url", "/news"),
          {
            key: "items",
            label: "Cards",
            type: "list",
            fields: [
              f("tag", "Tag", "text", ""),
              f("date", "Date badge", "text", ""),
              f("title", "Headline", "textarea", ""),
              f("href", "Link target", "url", ""),
              f("cta", "Link text", "text", "")
            ],
            default: [
              {
                tag: "Markets",
                date: "Live",
                title:
                  "Track every BSE share with real-time prices and watchlists",
                href: "/markets",
                cta: "Open live markets"
              },
              {
                tag: "Insights",
                date: "Weekly",
                title:
                  "How our advisors curate unlisted opportunities before they list",
                href: "/unlisted",
                cta: "Browse unlisted opportunities"
              },
              {
                tag: "Company",
                date: "Beta",
                title:
                  "Finvoq opens its doors: India's advisory-led investment marketplace",
                href: "/about",
                cta: "Read our story"
              }
            ]
          }
        ]
      },
      {
        key: "footerCta",
        label: "Footer call-to-action",
        fields: [
          f("title", "Heading", "textarea", "Build your wealth's future with us."),
          f("formLabel", "Form label", "text", "Get the weekly market brief"),
          f("button", "Button text", "text", "Sign up"),
          f(
            "note",
            "Note under the form",
            "text",
            "Curated insights every Monday. No promotions, no spam."
          ),
          f(
            "blurb",
            "Footer blurb",
            "textarea",
            "India's premium investment marketplace. Multiple asset classes, one platform, advisory-led."
          ),
          f(
            "badge",
            "Registration badge",
            "text",
            "AMFI Registered Mutual Fund Distributor — ARN-346787"
          )
        ]
      }
    ]
  },

  /* ──────────────────── Simple content pages ──────────────────── */
  {
    key: "about",
    label: "About",
    path: "/about",
    sections: [
      hero(
        "About",
        "Wealth management, *without the markup.*",
        "We started Finvoq because India's investing experience was broken in two predictable ways: too many platforms, and too many incentives that point away from the investor."
      ),
      {
        key: "why",
        label: "Why we exist",
        fields: [
          f("heading", "Section heading", "text", "Why we exist"),
          f(
            "paragraph1",
            "First paragraph",
            "textarea",
            "Most Indian investors hold a tangle of mutual fund folios, a demat account at one broker, an LIC policy from a relative, a flat in a tier-3 city, and a few stocks someone recommended at a wedding. Each piece was sold by someone earning a commission. None of it was bought as part of a plan."
          ),
          f(
            "paragraph2",
            "Second paragraph",
            "textarea",
            "Finvoq unifies the investing surface (10+ asset classes, one dashboard). We earn regulated distribution commissions disclosed upfront on every trade. There's no separate bill from us for the research, the curation, or the platform itself."
          )
        ]
      },
      {
        key: "beliefs",
        label: "What we believe",
        fields: [
          f("heading", "Section heading", "text", "What we believe"),
          {
            key: "items",
            label: "Belief points",
            type: "list",
            fields: [
              f("title", "Point title", "text", ""),
              f("description", "Point description", "textarea", "")
            ],
            default: [
              {
                title: "Curation beats access.",
                description:
                  "India has 1,500 mutual fund schemes and 300+ unlisted offers. The win isn't more choice. It's the right shortlist."
              },
              {
                title: "Every fee should be visible.",
                description:
                  "Distribution commission is how this industry has always worked. What's rare is showing you the number. We disclose what we earn on every recommendation, upfront."
              },
              {
                title: "Tools should be opinionated.",
                description:
                  "Calculators, dashboards, and research notes should help you decide, not just visualise."
              },
              {
                title: "Compliance is a feature, not a hurdle.",
                description:
                  "SEBI-linked, RBI-rail settlements, demat in your name, audit trail you can pull at any time."
              }
            ]
          }
        ]
      },
      {
        key: "where",
        label: "Where we are",
        fields: [
          f("heading", "Section heading", "text", "Where we are"),
          {
            key: "items",
            label: "Facts list",
            type: "list",
            fields: [f("text", "Fact item text", "text", "")],
            default: [
              { text: "Founded in 2021 in Delhi, India." },
              { text: "AMFI-registered Mutual Fund Distributor (ARN-346787)." },
              { text: "400+ active investors, 182cr+ in assets under distribution." }
            ]
          }
        ]
      },
      {
        key: "stats",
        label: "Key Statistics (182cr+, 400+, 0%)",
        fields: [
          {
            key: "items",
            label: "Headline figures",
            type: "list",
            hint: "Headline numbers shown on About page.",
            fields: [f("v", "Value", "text", ""), f("l", "Label", "text", "")],
            default: [
              { v: "182cr+", l: "Assets under distribution" },
              { v: "400+", l: "Active investors" },
              { v: "0%", l: "Advisory fee" }
            ]
          }
        ]
      },
      {
        key: "howWeWork",
        label: "How we work with you",
        fields: [
          f("heading", "Section heading", "text", "How we work with you"),
          f(
            "paragraph1",
            "First paragraph",
            "textarea",
            "Every investor is paired with a relationship manager based on goals, time horizon, and portfolio size. You'll get one human as your point of contact (reachable on WhatsApp, email, or a scheduled call), backed by a research desk and an operations team that handles the paperwork."
          ),
          f(
            "paragraph2",
            "Second paragraph",
            "textarea",
            "We do quarterly portfolio reviews on the calendar, and ad-hoc reviews whenever there's a market event or a personal one. The goal is steady, boring compounding, and the discipline to ride out the rough quarters."
          )
        ]
      },
      {
        key: "whatWeDontDo",
        label: "What we don't do",
        fields: [
          f("heading", "Section heading", "text", "What we don't do"),
          {
            key: "items",
            label: "Rules / exclusions",
            type: "list",
            fields: [f("text", "Item text", "text", "")],
            default: [
              { text: "Sell ULIPs, endowment plans, or any product that mixes insurance with investing." },
              { text: "Charge you a separate advisory fee on top of the commission we disclose." },
              { text: "Push F&O speculation, intraday tips, or \"get-rich\" schemes." },
              { text: "Promise specific returns. We promise process and transparency." }
            ]
          }
        ]
      },
      {
        key: "regulators",
        label: "Our regulators",
        fields: [
          f("heading", "Section heading", "text", "Our regulators"),
          f(
            "body",
            "Regulator description",
            "textarea",
            "We work within the framework set by SEBI and AMFI (mutual fund distribution), RBI (banking rails), and IRDAI (insurance distribution). Disputes can be raised through our grievance redressal process, with escalation to the SEBI SCORES portal at every stage."
          ),
          f("credentialsHeading", "Credentials card heading", "text", "Our AMFI registration"),
          f(
            "credentialsIntro",
            "Credentials card intro",
            "textarea",
            "Verify these against the AMFI register before you invest. We publish them in full because a distributor who will not show you their ARN is a distributor you should not be dealing with."
          )
        ]
      },
      {
        key: "cta",
        label: "Closing call to action",
        fields: [
          f("text", "Text", "text", "If our values match yours, we'd love to work with you."),
          f("linkLabel", "Button / link label", "text", "Get started in five minutes →"),
          f("linkHref", "Button / link target", "url", "/get-started")
        ]
      }
    ]
  },
  {
    key: "stories",
    label: "Investor stories",
    path: "/stories",
    sections: [
      hero(
        "Investor stories",
        "Investors who chose *process over noise.*",
        "No paid testimonials. These are real Finvoq clients, with the headline change in their portfolio in their own words."
      ),
      {
        key: "stories",
        label: "Investor story cards",
        fields: [
          {
            key: "items",
            label: "Stories",
            type: "list",
            fields: [
              f("name", "Investor name", "text", ""),
              f("role", "Role / Company", "text", ""),
              f("initials", "Initials (avatar)", "text", ""),
              f("color", "Avatar colour", "text", "#0E3F76"),
              f("headline", "Headline", "text", ""),
              f("quote", "Full story / quote", "textarea", ""),
              f("metric", "Portfolio metric tag", "text", "")
            ],
            default: [
              {
                initials: "AS",
                color: "#0E3F76",
                name: "Aarav Shah",
                role: "Founder, Lumen Studios",
                headline: "From scattered demats to one ledger.",
                quote: "I had four demat accounts, two LIC policies I'd forgotten about, and ₹40L sitting in a savings account because I didn't know what to do with it. The Finvoq team consolidated everything inside two weeks and built me a 60-30-10 portfolio that actually fits my horizon.",
                metric: "₹2.1 Cr consolidated · 12 months"
              },
              {
                initials: "PK",
                color: "#7c3aed",
                name: "Priya Kapoor",
                role: "Director, MIT-K Capital",
                headline: "Finally got into the funds I'd been refused before.",
                quote: "As an HNI you get pitched a thousand AIFs, and almost none of them are worth the lock-up. Finvoq's research desk turned down two of the three I was leaning toward, for very specific reasons. The one we did go with is up 19% IRR after fees.",
                metric: "₹1.4 Cr deployed across two AIFs"
              },
              {
                initials: "VI",
                color: "#13735d",
                name: "Vikram Iyer",
                role: "Managing Partner, Iyer Family Office",
                headline: "Family-office service without family-office overheads.",
                quote: "We were quoted ₹12L/year by a private bank for what is essentially a quarterly review and a curated product list. Finvoq does the same for a fraction, and they take regulatory compliance seriously: every meeting is documented, every recommendation is auditable.",
                metric: "₹4.8 Cr managed · zero commissions"
              },
              {
                initials: "NR",
                color: "#ea7c1c",
                name: "Neha Reddy",
                role: "CFO, Zenith Health",
                headline: "Three hours a week back, every week.",
                quote: "I used to spend Sunday mornings logging into five different platforms to figure out what I owned. Now I open one tab. The dashboard alone justified the move, the advisory fees are gravy.",
                metric: "5 platforms → 1 dashboard"
              },
              {
                initials: "RB",
                color: "#16a34a",
                name: "Rajesh Bansal",
                role: "Retd. Senior Banker, 25-yr investor",
                headline: "First platform that actually serves the investor.",
                quote: "I've been investing through public-sector banks, private banks, three different brokers, and two robo-advisors. Finvoq is the first one where I felt like I was the customer, not the product. It shouldn't be a rare thing: but it is.",
                metric: "₹3.2 Cr portfolio, post-retirement"
              },
              {
                initials: "KM",
                color: "#dc2626",
                name: "Karan Mehta",
                role: "Founder, Stride Ventures",
                headline: "Got into a PMS that's beaten the index for 7 years.",
                quote: "The PMS I'd been wanting was closed to new HNI investors. Finvoq got me in via a partner allocation, with full disclosure of fees, exit terms, and historical drawdowns. No 'best returns' marketing: just the data and a recommendation I could pressure-test.",
                metric: "PMS · ₹75L · onboarded in 11 days"
              }
            ]
          }
        ]
      },
      {
        key: "cta",
        label: "Bottom call to action",
        fields: [
          f("buttonLabel", "Button label", "text", "Open your account →"),
          f("buttonHref", "Button target", "url", "/get-started")
        ]
      }
    ]
  },
  {
    key: "careers",
    label: "Careers",
    path: "/careers",
    sections: [
      hero(
        "Careers",
        "Build the platform *India's investors deserve.*",
        "We're a small team rebuilding the wealth-management experience from first principles. We hire for craft, ownership, and unusual clarity of thought."
      ),
      {
        key: "howWeWork",
        label: "How we work",
        fields: [
          f("heading", "Section heading", "text", "How we work"),
          {
            key: "items",
            label: "Principles",
            type: "list",
            fields: [
              f("title", "Principle title", "text", ""),
              f("body", "Description", "textarea", "")
            ],
            default: [
              {
                title: "Small teams, large surface.",
                body: "Our largest team has six people. You'll ship code or recommendations that touch every active investor on the platform."
              },
              {
                title: "Compliance is engineering.",
                body: "SEBI compliance isn't a checklist somewhere else. Whoever ships the feature owns the regulatory surface it touches."
              },
              {
                title: "No revenue from product manufacturers.",
                body: "We charge investors a flat advisory fee. Sales targets do not exist on the advisory team."
              }
            ]
          }
        ]
      },
      {
        key: "openRoles",
        label: "Open roles",
        fields: [
          f("eyebrow", "Eyebrow label", "text", "Open roles"),
          f("title", "Heading", "text", "We're hiring across *product, advisory & research.*"),
          {
            key: "roles",
            label: "Job listings",
            type: "list",
            fields: [
              f("title", "Role title", "text", ""),
              f("team", "Team / Department", "text", ""),
              f("location", "Location", "text", ""),
              f("type", "Employment type", "text", "Full-time"),
              f("applyEmail", "Application email", "text", "info@finvoq.com")
            ],
            default: [
              {
                title: "Commission Agent",
                team: "Management",
                location: "On-site",
                type: "Full-time",
                applyEmail: "info@finvoq.com"
              },
              {
                title: "Social Media Managers",
                team: "Management",
                location: "Delhi, Mumbai, Bangalore, Hyderabad, Goa, Pune, Kolkata, Chandigarh",
                type: "Full-time",
                applyEmail: "info@finvoq.com"
              },
              {
                title: "Business Developers",
                team: "Sales",
                location: "Remote",
                type: "Full-time",
                applyEmail: "info@finvoq.com"
              }
            ]
          },
          f("calloutText", "Footer callout text", "text", "Don't see a fit but think you'd add value? Email"),
          f("calloutEmail", "Contact email", "text", "info@finvoq.com"),
          f("calloutSub", "Callout sub-text", "text", "with what you'd want to build, and a link to your best work.")
        ]
      }
    ]
  },
  {
    key: "faq",
    label: "FAQ",
    path: "/faq",
    sections: [
      hero(
        "FAQ",
        "Questions, *answered.*",
        "Everything investors ask before getting started: straight answers, no jargon."
      ),
      {
        key: "main",
        label: "FAQ section header",
        fields: [
          f("badgeText", "Badge label", "text", "FAQ"),
          f("heading", "Main heading", "textarea", "Frequently Asked\nQuestions")
        ]
      },
      {
        key: "contactBox",
        label: "Consultation / Contact box",
        fields: [
          f("heading", "Box heading", "text", "Still have a question?"),
          f("subheading", "Box subtitle", "text", "Don't worry we're here for consultation."),
          f("buttonText", "Button label", "text", "Contact Us"),
          f("buttonHref", "Button link", "url", "/get-started")
        ]
      },
      {
        key: "faqList",
        label: "FAQ questions & answers",
        fields: [
          {
            key: "items",
            label: "Questions & Answers",
            type: "list",
            fields: [
              f("q", "Question", "text", ""),
              f("a", "Answer", "textarea", "")
            ],
            default: [
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
            ]
          }
        ]
      }
    ]
  },
  {
    key: "glossary",
    label: "Glossary",
    path: "/glossary",
    sections: [
      hero(
        "Glossary",
        "Investing terms, in *plain English.*",
        "From AIF and CAGR to SIP and YTM: definitions you can rely on, with the Indian regulatory context where it matters."
      ),
      {
        key: "terms",
        label: "Glossary terms & definitions",
        fields: [
          {
            key: "items",
            label: "Terms",
            type: "list",
            fields: [
              f("term", "Financial term", "text", ""),
              f("def", "Plain-English definition", "textarea", "")
            ],
            default: [
              { term: "AIF (Alternative Investment Fund)", def: "A SEBI-regulated pooled investment vehicle for sophisticated investors. Comes in three categories: Cat I (VC, infra), Cat II (PE, real estate, debt), Cat III (long-short, hedge). Minimum ticket: ₹1 Cr." },
              { term: "AMC (Asset Management Company)", def: "The company that manages a mutual fund. HDFC AMC, ICICI Prudential AMC, SBI MF, Nippon India AMC, etc. Each AMC offers many schemes." },
              { term: "AUM (Assets Under Management)", def: "The total market value of investments managed on behalf of clients. A scheme's AUM and a firm's AUM are common health metrics." },
              { term: "CAGR (Compound Annual Growth Rate)", def: "The annualised rate at which an investment would have grown if it compounded at a steady rate. Useful for comparing returns over different time periods." },
              { term: "Demat Account", def: "An electronic account that holds your shares and securities in dematerialised (paperless) form. Required to invest in equity, bonds, REITs, and ETFs in India." },
              { term: "Direct Plan", def: "A mutual fund plan with no distributor commission baked into the expense ratio. Net returns are typically 0.5–1.0% higher than the equivalent regular plan." },
              { term: "ELSS (Equity-Linked Savings Scheme)", def: "Tax-saving equity mutual fund eligible for Section 80C deduction up to ₹1.5L per year. Comes with a 3-year lock-in, the shortest among 80C options." },
              { term: "ETF (Exchange Traded Fund)", def: "A basket of securities that trades on the stock exchange like a single stock. Generally tracks an index (NIFTY 50, S&P 500, gold). Lower expense ratios than active mutual funds." },
              { term: "Expense Ratio", def: "The annual fee a mutual fund charges, expressed as a percentage of AUM. Comes out of returns automatically. Direct plans: 0.2–1.0%. Regular plans: 1.0–2.5%." },
              { term: "FD (Fixed Deposit)", def: "A bank deposit at a fixed interest rate for a fixed term. Capital is RBI-insured up to ₹5L per bank per depositor (DICGC)." },
              { term: "G-Sec (Government Security)", def: "Debt issued by the Government of India through the RBI. Sovereign-rated, considered the safest rupee asset. Yields are the benchmark for all other Indian debt." },
              { term: "IRR (Internal Rate of Return)", def: "The annualised return on an investment with irregular cash flows: useful for SIPs, real estate, and PE/VC where money goes in and out at different times." },
              { term: "KYC (Know Your Customer)", def: "Identity-verification mandated by SEBI/RBI before you can invest. Aadhaar-based eKYC is the fastest path; PAN + address proof works otherwise." },
              { term: "LTCG (Long-Term Capital Gains)", def: "Profit on an asset held longer than the long-term threshold (1 year for listed equity, 2 years for real estate, 3 years for debt funds). Concessional tax rates apply." },
              { term: "Lumpsum", def: "A one-time investment, as opposed to a SIP. Useful when you have a windfall or after a significant market correction." },
              { term: "NAV (Net Asset Value)", def: "The per-unit market value of a mutual fund scheme, calculated daily after market close. Buying / selling happens at the next NAV." },
              { term: "NCD (Non-Convertible Debenture)", def: "A corporate bond that cannot be converted to equity. Listed NCDs trade on BSE; unlisted NCDs are private placements." },
              { term: "PMS (Portfolio Management Service)", def: "A SEBI-regulated discretionary mandate where a portfolio manager invests directly in your demat account on your behalf. Minimum ticket: ₹50L." },
              { term: "REIT (Real Estate Investment Trust)", def: "A SEBI-regulated trust that owns income-producing real estate, mostly Grade-A commercial. Listed on BSE; pays out ~90% of cash flow as distributions." },
              { term: "Risk Profile", def: "A classification (Conservative / Moderate / Aggressive) based on your time horizon, liquidity needs, and emotional capacity for drawdowns. Drives your asset allocation." },
              { term: "SIP (Systematic Investment Plan)", def: "Auto-debiting a fixed amount each month into a mutual fund. Builds the habit, smooths the entry price (rupee-cost averaging), and removes timing decisions." },
              { term: "STCG (Short-Term Capital Gains)", def: "Profit on an asset sold before the long-term threshold. Taxed at higher rates than LTCG: 15% for listed equity, slab rate for debt funds." },
              { term: "STP (Systematic Transfer Plan)", def: "Periodic transfers from one mutual fund (often a liquid fund) into another (often equity). A way to do staggered lump-sum entry while keeping cash earning interest." },
              { term: "SWP (Systematic Withdrawal Plan)", def: "The reverse of a SIP: periodic redemptions from a mutual fund into your bank account. Common in retirement portfolios." },
              { term: "Unlisted Share", def: "Equity in a company that is not yet listed on a public stock exchange. Liquidity is lower and price discovery happens through private secondary trades." },
              { term: "ULIP (Unit-Linked Insurance Plan)", def: "A hybrid product that mixes life insurance with investing. We don't sell them. They typically underperform on both legs compared to buying term + investing the difference separately." },
              { term: "XIRR (Extended Internal Rate of Return)", def: "IRR for irregular cash flows. The right metric for a SIP or any portfolio where money goes in at different times, most platforms now report XIRR by default." },
              { term: "YTM (Yield to Maturity)", def: "The total annualised return on a bond if held to maturity, accounting for coupons and the difference between purchase price and face value. The single most important number on a bond." }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "insights",
    label: "Market Insights",
    path: "/insights",
    sections: [
      hero(
        "Market Insights",
        "Research, before *the noise.*",
        "Weekly notes from our research desk on Indian equities, debt, unlisted, and global flows."
      ),
      {
        key: "articles",
        label: "Research articles",
        fields: [
          {
            key: "items",
            label: "Articles",
            type: "list",
            fields: [
              f("tag", "Category tag", "text", ""),
              f("title", "Article title", "text", ""),
              f("summary", "Summary / Excerpt", "textarea", ""),
              f("date", "Date published", "text", ""),
              f("read", "Read duration", "text", "5 min read")
            ],
            default: [
              {
                tag: "Equity Strategy",
                title: "After a 12% NIFTY run-up, where do we trim?",
                summary: "Mid-cap valuations have stretched well past their 10-year median P/E. We walk through three positions we're scaling back, the screen we used, and what we're rotating into.",
                date: "May 22, 2026",
                read: "8 min read"
              },
              {
                tag: "Mutual Funds",
                title: "Direct vs. regular plans: the real cost of a 1% expense ratio",
                summary: "Across a 20-year SIP at ₹25,000/month, the difference between a regular and direct plan adds up to ₹38L. We model it scheme-by-scheme.",
                date: "May 18, 2026",
                read: "6 min read"
              },
              {
                tag: "Unlisted",
                title: "Pre-IPO inventory: what's moving and what's not",
                summary: "NSE India and Tata Capital have firm pricing; Pharmeasy and Oyo are still in price discovery. Our quarterly cap-table refresh, with implied valuations.",
                date: "May 14, 2026",
                read: "10 min read"
              },
              {
                tag: "Fixed Income",
                title: "G-Sec curve at 7.18%: buying duration here?",
                summary: "With the RBI on a holding pattern and inflation easing toward target, longer-dated G-Secs are starting to look attractive. The math, the risks, and the alternatives.",
                date: "May 10, 2026",
                read: "7 min read"
              },
              {
                tag: "Tax & Compliance",
                title: "ELSS in May: is the late-tax-saver penalty worth it?",
                summary: "Buying ELSS in March is the worst time of year. Buying in May is among the best. We unpack why, and which schemes survived our quality screen.",
                date: "May 06, 2026",
                read: "5 min read"
              },
              {
                tag: "Behaviour",
                title: "The investor who beat the market: by doing nothing for 3 years",
                summary: "A real portfolio review of one of our investors who hit pause on rebalancing during the 2023–24 run, and outperformed by 3.4% p.a. as a result.",
                date: "May 01, 2026",
                read: "9 min read"
              },
              {
                tag: "Global",
                title: "What rising US yields mean for your Indian portfolio",
                summary: "FII flows, INR-USD, and the import-cost translation, three transmission channels and the asset classes most exposed.",
                date: "Apr 26, 2026",
                read: "6 min read"
              },
              {
                tag: "Insurance",
                title: "Term cover vs. whole-life: still the same answer in 2026",
                summary: "We re-ran the math at 2026 premium tables. The conclusion is unchanged: pure term plus mutual fund SIP beats whole-life by a wide margin.",
                date: "Apr 20, 2026",
                read: "5 min read"
              },
              {
                tag: "Real Estate",
                title: "REITs in 2026: yield is back, but is growth?",
                summary: "Embassy and Mindspace yields have recovered to 7%+, but rental escalations are slowing. We rate the four listed REITs on yield, growth, and balance-sheet strength.",
                date: "Apr 14, 2026",
                read: "7 min read"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "press",
    label: "Press",
    path: "/press",
    sections: [
      hero(
        "Press",
        "Press *resources*",
        "Company facts, brand assets, and media contact for journalists writing about Finvoq."
      ),
      {
        key: "contact",
        label: "Press contact",
        fields: [
          f("heading", "Heading", "text", "Press contact"),
          f("body", "Body copy", "text", "For media enquiries, please email"),
          f("email", "Media email", "text", "press@finvoq.com"),
          f("responseTime", "Response time note", "textarea", "We aim to respond to journalists within four business hours during India trading days.")
        ]
      },
      {
        key: "companyFacts",
        label: "Company facts",
        fields: [
          f("heading", "Heading", "text", "Company facts"),
          {
            key: "facts",
            label: "Facts list",
            type: "list",
            fields: [
              f("label", "Label", "text", ""),
              f("value", "Value", "text", "")
            ],
            default: [
              { label: "Legal name", value: "East Side Global" },
              { label: "Founded", value: "2021" },
              { label: "Headquarters", value: "Delhi, India" },
              { label: "Registration", value: "AMFI Registered Mutual Fund Distributor" },
              { label: "CIN", value: "U67100MH2024PTC999999" },
              { label: "Active investors", value: "400+" },
              { label: "Assets advised", value: "182cr+" },
              { label: "Asset classes covered", value: "Listed equity, unlisted shares, mutual funds, PMS, AIF, bonds, insurance, gold & commodities" }
            ]
          }
        ]
      },
      {
        key: "boilerplate",
        label: "Boilerplate",
        fields: [
          f("heading", "Heading", "text", "Boilerplate"),
          f("text", "Boilerplate description", "textarea", "Finvoq is India's premium investment marketplace. We unify 10+ asset classes (listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds, insurance, fixed deposits, and GIFT City products) into a single advisor-led platform. As an AMFI Registered Mutual Fund Distributor, Finvoq is compensated through trail commission paid by the asset manager. Founded in 2021, headquartered in Delhi.")
        ]
      },
      {
        key: "brandAssets",
        label: "Brand assets",
        fields: [
          f("heading", "Heading", "text", "Brand assets"),
          f("body", "Body copy", "textarea", "Logos, wordmarks, and approved colour palettes are available on request to press@finvoq.com. Please do not modify the wordmark or apply colour treatments not in the brand kit.")
        ]
      },
      {
        key: "founderBios",
        label: "Founder bios",
        fields: [
          f("heading", "Heading", "text", "Founder bios"),
          f("body", "Body copy", "textarea", "Bios for our co-founders, head of advisory, and head of research are available on request. We are happy to arrange interviews with subject-matter experts on India's mutual fund industry, unlisted markets, fixed income, and SEBI's investment-adviser framework.")
        ]
      },
      {
        key: "disclaimer",
        label: "Disclaimer",
        fields: [
          f("note", "Note", "text", "We do not respond to PR pitches or sponsored-post requests through this channel.")
        ]
      }
    ]
  },
  {
    key: "reckoner",
    label: "Advisor Reckoner",
    path: "/reckoner",
    sections: [
      hero(
        "Advisor Toolkit",
        "Marcom & Centricity *Reckoner*",
        "Rate your marketing communication and client engagement across eight levers. Get an instant readiness score and a focused action list."
      ),
      {
        key: "form",
        label: "Reckoner levers & questions",
        fields: [
          f("marcomTitle", "Group 1 title", "text", "Marketing Communication"),
          f("centricityTitle", "Group 2 title", "text", "Client Centricity"),
          {
            key: "questions",
            label: "Assessment questions",
            type: "list",
            fields: [
              f("id", "Identifier", "text", ""),
              f("group", "Group (Marcom / Centricity)", "select", "Marcom", {
                options: ["Marcom", "Centricity"]
              }),
              f("label", "Evaluation question / lever", "text", "")
            ],
            default: [
              { id: "brand", group: "Marcom", label: "Brand & messaging consistency across channels" },
              { id: "content", group: "Marcom", label: "Quality & cadence of educational content" },
              { id: "digital", group: "Marcom", label: "Digital reach (social, email, web) effectiveness" },
              { id: "clarity", group: "Marcom", label: "Clarity & transparency of product communication" },
              { id: "response", group: "Centricity", label: "Speed of response to client queries" },
              { id: "personal", group: "Centricity", label: "Personalisation of advice to client goals" },
              { id: "trust", group: "Centricity", label: "Trust & relationship depth with clients" },
              { id: "retention", group: "Centricity", label: "Proactive reviews & retention efforts" }
            ]
          }
        ]
      },
      {
        key: "results",
        label: "Results note",
        fields: [
          f("note", "Summary explanation note", "textarea", "The reckoner blends your marketing-communication and client-centricity ratings into a single readiness score. Use it to spot the weakest lever and prioritise where to invest next.")
        ]
      }
    ]
  },
  {
    key: "get-started",
    label: "Get Started",
    path: "/get-started",
    sections: [
      {
        key: "hero",
        label: "Page header",
        fields: [
          f("label", "Eyebrow label", "text", "Get Started"),
          f("title", "Heading", "text", "Open your account in *minutes*"),
          f(
            "subtitle",
            "Sub-heading",
            "textarea",
            "Start investing with a simple, guided onboarding process."
          ),
          f("formTitle", "Form title", "text", "Investor Interest Form"),
          f(
            "formNote",
            "Form sub-title",
            "text",
            "Tell us about yourself and we'll get you started."
          ),
          f("formButton", "Submit button", "text", "Submit & Get Started")
        ]
      },
      {
        key: "steps",
        label: "Onboarding steps",
        fields: [
          {
            key: "items",
            label: "Steps",
            type: "list",
            fields: [
              f("title", "Title", "text", ""),
              f("body", "Description", "textarea", "")
            ],
            default: [
              {
                title: "Share your details",
                body: "Basic profile, contact information, and investment preferences."
              },
              {
                title: "Complete KYC verification",
                body: "Aadhaar-based eKYC or upload PAN & address proof, done in under 5 minutes."
              },
              {
                title: "Get matched with an advisor",
                body: "Based on your goals and risk profile, we pair you with the right expert."
              },
              {
                title: "Start investing",
                body: "Access the full marketplace: equities, unlisted, MF, PMS, bonds & more."
              }
            ]
          }
        ]
      }
    ]
  },

  /* ───────────────────────── NRI pages ───────────────────────── */
  {
    key: "nri",
    label: "NRI Corner",
    path: "/nri",
    sections: [
      hero(
        "For Non-Resident Indians",
        "Invest in India, *from anywhere.*",
        "Mutual funds, PMS, AIF, unlisted shares, bonds and Gift City offshore access, with repatriation-aware, FEMA-compliant paperwork."
      ),
      {
        key: "whatYouGet",
        label: "What you get features",
        fields: [
          f("label", "Section label", "text", "What you get"),
          f("title", "Section title", "text", "A complete *NRI investing* desk."),
          {
            key: "items",
            label: "Features list",
            type: "list",
            fields: [
              f("title", "Title", "text", ""),
              f("body", "Description", "textarea", "")
            ],
            default: [
              {
                title: "NRE / NRO / FCNR ready",
                body: "Invest from your NRE (repatriable) or NRO account, with FEMA-compliant execution and full documentation for repatriation."
              },
              {
                title: "Mutual funds & PMS for NRIs",
                body: "Access India-domiciled mutual funds, PMS and AIF strategies open to NRIs, with TDS handling and DTAA guidance built in."
              },
              {
                title: "Unlisted & pre-IPO access",
                body: "Curated unlisted opportunities with off-market transfer into your NRO demat, fully disclosed and compliant."
              },
              {
                title: "Gift City (IFSC) offshore route",
                body: "Invest in USD-denominated global funds through GIFT City: a familiar, IFSCA-regulated framework for NRIs."
              },
              {
                title: "Tax & DTAA support",
                body: "Capital-gains statements, TDS reconciliation, and Double Taxation Avoidance Agreement guidance for your country of residence."
              },
              {
                title: "Dedicated NRI desk",
                body: "A relationship manager who understands time zones, repatriation, and cross-border paperwork: reachable on WhatsApp, email or call."
              }
            ]
          }
        ]
      },
      {
        key: "cta",
        label: "Bottom call-to-action",
        fields: [
          f("title", "Heading", "text", "Distance shouldn’t cost you the India growth story."),
          f("subtitle", "Sub-heading", "textarea", "Our NRI desk handles the paperwork, the compliance, and the tax. You just decide where to invest."),
          f("primaryBtnText", "Primary button label", "text", "Talk to the NRI desk →"),
          f("primaryBtnHref", "Primary button link", "url", "/get-started"),
          f("secondaryBtnText", "Secondary button label", "text", "Explore Gift City"),
          f("secondaryBtnHref", "Secondary button link", "url", "/products/gift-city")
        ]
      }
    ]
  },
  {
    key: "nri-pan",
    label: "NRI: PAN Application",
    path: "/nri/pan-application",
    sections: [
      hero(
        "NRI Services",
        "Get your *Indian PAN card*, wherever you live.",
        "Assisted application for a new Permanent Account Number (PAN): required for investing, property transactions, and tax filing in India."
      ),
      {
        key: "service",
        label: "Service details & process",
        fields: [
          f("serviceName", "Service Name", "text", "PAN Card Application"),
          f("intro", "Introduction paragraph", "textarea", "A PAN is mandatory for NRIs who want to invest in Indian securities, buy or sell property, open a bank or demat account, or file income tax returns in India. We prepare and track your application so you don't have to navigate the forms and documentation yourself."),
          {
            key: "highlights",
            label: "What's included (Highlights)",
            type: "list",
            fields: [
              f("title", "Title", "text", ""),
              f("body", "Description", "textarea", "")
            ],
            default: [
              { title: "Correct form, filled right", body: "NRIs typically apply through Form 49AA. We make sure the right form and applicant category are used from the start." },
              { title: "Document review before submission", body: "We check that your passport, overseas address proof and photograph meet the required format, so your application isn't rejected on a technicality." },
              { title: "Application tracking", body: "We monitor your application status after submission and keep you updated at every stage." },
              { title: "Delivery coordination", body: "Your physical PAN card can be couriered to your overseas address, or you can use the e-PAN for most digital purposes immediately." },
              { title: "No branch visits required", body: "The entire process (documentation, submission, and tracking) is handled online, over email and WhatsApp." }
            ]
          },
          {
            key: "steps",
            label: "Process steps (How it works)",
            type: "list",
            fields: [
              f("title", "Step title", "text", ""),
              f("body", "Step description", "textarea", "")
            ],
            default: [
              { title: "Share your details", body: "Basic personal information, a passport copy, and your current overseas address proof." },
              { title: "We prepare your application", body: "Form 49AA is filled out and cross-checked against your documents for accuracy." },
              { title: "You review and sign", body: "We share the final application with you for confirmation before it's submitted." },
              { title: "Submitted & tracked", body: "Your application is submitted to the PAN issuing authority and tracked through to allotment." }
            ]
          },
          {
            key: "documents",
            label: "Required documents",
            type: "list",
            fields: [
              f("text", "Document requirement", "text", "")
            ],
            default: [
              { text: "Passport copy (all relevant pages)" },
              { text: "Overseas address proof (utility bill, bank statement, or residence permit)" },
              { text: "Passport-size photograph" },
              { text: "OCI/PIO card copy, if applicable" },
              { text: "Proof of an Indian address, if you'd like to register one (optional)" }
            ]
          },
          {
            key: "faqs",
            label: "Frequently asked questions",
            type: "list",
            fields: [
              f("q", "Question", "text", ""),
              f("a", "Answer", "textarea", "")
            ],
            default: [
              { q: "Why does an NRI need a PAN card?", a: "PAN is required to open an NRE/NRO account for investment purposes, invest in mutual funds, shares, PMS or AIF, buy or sell property in India, and file Indian income tax returns." },
              { q: "How long does it take to get a PAN card?", a: "Processing typically takes a couple of weeks from submission, though it can vary depending on document verification and the issuing authority's workload." },
              { q: "Can I apply for a PAN without visiting India?", a: "Yes: the entire application, verification and delivery process can be completed while you're overseas." },
              { q: "What's the difference between Form 49A and Form 49AA?", a: "Form 49A is meant for Indian citizens; Form 49AA is for foreign citizens and, in most cases, NRIs. We determine the correct form for your specific situation before filing." },
              { q: "Can I use an e-PAN instead of a physical card?", a: "For most digital purposes (including e-KYC for investment accounts), the e-PAN (PDF version) is accepted. A physical card can still be couriered if you need one." }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "nri-tax",
    label: "NRI: Tax Filing",
    path: "/nri/tax-filing",
    sections: [
      hero(
        "NRI Services",
        "File your *India income tax* without the stress.",
        "Expert-assisted income tax return filing for Non-Resident Indians: covering NRE/NRO income, capital gains, DTAA relief, and TDS reconciliation."
      ),
      {
        key: "service",
        label: "Service details & process",
        fields: [
          f("serviceName", "Service Name", "text", "NRI Tax Filing"),
          f("intro", "Introduction paragraph", "textarea", "If you earn income in India (rent, interest, dividends, or capital gains from property, mutual funds or shares), you may be required to file an income tax return even as a non-resident. We handle the assessment, the paperwork, and the filing, so you can stay compliant without navigating the Indian tax system yourself."),
          {
            key: "highlights",
            label: "What's included (Highlights)",
            type: "list",
            fields: [
              f("title", "Title", "text", ""),
              f("body", "Description", "textarea", "")
            ],
            default: [
              { title: "Full income coverage", body: "NRE/NRO interest, rental income, capital gains from Indian assets, and dividends: every income source is accounted for in your return." },
              { title: "DTAA relief applied correctly", body: "Where India has a Double Taxation Avoidance Agreement with your country of residence, we apply the relevant relief so the same income isn't taxed twice." },
              { title: "TDS reconciliation", body: "We match tax already deducted by your bank or broker against your Form 26AS / AIS, and claim a refund wherever excess tax was withheld." },
              { title: "Capital gains computed correctly", body: "Short-term and long-term gains on equity, mutual funds and property: computed with indexation applied where it's available." },
              { title: "Filed and acknowledged", body: "Your return is e-filed and verified, so you have a clean compliance record and an acknowledgment you can rely on." },
              { title: "Support after filing", body: "If the Income Tax Department raises a query or notice after filing, we help you understand it and prepare the response." }
            ]
          },
          {
            key: "steps",
            label: "Process steps (How it works)",
            type: "list",
            fields: [
              f("title", "Step title", "text", ""),
              f("body", "Step description", "textarea", "")
            ],
            default: [
              { title: "Share your documents", body: "Send your PAN, Form 26AS/AIS, and your NRE/NRO bank and broker statements for the financial year." },
              { title: "We assess your tax liability", body: "Our team reviews every income source, applicable DTAA benefits, and eligible deductions." },
              { title: "Review & approve", body: "You review a plain-language summary of your computed tax position before anything is filed." },
              { title: "E-file & acknowledge", body: "Your return is filed electronically and the acknowledgment (ITR-V) is shared with you for your records." }
            ]
          },
          {
            key: "documents",
            label: "Required documents",
            type: "list",
            fields: [
              f("text", "Document requirement", "text", "")
            ],
            default: [
              { text: "PAN card copy" },
              { text: "Passport (photo and visa/residency pages)" },
              { text: "Form 26AS / Annual Information Statement (AIS)" },
              { text: "NRE and NRO bank account statements for the financial year" },
              { text: "Capital gains statements from your broker or mutual fund folios, if applicable" },
              { text: "Details of any property sold or rented out in India" },
              { text: "Proof of tax already paid overseas, if you're claiming DTAA relief" }
            ]
          },
          {
            key: "faqs",
            label: "Frequently asked questions",
            type: "list",
            fields: [
              f("q", "Question", "text", ""),
              f("a", "Answer", "textarea", "")
            ],
            default: [
              { q: "Do NRIs need to file income tax returns in India?", a: "If your total taxable income in India exceeds the basic exemption limit, or you want to claim a refund of TDS already deducted, you're required to file a return, even though you're a non-resident for tax purposes." },
              { q: "What is DTAA and how does it help?", a: "The Double Taxation Avoidance Agreement is a treaty India has with most countries. It prevents the same income from being taxed twice (once in India and once in your country of residence), either through an exemption or a tax credit." },
              { q: "Is interest on my NRE account taxable in India?", a: "Interest earned on an NRE account is generally tax-exempt in India for as long as your NRI status holds. Interest on an NRO account, however, is taxable and usually subject to TDS." },
              { q: "What happens if I miss the filing deadline?", a: "Late filing can attract interest and penalties, and may affect your ability to carry forward certain losses. If you've already missed a deadline, we can still help you file a belated return where the law permits it." },
              { q: "Can you help if I've already received a notice from the tax department?", a: "Yes. We review the notice, prepare an appropriate response, and help you resolve it." }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "nri-citizenship",
    label: "NRI: Update Citizenship",
    path: "/nri/update-citizenship",
    sections: [
      hero(
        "NRI Services",
        "Update your *PAN details* to match your NRI status.",
        "Correct your residential status, address, or personal details on an existing PAN card, so your records match your current status as an NRI."
      ),
      {
        key: "service",
        label: "Service details & process",
        fields: [
          f("serviceName", "Service Name", "text", "PAN Citizenship / Status Update"),
          f("intro", "Introduction paragraph", "textarea", "If your residential status has changed (you've recently moved abroad, changed citizenship, or your existing PAN reflects outdated details), keeping your PAN updated helps avoid mismatches when investing, filing taxes, or dealing with your bank in India."),
          {
            key: "highlights",
            label: "What's included (Highlights)",
            type: "list",
            fields: [
              f("title", "Title", "text", ""),
              f("body", "Description", "textarea", "")
            ],
            default: [
              { title: "Residential status correction", body: "Update your PAN record to accurately reflect your resident or non-resident status." },
              { title: "Address updates", body: "Change your registered address on file to your current overseas address." },
              { title: "Name and detail corrections", body: "Fix spelling errors, or update details following a legal name change." },
              { title: "Correction form handled for you", body: "The PAN correction / change-request form is prepared and filed on your behalf, with supporting documents attached." },
              { title: "Tracked until completion", body: "We follow up with the issuing authority and confirm once your updated PAN details are processed." }
            ]
          },
          {
            key: "steps",
            label: "Process steps (How it works)",
            type: "list",
            fields: [
              f("title", "Step title", "text", ""),
              f("body", "Step description", "textarea", "")
            ],
            default: [
              { title: "Tell us what needs updating", body: "Share your current PAN details and what has changed." },
              { title: "We prepare the correction request", body: "The appropriate change-request form is filled out with supporting documents attached." },
              { title: "You review and confirm", body: "We share the final request with you for confirmation before it's submitted." },
              { title: "Filed and confirmed", body: "Once processed, you'll receive your updated PAN details and, if applicable, a reissued card." }
            ]
          },
          {
            key: "documents",
            label: "Required documents",
            type: "list",
            fields: [
              f("text", "Document requirement", "text", "")
            ],
            default: [
              { text: "Copy of your existing PAN card" },
              { text: "Passport copy showing current citizenship/nationality" },
              { text: "Current overseas address proof" },
              { text: "Visa, OCI or residency permit, if the update relates to citizenship or residential status" },
              { text: "Legal documents for any name change (e.g. marriage certificate), if applicable" }
            ]
          },
          {
            key: "faqs",
            label: "Frequently asked questions",
            type: "list",
            fields: [
              f("q", "Question", "text", ""),
              f("a", "Answer", "textarea", "")
            ],
            default: [
              { q: "Why should I update my PAN if my status has changed to NRI?", a: "Banks, brokers and the Income Tax Department cross-check your PAN details. An outdated resident status or address can cause tax to be deducted at the wrong rate, or delay KYC on your investment accounts." },
              { q: "Will I get a new PAN number?", a: "No. A correction request updates the details linked to your existing PAN, the PAN number itself never changes." },
              { q: "How long does a PAN correction take?", a: "It generally takes a couple of weeks after submission, depending on document verification." },
              { q: "Do I need to update my PAN if I only changed my address, not my citizenship?", a: "It's optional but recommended, so your KYC records with banks and brokers stay accurate and correspondence reaches you without delay." },
              { q: "Can this be done entirely online?", a: "Yes: the correction request, document upload and confirmation can all be completed remotely." }
            ]
          }
        ]
      }
    ]
  },

  /* ─────────────────────── Tools & catalog ─────────────────────── */
  {
    key: "calculator",
    label: "SIP Calculator",
    path: "/calculator",
    sections: [
      hero(
        "Calculator",
        "SIP *calculator*",
        "See what a monthly investment can grow into, and adjust until the number feels right."
      ),
      {
        key: "disclaimer",
        label: "Projection disclaimer & notes",
        fields: [
          f("note", "Disclaimer text", "textarea", "Illustrative projection only. Returns are assumed, not guaranteed — actual returns vary with market performance. This is not investment advice.")
        ]
      },
      {
        key: "actions",
        label: "Call to action buttons",
        fields: [
          f("primaryLabel", "Primary button label", "text", "Start this SIP"),
          f("primaryHref", "Primary button link", "url", "/get-started"),
          f("secondaryLabel", "Secondary button label", "text", "Talk to Advisor"),
          f("secondaryHref", "Secondary button link", "url", "/get-started")
        ]
      },
      {
        key: "graph",
        label: "Wealth progression chart",
        fields: [
          f("title", "Chart title", "text", "Wealth Progression"),
          f("subtitle", "Chart subtitle template", "text", "Projected growth over duration")
        ]
      }
    ]
  },
  {
    key: "calculator-lumpsum",
    label: "Lumpsum Calculator",
    path: "/calculator/lumpsum",
    sections: [
      hero(
        "Calculator",
        "Lumpsum *investment calculator*",
        "Compounding turns a one-time deposit into a meaningful corpus over time. Try the numbers below."
      ),
      {
        key: "disclaimer",
        label: "Projection disclaimer & notes",
        fields: [
          f("note", "Disclaimer text", "textarea", "Illustrative projection only. Returns are assumed, not guaranteed — actual returns vary with market performance. This is not investment advice.")
        ]
      },
      {
        key: "actions",
        label: "Call to action buttons",
        fields: [
          f("primaryLabel", "Primary button label", "text", "Invest Lumpsum"),
          f("primaryHref", "Primary button link", "url", "/get-started"),
          f("secondaryLabel", "Secondary button label", "text", "Talk to Advisor"),
          f("secondaryHref", "Secondary button link", "url", "/get-started")
        ]
      }
    ]
  },
  {
    key: "calculator-goal",
    label: "Goal Planner",
    path: "/calculator/goal-planner",
    sections: [
      hero(
        "Calculator",
        "Goal-based *investment planner*",
        "Start with the destination (retirement, a home, your child's education), and work backward to the monthly number."
      ),
      {
        key: "disclaimer",
        label: "Projection disclaimer & notes",
        fields: [
          f("note", "Disclaimer text", "textarea", "Illustrative projection only. Returns are assumed, not guaranteed — actual returns vary with market performance. This is not investment advice.")
        ]
      }
    ]
  },
  {
    key: "calculator-retirement",
    label: "Retirement Calculator",
    path: "/calculator/retirement",
    sections: [
      hero(
        "Calculator",
        "Retirement *calculator*",
        "Secure your future by calculating how much you need to save and invest today for a comfortable retirement."
      ),
      {
        key: "disclaimer",
        label: "Projection disclaimer & notes",
        fields: [
          f("note", "Disclaimer text", "textarea", "Illustrative projection only. Returns are assumed, not guaranteed — actual returns vary with market performance. This is not investment advice.")
        ]
      }
    ]
  },
  {
    key: "calculator-reverse-sip",
    label: "Reverse SIP Calculator",
    path: "/calculator/reverse-sip",
    sections: [
      hero(
        "Reverse SIP Calculator",
        "Enter your goal: get the *monthly SIP.*",
        "Type a target corpus and a time horizon, and we work backward to the exact monthly investment."
      ),
      {
        key: "disclaimer",
        label: "Projection disclaimer & notes",
        fields: [
          f("note", "Disclaimer text", "textarea", "Illustrative projection only. Returns are assumed, not guaranteed — actual returns vary with market performance. This is not investment advice.")
        ]
      }
    ]
  },
  {
    key: "products",
    label: "Products index",
    path: "/products",
    sections: [
      hero(
        "Products",
        "Every asset class, *one platform.*",
        "Equities, mutual funds, PMS, AIF, bonds, FDs, insurance and unlisted shares, each curated and advisory-led."
      )
    ]
  },

  /* ───────────────── Product detail pages ──────────────────────── */
  /*
   * One entry per product. Each product page gets sections for hero, metrics,
   * highlights, how-it-works steps, closing CTA, and related products. The
   * defaults mirror the copy currently hardcoded in productContent.tsx so
   * switching to CMS-driven content is a no-op until the admin actually edits.
   */

  /** Build a full product-page schema entry. */
  ...(function buildProductPages() {
    const productPage = (key, label, pagePath, { shortLabel, heroLabel, heroTitle, heroSubtitle, metrics, highlights, howItWorks, closing, ctaLabel, ctaHref, related, insuranceCards }) => ({
      key,
      label,
      path: pagePath,
      sections: [
        hero(heroLabel, heroTitle, heroSubtitle),
        {
          key: "metrics",
          label: "Metrics cards",
          fields: [
            {
              key: "items",
              label: "Metrics",
              type: "list",
              fields: [
                f("value", "Value", "text", ""),
                f("label", "Label", "text", "")
              ],
              default: metrics
            }
          ]
        },
        {
          key: "highlights",
          label: "Highlight cards (What you get)",
          fields: [
            f("sectionEyebrow", "Section eyebrow", "text", "What you get"),
            f("sectionTitle", "Section heading", "text", `Everything that makes *${shortLabel || label}* simple.`),
            ...(insuranceCards ? [{
              key: "insuranceCards",
              label: "Insurance image cards",
              type: "list",
              fields: [
                f("title", "Title", "text", ""),
                f("img", "Image path", "text", "")
              ],
              default: insuranceCards
            }] : []),
            {
              key: "items",
              label: "Cards",
              type: "list",
              fields: [
                f("title", "Title", "text", ""),
                f("body", "Description", "textarea", "")
              ],
              default: highlights
            }
          ]
        },
        {
          key: "howItWorks",
          label: "How it works steps",
          fields: [
            f("sectionEyebrow", "Section eyebrow", "text", "How it works"),
            f("sectionTitle", "Section heading", "text", "Four steps from *discovery to ownership.*"),
            {
              key: "items",
              label: "Steps",
              type: "list",
              fields: [
                f("step", "Step number", "text", ""),
                f("title", "Title", "text", ""),
                f("body", "Description", "textarea", "")
              ],
              default: howItWorks
            }
          ]
        },
        {
          key: "closing",
          label: "Closing CTA",
          fields: [
            f("text", "Closing text", "textarea", closing),
            f("ctaLabel", "Button label", "text", ctaLabel || ""),
            f("ctaHref", "Button link", "url", ctaHref || "")
          ]
        },
        {
          key: "related",
          label: "Related products",
          fields: [
            {
              key: "items",
              label: "Related product slugs",
              type: "list",
              fields: [
                f("slug", "Product slug", "text", "", {
                  hint: "e.g. mutual-funds, pms, aif, bonds, insurance, fixed-deposits, equities, gift-city"
                })
              ],
              default: (related || []).map(s => ({ slug: s }))
            }
          ]
        }
      ]
    });

    return [
      productPage("product-mutual-funds", "Product: Mutual Funds", "/products/mutual-funds", {
        shortLabel: "Mutual Funds",
        heroLabel: "MUTUAL FUNDS",
        heroTitle: "Build wealth, one SIP at a *time.*",
        heroSubtitle: "Invest across 40+ AMCs and 1,500+ schemes (equity, debt, hybrid, ELSS), all on a single platform with goal-based planning.",
        metrics: [
          { value: "1,500+", label: "Schemes available" },
          { value: "40+", label: "Asset management cos." },
          { value: "₹500", label: "Minimum SIP" }
        ],
        highlights: [
          { title: "SIP & lump sum", body: "Start a SIP from ₹500 a month or invest a lump sum from ₹500. Set up auto-debits in seconds via UPI or NACH." },
          { title: "Goal-based portfolios", body: "Tell us your goal (retirement, a home, your child's education), and our advisors map the right scheme mix and review it quarterly." },
          { title: "ELSS for tax saving", body: "Section 80C deductions up to ₹1.5L, with the shortest 3-year lock-in among tax-saving instruments." },
          { title: "Tax & exit reports", body: "Capital gains statements, XIRR, and exit-load calculators built-in: ready for filing or rebalancing." }
        ],
        howItWorks: [
          { step: "01", title: "Discover", body: "Browse curated lists by category, AMC, or 5-star rating. Filter by expense ratio, fund size, or risk-adjusted returns." },
          { step: "02", title: "Plan", body: "Use our SIP / lumpsum / goal calculators to see how your contributions compound over time at different return assumptions." },
          { step: "03", title: "Invest", body: "One-click investments, auto-debits set up via UPI/NACH, all paperless and Aadhaar-verified." },
          { step: "04", title: "Track", body: "Watch every fund in your unified dashboard with daily NAV, allocation drift alerts, and rebalancing suggestions." }
        ],
        closing: "Whether you're starting your first SIP or rebalancing a ₹50 Cr portfolio, our advisors map your fund mix to your goals, not to ours.",
        ctaLabel: "Start a SIP →",
        ctaHref: "/calculator",
        related: ["pms", "aif", "bonds", "insurance"]
      }),

      productPage("product-pms", "Product: Portfolio Management (PMS)", "/products/pms", {
        shortLabel: "Portfolio Management (PMS)",
        heroLabel: "PORTFOLIO MANAGEMENT (PMS)",
        heroTitle: "Portfolio management for *serious capital.*",
        heroSubtitle: "Discretionary PMS strategies hand-picked for HNI investors. Bespoke mandates, transparent reporting, no hidden trails.",
        metrics: [
          { value: "₹50L", label: "PMS minimum" },
          { value: "20+", label: "Curated strategies" },
          { value: "1 in 8", label: "Onboarding ratio" }
        ],
        highlights: [
          { title: "Curated PMS strategies", body: "We onboard fewer than 1 in 8 PMS strategies we evaluate. Multi-cap, focused, sectoral, contra: only the ones with auditable track records survive." },
          { title: "Statutory minimums", body: "PMS from ₹50L (SEBI mandated). We help you decide which structure fits your tax position and liquidity needs." },
          { title: "Quarterly reviews with the manager", body: "Direct calls with the fund manager: not a relationship sales rep. You hear the thesis from the source." },
          { title: "Consolidated tax reporting", body: "Capital gains, LTCG/STCG: all consolidated across PMS investments." },
          { title: "Estate-aware structuring", body: "Trust, HUF, family-office structures. We coordinate with your CA and lawyer to keep the wrapper tax-efficient." }
        ],
        howItWorks: [
          { step: "01", title: "Risk profiling", body: "A 30-minute call with our advisor to understand your liquidity, time horizon, and existing portfolio gaps." },
          { step: "02", title: "Strategy shortlist", body: "We present 3–5 PMS strategies with full track-record disclosure and direct access to the fund team." },
          { step: "03", title: "Onboarding & funding", body: "Documentation, demat-linked execution, and regulatory disclosures handled end-to-end by our compliance team." },
          { step: "04", title: "Quarterly oversight", body: "Performance reviews, attribution analysis, and rebalancing. We sit with you, not the manufacturer." }
        ],
        closing: "PMS is not a retail product. The right strategy at the wrong moment can lock up capital for years. We help you avoid that.",
        ctaLabel: "Talk to a private-client advisor →",
        ctaHref: "/get-started",
        related: ["aif", "mutual-funds"]
      }),

      productPage("product-aif", "Product: Alternative Investments (AIF)", "/products/aif", {
        shortLabel: "Alternative Investments (AIF)",
        heroLabel: "ALTERNATIVE INVESTMENTS (AIF)",
        heroTitle: "Access sophisticated *private market funds.*",
        heroSubtitle: "SEBI-regulated Alternative Investment Funds for UHNI investors. Private equity, venture capital, and hedge funds with direct access.",
        metrics: [
          { value: "₹1 Cr", label: "AIF minimum" },
          { value: "15+", label: "Curated strategies" },
          { value: "1 in 8", label: "Onboarding ratio" }
        ],
        highlights: [
          { title: "Category I, II & III AIFs", body: "Venture capital, real estate, private credit, long-short equity, structured credit. Direct access to fund managers, no aggregator markups." },
          { title: "Statutory minimums", body: "AIFs from ₹1Cr. We help you evaluate the illiquidity premium and risk profile." },
          { title: "Quarterly reviews with the manager", body: "Direct calls with the fund manager. Hear the thesis straight from the source." },
          { title: "Consolidated tax reporting", body: "Capital gains and K-1 equivalents: all consolidated across AIF investments." },
          { title: "Estate-aware structuring", body: "Trust, HUF, family-office structures: coordinated with your CA and lawyer." }
        ],
        howItWorks: [
          { step: "01", title: "Risk profiling", body: "A 30-minute call with our advisor to understand your liquidity, time horizon, and existing portfolio gaps." },
          { step: "02", title: "Strategy shortlist", body: "We present 3–5 AIF strategies with full track-record disclosure and direct access to the fund team." },
          { step: "03", title: "Onboarding & funding", body: "Documentation, execution, and regulatory disclosures handled end-to-end by our compliance team." },
          { step: "04", title: "Quarterly oversight", body: "Performance reviews, attribution analysis, and rebalancing. We sit with you, not the manufacturer." }
        ],
        closing: "AIFs provide non-correlated returns but come with illiquidity and complexity. We guide you to the right structures.",
        ctaLabel: "Talk to a private-client advisor →",
        ctaHref: "/get-started",
        related: ["pms", "mutual-funds"]
      }),

      productPage("product-bonds", "Product: Bonds & G-Sec", "/products/bonds", {
        shortLabel: "Bonds & G-Sec",
        heroLabel: "BONDS & G-SEC",
        heroTitle: "Predictable income from *regulated debt.*",
        heroSubtitle: "Government securities, AAA corporate bonds, tax-free bonds, sovereign gold bonds, and 54EC capital-gains bonds, all on transparent yield-to-maturity terms.",
        metrics: [
          { value: "7.0–8.5%", label: "Typical YTM range" },
          { value: "AAA", label: "Average credit rating" },
          { value: "₹10,000", label: "Minimum ticket" },
          { value: "Daily", label: "Settlement cycle" }
        ],
        highlights: [
          { title: "Government securities", body: "T-Bills, dated G-Secs, State Development Loans: sovereign-rated, RBI-issued debt with daily liquidity." },
          { title: "AAA & PSU bonds", body: "Hand-picked corporate and PSU issues with credit ratings of AA+ or above. Yield-to-maturity transparent before you buy." },
          { title: "Tax-free bonds", body: "NHAI, REC, IRFC, PFC: interest exempt under Sec 10(15)(iv)(h). Especially attractive in higher tax brackets." },
          { title: "Sovereign Gold Bonds", body: "Earn 2.5% p.a. fixed interest plus the gold price upside: no storage cost, no GST, sovereign-backed." },
          { title: "54EC capital-gains bonds", body: "REC and PFC bonds for ₹50L+ tax exemption on long-term capital gains. 5-year lock-in." },
          { title: "Yield calculators", body: "Live YTM, accrued interest, and post-tax yield comparison so you compare like-for-like across issuers." }
        ],
        howItWorks: [
          { step: "01", title: "Browse the live-yield desk", body: "Filter by maturity, rating, and post-tax yield. Compare a G-Sec to a tax-free bond to a corporate FD side by side." },
          { step: "02", title: "Lock in the rate", body: "Place a buy order and lock the YTM. Settlement happens via RBI's NDS-OM or the BSE bond platform: fully regulated." },
          { step: "03", title: "Earn coupon income", body: "Coupons credit directly to your bank, semi-annually or annually depending on the issue." },
          { step: "04", title: "Hold or trade", body: "Hold to maturity for full principal, or sell on the exchange before maturity. Your call." }
        ],
        closing: "Most Indian portfolios are dangerously equity-heavy. Bonds add the ballast that lets you ride out drawdowns without selling your winners.",
        ctaLabel: "See live yields →",
        ctaHref: "/markets",
        related: ["mutual-funds", "fixed-deposits", "insurance"]
      }),

      productPage("product-insurance", "Product: Insurance", "/products/insurance", {
        shortLabel: "Insurance",
        heroLabel: "INSURANCE",
        heroTitle: "Insurance, the way it *should be sold.*",
        heroSubtitle: "Pure protection products (term life and health), from IRDAI-regulated insurers, recommended on coverage and claim-settlement ratio, never on agent commission.",
        metrics: [
          { value: "14+", label: "IRDAI insurers" },
          { value: "98.5%", label: "Best claim-ratio insurer" },
          { value: "7,500+", label: "Network hospitals" },
          { value: "0", label: "ULIPs sold" }
        ],
        insuranceCards: [
          { title: "Health Care", img: "/health_care.png" },
          { title: "Life Care", img: "/life_care.png" },
          { title: "Motor Care", img: "/motor_care.png" },
          { title: "Home Care", img: "/home_care.png" },
          { title: "Business Insurance", img: "/business_insurance.png" }
        ],
        highlights: [
          { title: "Pure term life", body: "₹1Cr cover for as little as ₹600/month for a healthy 30-year-old. We compare 14+ insurers on premium, claim ratio, and rider quality." },
          { title: "Family floater health", body: "₹10L–₹50L cover with no co-pay, no room-rent caps, and 7,500+ network hospitals. Pre-existing waiver options included." },
          { title: "Top-up & super top-up", body: "Stack a ₹5L base policy with a ₹95L super top-up for ~30% the cost of a single ₹1Cr policy." },
          { title: "Critical illness rider", body: "Lump-sum payout on diagnosis of 30+ critical conditions: independent of hospitalisation." },
          { title: "Claim-ratio first", body: "We rank every insurer by IRDAI's claim-settlement ratio, not by commission. You see the data, you choose." },
          { title: "ULIP-free zone", body: "We do not sell unit-linked or endowment plans. They mix insurance and investing badly. Buy term, invest the difference." }
        ],
        howItWorks: [
          { step: "01", title: "Get your number", body: "Coverage = 15–20× annual income for term, ₹10L+ per family member for health. We help you size it right." },
          { step: "02", title: "Compare", body: "Side-by-side premium, claim ratio, network, and rider quality across 14+ insurers: no sponsored placements." },
          { step: "03", title: "Apply paperless", body: "Aadhaar-based KYC, video medicals where required. Most policies issue in under 72 hours." },
          { step: "04", title: "Claim support", body: "If you ever need to claim, our team escalates to the insurer on your behalf. Documented record of every interaction." }
        ],
        closing: "Insurance protects your investments. We unbundle it from investing, sell pure protection at the right price, and refuse the kickbacks.",
        ctaLabel: "Get a quote →",
        ctaHref: "/get-started",
        related: ["mutual-funds", "bonds", "fixed-deposits"]
      }),

      productPage("product-fixed-deposits", "Product: Fixed Deposits", "/products/fixed-deposits", {
        shortLabel: "Fixed Deposits",
        heroLabel: "FIXED DEPOSITS",
        heroTitle: "Secure, high-yield FDs for *stable returns.*",
        heroSubtitle: "Access a curated selection of corporate and bank fixed deposits. Lock in attractive interest rates with capital protection and predictable cash flows.",
        metrics: [
          { value: "7.5–9.0%", label: "Typical interest range" },
          { value: "AAA/AA+", label: "Credit ratings" },
          { value: "₹10,000", label: "Minimum investment" },
          { value: "0", label: "Hidden fees" }
        ],
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
        closing: "Fixed deposits remain the bedrock of a conservative portfolio. By accessing corporate FDs, you can significantly enhance your yield without taking on equity market risk.",
        ctaLabel: "",
        ctaHref: "",
        related: ["bonds", "mutual-funds", "insurance"]
      }),

      productPage("product-equities", "Product: Listed Equities", "/products/equities", {
        shortLabel: "Listed Equities",
        heroLabel: "LISTED EQUITIES",
        heroTitle: "Direct shares, with *research that holds up.*",
        heroSubtitle: "Trade and invest in BSE-listed equities with live price feeds, watchlists, sparklines, and curated research, backed by execution at exchange best-bid.",
        metrics: [
          { value: "250+", label: "Stocks under coverage" },
          { value: "Live", label: "Price feeds" },
          { value: "T+1", label: "Settlement" },
          { value: "0", label: "Hidden charges" }
        ],
        highlights: [
          { title: "Live market data", body: "Real-time bid/ask, depth, and intraday sparklines on every stock card. No 15-minute delay." },
          { title: "Curated coverage", body: "We track ~250 stocks across NIFTY, NEXT 50, midcap, and high-quality smallcap. Quarterly updates after every result." },
          { title: "Smart watchlist", body: "Persistent watchlist that follows you across devices, with custom alerts on price, P/E, or earnings dates." },
          { title: "Direct execution", body: "Orders route to BSE via SEBI-registered partner brokers: no aggregator latency, no markup." },
          { title: "Tax-loss harvesting hints", body: "Year-end suggestions to offset gains by realising losses on positions we'd planned to exit anyway." },
          { title: "Quality scoring", body: "Each stock is scored on profitability, balance sheet, and capital-allocation discipline: not just price momentum." }
        ],
        howItWorks: [
          { step: "01", title: "Discover", body: "Filter by sector, market cap, momentum, or our internal quality score. Add to watchlist with one click." },
          { step: "02", title: "Research", body: "Read our quarterly notes, view 5-year financial trends, and check insider/promoter activity." },
          { step: "03", title: "Execute", body: "Place a market or limit order: settles via partner broker into your demat account directly." },
          { step: "04", title: "Track", body: "Position-level P&L, dividend history, and rebalancing prompts when allocations drift." }
        ],
        closing: "Direct equity is the highest-return asset class over long periods, and the easiest one to ruin with bad behaviour. Our role is to keep you on the right side of the data.",
        ctaLabel: "Browse the markets →",
        ctaHref: "/markets",
        related: ["mutual-funds", "bonds"]
      }),

      productPage("product-loan-against-mutual-funds", "Product: Loan Against Mutual Funds", "/products/loan-against-mutual-funds", {
        shortLabel: "Loan Against Mutual Funds",
        heroLabel: "LOAN AGAINST MUTUAL FUNDS",
        heroTitle: "Unlock liquidity *without selling.*",
        heroSubtitle: "Pledge your mutual fund units and get an instant overdraft at interest rates far below a personal loan, while your investments stay invested and keep compounding.",
        metrics: [
          { value: "~9%*", label: "Interest from (p.a.)" },
          { value: "80%*", label: "Max loan-to-value" },
          { value: "₹1 Cr+*", label: "Sanction limits" },
          { value: "24 hrs*", label: "Typical disbursal" }
        ],
        highlights: [
          { title: "Stay invested", body: "Your units are only pledged, never sold. You keep the upside, dividends, and long-term compounding while borrowing against them." },
          { title: "Rates from ~9% p.a.*", body: "Interest is charged only on the amount you use, not the full sanctioned limit: dramatically cheaper than personal loans or credit cards." },
          { title: "Instant digital pledge", body: "Pledge equity or debt funds online via CAMS/KFintech in minutes. No paperwork, no branch visit, no income proof for most limits." },
          { title: "Overdraft, not EMI", body: "Draw and repay any amount, any time. Interest accrues only on the outstanding balance: ideal for short-term cash-flow gaps." },
          { title: "Loan-to-value up to 50–80%", body: "Borrow up to 80% against debt funds and up to 50% against equity funds, subject to lender norms and scheme eligibility." },
          { title: "No prepayment penalty", body: "Repay whenever you like without charges. Unpledge your units the moment the outstanding is cleared." }
        ],
        howItWorks: [
          { step: "01", title: "Check eligibility", body: "Share your mutual fund holdings. We compute your sanctioned limit across eligible equity and debt schemes instantly." },
          { step: "02", title: "Pledge online", body: "Authorise the lien digitally through CAMS/KFintech with an OTP. Your units are marked as pledged. You still own them." },
          { step: "03", title: "Draw funds", body: "The overdraft limit is activated in your account. Withdraw part or all of it whenever you need liquidity." },
          { step: "04", title: "Repay flexibly", body: "Pay interest only on what you use. Clear the balance any time and release the pledge on your units." }
        ],
        closing: "Selling good funds to raise cash is a decision you often regret at the next market high. A loan against mutual funds keeps you invested and liquid at the same time.",
        ctaLabel: "Check my LAMF limit →",
        ctaHref: "/get-started",
        related: ["mutual-funds", "pms", "bonds"]
      }),

      productPage("product-gift-city", "Product: Gift City (IFSC)", "/products/gift-city", {
        shortLabel: "Gift City (IFSC)",
        heroLabel: "GIFT CITY (IFSC)",
        heroTitle: "Invest offshore, *from onshore India.*",
        heroSubtitle: "Access global markets, USD-denominated funds, and IFSC-regulated structures through GIFT City (India's International Financial Services Centre), with resident and NRI-friendly routing.",
        metrics: [
          { value: "USD", label: "Base currency" },
          { value: "IFSCA", label: "Regulator" },
          { value: "Global", label: "Market access" },
          { value: "NRI +", label: "Resident routing" }
        ],
        highlights: [
          { title: "USD-denominated investing", body: "Invest in global equities, US-listed ETFs, and offshore funds in dollars through IFSC units at GIFT City: a clean, regulated route out of INR." },
          { title: "IFSCA-regulated", body: "Every structure sits under the International Financial Services Centres Authority: a dedicated unified regulator, not a grey-market workaround." },
          { title: "Tax-efficient wrappers", body: "GIFT City funds and structures enjoy specific exemptions and concessional rates designed to make offshore access competitive with Singapore or Dubai." },
          { title: "LRS & NRI routing", body: "Residents can route via the Liberalised Remittance Scheme; NRIs and foreign investors get a familiar, English-law-adjacent framework." },
          { title: "Global diversification", body: "Hold assets outside the rupee and the Indian cycle: US tech, global bonds, and multi-currency portfolios in one IFSC account." },
          { title: "Institutional custody", body: "Assets are held with IFSC-registered custodians and administrators, with reporting built for HNI and family-office needs." }
        ],
        howItWorks: [
          { step: "01", title: "Eligibility & structure", body: "We assess whether an LRS remittance, an NRI route, or a fund structure fits your residency and objective." },
          { step: "02", title: "Open an IFSC account", body: "KYC and onboarding with an IFSC-registered intermediary at GIFT City: handled end-to-end by our desk." },
          { step: "03", title: "Fund & allocate", body: "Remit in USD and allocate across global funds, ETFs, or bespoke offshore mandates." },
          { step: "04", title: "Consolidated reporting", body: "Track your onshore and GIFT City holdings together, with tax-ready statements across jurisdictions." }
        ],
        closing: "GIFT City turns offshore investing from a compliance headache into a regulated, tax-aware decision: the same global access, without leaving the Indian framework.",
        ctaLabel: "Explore Gift City options →",
        ctaHref: "/get-started",
        related: ["pms", "aif", "mutual-funds", "bonds"]
      })
    ];
  })(),

  {
    key: "unlisted",
    label: "Unlisted Shares",
    path: "/unlisted",
    sections: [
      hero(
        "Unlisted",
        "Own tomorrow's listings, *today.*",
        "Pre-IPO and unlisted opportunities, diligence-checked and available in your own demat account."
      ),
      {
        key: "deal",
        label: "Deal of the Day",
        fields: [
          f("eyebrow", "Eyebrow label", "text", "Deal of the Day"),
          f("title", "Company Name", "text", "HDFC Securities"),
          f("subtitle", "Subtitle", "text", "High Growth Potential")
        ]
      },
      {
        key: "hot",
        label: "Hot Opportunity",
        fields: [
          f("eyebrow", "Eyebrow label", "text", "Hot Opportunity"),
          f("title", "Company Name", "text", "NSE India"),
          f("subtitle", "Subtitle", "text", "Pre-IPO Access")
        ]
      },
      {
        key: "whatsapp",
        label: "WhatsApp Button",
        fields: [
          f("label", "Button Text", "text", "Join our WhatsApp Community"),
          f("link", "WhatsApp Link", "url", "https://chat.whatsapp.com/Iw7tEFsgfEp74Vbl5MwE5J")
        ]
      }
    ]
  },
  {
    key: "markets",
    label: "Markets",
    path: "/markets",
    sections: [
      hero(
        "Markets",
        "Live BSE *prices.*",
        "Track every listed share with real-time quotes, charts and your own watchlist."
      )
    ]
  },
  {
    key: "news",
    label: "News",
    path: "/news",
    sections: [
      hero(
        "News",
        "Markets, *decoded.*",
        "Company news, market moves and the context behind them."
      )
    ]
  },
  {
    key: "investor-zone",
    label: "Investor Zone",
    path: "/investor-zone",
    sections: [
      hero(
        "Investor Zone",
        "Every tool an investor needs, *in one place.*",
        "Your command center: live markets, calculators, fund performance, unlisted access and research, curated for the Visionary Trailblazers community."
      ),
      {
        key: "tools",
        label: "Investor tools & links",
        fields: [
          {
            key: "items",
            label: "Tools",
            type: "list",
            fields: [
              f("href", "Link target", "url", ""),
              f("title", "Tool title", "text", ""),
              f("body", "Tool description", "textarea", ""),
              f("cta", "Button / link label", "text", ""),
              f("icon", "Icon identifier", "text", "i-trending-up")
            ],
            default: [
              {
                href: "/markets",
                title: "Live Markets",
                body: "Track indices, equities and real-time quotes on BSE with charts and watchlists.",
                cta: "Open markets",
                icon: "i-trending-up"
              },
              {
                href: "/watchlist",
                title: "My Watchlist",
                body: "Save the stocks, funds and unlisted names you care about and follow them in one place.",
                cta: "View watchlist",
                icon: "i-star"
              },
              {
                href: "/#mf-performance",
                title: "MF Performance",
                body: "See top-performing mutual funds ranked by 1Y, 3Y and 5Y returns, tracked by our desk.",
                cta: "See fund rankings",
                icon: "i-bar-chart"
              },
              {
                href: "/calculator",
                title: "SIP Calculator",
                body: "Model how monthly SIPs compound over time at different return and duration assumptions.",
                cta: "Calculate SIP",
                icon: "i-coin"
              },
              {
                href: "/calculator/reverse-sip",
                title: "Reverse SIP Calculator",
                body: "Start from a target corpus and work backward to the exact monthly SIP you need.",
                cta: "Plan my goal",
                icon: "i-grid"
              },
              {
                href: "/unlisted",
                title: "Unlisted Shares",
                body: "Explore curated pre-IPO and unlisted opportunities with transparent pricing.",
                cta: "Browse unlisted",
                icon: "i-lock"
              },
              {
                href: "/reckoner",
                title: "Marcom & Centricity Reckoner",
                body: "Score your marketing communication and client-centricity and see where to improve.",
                cta: "Run the reckoner",
                icon: "i-gem"
              },
              {
                href: "/news",
                title: "Market News",
                body: "The latest financial news aggregated from Yahoo India Finance and leading wires.",
                cta: "Read the news",
                icon: "i-building"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "contact",
    label: "Contact",
    path: "/contact",
    sections: [
      hero(
        "Contact",
        "Talk to a *real person.*",
        "Advice is the product. Ask us anything — about a specific fund, a mandate you're weighing up, or an investment you already hold."
      ),
      {
        key: "form",
        label: "Contact form header",
        fields: [
          f("title", "Form title", "text", "Send us a message"),
          f("subtitle", "Form subtitle", "textarea", "We reply within one working day.")
        ]
      },
      {
        key: "grievance",
        label: "Grievances card",
        fields: [
          f("title", "Card title", "text", "Grievances"),
          f("body", "Card description", "textarea", "If we haven't resolved something to your satisfaction, our grievance procedure and escalation path are set out here."),
          f("linkLabel", "Link label", "text", "Grievance redressal →"),
          f("linkHref", "Link target", "url", "/legal/grievance")
        ]
      },
      {
        key: "regulatory",
        label: "Regulatory card",
        fields: [
          f("title", "Card title", "text", "Regulatory registration"),
          f("note", "Note text", "textarea", "Quote our EUIN on every transaction. It ties the advice you received to the person who gave it.")
        ]
      },
      {
        key: "office",
        label: "Office location & Google Map",
        fields: [
          f("eyebrow", "Eyebrow label", "text", "Headquarters"),
          f("title", "Section title", "text", "Visit Our Office"),
          f("addressTitle", "Address label", "text", "Registered office"),
          f("address", "Registered office address", "textarea", "B-5, Ashoka Chambers, G/F, Pusa Rd, Block A, Rajendra Park, Rajendra Place, New Delhi, Delhi, 110060"),
          f("landmark", "Landmark / Metro hint", "text", "Near Rajendra Place Metro Station (Blue Line) · Pusa Road"),
          f("mapUrl", "Google Map link", "url", "https://maps.google.com/?q=B-5,+Ashoka+Chambers,+G/F,+Pusa+Rd,+Block+A,+Rajendra+Park,+Rajendra+Place,+New+Delhi,+Delhi+110060"),
          f("mapEmbedUrl", "Google Map embed iframe URL", "url", "https://maps.google.com/maps?q=B-5,+Ashoka+Chambers,+G/F,+Pusa+Rd,+Block+A,+Rajendra+Park,+Rajendra+Place,+New+Delhi,+Delhi+110060&t=&z=16&ie=UTF8&iwloc=&output=embed")
        ]
      }
    ]
  },

  /* ──────────────────────── Global chrome ──────────────────────── */
  {
    key: "global",
    label: "Global (nav, footer, WhatsApp & social)",
    path: "/",
    sections: [
      /* ── Navigation bar ──
         Two flat lists rather than one nested one: the admin editor renders a
         list's rows with plain inputs and has no widget for a list inside a
         list. Children therefore name their parent by its exact top-level
         label, which is also the thing an admin can see on the page. */
      {
        key: "nav",
        label: "Navigation — menu items",
        fields: [
          {
            key: "items",
            label: "Top-level menu items",
            type: "list",
            fields: [
              f("label", "Label", "text", ""),
              f("href", "Link target", "url", "")
            ],
            default: [
              { label: "Watchlist", href: "/watchlist" },
              { label: "Products", href: "/products" },
              { label: "Unlisted", href: "/unlisted" },
              { label: "NRI Corner", href: "/nri" },
              { label: "Calculators", href: "/calculator" },
              { label: "News", href: "/news" }
            ]
          },
          {
            key: "dropdown",
            label: "Dropdown links",
            type: "list",
            hint:
              'Set "Parent menu item" to the exact label of the top-level item this link belongs under (e.g. Products).',
            fields: [
              f("parent", "Parent menu item", "text", ""),
              f("label", "Label", "text", ""),
              f("href", "Link target", "url", "")
            ],
            default: [
              { parent: "Products", label: "Mutual Funds", href: "/products/mutual-funds" },
              { parent: "Products", label: "Portfolio Management (PMS)", href: "/products/pms" },
              { parent: "Products", label: "Alternative Investments (AIF)", href: "/products/aif" },
              { parent: "Products", label: "Bonds & G-Sec", href: "/products/bonds" },
              { parent: "Products", label: "Insurance", href: "/products/insurance" },
              { parent: "Products", label: "Fixed Deposits", href: "/products/fixed-deposits" },
              { parent: "Products", label: "Gift City", href: "/products/gift-city" },
              { parent: "Calculators", label: "SIP Calculator", href: "/calculator" },
              { parent: "Calculators", label: "Lumpsum Calculator", href: "/calculator/lumpsum" },
              { parent: "Calculators", label: "Retirement Calculator", href: "/calculator/retirement" },
              { parent: "Calculators", label: "Goal Planner", href: "/calculator/goal-planner" }
            ]
          },
          f("loginLabel", "Login button", "text", "Login"),
          f("loginEnabled", "Show login button", "select", "yes", {
            options: ["yes", "no"]
          }),
          f("signupLabel", "Sign-up button", "text", "Open Account"),
          f("signupHref", "Sign-up button target", "url", "/signup"),
          f("signupEnabled", "Show sign-up button", "select", "yes", {
            options: ["yes", "no"]
          })
        ]
      },
      /* The NRI item opens a bespoke two-column mega menu, so its contents
         live apart from the plain `dropdown` list above. */
      {
        key: "navNri",
        label: "Navigation — NRI mega menu",
        fields: [
          f("investLabel", "Left column heading", "text", "Investment"),
          {
            key: "investLinks",
            label: "Left column links",
            type: "list",
            fields: [
              f("label", "Label", "text", ""),
              f("href", "Link target", "url", "")
            ],
            default: [
              { label: "Mutual Funds", href: "/products/mutual-funds" },
              { label: "Portfolio Management (PMS)", href: "/products/pms" },
              { label: "Alternative Investments (AIF)", href: "/products/aif" },
              { label: "Unlisted Shares", href: "/unlisted" },
              { label: "Gift City Offshore", href: "/products/gift-city" },
              { label: "Bonds & G-Sec", href: "/products/bonds" }
            ]
          },
          f("servicesLabel", "Right column heading", "text", "NRI Services"),
          {
            key: "services",
            label: "Right column service cards",
            type: "list",
            fields: [
              f("title", "Title", "text", ""),
              f("body", "Description", "textarea", ""),
              f("href", "Link target", "url", "")
            ],
            default: [
              {
                title: "India Tax Filing",
                body: "File your income tax in India with expert support",
                href: "/nri/tax-filing"
              },
              {
                title: "Apply for PAN",
                body: "Get your PAN card quickly and hassle-free",
                href: "/nri/pan-application"
              },
              {
                title: "Update Citizenship",
                body: "Keep your records accurate across financial systems",
                href: "/nri/update-citizenship"
              }
            ]
          }
        ]
      },
      /* ── WhatsApp ──
         Drives the floating chat button, both footers, /contact and the
         unlisted invest modal. One number, edited in one place. */
      {
        key: "whatsapp",
        label: "WhatsApp chat",
        fields: [
          f("number", "Number (digits only, with country code)", "text", "919811295656", {
            hint: "No '+', spaces or dashes. Example: 919811295656 for +91 98112 95656."
          }),
          f("display", "Number as displayed", "text", "+91 98112 95656"),
          f(
            "message",
            "Pre-filled first message",
            "textarea",
            "Hi Finvoq team! I'd like to know more about investing through your platform."
          ),
          f("buttonLabel", "Floating button label", "text", "Chat with us"),
          f("enabled", "Show the floating button", "select", "yes", {
            options: ["yes", "no"]
          })
        ]
      },
      /* ── Social ──
         A list, not one field per network, so a profile can be removed
         outright: an icon row with a dead link reads worse than no row. */
      {
        key: "social",
        label: "Social links",
        fields: [
          {
            key: "items",
            label: "Profiles",
            type: "list",
            hint: 'Platform must be one of: linkedin, instagram, x, whatsapp, facebook, youtube.',
            fields: [
              f("platform", "Platform", "select", "linkedin", {
                options: ["linkedin", "instagram", "x", "whatsapp", "facebook", "youtube"]
              }),
              f("href", "Profile URL", "url", "", {
                hint: "Leave blank on the WhatsApp row to use the number above."
              })
            ],
            default: [
              { platform: "linkedin", href: "https://www.linkedin.com/company/finvoq/" },
              {
                platform: "instagram",
                href: "https://www.instagram.com/finvoq?igsh=Z2NjZmdxZW9rNHlx"
              },
              { platform: "whatsapp", href: "" }
            ]
          }
        ]
      },
      {
        key: "footer",
        label: "Site footer",
        fields: [
          f("newsletterEnabled", "Show newsletter section", "select", "yes", {
            options: ["yes", "no"]
          }),
          f(
            "blurb",
            "Brand blurb",
            "textarea",
            "India's premium investment marketplace. Multiple asset classes, one platform, advisory-led."
          ),
          f(
            "badge",
            "Registration badge",
            "text",
            "AMFI Registered Mutual Fund Distributor — ARN-346787"
          ),
          f("badgeEnabled", "Show registration badge", "select", "yes", {
            options: ["yes", "no"]
          }),
          f("newsletterTitle", "Newsletter heading", "text", "Get the weekly market brief."),
          f(
            "newsletterBody",
            "Newsletter body",
            "textarea",
            "Curated insights from our research team, every Monday before markets open. No promotions, no spam, ever."
          ),
          f("copyright", "Copyright line", "text", "Finvoq Wealth Pvt. Ltd. All rights reserved."),
          f("madeIn", "Location line", "text", "Crafted with care · Delhi, India")
        ]
      },
      /* Four link columns, one list each. Kept as separate lists rather than
         one list with a "column" key so reordering inside a column is a
         single move in the editor instead of a hunt through 25 mixed rows. */
      {
        key: "footerLinks",
        label: "Footer link columns",
        fields: [
          f("col1Title", "Column 1 heading", "text", "Products"),
          {
            key: "col1",
            label: "Column 1 links",
            type: "list",
            fields: [f("label", "Label", "text", ""), f("href", "Link target", "url", "")],
            default: [
              { label: "Equities", href: "/products/equities" },
              { label: "Mutual Funds", href: "/products/mutual-funds" },
              { label: "PMS", href: "/products/pms" },
              { label: "AIF", href: "/products/aif" },
              { label: "FDs", href: "/products/fixed-deposits" },
              { label: "Bonds", href: "/products/bonds" },
              { label: "Insurance", href: "/products/insurance" },
              { label: "Unlisted", href: "/unlisted" }
            ]
          },
          f("col2Title", "Column 2 heading", "text", "Company"),
          {
            key: "col2",
            label: "Column 2 links",
            type: "list",
            fields: [f("label", "Label", "text", ""), f("href", "Link target", "url", "")],
            default: [
              { label: "About", href: "/about" },
              { label: "Investor stories", href: "/stories" },
              { label: "FAQ", href: "/faq" },
              { label: "Get started", href: "/get-started" },
              { label: "Careers", href: "/careers" },
              { label: "Contact", href: "/contact" }
            ]
          },
          f("col3Title", "Column 3 heading", "text", "Resources"),
          {
            key: "col3",
            label: "Column 3 links",
            type: "list",
            fields: [f("label", "Label", "text", ""), f("href", "Link target", "url", "")],
            default: [
              { label: "News", href: "/news" },
              { label: "SIP Calculator", href: "/calculator" },
              { label: "Lumpsum Calculator", href: "/calculator/lumpsum" },
              { label: "Goal Planner", href: "/calculator/goal-planner" },
              { label: "Market Insights", href: "/insights" },
              { label: "Glossary", href: "/glossary" }
            ]
          },
          f("col4Title", "Column 4 heading", "text", "Legal"),
          {
            key: "col4",
            label: "Column 4 links",
            type: "list",
            fields: [f("label", "Label", "text", ""), f("href", "Link target", "url", "")],
            default: [
              { label: "Terms of service", href: "/legal/terms" },
              { label: "Privacy policy", href: "/legal/privacy" },
              { label: "Risk disclosure", href: "/legal/risk-disclosure" },
              { label: "Grievance redressal", href: "/legal/grievance" },
              { label: "Investor charter", href: "/legal/investor-charter" }
            ]
          }
        ]
      },
      {
        key: "contact",
        label: "Contact details",
        fields: [
          f("email", "Email", "text", "info@finvoq.com"),
          f("phone", "Phone (dial target)", "text", "+919811295656"),
          f("phoneDisplay", "Phone (as displayed)", "text", "+91 98112 95656"),
          f("hours", "Working hours", "text", "Monday to Friday, 9:30am – 6:30pm IST"),
          f("address", "Registered office", "textarea", "B-5, Ashoka Chambers, G/F, Pusa Rd, Block A, Rajendra Park, Rajendra Place, New Delhi, Delhi, 110060"),
          f("mapUrl", "Google Map link", "url", "https://maps.google.com/?q=B-5,+Ashoka+Chambers,+G/F,+Pusa+Rd,+Block+A,+Rajendra+Park,+Rajendra+Place,+New+Delhi,+Delhi+110060"),
          f("mapEmbedUrl", "Google Map embed iframe URL", "url", "https://maps.google.com/maps?q=B-5,+Ashoka+Chambers,+G/F,+Pusa+Rd,+Block+A,+Rajendra+Park,+Rajendra+Place,+New+Delhi,+Delhi+110060&t=&z=16&ie=UTF8&iwloc=&output=embed")
        ]
      }
    ]
  }
];

/* ── Helpers ─────────────────────────────────────────────────────── */

const PAGE_BY_KEY = new Map(PAGES.map((p) => [p.key, p]));

/** The full default content object for one page. */
function defaultsFor(pageKey) {
  const page = PAGE_BY_KEY.get(pageKey);
  if (!page) return null;
  const out = {};
  for (const section of page.sections) {
    const s = {};
    for (const field of section.fields) {
      s[field.key] = field.type === "list" ? field.default || [] : field.default;
    }
    out[section.key] = s;
  }
  return out;
}

/**
 * Merge saved overrides on top of the defaults, keeping only keys the schema
 * knows about. A field the admin left blank falls back to its default, so a
 * page can never render an empty heading.
 */
function merge(pageKey, saved) {
  const page = PAGE_BY_KEY.get(pageKey);
  if (!page) return null;
  const base = defaultsFor(pageKey);
  if (!saved || typeof saved !== "object") return base;

  for (const section of page.sections) {
    const savedSection = saved[section.key];
    if (!savedSection || typeof savedSection !== "object") continue;
    for (const field of section.fields) {
      const v = savedSection[field.key];
      if (v === undefined || v === null) continue;
      if (field.type === "list") {
        if (!Array.isArray(v)) continue;
        // Keep only the row keys this list declares.
        base[section.key][field.key] = v.map((row) => {
          const clean = {};
          for (const sub of field.fields) {
            clean[sub.key] = typeof row?.[sub.key] === "string" ? row[sub.key] : "";
          }
          return clean;
        });
      } else if (typeof v === "string") {
        base[section.key][field.key] = v.trim() === "" ? field.default : v;
      }
    }
  }
  return base;
}

/** Schema shipped to the admin editor (no need to duplicate it client-side). */
function publicSchema() {
  return PAGES.map((p) => ({
    key: p.key,
    label: p.label,
    path: p.path,
    sections: p.sections.map((s) => ({
      key: s.key,
      label: s.label,
      fields: s.fields
    }))
  }));
}

module.exports = {
  PAGES,
  pageKeys: () => PAGES.map((p) => p.key),
  hasPage: (k) => PAGE_BY_KEY.has(k),
  defaultsFor,
  merge,
  publicSchema
};

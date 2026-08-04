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
          f("ctaPrimaryHref", "Primary button target", "url", "/signup")
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
              { v: "₹182Cr+", l: "Assets managed" },
              { v: "4,000+", l: "Trusted investors" },
              { v: "10+", l: "Product categories" },
              { v: "10 yrs+", l: "Industry experience" }
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
      )
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
      )
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
      )
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
      )
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
      )
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
      )
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
      )
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
      )
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
      )
    ]
  },
  {
    key: "nri-pan",
    label: "NRI: PAN Application",
    path: "/nri/pan-application",
    sections: [
      hero(
        "NRI Services",
        "Apply for a *PAN card.*",
        "A PAN is mandatory for investing in India. We handle the application end to end."
      )
    ]
  },
  {
    key: "nri-tax",
    label: "NRI: Tax Filing",
    path: "/nri/tax-filing",
    sections: [
      hero(
        "NRI Services",
        "Income tax filing, *handled.*",
        "Residency-aware filing, DTAA relief and capital-gains reporting for non-residents."
      )
    ]
  },
  {
    key: "nri-citizenship",
    label: "NRI: Update Citizenship",
    path: "/nri/update-citizenship",
    sections: [
      hero(
        "NRI Services",
        "Update your *residency status.*",
        "Convert resident folios and demat accounts to NRI status without freezing your portfolio."
      )
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
      )
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
      )
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
      )
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
      )
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
      )
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
        "Everything you need, *in one place.*",
        "Tools, statements, factsheets and resources for existing Finvoq investors."
      )
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
          f("signupLabel", "Sign-up button", "text", "Open Account"),
          f("signupHref", "Sign-up button target", "url", "/signup")
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
          f("address", "Registered office", "textarea", "Delhi, India")
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

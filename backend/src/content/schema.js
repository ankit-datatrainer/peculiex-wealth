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
          f("titleA", "Headline (line 1)", "text", "India's Curated Investment"),
          f("titleB", "Headline (line 2)", "text", "Marketplace meets"),
          f("titleAccent", "Headline accent word", "text", "Advisory."),
          f("portrait", "Advisor portrait", "image", "/homeclone-portrait.jpg"),
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
          f("phoneChip", "Phone chip", "text", "+18.2%")
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
                desc: "From research to investing, completed in seconds. Live NSE & BSE prices, no paperwork, no waiting."
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
          )
        ]
      },
      {
        key: "news",
        label: "News teasers",
        fields: [
          f("title", "Heading", "text", "Latest from Finvoq."),
          f("linkLabel", "Link text", "text", "All news"),
          {
            key: "items",
            label: "Cards",
            type: "list",
            fields: [
              f("tag", "Tag", "text", ""),
              f("date", "Date badge", "text", ""),
              f("title", "Headline", "textarea", "")
            ],
            default: [
              {
                tag: "Markets",
                date: "Live",
                title:
                  "Track every NSE & BSE share with real-time prices and watchlists"
              },
              {
                tag: "Insights",
                date: "Weekly",
                title:
                  "How our advisors curate unlisted opportunities before they list"
              },
              {
                tag: "Company",
                date: "Beta",
                title:
                  "Finvoq opens its doors: India's advisory-led investment marketplace"
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
            "SEBI Registered Investment Distributor"
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
  {
    key: "unlisted",
    label: "Unlisted Shares",
    path: "/unlisted",
    sections: [
      hero(
        "Unlisted",
        "Own tomorrow's listings, *today.*",
        "Pre-IPO and unlisted opportunities, diligence-checked and available in your own demat account."
      )
    ]
  },
  {
    key: "markets",
    label: "Markets",
    path: "/markets",
    sections: [
      hero(
        "Markets",
        "Live NSE & BSE *prices.*",
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
  {
    key: "resources-mf",
    label: "Mutual Fund Resources",
    path: "/resources/mutual-funds",
    sections: [
      hero(
        "Resources",
        "Mutual fund *tools & data.*",
        "NAVs, factsheets, performance comparisons and SIP history in one place."
      )
    ]
  },

  /* ──────────────────────── Global chrome ──────────────────────── */
  {
    key: "global",
    label: "Global (footer & contact)",
    path: "/about",
    sections: [
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
            "SEBI Registered Investment Distributor"
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
      {
        key: "contact",
        label: "Contact details",
        fields: [
          f("email", "Email", "text", "hello@finvoq.com"),
          f("phone", "Phone", "text", "+91 22 4900 0000"),
          f("hours", "Working hours", "text", "Mon–Fri 10am–6pm IST"),
          f("address", "Address", "textarea", "Delhi, India")
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

# Peculiex — Wealth Management Platform

India's investment marketplace, built as a full **Next.js + Express +
Supabase Postgres** stack.

The app is split into two services: `frontend/` (Next.js 14 App Router) and
`backend/` (Express REST API). The frontend runs on port 3000 and the
backend on port 4000.

## Stack

| Layer    | Tech                                                |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript · SWR |
| Backend  | Node.js · Express 4 · Zod · express-rate-limit       |
| Database | Supabase (Postgres) — accessed via `@supabase/supabase-js` with the service-role key |
| Styles   | The original `styles.css` (88 KB) ported untouched into `frontend/app/globals.css` |

```
.
├── frontend/        Next.js app  (port 3000)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css         ← original styles.css, verbatim
│   │   ├── page.tsx            ← composes every section
│   │   └── sip/[id]/page.tsx   ← shared SIP projection landing
│   ├── components/             ← one file per section
│   ├── lib/                    ← util, api fetcher
│   ├── next.config.mjs         ← /api/* rewrites to backend
│   └── package.json
│
├── backend/         Express API (port 4000)
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js               ← Supabase client (graceful fallback)
│   │   ├── seed.js             ← in-memory seed data
│   │   └── routes/             ← catalog, leads, newsletter, contact, sip, health
│   ├── sql/
│   │   ├── schema.sql          ← all tables + RLS
│   │   └── seed.sql            ← idempotent catalog seed
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Features ported from the static site

Every section of the original page is faithfully ported:

- Animated hero (char-split title, mouse-tracked spotlight, 3-card depth
  parallax, allocation rings, sparkline, counter stats, trust marquee)
- Custom cursor + magnetic buttons + 3-D tilt cards + reveal-on-scroll
  observer + parallax background
- Top market ticker (live-drift)
- Indices row + 9 stock cards with live price drift, sparklines, **persistent
  watchlist** and filter chips (gainers / watchlist / stable / all)
- Unlisted shares grid with logo fallback and filter chips
- SIP calculator (sliders + animated donut + animated counters)
- Dashboard mock (sidebar, KPIs, 12-month performance chart, allocation list)
- Testimonials marquee · FAQ accordion · 3-tier pricing · 4-step onboarding
- Newsletter signup, cookie consent, scroll progress bar, back-to-top button
- Live activity toast stack, side-rail section navigator, mobile full-screen
  menu

## Features added on top

These extend the original static design:

- `POST /api/leads` — onboarding form persists to Supabase (`leads` table)
- `GET /api/leads` — admin-only listing, gated by `x-admin-token` header
- `POST /api/newsletter` — newsletter subscribers (idempotent on email)
- `POST /api/contact` — generic contact-message endpoint
- `POST /api/sip/share` + `GET /api/sip/share/:id` + `/sip/[id]` page —
  share a SIP projection via a permalink
- `GET /api/health` — service + DB status
- Markets watchlist persisted in `localStorage`
- All catalog data (stocks, indices, products, testimonials, FAQs, ticker)
  is served from Supabase tables and is editable without a code deploy

---

## Quick start (with Supabase)

### 1. Create a Supabase project

Sign in at <https://supabase.com>, create a new project, and grab two values
from **Project Settings → API**:

- `Project URL` — for `SUPABASE_URL`
- `service_role` key — for `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### 2. Run the SQL

In the Supabase **SQL editor**, run these two files in order:

```
backend/sql/schema.sql
backend/sql/seed.sql
```

The schema enables RLS on every table with **no policies**, so the public
anon key cannot read or write anything — only the server-side service-role
key (used by the Express app) can.

### 3. Backend

```powershell
cd backend
copy .env.example .env       # then fill in SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev                  # http://localhost:4000
```

Required env vars (see `backend/.env.example`):

| Name                          | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `PORT`                        | Server port (default `4000`)                                  |
| `CORS_ORIGIN`                 | Comma-separated list of allowed origins (default `http://localhost:3000`) |
| `SUPABASE_URL`                | From Supabase project settings                                |
| `SUPABASE_SERVICE_ROLE_KEY`   | From Supabase project settings — **server only, never expose** |
| `ADMIN_TOKEN`                 | Long random string. Required to call `GET /api/leads`         |
| `PUBLIC_FRONTEND_URL`         | Used to build SIP share links (default `http://localhost:3000`) |

Sanity check:

```powershell
curl http://localhost:4000/api/health
```

Returns `{"db":"connected", ...}` if Supabase is wired up, or
`{"db":"seed-mode", ...}` if it isn't (the API still works — every read
endpoint falls back to in-memory seed data).

### 4. Frontend

```powershell
cd frontend
copy .env.local.example .env.local   # default points at http://localhost:4000
npm install
npm run dev                          # http://localhost:3000
```

Open <http://localhost:3000>. The page should look identical to the original
`index.html` while talking to the Express API for every dynamic section.

### 5. Production build

```powershell
cd frontend && npm run build && npm start
cd backend  && npm start
```

---

## Running without Supabase (zero-config demo)

If you just want to look at the UI and click around, **skip step 1–2**.
Leave `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` blank. The backend will
boot in **seed mode** — every read endpoint serves the same data the original
`script.js` used, and write endpoints log payloads to the console without
persisting them. SIP share links work too, kept in process memory until the
server restarts.

---

## API reference

| Method | Path                       | Purpose                                              |
| ------ | -------------------------- | ---------------------------------------------------- |
| GET    | `/api/health`              | Liveness + Supabase connection state                 |
| GET    | `/api/ticker`              | Top-of-page market ticker items                      |
| GET    | `/api/indices`             | NIFTY / SENSEX / BANK / VIX                          |
| GET    | `/api/stocks`              | Listed stock cards                                   |
| GET    | `/api/unlisted`            | Unlisted share cards                                 |
| GET    | `/api/products`            | Marketplace product tiles                            |
| GET    | `/api/testimonials`        | Marquee testimonials                                 |
| GET    | `/api/faqs`                | FAQ list                                             |
| POST   | `/api/leads`               | Onboarding form (rate-limited)                       |
| GET    | `/api/leads`               | Admin list (header `x-admin-token: $ADMIN_TOKEN`)    |
| POST   | `/api/newsletter`          | Newsletter subscription                              |
| POST   | `/api/contact`             | Generic contact message                              |
| POST   | `/api/sip/share`           | Persist a SIP projection, return shareable URL       |
| GET    | `/api/sip/share/:id`       | Fetch a saved SIP projection                         |

Write endpoints are rate-limited to 30 requests / minute / IP.

---

## Notes & decisions

- **Why a service-role-only DB design?** The frontend never talks to Supabase
  directly. All access goes through the Express backend, which validates and
  rate-limits writes. RLS-enabled tables with no policies are an explicit
  "deny everything except service role" stance — the safest default for a
  small project.
- **CSS preserved verbatim.** The 88 KB `styles.css` is copied as-is into
  `frontend/app/globals.css`. No class names were renamed, no Tailwind /
  CSS-modules migration was attempted, so the visual output is byte-for-byte
  the same as the original site.
- **Animations** that originally lived in `script.js` are split between
  per-section `useEffect` blocks (Hero, Calculator, Dashboard, etc.) and a
  single `<GlobalUX/>` component that owns the cross-cutting behaviors
  (smooth scroll, reveal observer, magnetic buttons, tilt cards, parallax,
  counters, FAQ accordion, step-progress fill).
- The original `<svg>` icon sprite is preserved as a React component
  (`IconSprite.tsx`) and rendered once at the top of every page so all
  `<use href="#i-...">` references continue to work.

---

## License

Private project — for the Peculiex team.

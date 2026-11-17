# Unlisted stock detail features — 17 November 2026

Source: [UnlistedKraft live catalog](https://www.unlistedkraft.in/stocks/live), with [OYO](https://www.unlistedkraft.in/stocks/oravel-stays-ltd-(oyo-rooms)) as the reference detail page. Website language remains English.

## Imported coverage

- 202 current companies, nine fundamental fields per company.
- 1,53,158 dated price records including 1,52,961 source history records and daily observations for 197 quoted companies.
- 176 companies have multi-date history; 26 have one observation or no usable historical quote. No fabricated history or forward-filled missing days.
- 615 financial tables, including all tables in multi-table balance sheets.
- 166 companies have shareholding tables; available promoter/leadership tables also imported.
- 692 document links discovered; 688 verified PDF signatures. Four upstream links currently return JSON, not PDF, and are labelled unavailable.

## Work completed, step by step

1. Inspected the listing, source HTML, dated chart arrays, financial tabs, document links, status and ownership tables. Parsed JSON data only; upstream scripts and HTML are never executed or injected into Finvoq.
2. Extended the existing mirror to backfill source history and retain durable daily quote observations, preserving existing quotes across restarts and source-history omissions. Dates use the source's explicit MM/DD/YYYY format; daily observations use Asia/Kolkata. Positive quotes only; no synthetic prices for unavailable or missed days.
3. Added a responsive, white stock-detail page for every company. Visitors can open a company from its unlisted card, inspect the interactive step chart, select 1M/3M/6M/YTD/1Y/All periods, apply custom start/end dates, adjust date sliders, inspect points with the pointer or arrow keys, and export the selected history to CSV. Dashed connectors identify gaps. Figures are indicative unlisted quotes, not exchange trades or guaranteed executable prices.
4. Added financial-statement tabs, a scrollable table with pinned row labels, company fundamentals, status, shareholding bars, promoter/leadership information, a step-by-step enquiry/settlement guide and FAQs. Kept each missing-data state explicit. Removed the former fabricated per-company factsheet URLs.
5. Added investor-document search, type/year filters, page-by-page PDF preview, zoom and downloads. The PDF viewer uses the already installed PDF.js library so it also renders in mobile and embedded browsers without a native PDF plug-in. Documents are downloaded into a local server cache on first preview/download, validated by signature and size, and refreshed after a day. Public PDF URLs are restricted to the source's company-document paths; redirects and arbitrary URL requests are rejected. PDF Range requests are supported. Failed upstream refreshes can serve an already verified cached PDF.
6. Added buy and sell enquiries and a quantity/indicative-cost calculator. Corrected the old enquiry payload to match the actual leads API (name, email, phone, interest, budget, message). Email is now required to match its existing validation. Requests are enquiries; no trade is executed or allocation promised. Lead validation was tested without sending test email or inserting test leads.
7. Extended the existing in-application automation: quote checks and daily-observation upserts run on startup and every 15 minutes while the backend is running. A day's latest successful quote replaces that day's observation. History, fundamentals and document listings refresh at least every six hours; PDF links are signature-checked daily. Public pages revalidate every minute. Existing lock, backup, count validation, shrink protection and atomic publication remain in place. The admin sync panel exposes the latest India quote date and coverage counts.
8. Bundled the verified initial catalog, compressed historical records and the new company logo for fresh VPS deployments. Ongoing history and downloaded PDFs live in the persistent backend uploads directory; future quote/history/document changes do not require a frontend rebuild.

## Unavailable source PDFs

- India Exposition Mart — Annual Report 2022-2023
- Lakeshore Hospital and Research Centre — Annual Report 2023-2024
- Merino Industries — Annual Report 2022-2023
- Orbis Financial Corporation Ltd — Annual Report 2024-2025

## Limited historical coverage

These companies currently have one observed quote or no historical data, rather than a multi-date source series:

- Agnikul Cosmos Private Limited
- Ekkaa Electronics (India) Ltd.
- Galaxeye Space Solutions Limited Private Limited
- GG Automotive Gears Limited
- HDFC Ergo General Insurance Limited
- Hutti Gold Mines Company Limited
- Incred Capital Financial Services Limited
- Jainam Broking Limited
- Medlix Health Solutions Private Limited
- MTAndT Rentals Limited
- Muthoot Fincorp Limited
- Navitas Green Solutions Pvt Ltd.
- Pashupati Polytex Private Limited
- PhonePe Limited
- PNB MetLife Insurance
- Prabhudas Lilladher Advisory Services Limited
- Razorpay Software Limited
- SBI General Insurance
- Shreni Shares Limited
- Shriram Life Insurance Co. Ltd
- SICOM India Limited
- SK Finance Limited
- Soleos Energy Private Limited
- T Stanes and Company Limited
- Thalappakatti Hotels Private Limited
- Vivriti Finance Limited

## Automation and persistence

- Keep the backend PM2 process online. Defaults remain UNLISTED_SYNC_ENABLED=true and UNLISTED_SYNC_INTERVAL_MINUTES=15. The scraper itself performs the daily capture; no Codex app automation, translation service or external cron is required.
- Keep backend/uploads/unlisted-sync/ (catalog, history, status, backups, PDF cache) and backend/uploads/unlisted-logos/ writable and persistent. Back up these directories. Never delete them during deployment.
- Status: GET /api/unlisted/sync-status. Check last_success_at, daily_quote_date, company_count, history_companies, document_count and last_error. Admin: Unlisted > automatic sync panel > Sync entire catalog now.
- This cannot retrieve a historical quote for a day when the backend was offline unless the source later supplies that dated record. An unchanged price is still a real observed quote; missing days remain missing.
- PDF links and company fundamentals reflect the source's published data, which may use older reporting periods or contain errors. Four invalid source files remain unavailable until corrected upstream. Source prose/articles and third-party transaction/registration flows were not copied.

## Validation

- 19 automated backend tests passed, covering parsing, explicit date formats, daily rollover at India midnight, idempotent observations, missing days, source corrections, document signatures/caching, failure recovery, inventory reconciliation and the real enquiry API contract.
- Frontend production build and TypeScript checks passed. The PDF worker is served locally from the installed dependency; no external PDF-viewer CDN is required.
- All 202 company detail APIs were checked; historical arrays remain out of the lightweight listing response.
- All 692 source document URLs were checked with bounded PDF-signature requests. Valid PDF delivery, attachment headers, range responses and invalid-ID rejection passed HTTP checks.
- Browser checks covered custom/inverted date ranges, presets, financial tabs, document year filters, a 259-page OYO annual-report PDF and page navigation, CSV download, buy quantity propagation, sell enquiry dialogs and explicit missing-history states. Layouts were checked at 390px phone, 820px tablet and 1366px laptop widths with no horizontal page overflow; the chart remains white.
- No test leads were submitted, and no test emails or financial transactions were sent. Actual SMTP delivery is outside this verification.

## VPS deployment

The VPS deployment is not performed from this computer. No database schema migration is required. The PDF worker is copied from the installed library automatically by the frontend prebuild script.

```bash
cd /var/www/finvoq && \
git checkout -- backend/package-lock.json && \
git checkout main && git pull --ff-only origin main && \
cd backend && npm ci --omit=dev && \
cd ../frontend && npm ci --include=dev && npm run build && \
pm2 restart finvoq-backend --update-env && \
pm2 restart finvoq-frontend --update-env && \
pm2 save && pm2 status
```

After deployment the bundled history is available immediately. The backend automatically refreshes it on startup. Keep any existing runtime catalog: the first successful sync upgrades it with history and document metadata without discarding earlier observations.

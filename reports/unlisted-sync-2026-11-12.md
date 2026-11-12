# Unlisted catalog and automatic sync — 12 November 2026

Source: [UnlistedKraft live catalog](https://www.unlistedkraft.in/stocks/live). Initial reconciliation: 12/11/2026, 11:05:53 pm IST.

## Result

- Before: 208 database entries. After: **201 source companies**.
- **14 additions, 21 removals, 187 existing companies refreshed.**
- 201 verified local logos, nine fundamental fields for every company, and 350 available financial tables.
- Five companies have no quoted source price and display “Price on request”.

## Work completed, step by step

1. Fetched the complete live listing, including the cards hidden behind Load More. Validated card counts, distinct company identities, required fields and complete HTML before allowing updates.
2. Scraped each company’s price, sector, minimum units, market capitalization, P/E and logo, plus its ISIN, face value, EPS, P/B, book value and debt/equity. Extracted factual Profit & Loss and Balance Sheet tables, preserving the source periods and figures. Source prose/articles were not copied.
3. Downloaded and checked all 201 logos. Used the verified Medlix company-site logo where the source image was broken. Files are versioned by content hash. Fixed AVIF content types and bundled the initial images so the VPS has them immediately.
4. Saved a pre-change backup under backend/uploads/unlisted-sync/backups, updated the connected Supabase unlisted_shares table, added the missing companies and deleted only the absent or duplicate catalog entries. Unrelated catalogs and user records were not deleted.
5. Replaced the fixed seed inventory with the checked source snapshot. Persisted all scraped fundamentals in an atomic runtime catalog because the existing database has no columns for those fields. The public API reads the complete published catalog; no redeployment is needed for future data or logo changes.
6. Implemented automatic scraping on backend startup and every 15 minutes, including additions and removals. Open unlisted pages refresh their data every 60 seconds. Company source URLs preserve identity across renames.
7. Added sync status and a “Sync entire catalog now” control to the admin panel. Replaced the old selective sync flow. Kept the website English-only, as requested. Company names, financial values and original source table labels are preserved.
8. Verified exact source/API company count and listing fields, all 201 served images and company-detail API responses, idempotent re-sync, failure recovery, and the production build. Automated tests cover 12 cases, including additions/removals, partial failures, missing data, duplicate identities, rename stability, scheduling, locking, cached logos and AVIF responses.

## Added companies

- Galaxeye Space Solutions Limited Private Limited
- GG Automotive Gears Limited
- HDFC Ergo General Insurance Limited
- SBI General Insurance
- Hutti Gold Mines Company Limited
- Jainam Broking Limited
- SK Finance Limited
- Pashupati Polytex Private Limited
- Razorpay Software Limited
- Soleos Energy Private Limited
- Prabhudas Lilladher Advisory Services Limited
- Vivriti Finance Limited
- T Stanes and Company Limited
- Thalappakatti Hotels Private Limited

## Removed entries

- A One Steels India Ltd
- AITMC Ventures
- ESDS Software Solution
- Goodluck Defence and Aerospace
- Hero motors Limited
- Hive Hostels
- Innov8 Coworking
- Lords Mark Industries Pvt Ltd
- Manipal Payment & Identity Solutions Ltd (Manipal Cards)
- Modern Bazaar
- National Stock Exchange (NSE)
- SBI Fund Management
- Schneider Electric President Systems
- Shivchem Agro Limited
- Signify Innovations India Limited
- Skyways Air Services Limited
- Taparia Tools Ltd
- testing
- Vivriti AMC
- Vivriti Capital
- XtraNet Technologies Pvt. Ltd

## No quoted price

- PhonePe Limited
- Navitas Green Solutions Pvt Ltd.
- HDFC Ergo General Insurance Limited
- Soleos Energy Private Limited
- Thalappakatti Hotels Private Limited

## Automatic operation

- Default: enabled; 15-minute interval. This is polling, not instantaneous upstream notifications. Open pages pick up a successful refresh within a further minute.
- Backend configuration: UNLISTED_SYNC_ENABLED=true and UNLISTED_SYNC_INTERVAL_MINUTES=15. Minimum supported interval: 5 minutes.
- Persistent data, backups, status and last report: backend/uploads/unlisted-sync/. Keep this writable and persistent on the VPS. Downloaded runtime logos: backend/uploads/unlisted-logos/. Both locations are excluded from Git.
- The public status endpoint is /api/unlisted/sync-status. Check enabled=true, company_count=201 (or the latest source count), last_success_at and last_error=null. PM2 logs include [unlisted-sync].
- Each run finishes downloads before database changes, backs up changed inventory, removes absent entries last, verifies the database and atomically publishes the new catalog. Incomplete HTML, failed logo/detail fetches or overlapping jobs retain the previous public catalog. An interrupted database write is repaired on the next successful run.
- A source shrink greater than 25% is held for review rather than causing a large automatic deletion. After verifying a genuine upstream removal, the CLI supports --allow-large-removal.
- Manual CLI: cd /var/www/finvoq/backend && npm run sync:unlisted -- --apply. Omit --apply for a full read-only preview (images may be cached locally).
- Source controls the unlisted catalog; manual edits may be replaced at the next sync.

## VPS deployment

Database additions/removals are already saved. The code and automatic scheduler activate on the VPS after deployment; the VPS deployment itself was not run from this computer. No database schema migration is needed.

```bash
cd /var/www/finvoq && \
git checkout -- backend/package-lock.json && \
git checkout main && git pull --ff-only origin main && \
cd backend && npm ci --omit=dev && \
npm run sync:unlisted -- --apply && \
cd ../frontend && npm ci --include=dev && npm run build && \
pm2 restart finvoq-backend --update-env && \
pm2 restart finvoq-frontend --update-env && \
pm2 save && pm2 status
```

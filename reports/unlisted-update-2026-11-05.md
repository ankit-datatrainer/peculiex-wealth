# Unlisted catalog update — 5 November 2026

Source: [UnlistedKraft live listings](https://www.unlistedkraft.in/stocks/live), checked 5 November 2026 at 3:40 am IST.

139 existing share prices changed; 153 existing records had market data or logo updates. Added 35 companies, taking the connected database from 173 to 208 entries. All 187 source listings are represented. One pre-existing pair of Signify records remains; no duplicate company was created by this update.

Every represented source listing was checked against the API for price, sector, minimum units, market cap and P/E. Downloaded and validated all 187 source logos; replaced broken source links for Medlix, MTAndT Rentals and Incred Capital using the companies’ own websites. The existing non-source testing record uses its initial badge because its old uploaded logo is unavailable.

## Added companies

| Company | Price per share | Minimum units | Market cap | P/E |
| --- | ---: | ---: | --- | ---: |
| 63sats Cybertech Limited | ₹26.35 | 1000 | 2680 Cr | N/A |
| Abans Investment Managers Limited | ₹2,470 | 10 | 401 Cr | 581.4 |
| Amrut Dredging And Shipping Limited | ₹231 | 110 | 0 Cr | N/A |
| Berar Finance Limited | ₹461 | 50 | 776 Cr | 21.56 |
| Bombay Gas Company Limited | ₹114 | 250 | 80 Cr | 8.65 |
| Calcutta Stock Exchange | ₹2,775 | 12 | 164 Cr | N/A |
| Core Energy Systems Limited | ₹16,710 | 2 | 4,171 Cr | 225.47 |
| Cosmic PV Power Limited | ₹187 | 120 | 1,513 Cr | 61.76 |
| Eastern Investment Limited | ₹2,977 | 10 | 433 Cr | N/A |
| Eiffil Water Infra Private Limited | ₹267 | 100 | 661 Cr | 30.63 |
| Ekkaa Electronics (India) Ltd. | ₹123 | 10 | 0 Cr | 0 |
| Evergreen Recyclekaro (India) Limited | ₹10,35,000 | 1 | 1,841 Cr | 82.19 |
| Gamma Rotors Limited | ₹127 | 200 | 165 Cr | 48.48 |
| GH2 Solar Limited | ₹302 | 100 | 536 Cr | 11.49 |
| Goldi Solar Limited | ₹317 | 1 | 11,955 Cr | N/A |
| Incred Capital Financial Services Limited | ₹485 | 10 | 7,236 Cr | 176.36 |
| Indian Gas Exchange Limited | ₹475 | 55 | 3563 Cr | 84.82 |
| IndusInd General Insurance (Formerly Reliance General Insurance) | ₹546 | 50 | 15227 Cr | N/A |
| INFOBAY CCPS | ₹4,08,500 | 1 | N/A Cr | N/A |
| Inox Neo Energies Limited | ₹2,420 | 10 | 30688 Cr | 9224.14 |
| Interno Fusion | ₹87 | 300 | 108 Cr | 55.35 |
| Invade Agro Limited | ₹81 | 350 | 2462 Cr | 2733.33 |
| Invade Mill Limited | ₹35 | 800 | 97 Cr | N/A |
| Jai Mata Engineering Limited | ₹214 | 130 | 338 Cr | 30.71 |
| Medlix Health Solutions Private Limited | ₹14,480 | 2 | N/A Cr | N/A |
| MTAndT Rentals Limited | ₹545 | 10 | 974 Cr | 18.51 |
| Muthoot Fincorp Limited | ₹238 | 10 | 25,092 Cr | 14.16 |
| Navitas Green Solutions Pvt Ltd. | Price on request | 10 | N/A Cr | 0 |
| Pacific Mediacom Limited | ₹13,000 | 10 | 130 Cr | 62 |
| PhonePe Limited | Price on request | 10 | 0 Cr | N/A |
| PNB MetLife Insurance | ₹100 | 10 | 0 Cr | 64.1 |
| Shreni Shares Limited | ₹138 | 200 | 732 Cr | 26.39 |
| Shriram Life Insurance Co. Ltd | ₹525 | 50 | 5542 Cr | N/A |
| SICOM India Limited | ₹85 | 350 | 517 Cr | N/A |
| Sun Drops Energia Private Limited | ₹314 | 10 | 0 Cr | 0 |

PhonePe Limited and Navitas Green Solutions have a zero price on the source. Their cards and inquiry dialogs show “Price on request”; no zero-value investment total is presented.

## Existing companies absent from the current source

These 20 companies were retained, with their previous prices labeled “Last recorded price.” Their inquiry dialogs request a confirmed quote. No prices were invented or companies deleted.

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
- Skyways Air Services Limited
- Taparia Tools Ltd
- testing
- Vivriti AMC
- Vivriti Capital
- XtraNet Technologies Pvt. Ltd

## Application status

Database updates and additions are saved. The local application runs at [the unlisted preview](http://localhost:3001/unlisted). The card layout, quote handling, bundled logos and fallback metadata are local code changes and require the normal application deployment to reach production. No deployment was performed.

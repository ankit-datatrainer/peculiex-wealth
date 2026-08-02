// ────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for every headline fact stated on the public site.
//
// Why this file exists: the 2026-07-28 audit found the same fact given four
// different answers across four pages (assets ₹182Cr vs ₹450Cr; asset classes
// "10+" vs "Eight" vs "Multiple" vs nine listed). Those conflicts are a
// credibility problem for a financial brand — the careful readers who notice
// are exactly the PMS/AIF audience.
//
// RULE: never hard-code these numbers in a page again. Import from here.
//
// 2026-07-29: Finvoq confirmed the regulatory role (distributor), city
// (Delhi), AUM (₹182 Cr+) and product count (10+). Remaining CONFIRM markers
// below (registration number, phone, mailboxes, LAMF rate) are still open.
// ────────────────────────────────────────────────────────────────────────────

/** Confirmed by Finvoq 2026-07-29. */
export const ASSETS_ADVISED = '₹182 Cr+';
export const ASSETS_AS_OF = 'as of 31 March 2026';
/** Short form for stat bands where the label already says "assets". */
export const ASSETS_SHORT = '₹182 Cr+';

/** CONFIRM: investor count. */
export const INVESTOR_COUNT = '4,000+';

/**
 * Confirmed by Finvoq 2026-07-29: "10+ products" sitewide.
 * Keep ASSET_CLASS_COUNT and ASSET_CLASSES in agreement — the audit found the
 * stated count disagreeing with the number of products actually listed.
 * Mirrors the slugs in lib/productContent.tsx plus /unlisted.
 */
export const ASSET_CLASSES = [
  'Equities',
  'Mutual funds',
  'PMS',
  'AIF',
  'Bonds',
  'Insurance',
  'Fixed deposits',
  'Loan against mutual funds',
  'GIFT City / offshore',
  'Unlisted equity',
] as const;
export const ASSET_CLASS_COUNT = ASSET_CLASSES.length; // 10
/** Sitewide display form — always "10+", never spelled out or a bare count. */
export const ASSET_CLASS_COUNT_WORD = '10+';

/** Confirmed by Finvoq 2026-07-29. */
export const CITY = 'Delhi';

/** Years operating — used in the homepage stat band. */
export const YEARS_OPERATING = '10 yrs+';

// ── Contact ────────────────────────────────────────────────────────────────
// ⚠️ REPLACE: every address below was a reserved RFC 2606 example.com domain,
// which can never receive mail. These must be real, monitored mailboxes.
export const CONTACT = {
  /** CONFIRM: general enquiries mailbox. */
  email: 'info@finvoq.com',
  /** CONFIRM: grievance officer mailbox (SEBI requires a monitored address). */
  supportEmail: 'info@finvoq.com',
  complianceEmail: 'info@finvoq.com',
  careersEmail: 'info@finvoq.com',
  pressEmail: 'info@finvoq.com',
  legalEmail: 'info@finvoq.com',
  privacyEmail: 'info@finvoq.com',
  /** CONFIRM: a real, answered landline. */
  phone: '',
  phoneDisplay: '',
  hours: 'Monday to Friday, 9:30am – 6:30pm IST',
} as const;

// ── Product rates ──────────────────────────────────────────────────────────
/**
 * Loan Against Mutual Funds headline rate.
 *
 * The audit found the page stating two different things at once: the body read
 * "Rates from ~X% p.a." (an unreplaced template placeholder) while the stat
 * block said "~9%*" — and the asterisk pointed at no footnote. Both now read
 * from here, and the footnote text below is rendered wherever the rate appears.
 *
 * CONFIRM with the lending partner before the next deploy.
 */
export const LAMF_RATE = '~9% p.a.';
export const LAMF_RATE_FOOTNOTE =
  'Indicative starting rate. The rate you are offered depends on the lender, the schemes pledged and your credit assessment, and is subject to change.';

// ── Social ─────────────────────────────────────────────────────────────────
/**
 * Only links with a real URL are rendered. The audit found 3–4 icons pointing
 * at href="#" — an empty social row reads as an abandoned company, so an unset
 * profile is hidden rather than shown dead. Fill a URL in to bring it back.
 */
export const SOCIAL_LINKS: { id: 'linkedin' | 'x' | 'instagram'; label: string; href: string }[] = [
  { id: 'linkedin', label: 'LinkedIn', href: '' },
  { id: 'x', label: 'X', href: '' },
  { id: 'instagram', label: 'Instagram', href: '' },
];

// ── Regulatory ─────────────────────────────────────────────────────────────
/**
 * CONFIRMED by Finvoq 2026-07-29 (audit item C4): distributor, not adviser.
 * The site previously claimed both identities at once (footer said
 * distributor + trail commission; /about said adviser + fee-only). Every
 * dependent string below now reads from REGULATORY_ROLE, so this is the only
 * place that decision needs to be made.
 */
export type RegulatoryRole = 'adviser' | 'distributor';
// Widened to RegulatoryRole (not the literal) so the dependent ternaries below
// stay valid if this is ever switched back to 'adviser'.
export const REGULATORY_ROLE = 'distributor' as RegulatoryRole;

/** Confirmed by Finvoq 2026-08-02 — AMFI ARN of the distributor. */
export const REGISTRATION_NUMBER = 'ARN-346787';

// ── AMFI registration detail ───────────────────────────────────────────────
/**
 * The full registration record, as printed on the AMFI certificate. These are
 * the facts a prospective investor (or an AMFI/SEBI inspection) checks us on,
 * so they are stated verbatim and in exactly one place.
 *
 * Empty strings are dropped by REGULATORY_CREDENTIALS below, so an unset field
 * is simply omitted rather than rendering a dangling label.
 */
export const EUIN = 'E660362';
export const ARN_VALID_FROM = '01 Dec 2025';
export const ARN_VALID_TO = '20 Nov 2028';
export const ARN_VALIDITY = `${ARN_VALID_FROM} – ${ARN_VALID_TO}`;
export const ENROLLMENT_DATE = '24 Apr 2026';
export const APRN_CODE = 'APRN08920';
export const EUIN_CODE = 'E17644';

/**
 * Render-ready registration rows. Labels match the certificate wording so a
 * reader can tie each value back to the source document.
 */
export const REGULATORY_CREDENTIALS: { label: string; value: string }[] = [
  { label: 'AMFI Regn. No.', value: REGISTRATION_NUMBER },
  { label: 'EUIN', value: EUIN },
  { label: 'ARN validity', value: ARN_VALIDITY },
  { label: 'Enrollment date', value: ENROLLMENT_DATE },
  { label: 'APRN code', value: APRN_CODE },
  { label: 'EUIN code', value: EUIN_CODE },
].filter((row) => row.value);

/** Single-line form for the footer band and other tight spaces. */
export const REGISTRATION_CODES_LINE = REGULATORY_CREDENTIALS.map(
  (row) => `${row.label} ${row.value}`
).join('  ·  ');

export const REGULATORY_LABEL =
  REGULATORY_ROLE === 'adviser'
    ? 'SEBI Registered Investment Adviser'
    : 'AMFI Registered Mutual Fund Distributor';

/** The fee sentence must match REGULATORY_ROLE — the audit found them contradicting. */
export const FEE_DISCLOSURE =
  REGULATORY_ROLE === 'adviser'
    ? 'We are fee-only. We accept nothing from product manufacturers.'
    : 'We are compensated through trail commission paid by the asset manager. You pay us no separate advisory fee.';

/**
 * Demat wording. "SEBI registered portfolio management distributor" appeared on
 * 4 of 5 pages and is NOT a real regulatory category. The /about wording below
 * is the correct one.
 */
export const DEMAT_DISCLOSURE =
  'Demat services are provided by SEBI-registered partner brokers.';

/** Rendered only when a number exists, so a blank never ships as "RIA ". */
export const REGISTRATION_LINE = REGISTRATION_NUMBER
  ? `${REGULATORY_LABEL} — ${REGISTRATION_NUMBER}`
  : REGULATORY_LABEL;

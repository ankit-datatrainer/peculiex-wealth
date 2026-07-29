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
// ⚠️ FIGURES BELOW NEED CONFIRMATION BY FINVOQ before the next deploy.
//    The defaults are the value that appeared most often in the codebase, NOT
//    a verified figure. See CONFIRM markers.
// ────────────────────────────────────────────────────────────────────────────

/** CONFIRM: audited assets figure + the date it was measured. */
export const ASSETS_ADVISED = '₹450 Cr+';
export const ASSETS_AS_OF = 'as of 31 March 2026';
/** Short form for stat bands where the label already says "assets". */
export const ASSETS_SHORT = '₹450 Cr+';

/** CONFIRM: investor count. */
export const INVESTOR_COUNT = '4,000+';

/**
 * CONFIRM: how many asset classes are actually offered.
 * Keep ASSET_CLASS_COUNT and ASSET_CLASSES in agreement — the audit found the
 * stated count disagreeing with the number of products actually listed.
 */
export const ASSET_CLASSES = [
  'Mutual funds',
  'PMS',
  'AIF',
  'Bonds',
  'Unlisted equity',
  'Equities',
  'Fixed deposits',
  'GIFT City / offshore',
] as const;
export const ASSET_CLASS_COUNT = ASSET_CLASSES.length; // 8
export const ASSET_CLASS_COUNT_WORD = 'eight';

/** CONFIRM: registered office city. Audit found Delhi vs Mumbai/Delhi. */
export const CITY = 'Mumbai';

/** Years operating — used in the homepage stat band. */
export const YEARS_OPERATING = '10 yrs+';

// ── Contact ────────────────────────────────────────────────────────────────
// ⚠️ REPLACE: every address below was a reserved RFC 2606 example.com domain,
// which can never receive mail. These must be real, monitored mailboxes.
export const CONTACT = {
  /** CONFIRM: general enquiries mailbox. */
  email: 'hello@finvoq.com',
  /** CONFIRM: grievance officer mailbox (SEBI requires a monitored address). */
  supportEmail: 'support@finvoq.com',
  complianceEmail: 'compliance@finvoq.com',
  careersEmail: 'careers@finvoq.com',
  pressEmail: 'press@finvoq.com',
  legalEmail: 'legal@finvoq.com',
  privacyEmail: 'privacy@finvoq.com',
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
 * ⚠️ BLOCKED ON A COMPLIANCE DECISION (audit item C4).
 *
 * The site currently claims BOTH identities:
 *   • footer  — "SEBI Registered Investment Distributor … earn a Trailing Commission"
 *   • /about  — "SEBI Registered Investment Adviser … nothing from product
 *                manufacturers. Ever."
 *
 * These are mutually exclusive and drive the registration number, the fee
 * disclosure, the About copy, the footer and the demat line. A developer must
 * not guess this. Once Finvoq's compliance owner decides, set REGULATORY_ROLE
 * and fill REGISTRATION_NUMBER; every dependent string reads from here.
 */
export type RegulatoryRole = 'adviser' | 'distributor';
// Widened to RegulatoryRole (not the literal) so the dependent ternaries below
// stay valid when this is switched to 'adviser'.
export const REGULATORY_ROLE = 'distributor' as RegulatoryRole;

/** CONFIRM: verifiable INA (adviser) or AMFI ARN (distributor). */
export const REGISTRATION_NUMBER = '';

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

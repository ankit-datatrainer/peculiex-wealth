/**
 * AMFI registration facts, editable from the super-admin Content Manager
 * (Global → AMFI registration box).
 *
 * The same registration appears on /about, /contact, both footers and the
 * grievance policy, so every surface reads it from this one reader instead of
 * the raw constants. lib/siteFacts stays the fallback: if the content API is
 * unreachable the site still states the registration exactly as it ships.
 *
 * Client-only, like lib/siteSettings: it rides the live content channel, so a
 * saved edit repaints every mounted surface without a refresh.
 */

"use client";

import { useContent, type Reader } from "./content";
import {
  AMFI_BOX_HEADING,
  AMFI_BOX_INTRO,
  AMFI_BOX_NOTE,
  EUIN,
  REGISTRATION_NUMBER,
  REGULATORY_CREDENTIALS,
  REGULATORY_LABEL,
  registrationCodesLine,
  registrationLine
} from "./siteFacts";

/** Section key on the `global` CMS page. */
export const AMFI_SECTION = "amfi";

export type AmfiRow = { label: string; value: string };

export type AmfiSettings = {
  heading: string;
  intro: string;
  /** Registration type, e.g. "AMFI Registered Mutual Fund Distributor". */
  badge: string;
  footnote: string;
  /** ARN as quoted inline in disclaimers, e.g. "ARN-346787". */
  arn: string;
  euin: string;
  /** Label/value tiles for the box. Rows without a value are dropped. */
  rows: AmfiRow[];
  /** The tiles collapsed to one line, for the footer bands. */
  codesLine: string;
  /** "<badge> — <arn>", for badges and the grievance policy. */
  registrationLine: string;
};

/** Read the registration off an existing `global` reader. */
export function amfiFrom(cms: Reader): AmfiSettings {
  const badge = cms.t(AMFI_SECTION, "badge", REGULATORY_LABEL).trim();
  const arn = cms.t(AMFI_SECTION, "arn", REGISTRATION_NUMBER).trim();
  const rows = cms
    .list<AmfiRow>(AMFI_SECTION, "items", REGULATORY_CREDENTIALS)
    .map((r) => ({ label: (r.label || "").trim(), value: (r.value || "").trim() }))
    // A row an admin left without a value is omitted rather than rendered as
    // a dangling label — the same rule siteFacts applies to the constants.
    .filter((r) => r.value);

  return {
    heading: cms.t(AMFI_SECTION, "heading", AMFI_BOX_HEADING),
    intro: cms.t(AMFI_SECTION, "intro", AMFI_BOX_INTRO),
    badge,
    footnote: cms.t(AMFI_SECTION, "footnote", AMFI_BOX_NOTE),
    arn,
    euin: cms.t(AMFI_SECTION, "euin", EUIN).trim(),
    rows,
    codesLine: registrationCodesLine(rows),
    registrationLine: registrationLine(badge, arn)
  };
}

export function useAmfi(): AmfiSettings {
  return amfiFrom(useContent("global"));
}

/**
 * AMFI registration credentials.
 *
 * A distributor's ARN, EUIN and validity window are the facts an investor is
 * entitled to verify before dealing with us, so they get a deliberate,
 * readable block rather than being buried in small print. Every word of it —
 * heading, intro, badge, the label/value tiles and the footnote — is edited
 * in the Content Manager under Global → AMFI registration box (lib/amfi), with
 * lib/siteFacts as the fallback when the content API is unreachable.
 *
 * Two presentations, same data:
 *   panel  (default)  bordered card with a heading — used on /about
 *   inline            no chrome, sits inside an existing card — used on /contact
 */

"use client";

import { useAmfi } from "@/lib/amfi";

type Props = {
  /** Heading override. Omit to use the CMS heading; pass null to hide it. */
  heading?: string | null;
  /**
   * Intro override. Omit to use the CMS intro on the panel (the inline card
   * has no room for it); pass null to hide it.
   */
  intro?: string | null;
  /** `panel` draws its own card; `inline` inherits the parent's. */
  variant?: "panel" | "inline";
  /** Footnote override. Omit to use the CMS footnote; pass null to hide it. */
  note?: string | null;
};

export default function RegulatoryCredentials({
  heading,
  intro,
  variant = "panel",
  note
}: Props) {
  const amfi = useAmfi();
  if (amfi.rows.length === 0) return null;

  const shownHeading = heading === undefined ? amfi.heading : heading;
  const shownIntro =
    intro === undefined ? (variant === "panel" ? amfi.intro : null) : intro;
  const shownNote = note === undefined ? amfi.footnote : note;

  return (
    <div className={`reg-creds reg-creds--${variant}`}>
      {shownHeading ? <h3 className="reg-creds__heading">{shownHeading}</h3> : null}
      {shownIntro ? <p className="reg-creds__intro">{shownIntro}</p> : null}

      {amfi.badge ? <p className="reg-creds__role">{amfi.badge}</p> : null}

      <dl className="reg-creds__grid">
        {amfi.rows.map((row, i) => (
          <div className="reg-creds__row" key={`${row.label}-${i}`}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      {shownNote ? <p className="reg-creds__note">{shownNote}</p> : null}
    </div>
  );
}

/**
 * The registration as a sentence fragment — "<type> — <ARN> (EUIN …)" — for
 * running text such as the grievance policy, which is otherwise static and
 * server-rendered. Kept here so it can never drift from the box above.
 */
export function RegistrationLine() {
  const amfi = useAmfi();
  return (
    <>
      <strong>{amfi.registrationLine}</strong>
      {amfi.euin ? <> (EUIN {amfi.euin})</> : null}
    </>
  );
}

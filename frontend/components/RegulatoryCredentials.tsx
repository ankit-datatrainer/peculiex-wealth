/**
 * AMFI registration credentials.
 *
 * A distributor's ARN, EUIN and validity window are the facts an investor is
 * entitled to verify before dealing with us, so they get a deliberate,
 * readable block rather than being buried in small print. Every value comes
 * from lib/siteFacts, which is the single source of truth for the site.
 *
 * Two presentations, same data:
 *   panel  (default)  bordered card with a heading — used on /about
 *   inline            no chrome, sits inside an existing card — used on /contact
 */

import {
  REGULATORY_CREDENTIALS,
  REGULATORY_LABEL
} from "@/lib/siteFacts";

type Props = {
  /** Heading shown above the grid. Pass null to omit it. */
  heading?: string | null;
  /** Explanatory line under the heading. Pass null to omit it. */
  intro?: string | null;
  /** `panel` draws its own card; `inline` inherits the parent's. */
  variant?: "panel" | "inline";
  /** Footnote under the grid. Defaults to the EUIN explainer AMFI expects. */
  note?: string | null;
};

const DEFAULT_NOTE =
  "EUIN helps AMFI trace the advice you received to the person who gave it. Quoting it on your transaction protects you in the event of any mis-selling dispute.";

export default function RegulatoryCredentials({
  heading = "Our AMFI registration",
  intro = null,
  variant = "panel",
  note = DEFAULT_NOTE
}: Props) {
  if (REGULATORY_CREDENTIALS.length === 0) return null;

  return (
    <div className={`reg-creds reg-creds--${variant}`}>
      {heading ? <h3 className="reg-creds__heading">{heading}</h3> : null}
      {intro ? <p className="reg-creds__intro">{intro}</p> : null}

      <p className="reg-creds__role">{REGULATORY_LABEL}</p>

      <dl className="reg-creds__grid">
        {REGULATORY_CREDENTIALS.map((row) => (
          <div className="reg-creds__row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      {note ? <p className="reg-creds__note">{note}</p> : null}
    </div>
  );
}

"use client";

/**
 * Draft / Publish now / Schedule chooser for the blog editor — the
 * WordPress "Publish" box. Scheduling picks a date and time in the editor's
 * own timezone; the post then goes live on its own at that minute.
 */

import { CalendarClock, FileText, Send } from "lucide-react";
import {
  formatSchedule,
  fromLocalInput,
  localZoneLabel,
  timeUntil,
  toLocalInput,
  type PublishMode
} from "@/lib/blogSchedule";
import "./publish-controls.css";

/** Suggested slots: next round hour, tomorrow morning, next Monday morning. */
function presets(now: Date): { label: string; value: string }[] {
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);

  const tomorrow9 = new Date(now);
  tomorrow9.setDate(tomorrow9.getDate() + 1);
  tomorrow9.setHours(9, 0, 0, 0);

  const monday9 = new Date(now);
  const toMonday = ((8 - monday9.getDay()) % 7) || 7;
  monday9.setDate(monday9.getDate() + toMonday);
  monday9.setHours(9, 0, 0, 0);

  return [
    { label: "Next hour", value: toLocalInput(nextHour.toISOString()) },
    { label: "Tomorrow 9 AM", value: toLocalInput(tomorrow9.toISOString()) },
    { label: "Monday 9 AM", value: toLocalInput(monday9.toISOString()) }
  ];
}

export default function PublishControls({
  mode,
  scheduleAt,
  isLiveAlready,
  onModeChange,
  onScheduleChange
}: {
  mode: PublishMode;
  /** datetime-local value, "YYYY-MM-DDTHH:mm". */
  scheduleAt: string;
  /** Editing a post that readers can already see. */
  isLiveAlready: boolean;
  onModeChange: (m: PublishMode) => void;
  onScheduleChange: (v: string) => void;
}) {
  const now = new Date();
  const iso = fromLocalInput(scheduleAt);
  const inPast = iso ? new Date(iso).getTime() <= now.getTime() : false;

  const options: { key: PublishMode; title: string; hint: string; Icon: typeof Send }[] = [
    {
      key: "draft",
      title: "Draft",
      hint: "Saved privately. Not visible on the website.",
      Icon: FileText
    },
    {
      key: "now",
      title: isLiveAlready ? "Published" : "Publish now",
      hint: isLiveAlready ? "Live on the website. Saving updates it." : "Goes live on the website as soon as you save.",
      Icon: Send
    },
    {
      key: "schedule",
      title: "Schedule",
      hint: "Goes live automatically at a date and time you pick.",
      Icon: CalendarClock
    }
  ];

  return (
    <div className="pc">
      <div className="pc-head">
        <span>Publishing</span>
      </div>

      <div className="pc-options" role="radiogroup" aria-label="Publishing">
        {options.map(({ key, title, hint, Icon }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={mode === key}
            className={`pc-opt pc-opt-${key}${mode === key ? " is-on" : ""}`}
            onClick={() => onModeChange(key)}
          >
            <span className="pc-opt-icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <span className="pc-opt-copy">
              <strong>{title}</strong>
              <em>{hint}</em>
            </span>
            <span className="pc-radio" aria-hidden="true" />
          </button>
        ))}
      </div>

      {mode === "schedule" && (
        <div className="pc-schedule">
          <label className="pc-field">
            <span>Go-live date &amp; time</span>
            <input
              type="datetime-local"
              value={scheduleAt}
              min={toLocalInput(now.toISOString())}
              onChange={(e) => onScheduleChange(e.target.value)}
              aria-invalid={inPast || !scheduleAt}
            />
          </label>

          <div className="pc-presets">
            {presets(now).map((p) => (
              <button
                key={p.label}
                type="button"
                className={`pc-chip${scheduleAt === p.value ? " is-on" : ""}`}
                onClick={() => onScheduleChange(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {!scheduleAt ? (
            <p className="pc-note pc-warn">Pick a date and time to schedule this post.</p>
          ) : inPast ? (
            <p className="pc-note pc-warn">
              That time has already passed. Pick a future time, or choose Publish now.
            </p>
          ) : (
            <p className="pc-note pc-ok">
              Goes live <b>{formatSchedule(iso)}</b> ({timeUntil(iso)}). The article date will be
              set to this time.
            </p>
          )}
          <p className="pc-tz">Times are in {localZoneLabel()}.</p>
        </div>
      )}
    </div>
  );
}

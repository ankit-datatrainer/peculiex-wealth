/**
 * Blog publishing states.
 *
 * A post is stored as `published` + an optional `publish_at`:
 *   draft      published = false
 *   scheduled  published = true, publish_at in the future
 *   live       published = true, publish_at empty or already passed
 *
 * The public API hides a post until its publish_at, so a scheduled post goes
 * live on its own at that minute — nothing has to run at publish time.
 */

export type BlogStatus = "draft" | "scheduled" | "live";
export type PublishMode = "draft" | "now" | "schedule";

export function blogStatus(
  b: { published?: boolean; publish_at?: string | null },
  now: number = Date.now()
): BlogStatus {
  if (!b.published) return "draft";
  if (b.publish_at) {
    const t = new Date(b.publish_at).getTime();
    if (!isNaN(t) && t > now) return "scheduled";
  }
  return "live";
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO → the "YYYY-MM-DDTHH:mm" a datetime-local input wants, in local time. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * datetime-local value → ISO. A zone-less "YYYY-MM-DDTHH:mm" string is local
 * time per the spec, but build it from parts so no engine can read it as UTC.
 */
export function fromLocalInput(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || "");
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], 0, 0);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** "Fri, 24 Oct 2026, 9:00 am" in the viewer's locale and zone. */
export function formatSchedule(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/** "26 Oct, 2:30 pm" — fits under a status pill. */
export function formatScheduleShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** "in 3 days", "in 2 hr 10 min", "in 4 min". */
export function timeUntil(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - now;
  if (isNaN(ms)) return "";
  if (ms <= 0) return "now";
  const min = Math.round(ms / 60000);
  if (min < 60) return `in ${Math.max(1, min)} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `in ${hr} hr${min % 60 ? ` ${min % 60} min` : ""}`;
  const days = Math.round(hr / 24);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

/** The browser's zone, for the "times are in …" hint. */
export function localZoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
  } catch {
    return "local time";
  }
}

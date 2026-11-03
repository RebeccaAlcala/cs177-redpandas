// Display helpers for source cards. Dates use a fixed time zone so the server
// and client render the same string.

const TZ = "America/Los_Angeles";

export function formatSourceDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    // Date-only values (docs) are midnight UTC; format them in UTC so they
    // don't slip back a day in the LA zone.
    timeZone: withTime ? TZ : "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(d);
}

// 95 -> "01:35"
export function formatMmSs(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function isHttpUrl(url?: string): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

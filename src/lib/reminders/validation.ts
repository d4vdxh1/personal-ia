import { isId, validDate } from "@/lib/study/validation";

// Until editable profile timezones are added, the application follows the
// existing Buenos Aires timezone (UTC-03:00) for scheduled local times.
export function localReminderTimeToISO(value: unknown, now = Date.now()): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  try { validDate(value.slice(0,10)); } catch { return null; }
  const instant = new Date(value + ":00-03:00");
  if (!Number.isFinite(instant.getTime()) || instant.getTime() <= now) return null;
  if (instant.toISOString().slice(0,10) < "2000-01-01") return null;
  return instant.toISOString();
}
export function reminderLocalInput(value: string | Date): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone:"America/Argentina/Buenos_Aires",year:"numeric",month:"2-digit",
    day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23",
  }).formatToParts(date);
  const read = (name:string) => parts.find(part => part.type === name)?.value ?? "00";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}
export function parseReminder(form: FormData, now = Date.now()) {
  const title = form.get("title"), notes = form.get("notes");
  const scheduledAt = localReminderTimeToISO(form.get("scheduled_local"), now);
  if (typeof title !== "string" || !title.trim() || title.trim().length > 200 ||
      typeof notes !== "string" || notes.trim().length > 1000 || !scheduledAt) return null;
  return { title: title.trim(), notes: notes.trim(), scheduled_at: scheduledAt };
}
export { isId };

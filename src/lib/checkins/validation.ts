export function parseCheckin(formData: FormData) {
  function rating(name: string, optional = false) {
    const value = formData.get(name);
    if (optional && value === "") return null;
    if (typeof value !== "string" || !/^[1-5]$/.test(value)) return undefined;
    return Number(value);
  }

  const energy = rating("energy");
  const emotional_state = rating("emotional_state");
  const life_rating = rating("life_rating");
  const stress = rating("stress", true);
  const rawSleep = formData.get("sleep_hours");
  const rawNotes = formData.get("notes");
  if (
    energy == null || emotional_state == null || life_rating == null || stress === undefined ||
    typeof rawSleep !== "string" || typeof rawNotes !== "string" ||
    (rawSleep !== "" && !/^\d{1,2}(\.\d{1,2})?$/.test(rawSleep)) ||
    [...rawNotes].length > 10000
  ) return null;

  const sleep_hours = rawSleep === "" ? null : Number(rawSleep);
  if (sleep_hours !== null && (!Number.isFinite(sleep_hours) || sleep_hours < 0 || sleep_hours > 24)) return null;
  return { energy, emotional_state, life_rating, stress, sleep_hours, notes: rawNotes.trim() || null };
}

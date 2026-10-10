export function parseJournalEntry(formData: FormData, today: string) {
  const date = formData.get("entry_date");
  const event = formData.get("relevant_event");
  const notes = formData.get("notes");
  if (typeof date !== "string" || typeof event !== "string" || typeof notes !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "0001-01-01" || date > today) return null;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  if ([...event].length > 2000 || [...notes].length > 10000) return null;
  const relevant_event = event.trim() || null;
  const normalizedNotes = notes.trim() || null;
  if (!relevant_event && !normalizedNotes) return null;
  return { entry_date: date, relevant_event, notes: normalizedNotes };
}

export function journalPage(value: string | string[] | undefined) {
  if (typeof value !== "string" || !/^[1-9]\d{0,5}$/.test(value)) return 1;
  return Number(value);
}

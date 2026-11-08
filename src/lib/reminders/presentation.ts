/** Presentation-only collapse: keep all rows in the database and the scheduler. */
export type RecurringRow = { id: string; series_id: string | null; scheduled_at: string };

export function collapseRecurringReminders<T extends RecurringRow>(rows: readonly T[]) {
  const ordered = [...rows].sort((a,b) =>
    a.scheduled_at.localeCompare(b.scheduled_at) || a.id.localeCompare(b.id));
  const seen = new Set<string>();
  const visible: T[] = [];
  const extras = new Map<string,T[]>();
  for (const reminder of ordered) {
    const seriesId = reminder.series_id;
    if (!seriesId || !seen.has(seriesId)) {
      visible.push(reminder);
      if (seriesId) seen.add(seriesId);
    } else {
      const later = extras.get(seriesId) ?? [];
      later.push(reminder);
      extras.set(seriesId, later);
    }
  }
  return { visible, extras };
}

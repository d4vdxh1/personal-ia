/** Presentation only: never change generated rows or Cron/Push behavior. */
export type RecurringRow = { id: string; series_id: string | null; scheduled_at: string };

export function collapseRecurringReminders<T extends RecurringRow>(
  rows: readonly T[], nowISO = new Date().toISOString(),
) {
  const ordered = [...rows].sort((a,b) =>
    a.scheduled_at.localeCompare(b.scheduled_at) || a.id.localeCompare(b.id));
  const series = new Map<string,T[]>();
  const visible: T[] = [];
  const extras = new Map<string,T[]>();
  for (const reminder of ordered) {
    if (!reminder.series_id) {
      visible.push(reminder);
      continue;
    }
    const group=series.get(reminder.series_id)??[];
    group.push(reminder);
    series.set(reminder.series_id,group);
  }
  for(const [seriesId, group] of series) {
    // Prefer the next future alert; if all are overdue, show the latest one
    // so it remains actionable rather than silently disappearing.
    const next=group.find(r=>r.scheduled_at>=nowISO)??group[group.length-1];
    visible.push(next);
    extras.set(seriesId,group.filter(r=>r.id!==next.id));
  }
  visible.sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at)||a.id.localeCompare(b.id));
  return {visible,extras};
}

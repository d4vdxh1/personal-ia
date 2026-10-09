import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export { WEEKDAYS } from "./constants";

export type HabitRecord = {
  id: string;
  name: string;
  weekdays: number[];
  done: boolean;
};

export type HabitToday = Pick<HabitRecord, "id" | "name" | "done">;

export function getBuenosAiresToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 } as Record<string, number>)[value("weekday")];
  return { date: `${value("year")}-${value("month")}-${value("day")}`, weekday };
}

export async function loadHabits(supabase: SupabaseClient, userId: string) {
  const [{ data: habits, error: habitsError }, today] = await Promise.all([
    supabase.from("habits").select("id, name, weekdays, active, created_at").eq("user_id", userId).eq("active", true).order("created_at"),
    Promise.resolve(getBuenosAiresToday()),
  ]);
  if (habitsError) return { habits: [], date: today.date, weekday: today.weekday, error: true };

  const { data: entries, error: entriesError } = habits.length
    ? await supabase.from("habit_entries").select("habit_id, completed").eq("user_id", userId).eq("entry_date", today.date)
    : { data: [], error: null };
  if (entriesError) return { habits: [], date: today.date, weekday: today.weekday, error: true };

  const completed = new Map((entries ?? []).map((entry) => [entry.habit_id, entry.completed]));
  return {
    habits: habits.map((habit) => ({ ...habit, weekdays: [...habit.weekdays], done: completed.get(habit.id) ?? false })) as HabitRecord[],
    date: today.date,
    weekday: today.weekday,
    error: false,
  };
}

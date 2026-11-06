import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Exercise, Plan, Schedule, Session, TrainingSet, Metric, Symptom } from "./types";
export async function loadTrainingToday(client: SupabaseClient, userId: string, today: string) {
  const [schedule, sessions] = await Promise.all([
    client.from("training_schedule").select("id, plan_id, scheduled_date").eq("user_id", userId).eq("scheduled_date", today),
    client.from("training_sessions").select("id, plan_name, status, schedule_id").eq("user_id", userId).eq("entry_date", today).order("started_at", { ascending: false }),
  ]);
  return { schedule: (schedule.data ?? []) as Schedule[], sessions: (sessions.data ?? []) as Session[], error: Boolean(schedule.error || sessions.error) };
}
export type TrainingView = "week" | "exercises" | "plans" | "history" | "health";

/**
 * Only request data required by the current training view.
 * Previously all seven tables were fetched for every submenu click.
 * Ownership filters and auth remain unchanged.
 */
export async function loadTraining(
  client: SupabaseClient, userId: string, page: number, today: string, view: TrainingView = "week",
) {
  const showWeek = view === "week";
  const showExercises = view === "exercises" || view === "plans";
  const showPlans = showWeek || view === "plans";
  const showHistory = view === "history";
  const showHealth = view === "health";
  const empty = () => Promise.resolve({ data: [], error: null });
  const results = await Promise.all([
    showExercises
      ? client.from("training_exercises").select("*").eq("user_id", userId).order("created_at").limit(200)
      : empty(),
    showPlans
      ? client.from("training_plans").select("*").eq("user_id", userId).order("created_at").limit(100)
      : empty(),
    view === "plans"
      ? client.from("training_plan_items").select("*").eq("user_id", userId).order("position").limit(2000)
      : empty(),
    showWeek
      ? client.from("training_schedule").select("*").eq("user_id", userId).gte("scheduled_date", today).order("scheduled_date").limit(60)
      : empty(),
    showWeek || showHistory
      ? client.from("training_sessions").select("*", { count: "exact" }).eq("user_id", userId)
          .order("entry_date", { ascending: false }).order("started_at", { ascending: false }).order("id")
          .range((page - 1) * 10, page * 10 - 1)
      : Promise.resolve({ data: [], error: null, count: 0 }),
    showHealth
      ? client.from("training_metrics").select("*").eq("user_id", userId)
          .order("entry_date", { ascending: false }).range((page - 1) * 10, page * 10 - 1)
      : empty(),
    showHealth
      ? client.from("training_symptoms").select("*").eq("user_id", userId)
          .order("entry_date", { ascending: false }).order("id").range((page - 1) * 10, page * 10 - 1)
      : empty(),
  ]);
  const sessions = (results[4].data ?? []) as Session[];
  const sets = showHistory && sessions.length
    ? await client.from("training_sets").select("*").eq("user_id", userId)
        .in("session_id", sessions.map(s => s.id)).order("position").order("set_number").limit(2000)
    : { data: [], error: null };
  const items = (results[2].data ?? []) as (Plan["items"][number] & { plan_id: string })[];
  const itemsByPlan = new Map<string, Plan["items"]>();
  for (const item of items) {
    const existing = itemsByPlan.get(item.plan_id) ?? [];
    existing.push(item);
    itemsByPlan.set(item.plan_id, existing);
  }
  return {
    exercises: (results[0].data ?? []) as Exercise[],
    plans: ((results[1].data ?? []) as Plan[]).map(plan => ({
      ...plan, items: itemsByPlan.get(plan.id) ?? [],
    })),
    schedule: (results[3].data ?? []) as Schedule[],
    sessions, sets: (sets.data ?? []) as TrainingSet[],
    metrics: (results[5].data ?? []) as Metric[],
    symptoms: (results[6].data ?? []) as Symptom[],
    count: results[4].count ?? 0,
    error: results.some(result => Boolean(result.error)) || Boolean(sets.error),
  };
}

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoalStatus } from "./validation";

export type GoalRecord = {
  id: string;
  title: string;
  type: "weekly" | "monthly";
  target_date: string;
  progress: number;
  status: GoalStatus;
};

export const GOALS_PAGE_SIZE = 10;

export async function loadGoals(supabase: SupabaseClient, userId: string, page: number, status: GoalStatus | "all") {
  let query = supabase.from("goals")
    .select("id, title, type, target_date, progress, status", { count: "exact" })
    .eq("user_id", userId);
  if (status !== "all") query = query.eq("status", status);
  const offset = (page - 1) * GOALS_PAGE_SIZE;
  const { data, error, count } = await query
    .order("target_date", { ascending: true })
    .order("id", { ascending: true })
    .range(offset, offset + GOALS_PAGE_SIZE - 1);
  return { goals: (data ?? []) as GoalRecord[], error: Boolean(error), count: count ?? 0 };
}

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export type Reminder = {
  id: string; title: string; notes: string; scheduled_at: string;
  status: "pending" | "completed" | "cancelled";
};
export async function loadReminders(client: SupabaseClient, userId: string) {
  const { data, error } = await client.from("reminders")
    .select("id,title,notes,scheduled_at,status").eq("user_id",userId)
    .order("scheduled_at",{ascending:true}).limit(100);
  return { reminders: (data ?? []) as Reminder[], error: Boolean(error) };
}

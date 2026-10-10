import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JournalEntry } from "@/lib/journal/data";

export async function loadTodayJournal(supabase: SupabaseClient, userId: string, date: string) {
  const { data, error, count } = await supabase.from("journal_entries")
    .select("id, entry_date, relevant_event, notes", { count: "exact" })
    .eq("user_id", userId)
    .eq("entry_date", date)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(3);
  return { entries: (data ?? []) as JournalEntry[], count: count ?? 0, error: Boolean(error) };
}

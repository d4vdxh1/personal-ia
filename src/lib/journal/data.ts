import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type JournalEntry = {
  id: string;
  entry_date: string;
  relevant_event: string | null;
  notes: string | null;
};

export const JOURNAL_PAGE_SIZE = 10;

export async function loadJournal(supabase: SupabaseClient, userId: string, page: number) {
  const offset = (page - 1) * JOURNAL_PAGE_SIZE;
  const { data, error, count } = await supabase.from("journal_entries")
    .select("id, entry_date, relevant_event, notes", { count: "exact" })
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + JOURNAL_PAGE_SIZE - 1);
  return { entries: (data ?? []) as JournalEntry[], error: Boolean(error), count: count ?? 0 };
}

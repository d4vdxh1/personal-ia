import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBuenosAiresToday } from "@/lib/habits/data";

export type DailyCheckin = {
  energy: number;
  emotional_state: number;
  life_rating: number;
  sleep_hours: number | null;
  stress: number | null;
  notes: string | null;
};

export async function loadCheckin(supabase: SupabaseClient, userId: string, date = getBuenosAiresToday().date) {
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("energy, emotional_state, life_rating, sleep_hours, stress, notes")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .maybeSingle();
  return { checkin: data as DailyCheckin | null, date, error: Boolean(error) };
}

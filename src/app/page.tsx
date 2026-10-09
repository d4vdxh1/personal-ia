import { DayDemo } from "@/components/day-demo";
import { LogoutForm } from "@/components/auth/logout-form";
import { getAccount } from "@/lib/auth/account";
import { loadHabits } from "@/lib/habits/data";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { user, profile } = await getAccount();
  const displayName = profile?.display_name.trim() || user.email?.split("@")[0] || "ahí";
  const supabase = await createClient();
  const todayHabits = await loadHabits(supabase, user.id);
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const habits = todayHabits.habits.filter((habit) => habit.weekdays.includes(todayHabits.weekday));
  return <><LogoutForm /><DayDemo dateLabel={dateLabel} displayName={displayName} habits={habits} habitsError={todayHabits.error} date={todayHabits.date} /></>;
}

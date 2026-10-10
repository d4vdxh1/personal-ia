import { TrackingShell } from "@/components/tracking-shell";
import { HabitManager } from "@/components/habits/manager";
import { getAccount } from "@/lib/auth/account";
import { loadHabits } from "@/lib/habits/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const { user, profile } = await getAccount();
  const supabase = await createClient();
  const result = await loadHabits(supabase, user.id);
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${result.date}T12:00:00-03:00`));

  return (
    <TrackingShell title="Hábitos" dateLabel={dateLabel} active="habits"
      displayName={profile?.display_name.trim() || user.email || "?"}
      copy="Elegí los días que querés practicar cada hábito.">
      {result.error ? (
        <p role="alert" className="form-error">No pudimos cargar tus hábitos. Actualizá la página o volvé a ingresar.</p>
      ) : <HabitManager habits={result.habits} />}
    </TrackingShell>
  );
}

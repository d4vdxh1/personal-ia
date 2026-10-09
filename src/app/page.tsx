import Link from "next/link";
import { DayDemo } from "@/components/day-demo";
import { LogoutForm } from "@/components/auth/logout-form";
import { TodayList } from "@/components/habits/today-list";
import { Card } from "@/components/ui/card";
import { getAccount } from "@/lib/auth/account";
import { loadHabits } from "@/lib/habits/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user, profile } = await getAccount();
  const supabase = await createClient();
  const habitsData = await loadHabits(supabase, user.id);

  const displayName = profile?.display_name.trim() || user.email?.split("@")[0] || "ahí";
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const todayHabits = habitsData.habits.filter((h) => h.weekdays.includes(habitsData.weekday));
  const completedCount = todayHabits.filter((h) => h.done).length;
  const progressPercent = todayHabits.length ? Math.round((completedCount / todayHabits.length) * 100) : 0;

  const habitsSlot = (
    <Card title="Hábitos de hoy" eyebrow="LA CONSTANCIA EMPIEZA EN PEQUEÑO" className="habits-card">
      <div className="habit-summary">
        <span aria-live="polite">
          {completedCount} de {todayHabits.length} completados
        </span>
        <strong>{progressPercent}%</strong>
      </div>
      <progress aria-label="Progreso de hábitos de hoy" value={completedCount} max={todayHabits.length || 1} />
      <TodayList habits={todayHabits} date={habitsData.date} />
      <div style={{ marginTop: "14px" }}>
        <Link href="/habits" className="habits-manage">
          Gestionar hábitos →
        </Link>
      </div>
    </Card>
  );

  return (
    <>
      <LogoutForm withSidebar />
      <DayDemo dateLabel={dateLabel} displayName={displayName} habitsSlot={habitsSlot} />
    </>
  );
}

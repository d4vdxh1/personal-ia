import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { GoalComposer, GoalForm } from "@/components/goals/goal-form";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { loadGoals, GOALS_PAGE_SIZE } from "@/lib/goals/data";
import { goalFilter } from "@/lib/goals/validation";
import { journalPage } from "@/lib/journal/validation";

export const dynamic = "force-dynamic";
const statusLabels = { all: "Todos", active: "Activos", completed: "Completados", cancelled: "Cancelados" };
const singularLabels = { active: "Activo", completed: "Completado", cancelled: "Cancelado" };

export default async function GoalsPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[]; status?: string | string[] }>;
}) {
  const { user, profile } = await getAccount();
  const params = await searchParams;
  const page = journalPage(params.page);
  const status = goalFilter(params.status);
  const supabase = await createClient();
  const result = await loadGoals(supabase, user.id, page, status);
  const { date } = getBuenosAiresToday();
  const formatDate = (value: string) => new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${value}T12:00:00-03:00`));
  return (
    <TrackingShell title="Tus objetivos" dateLabel={formatDate(date)} active="goals"
      displayName={profile?.display_name.trim() || user.email || "?"} copy="Elegí una meta y avanzá un paso a la vez.">
      <div className="journal-layout">
        <section className="card journal-card" aria-label="Crear un objetivo"><GoalComposer today={date} /></section>
        <section className="card journal-card" aria-labelledby="goals-list-title">
          <h2 id="goals-list-title">Objetivos y progreso</h2>
          <nav className="goal-filters" aria-label="Filtrar objetivos">
            {Object.entries(statusLabels).map(([value, label]) => <Link key={value} href={`/goals?status=${value}`}
              aria-current={status === value ? "page" : undefined}>{label}</Link>)}
          </nav>
          {result.error ? <p role="alert" className="form-error">No pudimos cargar tus objetivos. Actualizá la página para volver a intentar.</p> : (
            <>
              {result.goals.length === 0 && <p className="habit-empty">No hay objetivos para mostrar. Podés crear uno o cambiar el filtro.</p>}
              <div className="journal-list">
                {result.goals.map((goal) => (
                  <article key={goal.id} className="goal-entry">
                    <h3>{goal.title}</h3>
                    <p className="goal-meta">{goal.type === "weekly" ? "Semanal" : "Mensual"} · {singularLabels[goal.status]}</p>
                    <p className="goal-meta">Fecha límite: <time dateTime={goal.target_date}>{formatDate(goal.target_date)}</time></p>
                    {goal.status === "active" && goal.target_date < date && <p className="goal-overdue">Fecha límite vencida</p>}
                    <div className="habit-summary"><span>Avance</span><strong>{goal.progress}%</strong></div>
                    <progress value={goal.progress} max={100} aria-label={`Avance de ${goal.title}`} />
                    <details className="journal-entry"><summary>Editar objetivo</summary><GoalForm today={date} goal={goal} /></details>
                  </article>
                ))}
              </div>
              <nav className="journal-pagination" aria-label="Páginas de objetivos">
                {page > 1 && <Link className="secondary-button" href={`/goals?status=${status}&page=${page - 1}`}>Anterior</Link>}
                <span>Página {page}</span>
                {page * GOALS_PAGE_SIZE < result.count && <Link className="secondary-button" href={`/goals?status=${status}&page=${page + 1}`}>Siguiente</Link>}
                {page > 1 && <Link className="secondary-button" href={`/goals?status=${status}`}>Volver al inicio</Link>}
              </nav>
            </>
          )}
        </section>
      </div>
    </TrackingShell>
  );
}

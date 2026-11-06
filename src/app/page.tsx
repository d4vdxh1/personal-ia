import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { TodayList } from "@/components/habits/today-list";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getAccount } from "@/lib/auth/account";
import { loadHabits } from "@/lib/habits/data";
import { loadCheckin } from "@/lib/checkins/data";
import { loadGoals } from "@/lib/goals/data";
import { loadTodayJournal } from "@/lib/today/data";
import { createClient } from "@/lib/supabase/server";
import { loadTrainingToday } from "@/lib/training/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user, profile } = await getAccount();
  const supabase = await createClient();
  const habitsData = await loadHabits(supabase, user.id);
  const [checkinData, journalData, goalsData, trainingData] = await Promise.all([
    loadCheckin(supabase, user.id, habitsData.date),
    loadTodayJournal(supabase, user.id, habitsData.date),
    loadGoals(supabase, user.id, 1, "active"),
    loadTrainingToday(supabase, user.id, habitsData.date),
  ]);

  const displayName = profile?.display_name.trim() || user.email?.split("@")[0] || "ahí";
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${habitsData.date}T12:00:00-03:00`));

  const todayHabits = habitsData.habits.filter((h) => h.weekdays.includes(habitsData.weekday));
  const completedCount = todayHabits.filter((h) => h.done).length;
  const progressPercent = todayHabits.length ? Math.round((completedCount / todayHabits.length) * 100) : 0;

  const habitsSlot = (
    <Card title="Hábitos de hoy" eyebrow="LA CONSTANCIA EMPIEZA EN PEQUEÑO" className="habits-card">
      {habitsData.error ? <p role="alert" className="form-error">No pudimos cargar tus hábitos. Volvé a intentar.</p> : <>
      <div className="habit-summary">
        <span aria-live="polite">
          {completedCount} de {todayHabits.length} completados
        </span>
        <strong>{progressPercent}%</strong>
      </div>
      <progress aria-label="Progreso de hábitos de hoy" value={completedCount} max={todayHabits.length || 1} />
      <TodayList habits={todayHabits} date={habitsData.date} />
      </>}
      <div style={{ marginTop: "14px" }}>
        <Link href="/habits" className="habits-manage">
          Gestionar hábitos →
        </Link>
      </div>
    </Card>
  );

  return (
    <TrackingShell active="today" title={`Mi día, ${displayName}`} dateLabel={dateLabel}
      displayName={displayName} copy="Tus registros de hoy y los objetivos que querés alcanzar. Un paso a la vez.">
      <nav className="tracking-tabs" aria-label="Registro rápido">
        <Link href="/check-in">Check-in</Link>
        <Link href="/habits">Hábitos</Link>
        <Link href="/journal">Escribir una nota</Link>
        <Link href="/goals">Objetivos</Link>
        <Link href="/training">Entrenamiento</Link>
      </nav>
      <section className="day-hero" aria-label="Resumen de tu día">
        <div className="hero-content">
          <p className="hero-kicker"><Icon name="sun" /> TU DÍA, A TU MANERA</p>
          <h2>Hoy también cuenta<span>.</span></h2>
          <p className="hero-subtitle">Un lugar para ver cómo vas y elegir tu siguiente paso. Sin apuro, con intención.</p>
          <div className="hero-metrics" role="list">
            <div className="hero-metric" role="listitem">
              <strong>{completedCount}/{todayHabits.length}</strong>
              <span>hábitos realizados</span>
            </div>
            <div className="hero-metric" role="listitem">
              <strong>{checkinData.error ? "—" : checkinData.checkin ? "Listo" : "Pendiente"}</strong>
              <span>check-in diario</span>
            </div>
            <div className="hero-metric" role="listitem">
              <strong>{trainingData.error ? "—" : trainingData.sessions.some(s => s.status === "completed") ? "Hecho" : trainingData.sessions.length || trainingData.schedule.length ? "Planificado" : "Libre"}</strong>
              <span>entrenamiento</span>
            </div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit">
            <div className="hero-ring" style={{ background: `conic-gradient(#80ead2 0% ${progressPercent}%, #ffffff40 ${progressPercent}% 100%)` }}>
              <div className="hero-ring-inner"><strong>{progressPercent}%</strong><small>hábitos de hoy</small></div>
            </div>
          </div>
        </div>
      </section>
      <div className="dashboard-grid">
        <Card title="Entrenamiento de hoy" eyebrow="A TU RITMO">
          {trainingData.error ? <p role="alert" className="form-error">No pudimos cargar tu entrenamiento.</p> : <>
            {trainingData.sessions.map(s => <p key={s.id}><Link className="training-open" href={`/training/${s.id}`}>{s.plan_name} · {s.status === 'completed' ? 'Completada' : 'Continuar sesión'}</Link></p>)}
            {trainingData.schedule.length > 0 && !trainingData.sessions.some(s => s.schedule_id === trainingData.schedule[0].id) && <p>Tenés un entrenamiento programado para hoy.</p>}
            {!trainingData.schedule.length && !trainingData.sessions.length && <p className="habit-empty">No hay entrenamiento programado para hoy.</p>}
          </>}
          <Link href="/training" className="habits-manage">Ver semana o iniciar entrenamiento →</Link>
        </Card>
        {habitsSlot}
        <Card title="Tu check-in de hoy" eyebrow="UN MOMENTO PARA VOS">
          {checkinData.error ? (
            <p role="alert" className="form-error">No pudimos cargar tu check-in. Volvé a intentar.</p>
          ) : checkinData.checkin ? (
            <dl className="checkin-summary">
              <div><dt>Sueño</dt><dd>{checkinData.checkin.sleep_hours === null ? "Sin registrar" : `${checkinData.checkin.sleep_hours} h`}</dd></div>
              <div><dt>Energía</dt><dd>{checkinData.checkin.energy}/5</dd></div>
              <div><dt>Estado de ánimo</dt><dd>{checkinData.checkin.emotional_state}/5</dd></div>
              <div><dt>Satisfacción</dt><dd>{checkinData.checkin.life_rating}/5</dd></div>
              <div><dt>Estrés</dt><dd>{checkinData.checkin.stress === null ? "Sin registrar" : `${checkinData.checkin.stress}/5`}</dd></div>
            </dl>
          ) : <p className="habit-empty">Todavía no registraste cómo estás hoy.</p>}
          <Link href="/check-in" className="habits-manage">{checkinData.checkin ? "Ver o actualizar check-in →" : "Registrar check-in →"}</Link>
        </Card>
        <Card title="Objetivos y próximos vencimientos" eyebrow="TU PROGRESO REAL">
          {goalsData.error ? <p role="alert" className="form-error">No pudimos cargar tus objetivos. Volvé a intentar.</p>
            : goalsData.count === 0 ? <p className="habit-empty">No tenés objetivos activos. Podés crear uno o consultar tu historial.</p>
            : <>
              <p className="goal-meta">{goalsData.count} objetivos activos · hasta 3 vencimientos más cercanos</p>
              {goalsData.goals.slice(0, 3).map((goal) => (
                <article className="goal-entry" key={goal.id}>
                  <h3>{goal.title}</h3>
                  <p className="goal-meta">{goal.type === "weekly" ? "Semanal" : "Mensual"} · <time dateTime={goal.target_date}>{goal.target_date.split("-").reverse().join("/")}</time> · {goal.progress}%</p>
                  {goal.target_date < habitsData.date && <p className="goal-overdue">Vencido · podés actualizarlo en Objetivos.</p>}
                  <progress aria-label={`Avance de ${goal.title}`} max={100} value={goal.progress} />
                </article>
              ))}
            </>}
          <Link href="/goals?status=active" className="habits-manage">Ver objetivos →</Link>
        </Card>
        <Card title="Tu diario de hoy" eyebrow="GUARDÁ LO QUE IMPORTA">
          {journalData.error ? <p role="alert" className="form-error">No pudimos cargar tu diario. Volvé a intentar.</p>
            : journalData.count === 0 ? <p className="habit-empty">Todavía no escribiste en tu diario hoy.</p>
            : <>
              <p className="goal-meta">{journalData.count} entradas hoy · hasta 3 más recientes</p>
              {journalData.entries.map((entry) => (
                <article className="today-note" key={entry.id}>
                  {entry.relevant_event && <h3>{entry.relevant_event.slice(0, 180)}{entry.relevant_event.length > 180 ? "…" : ""}</h3>}
                  {entry.notes && <p>{entry.notes.slice(0, 240)}{entry.notes.length > 240 ? "…" : ""}</p>}
                </article>
              ))}
            </>}
          <Link href="/journal" className="habits-manage">Leer el diario o escribir una nota →</Link>
        </Card>
      </div>
    </TrackingShell>
  );
}

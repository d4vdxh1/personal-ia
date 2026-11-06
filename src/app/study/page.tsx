import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { StudyComposer, StudyForm } from "@/components/study/study-form";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { loadStudy } from "@/lib/study/data";
import { viewParam } from "@/lib/study/validation";
import type { StudyView } from "@/lib/study/types";

export const dynamic = "force-dynamic";
const tabs: { view: StudyView; title: string }[] = [
  { view: "overview", title: "Resumen" }, { view: "subjects", title: "Materias" },
  { view: "assignments", title: "Tareas" }, { view: "exams", title: "Exámenes" },
  { view: "sessions", title: "Sesiones de estudio" },
];
const format = (value: string) => value.split("-").reverse().join("/");

export default async function StudyPage({ searchParams }: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { user, profile } = await getAccount();
  const { view: viewValue } = await searchParams;
  const view = viewParam(viewValue);
  const { date: today } = getBuenosAiresToday();
  const client = await createClient();
  const result = await loadStudy(client, user.id, view);
  const subjectName = (id: string) => result.subjects.find(s => s.id === id)?.name ?? "Materia archivada";
  const active = result.subjects.filter(s => s.active);
  const pending = result.assignments.filter(t => t.status !== "completed");
  const upcoming = result.exams.filter(e => e.status === "scheduled" && e.exam_date >= today);
  const minutes = result.sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  return <TrackingShell title="Universidad y Estudio" active="study" studyView={view}
    dateLabel={format(today)} displayName={profile?.display_name.trim() || user.email || "?"}
    copy="Materias, entregas, exámenes y tiempo de estudio, organizados en un mismo lugar.">
    <nav className="tracking-tabs study-view-tabs" aria-label="Secciones de estudio">
      {tabs.map(tab => <Link key={tab.view} href={tab.view === "overview" ? "/study" : `/study?view=${tab.view}`}
        aria-current={view === tab.view ? "page" : undefined}>{tab.title}</Link>)}
    </nav>
    {result.error ? <section className="card"><p role="alert" className="form-error">
      No pudimos cargar tus registros de estudio. Verificá la conexión y que la migración de la Fase 3 esté aplicada.
    </p></section> : <>
      {view === "overview" && <>
        <section className="study-overview" aria-label="Tu progreso académico">
          <div className="study-stat"><strong>{active.length}</strong><span>Materias activas</span></div>
          <div className="study-stat"><strong>{pending.length}</strong><span>Tareas pendientes</span></div>
          <div className="study-stat"><strong>{upcoming.length}</strong><span>Exámenes próximos</span></div>
          <div className="study-stat"><strong>{Math.round(minutes / 60 * 10) / 10} h</strong><span>Estudio registrado (últimas 100 sesiones)</span></div>
        </section>
        <div className="journal-layout">
          <section className="card study-card">
            <p className="eyebrow">TUS ENTREGAS</p><h2>Próximas tareas</h2>
            {pending.length === 0 ? <p className="habit-empty">No hay tareas pendientes.</p> :
              pending.slice(0, 5).map(t => <div className="study-list-row" key={t.id}>
                <div><strong>{t.title}</strong><p>{subjectName(t.subject_id)}</p></div>
                <span className={t.due_date < today ? "study-overdue" : ""}>{format(t.due_date)}</span>
              </div>)}
            <Link className="habits-manage" href="/study?view=assignments">Gestionar tareas →</Link>
          </section>
          <section className="card study-card">
            <p className="eyebrow">FECHAS IMPORTANTES</p><h2>Próximos exámenes</h2>
            {upcoming.length === 0 ? <p className="habit-empty">No hay exámenes programados.</p> :
              upcoming.slice(0, 5).map(e => <div className="study-list-row" key={e.id}>
                <div><strong>{e.title}</strong><p>{subjectName(e.subject_id)}</p></div>
                <span>{format(e.exam_date)}</span>
              </div>)}
            <Link className="habits-manage" href="/study?view=exams">Ver exámenes →</Link>
          </section>
        </div>
        <section className="card study-card">
          <p className="eyebrow">EMPEZÁ POR ACÁ</p><h2>Organizá tu semestre</h2>
          <p className="form-hint">Primero creá tus materias. Después agregá tareas, exámenes y sesiones de estudio para obtener un resumen real.</p>
          <Link className="habits-manage" href="/study?view=subjects">Ir a mis materias →</Link>
        </section>
      </>}
      {view === "subjects" && <div className="habit-manager">
        <section className="card study-card"><StudyComposer entity="subject" subjects={result.subjects} today={today}/></section>
        <section className="card study-card"><h2>Mis materias</h2>
          {result.subjects.length === 0 && <p className="habit-empty">Todavía no registraste materias.</p>}
          {result.subjects.map(s => <article className="study-record" key={s.id}>
            <div className="study-record-head"><h3>{s.name}</h3><span className="study-chip">{s.active ? "Activa" : "Archivada"}</span></div>
            <p className="goal-meta">{s.semester || "Sin semestre"} · Prioridad {s.priority}</p>
            {s.professor && <p className="goal-meta">Docente: {s.professor}</p>}
            {s.schedule_notes && <p>{s.schedule_notes}</p>}
            <details><summary>Editar materia</summary><StudyForm entity="subject" subjects={result.subjects} today={today} record={s}/></details>
          </article>)}
        </section>
      </div>}
      {view === "assignments" && <div className="journal-layout">
        <section className="card study-card"><StudyComposer entity="assignment" subjects={result.subjects} today={today}/></section>
        <section className="card study-card"><h2>Tareas y entregas</h2>
          {result.assignments.length === 0 && <p className="habit-empty">No hay tareas registradas.</p>}
          {result.assignments.map(a => <article className="study-record" key={a.id}>
            <div className="study-record-head"><h3>{a.title}</h3><span className="study-chip">{a.status === "completed" ? "Completada" : a.status === "in_progress" ? "En progreso" : "Pendiente"}</span></div>
            <p className="goal-meta">{subjectName(a.subject_id)} · Entrega: {format(a.due_date)} · Prioridad {a.priority}</p>
            {a.due_date < today && a.status !== "completed" && <p className="study-overdue">Entrega vencida</p>}
            {a.details && <p>{a.details}</p>}
            <details><summary>Editar tarea</summary><StudyForm entity="assignment" subjects={result.subjects} today={today} record={a}/></details>
          </article>)}
        </section>
      </div>}
      {view === "exams" && <div className="journal-layout">
        <section className="card study-card"><StudyComposer entity="exam" subjects={result.subjects} today={today}/></section>
        <section className="card study-card"><h2>Exámenes</h2>
          {result.exams.length === 0 && <p className="habit-empty">No hay exámenes registrados.</p>}
          {result.exams.map(e => <article className="study-record" key={e.id}>
            <div className="study-record-head"><h3>{e.title}</h3><span className="study-chip">{e.status === "completed" ? "Completado" : e.status === "cancelled" ? "Cancelado" : "Programado"}</span></div>
            <p className="goal-meta">{subjectName(e.subject_id)} · {format(e.exam_date)} · {e.exam_type}</p>
            {e.notes && <p>{e.notes}</p>}
            <details><summary>Editar examen</summary><StudyForm entity="exam" subjects={result.subjects} today={today} record={e}/></details>
          </article>)}
        </section>
      </div>}
      {view === "sessions" && <div className="journal-layout">
        <section className="card study-card"><StudyComposer entity="session" subjects={result.subjects} today={today}/></section>
        <section className="card study-card"><h2>Historial de estudio</h2>
          {result.sessions.length === 0 && <p className="habit-empty">Registrá tu primera sesión para ver el historial.</p>}
          {result.sessions.map(s => <article className="study-record" key={s.id}>
            <div className="study-record-head"><h3>{s.topic}</h3><span className="study-chip">{s.duration_minutes} min</span></div>
            <p className="goal-meta">{subjectName(s.subject_id)} · {format(s.study_date)}</p>
            {s.notes && <p>{s.notes}</p>}
            <details><summary>Editar sesión</summary><StudyForm entity="session" subjects={result.subjects} today={today} record={s}/></details>
          </article>)}
        </section>
      </div>}
    </>}
  </TrackingShell>;
}

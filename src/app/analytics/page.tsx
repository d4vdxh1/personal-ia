import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { buildAnalytics, lastNDates, paraguayDate } from "@/lib/analytics/summary";
import { loadAnalytics } from "@/lib/analytics/data";
import { TrendLine } from "@/components/analytics/trend-line";

export const dynamic="force-dynamic";
const dateLabel=(date:string)=>new Intl.DateTimeFormat("es-PY",{timeZone:"UTC",weekday:"short",day:"2-digit",month:"2-digit"})
 .format(new Date(`${date}T12:00:00Z`));
export default async function AnalyticsPage(){
 const {user,profile}=await getAccount();
 const dates=lastNDates(paraguayDate());
 const client=await createClient();
 const result=await loadAnalytics(client,user.id,dates);
 const report=result.data?buildAnalytics(dates,result.data):null;
 const maximum=Math.max(1,...(report?.daily.map(d=>d.studyMinutes)??[]));
 return <TrackingShell title="Mis estadísticas" active="analytics" dateLabel="ÚLTIMOS 7 DÍAS · HORA DE PARAGUAY"
   copy="Un resumen de tus registros reales. Esta vista es provisional para el MVP."
   displayName={profile?.display_name?.trim()||user.email||"Usuario"}>
  {!report?<section className="card"><p className="form-error" role="alert">
    No pudimos cargar las estadísticas completas. Reintentá más tarde para evitar mostrar cifras incompletas.
  </p></section>:<>
   <section className="analytics-metrics" aria-label="Indicadores de la semana">
    <article className="card analytics-stat"><span>Hábitos cumplidos</span>
     <strong>{report.habits.percentage===null?"—":`${report.habits.percentage}%`}</strong>
     <small>{report.habits.completed} de {report.habits.scheduled} ocasiones programadas</small>
    </article>
    <article className="card analytics-stat"><span>Estudio registrado</span>
     <strong>{report.study.hours} h</strong><small>{report.study.minutes} minutos en 7 días</small>
    </article>
    <article className="card analytics-stat"><span>Entrenamientos</span>
     <strong>{report.training.completed}</strong><small>{report.training.scheduled} programados · las sesiones extra también cuentan</small>
    </article>
    <article className="card analytics-stat"><span>Energía promedio</span>
     <strong>{report.checkin.averageEnergy===null?"—":`${report.checkin.averageEnergy}/5`}</strong>
     <small>{report.checkin.days} check-ins registrados</small>
    </article>
   </section>
   <div className="analytics-layout">
    <section className="card analytics-detail">
     <h2>Tiempo de estudio por día</h2>
     <p className="goal-meta">Los minutos se calculan desde tus sesiones registradas.</p>
     <TrendLine label="Tendencia diaria de minutos de estudio" points={report.daily.map(d=>({label:dateLabel(d.date).split(" ")[0],value:d.studyMinutes}))}/>
     <div className="analytics-daily">
      {report.daily.map(d=><div className="analytics-daily-row" key={d.date}>
       <span>{dateLabel(d.date)}</span>
       <progress aria-label={`Estudio del ${dateLabel(d.date)}`} max={maximum} value={d.studyMinutes}/>
       <strong>{d.studyMinutes} min</strong>
      </div>)}
     </div>
     <Link href="/study?view=sessions" className="habits-manage">Ver sesiones de estudio →</Link>
    </section>
    <section className="card analytics-detail">
     <h2>Tu registro semanal</h2>
     <dl className="analytics-facts">
      <div><dt>Promedio de sueño</dt><dd>{report.checkin.averageSleep===null?"Sin datos":`${report.checkin.averageSleep} h`}</dd></div>
      <div><dt>Objetivos activos</dt><dd>{report.goals.active}</dd></div>
      <div><dt>Progreso medio de objetivos activos</dt><dd>{report.goals.averageProgress===null?"Sin datos":`${report.goals.averageProgress}%`}</dd></div>
      <div><dt>Objetivos completados (histórico)</dt><dd>{report.goals.completed}</dd></div>
     </dl>
     <Link href="/goals" className="habits-manage">Gestionar objetivos →</Link>
    </section>
   </div>
   <section className="card analytics-detail" aria-label="Cumplimiento diario de hábitos">
    <h2>Hábitos realizados por día</h2>
    <div className="analytics-daily">
     {report.daily.map(d=><div className="analytics-daily-row" key={d.date}>
      <span>{dateLabel(d.date)}</span>
      <progress aria-label={`Hábitos del ${dateLabel(d.date)}`} value={d.completedHabits} max={d.scheduledHabits||1}/>
      <strong>{d.completedHabits}/{d.scheduledHabits}</strong>
     </div>)}
    </div>
    <p className="goal-meta">La tasa considera hábitos actualmente activos y programados desde su fecha de creación. Días sin registros no se consideran cumplidos.</p>
   </section>
  </>}
 </TrackingShell>;
}

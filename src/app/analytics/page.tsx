import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { buildAnalytics, lastNDates, paraguayDate } from "@/lib/analytics/summary";
import { loadAnalytics } from "@/lib/analytics/data";
import { TrendLine } from "@/components/analytics/trend-line";
import { AnalyticsReview } from "@/components/analytics/analytics-review";
import { compareAnalytics, resolvePeriod, periodDays } from "@/lib/analytics/comparison";

export const dynamic="force-dynamic";
const dateLabel=(date:string)=>new Intl.DateTimeFormat("es-PY",{timeZone:"UTC",weekday:"short",day:"2-digit",month:"2-digit"})
 .format(new Date(`${date}T12:00:00Z`));
export default async function AnalyticsPage({searchParams}:{searchParams:Promise<{period?:string}>}){
 const {user,profile}=await getAccount();
 const {period:periodParam}=await searchParams;
 const period=resolvePeriod(periodParam);
 const days=periodDays(period);
 const allDates=lastNDates(paraguayDate(),days*2);
 const dates=allDates.slice(days);
 const client=await createClient();
 const result=await loadAnalytics(client,user.id,allDates);
 const report=result.data?buildAnalytics(dates,result.data):null;
 const previous=result.data?buildAnalytics(allDates.slice(0,days),result.data):null;
 const changes=report&&previous?compareAnalytics(report,previous):null;
 const maximum=Math.max(1,...(report?.daily.map(d=>d.studyMinutes)??[]));
 const signed=(value:number|null,suffix="")=>value===null?"Sin comparación":`${value>0?"+":""}${value}${suffix}`;
 return <TrackingShell title="Mis estadísticas" active="analytics" dateLabel={`ÚLTIMOS ${days} DÍAS · HORA DE PARAGUAY`}
   copy="Tus registros reales y su comparación con el período anterior. Vista provisional para el MVP."
   displayName={profile?.display_name?.trim()||user.email||"Usuario"}>
  <nav className="analytics-period-nav" aria-label="Elegir período estadístico">
   <Link href="/analytics?period=week" aria-current={period==="week"?"page":undefined}>7 días</Link>
   <Link href="/analytics?period=month" aria-current={period==="month"?"page":undefined}>30 días</Link>
  </nav>
  {!report?<section className="card"><p className="form-error" role="alert">
    No pudimos cargar las estadísticas completas. Reintentá más tarde para evitar mostrar cifras incompletas.
  </p></section>:<>
   <section className="analytics-metrics" aria-label="Indicadores de la semana">
    <article className="card analytics-stat"><span>Hábitos cumplidos</span>
     <strong>{report.habits.percentage===null?"—":`${report.habits.percentage}%`}</strong>
     <small>{report.habits.completed} de {report.habits.scheduled} ocasiones programadas</small>
    </article>
    <article className="card analytics-stat"><span>Estudio registrado</span>
     <strong>{report.study.hours} h</strong><small>{report.study.minutes} minutos en {days} días</small>
    </article>
    <article className="card analytics-stat"><span>Entrenamientos</span>
     <strong>{report.training.completed}</strong><small>{report.training.scheduled} programados · las sesiones extra también cuentan</small>
    </article>
    <article className="card analytics-stat"><span>Energía promedio</span>
     <strong>{report.checkin.averageEnergy===null?"—":`${report.checkin.averageEnergy}/5`}</strong>
     <small>{report.checkin.days} check-ins registrados</small>
    </article>
   </section>
   {changes&&previous&&<section className="card analytics-detail" aria-label="Comparación con el período anterior">
     <h2>Comparación con los {days} días anteriores</h2>
     <p className="goal-meta">Diferencias absolutas entre períodos de la misma duración; los meses se aproximan con ventanas móviles de 30 días.</p>
     <dl className="analytics-facts">
      <div><dt>Tiempo de estudio</dt><dd>{signed(changes.studyMinutes," min")}</dd></div>
      <div><dt>Sesiones de entrenamiento completadas</dt><dd>{signed(changes.workouts)}</dd></div>
      <div><dt>Cumplimiento de hábitos</dt><dd>{signed(changes.habitPercentagePoints," puntos porcentuales")}</dd></div>
      <div><dt>Energía promedio</dt><dd>{signed(changes.energyDifference," /5")}</dd></div>
      <div><dt>Horas de sueño promedio</dt><dd>{signed(changes.sleepDifference," h")}</dd></div>
     </dl>
    </section>}
   <div className="analytics-layout">
    <section className="card analytics-detail">
     <h2>Tiempo de estudio por día</h2>
     <p className="goal-meta">Los minutos se calculan desde tus sesiones registradas.</p>
     <TrendLine label={`Tendencia diaria de minutos de estudio: ${days} días`} tickEvery={period==="month"?5:1}
       points={report.daily.map(d=>({label:period==="month"?d.date.slice(5):dateLabel(d.date).split(" ")[0],value:d.studyMinutes}))}/>
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
   <AnalyticsReview period={period} enabled={Boolean(process.env.GEMINI_API_KEY)}/>
  </>}
 </TrackingShell>;
}

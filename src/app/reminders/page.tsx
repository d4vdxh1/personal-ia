import Link from "next/link";
import { exportReminderToGoogle } from "./calendar-actions";
import { TrackingShell } from "@/components/tracking-shell";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { RecurrenceForm } from "@/components/reminders/recurrence-form";
import { toggleReminderSeries } from "./recurrence-actions";
import { recurrenceLabel } from "@/lib/reminders/recurrence";
import { PushPermission } from "@/components/reminders/push-permission";
import { closeReminder } from "./actions";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { loadReminders, loadReminderSeries } from "@/lib/reminders/data";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { reminderLocalInput } from "@/lib/reminders/validation";

export const dynamic = "force-dynamic";
export default async function RemindersPage({ searchParams }: { searchParams:Promise<{calendar?:string}> }) {
  const { calendar }=await searchParams;
  const {user,profile} = await getAccount();
  const client = await createClient();
  const { reminders,error } = await loadReminders(client,user.id);
  const {series, error:seriesError}=await loadReminderSeries(client,user.id);
  const { date } = getBuenosAiresToday();
  const pushEnabled = process.env.PUSH_DELIVERY_ENABLED === "true";
  const calendarExportEnabled = process.env.GOOGLE_CALENDAR_WRITE_ENABLED === "true";
  const [calendarConnection, calendarLinks] = calendarExportEnabled ? await Promise.all([
    client.from("google_calendar_connections").select("can_write").eq("user_id",user.id).maybeSingle(),
    client.from("google_calendar_event_links").select("reminder_id").eq("user_id",user.id).limit(100),
  ]) : [null,null];
  const calendarCanWrite=Boolean(calendarConnection?.data?.can_write);
  const linkedReminders=new Set((calendarLinks?.data??[]).map(link=>link.reminder_id));
  const pending = reminders.filter(r=>r.status==="pending");
  const history = reminders.filter(r=>r.status!=="pending");
  const when = (iso:string) => reminderLocalInput(iso).replace("T"," ");
  return <TrackingShell title="Recordatorios" active="reminders" dateLabel={date.split("-").reverse().join("/")}
      displayName={profile?.display_name.trim() || user.email || "?"}
      copy={pushEnabled ? "Administrá tus recordatorios y notificaciones en tus dispositivos." : "Organizá los avisos que querés recibir. Por ahora se guardan en tu lista."}>
    <section className="card reminder-notice" role="note">
      <strong>{pushEnabled ? "Los avisos push están disponibles." : "Los avisos automáticos todavía no están activos."}</strong>
      <p>{pushEnabled ? "Activá las notificaciones en este dispositivo para recibir recordatorios. La entrega depende del navegador, conexión y permisos; puede demorarse." : "En esta primera versión podés guardar y administrar tus recordatorios. La entrega de notificaciones llegará cuando se habilite el programador."}</p>
    </section>
    <PushPermission deliveryEnabled={pushEnabled} />
    {calendarExportEnabled && <section className="card reminder-notice">
      <strong>Exportar recordatorios a Google Calendar</strong>
      <p>Elegí un recordatorio individual para crearlo una sola vez en tu calendario. No se sincronizan cambios ni recurrencias automáticamente.</p>
      {!calendarCanWrite && <Link href="/calendar">Conectar o autorizar Google Calendar</Link>}
      {calendar==="exported" && <p role="status">Recordatorio agregado a Google Calendar.</p>}
      {calendar==="already" && <p role="status">Ese recordatorio ya estaba exportado.</p>}
      {calendar==="invalid" && <p role="alert">El recordatorio no está disponible para exportar.</p>}
      {calendar==="unauthorized" && <p role="alert">Google necesita autorización adicional. Revisá la conexión en Calendar.</p>}
      {calendar==="unavailable" && <p role="alert">No se pudo verificar la exportación. Podés reintentarlo sin duplicar el evento.</p>}
    </section>}
    <section className="card study-card" aria-label="Recordatorios recurrentes">
      <h2>Recordatorios recurrentes</h2>
      {seriesError ? <p className="form-error">No pudimos cargar las series recurrentes.</p> : <>
        <RecurrenceForm />
        {series.length===0 ? <p className="habit-empty">Todavía no tenés series recurrentes.</p> : series.map(item=><article className="study-record" key={item.id}>
          <div className="study-record-head"><h3>{item.title}</h3><span className="study-chip">{item.active?"Activa":"Pausada"}</span></div>
          <p className="goal-meta">{recurrenceLabel(item.frequency,item.weekdays,item.month_day)} · {item.local_time.slice(0,5)} ({item.timezone})</p>
          {item.notes && <p>{item.notes}</p>}
          <form action={toggleReminderSeries} className="reminder-actions"><input type="hidden" name="id" value={item.id}/>
            <button className="secondary-button" name="active" value={item.active?"false":"true"}>{item.active?"Pausar serie":"Reactivar serie"}</button>
          </form>
          <details><summary>Editar serie</summary><RecurrenceForm series={item}/></details>
        </article>)}
      </>}
    </section>
    {error ? <section className="card"><p className="form-error" role="alert">
      No pudimos cargar los recordatorios. Verificá la conexión y que la migración de Fase 5 esté aplicada.
    </p></section> : <div className="journal-layout">
      <section className="card study-card"><ReminderForm/></section>
      <section className="card study-card" aria-label="Lista de recordatorios">
        <h2>Próximos recordatorios</h2>
        {pending.length===0 && <p className="habit-empty">Todavía no tenés recordatorios pendientes.</p>}
        {pending.map(reminder=><article className="study-record" key={reminder.id}>
          <div className="study-record-head"><h3>{reminder.title}</h3><span className="study-chip">Pendiente</span></div>
          <p className="goal-meta">Programado para <time dateTime={reminder.scheduled_at}>{when(reminder.scheduled_at)}</time></p>
          {reminder.notes && <p>{reminder.notes}</p>}
          {calendarExportEnabled && calendarCanWrite && !reminder.series_id && (
            linkedReminders.has(reminder.id)
              ? <p role="status">Exportado a Google Calendar</p>
              : <form action={exportReminderToGoogle} className="reminder-actions">
                  <input type="hidden" name="reminder_id" value={reminder.id}/>
                  <button type="submit" className="secondary-button">Enviar a Google Calendar</button>
                </form>
          )}
          <div className="reminder-actions">
            <form action={closeReminder}><input type="hidden" name="id" value={reminder.id}/>
              <button name="status" value="completed" className="secondary-button">Marcar realizado</button></form>
            <form action={closeReminder}><input type="hidden" name="id" value={reminder.id}/>
              <button name="status" value="cancelled" className="secondary-button">Cancelar</button></form>
          </div>
          <details><summary>Editar</summary><ReminderForm reminder={reminder}/></details>
        </article>)}
        <h2 className="reminder-history-title">Historial</h2>
        {history.length===0 ? <p className="habit-empty">Sin recordatorios finalizados.</p> :
          history.map(reminder=><div className="study-list-row" key={reminder.id}>
            <div><strong>{reminder.title}</strong><p>{when(reminder.scheduled_at)}</p></div>
            <span>{reminder.status==="completed"?"Realizado":"Cancelado"}</span>
          </div>)}
      </section>
    </div>}
  </TrackingShell>;
}

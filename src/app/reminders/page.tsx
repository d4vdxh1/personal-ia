import { TrackingShell } from "@/components/tracking-shell";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { closeReminder } from "./actions";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { loadReminders } from "@/lib/reminders/data";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { reminderLocalInput } from "@/lib/reminders/validation";

export const dynamic = "force-dynamic";
export default async function RemindersPage() {
  const {user,profile} = await getAccount();
  const client = await createClient();
  const { reminders,error } = await loadReminders(client,user.id);
  const { date } = getBuenosAiresToday();
  const pending = reminders.filter(r=>r.status==="pending");
  const history = reminders.filter(r=>r.status!=="pending");
  const when = (iso:string) => reminderLocalInput(iso).replace("T"," ");
  return <TrackingShell title="Recordatorios" active="reminders" dateLabel={date.split("-").reverse().join("/")}
      displayName={profile?.display_name.trim() || user.email || "?"}
      copy="Organizá los avisos que querés recibir. Por ahora se guardan en tu lista.">
    <section className="card reminder-notice" role="note">
      <strong>Los avisos automáticos todavía no están activos.</strong>
      <p>En esta primera versión podés guardar y administrar tus recordatorios. La entrega de notificaciones llegará con el scheduler y la integración de Google Calendar.</p>
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

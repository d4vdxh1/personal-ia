"use client";
import { useActionState, useEffect, useRef } from "react";
import { saveReminder, type ReminderActionState } from "@/app/reminders/actions";
import { reminderLocalInput } from "@/lib/reminders/validation";
import type { Reminder } from "@/lib/reminders/data";
const initial: ReminderActionState = { message:"",error:false,saved:false };

export function ReminderForm({ reminder }: { reminder?: Reminder }) {
  const [state,action,pending] = useActionState(saveReminder,initial);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if(state.saved && !reminder) form.current?.reset(); }, [state.saved,reminder]);
  return <form ref={form} action={action} className="study-form">
    {reminder && <input name="id" type="hidden" value={reminder.id}/>}
    <fieldset disabled={pending}>
      <legend>{reminder ? "Editar recordatorio" : "Nuevo recordatorio"}</legend>
      <div className="study-field">
        <label htmlFor={reminder ? "rem-title-"+reminder.id : "rem-title"}>¿Qué querés recordar?</label>
        <input id={reminder ? "rem-title-"+reminder.id : "rem-title"} name="title" defaultValue={reminder?.title}
          maxLength={200} required placeholder="Ej.: Estudiar para el parcial"/>
      </div>
      <div className="study-field">
        <label htmlFor={reminder ? "rem-at-"+reminder.id : "rem-at"}>Fecha y hora</label>
        <input id={reminder ? "rem-at-"+reminder.id : "rem-at"} name="scheduled_local" type="datetime-local"
          defaultValue={reminder ? reminderLocalInput(reminder.scheduled_at) : ""}
          required/>
      </div>
      <div className="study-field">
        <label htmlFor={reminder ? "rem-notes-"+reminder.id : "rem-notes"}>Notas (opcional)</label>
        <textarea id={reminder ? "rem-notes-"+reminder.id : "rem-notes"} name="notes"
          defaultValue={reminder?.notes ?? ""} maxLength={1000} rows={3}/>
      </div>
      <button type="submit" className="auth-submit">{pending ? "Guardando…" : reminder ? "Guardar cambios" : "Agregar a mi lista"}</button>
    </fieldset>
    {state.message && <p className={state.error ? "form-error" : "form-success"} role={state.error?"alert":"status"}>{state.message}</p>}
  </form>;
}

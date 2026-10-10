"use client";

import { useActionState, useId, useState } from "react";
import { saveJournalEntry } from "@/app/journal/actions";
import type { JournalEntry } from "@/lib/journal/data";

export function JournalComposer({ today }: { today: string }) {
  const [version, setVersion] = useState(0);
  return <JournalForm key={version} today={today} onNew={() => setVersion(version + 1)} />;
}

export function JournalForm({ today, entry, onNew }: { today: string; entry?: JournalEntry; onNew?: () => void }) {
  const prefix = useId();
  const [state, action, pending] = useActionState(saveJournalEntry, { message: "", error: false, saved: false });
  const [values, setValues] = useState({
    entry_date: entry?.entry_date ?? today,
    relevant_event: entry?.relevant_event ?? "",
    notes: entry?.notes ?? "",
  });

  if (!entry && state.saved) return (
    <div className="journal-saved">
      <p role="status" className="form-success">{state.message}</p>
      <button type="button" className="secondary-button" onClick={onNew}>Escribir otra entrada</button>
    </div>
  );

  return (
    <form action={action} className="journal-form">
      {entry && <input type="hidden" name="entryId" value={entry.id} />}
      <fieldset disabled={pending}>
        <legend>{entry ? "Editar entrada" : "Nueva entrada"}</legend>
        <p className="form-hint">Completá al menos un hecho relevante o una nota. Podés escribir varias entradas por día.</p>
        <div className="journal-field">
          <label htmlFor={`${prefix}-date`}>Fecha</label>
          <input id={`${prefix}-date`} type="date" name="entry_date" min="0001-01-01" max={today} required
            value={values.entry_date} onChange={(event) => setValues({ ...values, entry_date: event.target.value })} />
        </div>
        <div className="journal-field">
          <label htmlFor={`${prefix}-event`}>Hecho relevante</label>
          <textarea id={`${prefix}-event`} name="relevant_event" rows={3} maxLength={2000}
            placeholder="Algo que pasó hoy y querés recordar…" value={values.relevant_event}
            onChange={(event) => setValues({ ...values, relevant_event: event.target.value })} />
        </div>
        <div className="journal-field">
          <label htmlFor={`${prefix}-notes`}>Notas</label>
          <textarea id={`${prefix}-notes`} name="notes" rows={5} maxLength={10000}
            placeholder="Un aprendizaje, algo positivo o algo que querés mejorar…" value={values.notes}
            onChange={(event) => setValues({ ...values, notes: event.target.value })} />
        </div>
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? "Guardando…" : entry ? "Guardar cambios" : "Guardar entrada"}
        </button>
      </fieldset>
      {state.message && <p role={state.error ? "alert" : "status"} className={state.error ? "form-error" : "form-success"}>{state.message}</p>}
    </form>
  );
}

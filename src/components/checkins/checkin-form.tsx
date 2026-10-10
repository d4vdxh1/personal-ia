"use client";

import { useActionState, useState } from "react";
import { saveCheckin } from "@/app/check-in/actions";
import type { DailyCheckin } from "@/lib/checkins/data";

const scales = [
  { name: "energy", label: "Energía", hint: "1: muy baja · 5: muy alta", required: true },
  { name: "emotional_state", label: "Estado de ánimo", hint: "1: muy bajo · 5: muy bueno", required: true },
  { name: "life_rating", label: "Satisfacción con tu día", hint: "1: muy baja · 5: muy alta", required: true },
  { name: "stress", label: "Estrés (opcional)", hint: "1: muy bajo · 5: muy alto", required: false },
] as const;

export function CheckinForm({ checkin, date }: { checkin: DailyCheckin | null; date: string }) {
  const [state, action, pending] = useActionState(saveCheckin, { message: "", error: false });
  const [values, setValues] = useState({
    energy: String(checkin?.energy ?? ""),
    emotional_state: String(checkin?.emotional_state ?? ""),
    life_rating: String(checkin?.life_rating ?? ""),
    stress: String(checkin?.stress ?? ""),
    sleep_hours: String(checkin?.sleep_hours ?? ""),
    notes: checkin?.notes ?? "",
  });

  return (
    <form action={action} className="checkin-form">
      <input type="hidden" name="entryDate" value={date} />
      <fieldset disabled={pending}>
        <legend>¿Cómo estás hoy?</legend>
        <p className="form-hint">Completá las tres escalas principales. El sueño, el estrés y las notas son opcionales.</p>
        <div className="checkin-fields">
          <div className="checkin-field">
            <label htmlFor="sleep-hours">Horas de sueño</label>
            <input id="sleep-hours" name="sleep_hours" type="number" min="0" max="24" step="0.01"
              placeholder="Por ejemplo, 7.5" value={values.sleep_hours}
              onChange={(event) => setValues({ ...values, sleep_hours: event.target.value })} />
          </div>
          {scales.map((scale) => (
            <div className="checkin-field" key={scale.name}>
              <label htmlFor={scale.name}>{scale.label}</label>
              <select id={scale.name} name={scale.name} required={scale.required}
                aria-describedby={`${scale.name}-hint`} value={values[scale.name]}
                onChange={(event) => setValues({ ...values, [scale.name]: event.target.value })}>
                <option value="">{scale.required ? "Elegí un valor" : "Sin registrar"}</option>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <small id={`${scale.name}-hint`}>{scale.hint}</small>
            </div>
          ))}
        </div>
        <div className="checkin-field">
          <label htmlFor="checkin-notes">Notas (opcional)</label>
          <textarea id="checkin-notes" name="notes" rows={5} maxLength={10000}
            placeholder="Lo que quieras recordar de hoy…" value={values.notes}
            onChange={(event) => setValues({ ...values, notes: event.target.value })} />
        </div>
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar check-in de hoy"}
        </button>
      </fieldset>
      {state.message && <p className={state.error ? "form-error" : "form-success"} role={state.error ? "alert" : "status"}>{state.message}</p>}
    </form>
  );
}

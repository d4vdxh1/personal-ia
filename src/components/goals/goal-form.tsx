"use client";

import { useActionState, useId, useState } from "react";
import { saveGoal } from "@/app/goals/actions";
import type { GoalRecord } from "@/lib/goals/data";

export function GoalComposer({ today }: { today: string }) {
  const [version, setVersion] = useState(0);
  return <GoalForm key={version} today={today} onNew={() => setVersion(version + 1)} />;
}

export function GoalForm({ today, goal, onNew }: { today: string; goal?: GoalRecord; onNew?: () => void }) {
  const prefix = useId();
  const [state, action, pending] = useActionState(saveGoal, { message: "", error: false, saved: false });
  const [values, setValues] = useState({
    title: goal?.title ?? "",
    type: goal?.type ?? "weekly",
    target_date: goal?.target_date ?? today,
    progress: String(goal?.progress ?? 0),
    status: goal?.status ?? "active",
  });
  if (!goal && state.saved) return (
    <div className="journal-saved">
      <p className="form-success" role="status">{state.message}</p>
      <button type="button" className="secondary-button" onClick={onNew}>Crear otro objetivo</button>
    </div>
  );
  return (
    <form className="goal-form" action={action}>
      {goal && <input type="hidden" name="goalId" value={goal.id} />}
      <fieldset disabled={pending}>
        <legend>{goal ? "Editar objetivo" : "Nuevo objetivo"}</legend>
        <div className="journal-field">
          <label htmlFor={`${prefix}-title`}>Título</label>
          <input id={`${prefix}-title`} name="title" required maxLength={200} value={values.title}
            placeholder="Por ejemplo, leer un libro este mes"
            onChange={(event) => setValues({ ...values, title: event.target.value })} />
        </div>
        <div className="goal-fields">
          <div className="journal-field">
            <label htmlFor={`${prefix}-type`}>Tipo</label>
            <select id={`${prefix}-type`} name="type" value={values.type}
              onChange={(event) => setValues({ ...values, type: event.target.value as GoalRecord["type"] })}>
              <option value="weekly">Semanal</option><option value="monthly">Mensual</option>
            </select>
          </div>
          <div className="journal-field">
            <label htmlFor={`${prefix}-date`}>Fecha límite</label>
            <input id={`${prefix}-date`} name="target_date" type="date" required min="0001-01-01" max="9999-12-31"
              value={values.target_date} onChange={(event) => setValues({ ...values, target_date: event.target.value })} />
          </div>
          <div className="journal-field">
            <label htmlFor={`${prefix}-progress`}>Avance (%)</label>
            <input id={`${prefix}-progress`} name="progress" type="number" min="0" max="100" step="1" required
              value={values.progress} onChange={(event) => setValues({ ...values, progress: event.target.value,
                status: values.status === "completed" && event.target.value !== "100" ? "active" : values.status })} />
          </div>
          <div className="journal-field">
            <label htmlFor={`${prefix}-status`}>Estado</label>
            <select id={`${prefix}-status`} name="status" value={values.status}
              onChange={(event) => setValues({ ...values, status: event.target.value as GoalRecord["status"],
                progress: event.target.value === "completed" ? "100" : values.progress })}>
              <option value="active">Activo</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
        <p className="form-hint">Elegir Completado fija el avance en 100%. Si lo bajás, vuelve a Activo. Cancelar conserva el objetivo y su avance.</p>
        <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Guardando…" : goal ? "Guardar cambios" : "Crear objetivo"}</button>
      </fieldset>
      {state.message && <p role={state.error ? "alert" : "status"} className={state.error ? "form-error" : "form-success"}>{state.message}</p>}
    </form>
  );
}

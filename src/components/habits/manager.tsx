"use client";

import { useActionState } from "react";
import { archiveHabit, createHabit, updateHabit } from "@/app/habits/actions";
import { WEEKDAYS } from "@/lib/habits/constants";
import type { HabitRecord } from "@/lib/habits/data";

const initialState = { message: "", error: false };

export function HabitManager({ habits }: { habits: HabitRecord[] }) {
  const [state, action, pending] = useActionState(createHabit, initialState);
  return (
    <div className="habit-manager">
      <section className="card" aria-labelledby="new-habit-title">
        <p className="eyebrow">UN HÁBITO A LA VEZ</p>
        <h2 id="new-habit-title">Agregar hábito</h2>
        <HabitFields submitLabel={pending ? "Guardando…" : "Crear hábito"} disabled={pending} action={action} />
        <ActionFeedback state={state} />
      </section>
      <section className="card" aria-labelledby="habits-title">
        <p className="eyebrow">TUS HÁBITOS ACTIVOS</p>
        <h2 id="habits-title">Hábitos</h2>
        {habits.length === 0 ? (
          <p className="habit-empty">Todavía no hay hábitos. Cuando agregues uno, aparecerá acá.</p>
        ) : (
          <div className="habit-manager-list">
            {habits.map((habit) => (
              <HabitEditor key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HabitFields({
  action,
  name = "",
  weekdays = [1, 2, 3, 4, 5, 6, 7],
  submitLabel,
  disabled,
}: {
  action: (payload: FormData) => void;
  name?: string;
  weekdays?: number[];
  submitLabel: string;
  disabled: boolean;
}) {
  return (
    <form action={action} className="habit-form">
      <label htmlFor={name ? undefined : "new-habit-name"}>Nombre del hábito</label>
      <input
        id={name ? undefined : "new-habit-name"}
        name="name"
        defaultValue={name}
        maxLength={120}
        required
        minLength={1}
        placeholder="Por ejemplo, caminar 20 minutos"
      />
      <fieldset>
        <legend>¿Qué días?</legend>
        <div className="weekday-options">
          {WEEKDAYS.map((day) => (
            <label key={day.value}>
              <input type="checkbox" name="weekdays" value={day.value} defaultChecked={weekdays.includes(day.value)} />
              <span>{day.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button className="auth-submit" disabled={disabled} type="submit">
        {submitLabel}
      </button>
    </form>
  );
}

function HabitEditor({ habit }: { habit: HabitRecord }) {
  const [editState, editAction, editPending] = useActionState(updateHabit, initialState);
  const [archiveState, archiveAction, archivePending] = useActionState(archiveHabit, initialState);
  return (
    <article className="habit-editor">
      <form action={editAction} className="habit-form">
        <input type="hidden" name="habitId" value={habit.id} />
        <label htmlFor={`habit-${habit.id}`}>Nombre del hábito</label>
        <input id={`habit-${habit.id}`} name="name" defaultValue={habit.name} maxLength={120} required minLength={1} />
        <fieldset>
          <legend>Días programados</legend>
          <div className="weekday-options">
            {WEEKDAYS.map((day) => (
              <label key={day.value}>
                <input
                  type="checkbox"
                  name="weekdays"
                  value={day.value}
                  defaultChecked={habit.weekdays.includes(day.value)}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="secondary-button" disabled={editPending} type="submit">
          {editPending ? "Guardando…" : "Guardar cambios"}
        </button>
        <ActionFeedback state={editState} />
      </form>
      <form action={archiveAction}>
        <input type="hidden" name="habitId" value={habit.id} />
        <button className="archive-button" disabled={archivePending} type="submit">
          {archivePending ? "Archivando…" : "Archivar"}
        </button>
        <ActionFeedback state={archiveState} />
      </form>
    </article>
  );
}

function ActionFeedback({ state }: { state: { message: string; error: boolean } }) {
  return state.message ? (
    <p className={state.error ? "form-error" : "form-success"} role="status">
      {state.message}
    </p>
  ) : null;
}

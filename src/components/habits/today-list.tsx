"use client";

import { useActionState } from "react";
import { toggleHabit } from "@/app/habits/actions";
import type { HabitToday } from "@/lib/habits/data";

const initialState = { message: "", error: false };

export function TodayList({ habits, date }: { habits: HabitToday[]; date: string }) {
  if (habits.length === 0) {
    return (
      <p className="habit-empty">
        No hay hábitos programados para hoy. Podés agregarlos o cambiar sus días desde la gestión de hábitos.
      </p>
    );
  }

  return (
    <div className="habit-list">
      {habits.map((habit) => (
        <HabitToggle key={habit.id} habit={habit} date={date} />
      ))}
    </div>
  );
}

function HabitToggle({ habit, date }: { habit: HabitToday; date: string }) {
  const [state, action, pending] = useActionState(toggleHabit, initialState);
  const next = !habit.done;

  return (
    <form action={action} className={habit.done ? "habit-row is-done" : "habit-row"}>
      <input type="hidden" name="habitId" value={habit.id} />
      <input type="hidden" name="entryDate" value={date} />
      <input type="hidden" name="completed" value={String(next)} />
      <button
        className="habit-toggle"
        type="submit"
        aria-label={`${next ? "Marcar" : "Desmarcar"} ${habit.name}`}
        aria-pressed={habit.done}
        disabled={pending}
      >
        <span aria-hidden="true" className={habit.done ? "habit-check checked" : "habit-check"}>
          {habit.done ? "✓" : ""}
        </span>
      </button>
      <span className="habit-label">
        <strong>{habit.name}</strong>
      </span>
      {state.message && (
        <span className={state.error ? "habit-feedback error" : "habit-feedback"} role="status">
          {state.message}
        </span>
      )}
    </form>
  );
}

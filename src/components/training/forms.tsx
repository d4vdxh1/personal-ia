"use client";
import Link from "next/link";
import { useActionState, useId, useState, type ReactNode } from "react";
import { trainingAction } from "@/app/training/actions";
import type { Exercise, Plan, Schedule, Session, TrainingSet } from "@/lib/training/types";

function Form({ operation, children, label, fresh = false }: { operation: string; children: ReactNode; label: string; fresh?: boolean }) {
  const [state, action, pending] = useActionState(trainingAction, { message: "", error: false, saved: false });
  const [again, setAgain] = useState(false);
  if (operation === "start" && state.sessionId) return <div><p role="status" className="form-success">{state.message}</p><Link className="training-open" href={`/training/${state.sessionId}`}>Abrir sesión →</Link></div>;
  if (fresh && state.saved && !again) return <div className="journal-saved"><p role="status" className="form-success">{state.message}</p><button className="secondary-button" onClick={() => setAgain(true)} type="button">Agregar otro registro</button></div>;
  return <form className="training-form" action={async data => { setAgain(false); await action(data); }} onReset={event => event.preventDefault()}>
    <input name="operation" type="hidden" value={operation} />
    <fieldset disabled={pending}>{children}<button className="auth-submit" type="submit" disabled={pending}>{pending ? "Guardando…" : label}</button></fieldset>
    {state.message && <p className={state.error ? "form-error" : "form-success"} role={state.error ? "alert" : "status"}>{state.message}</p>}
    {state.sessionId && <Link className="training-open" href={`/training/${state.sessionId}`}>Abrir sesión →</Link>}
  </form>;
}
function Field({ label, name, value, type = "text", min, max, step, required = false }: { label: string; name: string; value?: string | number; type?: string; min?: string | number; max?: string | number; step?: string; required?: boolean }) {
  const id = useId();
  return <div className="checkin-field"><label htmlFor={id}>{label}</label><input id={id} name={name} type={type} defaultValue={value} required={required} min={min} max={type === "text" ? undefined : max} maxLength={type === "text" ? Number(max ?? 120) : undefined} step={step} /></div>;
}
function Notes({ value = "" }: { value?: string }) { const id = useId(); return <div className="checkin-field"><label htmlFor={id}>Notas</label><textarea id={id} name="notes" defaultValue={value} maxLength={2000} rows={3} /></div>; }
export function ExerciseForm({ exercise }: { exercise?: Exercise }) {
  return <Form operation="exercise" label={exercise ? "Guardar ejercicio" : "Crear ejercicio"} fresh={!exercise}>
    <legend>{exercise ? "Editar ejercicio" : "Nuevo ejercicio"}</legend>{exercise && <input type="hidden" name="id" value={exercise.id} />}
    <Field label="Nombre del ejercicio" name="name" value={exercise?.name} max={120} required />
    <div className="goal-fields"><Field label="Grupo muscular" name="muscle_group" value={exercise?.muscle_group} max={100} /><Field label="Equipo" name="equipment" value={exercise?.equipment} max={100} /></div>
    <Notes value={exercise?.notes} />
  </Form>;
}
export function ArchiveForm({ id, kind }: { id: string; kind: "exercise" | "plan" }) {
  return <Form operation="archive" label="Archivar"><input type="hidden" name="id" value={id} /><input type="hidden" name="kind" value={kind} /><p className="form-hint">Se conserva el historial. Las rutinas con ejercicios archivados deben actualizarse antes de iniciarlas.</p></Form>;
}
export function PlanForm({ exercises, plan }: { exercises: Exercise[]; plan?: Plan }) {
  const [rows, setRows] = useState(plan?.items.map((i, n) => ({ ...i, key: String(n) })) ?? [{ key: "initial", exercise_id: "", sets: 3, reps: 10, weight_kg: 0, rest_seconds: 60 }]);
  const patch = (index: number, field: string, value: string) => setRows(rows.map((row, n) => n === index ? { ...row, [field]: value } : row));
  return <Form operation="plan" label={plan ? "Guardar rutina" : "Crear rutina"} fresh={!plan}>
    <legend>{plan ? "Editar rutina" : "Nueva rutina"}</legend>{plan && <input type="hidden" name="id" value={plan.id} />}
    <Field label="Nombre de la rutina" name="name" value={plan?.name} max={120} required /><Notes value={plan?.notes} />
    <p className="form-hint">Hasta 20 ejercicios. La carga prevista se registra en kg; 0 permite peso corporal. Reordená con las flechas.</p>
    <input type="hidden" name="items" value={JSON.stringify(rows)} />
    {rows.map((row, index) => <div className="training-item" key={row.key}>
      <label>Ejercicio {index + 1}<select aria-label={`Ejercicio ${index + 1}`} value={row.exercise_id} required onChange={e => patch(index, "exercise_id", e.target.value)}><option value="">Elegí un ejercicio</option>{exercises.filter(e => e.active || e.id === row.exercise_id).map(e => <option value={e.id} key={e.id}>{e.name}{!e.active ? " (archivado; reemplazalo)" : ""}</option>)}</select></label>
      <div className="training-values">{([['sets', 'Series', 1, 10], ['reps', 'Repeticiones', 1, 200], ['weight_kg', 'Carga (kg)', 0, 1000], ['rest_seconds', 'Descanso (s)', 0, 900]] as const).map(([field, label, min, max]) => <label key={field}>{label}<input aria-label={`${label} ejercicio ${index + 1}`} type="number" min={min} max={max} step={field === 'weight_kg' ? '0.01' : '1'} value={row[field]} required onChange={e => patch(index, field, e.target.value)} /></label>)}</div>
      <div className="training-buttons"><button type="button" disabled={index === 0} aria-label={`Subir ejercicio ${index + 1}`} onClick={() => { const next = [...rows]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setRows(next); }}>↑</button><button type="button" disabled={index === rows.length - 1} aria-label={`Bajar ejercicio ${index + 1}`} onClick={() => { const next = [...rows]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; setRows(next); }}>↓</button><button type="button" disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, n) => n !== index))}>Quitar ejercicio {index + 1}</button></div>
    </div>)}
    <button className="secondary-button" type="button" disabled={rows.length >= 20} onClick={() => setRows([...rows, { key: crypto.randomUUID(), exercise_id: "", sets: 3, reps: 10, weight_kg: 0, rest_seconds: 60 }])}>Agregar ejercicio</button>
  </Form>;
}
export function ScheduleForm({ plans, today, schedule }: { plans: Plan[]; today: string; schedule?: Schedule }) {
  const id = useId();
  return <Form operation="schedule" label={schedule ? "Reprogramar" : "Programar entrenamiento"} fresh={!schedule}>
    <legend>{schedule ? "Cambiar fecha o rutina" : "Organizar la semana"}</legend>{schedule && <input type="hidden" name="id" value={schedule.id} />}
    <div className="checkin-field"><label htmlFor={id}>Rutina</label><select id={id} name="plan_id" required defaultValue={schedule?.plan_id ?? ""}><option value="">Elegí una rutina</option>{plans.filter(p => p.active).map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></div>
    <Field name="scheduled_date" label="Fecha programada" type="date" value={schedule?.scheduled_date ?? today} min={today} max="9999-12-31" required />
    <p className="form-hint">Un entrenamiento por fecha. Elegí horarios que respeten tu trabajo, universidad y descanso.</p>
  </Form>;
}
export function CancelSchedule({ id }: { id: string }) { return <Form operation="cancel" label="Cancelar programación"><input type="hidden" name="id" value={id} /></Form>; }
export function StartForm({ planId, scheduleId, requestId }: { planId: string; scheduleId?: string; requestId: string }) {
  return <Form operation="start" label="Iniciar sesión de entrenamiento"><input type="hidden" name="id" value={requestId} /><input type="hidden" name="plan_id" value={planId} />{scheduleId && <input type="hidden" name="schedule_id" value={scheduleId} />}</Form>;
}
export function SessionForm({ session, sets }: { session: Session; sets: TrainingSet[] }) {
  const [rows, setRows] = useState(sets);
  return <Form operation="session" label="Guardar borrador">
    <input type="hidden" name="id" value={session.id} /><input type="hidden" name="sets" value={JSON.stringify(rows)} />
    <legend>Registrar series</legend><p className="form-hint">Marcá solo las series realizadas. Podés omitir las demás; se conservan como previstas. Guardá el borrador antes de salir.</p>
    {rows.map((row, i) => <div className="training-item" key={row.id}><h3>{row.exercise_name} · serie {row.set_number}</h3>
      <label className="training-check"><input aria-label={`Realizada ${row.exercise_name} serie ${row.set_number}`} type="checkbox" checked={row.done} onChange={e => setRows(rows.map((r, n) => n === i ? { ...r, done: e.target.checked } : r))} />Realizada</label>
      <div className="training-values">{([['reps', 'Repeticiones', 0, 200], ['weight_kg', 'Carga (kg)', 0, 1000], ['rpe', 'Dificultad (1–10)', 1, 10]] as const).map(([field, label, min, max]) => <label key={field}>{label}<input aria-label={`${label} ${row.exercise_name} serie ${row.set_number}`} type="number" min={min} max={max} step={field === 'weight_kg' ? '0.01' : '1'} value={row[field] ?? ""} onChange={e => setRows(rows.map((r, n) => n === i ? { ...r, [field]: e.target.value } as unknown as TrainingSet : r))} /></label>)}</div>
    </div>)}
    <div className="goal-fields"><Field label="Duración (minutos)" name="duration_minutes" type="number" value={session.duration_minutes ?? ""} min={1} max={600} step="1" /><Field label="Dificultad de la sesión (1–10)" name="rpe" type="number" value={session.rpe ?? ""} min={1} max={10} step="1" /></div><Notes value={session.notes} />
    <p className="form-hint">Para completar: al menos una serie realizada, duración y dificultad. Una sesión completada queda como historial.</p>
    <button className="secondary-button" type="submit" name="complete" value="true">Completar entrenamiento</button>
  </Form>;
}
export function MetricForm({ today }: { today: string }) {
  return <Form operation="metric" label="Guardar medidas" fresh><legend>Medidas corporales</legend><Field label="Fecha de medidas" name="entry_date" type="date" value={today} min="0001-01-01" max={today} required /><div className="goal-fields"><Field label="Peso corporal (kg)" name="weight_kg" type="number" min={20} max={500} step="0.01" /><Field label="Cintura (cm)" name="waist_cm" type="number" min={20} max={300} step="0.01" /><Field label="Brazo (cm)" name="arm_cm" type="number" min={5} max={100} step="0.01" /></div><Notes /><p className="form-hint">Al menos una medida. Guardar en la misma fecha reemplaza sus medidas anteriores.</p></Form>;
}
export function SymptomForm({ today, sessionId }: { today: string; sessionId?: string }) {
  const id = useId();
  return <Form operation="symptom" label="Guardar molestia" fresh><legend>Molestias y bloqueos</legend>{sessionId && <input type="hidden" name="session_id" value={sessionId} />}<Field label="Fecha de molestia" name="entry_date" type="date" value={today} min="0001-01-01" max={today} required /><Field label="Zona o molestia" name="area" required max={120} /><Field label="Intensidad (0–10)" name="intensity" type="number" min={0} max={10} value={0} required step="1" /><label className="training-check" htmlFor={id}><input id={id} name="locking" type="checkbox" />Hubo bloqueo</label><Notes /><p className="form-hint">Registro personal; no genera diagnósticos ni indicaciones de carga.</p></Form>;
}

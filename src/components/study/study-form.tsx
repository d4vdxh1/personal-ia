"use client";

import { useActionState, useId, useState } from "react";
import { saveStudy } from "@/app/study/actions";
import type { Assignment, Exam, StudySession, Subject } from "@/lib/study/types";

type Entity = "subject" | "assignment" | "exam" | "session";
type RecordForForm = Subject | Assignment | Exam | StudySession;

export function StudyComposer({ entity, subjects, today }: {
  entity: Entity; subjects: Subject[]; today: string;
}) {
  const [version, setVersion] = useState(0);
  return <StudyForm key={version} entity={entity} subjects={subjects} today={today}
    onNew={() => setVersion(v => v + 1)} />;
}

export function StudyForm({ entity, subjects, today, record, onNew }: {
  entity: Entity; subjects: Subject[]; today: string; record?: RecordForForm; onNew?: () => void;
}) {
  const [state, action, pending] = useActionState(saveStudy, { message: "", error: false, saved: false });
  const id = useId();
  const value = (key: string) => record && key in record ? String(record[key as keyof typeof record] ?? "") : "";
  const currentSubject = value("subject_id");
  const activeSubjects = subjects.filter(s => s.active || s.id === currentSubject);
  const label = entity === "subject" ? "materia" : entity === "assignment" ? "tarea" :
    entity === "exam" ? "examen" : "sesión de estudio";

  if (!record && state.saved) return (
    <div className="journal-saved">
      <p className="form-success" role="status">{state.message}</p>
      <button type="button" className="secondary-button" onClick={onNew}>Agregar otro registro</button>
    </div>
  );
  return (
    <form className="study-form" action={action}>
      <input type="hidden" name="entity" value={entity} />
      {record && <input type="hidden" name="id" value={record.id} />}
      <fieldset disabled={pending}>
        <legend>{record ? "Editar" : "Nueva"} {label}</legend>
        {entity !== "subject" && <div className="study-field">
          <label htmlFor={id+"-subject"}>Materia</label>
          <select id={id+"-subject"} name="subject_id" defaultValue={currentSubject} required>
            <option value="">Elegí una materia</option>
            {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>}
        {entity === "subject" && <>
          <Field id={id} name="name" label="Nombre de la materia" initial={value("name")} max={120} required />
          <div className="study-form-columns">
            <Field id={id} name="professor" label="Profesor/a (opcional)" initial={value("professor")} max={120} />
            <Field id={id} name="semester" label="Semestre o período" initial={value("semester")} max={60} />
          </div>
          <Field id={id} name="schedule_notes" label="Días y horarios (opcional)" initial={value("schedule_notes")} max={500} />
          <div className="study-field">
            <label htmlFor={id+"-priority"}>Prioridad</label>
            <select id={id+"-priority"} name="priority" defaultValue={value("priority") || "3"}>
              <option value="1">1 · Muy alta</option><option value="2">2 · Alta</option>
              <option value="3">3 · Normal</option><option value="4">4 · Baja</option><option value="5">5 · Muy baja</option>
            </select>
          </div>
          {record && <div className="study-field">
            <label htmlFor={id+"-active"}>Estado</label>
            <select id={id+"-active"} name="active" defaultValue={value("active")}>
              <option value="true">Activa</option><option value="false">Archivada</option>
            </select>
          </div>}
        </>}
        {entity === "assignment" && <>
          <Field id={id} name="title" label="Título de la tarea" initial={value("title")} max={200} required />
          <div className="study-form-columns">
            <Field id={id} name="due_date" label="Fecha límite" type="date" initial={value("due_date") || today} required />
            <div className="study-field"><label htmlFor={id+"-priority"}>Prioridad</label>
              <select id={id+"-priority"} name="priority" defaultValue={value("priority") || "2"}>
                <option value="1">Alta</option><option value="2">Media</option><option value="3">Baja</option>
              </select></div>
          </div>
          <div className="study-field"><label htmlFor={id+"-status"}>Estado</label>
            <select id={id+"-status"} name="status" defaultValue={value("status") || "pending"}>
              <option value="pending">Pendiente</option><option value="in_progress">En progreso</option>
              <option value="completed">Completada</option>
            </select></div>
          <LongField id={id} name="details" label="Descripción (opcional)" initial={value("details")} />
        </>}
        {entity === "exam" && <>
          <Field id={id} name="title" label="Nombre del examen" initial={value("title")} max={200} required />
          <div className="study-form-columns">
            <Field id={id} name="exam_date" label="Fecha del examen" type="date" initial={value("exam_date") || today} required />
            <div className="study-field"><label htmlFor={id+"-type"}>Tipo</label>
              <select id={id+"-type"} name="exam_type" defaultValue={value("exam_type") || "exam"}>
                <option value="exam">Examen</option><option value="quiz">Prueba corta</option>
                <option value="presentation">Presentación</option><option value="other">Otro</option>
              </select></div>
          </div>
          <div className="study-field"><label htmlFor={id+"-status"}>Estado</label>
            <select id={id+"-status"} name="status" defaultValue={value("status") || "scheduled"}>
              <option value="scheduled">Programado</option><option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select></div>
          <LongField id={id} name="notes" label="Temas o anotaciones (opcional)" initial={value("notes")} />
        </>}
        {entity === "session" && <>
          <Field id={id} name="topic" label="Tema estudiado" max={200} initial={value("topic")} required />
          <div className="study-form-columns">
            <Field id={id} name="study_date" label="Fecha" type="date" initial={value("study_date") || today} maxDate={today} required />
            <Field id={id} name="duration_minutes" label="Minutos estudiados" type="number"
              initial={value("duration_minutes") || "30"} min={1} max={720} required />
          </div>
          <LongField id={id} name="notes" label="Qué aprendiste (opcional)" initial={value("notes")} />
        </>}
        <button type="submit" className="auth-submit" disabled={pending}>{pending ? "Guardando…" : record ? "Guardar cambios" : "Registrar"}</button>
      </fieldset>
      {state.message && <p role={state.error ? "alert" : "status"} className={state.error ? "form-error" : "form-success"}>{state.message}</p>}
    </form>
  );
}

function Field({ id, name, label, initial, max, type = "text", required = false, min, maxDate }: {
  id: string; name: string; label: string; initial?: string; max?: number; type?: string;
  required?: boolean; min?: number; maxDate?: string;
}) {
  return <div className="study-field"><label htmlFor={id+"-"+name}>{label}</label>
    <input id={id+"-"+name} name={name} type={type} defaultValue={initial}
      maxLength={type === "text" ? max : undefined} min={type === "number" ? min : undefined}
      max={type === "number" ? max : maxDate} required={required} /></div>;
}
function LongField({ id, name, label, initial }: { id: string; name: string; label: string; initial: string }) {
  return <div className="study-field"><label htmlFor={id+"-"+name}>{label}</label>
    <textarea id={id+"-"+name} name={name} rows={3} maxLength={2000} defaultValue={initial} /></div>;
}

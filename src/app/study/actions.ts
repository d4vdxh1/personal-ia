"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ASSIGNMENT_STATUSES, EXAM_STATUSES, EXAM_TYPES, choice, integer,
  isId, optionalText, requiredText, validDate,
} from "@/lib/study/validation";

export type StudyActionState = { message: string; error: boolean; saved: boolean };
const failed = (message: string): StudyActionState => ({ message, error: true, saved: false });
const succeeded = (message: string): StudyActionState => ({ message, error: false, saved: true });

export async function saveStudy(
  _state: StudyActionState, form: FormData,
): Promise<StudyActionState> {
  try {
    const entity = form.get("entity");
    if (!["subject","assignment","exam","session"].includes(String(entity))) throw new Error("Operación inválida.");
    const id = form.get("id");
    if (id !== null && id !== "" && !isId(id)) throw new Error("Registro inválido.");
    const client = await createClient();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return failed("Tu sesión venció. Ingresá de nuevo.");

    const userId = auth.user.id;
    const subjectId = form.get("subject_id");
    const subject = async () => {
      if (!isId(subjectId)) throw new Error("Elegí una materia.");
      const { data, error } = await client.from("study_subjects")
        .select("id").eq("id", subjectId).eq("user_id", userId).eq("active", true).maybeSingle();
      if (error || !data) throw new Error("La materia no está disponible.");
      return subjectId;
    };
    let table: "study_subjects" | "study_assignments" | "study_exams" | "study_sessions";
    let values: Record<string, string | number | boolean>;
    if (entity === "subject") {
      table = "study_subjects";
      values = {
        name: requiredText(form.get("name"), 120),
        professor: optionalText(form.get("professor"), 120),
        semester: optionalText(form.get("semester"), 60),
        schedule_notes: optionalText(form.get("schedule_notes"), 500),
        priority: integer(form.get("priority"), 1, 5),
        active: form.get("active") !== "false",
      };
    } else if (entity === "assignment") {
      table = "study_assignments";
      values = {
        subject_id: await subject(),
        title: requiredText(form.get("title"), 200),
        details: optionalText(form.get("details"), 2000),
        due_date: validDate(form.get("due_date")),
        priority: integer(form.get("priority"), 1, 3),
        status: choice(form.get("status"), ASSIGNMENT_STATUSES),
      };
    } else if (entity === "exam") {
      table = "study_exams";
      values = {
        subject_id: await subject(),
        title: requiredText(form.get("title"), 200),
        exam_date: validDate(form.get("exam_date")),
        exam_type: choice(form.get("exam_type"), EXAM_TYPES),
        notes: optionalText(form.get("notes"), 2000),
        status: choice(form.get("status"), EXAM_STATUSES),
      };
    } else {
      table = "study_sessions";
      const study_date = validDate(form.get("study_date"));
      // Do not allow fictitious future study sessions.
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit",
      }).format(new Date());
      if (study_date > today) throw new Error("No podés registrar sesiones futuras.");
      values = {
        subject_id: await subject(),
        topic: requiredText(form.get("topic"), 200),
        study_date,
        duration_minutes: integer(form.get("duration_minutes"), 1, 720),
        notes: optionalText(form.get("notes"), 2000),
      };
    }
    const query = id
      ? client.from(table).update(values).eq("id", id).eq("user_id", userId)
      : client.from(table).insert({ ...values, user_id: userId });
    const { data, error } = await query.select("id").maybeSingle();
    if (error || !data) throw new Error("No pudimos guardar. Verificá que los datos sigan disponibles.");
    revalidatePath("/study");
    revalidatePath("/");
    return succeeded(id ? "Registro actualizado." : "Registro guardado.");
  } catch (error) {
    return failed(error instanceof Error ? error.message : "Error al guardar el registro.");
  }
}

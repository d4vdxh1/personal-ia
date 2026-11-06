"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { isId, text, number, date, planItems, sessionSets } from "@/lib/training/validation";
export type TrainingState = { message: string; error: boolean; saved: boolean; sessionId?: string };
export async function trainingAction(_state: TrainingState, form: FormData): Promise<TrainingState> {
  try {
    const client = await createClient();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return { message: "Tu sesión venció. Ingresá de nuevo.", error: true, saved: false };
    const userId = auth.user.id;
    const { date: today } = getBuenosAiresToday();
    const op = form.get("operation");
    const rawId = form.get("id");
    const id = rawId === null || rawId === "" ? null : rawId;
    if (id !== null && !isId(id)) throw new Error("No pudimos identificar el registro.");
    const notes = () => text(form.get("notes") ?? "", 2000);
    let sessionId: string | undefined;
    if (op === "exercise") {
      const values = { name: text(form.get("name"), 120, true), muscle_group: text(form.get("muscle_group"), 100), equipment: text(form.get("equipment"), 100), notes: notes() };
      const query = id ? client.from("training_exercises").update(values).eq("id", id).eq("user_id", userId) : client.from("training_exercises").insert({ ...values, user_id: userId });
      const result = await query.select("id").maybeSingle();
      if (result.error || !result.data) throw new Error("No pudimos guardar el ejercicio.");
    } else if (op === "plan") {
      const { error, data } = await client.rpc("save_training_plan", { p_id: id, p_name: text(form.get("name"), 120, true), p_notes: notes(), p_items: planItems(form.get("items")) });
      if (error || !data) throw new Error("No pudimos guardar la rutina. Revisá que sus ejercicios sigan activos.");
    } else if (op === "archive") {
      const table = form.get("kind") === "exercise" ? "training_exercises" : form.get("kind") === "plan" ? "training_plans" : null;
      if (!table || !id) throw new Error("Registro inválido.");
      const { error, data } = await client.from(table).update({ active: false }).eq("id", id).eq("user_id", userId).select("id").maybeSingle();
      if (error || !data) throw new Error("No pudimos archivar el registro.");
    } else if (op === "schedule") {
      const plan = form.get("plan_id");
      if (!isId(plan)) throw new Error("Elegí una rutina.");
      const scheduled_date = date(form.get("scheduled_date"));
      if (scheduled_date < today) throw new Error("Programá desde hoy en adelante.");
      const { data: available, error: planError } = await client.from("training_plans").select("id").eq("id", plan).eq("user_id", userId).eq("active", true).maybeSingle();
      if (planError || !available) throw new Error("La rutina ya no está disponible.");
      const values = { plan_id: plan, scheduled_date };
      const query = id ? client.from("training_schedule").update(values).eq("id", id).eq("user_id", userId) : client.from("training_schedule").insert({ ...values, user_id: userId });
      const { error, data } = await query.select("id").maybeSingle();
      if (error || !data) throw new Error("No pudimos programar. Puede haber otro entrenamiento en esa fecha o una sesión ya iniciada.");
    } else if (op === "cancel") {
      if (!id) throw new Error("Registro inválido.");
      const { error, data } = await client.from("training_schedule").delete().eq("id", id).eq("user_id", userId).select("id").maybeSingle();
      if (error || !data) throw new Error("No pudimos cancelar. Una programación con sesión iniciada conserva su historial.");
    } else if (op === "start") {
      const plan = form.get("plan_id"); const schedule = form.get("schedule_id") || null;
      if (!id || !isId(plan) || (schedule !== null && !isId(schedule))) throw new Error("Rutina inválida.");
      const { data, error } = await client.rpc("start_training_session", { p_id: id, p_plan_id: plan, p_schedule_id: schedule });
      if (error || !isId(data)) throw new Error("No pudimos iniciar. Revisá que la rutina y sus ejercicios estén activos y que la programación sea de hoy.");
      sessionId = data;
    } else if (op === "session") {
      if (!id) throw new Error("Sesión inválida.");
      const sets = sessionSets(form.get("sets"));
      const complete = form.get("complete") === "true";
      const duration = number(form.get("duration_minutes"), 1, 600, true, !complete);
      const rpe = number(form.get("rpe"), 1, 10, true, !complete);
      if (complete && !sets.some(s => s.done)) throw new Error("Marcá al menos una serie realizada antes de completar.");
      const { data, error } = await client.rpc("save_training_session", { p_id: id, p_sets: sets, p_duration: duration, p_rpe: rpe, p_notes: notes(), p_complete: complete });
      if (error || !data) throw new Error("No pudimos guardar. Actualizá la página si la sesión ya fue completada.");
    } else if (op === "metric") {
      const values = { entry_date: date(form.get("entry_date"), today), weight_kg: number(form.get("weight_kg"), 20, 500, false, true), waist_cm: number(form.get("waist_cm"), 20, 300, false, true), arm_cm: number(form.get("arm_cm"), 5, 100, false, true), notes: notes(), user_id: userId };
      if (values.weight_kg === null && values.waist_cm === null && values.arm_cm === null) throw new Error("Registrá al menos una medida.");
      const { data, error } = await client.from("training_metrics").upsert(values, { onConflict: "user_id,entry_date" }).select("id").maybeSingle();
      if (error || !data) throw new Error("No pudimos guardar las medidas.");
    } else if (op === "symptom") {
      const session = form.get("session_id") || null;
      if (session !== null && !isId(session)) throw new Error("Sesión inválida.");
      const { data, error } = await client.from("training_symptoms").insert({ user_id: userId, entry_date: date(form.get("entry_date"), today), session_id: session, area: text(form.get("area"), 120, true), intensity: number(form.get("intensity"), 0, 10, true), locking: form.get("locking") === "on", notes: notes() }).select("id").maybeSingle();
      if (error || !data) throw new Error("No pudimos guardar la molestia.");
    } else throw new Error("Operación inválida.");
    revalidatePath("/training"); revalidatePath("/");
    if (id) revalidatePath(`/training/${id}`);
    return { message: op === "start" ? "Sesión iniciada. Abrila para registrar tus series." : "Cambios guardados.", error: false, saved: true, ...(sessionId ? { sessionId } : {}) };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "No pudimos conectar. Volvé a intentar.", error: true, saved: false };
  }
}

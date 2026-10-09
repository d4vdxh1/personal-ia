"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";

export type HabitActionState = { message: string; error: boolean };
const failure = (message: string): HabitActionState => ({ message, error: true });
const success = (message: string): HabitActionState => ({ message, error: false });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseHabit(formData: FormData) {
  const rawName = formData.get("name");
  const rawWeekdays = formData.getAll("weekdays");
  if (typeof rawName !== "string") return null;
  const name = rawName.trim();
  const weekdays = rawWeekdays.map(Number);
  if (
    name.length < 1 ||
    name.length > 120 ||
    weekdays.length < 1 ||
    weekdays.some((day) => !Number.isInteger(day) || day < 1 || day > 7) ||
    new Set(weekdays).size !== weekdays.length
  ) {
    return null;
  }
  return { name, weekdays: weekdays.sort((a, b) => a - b) };
}

async function userClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

function refreshHabits() {
  revalidatePath("/");
  revalidatePath("/habits");
}

export async function createHabit(_state: HabitActionState, formData: FormData): Promise<HabitActionState> {
  const habit = parseHabit(formData);
  if (!habit) return failure("Ingresá un nombre y elegí al menos un día.");
  const context = await userClient();
  if (!context) return failure("Tu sesión venció. Ingresá de nuevo.");
  const { error } = await context.supabase.from("habits").insert({ ...habit, user_id: context.user.id });
  if (error) return failure("No pudimos guardar el hábito. Volvé a intentar.");
  refreshHabits();
  return success("Hábito creado.");
}

export async function updateHabit(_state: HabitActionState, formData: FormData): Promise<HabitActionState> {
  const id = formData.get("habitId");
  const habit = parseHabit(formData);
  if (typeof id !== "string" || !uuid.test(id) || !habit) return failure("Revisá el nombre y los días elegidos.");
  const context = await userClient();
  if (!context) return failure("Tu sesión venció. Ingresá de nuevo.");
  const { data, error } = await context.supabase
    .from("habits")
    .update(habit)
    .eq("id", id)
    .eq("user_id", context.user.id)
    .eq("active", true)
    .select("id")
    .maybeSingle();
  if (error || !data) return failure("No pudimos actualizar el hábito. Volvé a intentar.");
  refreshHabits();
  return success("Cambios guardados.");
}

export async function archiveHabit(_state: HabitActionState, formData: FormData): Promise<HabitActionState> {
  const id = formData.get("habitId");
  if (typeof id !== "string" || !uuid.test(id)) return failure("No pudimos identificar el hábito.");
  const context = await userClient();
  if (!context) return failure("Tu sesión venció. Ingresá de nuevo.");
  const { data, error } = await context.supabase
    .from("habits")
    .update({ active: false })
    .eq("id", id)
    .eq("user_id", context.user.id)
    .eq("active", true)
    .select("id")
    .maybeSingle();
  if (error || !data) return failure("No pudimos archivar el hábito. Volvé a intentar.");
  refreshHabits();
  return success("Hábito archivado. Se conserva su historial.");
}

export async function toggleHabit(_state: HabitActionState, formData: FormData): Promise<HabitActionState> {
  const id = formData.get("habitId");
  const value = formData.get("completed");
  const submittedDate = formData.get("entryDate");
  if (typeof id !== "string" || !uuid.test(id) || (value !== "true" && value !== "false") || typeof submittedDate !== "string") {
    return failure("No pudimos registrar este hábito.");
  }
  const context = await userClient();
  if (!context) return failure("Tu sesión venció. Ingresá de nuevo.");
  const { date, weekday } = getBuenosAiresToday();
  if (submittedDate !== date) return failure("Cambió el día. Actualizá la página para cargar el registro correcto.");
  const { data: habit, error: habitError } = await context.supabase
    .from("habits")
    .select("id, weekdays")
    .eq("id", id)
    .eq("user_id", context.user.id)
    .eq("active", true)
    .maybeSingle();
  if (habitError || !habit || !habit.weekdays.includes(weekday)) {
    return failure("Este hábito no está programado para hoy.");
  }
  const { error } = await context.supabase
    .from("habit_entries")
    .upsert(
      { habit_id: id, user_id: context.user.id, entry_date: date, completed: value === "true" },
      { onConflict: "habit_id,entry_date" }
    );
  if (error) return failure("No pudimos guardar el registro de hoy. Volvé a intentar.");
  refreshHabits();
  return success("Registro de hoy actualizado.");
}

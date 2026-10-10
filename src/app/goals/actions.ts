"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseGoal } from "@/lib/goals/validation";

export type GoalActionState = { message: string; error: boolean; saved: boolean };
const failure = (message: string): GoalActionState => ({ message, error: true, saved: false });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveGoal(_state: GoalActionState, formData: FormData): Promise<GoalActionState> {
  const goal = parseGoal(formData);
  const id = formData.get("goalId");
  if (!goal) return failure("Revisá el título (hasta 200 caracteres), tipo, fecha y avance (0 a 100). Un objetivo completado debe tener 100% de avance.");
  if (id !== null && (typeof id !== "string" || !uuid.test(id))) return failure("No pudimos identificar el objetivo.");
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return failure("Tu sesión venció. Ingresá de nuevo.");
  const query = id
    ? supabase.from("goals").update(goal).eq("id", id).eq("user_id", auth.user.id)
    : supabase.from("goals").insert({ ...goal, user_id: auth.user.id });
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) return failure("No pudimos guardar el objetivo. Volvé a intentar o actualizá la página.");
  revalidatePath("/goals");
  revalidatePath("/");
  return { message: id ? "Objetivo actualizado." : "Objetivo creado.", error: false, saved: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { parseCheckin } from "@/lib/checkins/validation";

export type CheckinActionState = { message: string; error: boolean };

export async function saveCheckin(_state: CheckinActionState, formData: FormData): Promise<CheckinActionState> {
  const values = parseCheckin(formData);
  if (!values) return { message: "Revisá las escalas de 1 a 5, las horas de sueño (0 a 24) y las notas (hasta 10.000 caracteres).", error: true };

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) return { message: "Tu sesión venció. Ingresá de nuevo.", error: true };

  const { date } = getBuenosAiresToday();
  if (formData.get("entryDate") !== date) {
    return { message: "Cambió el día. Actualizá la página para registrar el check-in de hoy.", error: true };
  }

  const { error } = await supabase.from("daily_checkins").upsert(
    { ...values, user_id: data.user.id, entry_date: date },
    { onConflict: "user_id,entry_date" }
  );
  if (error) return { message: "No pudimos guardar tu check-in. Volvé a intentar.", error: true };

  revalidatePath("/");
  revalidatePath("/check-in");
  return { message: "Check-in de hoy guardado. Podés actualizarlo cuando quieras.", error: false };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { parseJournalEntry } from "@/lib/journal/validation";

export type JournalActionState = { message: string; error: boolean; saved: boolean };
const failure = (message: string): JournalActionState => ({ message, error: true, saved: false });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveJournalEntry(_state: JournalActionState, formData: FormData): Promise<JournalActionState> {
  const values = parseJournalEntry(formData, getBuenosAiresToday().date);
  const id = formData.get("entryId");
  if (!values) return failure("Elegí una fecha válida hasta hoy y escribí un hecho relevante (hasta 2.000 caracteres) o una nota (hasta 10.000).");
  if (id !== null && (typeof id !== "string" || !uuid.test(id))) return failure("No pudimos identificar la entrada.");

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return failure("Tu sesión venció. Ingresá de nuevo.");

  const query = id
    ? supabase.from("journal_entries").update(values).eq("id", id).eq("user_id", auth.user.id)
    : supabase.from("journal_entries").insert({ ...values, user_id: auth.user.id });
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) return failure("No pudimos guardar la entrada. Volvé a intentar o actualizá la página.");

  revalidatePath("/journal");
  revalidatePath("/");
  return { message: id ? "Entrada actualizada." : "Entrada guardada en tu diario.", error: false, saved: true };
}

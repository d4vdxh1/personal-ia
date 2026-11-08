"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseReminder, isId } from "@/lib/reminders/validation";

export type ReminderActionState = { message: string; error: boolean; saved: boolean };
const failure = (message: string): ReminderActionState => ({ message, error: true, saved: false });
function refresh() { revalidatePath("/reminders"); revalidatePath("/"); }

export async function saveReminder(_state:ReminderActionState, form:FormData):Promise<ReminderActionState> {
  const parsed = parseReminder(form);
  if (!parsed) return failure("Revisá el título, las notas y elegí una fecha y hora futuras.");
  const id = form.get("id");
  if (id !== null && id !== "" && !isId(id)) return failure("Identificador inválido.");
  const client = await createClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) return failure("Tu sesión venció. Ingresá de nuevo.");
  const query = id
    ? client.from("reminders").update(parsed).eq("id",id).eq("status","pending").eq("user_id",auth.user.id)
    : client.from("reminders").insert({...parsed,user_id:auth.user.id});
  const { data,error } = await query.select("id").maybeSingle();
  if (error || !data) return failure("No se pudo guardar el recordatorio. Revisá que siga disponible.");
  refresh();
  return { message: id ? "Recordatorio actualizado en tu lista." : "Recordatorio agregado a tu lista.", error:false, saved:true };
}

export async function closeReminder(form:FormData) {
  const id = form.get("id"), status = form.get("status");
  if (!isId(id) || (status !== "completed" && status !== "cancelled")) return;
  const client = await createClient();
  const {data:auth,error} = await client.auth.getUser();
  if(error || !auth.user) return;
  const result = await client.from("reminders").update({status})
    .eq("id",id).eq("user_id",auth.user.id).eq("status","pending").select("id").maybeSingle();
  if (!result.error && result.data) refresh();
}

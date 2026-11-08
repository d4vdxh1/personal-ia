"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isId } from "@/lib/study/validation";
import { parseSeries } from "@/lib/reminders/recurrence";

export type SeriesActionState={message:string;error:boolean;saved:boolean};
const err=(message:string):SeriesActionState=>({message,error:true,saved:false});
function refresh(){revalidatePath("/reminders");revalidatePath("/");}
export async function saveReminderSeries(_old:SeriesActionState,form:FormData):Promise<SeriesActionState> {
  const values=parseSeries(form);
  if(!values)return err("Revisá título, frecuencia, días, fecha y hora. La frecuencia semanal requiere al menos un día.");
  const id=form.get("id");
  if(id!==null && id!=="" && !isId(id))return err("Identificador inválido.");
  const client=await createClient();
  const {data:auth,error}=await client.auth.getUser();
  if(error||!auth.user)return err("Tu sesión venció. Ingresá de nuevo.");
  const q=id
   ? client.from("reminder_series").update(values).eq("id",id).eq("user_id",auth.user.id)
   : client.from("reminder_series").insert({...values,user_id:auth.user.id});
  const result=await q.select("id").maybeSingle();
  if(result.error||!result.data)return err("No pudimos guardar la serie. Revisá los datos o el límite de 30 series.");
  refresh();
  return {message:id?"Serie actualizada. Se ajustarán los avisos futuros.":"Serie creada. Los próximos avisos se programarán automáticamente.",error:false,saved:true};
}
export async function toggleReminderSeries(form:FormData) {
  const id=form.get("id"),value=form.get("active");
  if(!isId(id)||(value!=="true"&&value!=="false"))return;
  const client=await createClient();
  const {data:auth,error}=await client.auth.getUser();
  if(error||!auth.user)return;
  const result=await client.from("reminder_series").update({active:value==="true"})
   .eq("id",id).eq("user_id",auth.user.id).select("id").maybeSingle();
  if(!result.error&&result.data)refresh();
}

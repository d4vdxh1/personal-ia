"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
import {parseFinanceTransaction} from "@/lib/finance/validation";
export type FinanceActionState={message:string;error:boolean;saved:boolean};
const failure=(message:string):FinanceActionState=>({message,error:true,saved:false});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function addFinanceTransaction(_previous:FinanceActionState,form:FormData):Promise<FinanceActionState>{
 const tx=parseFinanceTransaction(form);
 if(!tx)return failure("Revisá el tipo, categoría, monto entero en guaraníes, fecha y nota (máx. 300 caracteres).");
 const supabase=await createClient();
 const {data:auth,error:authError}=await supabase.auth.getUser();
 if(authError||!auth.user)return failure("Tu sesión venció. Ingresá nuevamente.");
 const {data,error}=await supabase.from("finance_transactions")
   .insert({...tx,user_id:auth.user.id}).select("id").maybeSingle();
 if(error||!data)return failure("No pudimos guardar el movimiento. Verificá que Finanzas esté habilitado y volvé a intentar.");
 revalidatePath("/finance");
 return {message:"Movimiento registrado.",error:false,saved:true};
}
export async function removeFinanceTransaction(_previous:FinanceActionState,form:FormData):Promise<FinanceActionState>{
 const id=form.get("id");
 if(typeof id!=="string"||!UUID.test(id)||form.get("confirm")!=="yes")return failure("Confirmá qué movimiento querés eliminar.");
 const supabase=await createClient();
 const {data:auth,error:authError}=await supabase.auth.getUser();
 if(authError||!auth.user)return failure("Tu sesión venció. Ingresá nuevamente.");
 const {data,error}=await supabase.from("finance_transactions").delete().eq("id",id).eq("user_id",auth.user.id)
   .select("id").maybeSingle();
 if(error||!data)return failure("No pudimos eliminar el movimiento, o ya no existe en tu cuenta.");
 revalidatePath("/finance");
 return {message:"Movimiento eliminado.",error:false,saved:true};
}

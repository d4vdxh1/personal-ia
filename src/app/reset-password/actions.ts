"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export type UpdatePasswordState={message:string};
export async function updatePassword(_:UpdatePasswordState,form:FormData):Promise<UpdatePasswordState>{
 const password=form.get("password"),confirmation=form.get("confirmation");
 if(typeof password!=="string"||password.length<10||password.length>128)
  return {message:"La contraseña debe tener entre 10 y 128 caracteres."};
 if(password!==confirmation)return {message:"Las contraseñas no coinciden."};
 try{
   const client=await createClient();
   const {data:{user},error:authError}=await client.auth.getUser();
   if(authError||!user)return {message:"El enlace expiró. Solicitá uno nuevo."};
   const {error}=await client.auth.updateUser({password});
   if(error)return {message:"No pudimos actualizar la contraseña. Solicitá un enlace nuevo."};
 }catch{return {message:"No pudimos conectar. Intentá nuevamente."};}
 redirect("/");
}

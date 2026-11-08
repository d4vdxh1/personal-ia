"use server";
import { createClient } from "@/lib/supabase/server";
export type RecoveryState={status:"idle"|"error"|"success";message:string};
export async function requestPasswordReset(_:RecoveryState,form:FormData):Promise<RecoveryState>{
 if(process.env.EMAIL_RECOVERY_ENABLED!=="true")return {status:"error",message:"La recuperación por correo aún no está habilitada."};
 const email=form.get("email");
 if(typeof email!=="string"||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
  return {status:"error",message:"Ingresá un correo electrónico válido."};
 try{
  const client=await createClient();
  const site=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,"")||"https://personal-ia-two.vercel.app";
  const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:site+"/auth/confirm"});
  if(error?.status===429)return {status:"error",message:"Demasiadas solicitudes. Volvé a probar más tarde."};
 }catch{ /* Uniform message avoids account enumeration. */ }
 return {status:"success",message:"Si existe una cuenta con ese correo, recibirás instrucciones para recuperar tu contraseña."};
}

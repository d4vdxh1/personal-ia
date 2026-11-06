import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {createClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function ResetPasswordPage(){
 const client=await createClient();
 const {data:{user}}=await client.auth.getUser();
 return <main className="auth-shell"><section className="auth-card auth-card-v2">
  <p className="auth-eyebrow">SEGURIDAD DE TU CUENTA</p>
  <h1>Cambiá tu contraseña.</h1>
  {user?<ResetPasswordForm/>:<p className="auth-description">El enlace no es válido o venció. <Link href="/forgot-password">Solicitá uno nuevo.</Link></p>}
 </section></main>;
}

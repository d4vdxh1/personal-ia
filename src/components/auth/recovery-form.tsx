"use client";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/forgot-password/actions";
export function RecoveryForm(){
 const [state,action,pending]=useActionState(requestPasswordReset,{status:"idle" as const,message:""});
 return <form action={action} className="auth-form">
   <label htmlFor="recovery-email">Correo electrónico</label>
   <input type="email" id="recovery-email" name="email" required autoComplete="email" maxLength={254}/>
   <button className="auth-submit" disabled={pending}>{pending?"Enviando…":"Enviar enlace"}</button>
   {state.message&&<p className={state.status==="error"?"auth-feedback error":"auth-feedback success"} role={state.status==="error"?"alert":"status"}>{state.message}</p>}
 </form>;
}

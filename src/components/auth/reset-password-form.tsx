"use client";
import {useActionState} from "react";
import {updatePassword} from "@/app/reset-password/actions";
export function ResetPasswordForm(){
 const [state,action,pending]=useActionState(updatePassword,{message:""});
 return <form action={action} className="auth-form">
  <label htmlFor="reset-pass">Nueva contraseña</label>
  <input id="reset-pass" name="password" type="password" minLength={10} maxLength={128} autoComplete="new-password" required/>
  <label htmlFor="reset-confirm">Confirmar contraseña</label>
  <input id="reset-confirm" name="confirmation" type="password" minLength={10} maxLength={128} autoComplete="new-password" required/>
  <button type="submit" className="auth-submit" disabled={pending}>{pending?"Guardando…":"Cambiar contraseña"}</button>
  {state.message&&<p role="alert" className="auth-feedback error">{state.message}</p>}
 </form>;
}

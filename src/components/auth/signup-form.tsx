"use client";

import { useActionState } from "react";
import { signup } from "@/app/signup/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, { message: "", status: "idle" as const });
  return <form className="auth-form signup-form" action={action}>
    <label htmlFor="signup-email">Correo electrónico</label>
    <input id="signup-email" name="email" type="email" autoComplete="email"
      required maxLength={254} placeholder="nombre@ejemplo.com" />
    <label htmlFor="signup-password">Contraseña</label>
    <input id="signup-password" name="password" type="password" autoComplete="new-password"
      required minLength={10} maxLength={128} placeholder="Mínimo 10 caracteres" />
    <label htmlFor="signup-confirm">Confirmar contraseña</label>
    <input id="signup-confirm" name="confirmPassword" type="password" autoComplete="new-password"
      required minLength={10} maxLength={128} />
    <button className="auth-submit" type="submit" disabled={pending || state.status === "success"}>
      {pending ? "Creando cuenta…" : state.status === "success" ? "Correo enviado" : "Crear cuenta"}
    </button>
    {state.message && <p role={state.status === "error" ? "alert" : "status"}
      className={state.status === "error" ? "auth-feedback error" : "auth-feedback success"}>{state.message}</p>}
  </form>;
}

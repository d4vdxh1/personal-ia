"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { message: "" });
  return (
    <form action={action} className="auth-form">
      <label htmlFor="email">Correo electrónico</label>
      <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
      <label htmlFor="password">Contraseña</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={4096} />
      <p role="alert" id="login-error">{state.message}</p>
      <button className="auth-submit" disabled={pending} type="submit">{pending ? "Ingresando…" : "Ingresar"}</button>
    </form>
  );
}

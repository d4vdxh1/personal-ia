"use client";

import { useActionState } from "react";
import { logout } from "@/app/login/actions";

export function LogoutForm() {
  const [state, action, pending] = useActionState(logout, { message: "" });
  return <form action={action} className="session-bar">
    <span>Sesión iniciada · Vista de ejemplo</span>
    <button type="submit" disabled={pending}>{pending ? "Cerrando…" : "Cerrar sesión"}</button>
    {state.message && <p role="alert">{state.message}</p>}
  </form>;
}

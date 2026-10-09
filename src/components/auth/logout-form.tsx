"use client";

import { useActionState } from "react";
import { logout } from "@/app/login/actions";

export function LogoutForm({ withSidebar = false }: { withSidebar?: boolean }) {
  const [state, action, pending] = useActionState(logout, { message: "" });
  return <form action={action} className={withSidebar ? "session-bar session-bar-with-sidebar" : "session-bar"}>
    <span>Sesión iniciada</span>
    <button type="submit" disabled={pending}>{pending ? "Cerrando…" : "Cerrar sesión"}</button>
    {state.message && <p role="alert">{state.message}</p>}
  </form>;
}

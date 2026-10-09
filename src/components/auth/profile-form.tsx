"use client";

import { useActionState } from "react";
import { updateDisplayName, type ProfileState } from "@/app/profile/actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const initialState: ProfileState = { message: "", error: false };
  const [state, action, pending] = useActionState(updateDisplayName, initialState);
  return (
    <form action={action} className="auth-form profile-form">
      <label htmlFor="displayName">Nombre para mostrar</label>
      <input id="displayName" name="displayName" defaultValue={displayName} maxLength={100} autoComplete="name" />
      <p className="form-hint">Podés dejarlo vacío para usar el nombre de tu cuenta.</p>
      {state.message && <p role="status" aria-live="polite" className={state.error ? "form-error" : "form-success"}>{state.message}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</button>
    </form>
  );
}

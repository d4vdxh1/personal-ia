"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { message: string };

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length === 0 || password.length > 4096) {
    return { message: "Ingresá un correo válido y tu contraseña." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { message: error.status === 429
      ? "Demasiados intentos. Esperá unos minutos y volvé a intentar."
      : "No pudimos iniciar sesión. Revisá tus datos y que tu correo esté confirmado." };
  } catch {
    return { message: "No pudimos conectar. Volvé a intentar en unos momentos." };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { message: "No pudimos cerrar la sesión. Volvé a intentar." };
  } catch {
    return { message: "No pudimos conectar. Volvé a intentar." };
  }
  revalidatePath("/", "layout");
  redirect("/login?reason=logout");
}

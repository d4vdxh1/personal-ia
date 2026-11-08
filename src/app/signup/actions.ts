"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { message: string; status: "idle" | "error" | "success" };

export async function signup(_previous: SignupState, form: FormData): Promise<SignupState> {
  if (process.env.EMAIL_SIGNUP_ENABLED !== "true") {
    return { status: "error", message: "El registro con correo todavía no está disponible. Continuá con Google." };
  }
  const email = form.get("email");
  const password = form.get("password");
  const confirmPassword = form.get("confirmPassword");
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254) {
    return { status: "error", message: "Ingresá una dirección de correo válida." };
  }
  if (typeof password !== "string" || password.length < 10 || password.length > 128) {
    return { status: "error", message: "Elegí una contraseña de entre 10 y 128 caracteres." };
  }
  if (password !== confirmPassword) {
    return { status: "error", message: "Las contraseñas no coinciden." };
  }
  try {
    const supabase = await createClient();
    // Site URL / allowed Redirect URLs and Confirm Signup template must be configured in Supabase.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://personal-ia-two.vercel.app";
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: siteUrl + "/auth/confirm" },
    });
    if (error) {
      if (error.status === 429) return { status: "error", message: "Se alcanzó el límite de intentos. Volvé a probar más tarde." };
      if (error.code === "signup_disabled") return { status: "error", message: "Los registros todavía no están habilitados en Supabase." };
      if (error.code === "weak_password") return { status: "error", message: "La contraseña no cumple los requisitos de seguridad." };
      return { status: "error", message: "No pudimos completar el registro. Revisá los datos o probá más tarde." };
    }
    if (data.session) {
      revalidatePath("/", "layout");
    } else {
      return { status: "success", message: "Revisá tu correo para confirmar la cuenta. También mirá Spam si no aparece." };
    }
  } catch {
    return { status: "error", message: "No pudimos conectar con el servicio de registro. Intentá más tarde." };
  }
  redirect("/");
}

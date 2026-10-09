"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { message: string; error: boolean };

export async function updateDisplayName(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const value = formData.get("displayName");
  if (typeof value !== "string") return { message: "Ingresá un nombre válido.", error: true };
  const displayName = value.trim();
  if (displayName.length > 100) return { message: "El nombre puede tener hasta 100 caracteres.", error: true };

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return { message: "Tu sesión venció. Ingresá de nuevo.", error: true };

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("user_id", auth.user.id)
    .select("user_id")
    .maybeSingle();

  if (error || !data) return { message: "No se pudo guardar el perfil. Volvé a intentar.", error: true };
  revalidatePath("/profile");
  revalidatePath("/");
  return { message: "Nombre actualizado.", error: false };
}

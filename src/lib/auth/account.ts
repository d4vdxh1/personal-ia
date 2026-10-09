import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAccount() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) redirect("/login?reason=session");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, timezone, preferred_sleep_hours")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return { user: auth.user, profile, profileError: error };
}

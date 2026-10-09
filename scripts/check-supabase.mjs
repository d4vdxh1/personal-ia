import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exitCode = 1;
} else {
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }),
      },
    });
    // Tabla de diagnóstico deliberadamente inexistente. PGRST205 confirma
    // que PostgREST validó la clave y consultó su caché de esquema.
    // limit(0) evita devolver registros incluso si alguien crea esa tabla.
    const { error, status } = await supabase
      .from("__personal_ia_connection_probe__")
      .select("*")
      .limit(0);
    if (error && !(status === 404 && error.code === "PGRST205")) {
      console.error(`Data API: HTTP ${status}`);
      throw new Error("Data API no disponible.");
    }
    const auth = await fetch(new URL("/auth/v1/settings", url), {
      headers: { apikey: key },
      signal: AbortSignal.timeout(15000),
    });
    if (!auth.ok) throw new Error(`Auth respondió HTTP ${auth.status}.`);
    console.log(`Supabase: Data API accesible (${error ? "PGRST205 esperado: tabla de diagnóstico inexistente" : "HTTP 200"}); Auth HTTP 200.`);
    console.log("Sin escrituras ni registros devueltos. No verifica tablas de negocio, RLS ni login.");
  } catch (error) {
    const networkCode = error?.cause?.code;
    if (networkCode && /^[A-Z_]+$/.test(networkCode)) console.error(`Red: ${networkCode}`);
    console.error("No se pudo verificar Supabase. Revisar URL, clave pública, red y estado del proyecto.");
    process.exitCode = 1;
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex",
};

// Diagnóstico temporal y público, estrictamente mínimo. Sin sesión ni privilegios.
// Retirar al implementar el monitoreo de fase 1; ver docs/CIERRE_FASE_0.md.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const unavailable = () =>
    Response.json({ status: "unavailable" }, { status: 503, headers });
  if (!url || !key) return unavailable();
  try {
    const options = {
      headers: { apikey: key },
      cache: "no-store" as const,
      signal: AbortSignal.timeout(6000),
    };
    const [auth, data] = await Promise.all([
      fetch(new URL("/auth/v1/settings", url), options),
      fetch(new URL("/rest/v1/profiles?select=user_id&limit=0", url), options),
    ]);
    // Solo acepta el rechazo PostgreSQL por permisos, no un 401 de clave inválida.
    const body = await data.json();
    const restricted =
      [401, 403].includes(data.status) && body.code === "42501";
    if (!auth.ok || !restricted) return unavailable();
    return Response.json(
      { status: "ok", auth: "reachable", dataApi: "restricted" },
      { headers },
    );
  } catch {
    return unavailable();
  }
}

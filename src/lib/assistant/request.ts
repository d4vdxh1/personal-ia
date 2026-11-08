import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function send(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function readAssistantRequest(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return send({ error: "Origen no autorizado." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return send({ error: "Formato inválido." }, 415);
  }
  const limit = 4000;
  if (Number(request.headers.get("content-length")) > limit) return send({ error: "Solicitud demasiado extensa." }, 413);
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return send({ error: "Tu sesión venció. Ingresá de nuevo." }, 401);

  const reader = request.body?.getReader();
  if (!reader) return send({ error: "Solicitud vacía." }, 400);
  const bytes = new Uint8Array(limit);
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (size + chunk.value.byteLength > limit) {
        void reader.cancel();
        return send({ error: "Solicitud demasiado extensa." }, 413);
      }
      bytes.set(chunk.value, size);
      size += chunk.value.byteLength;
    }
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes.subarray(0, size)));
    if (!body || typeof body !== "object" || Array.isArray(body)) return send({ error: "Solicitud inválida." }, 400);
    return { client, userId: data.user.id, body: body as Record<string, unknown> };
  } catch { return send({ error: "JSON inválido." }, 400); }
}

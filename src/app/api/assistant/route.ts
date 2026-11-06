import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GeminiProvider, ProviderError, type ModelMessage } from "@/lib/assistant/provider";
import { runReadTool } from "@/lib/assistant/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function send(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return send({ error: "Origen no autorizado." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return send({ error: "Formato inválido." }, 415);
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 4000) return send({ error: "Solicitud demasiado extensa." }, 413);

  const client = await createClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) return send({ error: "Iniciá sesión para utilizar el asistente." }, 401);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return send({ error: "El asistente aún no está configurado. Falta GEMINI_API_KEY en Vercel." }, 503);

  let question: string;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return send({ error: "Solicitud inválida." }, 400);
    const body = value as Record<string, unknown>;
    if (Object.keys(body).length !== 1 || typeof body.message !== "string") return send({ error: "Se requiere un mensaje de texto." }, 400);
    question = body.message.trim();
    if (question.length < 2 || question.length > 500) return send({ error: "El mensaje debe tener entre 2 y 500 caracteres." }, 400);
  } catch { return send({ error: "JSON inválido." }, 400); }

  // Atomic durable limit: max 20/day per account, min 5s between calls.
  // No user input reaches the model unless the rate-limit RPC authorizes it.
  const reserved = await client.rpc("reserve_ai_request");
  if (reserved.error || !reserved.data || typeof reserved.data !== "object") {
    return send({ error: "No pudimos comprobar el límite de uso. Intentá más tarde." }, 503);
  }
  const budget = reserved.data as { allowed?: boolean; remaining?: number };
  if (!budget.allowed) return send({ error: "Alcanzaste el límite diario o enviaste mensajes muy seguidos. Probá nuevamente más tarde." }, 429);

  const provider = new GeminiProvider(key);
  const messages: ModelMessage[] = [{ role: "user", parts: [{ text: question }] }];
  try {
    const first = await provider.generate(messages, true);
    let text = first.text;
    if (first.calls.length) {
      const results = await Promise.all(first.calls.map(call => runReadTool(call.name, client, auth.user!.id)));
      messages.push({ role: "model", parts: first.parts });
      messages.push({
        role: "user",
        parts: first.calls.map((call, i) => ({
          functionResponse: { id: call.id, name: call.name, response: results[i] },
        })),
      });
      const answer = await provider.generate(messages, false);
      text = answer.text;
    }
    if (!text) return send({ error: "El asistente no pudo generar una respuesta. Probá reformulando la pregunta." }, 502);
    return send({ answer: text.slice(0, 2500), remaining: Math.max(0, budget.remaining ?? 0) }, 200);
  } catch (error) {
    if (error instanceof ProviderError) {
      return send({ error: error.message }, error.code === "quota" ? 429 : 502);
    }
    // Never return internal errors or log the private messages / provider key.
    return send({ error: "No pudimos completar la consulta. Volvé a intentar." }, 502);
  }
}

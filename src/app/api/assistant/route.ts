import { NextRequest } from "next/server";
import { readAssistantRequest, send } from "@/lib/assistant/request";
import { isCheckinProposal } from "@/lib/assistant/checkin-proposal";
import { isStudyProposal } from "@/lib/assistant/study-proposal";
import { isHabitProposal } from "@/lib/assistant/habit-proposal";
import { GeminiProvider, ProviderError, type ModelMessage } from "@/lib/assistant/provider";
import { runReadTool } from "@/lib/assistant/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = await readAssistantRequest(request);
  if (context instanceof Response) return context;
  const { client, userId, body } = context;
  if (Object.keys(body).length !== 1 || typeof body.message !== "string") return send({ error: "Se requiere un mensaje de texto." }, 400);
  const question = body.message.trim();
  if (question.length < 2 || question.length > 500) return send({ error: "El mensaje debe tener entre 2 y 500 caracteres." }, 400);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return send({ error: "El asistente aún no está configurado. Falta GEMINI_API_KEY en Vercel." }, 503);

  // Atomic durable limit: max 20/day per account, min 5s between calls.
  // No user input reaches the model unless the rate-limit RPC authorizes it.
  const reserved = await client.rpc("reserve_ai_request");
  if (reserved.error || !reserved.data || typeof reserved.data !== "object") {
    return send({ error: "No pudimos comprobar el límite de uso. Intentá más tarde." }, 503);
  }
  const budget = reserved.data as { allowed?: boolean; remaining?: number };
  if (!budget.allowed) return send({ error: "Alcanzaste el límite diario o enviaste mensajes muy seguidos. Probá nuevamente más tarde." }, 429);

  const provider = new GeminiProvider(key, fetch, process.env.AI_STUDY_WRITES_ENABLED === "true");
  const messages: ModelMessage[] = [{ role: "user", parts: [{ text: question }] }];
  try {
    const first = await provider.generate(messages, true);
    let text = first.text;
    const remaining = Math.max(0, budget.remaining ?? 0);
    const writes = first.calls.filter(call => call.name === "propose_mark_habit" || call.name === "propose_daily_checkin" || call.name === "propose_study_session");
    if (writes.length && first.calls.length !== 1) return send({ answer: "Pedime una sola acción por mensaje.", remaining });
    const studyCall = first.calls.find(call => call.name === "propose_study_session");
    if (studyCall) {
      if (process.env.AI_STUDY_WRITES_ENABLED !== "true") {
        return send({ answer: "El registro de estudio mediante Gemini todavía no está activado.", remaining });
      }
      const { subject_name, topic, duration_minutes } = studyCall.values;
      const { data, error } = await client.rpc("propose_study_session", {
        p_subject_name: subject_name, p_topic: topic, p_duration_minutes: duration_minutes,
      });
      if (!error && data?.status === "pending" && isStudyProposal(data)) {
        const { kind, id, date, subject, topic: proposedTopic, duration_minutes: minutes } = data;
        return send({ answer: "Revisá los datos de la sesión de estudio antes de guardarla.",
          proposal: { kind, id, date, subject, topic: proposedTopic, duration_minutes: minutes }, remaining });
      }
      if (!error && data?.status === "limited") return send({ error: "Alcanzaste el límite de propuestas de estudio de hoy." }, 429);
      if (!error && data?.status === "ambiguous") return send({ answer: "Tenés varias materias activas con ese nombre. Cambiá el nombre de una para diferenciarlas.", remaining });
      if (!error && data?.status === "not_found") return send({ answer: "No encontré una materia activa con ese nombre. Revisala en Estudio.", remaining });
      console.error("assistant.study.proposal_unavailable", { userId });
      return send({ error: "No pudimos preparar la sesión de estudio. Volvé a intentar." }, 503);
    }
    const checkinCall = first.calls.find(call => call.name === "propose_daily_checkin");
    if (checkinCall) {
      const { data, error } = await client.rpc("propose_daily_checkin", { p_values: checkinCall.values });
      if (!error && data?.status === "pending" && isCheckinProposal(data)) {
        const { kind, id, date, overwrite, values } = data;
        return send({ answer: "Revisá los valores de tu check-in antes de guardarlos.", proposal: { kind, id, date, overwrite, values }, remaining });
      }
      if (!error && data?.status === "limited") return send({ error: "Alcanzaste el límite de propuestas de hoy." }, 429);
      console.error("assistant.checkin.proposal_unavailable", { userId });
      return send({ error: "No pudimos preparar el check-in. Volvé a intentar." }, 503);
    }
    const proposalCall = first.calls.find(call => call.name === "propose_mark_habit");
    if (proposalCall) {
      const { data, error } = await client.rpc("propose_mark_habit", { p_name: proposalCall.habitName });
      if (!error && data?.status === "pending" && isHabitProposal(data)) {
        const { id, name, date, completed } = data;
        return send({ answer: "Revisá el registro antes de guardarlo.", proposal: { id, name, date, completed }, remaining });
      }
      if (!error && data?.status === "limited") return send({ error: "Alcanzaste el límite de propuestas de hoy." }, 429);
      if (!error && data?.status === "ambiguous") return send({ answer: "Tenés varios hábitos programados con ese nombre. Podés diferenciarlos en Hábitos antes de volver a intentarlo.", remaining });
      if (!error && data?.status === "not_found") return send({ answer: "No encontré un hábito activo con ese nombre para hoy. Revisá el nombre en Hábitos.", remaining });
      if (!error && data?.status === "already_done") return send({ answer: "Ese hábito ya figura como completado hoy.", remaining });
      console.error("assistant.mark_habit.proposal_unavailable", { userId });
      return send({ error: "No pudimos preparar la propuesta. Volvé a intentar." }, 503);
    }
    const reads = first.calls.filter(call => call.name !== "propose_mark_habit" && call.name !== "propose_daily_checkin" && call.name !== "propose_study_session");
    if (reads.length) {
      const results = await Promise.all(reads.map(call => runReadTool(call.name, client, userId)));
      messages.push({ role: "model", parts: first.parts });
      messages.push({
        role: "user",
        parts: reads.map((call, i) => ({
          functionResponse: { id: call.id, name: call.name, response: results[i] },
        })),
      });
      const answer = await provider.generate(messages, false);
      text = answer.text;
    }
    if (!text) return send({ error: "El asistente no pudo generar una respuesta. Probá reformulando la pregunta." }, 502);
    return send({ answer: text.slice(0, 2500), remaining }, 200);
  } catch (error) {
    if (error instanceof ProviderError) {
      return send({ error: error.message }, error.code === "quota" ? 429 : 502);
    }
    // Never return internal errors or log the private messages / provider key.
    return send({ error: "No pudimos completar la consulta. Volvé a intentar." }, 502);
  }
}

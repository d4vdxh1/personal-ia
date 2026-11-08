import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { proposalId } from "@/lib/assistant/habit-proposal";
import { readAssistantRequest, send } from "@/lib/assistant/request";

const outcomes = {
  confirmed: "Hábito marcado como completado.",
  cancelled: "Propuesta cancelada.",
  expired: "La propuesta venció. Pedí una nueva para el día de hoy.",
  stale: "El hábito cambió o dejó de estar disponible. Pedí una nueva propuesta.",
  already_done: "El hábito ya figuraba como completado.",
  failed: "No se pudo guardar el hábito. Podés pedir una nueva propuesta.",
} as const;

export async function POST(request: NextRequest) {
  const context = await readAssistantRequest(request);
  if (context instanceof Response) return context;
  const { client, userId, body } = context;
  const { id, decision } = body;
  if (Object.keys(body).length !== 2 || typeof id !== "string" || !proposalId.test(id) ||
      (decision !== "confirm" && decision !== "cancel")) return send({ error: "Decisión inválida." }, 400);

  const { data, error } = await client.rpc("decide_habit_proposal", { p_id: id, p_decision: decision });
  if (!error && data?.status === "not_found") return send({ message: "La propuesta no está disponible." }, 404);
  const replay = data?.status === "consumed";
  const result = replay ? data.outcome : data?.status;
  if (error || typeof result !== "string" || !Object.hasOwn(outcomes, result)) {
    console.error("assistant.mark_habit.decision_unavailable", { userId, proposalId: id });
    return send({ error: "No pudimos comprobar el resultado. Volvé a intentar con esta propuesta." }, 503);
  }
  if (result === "confirmed" || result === "already_done") {
    revalidatePath("/habits");
    revalidatePath("/");
  }
  const message = outcomes[result as keyof typeof outcomes];
  const status = replay ? 409 : result === "failed" ? 500 : result === "expired" ? 410 :
    result === "stale" || result === "already_done" ? 409 : 200;
  return send({ message: replay ? `Propuesta ya procesada. ${message}` : message, result }, status);
}

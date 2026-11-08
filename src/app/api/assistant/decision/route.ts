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
  const checkin = body.kind === "checkin";
  const study = body.kind === "study";
  const validShape = checkin
    ? Object.keys(body).length === 4 && typeof body.overwrite === "boolean"
    : study ? Object.keys(body).length === 3 : Object.keys(body).length === 2;
  if (!validShape || typeof id !== "string" || !proposalId.test(id) ||
      (decision !== "confirm" && decision !== "cancel")) return send({ error: "Decisión inválida." }, 400);

  const { data, error } = checkin
    ? await client.rpc("decide_checkin_proposal", { p_id: id, p_decision: decision, p_overwrite: body.overwrite })
    : study ? await client.rpc("decide_study_proposal", { p_id: id, p_decision: decision })
    : await client.rpc("decide_habit_proposal", { p_id: id, p_decision: decision });
  if (!error && data?.status === "needs_confirmation") {
    return send({ error: "Confirmá que querés actualizar el check-in existente." }, 409);
  }
  if (!error && data?.status === "not_found") return send({ message: "La propuesta no está disponible." }, 404);
  const replay = data?.status === "consumed";
  const result = replay ? data.outcome : data?.status;
  if (error || typeof result !== "string" || !Object.hasOwn(outcomes, result)) {
    console.error("assistant.decision_unavailable", { userId, proposalId: id, kind: checkin ? "checkin" : study ? "study" : "habit" });
    return send({ error: "No pudimos comprobar el resultado. Volvé a intentar con esta propuesta." }, 503);
  }
  if (result === "confirmed" || result === "already_done") {
    revalidatePath(checkin ? "/check-in" : study ? "/study" : "/habits");
    revalidatePath("/");
  }
  const checkinOutcomes = {
    ...outcomes, confirmed: "Check-in de hoy guardado.",
    stale: "Tu check-in cambió. Pedí una nueva propuesta para revisarlo.",
    failed: "No se pudo guardar el check-in. Podés pedir una nueva propuesta.",
  };
  const studyOutcomes = {
    ...outcomes, confirmed: "Sesión de estudio registrada.",
    stale: "La materia cambió o fue archivada. Pedí una nueva propuesta.",
    failed: "No se pudo guardar la sesión de estudio. Podés pedir otra propuesta.",
  };
  const messages = study ? studyOutcomes : checkin ? checkinOutcomes : outcomes;
  const message = messages[result as keyof typeof outcomes];
  const status = replay ? 409 : result === "failed" ? 500 : result === "expired" ? 410 :
    result === "stale" || result === "already_done" ? 409 : 200;
  return send({ message: replay ? `Propuesta ya procesada. ${message}` : message, result }, status);
}

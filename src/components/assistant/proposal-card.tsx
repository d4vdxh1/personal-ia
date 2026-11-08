"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isCheckinProposal, type CheckinProposal } from "@/lib/assistant/checkin-proposal";
import type { HabitProposal } from "@/lib/assistant/habit-proposal";
import { isStudyProposal, type StudyProposal } from "@/lib/assistant/study-proposal";

export function ProposalCard({ proposal }: { proposal: HabitProposal | CheckinProposal | StudyProposal }) {
  const router = useRouter();
  const checkin = isCheckinProposal(proposal) ? proposal : null;
  const study = isStudyProposal(proposal) ? proposal : null;
  const habit = checkin || study ? null : proposal as HabitProposal;
  const [overwrite, setOverwrite] = useState(false);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [closed, setClosed] = useState(false);
  const [message, setMessage] = useState("");
  const date = proposal.date.split("-").reverse().join("/");

  async function decide(decision: "confirm" | "cancel") {
    if (inFlight.current || closed || (decision === "confirm" && checkin?.overwrite && !overwrite)) return;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/assistant/decision", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, decision, ...(checkin ? { kind: "checkin", overwrite } : study ? { kind: "study" } : {}) }),
      });
      const result = await response.json();
      if (typeof result.message === "string") {
        setClosed(true);
        setMessage(result.message);
        if (result.result === "confirmed" || result.result === "already_done") router.refresh();
      } else {
        setClosed(response.status === 401);
        setMessage(result.error || "No pudimos verificar el resultado. Intentá de nuevo.");
      }
    } catch {
      setMessage("No pudimos verificar el resultado. Intentá de nuevo con esta propuesta.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return <section className="assistant-proposal" aria-label={checkin ? "Propuesta de check-in diario" : study ? "Propuesta de sesión de estudio" : "Propuesta para completar un hábito"}>
    <strong>{checkin ? "Check-in diario" : study ? `Estudio · ${study.subject}` : habit?.name}</strong>
    <p><time dateTime={proposal.date}>{date}</time>{habit && " · Marcar como completado"}</p>
    {checkin && <dl className="assistant-proposal-values">
      <div><dt>Energía</dt><dd>{checkin.values.energy}/5</dd></div>
      <div><dt>Estado emocional</dt><dd>{checkin.values.emotional_state}/5</dd></div>
      <div><dt>Satisfacción con el día</dt><dd>{checkin.values.life_rating}/5</dd></div>
      {checkin.values.sleep_hours !== undefined && <div><dt>Horas de sueño</dt><dd>{checkin.values.sleep_hours}</dd></div>}
      {checkin.values.stress !== undefined && <div><dt>Estrés</dt><dd>{checkin.values.stress}/5</dd></div>}
    </dl>}
    {study && <dl className="assistant-proposal-values">
      <div><dt>Tema</dt><dd>{study.topic}</dd></div>
      <div><dt>Duración</dt><dd>{study.duration_minutes} minutos</dd></div>
    </dl>}
    {!closed && checkin?.overwrite && <label className="assistant-overwrite">
      <input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.target.checked)} />
      <span>Confirmo que quiero actualizar estos valores del check-in de hoy.</span>
    </label>}
    {!closed && <div className="assistant-proposal-actions">
      <button className="assistant-send" type="button" disabled={busy || Boolean(checkin?.overwrite && !overwrite)} onClick={() => void decide("confirm")}>Confirmar</button>
      <button className="assistant-cancel" type="button" disabled={busy} onClick={() => void decide("cancel")}>Cancelar</button>
    </div>}
    <p role="status">{busy ? "Procesando…" : message}</p>
  </section>;
}

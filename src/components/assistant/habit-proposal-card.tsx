"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HabitProposal } from "@/lib/assistant/habit-proposal";

export function HabitProposalCard({ proposal }: { proposal: HabitProposal }) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [closed, setClosed] = useState(false);
  const [message, setMessage] = useState("");
  const date = proposal.date.split("-").reverse().join("/");

  async function decide(decision: "confirm" | "cancel") {
    if (inFlight.current || closed) return;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/assistant/decision", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, decision }),
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

  return <section className="assistant-proposal" aria-label="Propuesta para completar un hábito">
    <strong>{proposal.name}</strong>
    <p><time dateTime={proposal.date}>{date}</time> · Marcar como completado</p>
    {!closed && <div className="assistant-proposal-actions">
      <button className="assistant-send" type="button" disabled={busy} onClick={() => void decide("confirm")}>Confirmar</button>
      <button className="assistant-cancel" type="button" disabled={busy} onClick={() => void decide("cancel")}>Cancelar</button>
    </div>}
    <p role="status">{busy ? "Procesando…" : message}</p>
  </section>;
}

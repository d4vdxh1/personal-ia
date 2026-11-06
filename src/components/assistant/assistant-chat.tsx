"use client";

import { useRef, useState, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; text: string };
const examples = [
  "¿Qué tengo que hacer hoy?",
  "¿Qué tareas o exámenes tengo pendientes?",
  "¿Qué entrenamiento me toca hoy?",
];
export function AssistantChat({ enabled }: { enabled: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const inFlight = useRef(false);

  async function ask(message: string) {
    if (!enabled || inFlight.current) return;
    const text = message.trim();
    if (text.length < 2 || text.length > 500) {
      setError("La consulta debe tener entre 2 y 500 caracteres.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    setInput("");
    setMessages(old => [...old, { role: "user", text }]);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data: unknown = await response.json();
      const result = data as { answer?: unknown; error?: unknown; remaining?: unknown };
      if (!response.ok || typeof result.answer !== "string") {
        throw new Error(typeof result.error === "string" ? result.error : "No se pudo obtener una respuesta.");
      }
      setMessages(old => [...old, { role: "assistant", text: result.answer as string }]);
      if (typeof result.remaining === "number") setRemaining(result.remaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos completar tu consulta.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }
  return <div className="assistant-chat">
    <section className="assistant-conversation" aria-label="Conversación con el asistente" aria-live="polite">
      {messages.length === 0 && <div className="assistant-welcome">
        <span className="assistant-mark" aria-hidden="true">✳</span>
        <h2>¿En qué te puedo ayudar hoy?</h2>
        <p>Consultá tus hábitos, objetivos, entrenamientos y compromisos académicos. Respondo usando lo que registraste en Día a Día.</p>
        <div className="assistant-suggestions">
          {examples.map(example => <button key={example} type="button" onClick={() => void ask(example)}
            disabled={!enabled || busy}>{example}</button>)}
        </div>
      </div>}
      {messages.map((message, index) => <article key={index}
        className={message.role === "user" ? "assistant-message is-user" : "assistant-message is-assistant"}>
        <span className="assistant-role">{message.role === "user" ? "Vos" : "Día a Día"}</span>
        <p>{message.text}</p>
      </article>)}
      {busy && <div role="status" className="assistant-thinking"><span className="assistant-spinner" aria-hidden="true"/> Consultando tu información…</div>}
    </section>
    <div className="assistant-bottom">
      {error && <p className="form-error" role="alert">{error}</p>}
      {!enabled && <p className="assistant-unavailable" role="status">Para activar el asistente falta configurar la clave de Gemini en Vercel. Tus demás módulos siguen funcionando normalmente.</p>}
      <form className="assistant-compose" onSubmit={submit}>
        <label className="sr-only" htmlFor="assistant-question">Tu pregunta</label>
        <textarea id="assistant-question" rows={2} maxLength={500} value={input}
          onChange={event => setInput(event.target.value)}
          placeholder={enabled ? "Escribí una pregunta sobre tu día…" : "Asistente pendiente de configuración"}
          disabled={busy || !enabled} onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (!busy) void ask(input);
            }
          }}/>
        <button className="assistant-send" type="submit" disabled={!enabled || busy || input.trim().length < 2}>Enviar</button>
      </form>
      <div className="assistant-disclaimer">
        <span>Solo lectura · Sin cambios en tus registros · Sin historial guardado</span>
        <span>{remaining === null ? "Máximo 20 consultas al día" : `${remaining} consultas disponibles hoy`}</span>
      </div>
    </div>
  </div>;
}

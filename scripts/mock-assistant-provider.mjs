// Loaded only by the isolated Next test process. Gemini traffic never leaves it.
import assert from "node:assert/strict";
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.hostname !== "generativelanguage.googleapis.com") return originalFetch(input, init);
  const request = new Request(input, init);
  assert.equal(request.headers.get("x-goog-api-key"), "browser-test-only");
  const body = await request.json();
  const text = body.contents[0].parts[0].text;
  const name = "propose_mark_habit";
  const call = (name, args) => ({ functionCall: { name, args, id: "test-call" } });
  let parts;
  if (!body.tools) {
    assert.equal(body.contents.at(-1).parts[0].functionResponse.name, "get_habits_summary");
    parts = [{ text: "Resumen de hábitos consultado." }];
  } else {
    const declared = body.tools[0].functionDeclarations.map(tool => tool.name);
    assert.ok(declared.includes(name) && !declared.includes("decide_habit_proposal"));
    if (text === "Recordatorio válido") {
      const future = new Date(Date.now()+5*86400000);
      const date = new Intl.DateTimeFormat("en-CA",{timeZone:"America/Asuncion",year:"numeric",month:"2-digit",day:"2-digit"}).format(future);
      parts = [call("propose_reminder",{title:"Repasar Cálculo",time:"19:00",date,frequency:"once"})];
    }
    else if (text === "Recordatorio recurrente") parts = [call("propose_reminder",{title:"Leer",time:"19:00",frequency:"weekly",weekdays:[1,3]})];
    else if (text === "Recordatorio inválido") parts = [call("propose_reminder",{title:"Repasar",time:"19:00",frequency:"once",user_id:"ajeno"})];
    else if (text === "Estudio válido") parts = [call("propose_study_session", { subject_name: "Ingeniería del Software", topic: "Repaso de arquitectura con IA", duration_minutes: 45 })];
    else if (text === "Estudio incompleto") parts = [call("propose_study_session", { subject_name: "Ingeniería del Software", duration_minutes: 45 })];
    else if (text === "Estudio con ID") parts = [call("propose_study_session", { subject_name: "Ingeniería del Software", topic: "Arquitectura", duration_minutes: 45, user_id: "foreign" })];
    else if (text.startsWith("Check-in válido")) parts = [call("propose_daily_checkin", { energy: 4, emotional_state: 3, life_rating: 5, sleep_hours: 7.25 })];
    else if (text === "Check-in incompleto") parts = [call("propose_daily_checkin", { energy: 4 })];
    else if (text === "Check-in con notas") parts = [call("propose_daily_checkin", { energy: 4, emotional_state: 3, life_rating: 5, notes: "private" })];
    else if (text === "Resumen de hábitos") parts = [call("get_habits_summary", {})];
    else if (text === "Argumentos extra") parts = [call(name, { habit_name: "Lectura", completed: true })];
    else if (text === "Herramienta desconocida") parts = [call("decide_habit_proposal", {})];
    else if (text === "Dos propuestas") parts = [call(name, { habit_name: "Lectura" }), call(name, { habit_name: "Leer" })];
    else parts = [call(name, { habit_name: "Lectura" })];
  }
  return Response.json({ candidates: [{ content: { role: "model", parts } }] });
};

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
    if (text === "Resumen de hábitos") parts = [call("get_habits_summary", {})];
    else if (text === "Argumentos extra") parts = [call(name, { habit_name: "Lectura", completed: true })];
    else if (text === "Herramienta desconocida") parts = [call("decide_habit_proposal", {})];
    else if (text === "Dos propuestas") parts = [call(name, { habit_name: "Lectura" }), call(name, { habit_name: "Leer" })];
    else parts = [call(name, { habit_name: "Lectura" })];
  }
  return Response.json({ candidates: [{ content: { role: "model", parts } }] });
};

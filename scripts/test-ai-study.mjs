import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
function load(path, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports, FormData, AbortController, setTimeout, clearTimeout,
    require(name) {
      assert.ok(name in dependencies, name);
      return dependencies[name];
    },
  });
  return exports;
}
const study = load("src/lib/assistant/study-proposal.ts", {
  "./habit-proposal": { proposalId: /^[0-9a-f-]{36}$/i },
});
const valid = { subject_name: "Ingeniería del Software", topic: "Arquitectura", duration_minutes: 45 };
for (const invalid of [null, [], {}, { ...valid, duration_minutes: 0 },
  { ...valid, duration_minutes: 721 }, { ...valid, duration_minutes: 1.5 },
  { ...valid, duration_minutes: "45" }, { ...valid, subject_name: "" },
  { ...valid, topic: " " }, { ...valid, topic: "x".repeat(201) },
  { ...valid, notes: "privado" }, { ...valid, study_date: "2026-11-08" },
  { ...valid, user_id: "otro" }, { ...valid, subject_id: "otro" }]) {
  assert.equal(study.parseStudyValues(invalid), null);
}
assert.equal(study.parseStudyValues(valid).duration_minutes, 45);
assert.equal(study.isStudyProposal({
  kind: "study", id: "11111111-1111-4111-8111-111111111111",
  date: "2026-11-08", subject: valid.subject_name, topic: valid.topic, duration_minutes: 45,
}), true);
const { GeminiProvider } = load("src/lib/assistant/provider.ts", {
  "server-only": {}, "./checkin-proposal": { parseCheckinValues: () => null },
  "./study-proposal": study,
  "./tools": { READ_TOOLS: [], isReadToolName: () => false },
});
const turn = parts => new GeminiProvider("test", async (url, request) => {
  assert.equal(request.headers["x-goog-api-key"], "test");
  assert.equal(url.includes("test"), false);
  const body = JSON.parse(request.body);
  assert.ok(body.tools[0].functionDeclarations.some(tool => tool.name === "propose_study_session"));
  return Response.json({ candidates: [{ content: { parts } }] });
}).generate([{ role: "user", parts: [{ text: "estudio" }] }], true);
const call = args => [{ functionCall: { name: "propose_study_session", args } }];
assert.equal((await turn(call(valid))).calls[0].values.duration_minutes, 45);
await assert.rejects(turn(call({ ...valid, user_id: "foreign" })));
await assert.rejects(turn(call({ subject_name: "Matemática", duration_minutes: 30 })));
await assert.rejects(turn([{ functionCall: { name: "decide_study_proposal", args: {} } }]));
console.log("PASS: sesiones de estudio exigen materia, tema y duración explícitos; no se aceptan IDs, notas ni fechas.");
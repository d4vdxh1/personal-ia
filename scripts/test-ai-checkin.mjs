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
const validation = load("src/lib/checkins/validation.ts");
const proposals = load("src/lib/assistant/checkin-proposal.ts", {
  "@/lib/checkins/validation": validation,
  "./habit-proposal": { proposalId: /^[0-9a-f-]{36}$/i },
});
const valid = { energy: 4, emotional_state: 3, life_rating: 5, sleep_hours: 7.25 };
for (const field of ["energy", "emotional_state", "life_rating"]) {
  for (const value of [undefined, 0, 6, 1.5, "4", null, NaN, Infinity]) {
    assert.equal(proposals.parseCheckinValues({ ...valid, [field]: value }), null);
  }
}
for (const input of [null, [], {}, { ...valid, notes: "secret" }, { ...valid, sleep_hours: 7.123 },
  { ...valid, user_id: "other" }, { ...valid, stress: "3" }, { ...valid, stress: 0 }]) {
  assert.equal(proposals.parseCheckinValues(input), null);
}
assert.equal(proposals.parseCheckinValues(valid).sleep_hours, 7.25);
assert.equal(proposals.parseCheckinValues({ energy: 1, emotional_state: 5, life_rating: 3 }).stress, undefined);

const { GeminiProvider } = load("src/lib/assistant/provider.ts", {
  "server-only": {}, "./checkin-proposal": proposals,
  "./study-proposal": { parseStudyValues: () => null },
  "./tools": { READ_TOOLS: [], isReadToolName: name => name === "get_habits_summary" },
});
const turn = parts => new GeminiProvider("test", async (url, request) => {
  assert.equal(request.headers["x-goog-api-key"], "test");
  assert.equal(url.includes("test"), false);
  return Response.json({ candidates: [{ content: { parts } }] });
}).generate([{ role: "user", parts: [{ text: "check-in" }] }], true);
const call = args => [{ functionCall: { name: "propose_daily_checkin", args } }];
assert.equal((await turn(call(valid))).calls[0].values.energy, 4);
await assert.rejects(turn(call({ ...valid, notes: "secret" })));
await assert.rejects(turn(call({ energy: 4 })));
await assert.rejects(turn([{ functionCall: { name: "decide_checkin_proposal", args: {} } }]));
console.log("PASS: check-in model arguments use domain validation, require explicit numeric scales and reject private/foreign fields.");

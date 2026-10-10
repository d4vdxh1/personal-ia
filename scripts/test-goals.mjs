import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadModule(path, dependencies = {}) {
  const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  runInNewContext(compiled.outputText, {
    exports, Date,
    require(name) { assert.ok(name in dependencies, `Unexpected dependency: ${name}`); return dependencies[name]; },
  });
  return exports;
}
const { parseGoal, goalFilter } = loadModule("src/lib/goals/validation.ts");
function form(overrides = {}) {
  const result = new FormData();
  for (const [name, value] of Object.entries({ title: "Leer un libro", type: "monthly", target_date: "2026-10-31", progress: "0", status: "active", ...overrides })) {
    if (value !== undefined) result.set(name, value);
  }
  return result;
}
assert.equal(parseGoal(form()).progress, 0);
assert.equal(parseGoal(form({ title: " Meta " })).title, "Meta");
for (const title of ["", "  ", "a".repeat(201), undefined, new Blob(["file"])]) assert.equal(parseGoal(form({ title })), null);
for (const progress of ["-1", "101", "1.5", "", "NaN", "Infinity", "1e1", undefined]) assert.equal(parseGoal(form({ progress })), null);
for (const target_date of ["2026-02-30", "2025-02-29", "0000-01-01", "2026-13-01", "", undefined]) assert.equal(parseGoal(form({ target_date })), null);
assert.ok(parseGoal(form({ target_date: "2024-02-29" })));
assert.ok(parseGoal(form({ title: "a".repeat(200), type: "weekly" })));
assert.equal(parseGoal(form({ status: "completed", progress: "99" })), null);
assert.ok(parseGoal(form({ status: "completed", progress: "100" })));
assert.ok(parseGoal(form({ status: "cancelled", progress: "40" })));
assert.equal(parseGoal(form({ status: "deleted" })), null);
assert.equal(parseGoal(form({ type: "daily" })), null);
assert.equal(goalFilter("completed"), "completed");
assert.equal(goalFilter(["active"]), "all");

const ownId = "11111111-1111-4111-8111-111111111111";
const foreignId = "22222222-2222-4222-8222-222222222222";
const rows = new Map([[ownId, { user_id: "owner", progress: 0 }], [foreignId, { user_id: "other", progress: 0 }]]);
let user = { id: "owner" };
let databaseError = false;
let writes = 0;
const refreshed = [];
const client = {
  auth: { getUser: async () => ({ data: { user }, error: null }) },
  from(table) {
    assert.equal(table, "goals");
    const filters = {};
    let values;
    let insertion = false;
    const query = {
      insert(payload) { values = payload; insertion = true; return query; },
      update(payload) { values = payload; return query; },
      eq(key, value) { filters[key] = value; return query; },
      select(fields) { assert.equal(fields, "id"); return query; },
      async maybeSingle() {
        writes++;
        if (databaseError) return { data: null, error: { message: "unavailable" } };
        if (insertion) {
          assert.equal(values.user_id, user.id);
          rows.set("new", values);
          return { data: { id: "new" }, error: null };
        }
        assert.equal(filters.user_id, user.id);
        assert.equal(values.user_id, undefined);
        const row = rows.get(filters.id);
        if (!row || row.user_id !== filters.user_id) return { data: null, error: null };
        rows.set(filters.id, { ...row, ...values });
        return { data: { id: filters.id }, error: null };
      },
    };
    return query;
  },
};
const { saveGoal } = loadModule("src/app/goals/actions.ts", {
  "next/cache": { revalidatePath: (path) => refreshed.push(path) },
  "@/lib/supabase/server": { createClient: async () => client },
  "@/lib/goals/validation": { parseGoal },
});
const state = { message: "", error: false, saved: false };
assert.equal((await saveGoal(state, form({ user_id: "other" }))).saved, true);
assert.equal((await saveGoal(state, form({ goalId: ownId, progress: "100", status: "completed" }))).saved, true);
assert.equal(rows.get(ownId).status, "completed");
assert.equal((await saveGoal(state, form({ goalId: ownId, progress: "30", status: "active" }))).saved, true);
assert.equal((await saveGoal(state, form({ goalId: ownId, progress: "30", status: "cancelled" }))).saved, true);
assert.equal(rows.get(ownId).progress, 30);
assert.equal((await saveGoal(state, form({ goalId: foreignId, progress: "100" }))).error, true);
assert.equal(rows.get(foreignId).progress, 0);
assert.equal((await saveGoal(state, form({ goalId: "33333333-3333-4333-8333-333333333333" }))).saved, false);
const previousWrites = writes;
assert.equal((await saveGoal(state, form({ goalId: "invalid" }))).error, true);
assert.equal((await saveGoal(state, form({ progress: "101" }))).error, true);
user = null;
assert.equal((await saveGoal(state, form())).error, true);
assert.equal(writes, previousWrites);
user = { id: "owner" };
databaseError = true;
assert.equal((await saveGoal(state, form())).saved, false);
assert.equal(refreshed.length, 8);

const { loadGoals } = loadModule("src/lib/goals/data.ts", { "server-only": {} });
const filters = [];
const readQuery = {
  select(fields, options) { assert.match(fields, /progress/); assert.equal(options.count, "exact"); return this; },
  eq(key, value) { filters.push([key, value]); return this; },
  order(key, options) { assert.ok(["target_date", "id"].includes(key)); assert.equal(options.ascending, true); return this; },
  async range(start, end) { assert.equal(start, 10); assert.equal(end, 19); return { data: [], count: 12, error: null }; },
};
assert.equal((await loadGoals({ from: () => readQuery }, "owner", 2, "completed")).count, 12);
assert.deepEqual(filters, [["user_id", "owner"], ["status", "completed"]]);
readQuery.range = async () => ({ data: null, count: null, error: { message: "unavailable" } });
assert.equal((await loadGoals({ from: () => readQuery }, "owner", 1, "all")).error, true);
console.log("PASS: objetivos, fechas, avance, estados, sesión, identidad, edición propia/ajena/inexistente, errores, filtros y paginación (Supabase simulado).");

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
    exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    Intl, Date,
  });
  return exports;
}

const { parseCheckin } = loadModule("src/lib/checkins/validation.ts");
const { getBuenosAiresToday } = loadModule("src/lib/habits/data.ts", {
  "server-only": {}, "./constants": {},
});
assert.equal(getBuenosAiresToday(new Date("2026-10-10T02:59:59Z")).date, "2026-10-09");
assert.equal(getBuenosAiresToday(new Date("2026-10-10T03:00:00Z")).date, "2026-10-10");

function form(overrides = {}) {
  const result = new FormData();
  for (const [name, value] of Object.entries({
    energy: "3", emotional_state: "4", life_rating: "5", sleep_hours: "7.5", stress: "",
    notes: "  Buen día  ", entryDate: "2026-10-10", ...overrides,
  })) {
    if (value !== undefined) result.set(name, value);
  }
  return result;
}

assert.equal(parseCheckin(form()).sleep_hours, 7.5);
assert.equal(parseCheckin(form()).notes, "Buen día");
assert.equal(parseCheckin(form()).stress, null);
assert.equal(parseCheckin(form({ sleep_hours: "", notes: " " })).sleep_hours, null);
assert.equal(parseCheckin(form({ sleep_hours: "0" })).sleep_hours, 0);
assert.equal(parseCheckin(form({ sleep_hours: "24" })).sleep_hours, 24);
for (const field of ["energy", "emotional_state", "life_rating"]) {
  for (const value of [undefined, "", "0", "6", "1.5", "NaN", "Infinity"]) {
    assert.equal(parseCheckin(form({ [field]: value })), null, `${field}: ${value}`);
  }
}
for (const value of ["-1", "24.01", "7.555", "NaN", "Infinity", "0x10", "1e1"]) {
  assert.equal(parseCheckin(form({ sleep_hours: value })), null, `sleep: ${value}`);
}
assert.equal(parseCheckin(form({ stress: "6" })), null);
assert.equal(parseCheckin(form({ notes: "a".repeat(10001) })), null);
assert.ok(parseCheckin(form({ notes: "a".repeat(10000) })));
assert.equal(parseCheckin(form({ notes: new Blob(["file"]) })), null);

let user = { id: "authenticated-user" };
let databaseError = null;
let writes = 0;
const rows = new Map();
const revalidated = [];
const client = {
  auth: { getUser: async () => ({ data: { user }, error: null }) },
  from(table) {
    assert.equal(table, "daily_checkins");
    return {
      async upsert(row, options) {
        writes++;
        assert.equal(options.onConflict, "user_id,entry_date");
        if (!databaseError) rows.set(`${row.user_id}:${row.entry_date}`, row);
        return { error: databaseError };
      },
    };
  },
};
const { saveCheckin } = loadModule("src/app/check-in/actions.ts", {
  "next/cache": { revalidatePath: (path) => revalidated.push(path) },
  "@/lib/supabase/server": { createClient: async () => client },
  "@/lib/habits/data": { getBuenosAiresToday: () => ({ date: "2026-10-10" }) },
  "@/lib/checkins/validation": { parseCheckin },
});
const state = { error: false, message: "" };
assert.equal((await saveCheckin(state, form({ user_id: "other-user" }))).error, false);
assert.equal(rows.get("authenticated-user:2026-10-10").energy, 3);
assert.equal((await saveCheckin(state, form({ energy: "5" }))).error, false);
assert.equal(rows.size, 1);
assert.equal(rows.get("authenticated-user:2026-10-10").energy, 5);
assert.deepEqual(revalidated, ["/", "/check-in", "/", "/check-in"]);
assert.equal((await saveCheckin(state, form({ entryDate: "2026-10-09" }))).error, true);
assert.equal((await saveCheckin(state, form({ energy: "6" }))).error, true);
user = null;
assert.equal((await saveCheckin(state, form())).error, true);
assert.equal(writes, 2);
user = { id: "authenticated-user" };
databaseError = { message: "Database unavailable" };
assert.equal((await saveCheckin(state, form())).error, true);
assert.equal(revalidated.length, 4);
console.log("Check-in: validación, fecha local, sesión, identidad, upsert y errores correctos (Supabase simulado).");

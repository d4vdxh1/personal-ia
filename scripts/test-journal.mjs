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
    Date,
  });
  return exports;
}

const { parseJournalEntry, journalPage } = loadModule("src/lib/journal/validation.ts");
const today = "2026-10-10";
function form(overrides = {}) {
  const result = new FormData();
  for (const [name, value] of Object.entries({ entry_date: today, relevant_event: "Algo bueno", notes: "", ...overrides })) {
    if (value !== undefined) result.set(name, value);
  }
  return result;
}
for (const date of ["2026-10-11", "2026-02-30", "2025-02-29", "2026-13-01", "0000-01-01", "2026-1-1", "", undefined]) {
  assert.equal(parseJournalEntry(form({ entry_date: date }), today), null, `Invalid date ${date}`);
}
assert.ok(parseJournalEntry(form({ entry_date: "2024-02-29" }), today));
assert.equal(parseJournalEntry(form({ relevant_event: " \n ", notes: "\t" }), today), null);
assert.equal(parseJournalEntry(form({ relevant_event: "", notes: " Nota \n" }), today).notes, "Nota");
assert.equal(parseJournalEntry(form({ relevant_event: "a".repeat(2001) }), today), null);
assert.equal(parseJournalEntry(form({ notes: "a".repeat(10001) }), today), null);
assert.ok(parseJournalEntry(form({ relevant_event: "a".repeat(2000), notes: "a".repeat(10000) }), today));
assert.equal(parseJournalEntry(form({ notes: new Blob(["file"]) }), today), null);
assert.equal(journalPage("2"), 2);
for (const page of ["0", "-1", "1.5", "999999999999", ["2"], undefined]) assert.equal(journalPage(page), 1);

const ownId = "11111111-1111-4111-8111-111111111111";
const foreignId = "22222222-2222-4222-8222-222222222222";
let user = { id: "owner" };
let databaseError = false;
let writeCount = 0;
const rows = new Map([[ownId, { user_id: "owner", notes: "Original" }], [foreignId, { user_id: "other", notes: "Private" }]]);
const refreshed = [];
const client = {
  auth: { getUser: async () => ({ data: { user }, error: null }) },
  from(table) {
    assert.equal(table, "journal_entries");
    let values;
    let operation;
    const filters = {};
    const query = {
      insert(payload) { values = payload; operation = "insert"; return query; },
      update(payload) { values = payload; operation = "update"; return query; },
      eq(key, value) { filters[key] = value; return query; },
      select(fields) { assert.equal(fields, "id"); return query; },
      async maybeSingle() {
        writeCount++;
        if (databaseError) return { data: null, error: { message: "unavailable" } };
        if (operation === "insert") {
          assert.equal(values.user_id, user.id);
          const id = `new-${writeCount}`;
          rows.set(id, values);
          return { data: { id }, error: null };
        }
        assert.equal(filters.user_id, user.id);
        const row = rows.get(filters.id);
        if (!row || row.user_id !== filters.user_id) return { data: null, error: null };
        assert.equal(values.user_id, undefined);
        rows.set(filters.id, { ...row, ...values });
        return { data: { id: filters.id }, error: null };
      },
    };
    return query;
  },
};
const { saveJournalEntry } = loadModule("src/app/journal/actions.ts", {
  "next/cache": { revalidatePath: (path) => refreshed.push(path) },
  "@/lib/supabase/server": { createClient: async () => client },
  "@/lib/habits/data": { getBuenosAiresToday: () => ({ date: today }) },
  "@/lib/journal/validation": { parseJournalEntry },
});
const state = { message: "", error: false, saved: false };
assert.equal((await saveJournalEntry(state, form({ user_id: "other" }))).saved, true);
assert.equal((await saveJournalEntry(state, form({ notes: "Second entry" }))).saved, true);
assert.equal(rows.size, 4);
assert.equal((await saveJournalEntry(state, form({ entryId: ownId, notes: "Edited" }))).saved, true);
assert.equal(rows.get(ownId).notes, "Edited");
assert.equal((await saveJournalEntry(state, form({ entryId: foreignId, notes: "Attack" }))).error, true);
assert.equal(rows.get(foreignId).notes, "Private");
assert.equal((await saveJournalEntry(state, form({ entryId: "33333333-3333-4333-8333-333333333333" }))).saved, false);
const previousWrites = writeCount;
assert.equal((await saveJournalEntry(state, form({ entryId: "invalid" }))).error, true);
assert.equal((await saveJournalEntry(state, form({ relevant_event: "", notes: "" }))).error, true);
user = null;
assert.equal((await saveJournalEntry(state, form())).error, true);
assert.equal(writeCount, previousWrites);
user = { id: "owner" };
databaseError = true;
assert.equal((await saveJournalEntry(state, form())).saved, false);
assert.deepEqual(refreshed, ["/journal", "/", "/journal", "/", "/journal", "/"]);

const { loadJournal } = loadModule("src/lib/journal/data.ts", { "server-only": {} });
const ordering = [];
const readQuery = {
  select(fields, options) { assert.match(fields, /notes/); assert.equal(options.count, "exact"); return this; },
  eq(key, value) { assert.equal(key, "user_id"); assert.equal(value, "owner"); return this; },
  order(key, options) { ordering.push(key); assert.equal(options.ascending, false); return this; },
  async range(start, end) { assert.equal(start, 10); assert.equal(end, 19); return { data: [], count: 22, error: null }; },
};
const result = await loadJournal({ from: () => readQuery }, "owner", 2);
assert.equal(result.count, 22);
assert.equal(result.error, false);
assert.deepEqual(ordering, ["entry_date", "created_at", "id"]);
readQuery.range = async () => ({ data: null, count: null, error: { message: "unavailable" } });
assert.equal((await loadJournal({ from: () => readQuery }, "owner", 2)).error, true);
console.log("PASS: fechas, textos, paginación, sesión, identidad, entradas múltiples, edición propia/ajena/inexistente y errores (Supabase simulado).");

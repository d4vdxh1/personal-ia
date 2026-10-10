import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const exports = {};
const compiled = ts.transpileModule(readFileSync("src/lib/today/data.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
runInNewContext(compiled.outputText, { exports, require(name) { assert.equal(name, "server-only"); return {}; } });
const calls = [];
let result = { data: [{ id: "note" }], count: 5, error: null };
const query = {};
for (const method of ["select", "eq", "order"]) query[method] = (...args) => { calls.push([method, ...args]); return query; };
query.limit = async (limit) => { calls.push(["limit", limit]); return result; };
const client = { from(table) { assert.equal(table, "journal_entries"); return query; } };
const loaded = await exports.loadTodayJournal(client, "owner", "2026-10-10");
assert.equal(loaded.count, 5);
assert.equal(loaded.entries[0].id, "note");
assert.equal(loaded.error, false);
assert.ok(calls.some(([method, field, value]) => method === "eq" && field === "user_id" && value === "owner"));
assert.ok(calls.some(([method, field, value]) => method === "eq" && field === "entry_date" && value === "2026-10-10"));
assert.equal(calls.at(-1)[1], 3);
assert.deepEqual(JSON.parse(JSON.stringify(calls.filter(([method]) => method === "order"))), [
  ["order", "created_at", { ascending: false }], ["order", "id", { ascending: false }],
]);
result = { data: null, count: null, error: { message: "Failure" } };
const failed = await exports.loadTodayJournal(client, "owner", "2026-10-10");
assert.equal(failed.error, true);
assert.equal(failed.entries.length, 0);
assert.equal(failed.count, 0);
result = { data: [], count: 0, error: null };
assert.equal((await exports.loadTodayJournal(client, "owner", "2026-10-10")).error, false);
assert.equal(existsSync("src/app/api/health/supabase/route.ts"), false);
assert.equal(readFileSync("src/proxy.ts", "utf8").includes("api/health/supabase"), false);
assert.equal(existsSync("src/components/day-demo.tsx"), false);
console.log("PASS: diario de hoy filtrado por dueño/fecha, límite/orden/conteo, vacío/error diferenciados y diagnóstico/demo retirados.");

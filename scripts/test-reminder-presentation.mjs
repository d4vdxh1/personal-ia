import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const { outputText } = ts.transpileModule(readFileSync("src/lib/reminders/presentation.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
runInNewContext(outputText, { exports });
const { collapseRecurringReminders } = exports;
const data = [
  { id:"m2", series_id:null, scheduled_at:"2026-11-11T10:00:00Z" },
  { id:"s1-b", series_id:"s1", scheduled_at:"2026-11-12T10:00:00Z" },
  { id:"s2-a", series_id:"s2", scheduled_at:"2026-11-09T12:00:00Z" },
  { id:"s1-a", series_id:"s1", scheduled_at:"2026-11-10T10:00:00Z" },
  { id:"m1", series_id:null, scheduled_at:"2026-11-09T09:00:00Z" },
  { id:"s2-b", series_id:"s2", scheduled_at:"2026-11-15T12:00:00Z" },
];
const original = data.map(r=>r.id).join(",");
const {visible,extras}=collapseRecurringReminders(data);
assert.equal(visible.map(r=>r.id).join(","),"m1,s2-a,s1-a,m2");
assert.equal(extras.get("s1").map(r=>r.id).join(","),"s1-b");
assert.equal(extras.get("s2").map(r=>r.id).join(","),"s2-b");
assert.equal(data.map(r=>r.id).join(","),original,"must not mutate original");
assert.equal(collapseRecurringReminders([]).visible.length,0);
assert.equal(collapseRecurringReminders(data.filter(r=>r.series_id===null)).visible.length,2);
console.log("PASS: one visible pending occurrence per series, all standalone visible, extra occurrences accessible.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const { outputText } = ts.transpileModule(readFileSync("src/lib/reminders/presentation.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
runInNewContext(outputText, { exports, Date });
const { collapseRecurringReminders } = exports;
const data = [
  { id:"m2", series_id:null, scheduled_at:"2026-11-11T10:00:00Z" },
  { id:"s1-b", series_id:"s1", scheduled_at:"2026-11-12T10:00:00Z" },
  { id:"s2-a", series_id:"s2", scheduled_at:"2026-11-09T12:00:00Z" },
  { id:"s1-a", series_id:"s1", scheduled_at:"2026-11-10T10:00:00Z" },
  { id:"m1", series_id:null, scheduled_at:"2026-11-09T09:00:00Z" },
  { id:"s2-b", series_id:"s2", scheduled_at:"2026-11-15T12:00:00Z" },
];
const original=data.map(r=>r.id).join(",");
const {visible,extras}=collapseRecurringReminders(data,"2026-11-08T00:00:00Z");
assert.equal(visible.map(r=>r.id).join(","),"m1,s2-a,s1-a,m2");
assert.equal(extras.get("s1").map(r=>r.id).join(","),"s1-b");
assert.equal(extras.get("s2").map(r=>r.id).join(","),"s2-b");
assert.equal(data.map(r=>r.id).join(","),original,"input not mutated");
const later=collapseRecurringReminders(data,"2026-11-11T00:00:00Z");
assert.equal(later.visible.find(r=>r.series_id==="s1").id,"s1-b","prefer next future, not overdue");
assert.equal(later.extras.get("s1")[0].id,"s1-a","overdue remains accessible");
const overdue=collapseRecurringReminders(data,"2026-11-30T00:00:00Z");
assert.equal(overdue.visible.find(r=>r.series_id==="s2").id,"s2-b","keep latest overdue actionable");
assert.equal(collapseRecurringReminders([]).visible.length,0);
assert.equal(collapseRecurringReminders(data.filter(r=>!r.series_id)).visible.length,2);
console.log("PASS: one actionable occurrence per series, future preferred, others accessible, standalone visible.");

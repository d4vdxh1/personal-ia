import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
function load(file, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(file,"utf8"),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
  });
  const exports = {};
  runInNewContext(outputText,{
    exports,FormData,Date,Intl,
    require(name){assert.ok(name in dependencies,name);return dependencies[name];},
  });
  return exports;
}
const study = load("src/lib/study/validation.ts");
const { localReminderTimeToISO, reminderLocalInput, parseReminder } =
  load("src/lib/reminders/validation.ts",{"@/lib/study/validation":study});
const now = Date.parse("2026-11-01T00:00:00Z");
assert.equal(localReminderTimeToISO("2026-11-10T12:30", now),"2026-11-10T15:30:00.000Z");
assert.equal(reminderLocalInput("2026-11-10T15:30:00.000Z"),"2026-11-10T12:30");
for(const value of [null,34,"2026-02-30T12:00","2026-11-10T24:00",
  "2026-11-10T12:99","2026-11-10","2026-10-01T10:00","2026-11-10T12:00:00"]) {
  assert.equal(localReminderTimeToISO(value,now),null);
}
const form = new FormData();
form.set("title","  Estudiar informática  ");
form.set("notes","  Repasar  ");
form.set("scheduled_local","2026-11-10T12:30");
assert.equal(parseReminder(form,now).title,"Estudiar informática");
assert.equal(parseReminder(form,now).notes,"Repasar");
assert.equal(parseReminder(form,now).scheduled_at,"2026-11-10T15:30:00.000Z");
form.set("title"," ");
assert.equal(parseReminder(form,now),null);
form.set("title","Leer");
form.set("notes","n".repeat(1001));
assert.equal(parseReminder(form,now),null);
console.log("PASS: recordatorios validan título, notas, fecha futura y zona horaria.");

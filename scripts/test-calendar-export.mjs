import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {createHash} from "node:crypto";
import ts from "typescript";
const validId=x=>typeof x==="string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
const source=readFileSync("src/lib/calendar/export.ts","utf8");
const {outputText,diagnostics}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.ok(!diagnostics?.some(x=>x.category===ts.DiagnosticCategory.Error));
const exports={};runInNewContext(outputText,{exports,Date,require:n=>{
 if(n==="node:crypto")return {createHash};
 if(n==="@/lib/study/validation")return {isId:validId};
 throw Error("Unrecognized import "+n);
}});
const {calendarReminderEventId,reminderToCalendarEvent,matchesOwnedGoogleEvent}=exports;
const user="11111111-1111-4111-8111-111111111111";
const other="22222222-2222-4222-8222-222222222222";
const reminder="33333333-3333-4333-8333-333333333333";
const id=calendarReminderEventId(user,reminder);
assert.match(id,/^[a-v0-9]{32}$/);
assert.equal(calendarReminderEventId(user,reminder),id);
assert.notEqual(calendarReminderEventId(other,reminder),id);
assert.throws(()=>calendarReminderEventId(user,"invalid"));
const event=reminderToCalendarEvent({id:reminder,title:"Examen",scheduled_at:"2026-11-10T20:00:00Z"},id);
assert.equal(event.id,id);
assert.equal(event.summary,"Examen");
assert.equal(event.start.dateTime,"2026-11-10T20:00:00.000Z");
assert.equal(event.end.dateTime,"2026-11-10T20:30:00.000Z");
assert.equal(event.extendedProperties.private.diaADiaReminderId,reminder);
assert.equal(matchesOwnedGoogleEvent(event,id,reminder),true);
assert.equal(matchesOwnedGoogleEvent(event,id,other),false);
assert.equal(matchesOwnedGoogleEvent({...event,id:"wrong"},id,reminder),false);
assert.equal(matchesOwnedGoogleEvent(null,id,reminder),false);
for(const bad of [
 {id:reminder,title:"",scheduled_at:"2026-11-10T20:00:00Z"},
 {id:reminder,title:"a".repeat(201),scheduled_at:"2026-11-10T20:00:00Z"},
 {id:reminder,title:"Examen",scheduled_at:"not-a-date"}
])assert.throws(()=>reminderToCalendarEvent(bad,id));
console.log("PASS: exportación Calendar, IDs estables, payload mínimo y verificación anti-duplicados.");

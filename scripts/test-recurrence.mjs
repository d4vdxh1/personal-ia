import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
function load(path,deps={}){
 const compiled=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 const exports={};
 runInNewContext(compiled.outputText,{exports,FormData,require:(name)=>{assert.ok(name in deps,"dependency "+name);return deps[name];}});
 return exports;
}
const study=load("src/lib/study/validation.ts");
const {parseSeries,recurrenceLabel}=load("src/lib/reminders/recurrence.ts",{"@/lib/study/validation":study});
const form=new FormData();
for(const [key,value] of Object.entries({title:" Inglés ",notes:" Estudio ",frequency:"weekly",timezone:"America/Asuncion",local_time:"19:30",starts_on:"2026-11-08",until_on:"2027-01-20"}))form.set(key,value);
form.append("weekdays","1");form.append("weekdays","3");form.append("weekdays","1");
let parsed=parseSeries(form);assert.equal(parsed.title,"Inglés");assert.equal(parsed.notes,"Estudio");
assert.equal(parsed.weekdays.join(","),"1,3");
assert.equal(parsed.month_day,null);
assert.equal(recurrenceLabel("weekly",parsed.weekdays,null),"Cada semana: Lun, Mié");
form.set("frequency","monthly");assert.equal(parseSeries(form),null);
form.delete("weekdays");parsed=parseSeries(form);assert.equal(parsed.month_day,8);
form.set("frequency","daily");parsed=parseSeries(form);assert.equal(parsed.weekdays.length,0);
for(const [key,bad] of [["local_time","25:00"],["timezone","Invalid/Area"],["starts_on","2026-02-30"],["frequency","hourly"],["title"," "]]) {
 const before=form.get(key);form.set(key,bad);assert.equal(parseSeries(form),null,key);form.set(key,before);
}
form.set("until_on","2026-01-01");assert.equal(parseSeries(form),null);
console.log("PASS: recurrence forms, valid days/period/timezone, daily/weekly/monthly rules.");

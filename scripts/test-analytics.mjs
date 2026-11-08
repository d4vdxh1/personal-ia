import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const {outputText}=ts.transpileModule(readFileSync("src/lib/analytics/summary.ts","utf8"),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
});
const exports={};
runInNewContext(outputText,{exports,Date,Intl});
const {paraguayDate,lastNDates,buildAnalytics}=exports;
assert.equal(paraguayDate(new Date("2026-11-08T22:00:00Z")),"2026-11-08");
const dates=lastNDates("2026-11-08");
assert.equal(dates.join(","),"2026-11-02,2026-11-03,2026-11-04,2026-11-05,2026-11-06,2026-11-07,2026-11-08");
const empty={habits:[],habitEntries:[],studySessions:[],trainingSessions:[],scheduledTrainings:[],checkins:[],goals:[]};
const missing=buildAnalytics(dates,empty);
assert.equal(missing.habits.percentage,null,"zero eligible days must show no percentage");
assert.equal(missing.checkin.averageSleep,null);
assert.equal(missing.study.hours,0);
const report=buildAnalytics(dates,{
 habits:[
 {id:"h1",weekdays:[1,2,3,4,5,6,7],active:true,created_at:"2026-11-01T15:00:00Z"},
 {id:"h2",weekdays:[3],active:true,created_at:"2026-11-03T12:00:00Z"},
 {id:"old",weekdays:[1,2,3,4,5,6,7],active:false,created_at:"2025-01-01T00:00:00Z"},
 ],
 habitEntries:[
 {habit_id:"h1",entry_date:"2026-11-02",completed:true},
 {habit_id:"h2",entry_date:"2026-11-04",completed:true},
 {habit_id:"old",entry_date:"2026-11-02",completed:true},
 {habit_id:"h1",entry_date:"2026-11-05",completed:false},
 ],
 studySessions:[{study_date:"2026-11-02",duration_minutes:30},{study_date:"2026-11-02",duration_minutes:60}],
 trainingSessions:[{entry_date:"2026-11-03",status:"completed"},{entry_date:"2026-11-04",status:"in_progress"}],
 scheduledTrainings:[{scheduled_date:"2026-11-03"},{scheduled_date:"2026-11-05"}],
 checkins:[{entry_date:"2026-11-02",energy:4,sleep_hours:7},{entry_date:"2026-11-03",energy:2,sleep_hours:null}],
 goals:[{status:"active",progress:40},{status:"completed",progress:100}],
});
assert.equal(report.habits.scheduled,8);
assert.equal(report.habits.completed,2);
assert.equal(report.habits.percentage,25);
assert.equal(report.study.hours,1.5);
assert.equal(report.training.completed,1);
assert.equal(report.training.scheduled,2);
assert.equal(report.checkin.averageEnergy,3);
assert.equal(report.checkin.averageSleep,7);
assert.equal(report.goals.active,1);
assert.equal(report.goals.completed,1);
assert.equal(report.goals.averageProgress,40);
assert.equal(report.daily[0].studyMinutes,90);
console.log("PASS: Phase 6A 7-day date window, aggregation, no-data safeguards, inactive habits and goals.");

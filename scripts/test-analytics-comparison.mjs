import assert from "node:assert/strict";
import ts from "typescript";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const transpiled=ts.transpileModule(readFileSync("src/lib/analytics/comparison.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const exports={};runInNewContext(transpiled.outputText,{exports});
const {periodDays,resolvePeriod,compareAnalytics,reviewPayload,isUsefulReview,reviewPrompt}=exports;
assert.equal(periodDays("week"),7);
assert.equal(periodDays("month"),30);
assert.equal(resolvePeriod("invalid"),"week");
assert.equal(resolvePeriod(["month"]),"week");
const fixture=(habitPct,studyMinutes,completedWorkouts,energy,sleep,planned=5)=>({
 habits:{percentage:habitPct,scheduled:planned,completed:2},
 study:{minutes:studyMinutes,hours:studyMinutes/60},
 training:{completed:completedWorkouts,scheduled:2},
 checkin:{days:energy===null?0:1,averageEnergy:energy,averageSleep:sleep},
 goals:{active:1,completed:2,averageProgress:45},daily:[],
});
const curr=fixture(60,90,2,4,7);
const prev=fixture(40,60,1,3,8);
const diff=compareAnalytics(curr,prev);
assert.equal(diff.studyMinutes,30);
assert.equal(diff.workouts,1);
assert.equal(diff.habitPercentagePoints,20);
assert.equal(diff.energyDifference,1);
assert.equal(diff.sleepDifference,-1);
assert.equal(compareAnalytics(fixture(null,0,0,null,null,0),prev).habitPercentagePoints,null);
assert.equal(compareAnalytics(fixture(null,0,0,null,null,0),prev).energyDifference,null);
const payload=reviewPayload(curr,prev,"week");
assert.ok(isUsefulReview(payload));
assert.equal(isUsefulReview(reviewPayload(fixture(null,0,0,null,null,0),prev,"month")),false);
const prompt=reviewPrompt(payload);
assert.ok(prompt.includes("90"));
assert.ok(!prompt.includes("identificadores de usuario:"));
assert.ok(!prompt.includes("study_notes"));
assert.ok(!prompt.includes("user_id"));
assert.ok(prompt.length<2500);
console.log("PASS: 6B comparable windows, null denominators, 6C aggregate-only review prompt.");

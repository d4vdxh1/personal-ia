import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import ts from "typescript";

const {outputText}=ts.transpileModule(readFileSync("src/app/api/analytics/review/route.ts","utf8"),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
});
const report={habits:{scheduled:3,completed:2,percentage:67},study:{minutes:60},
 training:{completed:1,scheduled:2},checkin:{days:1,averageEnergy:4,averageSleep:7}};
let quotaAllowed=true,modelCalls=0,reservations=0,dataOk=true;
let key="ci-only";
const client={rpc:async (name)=>{
 assert.equal(name,"reserve_ai_request");
 reservations++;
 return {error:null,data:{allowed:quotaAllowed,remaining:12}};
}};
const modules={
 "@/lib/assistant/request":{
  readAssistantRequest:async req=>req.forbidden?new Response("origin denied",{status:403}):
    ({client,userId:"test-user",body:req.body}),
  send:(value,status=200)=>Response.json(value,{status}),
 },
 "@/lib/assistant/provider":{
  GeminiProvider:class {
   async generate(messages,allowTools){
    modelCalls++;assert.equal(allowTools,false,"review must forbid model tools");
    assert.equal(messages.length,1);assert.ok(messages[0].parts[0].text.includes("agregados"));
    return {text:"Revisión orientativa de datos agregados.",calls:[],parts:[]};
   }
  },
  ProviderError:class ProviderError extends Error{},
 },
 "@/lib/analytics/data":{loadAnalytics:async ()=>({data:dataOk?{}:null,error:!dataOk})},
 "@/lib/analytics/summary":{
  lastNDates:()=>Array.from({length:14},(_,i)=>String(i)),
  paraguayDate:()=>"2026-11-08",
  buildAnalytics:()=>report,
 },
 "@/lib/analytics/comparison":{
  periodDays:()=>7,
  resolvePeriod:()=> "week",
  reviewPayload:()=>({period:"week",current:{habitScheduled:3,studyMinutes:60,trainingCompleted:1,checkinDays:1}}),
  reviewPrompt:()=> "Solo agregados para analizar.",
  isUsefulReview:()=>true,
 },
};
const exports={};
runInNewContext(outputText,{
 exports,Response,process:{env:{GEMINI_API_KEY:key}},
 require:(name)=>{assert.ok(name in modules,name);return modules[name];},
});
const {POST}=exports;
async function status(body,forbidden=false){return (await POST({body,forbidden})).status;}
assert.equal(await status({period:"week",consent:false}),400);
assert.equal(await status({period:"invalid",consent:true}),400);
assert.equal(await status({period:"month",consent:true,other:"not allowed"}),400);
assert.equal(await status({period:"week",consent:true},true),403);
assert.equal(reservations,0,"invalid requests cannot consume quota");
assert.equal(modelCalls,0,"invalid requests cannot call provider");
quotaAllowed=false;
assert.equal(await status({period:"week",consent:true}),429);
assert.equal(modelCalls,0);
quotaAllowed=true;dataOk=false;
assert.equal(await status({period:"week",consent:true}),503);
assert.equal(modelCalls,0);
dataOk=true;
assert.equal(await status({period:"week",consent:true}),200);
assert.equal(modelCalls,1);
console.log("PASS: 6C explicit consent, same-origin, allowed periods, quota, no tools and safe failure.");

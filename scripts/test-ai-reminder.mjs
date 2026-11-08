import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
function load(path,deps={}){
 const compiled=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 const exports={};
 runInNewContext(compiled.outputText,{exports,FormData,AbortController,setTimeout,clearTimeout,
   require(name){assert.ok(name in deps,name);return deps[name];}});
 return exports;
}
const proposal=load("src/lib/assistant/reminder-proposal.ts");
const valid={title:"Repasar Cálculo",time:"19:00",date:"2026-11-12",frequency:"once"};
assert.equal(proposal.parseReminderValues(valid).time,"19:00");
assert.equal(proposal.parseReminderValues({title:"Leer",time:"08:00",frequency:"weekly",weekdays:[1,3]}).weekdays.join(","),"1,3");
for(const invalid of [null,[],{}, {...valid,user_id:"ajeno"},{...valid,date:"2026-02-30"},
 {...valid,time:"25:00"},{...valid,time:"19:60"},{...valid,frequency:"hourly"},
 {title:"Leer",time:"19:00",frequency:"once"}, {title:"Leer",time:"19:00",frequency:"weekly",weekdays:[]},
 {title:"Leer",time:"19:00",frequency:"weekly",weekdays:[1,1]}, {...valid,notes:"privado"}]){
 assert.equal(proposal.parseReminderValues(invalid),null,JSON.stringify(invalid));
}
assert.equal(proposal.isReminderProposal({
 kind:"reminder",id:"11111111-1111-4111-8111-111111111111",
 title:"Estudiar",time:"19:00",date:"2026-11-12",frequency:"once",weekdays:[],until_on:null,timezone:"America/Asuncion",
}),true);
const {GeminiProvider}=load("src/lib/assistant/provider.ts",{
 "server-only":{},"./checkin-proposal":{parseCheckinValues:()=>null},
 "./study-proposal":{parseStudyValues:()=>null},
 "./reminder-proposal":proposal,
 "./tools":{READ_TOOLS:[],isReadToolName:()=>false},
});
const turn=args=>new GeminiProvider("test",async (_url,request)=>{
 const body=JSON.parse(request.body);
 assert.ok(body.tools[0].functionDeclarations.some(x=>x.name==="propose_reminder"));
 return Response.json({candidates:[{content:{parts:[{functionCall:{name:"propose_reminder",args}}]}}]});
}).generate([{role:"user",parts:[{text:"recordatorio"}]}],true);
const result=await turn(valid);
assert.equal(result.calls[0].name,"propose_reminder");
await assert.rejects(turn({...valid,user_id:"foráneo"}));
await assert.rejects(turn({...valid,date:"inválido"}));
console.log("PASS: propuestas Gemini de recordatorios estrictas y sin campos externos.");

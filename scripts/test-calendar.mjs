import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const nodeRequire=createRequire(import.meta.url);
function load(path){
 const src=readFileSync(path,"utf8");
 const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 const exports={};
 runInNewContext(compiled.outputText,{exports,Buffer,Date,require:nodeRequire});
 return exports;
}
const {encryptCalendarToken,decryptCalendarToken}=load("src/lib/calendar/crypto.ts");
const key=Buffer.alloc(32,77).toString("base64"),other=Buffer.alloc(32,66).toString("base64");
const owner="11111111-1111-4111-8111-111111111111",foreign="22222222-2222-4222-8222-222222222222";
const token="1//fake-secret-refresh-token";
const cipher=encryptCalendarToken(token,owner,key);
assert.ok(cipher.startsWith("v1."));assert.ok(!cipher.includes(token));
assert.equal(decryptCalendarToken(cipher,owner,key),token);
assert.notEqual(encryptCalendarToken(token,owner,key),cipher,"random IV per token");
assert.throws(()=>decryptCalendarToken(cipher,foreign,key));
assert.throws(()=>decryptCalendarToken(cipher,owner,other));
const parts=cipher.split(".");parts[2]=(parts[2][0]==="A"?"B":"A")+parts[2].slice(1);
assert.throws(()=>decryptCalendarToken(parts.join("."),owner,key));
assert.throws(()=>encryptCalendarToken(token,owner,"short"));
const {normalizeCalendarEvents}=load("src/lib/calendar/events.ts");
assert.equal(normalizeCalendarEvents(null).length,0);
const list=normalizeCalendarEvents({items:[
 {id:"1",summary:"Parcial",start:{dateTime:"2026-11-11T19:00:00-03:00"},end:{dateTime:"2026-11-11T20:00:00-03:00"},htmlLink:"https://evil.example/click"},
 {id:"2",start:{date:"2026-11-12"},end:{date:"2026-11-13"}},
 {id:"3",start:{date:"not-a-date"},end:{date:"2026-11-13"}},
]});
assert.equal(list.length,2);assert.equal(list[0].title,"Parcial");
assert.equal(list[0].url,undefined);assert.equal(list[1].allDay,true);
console.log("PASS: Calendar AES-GCM owner/tamper/key isolation and untrusted event sanitization.");

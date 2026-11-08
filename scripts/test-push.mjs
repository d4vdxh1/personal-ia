import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const source=readFileSync("src/lib/push/validation.ts","utf8");
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const exports={};
runInNewContext(outputText,{exports,URL});
const {parsePushSubscription,parsePushEndpoint}=exports;
const valid={endpoint:"https://fcm.googleapis.com/fcm/send/abcdef123456",
 keys:{p256dh:"A".repeat(87),auth:"b".repeat(22)}};
assert.equal(parsePushSubscription(valid).endpoint,valid.endpoint);
assert.equal(parsePushEndpoint({endpoint:valid.endpoint}),valid.endpoint);
for(const endpoint of [
  "https://127.0.0.1/private","http://fcm.googleapis.com/fcm/send/x",
  "https://fcm.googleapis.com.evil.invalid/fcm/send/x",
  "https://example.com/secret","https://fcm.googleapis.com:444/fcm/send/x",
  "https://user:pw@fcm.googleapis.com/fcm/send/x",
  "https://fcm.googleapis.com/fcm/send/x#fragment",
  "https://fcm.googleapis.com/"]) {
  assert.equal(parsePushSubscription({...valid,endpoint}),null,endpoint);
}
for(const bad of [null,{},[],{...valid,keys:{}},
  {...valid,keys:{p256dh:"bad",auth:"bad"}},
  {...valid,extra:"unsafe"},{...valid,keys:{...valid.keys,extra:"unsafe"}}]) {
  assert.equal(parsePushSubscription(bad),null,JSON.stringify(bad));
}
assert.equal(parsePushEndpoint({...valid}),null);
const sw=readFileSync("public/sw.js","utf8");
assert.match(sw,/notificationclick/);
assert.match(sw,/showNotification/);
assert.match(sw,/\/reminders/);
const worker=readFileSync("supabase/functions/push-dispatch/index.ts","utf8");
assert.match(worker,/sameSecret/);
assert.match(worker,/claim_push_deliveries/);
assert.match(worker,/finish_push_delivery/);
console.log("PASS: endpoints Web Push permitidos, sin SSRF, schema estricta y worker/SW presentes.");

import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {createHash} from "node:crypto";
import ts from "typescript";
const id="33333333-3333-4333-8333-333333333333";
const user="11111111-1111-4111-8111-111111111111";
const validId=s=>typeof s==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
function load(path,deps={}){
 const outputText=ts.transpileModule(readFileSync(path,"utf8"),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
 }).outputText;
 const exports={};
 runInNewContext(outputText,{exports,Date,Buffer,URLSearchParams,FormData,Response,AbortSignal,console,
  process:{env:{GOOGLE_CALENDAR_WRITE_ENABLED:"true"}},
  require(name){assert.ok(name in deps,"Unknown "+name);return deps[name];}});
 return exports;
}
const exp=load("src/lib/calendar/export.ts",{
 "node:crypto":{createHash},
 "@/lib/study/validation":{isId:validId},
});
const eventId=exp.calendarReminderEventId(user,id);
const reminder={id,title:"Control Google",scheduled_at:"2026-11-14T18:00:00.000Z",status:"pending",series_id:null};
const connection={calendar_id:"primary",can_write:true,refresh_token_encrypted:"encrypted"};
let stored=null,scenario="created",calls=[],writeCount=0;
function db(table){
 return {
  select(){return this;},eq(){return this;},is(){return this;},
  async maybeSingle(){
   return {data:table==="reminders"?reminder:table==="google_calendar_connections"?connection:
    table==="google_calendar_event_links"?stored:null,error:null};
  },
  upsert(row){stored={google_event_id:row.google_event_id};writeCount++;return this;},
 };
}
const client={auth:{getUser:async()=>({data:{user:{id:user}},error:null})},from:db};
const redirect=(url)=>{throw Object.assign(new Error("redirect"),{url});};
const {exportReminderToGoogle}=load("src/app/reminders/calendar-actions.ts",{
 "next/cache":{revalidatePath:()=>{}},
 "next/navigation":{redirect},
 "@/lib/supabase/server":{createClient:async()=>client},
 "@/lib/calendar/config":{calendarConfig:()=>({
   clientId:"test",clientSecret:"test",tokenKey:"test",redirectUri:"https://example.invalid/api/calendar/callback"
  }),CALENDAR_EVENTS_SCOPE:"https://www.googleapis.com/auth/calendar.events"},
 "@/lib/calendar/crypto":{decryptCalendarToken:()=>"refresh-token"},
 "@/lib/calendar/export":exp,
 "@/lib/study/validation":{isId:validId},
});
async function run(){
 calls=[];
 const form=new FormData();form.set("reminder_id",id);
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async (url,options={})=>{
  const target=String(url);calls.push({target,method:options.method??"GET"});
  if(target==="https://oauth2.googleapis.com/token")
   return Response.json({access_token:"short-lived-token",scope:"https://www.googleapis.com/auth/calendar.events"});
  const event=exp.reminderToCalendarEvent(reminder,eventId);
  if(options.method==="POST" && target.includes("/calendar/v3/")){
   assert.equal(JSON.parse(options.body).id,eventId);
   if(scenario==="created")return Response.json(event,{status:201});
   if(scenario==="conflict"||scenario==="mismatch")return new Response("",{status:409});
  }
  if(target.endsWith("/"+eventId)){
   if(scenario==="conflict")return Response.json(event);
   return Response.json({...event,extendedProperties:{private:{diaADiaReminderId:"other"}}});
  }
  throw Error("Unexpected URL "+target);
 };
 try { await exportReminderToGoogle(form);throw Error("No redirect"); }
 catch(e){assert.equal(typeof e.url,"string");return e.url;}
 finally {globalThis.fetch=oldFetch;}
}
assert.equal(await run(),"/reminders?calendar=exported");
assert.equal(writeCount,1);
assert.equal(await run(),"/reminders?calendar=already");
assert.equal(writeCount,1);
stored=null;scenario="conflict";
assert.equal(await run(),"/reminders?calendar=exported");
assert.ok(calls.some(c=>c.method==="GET"&&c.target.endsWith("/"+eventId)));
stored=null;scenario="mismatch";
assert.equal(await run(),"/reminders?calendar=unavailable");
assert.equal(writeCount,2);
connection.can_write=false;
assert.equal(await run(),"/reminders?calendar=unauthorized");
assert.equal(calls.length,0);
console.log("PASS: export action with mock Google 201, 409 verification, replay, mismatch and missing write scope.");

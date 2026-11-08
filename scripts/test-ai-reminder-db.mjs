import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createTestDatabase,asUser,alice,bob} from "./test-db.mjs";
const db=await createTestDatabase();
const q=async(sql,args=[]) => (await db.query(sql,args)).rows;
try {
 await db.exec("create role service_role nologin; create schema vault; create table vault.decrypted_secrets(name text,decrypted_secret text);");
 for(const path of [
  "20261108023553_ai_habit_actions.sql",
  "20261108035009_reminders.sql",
  "20261108043426_push_notifications.sql",
  "20261108184507_reminder_recurrences.sql",
  "20261108193000_ai_reminder_actions.sql"
 ])await db.exec(await readFile("supabase/migrations/"+path,"utf8"));
 await q("insert into auth.users(id) values($1),($2)",[alice,bob]);
 const tomorrow=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Asuncion",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(Date.now()+3*86400000));
 const once={title:"Repasar examen",date:tomorrow,time:"19:00",frequency:"once"};
 const propose=async(values,user=alice)=>(await asUser(db,user,()=>q("select public.propose_ai_reminder($1::jsonb) r",[JSON.stringify(values)])))[0].r;
 const decide=async(id,choice="confirm",user=alice)=>(await asUser(db,user,()=>q("select public.decide_ai_reminder($1,$2) r",[id,choice])))[0].r;
 assert.equal((await q("select relrowsecurity from pg_class where oid='assistant_private.reminder_actions'::regclass"))[0].relrowsecurity,true);
 for(const name of ["propose_ai_reminder(jsonb)","decide_ai_reminder(uuid,text)"])assert.equal((await q("select has_function_privilege('anon',$1,'EXECUTE') p",["public."+name]))[0].p,false);
 assert.equal((await propose({...once,user_id:bob})).status,"invalid");
 assert.equal((await propose({...once,time:"25:00"})).status,"invalid");
 const first=await propose(once);assert.equal(first.status,"pending");
 assert.equal((await q("select count(*)::int n from public.reminders"))[0].n,0);
 assert.equal((await decide(first.id,"confirm",bob)).status,"not_found");
 assert.equal((await decide(first.id,"cancel")).status,"cancelled");
 assert.equal((await decide(first.id)).status,"consumed");
 assert.equal((await q("select count(*)::int n from public.reminders"))[0].n,0);
 const second=await propose(once);
 assert.equal((await decide(second.id)).status,"confirmed");
 assert.equal((await decide(second.id)).status,"consumed");
 assert.equal((await q("select count(*)::int n from public.reminders where user_id=$1 and title='Repasar examen'",[alice]))[0].n,1);
 const audit=(await q("select proposed_values,result from assistant_private.reminder_actions where id=$1",[second.id]))[0];
 assert.equal(audit.proposed_values,null);assert.equal(audit.result,"confirmed");
 const weekly=await propose({title:"Lectura",time:"19:00",frequency:"weekly",weekdays:[1,3]});
 assert.equal(weekly.status,"pending");
 assert.equal((await decide(weekly.id)).status,"confirmed");
 const series=(await q("select * from public.reminder_series where user_id=$1 and title='Lectura'",[alice]))[0];
 assert.deepEqual(series.weekdays,[1,3]);
 assert.deepEqual(await asUser(db,bob,()=>q("select * from assistant_private.reminder_actions")),[]);
 const expired=await propose(once);
 await q("update assistant_private.reminder_actions set created_at=clock_timestamp()-interval '11 minutes' where id=$1",[expired.id]);
 assert.equal((await decide(expired.id)).status,"expired");
 const replay=(await q("select count(*)::int n from public.reminders where user_id=$1",[alice]))[0].n;
 assert.equal(replay,1);
 console.log("PASS: Gemini reminders proposal/confirmation, weekly series, RLS, audit, expiry, replay, cancel.");
} finally {await db.close();}

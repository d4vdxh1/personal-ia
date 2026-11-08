import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";
const db=await createTestDatabase(false);
const q=async(sql,args=[]) => (await db.query(sql,args)).rows;
try {
 await db.exec("create role service_role nologin;create schema vault;create table vault.decrypted_secrets(name text,decrypted_secret text);");
 for(const name of ["20261108035009_reminders.sql","20261108043426_push_notifications.sql","20261108184507_reminder_recurrences.sql"])
   await db.exec(await readFile("supabase/migrations/"+name,"utf8"));
 await q("insert into auth.users(id) values ($1),($2)",[alice,bob]);
 for(const tbl of ["public.reminder_series","public.reminders"])
   assert.equal((await q("select relrowsecurity from pg_class where oid=$1::regclass",[tbl]))[0].relrowsecurity,true);
 for(const proc of ["materialize_recurring_reminders(integer)","claim_push_deliveries(integer)"])
   for(const role of ["anon","authenticated"])
    assert.equal((await q("select has_function_privilege($1,$2,'execute') as allowed",[role,"public."+proc]))[0].allowed,false);
 const offset=new Date(Date.now()+15*60*1000);
 const date=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Asuncion",year:"numeric",month:"2-digit",day:"2-digit"}).format(offset);
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"America/Asuncion",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(offset);
 const ts=parts+":00";
 const series=(await asUser(db,alice,()=>q(
  "insert into public.reminder_series(title,frequency,local_time,timezone,starts_on) values($1,'daily',$2,'America/Asuncion',$3) returning id",
  ["Prueba diaria",ts,date])))[0].id;
 assert.equal((await asUser(db,bob,()=>q("select id from public.reminder_series"))).length,0);
 assert.equal((await asUser(db,bob,()=>q("update public.reminder_series set active=false where id=$1 returning id",[series]))).length,0);
 await assert.rejects(asUser(db,bob,()=>q("insert into public.reminder_series(user_id,title,frequency,local_time,starts_on) values($1,'Ajena','daily','12:00',$2)",[alice,date])));
 await assert.rejects(asUser(db,alice,()=>q("select public.materialize_recurring_reminders(14)")));
 const r=(await q("select public.materialize_recurring_reminders(14) n"))[0].n;
 assert.ok(r>=13 && r<=15,"materialize horizon: "+r);
 assert.equal((await q("select public.materialize_recurring_reminders(14) n"))[0].n,0,"idempotent rerun");
 const first=(await q("select id,occurrence_date,status from public.reminders where series_id=$1 order by occurrence_date limit 1",[series]))[0];
 assert.equal(first.status,"pending");
 await asUser(db,alice,()=>q("update public.reminder_series set active=false where id=$1",[series]));
 const cancelled=(await q("select count(*)::int n from public.reminders where series_id=$1 and status='cancelled'",[series]))[0].n;
 assert.ok(cancelled>0);
 assert.equal((await q("select public.materialize_recurring_reminders(14) n"))[0].n,0);
 await asUser(db,alice,()=>q("update public.reminder_series set active=true where id=$1",[series]));
 assert.ok((await q("select public.materialize_recurring_reminders(14) n"))[0].n>0);
 const userCancel=(await q("select id from public.reminders where series_id=$1 and scheduled_at>clock_timestamp() order by scheduled_at limit 1",[series]))[0].id;
 await asUser(db,alice,()=>q("update public.reminders set status='cancelled' where id=$1",[userCancel]));
 await q("select public.materialize_recurring_reminders(14)");
 assert.equal((await q("select status from public.reminders where id=$1",[userCancel]))[0].status,"cancelled","manual cancel must not resurrect");
 // Monthly days 31 must not roll over into the next month without that day.
 await asUser(db,alice,()=>q("insert into public.reminder_series(title,frequency,local_time,starts_on,month_day,until_on) values('Mensual','monthly','20:00',$1,31,$2)",[date,"2028-12-31"]));
 await q("select public.materialize_recurring_reminders(31)");
 const monthly=await q("select occurrence_date from public.reminders where title='Mensual'");
 assert.ok(monthly.every(x=>Number(String(x.occurrence_date).slice(8,10))===31));
 const count=(await q("select count(*)::int n from public.reminders where series_id=$1",[series]))[0].n;
 assert.ok(count<=32,"no duplicate occurrences across expanded 31-day horizon");
 const unique=(await q("select count(distinct occurrence_date)::int n from public.reminders where series_id=$1",[series]))[0].n;
 assert.equal(count,unique,"one row per local occurrence date");
 console.log("PASS: RLS, service-only materialization, unique occurrences, pause/resume, manual cancellation, monthly skip.");
}finally{await db.close();}

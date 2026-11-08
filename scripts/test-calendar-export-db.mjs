import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createTestDatabase,asUser,alice,bob} from "./test-db.mjs";
const db=await createTestDatabase(false);
const q=async(s,p=[]) => (await db.query(s,p)).rows;
try{
 for(const file of ["20261108035009_reminders.sql",
  "20261108185959_google_calendar_connections.sql",
  "20261108194807_calendar_event_export.sql"])
   await db.exec(await readFile("supabase/migrations/"+file,"utf8"));
 await q("insert into auth.users(id) values ($1),($2)",[alice,bob]);
 assert.equal((await q("select relrowsecurity from pg_class where oid='public.google_calendar_event_links'::regclass"))[0].relrowsecurity,true);
 assert.equal((await q("select has_table_privilege('anon','public.google_calendar_event_links','SELECT') ok"))[0].ok,false);
 assert.equal((await q("select has_table_privilege('authenticated','public.google_calendar_event_links','UPDATE') ok"))[0].ok,false);
 const reminder=(await asUser(db,alice,()=>q("insert into public.reminders(title,scheduled_at) values($1,$2) returning id",["Parcial","2026-11-15T19:00:00Z"])))[0].id;
 const other=(await asUser(db,bob,()=>q("insert into public.reminders(title,scheduled_at) values($1,$2) returning id",["Otro","2026-11-15T19:00:00Z"])))[0].id;
 const gid="d"+("a".repeat(31));
 await asUser(db,alice,()=>q("insert into public.google_calendar_event_links(reminder_id,google_event_id) values($1,$2)",[reminder,gid]));
 assert.equal((await asUser(db,alice,()=>q("select count(*)::int n from public.google_calendar_event_links")))[0].n,1);
 assert.equal((await asUser(db,bob,()=>q("select count(*)::int n from public.google_calendar_event_links")))[0].n,0);
 await assert.rejects(asUser(db,bob,()=>q("insert into public.google_calendar_event_links(reminder_id,google_event_id) values($1,$2)",[reminder,"d"+("b".repeat(31))])));
 await assert.rejects(asUser(db,alice,()=>q("insert into public.google_calendar_event_links(reminder_id,google_event_id) values($1,$2)",[other,"d"+("c".repeat(31))])));
 await assert.rejects(asUser(db,alice,()=>q("insert into public.google_calendar_event_links(reminder_id,google_event_id) values($1,$2)",[reminder,gid])));
 assert.equal((await q("select can_write from public.google_calendar_connections limit 1")).length,0);
 await asUser(db,alice,()=>q("insert into public.google_calendar_connections(refresh_token_encrypted) values($1)",["v1."+("x".repeat(80))]));
 assert.equal((await asUser(db,alice,()=>q("select can_write from public.google_calendar_connections")))[0].can_write,false);
 console.log("PASS: Calendar export RLS, propietario, anon, idempotencia local y permisos de OAuth.");
}finally{await db.close();}

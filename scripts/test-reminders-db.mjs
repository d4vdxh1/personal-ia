import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";
const db=await createTestDatabase(false);
const query=async (sql,args=[]) => (await db.query(sql,args)).rows;
try{
  await db.exec(await readFile("supabase/migrations/20261108050000_reminders.sql","utf8"));
  await query("insert into auth.users(id) values($1),($2)",[alice,bob]);
  assert.equal((await query("select relrowsecurity from pg_class where oid='public.reminders'::regclass"))[0].relrowsecurity,true);
  assert.equal((await query("select has_table_privilege('anon','public.reminders','select') allowed"))[0].allowed,false);
  const date="2026-11-13T15:00:00.000Z";
  const created=await asUser(db,alice,()=>query(
    "insert into public.reminders(title,scheduled_at) values($1,$2) returning id,user_id,status",["Leer",date]));
  assert.equal(created[0].user_id,alice);
  assert.equal(created[0].status,"pending");
  const id=created[0].id;
  assert.equal((await asUser(db,bob,()=>query("select id from public.reminders"))).length,0);
  assert.equal((await asUser(db,bob,()=>query("update public.reminders set status='cancelled' where id=$1 returning id",[id]))).length,0);
  await assert.rejects(asUser(db,bob,()=>query("insert into public.reminders(user_id,title,scheduled_at) values($1,$2,$3)",[alice,"Ajeno",date])));
  const updated=await asUser(db,alice,()=>query("update public.reminders set status='completed' where id=$1 returning status",[id]));
  assert.equal(updated[0].status,"completed");
  await assert.rejects(asUser(db,alice,()=>query("insert into public.reminders(title,scheduled_at) values($1,$2)",[" ",date])));
  await assert.rejects(asUser(db,alice,()=>query("insert into public.reminders(title,notes,scheduled_at) values($1,$2,$3)",["Leer","a".repeat(1001),date])));
  assert.equal((await asUser(db,bob,()=>query("delete from public.reminders where id=$1 returning id",[id]))).length,0);
  assert.equal((await asUser(db,alice,()=>query("delete from public.reminders where id=$1 returning id",[id]))).length,1);
  console.log("PASS: recordatorios SQL, RLS, aislamiento entre usuarios, rangos y CRUD.");
}finally{await db.close();}

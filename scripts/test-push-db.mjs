import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";
const db=await createTestDatabase(false);
const q=async(sql,args=[]) => (await db.query(sql,args)).rows;
const claim=async()=>q("select public.claim_push_deliveries(25) as data");
const finish=async(id,token,outcome)=>q("select public.finish_push_delivery($1,$2,$3) as done",[id,token,outcome]);
const url=i=>"https://fcm.googleapis.com/fcm/send/test-"+i;
const keys="A".repeat(87),authKey="b".repeat(22);
try {
  await db.exec("create role service_role nologin;");
  await db.exec(await readFile("supabase/migrations/20261108035009_reminders.sql","utf8"));
  await db.exec(await readFile("supabase/migrations/20261108043000_push_notifications.sql","utf8"));
  await q("insert into auth.users(id) values($1),($2)",[alice,bob]);
  assert.equal((await q("select relrowsecurity from pg_class where oid='public.push_subscriptions'::regclass"))[0].relrowsecurity,true);
  assert.equal((await q("select relrowsecurity from pg_class where oid='push_private.deliveries'::regclass"))[0].relrowsecurity,true);
  for(const fn of ["claim_push_deliveries(integer)","finish_push_delivery(uuid,uuid,text)"]){
    assert.equal((await q("select has_function_privilege('anon',$1,'execute') ok",["public."+fn]))[0].ok,false);
    assert.equal((await q("select has_function_privilege('authenticated',$1,'execute') ok",["public."+fn]))[0].ok,false);
    assert.equal((await q("select has_function_privilege('service_role',$1,'execute') ok",["public."+fn]))[0].ok,true);
  }
  await assert.rejects(asUser(db,alice,()=>claim()));
  const sub=async(i,user=alice)=>asUser(db,user,()=>q(
    "insert into public.push_subscriptions(endpoint,p256dh,auth_key) values($1,$2,$3) returning id",[url(i),keys,authKey]));
  const s1=(await sub(1))[0].id;
  assert.equal((await asUser(db,bob,()=>q("select * from public.push_subscriptions"))).length,0);
  assert.equal((await asUser(db,bob,()=>q("delete from public.push_subscriptions where id=$1 returning id",[s1]))).length,0);
  await assert.rejects(sub("https://127.0.0.1"));
  await sub(2);await sub(3);await sub(4);await sub(5);
  await assert.rejects(sub(6),/maximum 5 active subscriptions/);
  const reminder=(await asUser(db,alice,()=>q(
    "insert into public.reminders(title,scheduled_at) values('Parcial',clock_timestamp()-interval '1 minute') returning id")))[0].id;
  const pending=await claim();assert.equal(pending[0].data.length,5);
  const same=await claim();assert.equal(same[0].data.length,0);
  const target=pending[0].data.find(x=>x.endpoint===url(1));
  assert.equal((await finish(target.id,"00000000-0000-4000-8000-000000000000","sent"))[0].done,false);
  assert.equal((await finish(target.id,target.lease_token,"sent"))[0].done,true);
  assert.equal((await finish(target.id,target.lease_token,"sent"))[0].done,false);
  const disabled=pending[0].data.find(x=>x.endpoint===url(2));
  assert.equal((await finish(disabled.id,disabled.lease_token,"gone"))[0].done,true);
  assert.equal((await q("select active from public.push_subscriptions where endpoint=$1",[url(2)]))[0].active,false);
  const retry=pending[0].data.find(x=>x.endpoint===url(3));
  assert.equal((await finish(retry.id,retry.lease_token,"retry"))[0].done,true);
  await q("update push_private.deliveries set next_attempt_at=clock_timestamp()-interval '1 minute' where id=$1",[retry.id]);
  const next=await claim();assert.equal(next[0].data.length,1);
  assert.equal(next[0].data[0].id,retry.id);
  assert.equal((await q("select count(*)::int n from push_private.deliveries where reminder_id=$1",[reminder]))[0].n,5);
  await asUser(db,alice,()=>q("update public.reminders set status='cancelled' where id=$1",[reminder]));
  assert.equal((await claim())[0].data.length,0);
  assert.equal((await asUser(db,bob,()=>q("select count(*)::int n from public.push_subscriptions")))[0].n,0);
  console.log("PASS: RLS, 5 dispositivos, no SSRF, cola única, sin duplicar, leases, expiración, cancelación, gone y retry.");
} finally { await db.close(); }

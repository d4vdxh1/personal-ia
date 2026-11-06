import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";

const db = await createTestDatabase();
try {
  await db.exec(await readFile("supabase/migrations/20261106150000_ai_usage.sql", "utf8"));
  await db.query("insert into auth.users(id) values($1),($2)",[alice,bob]);
  for (const table of ["ai_daily_usage"]) {
    const result = (await db.query("select relrowsecurity from pg_class where oid=$1::regclass",["public."+table])).rows[0];
    assert.equal(result.relrowsecurity, true);
    for (const privilege of ["select","insert","update","delete"]) {
      assert.equal((await db.query("select has_table_privilege('anon',$1,$2) ok",["public."+table,privilege])).rows[0].ok,false);
      assert.equal((await db.query("select has_table_privilege('authenticated',$1,$2) ok",["public."+table,privilege])).rows[0].ok,false);
    }
  }
  assert.equal((await db.query("select has_function_privilege('anon','public.reserve_ai_request()','execute') ok")).rows[0].ok, false);
  assert.equal((await db.query("select has_function_privilege('authenticated','public.reserve_ai_request()','execute') ok")).rows[0].ok, true);
  const first=(await asUser(db,alice,() => db.query("select public.reserve_ai_request() result"))).rows[0].result;
  assert.equal(first.allowed,true); assert.equal(first.remaining,19);
  const tooSoon=(await asUser(db,alice,() => db.query("select public.reserve_ai_request() result"))).rows[0].result;
  assert.equal(tooSoon.allowed,false,"requests too close must be rejected");
  // Existing per-user budget cannot be read or mutated through Data API roles.
  await assert.rejects(asUser(db,bob,() => db.query("select * from public.ai_daily_usage")));
  for(let i=2;i<=20;i++){
    await db.exec("update public.ai_daily_usage set last_request_at=now()-interval '10 seconds' where user_id='"+alice+"'");
    const result=(await asUser(db,alice,() => db.query("select public.reserve_ai_request() result"))).rows[0].result;
    assert.equal(result.allowed,true, "request "+i);
    assert.equal(result.remaining,20-i);
  }
  await db.exec("update public.ai_daily_usage set last_request_at=now()-interval '10 seconds' where user_id='"+alice+"'");
  const exhausted=(await asUser(db,alice,()=> db.query("select public.reserve_ai_request() result"))).rows[0].result;
  assert.equal(exhausted.allowed,false);
  const independent=(await asUser(db,bob,()=> db.query("select public.reserve_ai_request() result"))).rows[0].result;
  assert.equal(independent.allowed,true);
  assert.equal((await db.query("select count(*)::int n from public.ai_daily_usage")).rows[0].n,2);
  console.log("PASS: per-user 20/day Gemini budget, cooldown, restricted RPC and RLS.");
} finally { await db.close(); }

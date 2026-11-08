import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {createTestDatabase,asUser,alice,bob} from "./test-db.mjs";
const db=await createTestDatabase(false);
const q=async(sql,params=[]) => (await db.query(sql,params)).rows;
try{
 await db.exec(await readFile("supabase/migrations/20261108192000_google_calendar_connections.sql","utf8"));
 await q("insert into auth.users(id) values($1),($2)",[alice,bob]);
 assert.equal((await q("select relrowsecurity from pg_class where oid='public.google_calendar_connections'::regclass"))[0].relrowsecurity,true);
 assert.equal((await q("select has_table_privilege('anon','public.google_calendar_connections','select') allowed"))[0].allowed,false);
 await asUser(db,alice,()=>q("insert into public.google_calendar_connections(refresh_token_encrypted) values($1)",["v1."+("x".repeat(56))]));
 assert.equal((await asUser(db,bob,()=>q("select user_id from public.google_calendar_connections"))).length,0);
 assert.equal((await asUser(db,bob,()=>q("delete from public.google_calendar_connections where user_id=$1 returning user_id",[alice]))).length,0);
 await assert.rejects(asUser(db,bob,()=>q("insert into public.google_calendar_connections(user_id,refresh_token_encrypted) values($1,$2)",[alice,"v1."+("z".repeat(56))])));
 assert.equal((await asUser(db,alice,()=>q("delete from public.google_calendar_connections returning user_id"))).length,1);
 console.log("PASS: Calendar OAuth connection RLS, anon denial, owner deletion, cross-account isolation.");
}finally{await db.close();}

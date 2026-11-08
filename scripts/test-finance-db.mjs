import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createTestDatabase,asUser,alice,bob} from "./test-db.mjs";
const db=await createTestDatabase(false);
const query=async (sql,params=[]) => (await db.query(sql,params)).rows;
try{
 await db.exec(await readFile("supabase/migrations/20261108220510_finance_transactions.sql","utf8"));
 await query("insert into auth.users(id) values ($1),($2)",[alice,bob]);
 assert.equal((await query("select relrowsecurity from pg_class where oid='public.finance_transactions'::regclass"))[0].relrowsecurity,true);
 for(const operation of ["select","insert","update","delete"]){
  assert.equal((await query("select has_table_privilege('anon','public.finance_transactions',$1) AS allowed",[operation]))[0].allowed,false);
 }
 assert.equal((await query("select has_table_privilege('authenticated','public.finance_transactions','update') AS allowed"))[0].allowed,false);
 const a=await asUser(db,alice,()=>query(
  "insert into public.finance_transactions(direction,category,amount_pyg,occurred_on,note) values('expense','alimentacion',45000,'2026-11-08','almuerzo') returning id,user_id"));
 const id=a[0].id;assert.equal(a[0].user_id,alice);
 assert.equal((await asUser(db,bob,()=>query("select id from public.finance_transactions"))).length,0);
 assert.equal((await asUser(db,bob,()=>query("delete from public.finance_transactions where id=$1 returning id",[id]))).length,0);
 await assert.rejects(asUser(db,bob,()=>query(
  "insert into public.finance_transactions(user_id,direction,category,amount_pyg,occurred_on) values($1,'income','salario',10,'2026-11-08')",[alice])));
 await assert.rejects(asUser(db,alice,()=>query(
  "insert into public.finance_transactions(direction,category,amount_pyg,occurred_on) values('expense','salario',100,'2026-11-08')")));
 await assert.rejects(asUser(db,alice,()=>query(
  "insert into public.finance_transactions(direction,category,amount_pyg,occurred_on) values('income','salario',0,'2026-11-08')")));
 await assert.rejects(asUser(db,alice,()=>query(
  "insert into public.finance_transactions(direction,category,amount_pyg,occurred_on) values('expense','ocio',1000000000001,'2026-11-08')")));
 await assert.rejects(asUser(db,alice,()=>query(
  "insert into public.finance_transactions(direction,category,amount_pyg,occurred_on,note) values('expense','ocio',100,'2026-11-08',$1)",["a".repeat(301)])));
 assert.equal((await asUser(db,alice,()=>query("delete from public.finance_transactions where id=$1 returning id",[id]))).length,1);
 console.log("PASS: Fase 8A SQL, aislamiento con dos usuarios, RLS, sin UPDATE/anon y límites.");
}finally{await db.close();}

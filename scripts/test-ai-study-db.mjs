import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";

const db = await createTestDatabase();
const ledger = "assistant_private.study_actions";
const query = async (sql, args = []) => (await db.query(sql, args)).rows;
const propose = async (subject = "Matemática", topic = "Matrices", minutes = 45, user = alice) =>
  (await asUser(db, user, () => query(
    "select public.propose_study_session($1,$2,$3) r", [subject, topic, minutes])))[0].r;
const decide = async (id, choice = "confirm", user = alice) =>
  (await asUser(db, user, () => query(
    "select public.decide_study_proposal($1,$2) r", [id, choice])))[0].r;
try {
  await db.exec(await readFile("supabase/migrations/20261108023553_ai_habit_actions.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/20261108033000_ai_study_actions.sql", "utf8"));
  await query("insert into auth.users(id) values($1),($2)", [alice, bob]);
  await query("insert into public.study_subjects(user_id,name) values($1,'Matemática'),($2,'Matemática')", [alice,bob]);
  assert.equal((await query("select relrowsecurity from pg_class where oid=$1::regclass", [ledger]))[0].relrowsecurity, true);
  for (const rpc of ["public.propose_study_session(text,text,integer)", "public.decide_study_proposal(uuid,text)"]) {
    assert.equal((await query("select has_function_privilege('anon',$1,'execute') allowed", [rpc]))[0].allowed, false);
  }
  for (const [subject,topic,minutes] of [[null,"Matrices",45],["Matemática",null,45],
    ["Matemática"," ",45],["Matemática","Matrices",0],["Matemática","Matrices",721],
    ["x".repeat(121),"Matrices",45],["Matemática","x".repeat(201),45]]) {
    assert.equal((await propose(subject,topic,minutes)).status, "invalid");
  }
  await assert.rejects(asUser(db,"",() => query("select public.propose_study_session('Matemática','Matrices',45)")));
  assert.equal((await propose("Materia desconocida")).status, "not_found");
  await query("insert into public.study_subjects(user_id,name) values($1,'Matemática')", [alice]);
  assert.equal((await propose()).status, "ambiguous");
  await query("delete from public.study_subjects where user_id=$1 and id=(select max(id) from public.study_subjects where user_id=$1)",[alice]);
  const first = await propose();
  assert.equal(first.status, "pending");
  assert.equal(first.kind, "study");
  assert.equal((await query("select count(*)::int n from public.study_sessions"))[0].n, 0);
  assert.equal((await decide(first.id, "confirm", bob)).status, "not_found");
  assert.equal((await decide(first.id, "cancel")).status, "cancelled");
  assert.equal((await decide(first.id)).status, "consumed");
  assert.equal((await query("select count(*)::int n from public.study_sessions"))[0].n, 0);
  const next = await propose();
  assert.equal((await decide(next.id)).status, "confirmed");
  assert.equal((await decide(next.id)).status, "consumed");
  const rows = await query("select * from public.study_sessions");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].user_id, alice);
  assert.equal(rows[0].duration_minutes, 45);
  assert.equal(rows[0].topic, "Matrices");
  const audit = (await query(`select * from ${ledger} where id=$1`, [next.id]))[0];
  assert.equal(audit.target_id, rows[0].id);
  assert.equal(audit.proposed_topic, null);
  assert.equal(audit.proposed_subject_name, null);
  assert.equal(audit.proposed_duration, null);
  assert.deepEqual(await asUser(db,bob,() => query(`select * from ${ledger}`)), []);
  await assert.rejects(asUser(db,alice,() => query(`update ${ledger} set result='confirmed'`)));
  const expired = await propose();
  await query(`update ${ledger} set created_at=clock_timestamp()-interval '11 minutes' where id=$1`, [expired.id]);
  assert.equal((await decide(expired.id)).status, "expired");
  const stale = await propose();
  await query("update public.study_subjects set active=false where id=$1", [rows[0].subject_id]);
  assert.equal((await decide(stale.id)).status, "stale");
  await query("update public.study_subjects set active=true where id=$1", [rows[0].subject_id]);
  const failure = await propose();
  await db.exec("revoke insert on public.study_sessions from authenticated");
  assert.equal((await decide(failure.id)).status, "failed");
  await db.exec("grant insert on public.study_sessions to authenticated");
  assert.equal((await query("select count(*)::int n from public.study_sessions"))[0].n, 1);
  const duplicate = await propose();
  const outcomes = await Promise.all([decide(duplicate.id), decide(duplicate.id)]);
  assert.deepEqual(outcomes.map(x=>x.status).sort(), ["confirmed","consumed"]);
  assert.equal((await query("select count(*)::int n from public.study_sessions"))[0].n, 2);
  console.log("PASS: estudio, dueño/RLS, ambigüedad, cancelación, vencimiento, stale, auditoría, idempotencia y errores.");
} finally { await db.close(); }
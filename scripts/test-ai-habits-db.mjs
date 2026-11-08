import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";

const db = await createTestDatabase(false);
const ledger = "assistant_private.habit_actions";
const query = async (sql, args = []) => (await db.query(sql, args)).rows;
const propose = async (name, user = alice) =>
  (await asUser(db, user, () => query("select public.propose_mark_habit($1) r", [name])))[0].r;
const decide = async (id, decision = "confirm", user = alice) =>
  (await asUser(db, user, () => query("select public.decide_habit_proposal($1,$2) r", [id, decision])))[0].r;
const createHabit = async (name, user = alice) =>
  (await query("insert into public.habits(user_id,name) values($1,$2) returning id", [user, name]))[0].id;
const entries = async () => query("select habit_id, completed from public.habit_entries");
try {
  await db.exec(await readFile("supabase/migrations/20261108020800_ai_habit_actions.sql", "utf8"));
  await query("insert into auth.users(id) values($1),($2)", [alice, bob]);
  for (const rpc of ["public.propose_mark_habit(text)", "public.decide_habit_proposal(uuid,text)"]) {
    assert.equal((await query("select has_function_privilege('anon',$1,'execute') allowed", [rpc]))[0].allowed, false);
  }
  assert.equal((await query("select relrowsecurity from pg_class where oid=$1::regclass", [ledger]))[0].relrowsecurity, true);
  assert.equal((await query("select has_schema_privilege('anon','assistant_private','usage') allowed"))[0].allowed, false);
  await assert.rejects(asUser(db, "", () => query("select public.propose_mark_habit('Lectura')")));
  await createHabit("Solo Bob", bob);
  await createHabit("Lectura", bob);
  assert.equal((await propose("Solo Bob")).status, "not_found");
  const habit = await createHabit("Lectura");
  const a = await propose("  LECTURA ");
  assert.equal(a.status, "pending");
  assert.equal(a.name, "Lectura");
  assert.equal(a.completed, true);
  assert.deepEqual(await entries(), []);
  assert.deepEqual(await asUser(db, bob, () => query(`select * from ${ledger}`)), []);
  assert.equal((await decide(a.id, "confirm", bob)).status, "not_found");
  assert.equal((await decide(a.id, "anything")).status, "invalid");
  await assert.rejects(asUser(db, alice, () => query(`update ${ledger} set result='confirmed'`)));
  await assert.rejects(asUser(db, alice, () => query(`delete from ${ledger}`)));
  assert.equal((await decide(a.id, "cancel")).status, "cancelled");
  assert.deepEqual(await decide(a.id), { status: "consumed", outcome: "cancelled" });
  assert.deepEqual(await entries(), []);

  const duplicate = await createHabit("lectura");
  assert.equal((await propose("Lectura")).status, "ambiguous");
  await query("update public.habits set active=false where id=$1", [duplicate]);
  const expired = await propose("Lectura");
  await query(`update ${ledger} set created_at=clock_timestamp()-interval '11 minutes' where id=$1`, [expired.id]);
  assert.equal((await decide(expired.id)).status, "expired");
  const yesterday = await propose("Lectura");
  await query(`update ${ledger} set entry_date=entry_date-1 where id=$1`, [yesterday.id]);
  assert.equal((await decide(yesterday.id)).status, "expired");

  const obsolete = await propose("Lectura");
  await query("update public.habits set name='Leer' where id=$1", [habit]);
  assert.equal((await decide(obsolete.id)).status, "stale");
  const moved = await propose("Leer");
  await query(`update public.habits set weekdays=array[(extract(isodow from now() at time zone
    'America/Argentina/Buenos_Aires')::int % 7 + 1)::smallint] where id=$1`, [habit]);
  assert.equal((await propose("Leer")).status, "not_found");
  assert.equal((await decide(moved.id)).status, "stale");
  await query("update public.habits set weekdays=default where id=$1", [habit]);
  const archived = await propose("Leer");
  await query("update public.habits set active=false where id=$1", [habit]);
  assert.equal((await decide(archived.id)).status, "stale");
  assert.equal((await propose("Leer")).status, "not_found");
  await query("update public.habits set active=true where id=$1", [habit]);
  assert.deepEqual(await entries(), []);

  const failure = await propose("Leer");
  await db.exec("revoke insert on public.habit_entries from authenticated");
  assert.equal((await decide(failure.id)).status, "failed");
  assert.deepEqual(await entries(), []);
  await db.exec("grant insert on public.habit_entries to authenticated");
  assert.deepEqual(await decide(failure.id), { status: "consumed", outcome: "failed" });

  const first = await propose("Leer");
  const second = await propose("Leer");
  await query("insert into public.habit_entries(user_id,habit_id,entry_date,completed) values($1,$2,$3,false)", [alice, habit, first.date]);
  assert.equal((await decide(first.id)).status, "confirmed");
  assert.equal((await decide(second.id)).status, "already_done");
  assert.deepEqual(await decide(first.id), { status: "consumed", outcome: "confirmed" });
  assert.deepEqual(await entries(), [{ habit_id: habit, completed: true }]);
  assert.equal((await propose("Leer")).status, "already_done");
  const audit = (await query(`select user_id, habit_id, action_type, result, decided_at is not null as dated from ${ledger} where id=$1`, [first.id]))[0];
  assert.deepEqual(audit, { user_id: alice, habit_id: habit, action_type: "mark_habit", result: "confirmed", dated: true });
  for (let i = 0; i < 20; i++) assert.equal((await propose("Solo Bob", bob)).status, "pending");
  assert.equal((await propose("Solo Bob", bob)).status, "limited");
  console.log("PASS: proposal-only, RLS, single-use decisions, expiry/day rollover, ambiguity, changed habits, atomic error audit and idempotence.");
} finally { await db.close(); }

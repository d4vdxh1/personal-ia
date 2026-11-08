import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";

const db = await createTestDatabase(false);
const table = "assistant_private.checkin_actions";
const values = { energy: 4, emotional_state: 3, life_rating: 5, sleep_hours: 7.25 };
const query = async (sql, args = []) => (await db.query(sql, args)).rows;
const propose = async (v = values, user = alice) =>
  (await asUser(db, user, () => query("select public.propose_daily_checkin($1::jsonb) r", [JSON.stringify(v)])))[0].r;
const decide = async (id, choice = "confirm", overwrite = false, user = alice) =>
  (await asUser(db, user, () => query("select public.decide_checkin_proposal($1,$2,$3) r", [id, choice, overwrite])))[0].r;
try {
  for (const file of ["20261108023553_ai_habit_actions.sql", "20261108025732_ai_checkin_actions.sql"]) {
    await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
  }
  await query("insert into auth.users(id) values($1),($2)", [alice, bob]);
  assert.equal((await query("select relrowsecurity from pg_class where oid=$1::regclass", [table]))[0].relrowsecurity, true);
  for (const rpc of ["public.propose_daily_checkin(jsonb)", "public.decide_checkin_proposal(uuid,text,boolean)"]) {
    assert.equal((await query("select has_function_privilege('anon',$1,'execute') allowed", [rpc]))[0].allowed, false);
  }
  for (const invalid of [null, [], {}, { ...values, energy: 0 }, { ...values, emotional_state: 6 },
    { ...values, life_rating: 1.5 }, { ...values, stress: null }, { ...values, sleep_hours: 24.01 },
    { ...values, sleep_hours: 7.123 }, { ...values, user_id: bob }, { ...values, notes: "private" }]) {
    assert.equal((await propose(invalid)).status, "invalid");
  }
  await assert.rejects(asUser(db, "", () => query("select public.propose_daily_checkin($1)", [JSON.stringify(values)])));
  const initial = await propose();
  assert.equal(initial.status, "pending");
  assert.equal(initial.overwrite, false);
  assert.equal((await query("select count(*)::int n from public.daily_checkins"))[0].n, 0);
  assert.equal((await decide(initial.id, "confirm", false, bob)).status, "not_found");
  assert.equal((await decide(initial.id, "cancel")).status, "cancelled");
  assert.equal((await decide(initial.id)).status, "consumed");
  const first = await propose();
  assert.equal((await decide(first.id)).status, "confirmed");
  assert.equal((await decide(first.id)).status, "consumed");
  let row = (await query("select * from public.daily_checkins where user_id=$1", [alice]))[0];
  assert.equal(row.energy, 4);
  assert.equal(Number(row.sleep_hours), 7.25);
  let audit = (await query(`select * from ${table} where id=$1`, [first.id]))[0];
  assert.equal(audit.proposed_values, null);
  assert.equal(audit.target_id, row.id);
  await query("update public.daily_checkins set notes='do not send to Gemini',stress=2 where user_id=$1", [alice]);
  const update = await propose({ energy: 2, emotional_state: 4, life_rating: 3 });
  assert.equal(update.overwrite, true);
  assert.equal(JSON.stringify(update).includes("do not send"), false);
  assert.equal((await decide(update.id)).status, "needs_confirmation");
  assert.equal((await query("select energy from public.daily_checkins where user_id=$1", [alice]))[0].energy, 4);
  assert.equal((await decide(update.id, "confirm", true)).status, "confirmed");
  row = (await query("select * from public.daily_checkins where user_id=$1", [alice]))[0];
  assert.equal(row.energy, 2);
  assert.equal(Number(row.sleep_hours), 7.25);
  assert.equal(row.stress, 2);
  assert.equal(row.notes, "do not send to Gemini");

  const stale = await propose();
  await query("update public.daily_checkins set energy=5 where user_id=$1", [alice]);
  assert.equal((await decide(stale.id, "confirm", true)).status, "stale");
  const expired = await propose();
  await query(`update ${table} set created_at=clock_timestamp()-interval '11 minutes' where id=$1`, [expired.id]);
  assert.equal((await decide(expired.id, "confirm", true)).status, "expired");
  const yesterday = await propose();
  await query(`update ${table} set entry_date=entry_date-1 where id=$1`, [yesterday.id]);
  assert.equal((await decide(yesterday.id, "confirm", true)).status, "expired");

  const failure = await propose();
  await db.exec("revoke update on public.daily_checkins from authenticated");
  assert.equal((await decide(failure.id, "confirm", true)).status, "failed");
  await db.exec("grant update on public.daily_checkins to authenticated");
  assert.equal((await query("select energy from public.daily_checkins where user_id=$1", [alice]))[0].energy, 5);
  assert.equal((await query(`select proposed_values from ${table} where id=$1`, [failure.id]))[0].proposed_values, null);
  await assert.rejects(asUser(db, alice, () => query(`update ${table} set result='confirmed'`)));
  assert.deepEqual(await asUser(db, bob, () => query(`select * from ${table}`)), []);
  // A manual record appearing after proposal creation must survive.
  const concurrent = await propose(values, bob);
  await query("insert into public.daily_checkins(user_id,energy,emotional_state,life_rating) values($1,1,1,1)", [bob]);
  assert.equal((await decide(concurrent.id, "confirm", false, bob)).status, "stale");
  assert.equal((await query("select energy from public.daily_checkins where user_id=$1", [bob]))[0].energy, 1);
  console.log("PASS: check-in validation, RLS, explicit overwrite, notes preservation, stale/expired/error audit and replay.");
} finally { await db.close(); }

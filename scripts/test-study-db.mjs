import assert from "node:assert/strict";
import { createTestDatabase, asUser, alice, bob } from "./test-db.mjs";
const db = await createTestDatabase();
try {
  await db.query("insert into auth.users(id) values ($1),($2)",[alice,bob]);
  const subjectId = await asUser(db, alice, async () =>
    (await db.query("insert into public.study_subjects(user_id,name,priority) values($1,'Ingeniería del Software',1) returning id",[alice])).rows[0].id);
  const otherSubject = await asUser(db, bob, async () =>
    (await db.query("insert into public.study_subjects(user_id,name) values($1,'Otra materia') returning id",[bob])).rows[0].id);
  const assignment = await asUser(db,alice,async () =>
    (await db.query("insert into public.study_assignments(user_id,subject_id,title,due_date) values($1,$2,'Trabajo final',current_date+3) returning id",[alice,subjectId])).rows[0].id);
  const exam = await asUser(db,alice,async () =>
    (await db.query("insert into public.study_exams(user_id,subject_id,title,exam_date) values($1,$2,'Parcial',current_date+10) returning id",[alice,subjectId])).rows[0].id);
  const session = await asUser(db,alice,async () =>
    (await db.query("insert into public.study_sessions(user_id,subject_id,topic,study_date,duration_minutes) values($1,$2,'Arquitectura',current_date,50) returning id",[alice,subjectId])).rows[0].id);
  assert.ok(assignment && exam && session);
  await assert.rejects(asUser(db,alice,() =>
    db.query("insert into public.study_assignments(user_id,subject_id,title,due_date) values($1,$2,'Ajena',current_date)",[alice,otherSubject])));
  await assert.rejects(asUser(db,alice,() =>
    db.query("insert into public.study_sessions(user_id,subject_id,topic,study_date,duration_minutes) values($1,$2,'Negativa',current_date,0)",[alice,subjectId])));
  for(const table of ["study_subjects","study_assignments","study_exams","study_sessions"]){
    const props=(await db.query("select relrowsecurity from pg_class where oid=$1::regclass",["public."+table])).rows[0];
    assert.equal(props.relrowsecurity,true);
    assert.equal((await db.query("select count(*)::int n from pg_policies where schemaname='public' and tablename=$1",[table])).rows[0].n,4);
    for(const right of ["select","insert","update","delete"])
      assert.equal((await db.query("select has_table_privilege('anon',$1,$2) value",["public."+table,right])).rows[0].value,false);
    assert.equal((await asUser(db,bob,() => db.query("select count(*)::int n from public."+table+" where user_id=$1",[alice]))).rows[0].n,0);
    assert.equal((await asUser(db,bob,() => db.query("delete from public."+table+" where user_id=$1 returning id",[alice]))).rows.length,0);
    await assert.rejects(asUser(db,alice,() => db.query("update public."+table+" set user_id=$1 where user_id=$2",[bob,alice])));
  }
  assert.equal((await asUser(db,alice,() => db.query("select count(*)::int n from public.study_assignments"))).rows[0].n,1);
  console.log("PASS: Estudio (4 tablas), RLS, ownership, FK entre usuarios, rangos y derechos anon.");
} finally {await db.close();}

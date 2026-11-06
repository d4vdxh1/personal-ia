import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
export async function createTestDatabase(training = true) {
  const db = new PGlite();
  await db.exec(await readFile("supabase/tests/bootstrap.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/202610090001_initial_schema.sql", "utf8"));
  if (training) await db.exec(await readFile("supabase/migrations/20261106031833_training.sql", "utf8"));
  return db;
}
export const alice = "11111111-1111-4111-8111-111111111111";
export const bob = "22222222-2222-4222-8222-222222222222";
export async function asUser(db, id, fn) {
  await db.exec("begin; set local role authenticated;");
  await db.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
  try { const result = await fn(); await db.exec("commit"); return result; }
  catch (e) { await db.exec("rollback"); throw e; }
}

import assert from "node:assert/strict";
import { join } from "node:path";
import { alice } from "./test-db.mjs";

export async function testAssistantBrowser({ page, base, db, output, setRevoked, setFailWrite }) {
  const endpoint = base + "/api/assistant";
  const headers = { origin: base };
  const ask = message => page.request.post(endpoint, { headers, data: { message } });
  const decide = data => page.request.post(endpoint + "/decision", { headers, data });
  const counts = async () => (await db.query(`select
    (select count(*)::int from assistant_private.habit_actions) as proposals,
    (select count(*)::int from public.habit_entries where completed) as completed`)).rows[0];
  const cooldown = () => db.exec("update public.ai_daily_usage set last_request_at=now()-interval '6 seconds'");
  const currentCard = page.getByRole("region", { name: "Propuesta para completar un hábito" }).last();
  const requestCard = async () => {
    await cooldown();
    await page.getByLabel("Tu pregunta").fill("Completé lectura hoy");
    const response = page.waitForResponse(response => response.url() === endpoint);
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    const data = await (await response).json();
    assert.equal(data.proposal.name, "Lectura");
    assert.equal(data.proposal.completed, true);
    await currentCard.getByRole("button", { name: "Confirmar" }).waitFor();
    return data.proposal;
  };

  await db.query("insert into public.habits(user_id,name) values ($1,'Lectura')", [alice]);
  await page.goto(base + "/assistant");
  assert.equal(await page.getByLabel("Tu pregunta").isDisabled(), true);
  await page.getByRole("checkbox").check();
  for (const [text, status] of [["Resumen de hábitos", 200], ["Argumentos extra", 502],
    ["Herramienta desconocida", 502], ["Dos propuestas", 200]]) {
    await cooldown();
    const response = await ask(text);
    assert.equal(response.status(), status);
    assert.equal((await response.json()).proposal, undefined);
  }
  assert.deepEqual(await counts(), { proposals: 0, completed: 0 });

  const first = await requestCard();
  assert.deepEqual(await counts(), { proposals: 1, completed: 0 });
  const expectedDate = first.date.split("-").reverse().join("/");
  assert.ok((await currentCard.innerText()).includes(expectedDate));
  for (const width of [360, 390, 768, 800, 930, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const label of ["Confirmar", "Cancelar"]) {
      const button = currentCard.getByRole("button", { name: label });
      await button.evaluate(el => el.scrollIntoView({ block: "center" }));
      const box = await button.boundingBox();
      assert.ok(box.height >= 44 && box.width >= 44);
      assert.ok(await button.evaluate(el => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }), label + " tapado a " + width);
    }
    if (width === 390 || width === 1280) await page.screenshot({ path: join(output, "habit-proposal-" + width + ".png") });
  }
  await currentCard.getByRole("button", { name: "Cancelar" }).click();
  await currentCard.getByText("Propuesta cancelada.").waitFor();
  assert.equal((await decide({ id: first.id, decision: "confirm" })).status(), 409);
  assert.equal((await counts()).completed, 0);

  const next = await requestCard();
  const payload = { id: next.id, decision: "confirm" };
  for (const origin of [undefined, "https://other.example"]) {
    const response = await page.request.post(endpoint + "/decision", { headers: origin ? { origin } : {}, data: payload });
    assert.equal(response.status(), 403);
    assert.match(response.headers()["cache-control"], /no-store/);
  }
  for (const invalid of [{ ...payload, date: next.date }, { ...payload, id: "invalid" }, { ...payload, decision: true }]) {
    assert.equal((await decide(invalid)).status(), 400);
  }
  setRevoked(true);
  assert.equal((await decide(payload)).status(), 401);
  setRevoked(false);
  assert.equal((await counts()).completed, 0);

  setFailWrite(true);
  await currentCard.getByRole("button", { name: "Confirmar" }).click();
  await currentCard.getByText(/No pudimos comprobar el resultado/).waitFor();
  setFailWrite(false);
  assert.equal((await counts()).completed, 0);

  // Confirm via the real card and repeat after a lost response.
  await page.setViewportSize({ width: 390, height: 844 });
  await currentCard.getByRole("button", { name: "Confirmar" }).click();
  await currentCard.getByText("Hábito marcado como completado.", { exact: true }).waitFor();
  const retry = await decide(payload);
  assert.equal(retry.status(), 409);
  assert.equal((await retry.json()).result, "confirmed");
  assert.equal((await counts()).completed, 1);
  await page.goto(base + "/habits");
  await page.locator('.habit-editor input[name="name"][value="Lectura"]').waitFor();
  await page.goto(base + "/");
  const checked = page.getByRole("button", { name: "Desmarcar Lectura", exact: true });
  await checked.waitFor();
  assert.equal(await checked.getAttribute("aria-pressed"), "true");
  const actual = (await db.query("select entry_date::text as entry_day, completed from public.habit_entries")).rows;
  assert.deepEqual(actual, [{ entry_day: next.date, completed: true }]);

  // Two submissions from separate requests for a fresh proposal.
  await db.exec("update public.habit_entries set completed=false");
  await cooldown();
  const last = (await (await ask("Completé lectura hoy")).json()).proposal;
  const posts = await Promise.all([decide({ id: last.id, decision: "confirm" }), decide({ id: last.id, decision: "confirm" })]);
  assert.deepEqual(posts.map(response => response.status()).sort(), [200, 409]);
  assert.equal((await counts()).completed, 1);
  console.log("PASS: chat → tarjeta → cancelar/confirmar, origen, sesión, reintento, doble envío y seis anchos.");
}

export async function testCheckinBrowser({ page, base, db, output, setRevoked, setFailWrite }) {
  const endpoint = base + "/api/assistant";
  const headers = { origin: base };
  const card = page.getByRole("region", { name: "Propuesta de check-in diario" }).last();
  const cooldown = () => db.exec("update public.ai_daily_usage set last_request_at=now()-interval '6 seconds'");
  const count = async () => (await db.query("select count(*)::int n from public.daily_checkins where user_id=$1", [alice])).rows[0].n;
  async function requestCard() {
    await cooldown();
    await page.getByLabel("Tu pregunta").fill("Check-in válido de hoy");
    const response = page.waitForResponse(r => r.url() === endpoint);
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    const data = await (await response).json();
    assert.equal(data.proposal.kind, "checkin");
    await card.getByRole("button", { name: "Confirmar" }).waitFor();
    return data.proposal;
  }
  await page.goto(base + "/assistant");
  await page.getByRole("checkbox").check();
  for (const text of ["Check-in incompleto", "Check-in con notas"]) {
    await cooldown();
    assert.equal((await page.request.post(endpoint, { headers, data: { message: text } })).status(), 502);
  }
  const first = await requestCard();
  assert.equal(first.overwrite, false);
  assert.equal(await count(), 0);
  await card.getByRole("button", { name: "Cancelar" }).click();
  await card.getByText("Propuesta cancelada.").waitFor();
  assert.equal(await count(), 0);
  const fresh = await requestCard();
  await card.getByRole("button", { name: "Confirmar" }).click();
  await card.getByText("Check-in de hoy guardado.").waitFor();
  assert.equal(await count(), 1);
  await db.query("update public.daily_checkins set notes='private fixture',stress=2 where user_id=$1", [alice]);
  const update = await requestCard();
  assert.equal(update.overwrite, true);
  const confirm = card.getByRole("button", { name: "Confirmar" });
  const consent = card.getByRole("checkbox");
  assert.equal(await confirm.isDisabled(), true);
  const data = { id: update.id, kind: "checkin", decision: "confirm", overwrite: false };
  assert.equal((await page.request.post(endpoint + "/decision", { headers, data })).status(), 409);
  for (const width of [360, 390, 768, 800, 930, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await consent.scrollIntoViewIfNeeded();
    await consent.check();
    assert.equal(await confirm.isDisabled(), false);
    await confirm.evaluate(el => el.scrollIntoView({ block: "center" }));
    const rect = await confirm.boundingBox();
    assert.ok(rect.height >= 44);
    assert.ok(await confirm.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    }));
    if (width === 390 || width === 1280) await page.screenshot({ path: join(output, "checkin-proposal-" + width + ".png") });
    await consent.uncheck();
  }
  setRevoked(true);
  assert.equal((await page.request.post(endpoint + "/decision", { headers, data: { ...data, overwrite: true } })).status(), 401);
  setRevoked(false);
  await consent.check();
  setFailWrite(true);
  await confirm.click();
  await card.getByText(/No pudimos comprobar el resultado/).waitFor();
  setFailWrite(false);
  await confirm.click();
  await card.getByText("Check-in de hoy guardado.").waitFor();
  const row = (await db.query("select energy,stress,notes from public.daily_checkins where user_id=$1", [alice])).rows[0];
  assert.deepEqual(row, { energy: 4, stress: 2, notes: "private fixture" });
  const repeat = await page.request.post(endpoint + "/decision", { headers, data: { ...data, overwrite: true } });
  assert.equal(repeat.status(), 409);
  await page.goto(base + "/check-in");
  await page.getByRole("heading", { name: "Check-in diario", exact: true }).waitFor();
  assert.equal(await count(), 1);
  assert.equal(fresh.date, update.date);
  console.log("PASS: check-in chat, preview, cancellation, creation, explicit overwrite, notes, session/retry and six widths.");
}

export async function testStudyBrowser({ page, base, db, output, setRevoked, setFailWrite }) {
  const endpoint = base + "/api/assistant";
  const headers = { origin: base };
  const card = page.getByRole("region", { name: "Propuesta de sesión de estudio" }).last();
  const cooldown = () => db.exec("update public.ai_daily_usage set last_request_at=now()-interval '6 seconds'");
  const count = async () => (await db.query("select count(*)::int n from public.study_sessions where user_id=$1", [alice])).rows[0].n;
  async function requestCard() {
    await cooldown();
    await page.getByLabel("Tu pregunta").fill("Estudio válido");
    const response = page.waitForResponse(r => r.url() === endpoint);
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    const data = await (await response).json();
    assert.equal(data.proposal.kind, "study");
    assert.equal(data.proposal.duration_minutes, 45);
    assert.equal(data.proposal.subject, "Ingeniería del Software");
    await card.getByRole("button", { name: "Confirmar" }).waitFor();
    return data.proposal;
  }
  await page.goto(base + "/assistant");
  await page.getByRole("checkbox").check();
  for (const text of ["Estudio incompleto", "Estudio con ID"]) {
    await cooldown();
    assert.equal((await page.request.post(endpoint, { headers, data: { message: text } })).status(), 502);
  }
  const before = await count();
  const first = await requestCard();
  assert.equal(await count(), before);
  await card.getByRole("button", { name: "Cancelar" }).click();
  await card.getByText("Propuesta cancelada.").waitFor();
  assert.equal(await count(), before);
  const next = await requestCard();
  for (const invalid of [{ id: next.id, decision: "confirm", kind: "study", user_id: alice },
    { id: next.id, decision: "confirm", kind: "study", duration_minutes: 5 }]) {
    assert.equal((await page.request.post(endpoint + "/decision", { headers, data: invalid })).status(), 400);
  }
  const decision = { id: next.id, decision: "confirm", kind: "study" };
  assert.equal((await page.request.post(endpoint + "/decision", { headers: { origin: "https://foreign.example" }, data: decision })).status(), 403);
  for (const width of [360, 390, 768, 800, 930, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const label of ["Confirmar", "Cancelar"]) {
      const button = card.getByRole("button", { name: label });
      await button.scrollIntoViewIfNeeded();
      const rect = await button.boundingBox();
      assert.ok(rect.height >= 44 && rect.width >= 44);
    }
    if (width === 390 || width === 1280) await page.screenshot({ path: join(output, "study-proposal-" + width + ".png") });
  }
  setRevoked(true);
  assert.equal((await page.request.post(endpoint + "/decision", { headers, data: decision })).status(), 401);
  setRevoked(false);
  setFailWrite(true);
  await card.getByRole("button", { name: "Confirmar" }).click();
  await card.getByText(/No pudimos comprobar el resultado/).waitFor();
  setFailWrite(false);
  await card.getByRole("button", { name: "Confirmar" }).click();
  await card.getByText("Sesión de estudio registrada.").waitFor();
  assert.equal(await count(), before+1);
  const row = (await db.query("select s.topic,s.duration_minutes,x.name from public.study_sessions s join public.study_subjects x on x.id=s.subject_id where s.user_id=$1 order by s.created_at desc limit 1",[alice])).rows[0];
  assert.equal(row.topic, "Arquitectura de software");
  assert.equal(row.duration_minutes, 45);
  assert.equal(row.name, "Ingeniería del Software");
  const replay = await page.request.post(endpoint + "/decision", { headers, data: decision });
  assert.equal(replay.status(), 409);
  assert.equal((await replay.json()).result, "confirmed");
  await page.goto(base + "/study?view=sessions");
  await page.getByRole("heading", { name: "Arquitectura de software", exact: true }).waitFor();
  assert.equal(first.date, next.date);
  console.log("PASS: estudio chat/tarjeta, sin ejecución automática, cancelación, validación, confirmación, reintento y seis anchos.");
}

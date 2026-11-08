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

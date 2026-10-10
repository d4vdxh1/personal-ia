import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const modulePath = process.argv[2] || "playwright";
const { chromium } = await import(isAbsolute(modulePath) ? pathToFileURL(modulePath).href : modulePath);
const workspace = process.argv[3];
assert.ok(workspace, "Indicar una copia temporal sin .env.local como tercer argumento.");
assert.notEqual(resolve(workspace).toLowerCase(), process.cwd().toLowerCase(), "No ejecutar sobre el repositorio de trabajo.");
assert.equal(existsSync(join(workspace, ".env.local")), false, "La copia temporal no debe contener credenciales reales.");
const user = { id: "11111111-1111-4111-8111-111111111111", email: "test@example.com", aud: "authenticated", role: "authenticated" };
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: user.aud, role: user.role, exp: Math.floor(Date.now() / 1000) + 3600 })}.test`;
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
let state = "empty";
let revoked = false;
let completed = false;
let app;
let browser;
const mock = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  const url = new URL(request.url, "http://localhost");
  if (url.pathname.startsWith("/auth/v1/token")) return response.end(JSON.stringify({ access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user }));
  if (url.pathname === "/auth/v1/user") return response.writeHead(revoked ? 401 : 200).end(JSON.stringify(revoked ? { message: "Expired" } : user));
  if (url.pathname === "/rest/v1/profiles") return response.end(JSON.stringify([{ display_name: "David", timezone: "America/Argentina/Buenos_Aires", preferred_sleep_hours: 7 }]));
  if (!url.pathname.startsWith("/rest/v1/")) return response.writeHead(404).end("{}");
  assert.equal(url.searchParams.get("user_id") || (request.method === "POST" ? `eq.${user.id}` : null), `eq.${user.id}`);
  if (state === "error") return response.writeHead(500).end(JSON.stringify({ message: "Simulated failure" }));
  const table = url.pathname.split("/").at(-1);
  if (request.method === "POST") {
    let body = "";
    for await (const chunk of request) body += chunk;
    const payload = JSON.parse(body);
    assert.equal(payload.user_id, user.id);
    assert.equal(payload.entry_date, today);
    completed = payload.completed;
    return response.writeHead(201).end("{}");
  }
  let rows = [];
  if (state === "filled") {
    if (table === "habits") rows = [{ id: "22222222-2222-4222-8222-222222222222", name: "Caminar", weekdays: [1, 2, 3, 4, 5, 6, 7], active: true }];
    if (table === "habit_entries") rows = [{ habit_id: "22222222-2222-4222-8222-222222222222", completed }];
    if (table === "daily_checkins") rows = [{ energy: 4, emotional_state: 3, life_rating: 5, sleep_hours: 7, stress: 2, notes: "Bien" }];
    if (table === "journal_entries") rows = Array.from({ length: 5 }, (_, index) => ({ id: `note-${index}`, entry_date: today, relevant_event: `Nota real ${index}`, notes: index === 0 ? "x".repeat(300) : "Un buen día" }));
    if (table === "goals") rows = Array.from({ length: 5 }, (_, index) => ({ id: `goal-${index}`, title: index === 0 ? "a".repeat(200) : `Objetivo real ${index}`, type: "weekly", target_date: "2020-01-01", progress: 40, status: "active" }));
  }
  if (table === "daily_checkins" || table === "habit_entries") assert.equal(url.searchParams.get("entry_date"), `eq.${today}`);
  if (table === "journal_entries" && url.searchParams.has("entry_date")) assert.equal(url.searchParams.get("entry_date"), `eq.${today}`);
  const offset = Number(url.searchParams.get("offset") || 0);
  const limit = Number(url.searchParams.get("limit") || rows.length);
  response.setHeader("Content-Range", `${offset}-${Math.max(offset, Math.min(offset + limit, rows.length) - 1)}/${rows.length}`);
  response.end(JSON.stringify(rows.slice(offset, offset + limit)));
});
try {
  await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "-p", "3108"], {
    cwd: workspace, windowsHide: true, stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${mock.address().port}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key" },
  });
  const base = "http://localhost:3108";
  for (let attempt = 0; ; attempt++) {
    try { await fetch(`${base}/login`); break; } catch (error) {
      if (attempt > 100) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.waitForURL(/login/);
  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await page.waitForURL(`${base}/`);
  await page.getByText("Todavía no escribiste en tu diario hoy.").waitFor();
  await page.getByText("No tenés objetivos activos.", { exact: false }).waitFor();
  state = "filled";
  await page.reload();
  await page.getByText("Nota real 0", { exact: true }).waitFor();
  assert.equal(await page.locator(".today-note").count(), 3);
  assert.equal(await page.locator(".goal-entry").count(), 3);
  assert.match(await page.locator(".habit-summary").innerText(), /0 de 1/);
  await page.getByRole("button", { name: "Marcar Caminar", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".habit-summary")?.textContent.includes("1 de 1"));
  await page.reload();
  assert.equal(await page.getByRole("button", { name: "Desmarcar Caminar", exact: true }).getAttribute("aria-pressed"), "true");
  const artifacts = join(tmpdir(), "personal-ia-phase1");
  await mkdir(artifacts, { recursive: true });
  for (const width of [360, 390, 768, 800, 930, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/habits", "/check-in", "/journal", "/goals", "/profile"]) {
      await page.goto(`${base}${route}`);
      await page.locator("h1").waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow ${route} ${width}`);
      const sidebar = await page.locator(".sidebar").boundingBox();
      if (width <= 800) assert.equal(Math.round(sidebar.y + sidebar.height), 900);
      else assert.ok((await page.locator(".main-content").boundingBox()).x >= sidebar.width);
      const buttons = page.locator("main button[type=submit]:visible");
      if (await buttons.count()) {
        const button = buttons.last();
        await button.evaluate((element) => element.scrollIntoView({ block: "center" }));
        const bounds = await button.boundingBox();
        if (width <= 800) assert.ok(bounds.y + bounds.height <= sidebar.y, `Botón tapado ${route} ${width}`);
      }
      if (route === "/") {
        assert.equal(await page.locator(".sidebar .selected").innerText(), "Hoy");
        assert.equal(await page.getByText(/Contenido ficticio|VISTA PREVIA|DEMO/).count(), 0);
        if ([360, 1280].includes(width)) await page.screenshot({ path: join(artifacts, `today-${width}.png`), fullPage: true });
      }
    }
    console.log(`PASS ${width}px: seis pantallas, menú fijo, sin overflow ni botones tapados.`);
  }
  await page.getByRole("link", { name: "Hoy", exact: true }).click();
  await page.waitForURL(`${base}/`);
  state = "error";
  await page.reload();
  assert.equal(await page.getByRole("alert").count(), 4);
  assert.equal(await page.locator(".habit-summary").count(), 0);
  state = "empty";
  await page.reload();
  assert.equal(await page.getByRole("alert").count(), 0);
  assert.equal((await page.request.get(`${base}/api/health/supabase`)).status(), 404);
  assert.match((await page.request.get(base)).headers()["cache-control"], /no-store/);
  revoked = true;
  await page.reload();
  await page.waitForURL(/login/);
  assert.deepEqual(errors, []);
  console.log(`PASS: Mi Día vacío/real/error, conteos/límites, hábito persistido, sesión y diagnóstico retirado. Capturas: ${artifacts}. Servicios simulados, no prueban RLS remoto.`);
} finally {
  await browser?.close(); app?.kill(); mock.closeAllConnections(); mock.close();
}

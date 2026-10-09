// Integration test against an isolated Auth double; never contacts Supabase.
// Usage: node scripts/test-auth.mjs <absolute path to playwright index.mjs>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const user = { id: "11111111-1111-4111-8111-111111111111", email: "test@example.com", aud: "authenticated", role: "authenticated" };
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: user.aud, role: user.role, exp: Math.floor(Date.now() / 1000) + 3600 })}.test`;
let revoked = false;
let app;
let browser;
const auth = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url.startsWith("/auth/v1/token")) {
    let body = "";
    for await (const chunk of req) body += chunk;
    const credentials = JSON.parse(body);
    if (credentials.password !== "correct-test-password") {
      res.writeHead(400).end(JSON.stringify({ code: "invalid_credentials", message: "Invalid login credentials" }));
    } else {
      revoked = false;
      res.end(JSON.stringify({ access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user }));
    }
  } else if (req.url === "/auth/v1/user") {
    if (revoked) res.writeHead(401).end(JSON.stringify({ code: "session_not_found", message: "Session not found" }));
    else res.end(JSON.stringify(user));
  } else if (req.url.startsWith("/auth/v1/logout")) {
    revoked = true;
    res.writeHead(204).end();
  } else res.writeHead(404).end("{}");
});
try {
  await new Promise((resolve) => auth.listen(0, "127.0.0.1", resolve));
  // Dev compiles NEXT_PUBLIC variables with the isolated configuration.
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3107"], {
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${auth.address().port}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key" },
    stdio: "inherit",
  });
  const base = "http://localhost:3107";
  for (let attempt = 0; ; attempt++) {
    try { await fetch(`${base}/login`); break; } catch (error) {
      if (attempt > 60) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  const response = await fetch(base, { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.match(response.headers.get("location"), /\/login\?reason=session$/);
  assert.match(response.headers.get("cache-control"), /no-store/);
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/login`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  const submit = async (password) => {
    await page.getByLabel("Correo electrónico").fill(user.email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  };
  await submit("wrong-test-password");
  await page.getByRole("alert").filter({ hasText: "No pudimos iniciar sesión" }).waitFor();
  await submit("correct-test-password");
  await page.waitForURL(`${base}/`);
  await page.getByRole("button", { name: "Cerrar sesión" }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: "Cerrar sesión" }).waitFor();
  await page.goto(`${base}/login`);
  await page.waitForURL(`${base}/`);
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL(/reason=logout/);
  await page.goto(base);
  await page.waitForURL(/reason=session/);
  await submit("correct-test-password");
  await page.waitForURL(`${base}/`);
  revoked = true;
  await page.reload();
  await page.waitForURL(/reason=session/);
  assert.deepEqual(errors, []);
  console.log("PASS: private route, no-store, responsive login, invalid password, login, reload, login redirect, logout, revoked session, browser errors.");
} finally {
  await browser?.close();
  app?.kill();
  auth.closeAllConnections();
  auth.close();
}

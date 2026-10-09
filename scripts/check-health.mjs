import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/app/api/health/supabase/route.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { GET } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const originalFetch = globalThis.fetch;
const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
try {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let response = await GET();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "unavailable" });
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-public-key";
  for (const [authStatus, dataStatus, code, expected] of [
    [200, 401, "42501", 200], [200, 403, "42501", 200],
    [401, 401, "42501", 503], [200, 401, "invalid_key", 503],
    [200, 404, "PGRST205", 503], [200, 200, undefined, 503],
  ]) {
    globalThis.fetch = async (url, options) => {
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal);
      return Response.json({ code }, { status: url.pathname.includes("/auth/") ? authStatus : dataStatus });
    };
    response = await GET();
    assert.equal(response.status, expected);
    assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.deepEqual(await response.json(), expected === 200 ? { status: "ok", auth: "reachable", dataApi: "restricted" } : { status: "unavailable" });
  }
  globalThis.fetch = async () => { throw new Error("internal secret must not escape"); };
  response = await GET();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "unavailable" });
  console.log("PASS: diagnóstico sin variables, rechazo esperado, clave inválida, tabla ausente, acceso inesperado, fallo de red y respuesta mínima sin caché.");
} finally {
  globalThis.fetch = originalFetch;
  for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", originalUrl], ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", originalKey]]) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
}

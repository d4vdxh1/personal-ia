// Playwright se instala fuera del proyecto. Ver docs/CIERRE_FASE_0.md.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const artifacts = join(tmpdir(), "personal-ia-visual");
await mkdir(artifacts, { recursive: true });
try {
  for (const width of [360, 390, 768, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(process.env.DEMO_URL || "http://127.0.0.1:3000", {
      waitUntil: "networkidle",
    });
    await page.getByRole("heading", { name: "Buen día, David." }).waitFor();
    assert.equal(await page.locator("input:checked").count(), 3);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `Desbordamiento a ${width}px`);
    await page.getByRole("checkbox", { name: /Repasar un tema/ }).check();
    assert.match(await page.locator(".habit-summary").innerText(), /4 de 5/);
    await page.getByRole("checkbox", { name: /Repasar un tema/ }).uncheck();
    assert.match(await page.locator(".habit-summary").innerText(), /3 de 5/);
    await page.getByRole("button", { name: /Check-in/ }).click();
    await page.getByRole("dialog").waitFor();
    assert.match(
      await page.getByRole("dialog").innerText(),
      /No se registra ni se guarda/,
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").isVisible(), false);
    assert.match(await page.locator(":focus").innerText(), /Check-in/);
    for (const name of ["Seguimiento", "Progreso", "Más"]) {
      await page.getByRole("button", { name, exact: true }).click();
      assert.equal(
        await page
          .getByRole("button", { name, exact: true })
          .getAttribute("aria-current"),
        "page",
      );
      assert.ok(
        (await page
          .getByText("Disponible en una próxima fase", { exact: true })
          .count()) > 0,
      );
    }
    await page.getByRole("button", { name: "Hoy", exact: true }).click();
    const checkbox = page.getByRole("checkbox", { name: /Repasar un tema/ });
    await checkbox.focus();
    await page.keyboard.press("Space");
    assert.match(await page.locator(".habit-summary").innerText(), /4 de 5/);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("input:checked").count(), 3);
    const undersized = await page
      .locator(".app-shell button:visible")
      .evaluateAll(
        (buttons) =>
          buttons.filter((button) => button.getBoundingClientRect().height < 44)
            .length,
      );
    assert.equal(undersized, 0, "Altura táctil mínima");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => window.scrollY === 0);
    await page.screenshot({
      path: join(artifacts, `day-${width}.png`),
      fullPage: true,
    });
    assert.deepEqual(errors, [], "Consola sin errores");
    console.log(
      `PASS ${width}px: sin overflow, hábitos, progreso, navegación, diálogo/Escape/foco, teclado, reinicio y consola.`,
    );
    await page.close();
  }
  console.log(`Capturas: ${artifacts}`);
} finally {
  await browser.close();
}

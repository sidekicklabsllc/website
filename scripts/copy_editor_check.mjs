import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { startCopyEditor } from "./copy_editor.mjs";

const fixture = await mkdtemp(join(tmpdir(), "samantha-copy-editor-"));
const source = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Editor test</title><link rel="stylesheet" href="/styles.css"></head>
<body>
  <nav><a href="/">samantha</a></nav>
  <main><h1>Hello <em>there</em>.</h1><p>Keep <a href="/details/">this link</a> intact.</p></main>
</body>
</html>
`;

let server;
let browser;
try {
  await writeFile(join(fixture, "index.html"), source);
  await writeFile(join(fixture, "styles.css"), "body{font:18px sans-serif;margin:0}main{padding:4rem}h1{font-size:3rem}");
  ({ server } = await startCopyEditor({ root: fixture, port: 0, quiet: true }));
  const port = server.address().port;

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto(`http://127.0.0.1:${port}/?copy-edit=1`, { waitUntil: "domcontentloaded" });

  if (!(await page.locator(".copy-editor-toolbar").isVisible())) throw new Error("Editor toolbar is not visible");
  const editableCount = await page.locator("[data-copy-id]").count();
  if (editableCount !== 7) throw new Error(`Expected 7 editable text runs, got ${editableCount}`);

  const heading = page.locator("h1 [data-copy-id]").first();
  await heading.fill("A better headline");
  if (!(await page.locator(".copy-editor-status").textContent()).includes("1 unsaved change")) {
    throw new Error("Unsaved status did not update");
  }
  await page.locator(".copy-editor-save").click();
  await page.locator(".copy-editor-status").filter({ hasText: "Saved 1 change" }).waitFor();

  const saved = await readFile(join(fixture, "index.html"), "utf8");
  if (!saved.includes("<h1>A better headline <em>there</em>.</h1>")) throw new Error("Edited copy was not saved");
  if (!saved.includes('<a href="/details/">this link</a>')) throw new Error("Link markup changed during save");
  if (saved.includes("copy-editor")) throw new Error("Editor-only markup leaked into the source HTML");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  if (widths.page > widths.viewport + 1) throw new Error(`Mobile editor overflows (${widths.page} > ${widths.viewport})`);

  console.log("copy editor browser check PASS");
} finally {
  if (browser) await browser.close();
  if (server) await new Promise((resolveClose) => server.close(resolveClose));
  await rm(fixture, { recursive: true, force: true });
}

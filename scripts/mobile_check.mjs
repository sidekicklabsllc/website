// Render every page in a real browser at several widths and fail on layout defects
// that static checks cannot see. Serves the repo itself, so nothing needs to be running.
//
//   node scripts/mobile_check.mjs            chromium + webkit if installed
//   node scripts/mobile_check.mjs --engine chromium
//   node scripts/mobile_check.mjs --width 390
//
// Setup (once):  cd scripts && npm install && npx playwright install chromium webkit
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTHS = [320, 390, 768, 1280];
const SKIP_DIRS = new Set(["scripts", "docs", "node_modules", ".git", "images", "audio"]);
// Elements allowed to scroll sideways inside themselves; everything else must fit.
const SCROLLERS = [".table-scroll"];

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".webp": "image/webp", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".xml": "application/xml" };

async function pages(dir = ROOT, found = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) await pages(join(dir, e.name), found); }
    else if (e.name === "index.html" || (e.name.endsWith(".html") && dir === ROOT)) {
      const rel = relative(ROOT, join(dir, e.name));
      if (rel === "404.html") continue;
      const body = await readFile(join(dir, e.name), "utf8");
      if (/http-equiv="refresh"/i.test(body)) continue;           // redirect stubs render nothing
      found.push(rel === "index.html" ? "/" : "/" + rel.replace(/index\.html$/, ""));
    }
  }
  return found;
}

function serve() {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const file = join(ROOT, p);
    try {
      if ((await stat(file)).isDirectory()) throw new Error("dir");
      res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
      res.end(await readFile(file));
    } catch { res.writeHead(404).end("not found"); }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok({ server, port: server.address().port })));
}

const audit = (scrollers) => {
  const vw = document.documentElement.clientWidth;
  const out = { scrollW: document.documentElement.scrollWidth, vw, overflow: [], clipped: [] };
  const name = (el) => el.tagName.toLowerCase() +
    (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "") +
    (el.id ? "#" + el.id : "");
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) out.overflow.push(`${name(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
    // content wider than its box, and not something we deliberately let scroll
    if (el.scrollWidth > el.clientWidth + 1 && !scrollers.some((s) => el.matches(s) || el.closest(s))) {
      const tag = el.tagName.toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea")
        out.clipped.push(`${name(el)} value="${el.value}" box=${el.clientWidth} needs=${el.scrollWidth}`);
    }
  }
  return out;
};

const args = process.argv.slice(2);
const only = args.includes("--engine") ? args[args.indexOf("--engine") + 1] : null;
const widths = args.includes("--width") ? [Number(args[args.indexOf("--width") + 1])] : WIDTHS;

const { server, port } = await serve();
const urls = (await pages()).sort();
const fails = [];
let checked = 0;

const pw = await import("playwright");
const engines = [["chromium", pw.chromium], ["webkit", pw.webkit]].filter(([n]) => !only || n === only);

for (const [engName, engine] of engines) {
  let browser;
  try { browser = await engine.launch(); }
  catch { console.log(`skipping ${engName}: not installed (npx playwright install ${engName})`); continue; }
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    for (const u of urls) {
      await page.goto(`http://127.0.0.1:${port}${u}`, { waitUntil: "networkidle" });
      const r = await page.evaluate(audit, SCROLLERS);
      checked++;
      const where = `${engName} ${w}px ${u}`;
      if (r.scrollW > r.vw + 1) fails.push(`${where}: page scrolls sideways (${r.scrollW} > ${r.vw})`);
      for (const o of [...new Set(r.overflow)].slice(0, 5)) fails.push(`${where}: past viewport edge: ${o}`);
      for (const c of r.clipped) fails.push(`${where}: clipped field: ${c}`);
    }
    await page.close();
  }
  await browser.close();
}
server.close();

console.log(`rendered ${urls.length} pages x ${widths.length} widths x ${engines.length} engine(s) = ${checked} checks`);
for (const f of fails) console.log("FAIL", f);
console.log(fails.length ? `${fails.length} failures` : "PASS");
process.exit(fails.length ? 1 : 0);

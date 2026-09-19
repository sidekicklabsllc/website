#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, "..");
const SKIP_DIRS = new Set([".git", ".github", "node_modules", "scripts", "docs", "images", "audio"]);
const EDITABLE_ANCESTORS = new Set(["h1", "h2", "h3", "h4", "p", "li", "a", "button", "label", "th", "td", "figcaption"]);
const RAW_TEXT_TAGS = new Set(["script", "style", "textarea", "title", "svg", "noscript"]);
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function findTagEnd(html, start) {
  let quote = null;
  for (let i = start + 1; i < html.length; i += 1) {
    const char = html[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return i + 1;
    }
  }
  return html.length;
}

function openingTagName(tag) {
  const match = tag.match(/^<\s*([a-zA-Z][\w:-]*)/);
  return match ? match[1].toLowerCase() : null;
}

function closingTagName(tag) {
  const match = tag.match(/^<\s*\/\s*([a-zA-Z][\w:-]*)/);
  return match ? match[1].toLowerCase() : null;
}

function isEditableStack(stack) {
  if (stack.some((tag) => RAW_TEXT_TAGS.has(tag))) return false;
  return stack.some((tag) => EDITABLE_ANCESTORS.has(tag));
}

// Walk the source without reparsing or reformatting it. Each visible text run gets
// a stable c<number> id based on source order. start/end cover only the editable
// core, leaving indentation and surrounding tags untouched.
export function editableTextRuns(html) {
  const runs = [];
  const stack = [];
  let cursor = 0;
  let id = 0;

  while (cursor < html.length) {
    if (html[cursor] === "<") {
      if (html.startsWith("<!--", cursor)) {
        const end = html.indexOf("-->", cursor + 4);
        cursor = end === -1 ? html.length : end + 3;
        continue;
      }

      const end = findTagEnd(html, cursor);
      const tag = html.slice(cursor, end);
      const closeName = closingTagName(tag);
      if (closeName) {
        const last = stack.lastIndexOf(closeName);
        if (last !== -1) stack.splice(last);
        cursor = end;
        continue;
      }

      const openName = openingTagName(tag);
      if (openName && !VOID_TAGS.has(openName) && !/\/\s*>$/.test(tag)) {
        stack.push(openName);
        if (RAW_TEXT_TAGS.has(openName)) {
          const closeAt = html.toLowerCase().indexOf(`</${openName}`, end);
          cursor = closeAt === -1 ? html.length : closeAt;
          continue;
        }
      }
      cursor = end;
      continue;
    }

    const next = html.indexOf("<", cursor);
    const end = next === -1 ? html.length : next;
    const raw = html.slice(cursor, end);
    if (isEditableStack(stack) && raw.trim()) {
      const leading = raw.match(/^\s*/)?.[0].length ?? 0;
      const trailing = raw.match(/\s*$/)?.[0].length ?? 0;
      const coreEnd = end - trailing;
      runs.push({ id: `c${id}`, start: cursor + leading, end: coreEnd, raw: html.slice(cursor + leading, coreEnd) });
      id += 1;
    }
    cursor = end;
  }
  return runs;
}

function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function versionOf(source) {
  return createHash("sha256").update(source).digest("hex").slice(0, 16);
}

export function instrumentHtml(source, config) {
  const runs = editableTextRuns(source);
  let html = source;
  for (const run of [...runs].reverse()) {
    const wrapped = `<span class="copy-editor-text" data-copy-id="${run.id}">${run.raw}</span>`;
    html = html.slice(0, run.start) + wrapped + html.slice(run.end);
  }
  const settings = `<script>window.__COPY_EDITOR_CONFIG__=${JSON.stringify(config).replaceAll("<", "\\u003c")};</script>`;
  html = html.replace(/<\/head>/i, `<link rel="stylesheet" href="/__copy_editor/editor.css">${settings}</head>`);
  html = html.replace(/<\/body>/i, `<script src="/__copy_editor/editor.js"></script></body>`);
  return html;
}

export function applyTextEdits(source, edits) {
  const byId = new Map(edits.map((edit) => [edit.id, edit.text]));
  const runs = editableTextRuns(source);
  const known = new Set(runs.map((run) => run.id));
  for (const id of byId.keys()) {
    if (!known.has(id)) throw new Error(`Unknown copy id: ${id}`);
  }
  let updated = source;
  for (const run of [...runs].reverse()) {
    if (!byId.has(run.id)) continue;
    const replacement = escapeHtml(String(byId.get(run.id)).replaceAll("\r\n", "\n"));
    updated = updated.slice(0, run.start) + replacement + updated.slice(run.end);
  }
  return updated;
}

async function discoverPages(root, dir = root, pages = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await discoverPages(root, join(dir, entry.name), pages);
      continue;
    }
    if (entry.name !== "index.html" && !(dir === root && entry.name.endsWith(".html"))) continue;
    const file = join(dir, entry.name);
    const rel = relative(root, file);
    const path = rel === "index.html" ? "/" : entry.name === "index.html" ? `/${relative(root, dir).split(sep).join("/")}/` : `/${rel}`;
    const source = await readFile(file, "utf8");
    const title = source.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || path;
    pages.push({ path, title, file });
  }
  return pages;
}

function safeAssetPath(root, pathname) {
  const candidate = resolve(root, `.${decodeURIComponent(pathname)}`);
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null;
}

function respond(res, status, body, type = "text/plain; charset=utf-8", extra = {}) {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", ...extra });
  res.end(body);
}

function readJson(req, limit = 1_000_000) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > limit) reject(new Error("Request is too large"));
    });
    req.on("end", () => {
      try { resolveBody(JSON.parse(body)); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

export async function startCopyEditor({ root = DEFAULT_ROOT, port = 8765, host = "127.0.0.1", quiet = false } = {}) {
  root = resolve(root);
  const pages = (await discoverPages(root)).sort((a, b) => a.path.localeCompare(b.path));
  const pageByPath = new Map(pages.map((page) => [page.path, page]));

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${host}`);

      if (url.pathname === "/__copy_editor/") {
        res.writeHead(302, { Location: "/?copy-edit=1" });
        res.end();
        return;
      }
      if (url.pathname === "/__copy_editor/editor.css" || url.pathname === "/__copy_editor/editor.js") {
        const name = url.pathname.endsWith(".css") ? "copy-editor.css" : "copy-editor-client.js";
        const body = await readFile(join(SCRIPT_DIR, name));
        respond(res, 200, body, MIME[extname(name)]);
        return;
      }
      if (url.pathname === "/__copy_editor/save" && req.method === "POST") {
        const payload = await readJson(req);
        const page = pageByPath.get(payload.page);
        if (!page) return respond(res, 400, JSON.stringify({ error: "Unknown page" }), MIME[".json"]);
        if (!Array.isArray(payload.edits) || payload.edits.length > 500) {
          return respond(res, 400, JSON.stringify({ error: "Invalid edits" }), MIME[".json"]);
        }
        for (const edit of payload.edits) {
          if (!/^c\d+$/.test(edit?.id) || typeof edit?.text !== "string" || edit.text.length > 20_000) {
            return respond(res, 400, JSON.stringify({ error: "Invalid edit" }), MIME[".json"]);
          }
        }
        const source = await readFile(page.file, "utf8");
        if (payload.version !== versionOf(source)) {
          return respond(res, 409, JSON.stringify({ error: "This file changed after you opened it. Reload before saving." }), MIME[".json"]);
        }
        const updated = applyTextEdits(source, payload.edits);
        const temp = `${page.file}.copy-editor-${process.pid}.tmp`;
        await writeFile(temp, updated, "utf8");
        await rename(temp, page.file);
        return respond(res, 200, JSON.stringify({ ok: true, version: versionOf(updated), count: payload.edits.length }), MIME[".json"]);
      }

      let requestedPath = url.pathname;
      if (requestedPath.endsWith("/")) requestedPath += "index.html";
      const file = safeAssetPath(root, requestedPath);
      if (!file) return respond(res, 403, "Forbidden");
      try {
        if (!(await stat(file)).isFile()) return respond(res, 404, "Not found");
      } catch {
        return respond(res, 404, "Not found");
      }
      let body = await readFile(file);
      if (extname(file) === ".html" && url.searchParams.get("copy-edit") === "1") {
        const pagePath = relative(root, file) === "index.html" ? "/" : file.endsWith(`${sep}index.html`) ? `/${relative(root, dirname(file)).split(sep).join("/")}/` : `/${relative(root, file).split(sep).join("/")}`;
        const page = pageByPath.get(pagePath);
        if (!page) return respond(res, 404, "This page is not available in the copy editor.");
        const source = body.toString("utf8");
        body = instrumentHtml(source, {
          page: page.path,
          version: versionOf(source),
          pages: pages.map(({ path, title }) => ({ path, title })),
        });
      }
      respond(res, 200, body, MIME[extname(file)] || "application/octet-stream");
    } catch (error) {
      respond(res, 500, JSON.stringify({ error: error.message }), MIME[".json"]);
    }
  });

  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolveListen);
  });
  const address = server.address();
  const actualPort = typeof address === "object" ? address.port : port;
  if (!quiet) {
    console.log(`Samantha copy editor: http://${host}:${actualPort}/__copy_editor/`);
    console.log("Press Ctrl+C to stop. Changes are saved directly to the HTML files.");
  }
  return { server, port: actualPort, pages };
}

async function selfTest() {
  const sample = `<!doctype html><html><head><title>Test</title></head><body><h1>Hello <em>there</em>.</h1><script>const x = "<p>no</p>";</script><p>Keep <a href="/">this link</a>.</p></body></html>`;
  const runs = editableTextRuns(sample);
  if (runs.length !== 6) throw new Error(`Expected 6 editable runs, got ${runs.length}`);
  const changed = applyTextEdits(sample, [{ id: "c0", text: "Hello & welcome" }, { id: "c5", text: "!" }]);
  if (!changed.includes("Hello &amp; welcome <em>there</em>")) throw new Error("Inline markup was not preserved");
  if (!changed.includes("</a>!</p>")) throw new Error("Trailing copy was not updated");
  if (!instrumentHtml(sample, { page: "/", version: "x", pages: [] }).includes("data-copy-id=\"c0\"")) throw new Error("Instrumentation failed");
  console.log("copy editor self-test PASS");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--self-test")) {
    await selfTest();
  } else {
    const portArg = process.argv.indexOf("--port");
    const port = portArg === -1 ? 8765 : Number(process.argv[portArg + 1]);
    await startCopyEditor({ port });
  }
}

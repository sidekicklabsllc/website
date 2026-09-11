#!/usr/bin/env python3
"""Local SEO audit of every HTML page in the repo. Exit 1 on any failure.

Checks: exactly one <h1>; <title> present and <= 60 chars; meta description present and <= 155;
canonical present and self-referencing; viewport meta present; every <img> has alt; no internal
link or asset points at a missing file; no link uses index.html or a relative path; JSON-LD parses.
Run from the repo root:  python3 scripts/audit.py
"""
import json, pathlib, re, sys
from html.parser import HTMLParser

BASE = "https://www.samantha-medical.com"
ROOT = pathlib.Path(__file__).resolve().parent.parent
NOINDEX_OK = {"404.html"}

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.h1 = 0; self.title = None; self.desc = None; self.canon = None
        self.viewport = False; self.imgs_no_alt = 0; self.links = []; self.jsonld = []; self._t = None; self._in_title = False; self._ld = False
    def handle_starttag(self, t, a):
        a = dict(a)
        if t == "h1": self.h1 += 1
        if t == "title": self._in_title = True; self.title = ""
        if t == "meta" and a.get("name") == "description": self.desc = a.get("content", "")
        if t == "meta" and a.get("name") == "viewport": self.viewport = True
        if t == "link" and a.get("rel") == "canonical": self.canon = a.get("href")
        if t == "img" and not a.get("alt", "").strip() and a.get("alt") is None: self.imgs_no_alt += 1
        if t == "script" and a.get("type") == "application/ld+json": self._ld = True; self.jsonld.append("")
        for k in ("href", "src"):
            if k in a: self.links.append(a[k])
    def handle_endtag(self, t):
        if t == "title": self._in_title = False
        if t == "script": self._ld = False
    def handle_data(self, d):
        if self._in_title: self.title += d
        if self._ld: self.jsonld[-1] += d

def url_of(rel: pathlib.Path) -> str:
    return "/" if rel.parent == pathlib.Path(".") and rel.name == "index.html" else f"/{rel.parent.as_posix()}/" if rel.name == "index.html" else f"/{rel.as_posix()}"

def main():
    fails = []
    files = [f for f in ROOT.rglob("*.html") if f.relative_to(ROOT).parts[0] not in ("scripts", "docs", "node_modules", ".git")]
    for f in sorted(files):
        rel = f.relative_to(ROOT); p = P(); p.feed(f.read_text()); tag = str(rel)
        def bad(msg): fails.append(f"{tag}: {msg}")
        if p.h1 != 1: bad(f"{p.h1} <h1> tags")
        if not p.title: bad("missing <title>")
        elif len(p.title) > 60: bad(f"title is {len(p.title)} chars (>60)")
        if not p.viewport: bad("missing viewport meta")
        if p.imgs_no_alt: bad(f"{p.imgs_no_alt} <img> without alt")
        if rel.name not in NOINDEX_OK:
            if not p.desc: bad("missing meta description")
            elif len(p.desc) > 155: bad(f"description is {len(p.desc)} chars (>155)")
            want = BASE + url_of(rel)
            if p.canon != want: bad(f"canonical is {p.canon!r}, expected {want!r}")
        for ld in p.jsonld:
            try: json.loads(ld)
            except Exception as e: bad(f"JSON-LD does not parse: {e}")
        for u in p.links:
            if u.startswith(("http:", "https:", "mailto:", "tel:", "data:", "#")): continue
            u = u.split("#")[0].split("?")[0]
            if not u: continue
            if "index.html" in u: bad(f"link uses index.html: {u}")
            if not u.startswith("/"): bad(f"relative link: {u}"); continue
            target = ROOT / u.lstrip("/")
            if u.endswith("/"): target = target / "index.html"
            if not target.is_file(): bad(f"broken link: {u}")
    print(f"audited {len(files)} pages")
    for x in fails: print("FAIL", x)
    print("PASS" if not fails else f"{len(fails)} failures")
    return 1 if fails else 0

if __name__ == "__main__":
    sys.exit(main())

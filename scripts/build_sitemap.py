#!/usr/bin/env python3
"""Regenerate sitemap.xml from the files on disk.

Every index.html (except 404.html and anything under scripts/ or docs/) becomes one <url>.
<lastmod> is the date of the last git commit that touched the file, or today if uncommitted.
Run from the repo root after adding or editing pages:  python3 scripts/build_sitemap.py
"""
import datetime, pathlib, subprocess, sys

BASE = "https://www.samantha-medical.com"
ROOT = pathlib.Path(__file__).resolve().parent.parent
RULES = {  # path prefix -> (changefreq, priority); first match wins
    "/": ("monthly", "1.0"),
    "/answering-service-cost-calculator/": ("monthly", "0.8"),
    "/privacy-policy/": ("yearly", "0.3"),
    "/terms-and-conditions/": ("yearly", "0.3"),
    "/sms/": ("yearly", "0.3"),
}
DEFAULT = ("monthly", "0.6")
SKIP = {"404.html"}

def lastmod(path: pathlib.Path) -> str:
    out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(path)], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(["git", "status", "--porcelain", "--", str(path)], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return datetime.date.today().isoformat() if (dirty or not out) else out

def pages():
    for f in sorted(ROOT.rglob("index.html"), key=lambda p: (p.parent != ROOT, str(p))):
        rel = f.relative_to(ROOT)
        if rel.parts[0] in ("scripts", "docs", "node_modules", ".git") or rel.name in SKIP:
            continue
        if 'name="robots" content="noindex' in f.read_text():
            continue  # unpublished page: reachable by URL, not listed
        url = "/" if rel.parent == pathlib.Path(".") else f"/{rel.parent.as_posix()}/"
        yield url, f

def main():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    n = 0
    for url, f in pages():
        freq, prio = RULES.get(url, DEFAULT)
        lines += ["  <url>", f"    <loc>{BASE}{url}</loc>", f"    <lastmod>{lastmod(f)}</lastmod>",
                  f"    <changefreq>{freq}</changefreq>", f"    <priority>{prio}</priority>", "  </url>"]
        n += 1
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n")
    print(f"sitemap.xml: {n} urls")
    return 0

if __name__ == "__main__":
    sys.exit(main())

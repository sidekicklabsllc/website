#!/usr/bin/env python3
"""Submit URLs to IndexNow (Bing, Yandex, DuckDuckGo, Naver, Seznam share the index).

Google does not accept IndexNow and its Indexing API is limited to JobPosting and BroadcastEvent
pages, so for Google use Search Console: submit sitemap.xml once and request indexing for
individual URLs from the URL Inspection tool.

Setup (once):
  1. python3 scripts/indexnow.py --init     writes <key>.txt at the site root and prints the key
  2. commit and deploy so https://www.samantha-medical.com/<key>.txt is live
Usage:
  python3 scripts/indexnow.py                  submits every URL in sitemap.xml
  python3 scripts/indexnow.py /path/ /other/   submits just those paths
Stdlib only. Free, no account needed.
"""
import json, pathlib, re, secrets, sys, urllib.request

HOST = "www.samantha-medical.com"
ROOT = pathlib.Path(__file__).resolve().parent.parent
ENDPOINT = "https://api.indexnow.org/indexnow"

def key_file():
    keys = [p for p in ROOT.glob("*.txt") if re.fullmatch(r"[a-f0-9]{32}\.txt", p.name)]
    return keys[0] if keys else None

def main(argv):
    if argv[:1] == ["--init"]:
        if key_file(): print("key already exists:", key_file().name); return 0
        k = secrets.token_hex(16); (ROOT / f"{k}.txt").write_text(k); print("wrote", f"{k}.txt", "- commit and deploy it, then run again"); return 0
    kf = key_file()
    if not kf: print("no key file; run with --init first"); return 1
    key = kf.read_text().strip()
    if argv: urls = [f"https://{HOST}{p if p.startswith('/') else '/' + p}" for p in argv]
    else: urls = re.findall(r"<loc>(.*?)</loc>", (ROOT / "sitemap.xml").read_text())
    body = json.dumps({"host": HOST, "key": key, "keyLocation": f"https://{HOST}/{kf.name}", "urlList": urls}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req) as r: print("IndexNow", r.status, "for", len(urls), "urls")
    except urllib.error.HTTPError as e:
        print("IndexNow error", e.code, e.read().decode()[:300]); return 1
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

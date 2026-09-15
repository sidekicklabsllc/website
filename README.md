# Samantha public website

A dependency-free static site: the marketing landing page plus the compliance pages Twilio requires for SMS campaign verification (toll-free / A2P 10DLC).

## Pages

- `index.html` - landing page.
- `privacy-policy/index.html` - Privacy Policy (data collected, how it is used, no third-party sharing or marketing).
- `terms-and-conditions/index.html` - Terms and Conditions, including the **Samantha Practice Notifications** SMS program terms (program name, description, message/data rates, message frequency, support contact, and bold HELP/STOP opt-out instructions).

## Design

Matches the console's look and feel (warm sand background, rose/coral accent, white rounded cards) with a "Her"-inspired breathing coral orb and voice waveform.
Fonts: Fraunces (headings) + Inter (body) via Google Fonts; everything else is plain HTML/CSS with no build step.

## Preview locally

```bash
python3 -m http.server 8765            # from the repo root
# then open http://127.0.0.1:8765
```

## Checks before you push

Two gates. Both exit non-zero on failure.

```bash
python3 scripts/audit.py            # titles, descriptions, canonicals, links, JSON-LD
node scripts/mobile_check.mjs       # renders every page in a real browser
```

`audit.py` needs nothing. `mobile_check.mjs` needs a one-time setup:

```bash
(cd scripts && npm install && npx playwright install chromium webkit)
```

It serves the repo on a random port, loads every page at 320, 390, 768 and 1280px
in Chromium and WebKit, and fails if anything crosses the viewport edge, if a page
scrolls sideways, or if an input is too narrow to show its own value. That last
check exists because a clipped input shipped: labels and fields were both flexible,
so long labels squeezed the value until `150` rendered as `15(`. Static checks and
the DOM tests all passed it; only a rendered browser caught it.

Elements that are meant to scroll sideways are listed in `SCROLLERS` in the script.
Redirect stubs and `404.html` are skipped.

Useful flags: `--engine chromium` to halve the runtime, `--width 390` for one size.

## Deploy

Host the `website/` folder on any static host (Vercel, Netlify, GitHub Pages, S3).
The policy pages are folders with `index.html`, so the clean URLs `/privacy-policy` and `/terms-and-conditions` work on every host with no rewrite rules.
Those are the URLs to paste into the Twilio campaign verification form.

Before going live, replace the support email (`info@samantha-medical.com`) with a dedicated support address if desired; it appears in the footer and on both policy pages.

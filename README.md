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

## Deploy

Host the `website/` folder on any static host (Vercel, Netlify, GitHub Pages, S3).
The policy pages are folders with `index.html`, so the clean URLs `/privacy-policy` and `/terms-and-conditions` work on every host with no rewrite rules.
Those are the URLs to paste into the Twilio campaign verification form.

Before going live, replace the support email (`info@samantha-medical.com`) with a dedicated support address if desired; it appears in the footer and on both policy pages.

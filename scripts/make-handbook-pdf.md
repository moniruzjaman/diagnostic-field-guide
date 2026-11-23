# Regenerating `handbook.pdf`

`handbook.pdf` is an A4, 30-page print snapshot of `handbook.html`. It is checked into the repo so users can download it directly, but it must be **regenerated from `handbook.html`** whenever captions, images, or layout change.

No headless browser (Puppeteer/Playwright/Chromium) is available in this repo, so generation is a manual one-time step.

## Steps

1. Open `handbook.html` in Chrome/Edge (or any Chromium-based browser) while online or with the PWA installed (all images precached by the service worker).
2. Open Print dialog (`Ctrl+P` / `Cmd+P`).
3. Destination: **Save as PDF**.
4. Paper size: **A4**.
5. Margins: **Custom** → 11 mm top, 10 mm left, 12 mm bottom, 10 mm right (matches the `@page` rule in `handbook.html`).
6. Options: enable **Background graphics** (so colors and badges print).
7. Save as `handbook.pdf` at the repo root.

## Verify

After regenerating, run `npm run validate:handbook` to confirm:
- `handbook.pdf` exists and is non-empty
- Every `` src in `handbook.html` has a matching file in `img/`
- No duplicate `<h4>` captions remain

## Automation note

When Puppeteer/Playwright is available, replace this doc with a script that:
1. Launches headless Chromium
2. Opens `file:///path/to/handbook.html`
3. Calls `window.print()` to PDF with the A4 + margin settings above
4. Writes `handbook.pdf`

## File sizes (reference)

- `handbook.pdf` ~2.3 MB (2.4 MB target) at v2.1.0
- `handbook.html` ~1.9 MB (mostly image `alt` text and duplicated captions)

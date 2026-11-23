# Changelog — উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড (বাংলা PWA ই-বুক)

Dates below are the Bangla edition release dates. The original book
(*Plantwise Diagnostic Field Guide*, CABI 2015, CC BY-NC) is unchanged.

## v2.0.0 — 2026-11-23

- 🧪 **Field Diagnostic Workbench** — a new Bangla-first, offline-capable guided case workflow linked from the ebook home and footer.
- 🧭 Structured crop/field profile, multi-select symptom and plant-part observations, field distribution, onset and environment.
- 🔎 Transparent matching across seven broad cause groups (pest/mite, fungal, bacterial, virus/phytoplasma-like symptoms, nutrition/soil chemistry, water/root, weather/abiotic). Each result shows selected evidence and a field verification prompt; scores are match counts, not probabilities or diagnoses.
- ✅ Field verification checklist, management notes, follow-up date, on-device case storage, JSON export and print/PDF.
- 📴 Service worker now precaches the workbench and assets; navigation fallback first checks the requested cached page so the workbench remains reachable offline after its first successful load.
- 🧪 Added Node reasoning tests and a GitHub Actions validation workflow.
- ⚖️ Explicit safety boundary: no definitive disease naming or pesticide prescription; verify in the field and follow current Bangladesh label/registration guidance.

## v1.9.0 — 2026-11-23

- 🖼 **Annex-5 photo dictionary completed** — all 108 placeholder captions
  ("পৃষ্ঠা ৯৩"…) replaced with real Bangla descriptions (pathogen/cause · crop ·
  diagnostic clue) sourced from the companion repo `diagnosis-assistant`
  (`PAGE_PATHOGEN_CATALOG`); `alt` texts upgraded too; the "binding not built
  yet" disclaimer removed.
- 🔎 **Companion branding in footer** — new card for **উদ্ভিদ গোয়েন্দা (Plant
  Detective)** → `https://cabi.krishiai.live` (exact live-site branding);
  joins the ড্যাশবোর্ড, CABI ফসল রোগ নিরূপক ও সহকারী and portfolio cards.
- 🧪 **Exam-prep completion** — new "রোগ ত্রিভুজ ও পরিবেশ বিশ্লেষণ" section in
  chapter 8 (disease triangle from the `cabi-diagnosis` training slides:
  পোষক × রোগজীবাণু × পরিবেশ, with a drill table); with ch8's existing 13
  sections and ch9's 7-day plan, the CABI Academy CPD material is now fully
  covered.
- 🏷 **Front/back matter completed** — Plantwise donor logos (Irish Aid,
  European Union) added to chapter 1's স্বীকৃতি; original back-cover photo added
  to the book-end. (Page-4 CC-BY-NC badge already existed; page-2 citrus image
  is decorative and skipped.)
- 🧹 28 duplicated "CABILine drawings…" credit tails removed from captions.
- 🖼 OG card refreshed for social previews (`?v=3`): bookmarks/feedback/caption
  hooks replace the stale ones; repo description + homepage + topics synced
  with `cabi-diagnosis`'s tags.
- Images verified against both companion repos: the 248 "missing" images are
  rotation/extraction duplicates — the guide's photo library is complete.

## v1.8.0 — 2026-11-23

- 🔖 **Chapter bookmarks** — star any chapter from the pill at its top; revisit
  from the new 🔖 topbar drawer with one-tap jump (expands + scrolls). Offline,
  stored in `localStorage` (`pwdfg.bookmarks.v1`).
- 📧 **Feedback reaches the author** — per-chapter "লেখককে পাঠান" button and a
  "লেখকে ইমেল করুন" button in settings open a pre-filled mail to
  **mithun.hstu@gmail.com** (rating, comment, app version included); the JSON
  export stays as a second channel. Dashboard footer got an email link too.
- 🔍 **Search-engine requirements completed** — added `robots.txt` and
  `sitemap.xml`; verified already-present essentials (Bangla `<html lang>`,
  descriptive `<title>`/meta description, canonical URL, Book JSON-LD
  structured data, Open Graph/Twitter cards, `og-image.jpg`, mobile-responsive
  PWA); `og-image.html` (design source) marked `noindex`.
- 🧹 Service-worker shell updated for the new `js/bookmarks.js` (cache bump).

## v1.7.2 — 2026-11-23

- 📊 Switched analytics to proper Google Analytics 4 (`G-1508H8ETJ5`) with
  `gtag('config', …)` page-view on both served pages; cross-origin GA traffic
  documented as SW-bypassed.

## v1.7.1 — 2026-11-23

- 📊 Google Tag Manager snippet (`GTM-PRGSHS9F`) on index + dashboard
  (superseded by GA4 in v1.7.2).

## v1.7.0 — 2026-11-23

- 🧭 Field Dashboard companion tool — book's tables 1–5 become interactive
  (`dashboard.html`): symptom→cause ranking, pest-mite atlas with shape filter,
  12 nutrient-deficiency indexes, field tests, confusion pairs, case-note log
  with CSV export; deep links from hero banner, search and chapter 9 toolbox.

## v1.6.1 — 2026-11-23

- 🖼 Click-compelling OG card (phone mock of live search results) + hooks update.

## v1.6.0 — 2026-11-23

- 🔍 Full-book search with exact navigation + mastering-tips chapter (ch9).

## v1.5.0 — 2026-11-23

- 📝 Chapter-wise user notes & feedback (offline, localStorage, JSON export).

## v1.4.0 — 2026-11-23

- 🦶 Companion-tool & author footer, branded OG image refresh, mobile overflow clamp.

## v1.3.0 — 2026-11-23

- 🎓 Exam-prep chapter (CABI Academy CPD) + Annex-5 photo grid + TOC anchor fixes.

## v1.2.0 — 2026-11-23

- 🔊 Professional-grade audio-visual understanding (read-along highlighting,
  tap-a-line TTS, lightbox zoom).

## v1.1.0 — 2026-11-23

- 🇧🇩 Bangladesh official palette + authentic Plantwise branding + collapsible chapters.

## v1.0.0 — 2026-11-23

- 📕 Initial release: complete Bangla translation as an installable offline PWA.

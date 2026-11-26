# Changelog — উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড (বাংলা PWA ই-বুক)

Dates below are the Bangla edition release dates. The original book
(*Plantwise Diagnostic Field Guide*, CABI 2015, CC BY-NC) is unchanged.

## v2.1.8 — 2026-11-26

**উইজার্ডে অফলাইন ছবি-প্রমাণ পিকার + ঐচ্ছিক অনলাইন হ্যান্ড-অফ:**

- 🖼 **অফলাইন ইমেজ পিকার** (`js/image-picker.js`) — ক্যামেরা/গ্যালারি (`capture="environment"`), ড্র্যাগ-অ্যান্ড-ড্রপ ও কীবোর্ড-অ্যাক্সেসিবল ড্রপ-জোন; বান্ডল করা ৪টি নমুনা গ্যালারি (sw.js-এ প্রিক্যাশ); ক্লায়েন্ট-সাইড ~৮০০px JPEG ডাউনস্কেল; **IndexedDB**-তে সংরক্ষণ (localStorage নয় — কোটা এড়াতে); কোনো `fetch`/সার্ভার/AI কল নেই
- 🧭 **উইজার্ড ইন্টিগ্রেশন** — `diagnosis-wizard.html`-এর লক্ষণ-ধাপে "ছবি যোগ করুন (ঐচ্ছিক)" কার্ড (প্রিভিউ/বদলান/সরান); নতুন কেসে ছবি মুছে যায়; শেয়ার-রিপোর্টে ছবি সংযুক্ত থাকলে উল্লেখ
- 🔗 **ঐচ্ছিক অনলাইন হ্যান্ড-অফ** — একই কার্ডে দুটি লিঙ্ক (`cabi.krishiai.live`, `diagnosis-assistant`) নতুন ট্যাবে `rel="noopener noreferrer"`-এ; কোনো iframe/শেয়ার্ড কোড নেই — ই-বুকে শূন্য লোড, ছবি/কেস স্বয়ংক্রিয়ভাবে পাঠানো হয় না
- ✅ **টেস্ট ও CI** — `tests/ui-regressions.test.cjs`-এ পিকারের অফলাইন-নিরাপত্তা ও হ্যান্ড-অফ নিয়ম যোগ; CI workflow-এ `node --check js/image-picker.js` + sw.js রেজিস্ট্রেশন যাচাই; সংস্করণ v2.1.8

## v2.1.5 — 2026-11-23

**v2.1.1–v2.1.4-এ যোগ হওয়া নতুন টুলগুলির ব্যর্থতা ও ভাষা-সংক্রান্ত সমস্যা সংশোধন:**

- 🧭 **উইজার্ড "শুরু করুন" মারা যাওয়া** — `js/voice-glossary.js`-এ ভাঙা কোয়োট পুরো ফাইল পার্স ভেঙে দিচ্ছিল এবং `showStep`-এ বন্ধনী-ত্রুটির কারণে চারটি রেন্ডার-ফাংশন ভুল scope-এ চলে যাচ্ছিল — দুটোই ঠিক; init-এ defensive try/catch + `voice-input.js` লোড মিসিং সমস্যা সমাধান
- 🖼 **ছবি-গ্যালারি না খোলা** — symptom-matcher-এ `capture="environment"` অ্যাট্রিবিউট গ্যালারির বদলে সরাসরি ক্যামেরা খুলছিল + label-এ ডাবল-ট্রিগার; এখন গ্যালারি ও ক্যামেরা আলাদা পথে খোলে। হ্যান্ডবুকের ভাঙা মার্কআপ (কার্ড-র‍্যাপার মুছে যাওয়া, লাইটবক্স ক্র্যাশ) পুনর্নির্মিত — ১০৮ কার্ড + লাইটবক্স + PDF লিঙ্ক অক্ষত
- 🌐 **মিশ্র-লিপির mojibake পরিষ্কার** — জাপানি/হিন্দি/চিনা/রুশ/পোলিশ/স্প্যানিশ শব্দ মিশে থাকা বাংলা টেক্সট: উইজার্ড, ম্যাচার, cause-database, গ্লসারি, এক্সটেনশন-ডিরেক্টরি (গাজীপুর/বরিশাল প্রভৃতি নাম, দেবনাগরী অঙ্ক), আপডেট-ব্যানার, অনবোর্ডিং টেক্সট
- 📣 **আপডেট-ব্যানার কাজ করছে** — বাটন-হ্যান্ডলার ব্যানার তৈরির আগেই bind হচ্ছিল (কাজ করত না), "পরে করুন" এখন সংস্করণ মনে রাখে; sw.js-এ SKIP_WAITING যোগ — "আপডেট করুন" সত্যিই আপডেট করে
- 🗂 **বিশেষজ্ঞ ডিরেক্টরি সংশোধন** — ভুল শব্দ (দর্শনিক→ঢাকা সদর), ভুল বিভাগে বরিশাল, ভান্তি "Gaziali" এন্ট্রি বাদ; নম্বর নমুনা হিসেবে স্পষ্ট সতর্কতা যোগ
- 📄 README-তে নতুন টুল দুটির বর্ণনা, sitemap-এ দুই পেজ, সংস্করণ v2.1.5

## v2.1.4 — 2026-11-23

**নতুন টুল (Phase 1–4):**

- 🧭 গাইডেড রোগনির্ণয় উইজার্ড (`diagnosis-wizard.html`) — ফসল → লক্ষণ → বিস্তার → সম্ভাব্য কারণ
- 🖼 উপসর্গ ম্যাচার (`symptom-matcher.html`) — ছবি তুলে রেফারেন্স ছবির সাথে স্লাইডার-তুলনা
- 🎙 বাংলা ভয়েস-ইনপুট ও শব্দ-গ্লসারি (`js/voice-input.js`, `js/voice-glossary.js`)
- 📇 কৃষি সম্প্রসারণ বিশেষজ্ঞ ডিরেক্টরি (`js/extension-directory.json`)

## v2.1.0 — 2026-11-23

- 📖 **অধ্যায় ৭ → ভিজ্যুয়াল হ্যান্ডবুক** — পরিশিষ্ট-৫-এর ১০৮টি উপসর্গের ছবি এখন একটি স্বতন্ত্র পাতায় (`handbook.html`):
  কারণগোষ্ঠী অনুযায়ী ৮টি অনুচ্ছেদ (ছত্রাক ৪৩, পুষ্টি ঘাটতি ১৮, ব্যাকটেরিয়া ১২, ভাইরাস ১০, মাইট ৯, পোকামাকড় ৮,
  ফাইটোপ্লাজমা ৪, ভৌতিক ও হার্বিসাইড ৪), ফিল্টার চিপ, ট্যাপ-জুম লাইটবক্স, প্রতিটি ছবিতে বাংলা ক্যাপশন + পৃষ্ঠা-ব্যাজ +
  পাঠকে অ্যাঙ্কর-লিঙ্ক; শ্রেণিবিন্যাস v2.0.3-এর যাচাইকৃত সারণি-৩ গ্যালারি লেবেল পুনর্ব্যবহার করে — ১০০% কভারেজ
- ⬇ **PDF ডাউনলোড** — A4, ৩০ পৃষ্ঠা, বাংলা ওয়েবফন্ট ও ছবিসহ (`handbook.pdf`, ~২.৪MB);
  পাঠকের পরিশিষ্ট-৫ ব্যানার, টপবার আইকন ও ড্যাশবোর্ড হিরো বোতাম থেকে পৌঁছানো যায়; 🖨 প্রিন্ট বোতামও যোগ
- 📴 `handbook.html` SW শেলে প্রিক্যাশ; সংস্করণ v2.1.0; sitemap/README/CHANGELOG আপডেট

## v2.0.3 — 2026-11-23

- 🖼 **সারণি ৩: প্রতিটি কারণগোষ্ঠীর সম্পূর্ণ ছবিগ্যালারি** — বইয়ের ছবি-শব্দকোষের যাচাইকৃত
  বাংলা ক্যাপশনের নিজস্ব ট্যাগ অনুসারে (ছত্রাকজনিত, ভাইরাসজনিত, ব্যাকটেরিয়াজনিত,
  মাকড়/হরমোন, অজৈব, নেমাটোড/ব্যাকটেরিয়া ইত্যাদি) ২১৮ ভুক্তি / ১৮৬টি অনন্য ছবি বাছাই:
  ছত্রাক ৪৮, পুষ্টি ৫৮, ভাইরাস ২৫, ব্যাকটেরিয়া ২৫, মাইট ১৬, ভৌতিক ১৬, পোকা ১১,
  জল-ছত্রাক ৬, ফাইটোপ্লাজমা ৬, নেমাটোড ৭ — পাতা, কাণ্ড, শিকড়, ফল-ফুল ও গাছ সব অংশ
- 🖼 **কোষ বিশ্লেষণ = ছবি + গ্যালারি** — হিরো ছবিটি নির্বাচিত উপসর্গের ক্যাপশন-কীওয়ার্ডে
  মিলিয়ে বাছাই (যেমন উইল্ট→ফিউজেরিয়াম/ভার্টিসিলিয়ামের নালীর দাগ), নিচে অনুভূমিক
  গ্যালারি স্ট্রিপে ওই গোষ্ঠীর **সব ছবি**, প্রতিটিতে বাংলা ক্যাপশন ও পৃষ্ঠা-ব্যাজ
- 🔗 **প্রতিটি ছবি → বইয়ের পৃষ্ঠা** — ১৬০টি ফিগারে অ্যাঙ্কর (`index.html#fig-…`) যোগ করা হয়েছে;
  ছবিতে চাপ দিলে ই-বুক খুলে সেই ছবিতেই গিয়ে থামে — ভাঁজ করা অধ্যায় থাকলে স্বয়ংক্রিয়ভাবে
  খুলে নেয় (reader.js deep-link স্ক্রল এখন instant + centered + দু'বার)
- 📴 **১৮৬টি ছবি (~২.৩MB) SW শেলে প্রিক্যাশ** — গ্যালারি সম্পূর্ণ অফলাইনেও চলে; সব ছবি
  lazy-loaded, মোবাইলে ছোট থাম্ব
- ✅ টেস্ট বাড়ানো হয়েছে: গ্যালারি গণনা=ডেটা, href ফরম্যাট, content.js অ্যাঙ্কর, SW প্রিক্যাশ,
  mammals-ফলব্যাক, ক্লিক-থ্রু যাচাই (ফিগার ভিউপোর্টে); সব স্যুট পাস

## v2.0.2 — 2026-11-23

- 🖼 **সারণি ৩-এ প্রতিটি কারণগোষ্ঠীর ছবি** — ম্যাট্রিক্সের কলাম-হেডারে ১১টি গোলাকার থাম্বনেইল,
  কোষ-বিশ্লেষণ বক্সে (inspector) বাছাই করা কারণগোষ্ঠীর প্রতিনিধি ছবি + বাংলা ক্যাপশন ও CABI
  ক্রেডিট, এবং "কারণগোষ্ঠী ওভারল্যাপ" চার্টের প্রতিটি সারিতে মিনি-থাম্ব — ছবি দেখেই বোঝা
  যায় কোন কারণগোষ্ঠী কেমন দেখায়
- 🐾 **সৎ ফলব্যাক** — বইয়ে স্তন্যপায়ী ও পাখির নমুনা ছবি নেই, তাই সেই গোষ্ঠীতে ড্যাশড
  ফলব্যাক চিপ ("মাঠে ক্ষতস্থান সরাসরি পরীক্ষা করুন"); ভুল ছবি ব্যবহার করা হয়নি
- 🖼 ১০টি ছবি বইয়ের ছবি-শব্দকোষ থেকে alt-ক্যাপশন যাচাই করে বাছাই (রাস্ট=ছত্রাক, লেট
  ব্লাইট=জল-ছত্রাক, ফায়ার ব্লাইট=ব্যাকটেরিয়া, কাসাভা মোজাইক=ভাইরাস, নট নেমাটোড,
  কলা বিটল, মাইট-ঝাড়ু, N-ঘাটতি, হার্বিসাইড-দগ্ধ); SW শেলে প্রিক্যাশ (~১১৭KB) — অফলাইনেও
  ছবি নিশ্চিত; সব ছবি lazy-loaded, responsive (mobile: ফুল-প্রোয়াডথ ফিগার)

## v2.0.1 — 2026-11-23

- 📲 **Direct-install button (offline)** — hero button ("অ্যাপ ইনস্টল করুন") and a new
  topbar download icon trigger the native install prompt (`beforeinstallprompt` →
  `prompt()`); success toast "✓ অ্যাপ ইনস্টল হয়েছে — এখন ইন্টারনেট ছাড়াই পুরো বই চলবে";
  buttons auto-hide in installed/standalone mode (`appinstalled` handled too).
- 🍎 **iOS fallback** — on iPhone/iPad (no install-prompt event) the button opens a
  Bangla Add-to-Home-Screen guide (Share ⬆️ → "Add to Home Screen"), dismissable.
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

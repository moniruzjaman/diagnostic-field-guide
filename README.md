# উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড — বাংলা PWA ই-বুক

**Plantwise Diagnostic Field Guide (Bangla Edition)**

CABI **Plantwise Diagnostic Field Guide** (2015)-এর পূর্ণ বাংলা অনুবাদ, মোবাইল-প্রথম
প্রগ্রেসিভ ওয়েব অ্যাপ (PWA) হিসেবে — **সম্পূর্ণ অফলাইনে পড়া ও শোনা যায়**।

> ⚠️ **এই প্রকল্পটি শুধুমাত্র শিক্ষামূলক ও অশাবসায়িক উদ্দেশ্যে বিনামূল্যে ব্যবহারের জন্য।**
> বাণিজ্যিক ব্যবহার সম্পূর্ণ নিষিদ্ধ। সমস্ত স্বত্ব ও কৃতিত্ব মূল সংগঠন **CABI / Plantwise**-কে প্রদান করা হয়েছে —
> নিচের "ক্রেডিট ও লাইসেন্স" অংশ দেখুন।

## বৈশিষ্ট্য

- 📖 **পূর্ণ বই**: ৯টি অধ্যায় — ক্ষেত্র রোগনির্ণয়, তাৎক্ষণিক সূচি (সারণি ১–৫), ১০টি উপসর্গ গোষ্ঠী,
  বিভ্রান্তির উৎস (সারণি ৬), সুপারিশ প্রণয়ন (BIG ৫, IPM), পরিশিষ্ট ১–৫, পরীক্ষা-প্রস্তুতি ও
  'বইটি আয়ত্তে আনুন' (মাস্টারি প্ল্যান) অধ্যায়
- 🖼️ **২৬৫টি রোগনির্ণয়ের ছবি** (মূল PDF থেকে, ক্যাপশন ও ফটোগ্রাফার-ক্রেডিটসহ), ট্যাপে ফুলস্ক্রিন
- 📕 **মূল বইয়ের প্রচ্ছদ ও Plantwise ব্র্যান্ডিং** — প্রকাশক, ISBN ও 'LOSE LESS. FEED MORE.' স্লোগানসহ
- 🎧 **বাংলা TTS অডিও** — অধ্যায় শুনুন (Web Speech API, bn-BD ভয়েস)
- 📴 **অফলাইন PWA** — Service Worker সব কনটেন্ট precache করে; ইন্টারনেট ছাড়াই চলে
- 📲 **ইনস্টলেবল** — হোম স্ক্রিনে অ্যাপ হিসেবে যোগ করা যায়
- 🇧🇩 **বাংলাদেশের অফিসিয়াল রঙে ডিজাইন** (বোতল-সবুজ #006A4E, লাল #F42A41, সোনালি, সাদা)
- 📂 **ভাঁজযোগ্য অধ্যায়** — শিরোনামে ট্যাপ করে ভাঁজ/খোলা, অবস্থা মনে রাখা হয়
- 📝 **অধ্যায়-ভিত্তিক নোট ও মতামত** — প্রতিটি অধ্যায়ে ব্যক্তিগত নোট (অটো-সেভ) ও ৫-স্টার রেটিং,
  সূচিপত্রে নোট-ব্যাজ; সেটিংস থেকে JSON এক্সপোর্ট — সবই অফলাইনে (localStorage)
- 🔍 **পুরো বইয়ে খোঁজ** — অধ্যায়, সেকশন, ছবি (থাম্বনেইলসহ) ও লেখা খুঁজুন; ফলাফলে ট্যাপ করলে
  সরাসরি নির্দিষ্ট জায়গায় গিয়ে হাইলাইট হয় (কীবোর্ড: /) — বাংলা সংখ্যা-নিরপেক্ষ ম্যাচিং
- 🌗 ৩টি থিম (দিন/সেপিয়া/রাত), ফন্ট নিয়ন্ত্রণ, ফন্ট সাইজ ও লাইন-স্পেসিং
- 🔗 ৮ প্ল্যাটফর্মে শেয়ার

## ব্যবহার

প্রথমবার খুললে Service Worker অ্যাপ শেল ও বইয়ের পাঠ্য ক্যাশ করে। ছবি দেখা হলে ক্যাশ হয়;
বিদ্যমান idle image preloader-ও ছবিগুলো ধাপে ধাপে ক্যাশ করতে পারে। সম্পূর্ণ অফলাইনে যাওয়ার আগে
প্রথমবার অনলাইনে গাইড খুলে ছবি প্রিলোড সম্পন্ন হতে দিন। এরপর ক্যাশ হওয়া ছবি, পাঠ্য ও অধ্যায়
অফলাইনে পড়া যায়। বাংলা TTS ভয়েস ডিভাইস/ব্রাউজারভেদে ভিন্ন হতে পারে। ব্রাউজারের
"Add to Home Screen" দিয়ে অ্যাপ হিসেবে ইনস্টল করা যায়।

## KrishiAI ecosystem integration

- এই repo: অফলাইন বাংলা reference guide ও self-study resource।
- [CABI Diagnosis](https://github.com/moniruzjaman/cabi-diagnosis): operational diagnosis ও field identification workspace।
- [Diagnosis Assistant](https://github.com/moniruzjaman/diagnosis-assistant): guided visual training ও practice।

এই reader-এ operational diagnosis বা pesticide engine নকল করে যোগ করা হবে না। CABI/Plantwise
মূল বইয়ের অনুবাদ, ছবি ও ক্যাপশন অন্য অ্যাপে কপি করার আগে CC BY-NC শর্ত, attribution এবং
প্রয়োজনীয় অনুমতি যাচাই করতে হবে।

লোকাল টেস্ট:

```bash
python3 -m http.server 8080
# ব্রাউজারে: http://localhost:8080/
```

## ডিপ্লয় (GitHub Pages)

এই রিপো সরাসরি GitHub Pages থেকে পরিবেশন করা হয়:

```bash
git init
git add -A
git commit -m "Plantwise Diagnostic Field Guide — Bangla PWA ebook (educational, CC BY-NC)"
git branch -M main
git remote add origin https://github.com/moniruzjaman/diagnostic-field-guide.git
git push -u origin main
```

Pages চালু করতে: **GitHub → Settings → Pages → Branch: `main` / root → Save**.
লাইভ URL: `https://moniruzjaman.github.io/diagnostic-field-guide/`

## কাঠামো

```
index.html            অ্যাপ শেল + মেটাডেটা (OG/Twitter কার্ড)
css/reader.css        ৩ থিম, রেসপনসিভ, বাংলা টাইপোগ্রাফি
js/content.js         বইয়ের সম্পূর্ণ বাংলা কনটেন্ট (অটো-জেনারেটেড)
js/reader.js          রেন্ডার, TOC, সেটিংস, লাইটবক্স, PWA হুক
js/tts.js             বাংলা Text-to-Speech
js/share.js           ক্রস-প্ল্যাটফর্ম শেয়ার
sw.js                 অফলাইন Service Worker (shell + image precache)
manifest.webmanifest  PWA ম্যানিফেস্ট
fonts/                Noto Sans/Serif Bengali (woff2, লোকালি বান্ডেল)
img/                  মূল বইয়ের ২৬৫টি ছবি
icons/                PWA আইকন
og-image.jpg          সোশ্যাল শেয়ার প্রিভিউ (1200×630)
```

---

# Credits & Licence (English)

This repository is a **Bangla translation of the CABI Plantwise Diagnostic Field Guide**,
published here **free of charge, strictly for educational and non-commercial use**.
All rights, authorship and credit belong to the source organisation.

## Source work

| | |
|---|---|
| **Title** | Plantwise Diagnostic Field Guide — A tool to diagnose crop problems and make recommendations for their management |
| **Compiled by** | Phil Taylor |
| **Publisher** | CABI (CAB International), Nosworthy Way, Wallingford, Oxfordshire OX10 8DE, UK — on behalf of **Plantwise** |
| **Year / ISBN** | 2015 · ISBN-13: 978 1 78064 676 3 |
| **Websites** | [www.plantwise.org](https://www.plantwise.org) · [www.cabi.org](https://www.cabi.org) · plantwise@cabi.org |
| **Production editor** | Tracy Head, CABI |
| **Line drawings (Table 2)** | Robert Reeder, CABI |

## Licence

The original work is © **CAB International 2015**, made available under a
**Creative Commons Attribution-Noncommercial Licence (CC BY-NC)**:

> "Reproduction of this publication for educational or other non-commercial purposes is authorised
> without prior permission from the copyright holder provided the source is fully acknowledged.
> Reproduction for resale or other commercial purpose is prohibited without prior written permission
> from the copyright holder."

This translation and web adaptation is distributed under the same **CC BY-NC** terms, with full
attribution to CABI / Plantwise. **No commercial use. No resale.**

## Image credits

All photographs and illustrations in this ebook originate from the original publication and are
reproduced with their attributions attached to every image caption, in particular:

- **Robert Reeder, CABI** — diagnostic field photos & line drawings
- **Phil Taylor, CABI** — diagnostic field photos
- **Gerald Holmes, Valent USA Corporation, Bugwood.org**
- **Gerald Holmes, California Polytechnic State University at San Luis Obispo, Bugwood.org**
- **Scot Nelson, University of Hawaii**
- **Howard F. Schwartz, Colorado State University, Bugwood.org**
- **Central Science Laboratory, Harpenden Archive, British Crown, Bugwood.org**
- Plantwise knowledge bank, CABI

## Translation note

অনুবাদ শিক্ষামূলক উদ্দেশ্যে স্বয়ংক্রিয় মেশিন-অনুবাদ + সম্পাদনা করা হয়েছে। ফসল সুরক্ষা
সংক্রান্ত যেকোনো সুপারিশ প্রয়োগের আগে স্থানীয় কৃষি সম্প্রসারণ কর্মকর্তার পরামর্শ নিন;
আইনত নিষিদ্ধ পণ্যের তালিকা দেখুন পরিশিষ্ট ৩ (Plantwise Pesticide Red List)।

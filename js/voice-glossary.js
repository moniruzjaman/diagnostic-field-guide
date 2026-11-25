/* ============================================================
   Voice Glossary — Bengali audio explanations of technical terms
   Taps any symptom/technical word to hear its definition.
   Uses Web Speech Synthesis (same API as the reader's TTS).
   v2.1.4 fix: cleaned corrupted Bengali strings (mixed-script
   mojibake + unescaped quote broke the whole file), defined the
   $/$$ helpers locally, removed the stray full-sentence speak call.
   ============================================================ */

(function () {
  'use strict';

  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  // Map symptom ids + technical terms to their Bengali explanations
  const GLOSSARY = {
    spots:    'পাতায় গোল বা অনিয়মিত দাগ। ছত্রাক বা ব্যাকটেরিয়াজনিত রোগের সাধারণ লক্ষণ।',
    yellow:   'পাতা সময়ের আগে হলুদ হয়ে যাওয়া। পুষ্টির অভাব বা রোগের লক্ষণ হতে পারে।',
    wilting:  'গাছ বা পাতা ঝুলে ঢলে পড়া। শিকড় বা পানির সমস্যায় এমন হয়।',
    rot:      'পাতা, কাণ্ড বা ফল নরম হয়ে পচে যাওয়া।',
    mosaic:   'পাতায় হলুদ-সবুজ মিশ্র প্যাটার্ন। সাধারণত ভাইরাসজনিত লক্ষণ।',
    holes:    'পাতায় ছিদ্র — পোকা খেয়ে ফেলার চিহ্ন।',
    webbing:  'পাতায় মাকড়সার মতো সূক্ষ্ম জাল — মাইট বা ছোট পোকার চিহ্ন।',
    stunting: 'গাছের বৃদ্ধি বন্ধ বা স্বাভাবিকের চেয়ে ছোট হয়ে থাকা।',
    dieback:  'ডগা বা শাখার প্রান্ত থেকে শুকিয়ে যাওয়া।',
    ooze:     'ক্ষতস্থান থেকে আঠালো তরল বের হওয়া — ব্যাকটেরিয়াজনিত রোগের চিহ্ন।',
    powder:   'পাতার উপর সাদা গুঁড়ার মতো আস্তরণ — পাউডারি মিলডিউর লক্ষণ।',
    margin:   'পাতার কিনারা বাদামি বা কালো হয়ে পুড়ে যাওয়া।',
    curling:  'পাতা বেঁকে বা কুঁকড়ে যাওয়া। ভাইরাস বা পোকার আক্রমণে এমন হয়।',
    // Additional technical terms
    fusarium: 'ফিউজেরিয়াম — মাটির ছত্রাক; কাণ্ড চিরলে ভেতরে বাদামি বা গোলাপি দাগ দেখা যায়।',
    verticillium: 'ভার্টিসিলিয়াম — মাটির ছত্রাক; পরিবহন নালীতে কালচে দাগ তৈরি করে।',
    late_blight: 'লেট ব্লাইট — আলু ও টমেটোর মারাত্মক ছত্রাকজনিত রোগ; পাতায় জল-ভেজা দাগ ও সাদা আস্তরণ।',
    early_blight: 'আর্লি ব্লাইট — পাতায় কেন্দ্রে গুটি থাকা গোল বাদামি দাগ (টার্গেট স্পট)।',
    powdery_mildew: 'পাউডারি মিলডিউ — পাতার উপর সাদা গুঁড়ার মতো ছত্রাকের আস্তরণ।',
    downy_mildew: 'ডাউনি মিলডিউ — পাতার উপর হলুদ দাগ, পাতার নিচে সাদা-ধূসর ছত্রাকের স্তর।',
    phytophthora: 'ফাইটোফথোরা — পানি-প্রিয় ছত্রাকজনিত রোগকারক; শিকড় ও ফল পচায়।',
    aflatoxin: 'অ্যাফ্লাটক্সিন — দানা বা শিকড়ে ছত্রাকের বৃদ্ধি থেকে তৈরি বিষাক্ত পদার্থ।'
  };

  // Render a glossary button inside a given element
  function renderGlossaryButton(el, term) {
    const info = GLOSSARY[term] || '';
    if (!info || !el) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-glossary-btn';
    btn.dataset.term = term;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3a2 2 0 0 1 2 2h3a2 2 0 0 1 2 2v7"/><circle cx="10" cy="18" r="3"/><circle cx="20" cy="18" r="3"/></svg>';
    btn.title = 'লিখিত সংজ্ঞা শুনুন';
    btn.style.marginLeft = '8px';

    btn.addEventListener('click', () => {
      const msg = GLOSSARY[term] || '';
      if (msg && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = 'bn-BD';
        if (window.EBOOK_TTS && window.EBOOK_TTS.bnVoice) u.voice = window.EBOOK_TTS.bnVoice;
        u.rate = 0.9;
        u.pitch = 1.0;
        u.volume = 1.0;
        window.speechSynthesis.speak(u);
      }
    });

    el.appendChild(btn);
  }

  // Add glossary buttons to all symptom chips and result cards
  function init() {
    // symptom chips (matcher + wizard both use .symptom-chip[data-symptom])
    $$('.symptom-chip[data-symptom]').forEach((chip) => {
      const term = chip.dataset.symptom;
      if (GLOSSARY[term] && !chip.querySelector('.voice-glossary-btn')) {
        renderGlossaryButton(chip, term);
      }
    });

    // result cards (wizard step 5)
    $$('.cause-result').forEach((card) => {
      const term = card.dataset.cause;
      const holder = card.querySelector('.cause-name');
      if (GLOSSARY[term] && holder && !holder.querySelector('.voice-glossary-btn')) {
        renderGlossaryButton(holder, term);
      }
    });
  }

  window.VOICE_GLOSSARY = { init, GLOSSARY };
})();

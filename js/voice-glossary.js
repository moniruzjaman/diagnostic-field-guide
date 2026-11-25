/* ============================================================
   Voice Glossary — Bengali audio explanations of technical terms
   Taps any symptom/technical word to hear its definition.
   Uses Web Speech Synthesis (same API as existing TTS) but plays
   a single word/phrase instead of full chapter audio.
   ============================================================ */

(function () {
  'use strict';

  // Map symptom ids + technical terms to their Bengali explanations
  const GLOSSARY = {
    spots:    'পাতার উপর তারতম্য বা গোল দাগ। প্রায়ই প্যাথোজেন বা পোকার অভুল।',
    yellow:   'পাতা অকালে হলুদ হচ্ছে, তুষারিত রঙ।',
    wilting:  'গাছ বা পাতা ঝুঁকে পড়ছে, সোজা থাকছে না।',
    rot:      'পাতা, কাণ্ড বা ফল নরম হয়ে পচছে।',
    mosaic:   'পাতায় হলুদ-সবুজ মিশ্র প্যাটার্ন বা কুঁকড়ানো।',
    holes:    'পাতায় ছিদ্র বা পোকা খাওয়ার চিহ্ন।',
    webbing:  'পাতায় মাকড়সার-যে গের জাল বা জীবন্ত পোকা।',
    stunting: 'গাছের বৃদ্ধি ধীর বা অসম্ভব ছোট।',
    dieback:  'শাখা-ডগার প্রান্ত শুকিয়ে যাচ্ছে।',
    ooze:     'ক্ষত থেকে আঠালো তরল নির্গমন।',
    powder:   'পাতার উপর সাদা গুঁড়ার মতো আস্তরণ আছে।',
    margin:   'পাতার কিনারা ধূস্ব বা কালো হয়ে পুড়ে যাচ্ছে।',
    curling:  'পাতা বাঁকা বা কুঁকড়ে মোড়ানো হচ্ছে।',
    // Additional technical terms
    fusarium: 'ফসারিৠrium প্যাথোজেন। কাণ্ডের ভিতরে গোলাপি বর্ণ তৈরি করে।',
    verticillium: 'ভার্টিসিলিয়াম প্যাথোজেন। কালো দাগ তৈরি করে কাণ্ডের মূল্যে।',
    late_blight: 'লেট ব্লাইট (লেট সাইল্ড)। আলুটিতে তীব্র छत्रাকজনিত রোগ।',
    early_blight: 'ইarly সাইল্ড। ছittle ছত্রাক রোগ।',
    powdery_mildew: 'পা'য়ারি মাল্ডই (সাদা গুঁড়ার छত্রák) — সাদা গুঁড়ার মতো আস্তরণ।',
    downy_mildew: 'দাউনি মাল্ডই (হেরে আসা মাল্ডই) — পাতায় হলুদ পেছনে-white layer।',
    phytophthora: 'ফাইটোফথোরা — পানি-ওashed ক্ষতিকারক প্যাথোজেন।',
    aflatoxin: 'অফ্লাটক্সিন — মোলানের জন্য ক্ষতিকারক টোক্সিন।',
    n: null
  };

  // Render a glossary button inside a given element
  function renderGlossaryButton(el, term) {
    const info = GLOSSARY[term] || '';
    if (!info) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-glossary-btn';
    btn.dataset.term = term;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3a2 2 0 0 1 2 2h3a2 2 0 0 1 2 2v7"/><circle cx="10" cy="18" r="3"/><circle cx="20" cy="18" r="3"/></svg>';
    btn.title = 'লিখিত সংজ্ঞা শুনুন';
    btn.style.marginLeft = '8px';

    btn.addEventListener('click', () => {
      const msg = GLOSSARY[term] || '';
      if (msg) {
        window.EBOOK_TTS.speakSentence(0); // reuse existing TTS, speak first chunk
        // We'll create a simple utterance instead
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = 'bn-BD';
        if (window.EBOOK_TTS.bnVoice) u.voice = window.EBOOK_TTS.bnVoice;
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
    // Add to symptom chips in symptom-matcher
    $$('.symptom-chip').forEach((chip) => {
      const term = chip.dataset.symptom;
      if (GLOSSARY[term]) {
        renderGlossaryButton(chip, term);
      }
    });

    // Add to result cards (wizard step 5)
    $$('.cause-result').forEach((card) => {
      const term = card.dataset.cause;
      if (GLOSSARY[term]) {
        renderGlossaryButton(card.querySelector('.cause-name'), term);
      }
    });

    // Add to wizard symptom selection
    $$('.symptom-chip[data-symptom]').forEach((chip) => {
      const term = chip.dataset.symptom;
      if (GLOSSARY[term]) {
        renderGlossaryButton(chip, term);
      }
    });
  }

  window.VOICE_GLOSSARY = { init, GLOSSARY };
})();
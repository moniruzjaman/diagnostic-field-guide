/* ============================================================
   Symptom Matcher — Visual photo comparison
   Handles camera/gallery upload, side-by-side slider,
   symptom-to-reference mapping, and match feedback.
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const state = {
    step: 1,
    userImageUrl: null,
    referenceImageUrl: null,
    selectedSymptom: null,
    matchConfirmed: null,
    db: null,
    dividerX: 50,
    isDragging: false
  };

  const SYMPTOM_IMAGES = {
    spots:    'img/p025_48.jpg',
    yellow:   'img/p034_81.jpg',
    wilting:  'img/p025_49.jpg',
    rot:      'img/p026_50.jpg',
    mosaic:   'img/p026_51.jpg',
    holes:    'img/p026_52.jpg',
    webbing:  'img/p026_53.jpg',
    stunting: 'img/p027_54.jpg',
    dieback:  'img/p027_55.jpg',
    ooze:     'img/p027_56.jpg',
    powder:   'img/p027_57.jpg',
    margin:   'img/p028_58.jpg',
    curling:  'img/p028_59.jpg'
  };

  const SYMPTOM_LABELS = {
    spots:    { label: 'পাতায় দাগ / ক্ষত', icon: '🟤' },
    yellow:   { label: 'হলুদ হওয়া', icon: '🟡' },
    wilting:  { label: 'ঢলে পড়া (উইল্ট)', icon: '🥀' },
    rot:      { label: 'পচন / নরম টিস্যু', icon: '🍂' },
    mosaic:   { label: 'মোজাইক / পাতা কুঁকড়ানো', icon: '🟢' },
    holes:    { label: 'ছিদ্র / খাওয়ার দাগ', icon: '🕳️' },
    webbing:  { label: 'জাল / দৃশ্যমান পোকা', icon: '🕸️' },
    stunting: { label: 'খর্বাকৃতি / বৃদ্ধি কম', icon: '📉' },
    dieback:  { label: 'ডগা শুকানো', icon: '✂️' },
    ooze:     { label: 'আঠালো রস / নির্গমন', icon: '💧' },
    powder:   { label: 'গুঁড়া / ছত্রাকের বৃদ্ধি', icon: '🪶' },
    margin:   { label: 'পাতার কিনারা পোড়া', icon: '🔥' },
    curling:  { label: 'পাতা মোড়anao', icon: '🍃' }
  };

  async function init() {
    await window.CAUSE_DB_PROMISE.then((db) => {
      state.db = db;
    });
    renderSymptomGrid();
    wireFileInput();
    wireVoiceInput();
    wireSlider();
    wireMatchButtons();
    wireNavigation();
    showStep(1);
  }

  function showStep(n) {
    $$('.upload-card, .compare-card, .symptom-card, .result-card').forEach((el) => {
      el.classList.add('hidden');
    });
    const panels = [null, $('#step-upload'), $('#step-compare'), $('#step-symptoms'), $('#step-result')];
    if (panels[n]) panels[n].classList.remove('hidden');
    $('#btnBack').style.display = n > 1 ? '' : 'none';
    state.step = n;
    updateNextButton();
  }

  function nextStep() { if (state.step < 4) showStep(state.step + 1); }
  function prevStep() { if (state.step > 1) showStep(state.step - 1); }

  function updateNextButton() {
    const btn = $('#btnNext');
    let enabled = false;
    switch (state.step) {
      case 1: enabled = !!state.userImageUrl; break;
      case 2: enabled = state.matchConfirmed !== null; break;
      case 3: enabled = !!state.selectedSymptom; break;
      case 4: enabled = true; break;
    }
    btn.disabled = !enabled;
  }
  function wireFileInput() {
    const dropZone = $('#dropZone');
    const fileInput = $('#fileInput');
    const cameraBtn = $('#btnCamera');

    // NOTE: the wrapping <label> natively activates the hidden input —
    // an extra JS click() double-triggers and can kill the picker on mobile
    dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handleImageFile(file);
    });

    cameraBtn.addEventListener('click', () => {
      // temp input with capture → opens the camera directly; #fileInput
      // (no capture) stays free for the gallery picker
      const cam = document.createElement('input');
      cam.type = 'file';
      cam.accept = 'image/*';
      cam.capture = 'environment';
      cam.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f) handleImageFile(f);
      });
      cam.click();
    });
  }

  function wireVoiceInput() {
    const micBtn = $('#voiceMicBtn');
    if (!micBtn || !window.VOICE_INPUT || !VOICE_INPUT.init()) {
      micBtn && (micBtn.disabled = true);
      return;
    }

    micBtn.disabled = false;
    micBtn.addEventListener('click', () => {
      if (!VOICE_INPUT.isListening) {
        // Show listening state
        micBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M16.58 16.58l1.42 1.42M2 12h10M12 12h4M4.22 19.78l1.42-1.42M16.58 7.42l1.42-1.42"/></svg>
          <span>শুনতে চলছে...</span>
        `;
        VOICE_INPUT.start();
      } else {
        VOICE_INPUT.stop();
        micBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <span>মাইক চেপে লক্ষণ বলুন</span>
        `;
      }
    });

    VOICE_INPUT.onResult = (transcript, confidence) => {
      console.log('Voice result:', transcript, confidence);
      // Process the voice input - extract symptoms mentioned
      const lower = transcript.toLowerCase();
      const matchedSymptoms = [];
      
      // Simple keyword matching against symptom labels
      const symptomKeys = Object.keys(SYMPTOM_LABELS);
      symptomKeys.forEach(key => {
        const labelLower = SYMPTOM_LABELS[key].label.toLowerCase();
        if (labelLower.includes(lower) || lower.includes(labelLower)) {
          matchedSymptoms.push(key);
        }
      });

      // Also check for common disease-related keywords
      const diseaseKeywords = [' fusarium', ' viral', ' bacterial', ' rot', ' powder', ' spots'];
      diseaseKeywords.forEach(kw => {
        if (lower.includes(kw)) {
          // Map to likely symptom
          if (kw.includes(' spots')) matchedSymptoms.push('spots');
          if (kw.includes(' rot')) matchedSymptoms.push('rot');
          if (kw.includes(' powder')) matchedSymptoms.push('powder');
          if (kw.includes(' fusarium')) matchedSymptoms.push('wilting');
        }
      });

      // Remove duplicates
      const unique = [...new Set(matchedSymptoms)];
      
      if (unique.length > 0) {
        // Select the first matched symptom
        const firstSymptom = unique[0];
        $$('.symptom-chip').forEach((c) => c.classList.remove('is-selected'));
        $(`.symptom-chip[data-symptom="${firstSymptom}"]`)?.classList.add('is-selected');
        state.selectedSymptom = firstSymptom;

        // Update reference image
        const refImg = SYMPTOM_IMAGES[firstSymptom];
        if (refImg) {
          state.referenceImageUrl = refImg;
          $('#imgReference').src = refImg;
        }

        showToast(`শব্দ মিলেছে — "${firstSymptom}" লক্ষণ নির্বাচিত হয়েছে।`);
        updateNextButton();
      } else {
        showToast('শব্দের সাথে মিলে এমন কোনো লক্ষণ পাওয়া যায়নি। আবার চেষ্টা করুন।');
      }
    };

    VOICE_INPUT.onError = (error) => {
      console.error('Voice error:', error);
      showToast('ভয়েস ইনপুটে সমস্যা হয়েছে: ' + error);
      micBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span>মাইক চেপে লক্ষণ বলুন</span>
      `;
    };

    VOICE_INPUT.onEnd = () => {
      micBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span>মাইক চেপে লক্ষণ বলুন</span>
      `;
    };
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('শুধুমাত্র ছবি ফাইল সমর্থিত।');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('ছবি খুব বড় — ৫MB-এর কম বেছে নিন।');
      return;
    }

    const url = URL.createObjectURL(file);
    state.userImageUrl = url;
    $('#imgUser').src = url;
    $('#dropZoneText').textContent = file.name;
    $('#dropZone').classList.add('has-file');

    state.referenceImageUrl = SYMPTOM_IMAGES.spots;
    $('#imgReference').src = state.referenceImageUrl;

    showToast('ছবি লোড হয়েছে — রেফারেন্স ছবির সঙ্গে তুলনা করুন');
    updateNextButton();
  }
  function wireSlider() {
    const container = $('.compare-container');
    const divider = $('#divider');

    const startDrag = (clientX) => {
      state.isDragging = true;
      updateDivider(clientX);
    };
    const moveDrag = (clientX) => {
      if (!state.isDragging) return;
      updateDivider(clientX);
    };
    const endDrag = () => { state.isDragging = false; };

    divider.addEventListener('mousedown', (e) => startDrag(e.clientX));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
    window.addEventListener('mouseup', endDrag);

    divider.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (!state.isDragging) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX);
    }, { passive: false });
    window.addEventListener('touchend', endDrag);

    container.addEventListener('click', (e) => {
      if (e.target === divider) return;
      const rect = container.getBoundingClientRect();
      updateDivider(e.clientX - rect.left);
    });
  }

  function updateDivider(clientX) {
    const container = $('.compare-container');
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const pct = Math.round((x / rect.width) * 100);
    state.dividerX = pct;
    divider.style.left = pct + '%';
    $('#imgUser').style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
  }
  function wireMatchButtons() {
    $('#btnMatchYes')?.addEventListener('click', () => setMatch(true));
    $('#btnMatchNo')?.addEventListener('click', () => setMatch(false));
    $('#btnMatchSkip')?.addEventListener('click', () => setMatch(null));
  }

  function setMatch(val) {
    state.matchConfirmed = val;
    $('#matchConfirm').classList.add('is-visible');

    const btns = $$('.btn-match');
    btns.forEach((b) => {
      b.style.opacity = '0.5';
      b.style.pointerEvents = 'none';
    });

    const msg = val === true
      ? 'মিল নিশ্চিত — লক্ষণ বেছে নিন'
      : val === false
        ? 'আলাদা — অন্য রেফারেন্স চেষ্টা করুন'
        : 'নিশ্চিত নই — লক্ষণ দিয়ে আগে যাচাই করুন';
    showToast(msg);
    updateNextButton();
  }

  function renderSymptomGrid() {
    const grid = $('#symptomGrid');
    if (!grid) return;
    const symptoms = state.db ? state.db.symptoms : [];
    if (symptoms.length === 0) return;

    grid.innerHTML = symptoms.map((s) => {
      const img = SYMPTOM_IMAGES[s.id] || '';
      const info = SYMPTOM_LABELS[s.id] || { label: s.label_bn, icon: '📷' };
      return `
        <div class="symptom-chip" data-symptom="${s.id}">
          <img class="symptom-chip-thumb" src="${img}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><text x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 text-anchor=%22middle%22 dy=%22.3em%22>${info.icon}</text></svg>'">
          <span class="symptom-chip-label">${info.label}</span>
        </div>
      `;
    }).join('');

    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.symptom-chip');
      if (!chip) return;
      $$('.symptom-chip').forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      state.selectedSymptom = chip.dataset.symptom;

      const refImg = SYMPTOM_IMAGES[state.selectedSymptom];
      if (refImg) {
        state.referenceImageUrl = refImg;
        $('#imgReference').src = refImg;
      }

      updateNextButton();
    });
  }

  function renderResult() {
    const body = $('#resultBody');
    let msg = '';
    if (state.matchConfirmed === true && state.selectedSymptom) {
      const info = SYMPTOM_LABELS[state.selectedSymptom];
      msg = `আপনার ছবি রেফারেন্স ছবির সঙ্গে মিলেছে। লক্ষণ: ${info.label}। এখন অধ্যায় ৪-এ এই লক্ষণ সম্পর্কে আরও পড়ুন।`;
    } else if (state.matchConfirmed === false) {
      msg = 'ছবিটি রেফারেন্সের সঙ্গে মেলেনি। অন্য ছবি তুলে আবার চেষ্টা করুন অথবা ওয়ার্কবেঞ্চে যান।';
    } else {
      msg = 'মিল নিশ্চিত হয়নি। লক্ষণ বেছে নিয়ে পরের ধাপে যান।';
    }
    body.textContent = msg;
  }

  function wireNavigation() {
    $('#btnBack')?.addEventListener('click', () => prevStep());
    $('#btnNext')?.addEventListener('click', () => {
      if (state.step === 3) {
        renderResult();
      }
      nextStep();
    });
    $('#btnNewMatch')?.addEventListener('click', () => {
      state.userImageUrl = null;
      state.referenceImageUrl = null;
      state.selectedSymptom = null;
      state.matchConfirmed = null;
      state.dividerX = 50;
      $('#fileInput').value = '';
      $('#imgUser').src = '';
      $('#imgReference').src = '';
      $('#dropZone').classList.remove('has-file');
      $('#dropZoneText').textContent = 'গ্যালারি থেকে বেছে নিন অথবা ক্যামেরা ব্যবহার করুন';
      $$('.symptom-chip').forEach((c) => c.classList.remove('is-selected'));
      $('#matchConfirm').classList.remove('is-visible');
      $$('.btn-match').forEach((b) => {
        b.style.opacity = '1';
        b.style.pointerEvents = 'auto';
      });
      showStep(1);
    });
  }

  function showToast(msg) {
    const t = $('#matcherToast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
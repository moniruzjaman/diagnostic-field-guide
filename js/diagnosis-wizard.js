/* ============================================================
   Diagnosis Wizard — main logic
   Guided self-diagnosis for Bangladeshi farmers (বাংলা).
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const state = {
    step: 1,
    selectedCrop: null,
    selectedSymptoms: new Set(),
    selectedParts: new Set(),
    selectedDistribution: null,
    db: null
  };

  const TOTAL_STEPS = 5;

  async function init() {
    await window.CAUSE_DB_PROMISE.then((db) => {
      state.db = db;
    });
    renderCropGrid();
    renderSymptomGrid();
    renderPartGrid();
    renderDistributionGrid();
    wireEvents();
    wireWizardVoiceInput();
    wireWizardGlossary();
    updateProgress();
    showStep(1);
  }

  function showStep(n) {
    $$('.wizard-step-panel').forEach((p) => p.classList.remove('is-active'));
    const panel = $(`#step-${['welcome', 'crop', 'symptoms', 'pattern', 'results', 'next'][n - 1]}`);
    if (panel) panel.classList.add('is-active');
    $$('.wizard-step').forEach((s, i) => {
      s.classList.remove('is-active', 'is-done');
      if (i < n - 1) s.classList.add('is-done');
      else if (i === n - 1) s.classList.add('is-active');
  function renderCropGrid() {
    const grid = $('#cropGrid');
    if (!grid || !state.db) return;
    grid.innerHTML = state.db.crops.map((crop) => `
      <div class="crop-chip" data-crop="${crop.id}">
        <span class="crop-icon">${crop.icon}</span>
        <span class="crop-name">${crop.name_bn}</span>
      </div>
    `).join('');
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.crop-chip');
      if (!chip) return;
      $$('.crop-chip').forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      state.selectedCrop = chip.dataset.crop;
      $('#btnCropNext').disabled = false;
    });
  }

  function renderSymptomGrid() {
    const grid = $('#symptomGrid');
    if (!grid || !state.db) return;
    grid.innerHTML = state.db.symptoms.map((s) => `
      <div class="symptom-chip" data-symptom="${s.id}">
        <span class="chip-icon">${s.icon}</span>
        <span class="chip-label">${s.label_bn}</span>
        <span class="chip-check">✓</span>
      </div>
    `).join('');
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.symptom-chip');
      if (!chip) return;
      const id = chip.dataset.symptom;
      if (state.selectedSymptoms.has(id)) {
        state.selectedSymptoms.delete(id);
        chip.classList.remove('is-selected');
      } else {
        state.selectedSymptoms.add(id);
        chip.classList.add('is-selected');
      }
      $('#btnSymptomNext').disabled = state.selectedSymptoms.size === 0;
    });
  }

  function renderPartGrid() {
    const grid = $('#partGrid');
    if (!grid) return;
    const parts = [
      { id: 'young', label: 'কচি পাতা / ডগা', icon: '🌱' },
      { id: 'old', label: 'পুরোনো পাতা', icon: '🍂' },
      { id: 'root', label: 'শিকড় / গোড়া', icon: '🥔' },
      { id: 'stem', label: 'কাণ্ড / শাখা', icon: '🌳' },
      { id: 'flowerfruit', label: 'ফুল / ফল / দানা', icon: '🍅' },
      { id: 'whole', label: 'পুরো গাছ', icon: '🌿' }
    ];
    grid.innerHTML = parts.map((p) => `
      <div class="symptom-chip" data-part="${p.id}">
        <span class="chip-icon">${p.icon}</span>
        <span class="chip-label">${p.label}</span>
        <span class="chip-check">✓</span>
      </div>
    `).join('');
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.symptom-chip');
      if (!chip) return;
      const id = chip.dataset.part;
      if (state.selectedParts.has(id)) {
        state.selectedParts.delete(id);
        chip.classList.remove('is-selected');
      } else {
        state.selectedParts.add(id);
        chip.classList.add('is-selected');
      }
    });
  }

  function renderDistributionGrid() {
    const grid = $('#distributionGrid');
    if (!grid) return;
    const dists = [
      { id: 'patch', label: 'বিক্ষিপ্ত গাছ / ছোট দাগে', icon: '📍' },
      { id: 'edge', label: 'জমির কিনারায় / এক পাশ থেকে', icon: '🏞️' },
      { id: 'uniform', label: 'প্রায় সব জমিতে সমান', icon: '🟰' },
      { id: 'rows', label: 'সারি / সেচ লাইনের বরাবর', icon: '📏' },
      { id: 'low', label: 'নিচু / পানি জমে এমন স্থানে', icon: '💧' },
      { id: 'random', label: 'অনিয়মিতভাবে ছড়াচ্ছে', icon: '🎲' }
    ];
    grid.innerHTML = dists.map((d) => `
      <div class="symptom-chip" data-dist="${d.id}">
        <span class="chip-icon">${d.icon}</span>
        <span class="chip-label">${d.label}</span>
        <span class="chip-check">✓</span>
      </div>
    `).join('');
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.symptom-chip');
      if (!chip) return;
      $$('.symptom-chip[data-dist]').forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      state.selectedDistribution = chip.dataset.dist;
    });
  }
    });
    state.step = n;
    updateProgress();
  }

  function nextStep() { if (state.step < TOTAL_STEPS) showStep(state.step + 1); }
  function prevStep() { if (state.step > 1) showStep(state.step - 1); }

  function updateProgress() {
    $$('.wizard-step .fill').forEach((f, i) => {
      f.style.width = i < state.step ? '100%' : '0%';
    });
  }
  function scoreCauses() {
    if (!state.db) return [];
    const symptoms = [...state.selectedSymptoms];
    const parts = [...state.selectedParts];
    const dist = state.selectedDistribution;

    const causeScores = {};
    const causeReasons = {};

    state.db.scoringRules.forEach((rule) => {
      let match = false;
      let reasons = [];
      if (rule.symptoms && rule.symptoms.some((s) => symptoms.includes(s))) {
        match = true;
        reasons.push('লক্ষণ: ' + rule.symptoms.filter((s) => symptoms.includes(s)).join(', '));
      }
      if (rule.parts && rule.parts.some((p) => parts.includes(p))) {
        match = true;
        reasons.push('আক্রান্ত অংশ: ' + rule.parts.filter((p) => parts.includes(p)).join(', '));
      }
      if (rule.distribution && rule.distribution === dist) {
        match = true;
        reasons.push('জমির বিস্তার: ' + dist);
      }
      if (match) {
        if (!causeScores[rule.cause]) {
          causeScores[rule.cause] = 0;
          causeReasons[rule.cause] = [];
        }
        causeScores[rule.cause]++;
        causeReasons[rule.cause].push(...reasons);
      }
    });

    const crop = state.db.crops.find((c) => c.id === state.selectedCrop);
    if (crop) {
      crop.likely_causes.forEach((cid) => {
        if (!causeScores[cid]) causeScores[cid] = 0;
      });
    }

    const results = Object.entries(causeScores).map(([cid, score]) => {
      const group = state.db.causeGroups.find((g) => g.id === cid);
      if (!group) return null;
      return {
        id: cid,
        name: group.name_bn,
        icon: group.icon,
        score: score,
        confidence: score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low',
        reason: (causeReasons[cid] || []).join(' · ') || group.about_bn,
        verify: group.verify_bn
      };
    }).filter(Boolean);

    results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return results;
  }

  function renderResults() {
    const container = $('#causeResults');
    if (!container) return;
    const results = scoreCauses();
    if (results.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#666;">পর্যাপ্ত তথ্য নেই। অন্য লক্ষণ চেষ্টা করুন।</p>';
      return;
    }
    container.innerHTML = results.slice(0, 4).map((r) => `
      <div class="cause-result is-${r.confidence}">
        <div class="cause-header">
          <span class="cause-icon">${r.icon}</span>
          <div>
            <h3 class="cause-name">${r.name}</h3>
            <span class="cause-confidence is-${r.confidence}">
              ${r.confidence === 'high' ? 'উচ্চ ভরসা' : r.confidence === 'medium' ? 'মাঝারি ভরসা' : 'কম ভরসা'}
            </span>
          </div>
        </div>
        <div class="cause-score-bar">
          <div class="cause-score-fill is-${r.confidence}" style="width:${Math.min(100, (r.score / 4) * 100)}%"></div>
        </div>
        <p class="cause-reason">${r.reason}</p>
        <p class="cause-verify">${r.verify}</p>
      </div>
    `).join('');

    const top = results[0];
    $('#nextStepsText').textContent =
      `সবচেয়ে সম্ভাব্য কারণ: ${top.name} (${top.confidence === 'high' ? 'উচ্চ' : top.confidence === 'medium' ? 'মাঝারি' : 'কম'} ভরসা)।`;
    const steps = [
      'গাছের পাতার নিচে, কাণ্ড ও শিকড় গুছি করে দেখুন।',
      'পাতার নিচে ডিম, মল বা ছত্রাকের গুঁড়া আছে কিনা যাচাই করুন।',
      'নিশ্চিত না হলে ফোটো তুলে স্থানীয় প্লান্ট ডাক্তার বা কৃষি সম্প্রসারণ কর্মীর সঙ্গে শেয়ার করুন।',
      'কীটনাশক স্প্রে করার আগে বিশেষজ্ঞের পরামর্শ নিন।'
    ];
    $('#nextStepsList').innerHTML = steps.map((s) => `<p>• ${s}</p>`).join('');
  }
  function wireEvents() {
    $('#btnStartWizard')?.addEventListener('click', () => nextStep());
    $('#btnCropBack')?.addEventListener('click', () => prevStep());
    $('#btnCropNext')?.addEventListener('click', () => nextStep());
    $('#btnSymptomBack')?.addEventListener('click', () => prevStep());
    $('#btnSymptomNext')?.addEventListener('click', () => nextStep());
    $('#btnPatternBack')?.addEventListener('click', () => prevStep());
    $('#btnPatternNext')?.addEventListener('click', () => {
      renderResults();
      nextStep();
    });
    $('#btnResultBack')?.addEventListener('click', () => prevStep());
    $('#btnResultNext')?.addEventListener('click', () => { showStep(6); });
    $('#btnNextNewCase')?.addEventListener('click', () => {
      state.selectedSymptoms.clear();
      state.selectedParts.clear();
      state.selectedDistribution = null;
      state.selectedCrop = null;
      $$('.symptom-chip.is-selected, .crop-chip.is-selected').forEach((c) => c.classList.remove('is-selected'));
      $('#btnCropNext').disabled = true;
      $('#btnSymptomNext').disabled = true;
      showStep(1);
    });
    $('#btnNextShare')?.addEventListener('click', () => shareCase());
  }

  function wireWizardVoiceInput() {
    const micBtn = $('#wizardVoiceMicBtn');
    if (!micBtn || !VOICE_INPUT.init()) {
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
          <span>শোনতে চলে</span>
        `;
      }
    });

    VOICE_INPUT.onResult = (transcript, confidence) => {
      console.log('Wizard voice result:', transcript, confidence);
      const lower = transcript.toLowerCase();
      const matchedSymptoms = [];
      
      // Match against symptom labels from the cause database
      if (state.db && state.db.symptoms) {
        state.db.symptoms.forEach(sym => {
          const labelLower = sym.label_bn.toLowerCase();
          if (labelLower.includes(lower) || lower.includes(labelLower)) {
            matchedSymptoms.push(sym.id);
          }
        });
      }

      if (matchedSymptoms.length > 0) {
        const firstSymptom = matchedSymptoms[0];
        $$('.symptom-chip[data-symptom]').forEach((c) => c.classList.remove('is-selected'));
        $(`.symptom-chip[data-symptom="${firstSymptom}"]`)?.classList.add('is-selected');
        state.selectedSymptom = firstSymptom;
        showToast(` głos সমঃ ${firstSymptom} লক্ষণ চিহ্নেরস মিলে।`);
        updateProgress();
        updateNextButton();
      } else {
        showToast('শব্দের সাথে মিলেয়ে এমন কোন লক্ষণ পাওয়া যায় নি। আবার চেষ্টা করুন।');
      }
    };

    VOICE_INPUT.onError = (error) => {
      console.error('Wizard voice error:', error);
      showToast('আপ声音 Recognition এর কোন সমস্যা হয়েছে: ' + error);
      $('#wizardVoiceMicBtn').innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span>শোনতে চলে</span>
      `;
    };

    VOICE_INPUT.onEnd = () => {
      $('#wizardVoiceMicBtn').innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span>শোনতে চলে</span>
      `;
    };
  }

  function wireWizardGlossary() {
    // Add glossary buttons to symptom chips in step 3
    $$('.symptom-chip[data-symptom]').forEach((chip) => {
      const term = chip.dataset.symptom;
      if (VOICE_GLOSSARY.GLOSSARY[term]) {
        renderGlossaryButton(chip, term);
      }
    });
    
    // Add to result display area
    const resultArea = $('#causeResults');
    if (resultArea) {
      const glossaryBtn = document.createElement('div');
      glossaryBtn.style.marginTop = '8px';
      glossaryBtn.style.fontSize = '0.8rem';
      glossaryBtn.style.color = '#5A5A5A';
      resultArea.appendChild(glossaryBtn);
    }
  }

  function shareCase() {
    const crop = state.db.crops.find((c) => c.id === state.selectedCrop);
    const results = scoreCauses();
    const text = [
      'ফসল রোগনির্ণয় রিপোর্ট',
      'ফসল: ' + (crop ? crop.name_bn : 'অজানা'),
      'লক্ষণ: ' + [...state.selectedSymptoms].join(', '),
      'সম্ভাব্য কারণ: ' + (results[0] ? results[0].name : 'নিশ্চিত নয়'),
      'শেয়ার করুন: এই গাইডটি ব্যবহার করুন'
    ].join('\n');
    if (navigator.share) {
      navigator.share({ title: 'ফসল রোগনির্ণয়', text, url: location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        showToast('কপি করা হয়েছে — যেকোনো অ্যাপে পেস্ট করুন');
      });
    }
  }

  function showToast(msg) {
    const t = $('#wizardToast');
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
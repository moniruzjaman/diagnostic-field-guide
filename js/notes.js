/* ============================================================
   EBOOK_NOTES — chapter-wise user notes & feedback (offline)
   Storage: localStorage, versioned keys
   - pwdfg.notes.v1    { [chapterId]: { text, updatedAt } }
   - pwdfg.feedback.v1 { [chapterId]: { rating, comment, updatedAt } }
   Notes autosave debounced while typing; feedback saves on tap.
   Export: settings panel → JSON download to share with the author.
   Injected AFTER sentence-wrapping so TTS spans are untouched.
   ============================================================ */
(function () {
    'use strict';

    const NOTES_KEY = 'pwdfg.notes.v1';
    const FEEDBACK_KEY = 'pwdfg.feedback.v1';
    const APP_VERSION = 'v2.0.1';
    const AUTHOR_EMAIL = 'mithun.hstu@gmail.com';

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    const RATING_LABELS = ['', 'একেবারেই কাজে আসেনি', 'কম কাজে এসেছে', 'মোটামুটি', 'ভালো লেগেছে', 'খুব কাজে লেগেছে'];

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }
    function writeJSON(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); return true; }
        catch (e) { return false; }
    }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }
    function fmtTime(ts) {
        try {
            return new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
        } catch (e) { return new Date(ts).toLocaleString(); }
    }
    function bn(n) { try { return n.toLocaleString('bn-BD'); } catch (e) { return String(n); } }

    // content.js declares EBOOK_CONTENT as a top-level const — it is visible
    // as a bare global but NOT as window.EBOOK_CONTENT.
    function getChapters() {
        try {
            return (typeof EBOOK_CONTENT !== 'undefined' && EBOOK_CONTENT.chapters) || [];
        } catch (e) { return []; }
    }

    const notes = readJSON(NOTES_KEY, {});
    const feedback = readJSON(FEEDBACK_KEY, {});

    let wired = false;
    let saveTimers = {};
    let toastTimer = null;

    // ── Card markup ──────────────────────────────────────────
    function buildCard(chId) {
        const note = notes[chId];
        const fb = feedback[chId];
        const stars = [1, 2, 3, 4, 5].map(v =>
            `<button type="button" class="nf-star${fb && fb.rating >= v ? ' active' : ''}" data-v="${v}" aria-label="${bn(v)} স্টার">★</button>`
        ).join('');
        const noteStatus = note ? `সংরক্ষিত ✓ ${fmtTime(note.updatedAt)}` : 'অফলাইনেও সংরক্ষিত হয়';
        const fbStatus = fb ? `সংরক্ষিত ✓ ${fmtTime(fb.updatedAt)}` : '';
        const ratingLabel = fb && fb.rating ? (RATING_LABELS[fb.rating] || '') : '';
        return `
<div class="nf-block" data-ch="${chId}">
  <div class="nf-card nf-note-card">
    <div class="nf-head">
      <span class="nf-title">📝 আমার নোট</span>
      <span class="nf-status" data-role="note-status">${escapeHtml(noteStatus)}</span>
    </div>
    <textarea class="nf-note-input" data-role="note-input" rows="4"
      placeholder="এই অধ্যায়ের ক্ষেত্র-পর্যবেক্ষণ, প্রশ্ন বা স্মারণী লিখুন…">${note ? escapeHtml(note.text) : ''}</textarea>
    <div class="nf-actions">
      <button type="button" class="nf-btn nf-btn-ghost" data-action="note-clear">মুছুন</button>
      <span class="nf-hint">টাইপ করলেই স্বয়ংক্রিয় সংরক্ষণ</span>
    </div>
  </div>
  <div class="nf-card nf-fb-card">
    <div class="nf-head">
      <span class="nf-title">এই অধ্যায় কাজে লেগেছে?</span>
      <span class="nf-status" data-role="fb-status">${escapeHtml(fbStatus)}</span>
    </div>
    <div class="nf-stars" data-role="stars">${stars}</div>
    <div class="nf-rating-label" data-role="rating-label">${escapeHtml(ratingLabel)}</div>
    <textarea class="nf-fb-input" data-role="fb-input" rows="2"
      placeholder="মতামত লিখুন (ঐচ্ছিক)…">${fb && fb.comment ? escapeHtml(fb.comment) : ''}</textarea>
    <div class="nf-actions">
      <button type="button" class="nf-btn nf-btn-primary" data-action="fb-save">সংরক্ষণ করুন</button>
      <button type="button" class="nf-btn nf-btn-ghost" data-action="fb-email">📧 লেখককে পাঠান</button>
      <span class="nf-hint">ডিভাইসে সংরক্ষিত · লেখক: mithun.hstu@gmail.com</span>
    </div>
  </div>
</div>`;
    }

    function inject() {
        getChapters().forEach(ch => {
            const body = document.getElementById('body-' + ch.id);
            if (!body || body.querySelector('.nf-block')) return;
            body.insertAdjacentHTML('beforeend', buildCard(ch.id));
        });
        wireEvents();
        updateBadges();
        updateExportCounts();
    }

    // ── Persistence ──────────────────────────────────────────
    function saveNote(chId, text) {
        const t = (text || '').trim();
        if (t) notes[chId] = { text: t, updatedAt: Date.now() };
        else delete notes[chId];
        writeJSON(NOTES_KEY, notes);
        const block = document.querySelector(`.nf-block[data-ch="${chId}"]`);
        if (block) {
            const status = block.querySelector('[data-role="note-status"]');
            if (status) status.textContent = t ? `সংরক্ষিত ✓ ${fmtTime(notes[chId].updatedAt)}` : 'অফলাইনেও সংরক্ষিত হয়';
        }
        updateBadges();
        updateExportCounts();
    }

    function saveFeedback(block) {
        const chId = block.dataset.ch;
        const rating = parseInt(block.dataset.rating || '0', 10);
        const comment = ($('[data-role="fb-input"]', block)?.value || '').trim();
        if (!rating && !comment) {
            showToast('রেটিং দিন অথবা মতামত লিখুন');
            return;
        }
        feedback[chId] = { rating: rating || 0, comment: comment, updatedAt: Date.now() };
        writeJSON(FEEDBACK_KEY, feedback);
        const status = block.querySelector('[data-role="fb-status"]');
        if (status) status.textContent = `সংরক্ষিত ✓ ${fmtTime(feedback[chId].updatedAt)}`;
        showToast('মতামত সংরক্ষিত হয়েছে ✅');
        updateExportCounts();
    }

    // ── E-mail delivery to the author (static hosting: mailto:) ──
    function emailFeedback(block) {
        const chId = block.dataset.ch;
        const rating = parseInt(block.dataset.rating || '0', 10) || (feedback[chId] && feedback[chId].rating) || 0;
        const comment = (($('[data-role="fb-input"]', block)?.value) || '').trim() || (feedback[chId] && feedback[chId].comment) || '';
        if (!rating && !comment) {
            showToast('আগে রেটিং দিন বা মতামত লিখুন');
            return;
        }
        const ch = getChapters().find(c => c.id === chId);
        const lines = [
            'মতামত — উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড',
            '────────────────────',
            'অধ্যায়: ' + (ch ? ch.numLabel + ' — ' + ch.title : chId),
            'রেটিং: ' + (rating ? bn(rating) + '/৫' + (RATING_LABELS[rating] ? ' (' + RATING_LABELS[rating] + ')' : '') : '—'),
            'মন্তব্য: ' + (comment || '—'),
            '',
            'অ্যাপ সংস্করণ: ' + APP_VERSION,
            'পাঠানোর সময়: ' + fmtTime(Date.now()),
        ];
        const url = 'mailto:' + AUTHOR_EMAIL +
            '?subject=' + encodeURIComponent('[ফিল্ড গাইড মতামত] ' + (ch ? ch.title : chId)) +
            '&body=' + encodeURIComponent(lines.join('\n'));
        window.location.href = url;
        showToast('ইমেল অ্যাপ খুলছে… 📧');
    }

    function emailToAuthor() {
        const n = Object.keys(notes).length;
        const f = Object.keys(feedback).length;
        const lines = [
            'প্রশ্ন / মতামত — উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড',
            '────────────────────',
            'সংরক্ষিত নোট: ' + bn(n) + 'টি · মতামত: ' + bn(f) + 'টি',
            '',
            '(এখানে আপনার প্রশ্ন বা মতামত লিখুন)',
            '',
            'অ্যাপ সংস্করণ: ' + APP_VERSION,
        ];
        const url = 'mailto:' + AUTHOR_EMAIL +
            '?subject=' + encodeURIComponent('[ফিল্ড গাইড] প্রশ্ন / মতামত') +
            '&body=' + encodeURIComponent(lines.join('\n'));
        window.location.href = url;
        showToast('ইমেল অ্যাপ খুলছে… 📧');
    }

    // ── Toast ────────────────────────────────────────────────
    function showToast(msg) {
        let toast = $('#nfToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'nfToast';
            toast.className = 'nf-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ── TOC badges (chapters that carry a note) ─────────────
    function updateBadges() {
        getChapters().forEach(ch => {
            const tocItem = document.querySelector(`.toc-item[data-target="${ch.id}"]`);
            if (!tocItem) return;
            let dot = tocItem.querySelector('.nf-dot');
            if (notes[ch.id] && !dot) {
                dot = document.createElement('span');
                dot.className = 'nf-dot';
                dot.title = 'এই অধ্যায়ে নোট আছে';
                dot.textContent = '📝';
                tocItem.querySelector('.toc-text-block').appendChild(dot);
            } else if (!notes[ch.id] && dot) {
                dot.remove();
            }
        });
    }

    // ── Export (JSON download) ───────────────────────────────
    function updateExportCounts() {
        const el = $('#nfExportCounts');
        if (!el) return;
        const n = Object.keys(notes).length;
        const f = Object.keys(feedback).length;
        el.textContent = `নোট ${bn(n)}টি · মতামত ${bn(f)}টি`;
    }

    function exportAll() {
        const n = Object.keys(notes).length;
        const f = Object.keys(feedback).length;
        if (!n && !f) { showToast('কোনো নোট বা মতামত সংরক্ষিত হয়নি'); return; }
        const payload = {
            app: 'উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড — বাংলা ই-বুক',
            appVersion: APP_VERSION,
            exportedAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            notes: notes,
            feedback: feedback,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `field-guide-notes-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('ডাউনলোড শুরু হয়েছে ⬇️');
    }

    // ── Events (delegated, survive re-render) ────────────────
    function wireEvents() {
        if (wired) return;
        wired = true;

        document.addEventListener('click', (e) => {
            const star = e.target.closest('.nf-star');
            if (star) {
                const block = star.closest('.nf-block');
                const v = parseInt(star.dataset.v, 10);
                block.dataset.rating = String(v);
                $$('.nf-star', block).forEach(s => s.classList.toggle('active', parseInt(s.dataset.v, 10) <= v));
                const label = block.querySelector('[data-role="rating-label"]');
                if (label) label.textContent = RATING_LABELS[v] || '';
                return;
            }
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;
            const block = actionBtn.closest('.nf-block');
            if (!block) return;
            if (actionBtn.dataset.action === 'fb-save') {
                saveFeedback(block);
            } else if (actionBtn.dataset.action === 'fb-email') {
                emailFeedback(block);
            } else if (actionBtn.dataset.action === 'note-clear') {
                const input = block.querySelector('[data-role="note-input"]');
                if (input) input.value = '';
                saveNote(block.dataset.ch, '');
                showToast('নোট মুছে ফেলা হয়েছে');
            }
        });

        // Debounced autosave while typing notes
        document.addEventListener('input', (e) => {
            const input = e.target.closest('.nf-note-input');
            if (!input) return;
            const block = input.closest('.nf-block');
            const chId = block.dataset.ch;
            const status = block.querySelector('[data-role="note-status"]');
            if (status) status.textContent = 'সংরক্ষণ হচ্ছে…';
            clearTimeout(saveTimers[chId]);
            saveTimers[chId] = setTimeout(() => saveNote(chId, input.value), 700);
        });

        $('#btnExportNotes')?.addEventListener('click', exportAll);
        $('#btnEmailAuthor')?.addEventListener('click', emailToAuthor);
    }

    window.EBOOK_NOTES = { init: inject, exportAll, updateBadges };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();

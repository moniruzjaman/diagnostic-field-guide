/* ============================================================
   EBOOK_BOOKMARKS — chapter bookmarks (offline, localStorage)
   Storage: pwdfg.bookmarks.v1 { [chapterId]: { title, numLabel, ts } }
   - star pill injected at the top of every chapter body
     (tap once to save, again to remove)
   - topbar 🔖 button opens the bookmarks drawer (reuses the
     .settings-panel drawer classes + .open/.visible mechanics)
   - jump: expands the chapter if collapsed, scrolls to it
     (.chapter has scroll-margin-top so the topbar never covers it)
   Self-contained — no reader.js changes needed.
   ============================================================ */
(function () {
    'use strict';

    const KEY = 'pwdfg.bookmarks.v1';
    const APP_VERSION = 'v1.9.0';

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

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

    // content.js declares EBOOK_CONTENT as a top-level const (bare global)
    function getChapters() {
        try {
            return (typeof EBOOK_CONTENT !== 'undefined' && EBOOK_CONTENT.chapters) || [];
        } catch (e) { return []; }
    }

    const bookmarks = readJSON(KEY, {});
    let toastTimer = null;

    function showToast(msg) {
        let toast = $('#bmToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bmToast';
            toast.className = 'nf-toast';  // same toast styling as notes/feedback
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ── star pill in each chapter body ───────────────────────
    function inject() {
        getChapters().forEach(ch => {
            const body = document.getElementById('body-' + ch.id);
            if (!body || body.querySelector('.bm-bar')) return;
            body.insertAdjacentHTML('afterbegin',
                `<div class="bm-bar"><button type="button" class="bm-btn" data-bm="${ch.id}" aria-pressed="false">☆ বুকমার্ক করুন</button></div>`);
        });
        syncButtons();
        wireEvents();
        renderList();
    }

    function syncButtons() {
        $$('.bm-btn').forEach(btn => {
            const on = !!bookmarks[btn.dataset.bm];
            btn.classList.toggle('is-bookmarked', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            btn.textContent = on ? '★ বুকমার্ক করা হয়েছে' : '☆ বুকমার্ক করুন';
        });
    }

    function toggle(chId) {
        if (bookmarks[chId]) {
            delete bookmarks[chId];
            showToast('বুকমার্ক সরানো হয়েছে');
        } else {
            const ch = getChapters().find(c => c.id === chId);
            bookmarks[chId] = {
                title: ch ? ch.title : chId,
                numLabel: ch ? ch.numLabel : '',
                ts: Date.now(),
            };
            showToast('বুকমার্ক সংরক্ষিত ★');
        }
        writeJSON(KEY, bookmarks);
        syncButtons();
        renderList();
    }

    function goToChapter(chId) {
        const sec = document.getElementById(chId);
        if (!sec) return;
        const hdr = document.querySelector(`.chapter-header[data-toggle="${chId}"]`);
        if (hdr && hdr.getAttribute('aria-expanded') === 'false') hdr.click();
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closePanel();
    }

    // ── drawer list ──────────────────────────────────────────
    function renderList() {
        const list = $('#bookmarksList');
        if (!list) return;
        const ids = Object.keys(bookmarks).sort((a, b) => bookmarks[a].ts - bookmarks[b].ts);
        if (!ids.length) {
            list.innerHTML = '<div class="bm-empty">🔖 এখনো কোনো বুকমার্ক নেই।<br>অধ্যায়ের শুরুতে “☆ বুকমার্ক করুন” টিপুন —<br>পরে এখান থেকে সরাসরি সেই অধ্যায়ে ফিরে যাবেন।</div>';
            return;
        }
        list.innerHTML = ids.map(id => {
            const bm = bookmarks[id];
            return `<div class="bm-item" data-ch="${escapeHtml(id)}">
              <span class="bm-item-star" aria-hidden="true">★</span>
              <span class="bm-item-body" data-role="bm-jump">
                <span class="bm-item-title">${escapeHtml(bm.numLabel ? bm.numLabel + ' · ' : '')}${escapeHtml(bm.title)}</span>
                <span class="bm-item-meta">সংরক্ষিত ${fmtTime(bm.ts)}</span>
              </span>
              <button type="button" class="bm-item-jump" data-role="bm-jump">যান →</button>
              <button type="button" class="bm-item-del" data-role="bm-del" aria-label="বুকমার্ক সরান">✕</button>
            </div>`;
        }).join('');
    }

    function openPanel() {
        renderList();
        $('#bookmarksPanel')?.classList.add('open');
        $('#bookmarksOverlay')?.classList.add('visible');
    }
    function closePanel() {
        $('#bookmarksPanel')?.classList.remove('open');
        $('#bookmarksOverlay')?.classList.remove('visible');
    }

    // ── events (delegated, survive re-render) ────────────────
    function wireEvents() {
        document.addEventListener('click', (e) => {
            const star = e.target.closest('.bm-btn');
            if (star) { toggle(star.dataset.bm); return; }
            const role = e.target.closest('[data-role="bm-jump"], [data-role="bm-del"]');
            if (role) {
                const item = role.closest('.bm-item');
                if (!item) return;
                if (role.dataset.role === 'bm-jump') goToChapter(item.dataset.ch);
                else toggle(item.dataset.ch);
            }
        });
        $('#btnBookmarks')?.addEventListener('click', openPanel);
        $('#btnCloseBookmarks')?.addEventListener('click', closePanel);
        $('#bookmarksOverlay')?.addEventListener('click', closePanel);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && $('#bookmarksPanel')?.classList.contains('open')) closePanel();
        });
    }

    window.EBOOK_BOOKMARKS = {
        toggle, openPanel, closePanel,
        size: () => Object.keys(bookmarks).length,
        version: APP_VERSION,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();

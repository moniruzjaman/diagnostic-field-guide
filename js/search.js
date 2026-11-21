/* ============================================================
   EBOOK_SEARCH — full-book search with exact navigation
   Index (built from rendered DOM at init):
   - chapters: title/subtitle/numLabel      → jump to chapter top
   - headings: any h2[id]/h3[id]            → jump to that section
   - images:   .figure (caption/alt + thumb)→ jump to the figure
   - text:     p/li/td/th block text        → jump to the block
   Matching is normalized (Bangla digits→latin, punctuation and
   ZWJ/ZWNJ stripped). Results live-update as you type; tapping a
   result expands its chapter, scrolls with re-anchoring and
   flashes the target. Works fully offline.
   ============================================================ */
(function () {
    'use strict';

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    let index = [];
    let built = false;
    let wired = false;
    let debounceTimer = null;
    let items = [];   // current result list, parallel to rendered DOM buttons

    // Bangla digits → latin so "সারণি 1" finds "সারণি ১"
    function normalize(s) {
        return (s || '')
            .toLowerCase()
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"“”’‘—–…؟?।]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function bn(n) { try { return n.toLocaleString('bn-BD'); } catch (e) { return String(n); } }

    function chapters() {
        try { return (typeof EBOOK_CONTENT !== 'undefined' && EBOOK_CONTENT.chapters) || []; }
        catch (e) { return []; }
    }

    // ── Index build ──────────────────────────────────────────
    function buildIndex() {
        index = [];
        chapters().forEach(ch => {
            const body = document.getElementById('body-' + ch.id);
            if (!body) return;
            const chLabel = `${ch.numLabel} · ${ch.title}`;
            index.push({ type: 'chapter', el: document.getElementById(ch.id), title: ch.title, sub: ch.subtitle || '', chId: ch.id, chLabel, text: normalize(`${ch.numLabel} ${ch.title} ${ch.subtitle || ''}`) });

            $$('h2[id], h3[id]', body).forEach(h => {
                index.push({ type: 'heading', el: h, title: h.textContent.trim(), sub: chLabel, chId: ch.id, chLabel, text: normalize(h.textContent) });
            });

            $$('.figure', body).forEach((fig, fi) => {
                const cap = fig.querySelector('figcaption')?.textContent.trim() || fig.querySelector('img')?.alt || '';
                index.push({ type: 'image', el: fig, title: cap, sub: chLabel, chId: ch.id, chLabel, src: fig.querySelector('img')?.getAttribute('src') || '', text: normalize(cap) });
            });

            $$('p, li, td, th', body).forEach(block => {
                if (block.closest('.nf-block')) return;           // notes UI, not book text
                if (block.closest('blockquote') && block.tagName !== 'P') return;
                const raw = block.textContent.trim();
                if (raw.length < 8) return;
                index.push({ type: 'text', el: block, title: raw, sub: chLabel, chId: ch.id, chLabel, text: normalize(raw) });
            });
        });
        built = true;
    }

    // ── Matching ─────────────────────────────────────────────
    function search(q) {
        const nq = normalize(q);
        if (nq.length < 2) return null;
        const heads = [], imgs = [], texts = [];
        for (const item of index) {
            if (!item.text.includes(nq)) continue;
            if (item.type === 'heading' || item.type === 'chapter') heads.push(item);
            else if (item.type === 'image') imgs.push(item);
            else texts.push(item);
        }
        return { heads: heads.slice(0, 12), imgs: imgs.slice(0, 12), texts: texts.slice(0, 20), total: heads.length + imgs.length + texts.length };
    }

    // mark first occurrence of the query's first word in raw text
    function markSnippet(raw, q) {
        const tok = (q || '').trim().split(/\s+/)[0] || '';
        if (tok.length < 2 || !raw) return escapeHtml(raw.slice(0, 110));
        const low = raw.toLowerCase();
        const i = low.indexOf(tok.toLowerCase());
        if (i < 0) return escapeHtml(raw.slice(0, 110));
        const start = Math.max(0, i - 35);
        const end = Math.min(raw.length, i + tok.length + 55);
        const seg = raw.slice(start, end);
        const j = seg.toLowerCase().indexOf(tok.toLowerCase());
        const out = escapeHtml(seg.slice(0, j)) + '<mark>' + escapeHtml(seg.slice(j, j + tok.length)) + '</mark>' + escapeHtml(seg.slice(j + tok.length));
        return (start > 0 ? '…' : '') + out + (end < raw.length ? '…' : '');
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }

    // ── Render results ───────────────────────────────────────
    function render(res, q) {
        const box = $('#searchResults');
        if (!res) {
            box.innerHTML = '<div class="search-empty">🔍 লিখুন — যেমন: “পাতা কোঁকড়ানো”, “এফিড”, “সারণি ৩”, “ছবি”</div>';
            items = [];
            return;
        }
        if (!res.total) {
            box.innerHTML = `<div class="search-empty">কোনো ফলাফল নেই — “${escapeHtml(q)}”</div>`;
            items = [];
            return;
        }
        items = [];
        let html = `<div class="search-count">${bn(res.total)}টি ফলাফল</div>`;

        const pushGroup = (label, arr, cls) => {
            if (!arr.length) return;
            html += `<div class="search-group">${label}</div>`;
            arr.forEach(item => {
                const i = items.length;
                items.push(item);
                if (item.type === 'image') {
                    html += `<button type="button" class="search-item ${cls}" data-i="${i}">
              <img class="search-thumb" src="${escapeHtml(item.src)}" alt="" loading="lazy">
              <span class="search-item-body"><span class="search-item-title">${markSnippet(item.title, q)}</span>
              <span class="search-item-sub">🖼️ ${escapeHtml(item.chLabel)}</span></span>
            </button>`;
                } else {
                    const icon = item.type === 'chapter' ? '📖' : item.type === 'heading' ? '📄' : '✏️';
                    html += `<button type="button" class="search-item ${cls}" data-i="${i}">
              <span class="search-item-body"><span class="search-item-title">${icon} ${markSnippet(item.title, q)}</span>
              <span class="search-item-sub">${escapeHtml(item.sub)}</span></span>
            </button>`;
                }
            });
        };

        pushGroup('অধ্যায় ও সেকশন', res.heads, 'is-head');
        pushGroup('ছবি', res.imgs, 'is-img');
        pushGroup('লেখায় মেলা', res.texts, 'is-text');
        box.innerHTML = html;
    }

    // ── Navigation ───────────────────────────────────────────
    function goTo(item) {
        closeSearch();
        const owner = item.el.closest ? (item.el.closest('.chapter') || item.el.closest('section')) : null;
        if (owner) {
            const head = owner.querySelector('.chapter-header');
            if (head && head.getAttribute('aria-expanded') === 'false') head.click();
        }
        setTimeout(() => {
            let tries = 0;
            const anchor = () => {
                const r = item.el.getBoundingClientRect();
                return r.top > -60 && r.top < window.innerHeight * 0.5;
            };
            const re = setInterval(() => {
                if (++tries >= 16 || anchor()) { clearInterval(re); }
                else item.el.scrollIntoView({ behavior: 'instant', block: item.type === 'text' ? 'center' : 'start' });
            }, 350);
            item.el.scrollIntoView({ behavior: 'instant', block: item.type === 'text' ? 'center' : 'start' });
            item.el.classList.add('search-hit');
            setTimeout(() => item.el.classList.remove('search-hit'), 2400);
        }, 220);
    }

    // ── Panel open/close ─────────────────────────────────────
    function openSearch() {
        if (!built) buildIndex();
        $('#searchPanel').classList.add('open');
        $('#searchOverlay').classList.add('visible');
        const input = $('#searchInput');
        input.focus();
        input.select();
    }
    function closeSearch() {
        $('#searchPanel').classList.remove('open');
        $('#searchOverlay').classList.remove('visible');
        $('#searchInput')?.blur();
    }

    // ── Events ───────────────────────────────────────────────
    function wire() {
        if (wired) return;
        wired = true;

        $('#btnSearch')?.addEventListener('click', openSearch);
        $('#btnSearchClose')?.addEventListener('click', closeSearch);
        $('#searchOverlay')?.addEventListener('click', closeSearch);

        $('#searchInput')?.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const q = e.target.value;
            debounceTimer = setTimeout(() => render(search(q), q), 180);
        });

        $('#searchResults')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.search-item');
            if (!btn) return;
            const item = items[parseInt(btn.dataset.i, 10)];
            if (item) goTo(item);
        });

        document.addEventListener('keydown', (e) => {
            // Escape must close the panel even when focus is in the search input
            if (e.key === 'Escape' && $('#searchPanel').classList.contains('open')) {
                if (e.target.id === 'searchInput' || !e.target.matches('input, textarea, select')) {
                    closeSearch();
                }
                return;
            }
            if (e.target.matches('input, textarea, select')) return;
            if (e.key === '/') {
                e.preventDefault();
                openSearch();
            }
        });
    }

    window.EBOOK_SEARCH = { open: openSearch, close: closeSearch, buildIndex };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { buildIndex(); wire(); });
    } else {
        buildIndex(); wire();
    }
})();

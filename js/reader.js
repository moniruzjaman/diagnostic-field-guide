/* ============================================================
   Reader — main controller (উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড)
   - Renders chapters from EBOOK_CONTENT
   - Manages TOC sidebar, settings panel, share modal
   - Audio (TTS) playback UI
   - Reading progress, scroll spy, persistent settings
   - PWA: offline toast, install prompt, image precache
   - Lightbox for diagnostic photos
   ============================================================ */

(function () {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ── State ──────────────────────────────────────────────────
    const state = {
        currentChapter: null,
        settings: {
            theme: localStorage.getItem('ebook-theme') || 'day',
            font: localStorage.getItem('ebook-font') || 'serif',
            fontSize: parseInt(localStorage.getItem('ebook-fontsize') || '17', 10),
            lineHeight: parseInt(localStorage.getItem('ebook-lineheight') || '180', 10) / 100,
        },
        audio: {
            visible: false,
            isPlaying: false,
            speed: 1.0,
        },
    };

    // ── Render book content ────────────────────────────────────
    const COLLAPSE_KEY = 'ebook-collapsed-chapters';

    function loadCollapsed() {
        try { return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '[]')); }
        catch (_) { return new Set(); }
    }
    function saveCollapsed(set) {
        try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set])); } catch (_) {}
    }
    let collapsedSet = loadCollapsed();

    function expandChapter(id, persist = true) {
        const sec = document.getElementById(id);
        if (!sec || !sec.classList.contains('chapter')) return;
        sec.classList.remove('collapsed');
        sec.querySelector('.chapter-header')?.setAttribute('aria-expanded', 'true');
        if (collapsedSet.delete(id) && persist) saveCollapsed(collapsedSet);
    }
    function collapseChapter(id, persist = true) {
        const sec = document.getElementById(id);
        if (!sec || !sec.classList.contains('chapter')) return;
        // Stop audio if the playing chapter is being folded away
        if (state.audio.isPlaying && EBOOK_TTS.currentChapter === id) stopAudio();
        sec.classList.add('collapsed');
        sec.querySelector('.chapter-header')?.setAttribute('aria-expanded', 'false');
        collapsedSet.add(id);
        if (persist) saveCollapsed(collapsedSet);
    }
    function toggleChapter(id) {
        const sec = document.getElementById(id);
        if (!sec) return;
        if (sec.classList.contains('collapsed')) {
            expandChapter(id);
        } else {
            collapseChapter(id);
            // Keep the header in view after the content collapses
            requestAnimationFrame(() => {
                const top = sec.getBoundingClientRect().top;
                if (top < 0 || top > window.innerHeight - 80) {
                    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

    function renderBook() {
        const root = $('#bookContent');
        const html = [];

        const renderChapter = (ch) => {
            const epigraph = ch.epigraph
                ? `<div class="epigraph">${ch.epigraph}</div>`
                : '';
            const isCollapsed = collapsedSet.has(ch.id) ? ' collapsed' : '';
            const chevron = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
            return `
<section class="chapter${isCollapsed}" id="${ch.id}" data-chapter="${ch.id}" data-num="${ch.numLabel}">
  <button type="button" class="chapter-header" data-toggle="${ch.id}" aria-expanded="${isCollapsed ? 'false' : 'true'}" aria-controls="body-${ch.id}">
    <span class="chapter-kicker">Plantwise · Diagnostic Field Guide · বাংলা</span>
    <span class="chapter-head-row">
      <span class="chapter-head-text">
        <span class="chapter-num">${ch.numLabel}</span>
        <h2 class="chapter-title">${ch.title}</h2>
        <p class="chapter-subtitle">${ch.subtitle}</p>
      </span>
      <span class="ch-chevron" aria-hidden="true">${chevron}</span>
    </span>
    <span class="chapter-hint">ভাঁজ করা আছে — খুলতে ট্যাপ করুন</span>
  </button>
  ${epigraph}
  <div class="chapter-body" id="body-${ch.id}">${ch.html}</div>
</section>`;
        };

        for (const ch of EBOOK_CONTENT.chapters) {
            html.push(renderChapter(ch));
        }

        root.innerHTML = html.join('\n');
    }

    // ── Render TOC sidebar ─────────────────────────────────────
    function renderToc() {
        const nav = $('#tocNav');
        const html = [];
        for (const item of EBOOK_TOC) {
            if (item.section) {
                html.push(`<div class="toc-section-header">${item.section}</div>`);
            } else {
                html.push(`
<a href="#${item.id}" class="toc-item" data-target="${item.id}">
  <span class="toc-num">${item.num}</span>
  <span class="toc-text-block">
    <span class="toc-item-title">${item.title}</span>
    <span class="toc-item-sub">${item.sub}</span>
  </span>
</a>`);
            }
        }
        nav.innerHTML = html.join('');
    }

    // ── Apply settings ─────────────────────────────────────────
    function applySettings() {
        document.documentElement.setAttribute('data-theme', state.settings.theme);
        document.documentElement.style.setProperty('--font-size', state.settings.fontSize + 'px');
        document.documentElement.style.setProperty('--line-height', state.settings.lineHeight);
        if (state.settings.font === 'sans') {
            document.documentElement.style.setProperty('--font-body', "'NotoSansBengali', sans-serif");
            document.documentElement.style.setProperty('--font-head', "'NotoSansBengali', sans-serif");
        } else {
            document.documentElement.style.setProperty('--font-body', "'NotoSerifBengali', serif");
            document.documentElement.style.setProperty('--font-head', "'NotoSansBengali', sans-serif");
        }
        $('#fontSizeRange').value = state.settings.fontSize;
        $('#fontSizeValue').textContent = state.settings.fontSize + 'px';
        $('#lineHeightRange').value = Math.round(state.settings.lineHeight * 100);
        $('#lineHeightValue').textContent = state.settings.lineHeight.toFixed(2);
        $$('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === state.settings.theme));
        $$('.font-btn').forEach(b => b.classList.toggle('active', b.dataset.font === state.settings.font));
    }

    // ── Sidebar / panel toggle helpers ────────────────────────
    function openToc() {
        $('#tocSidebar').classList.add('open');
        $('#tocOverlay').classList.add('visible');
    }
    function closeToc() {
        $('#tocSidebar').classList.remove('open');
        $('#tocOverlay').classList.remove('visible');
    }
    function openSettings() {
        $('#settingsPanel').classList.add('open');
        $('#settingsOverlay').classList.add('visible');
    }
    function closeSettings() {
        $('#settingsPanel').classList.remove('open');
        $('#settingsOverlay').classList.remove('visible');
    }

    // ── Share modal ────────────────────────────────────────────
    function openShare(chapterId) {
        $('#shareModal').classList.add('visible');
        $('#shareLinkInput').value = EBOOK_SHARE.chapterUrl(chapterId);
        const pv = $('#sharePreviewUrl');
        if (pv) {
            const pretty = EBOOK_SHARE.chapterUrl(chapterId).replace(/^https?:\/\//, '');
            pv.textContent = pretty.length > 42 ? pretty.slice(0, 42) + '…' : pretty;
        }
        $('#btnNativeShare').style.display = EBOOK_SHARE.isNativeSupported() ? '' : 'none';
    }
    function closeShare() {
        $('#shareModal').classList.remove('visible');
    }

    // ── Audio (TTS) UI ─────────────────────────────────────────
    function showAudioBar() {
        $('#audioBar').classList.add('visible');
        document.body.classList.add('audio-visible');
        state.audio.visible = true;
    }
    function hideAudioBar() {
        $('#audioBar').classList.remove('visible');
        document.body.classList.remove('audio-visible');
        state.audio.visible = false;
    }
    function setAudioPlayIcon(playing) {
        const icon = $('#audioPlayIcon');
        if (playing) {
            icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        } else {
            icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        }
    }
    function updateAudioProgress(pct) {
        $('#audioProgressFill').style.width = pct + '%';
    }

    function startChapterAudio(chapterId) {
        const all = EBOOK_CONTENT.chapters;
        const ch = all.find(c => c.id === chapterId);
        if (!ch || !ch.ttsText) {
            alert('এই অধ্যায়ের জন্য অডিও উপলব্ধ নেই।');
            return;
        }

        if (!EBOOK_TTS.init()) {
            alert('আপনার ব্রাউজারে Speech Synthesis সাপোর্ট নেই। অডিও ফিচার ব্যবহার করা যাবে না।');
            return;
        }

        if (state.audio.isPlaying && EBOOK_TTS.currentChapter === chapterId) {
            if (EBOOK_TTS.isPaused) {
                EBOOK_TTS.resume();
                setAudioPlayIcon(true);
            } else {
                EBOOK_TTS.pause();
                setAudioPlayIcon(false);
            }
            return;
        }

        EBOOK_TTS.stop();

        $('#audioTitle').textContent = ch.title;
        showAudioBar();
        setAudioPlayIcon(true);
        state.audio.isPlaying = true;

        EBOOK_TTS.onProgress = (info) => {
            updateAudioProgress(info.progress);
        };
        EBOOK_TTS.onEnd = (cid) => {
            setAudioPlayIcon(false);
            state.audio.isPlaying = false;
            updateAudioProgress(100);
            setTimeout(() => {
                if (EBOOK_TTS.currentChapter === cid) {
                    updateAudioProgress(0);
                }
            }, 1500);
        };

        EBOOK_TTS.play(chapterId, ch.ttsText, { speed: state.audio.speed });
    }

    function stopAudio() {
        EBOOK_TTS.stop();
        setAudioPlayIcon(false);
        state.audio.isPlaying = false;
        updateAudioProgress(0);
        hideAudioBar();
    }

    // ── Progress bar + scroll spy ──────────────────────────────
    function onScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        $('#progressBar').style.width = Math.min(100, pct) + '%';

        const chapters = $$('section.chapter, section.hero');
        let current = null;
        for (const ch of chapters) {
            const rect = ch.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.35) {
                current = ch;
            } else {
                break;
            }
        }
        if (current && current.id !== state.currentChapter) {
            state.currentChapter = current.id;
            updateActiveToc(current.id);
            const data = current.dataset;
            if (data && data.num) {
                $('#topbarChapter').textContent = data.num + ' · ' + (current.querySelector('.chapter-title')?.textContent || '');
            } else if (current.id === 'hero') {
                $('#topbarChapter').textContent = EBOOK_CONTENT.subtitle;
            }
        }
    }

    function updateActiveToc(chapterId) {
        $$('.toc-item').forEach(item => {
            item.classList.toggle('active', item.dataset.target === chapterId);
        });
        const sidebarOpen = $('#tocSidebar').classList.contains('open');
        const active = $('.toc-item.active');
        if (active && sidebarOpen) {
            const nav = $('#tocNav');
            const navRect = nav.getBoundingClientRect();
            const itemRect = active.getBoundingClientRect();
            if (itemRect.top < navRect.top || itemRect.bottom > navRect.bottom) {
                active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    // ── Lightbox (diagnostic photos) ───────────────────────────
    function openLightbox(src, caption) {
        $('#lightboxImg').src = src;
        $('#lightboxImg').alt = caption || '';
        $('#lightboxCaption').textContent = caption || '';
        $('#lightbox').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        $('#lightbox').classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── Offline toast + install prompt + image precache ───────
    function updateOnlineStatus() {
        const t = $('#offlineToast');
        if (!navigator.onLine) {
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 4000);
        }
    }

    let deferredPrompt = null;
    function wireInstall() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const btn = $('#btnInstall');
            if (btn) btn.style.display = '';
        });
        $('#btnInstall')?.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                $('#btnInstall').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }

    function precacheImages() {
        // Send all book image URLs to the SW so the guide is fully offline
        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
        const urls = (EBOOK_CONTENT.photoUrls || []).map(p => new URL(p, location.href).href);
        if (!urls.length) return;
        // chunk to avoid huge messages
        for (let i = 0; i < urls.length; i += 60) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PRECACHE_IMAGES',
                urls: urls.slice(i, i + 60)
            });
        }
        try { localStorage.setItem('ebook-precache-attempted', '1'); } catch (_) {}
    }

    // ── Event wiring ───────────────────────────────────────────
    function wireEvents() {
        $('#btnToc').addEventListener('click', openToc);
        $('#btnCloseToc').addEventListener('click', closeToc);
        $('#tocOverlay').addEventListener('click', closeToc);

        $('#btnSettings').addEventListener('click', openSettings);
        $('#btnCloseSettings').addEventListener('click', closeSettings);
        $('#settingsOverlay').addEventListener('click', closeSettings);

        $('#btnShare').addEventListener('click', () => openShare(state.currentChapter));
        $('#fabShare').addEventListener('click', () => openShare(state.currentChapter));
        $('#btnCloseShare').addEventListener('click', closeShare);
        $('#shareModal').addEventListener('click', (e) => {
            if (e.target.id === 'shareModal') closeShare();
        });

        $('#btnAudio').addEventListener('click', () => {
            if (state.currentChapter && state.currentChapter !== 'hero') {
                startChapterAudio(state.currentChapter);
            } else {
                startChapterAudio('ch1');
                document.getElementById('ch1')?.scrollIntoView({ behavior: 'smooth' });
            }
        });

        $('#audioPlay').addEventListener('click', () => {
            if (state.audio.isPlaying) {
                if (EBOOK_TTS.isPaused) {
                    EBOOK_TTS.resume();
                    setAudioPlayIcon(true);
                } else {
                    EBOOK_TTS.pause();
                    setAudioPlayIcon(false);
                }
            } else if (EBOOK_TTS.currentChapter) {
                EBOOK_TTS.resume();
                setAudioPlayIcon(true);
            }
        });
        $('#audioStop').addEventListener('click', stopAudio);
        $('#audioSpeed').addEventListener('change', (e) => {
            state.audio.speed = parseFloat(e.target.value);
            EBOOK_TTS.setSpeed(state.audio.speed);
        });
        $('#audioProgress').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            updateAudioProgress(pct);
        });

        $$('.share-btn[data-share]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const platform = btn.dataset.share;
                if (platform === 'copy') {
                    const ok = await EBOOK_SHARE.copyLink();
                    btn.querySelector('span').textContent = ok ? 'কপি হয়েছে!' : 'ব্যর্থ';
                    setTimeout(() => btn.querySelector('span').textContent = 'লিঙ্ক কপি', 1500);
                } else {
                    await EBOOK_SHARE.share(platform, { chapter: state.currentChapter });
                }
            });
        });
        $('#btnCopyLink').addEventListener('click', async () => {
            const ok = await EBOOK_SHARE.copyLink();
            $('#btnCopyLink').textContent = ok ? '✓ কপি হয়েছে' : '✗ ব্যর্থ';
            setTimeout(() => $('#btnCopyLink').textContent = 'কপি', 1500);
        });

        $('#btnHeroStart').addEventListener('click', () => {
            document.getElementById('ch1')?.scrollIntoView({ behavior: 'smooth' });
            closeToc();
        });
        $('#btnHeroListen').addEventListener('click', () => {
            startChapterAudio('ch1');
            document.getElementById('ch1')?.scrollIntoView({ behavior: 'smooth' });
        });
        $('#btnHeroShare').addEventListener('click', () => openShare(null));
        $('#btnStartReading').addEventListener('click', () => {
            closeToc();
            document.getElementById('ch1')?.scrollIntoView({ behavior: 'smooth' });
        });

        $('#btnEndShare').addEventListener('click', () => openShare(null));
        $('#btnEndRestart').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Lightbox
        document.addEventListener('click', (e) => {
            const img = e.target.closest('.figure img');
            if (img) {
                const fig = img.closest('.figure');
                const cap = fig?.querySelector('figcaption')?.textContent.trim() || '';
                openLightbox(img.src, cap);
            }
        });
        $('#btnLightboxClose').addEventListener('click', closeLightbox);
        $('#lightbox').addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') closeLightbox();
        });

        // Collapsible chapters: header tap folds/unfolds the section
        document.addEventListener('click', (e) => {
            const head = e.target.closest('.chapter-header[data-toggle]');
            if (head) toggleChapter(head.dataset.toggle);
        });
        $('#btnExpandAll')?.addEventListener('click', () => {
            EBOOK_CONTENT.chapters.forEach(ch => expandChapter(ch.id));
        });
        $('#btnCollapseAll')?.addEventListener('click', () => {
            EBOOK_CONTENT.chapters.forEach(ch => collapseChapter(ch.id));
            document.getElementById('ch1')?.scrollIntoView({ behavior: 'smooth' });
        });

        // Settings: theme
        $$('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.settings.theme = btn.dataset.theme;
                localStorage.setItem('ebook-theme', state.settings.theme);
                applySettings();
            });
        });
        $$('.font-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.settings.font = btn.dataset.font;
                localStorage.setItem('ebook-font', state.settings.font);
                applySettings();
            });
        });
        $('#fontSizeRange').addEventListener('input', (e) => {
            state.settings.fontSize = parseInt(e.target.value, 10);
            localStorage.setItem('ebook-fontsize', state.settings.fontSize);
            applySettings();
        });
        $('#btnFontInc').addEventListener('click', () => {
            state.settings.fontSize = Math.min(24, state.settings.fontSize + 1);
            localStorage.setItem('ebook-fontsize', state.settings.fontSize);
            applySettings();
        });
        $('#btnFontDec').addEventListener('click', () => {
            state.settings.fontSize = Math.max(14, state.settings.fontSize - 1);
            localStorage.setItem('ebook-fontsize', state.settings.fontSize);
            applySettings();
        });
        $('#lineHeightRange').addEventListener('input', (e) => {
            state.settings.lineHeight = parseInt(e.target.value, 10) / 100;
            localStorage.setItem('ebook-lineheight', e.target.value);
            applySettings();
        });

        // TOC item clicks
        document.addEventListener('click', (e) => {
            const tocItem = e.target.closest('.toc-item');
            if (tocItem) {
                e.preventDefault();
                const target = tocItem.dataset.target;
                expandChapter(target);           // TOC always opens the chapter it points to
                closeToc();
                setTimeout(() => {
                    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
                    history.replaceState(null, '', '#' + target);
                }, 200);
            }
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input, textarea, select')) return;
            switch (e.key) {
                case 'Escape':
                    if ($('#lightbox').classList.contains('open')) closeLightbox();
                    else if ($('#shareModal').classList.contains('visible')) closeShare();
                    else if ($('#tocSidebar').classList.contains('open')) closeToc();
                    else if ($('#settingsPanel').classList.contains('open')) closeSettings();
                    break;
                case 'm':
                case 'M':
                    if (!$('#tocSidebar').classList.contains('open')) openToc();
                    else closeToc();
                    break;
                case 's':
                case 'S':
                    if (!$('#settingsPanel').classList.contains('open')) openSettings();
                    else closeSettings();
                    break;
                case 't':
                case 'T':
                    if (state.currentChapter && state.currentChapter !== 'hero') {
                        startChapterAudio(state.currentChapter);
                    }
                    break;
                case 'c':
                case 'C':
                    if (state.currentChapter && state.currentChapter !== 'hero') {
                        toggleChapter(state.currentChapter);
                    }
                    break;
            }
        });
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        renderBook();
        renderToc();
        applySettings();
        wireEvents();
        wireInstall();
        onScroll();

        const hash = window.location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            setTimeout(() => {
                document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
            }, 400);
        }

        if (window.EBOOK_TTS) EBOOK_TTS.init();
        updateOnlineStatus();

        // Precache book photos in the background (full offline support)
        if (!localStorage.getItem('ebook-precache-attempted')) {
            setTimeout(precacheImages, 3000);
        }

        console.log('%c🌿 উদ্ভিদ রোগনির্ণয় ফিল্ড গাইড — বাংলা ই-বুক', 'color:#006A4E;font-weight:bold;font-size:14px');
        console.log('Shortcuts: M=সূচিপত্র · S=সেটিংস · T=শুনুন · C=অধ্যায় ভাঁজ · Esc=বন্ধ');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

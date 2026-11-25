/* ============================================================
   Service Worker — offline-first PWA for the Bangla field guide
   Strategy:
   - precache: app shell (html, css, js, fonts, icons, og image)
   - content.js + images: cache-first with runtime caching
     (content.js is precached too — it is the whole book)
   - images: cache-first, populated on first view; they are part
     of the book so "offline" means they were viewed (or precached
     via the idle preloader) at least once.
   - navigation fallback: index.html (single-page app)
   ============================================================ */

const VERSION = 'v2.1.4';
const SHELL_CACHE = `pwdfg-shell-${VERSION}`;
const IMG_CACHE = `pwdfg-img-${VERSION}`;

const SHELL_ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './handbook.html',
    './field-diagnosis.html',
    './css/field-diagnosis.css',
    './js/field-diagnosis.js',
    './manifest.webmanifest',
    './css/reader.css',
    './js/content.js',
    './js/tts.js',
    './js/share.js',
    './js/reader.js',
    './js/notes.js',
    './js/bookmarks.js',
    './js/search.js',
    './diagnosis-wizard.html',
    './css/diagnosis-wizard.css',
    './js/cause-database.js',
    './js/diagnosis-wizard.js',
    './js/cause-database.json',
    // Phase 2: Symptom Matcher assets
    './symptom-matcher.html',
    './css/symptom-matcher.css',
    './js/symptom-matcher.js',
    // Phase 3: Voice input & glossary assets
    './js/voice-input.js',
    './js/voice-glossary.js',
    // Phase 4: Expert escalation agent directory
    './js/extension-directory.json',
    // v2.0.3: Table-3 causal-agent gallery photos (precached for offline use)
    './img/p025_49.jpg',
    './img/p034_81.jpg',
    './img/p034_82.jpg',
    './img/p034_83.jpg',
    './img/p042_104.jpg',
    './img/p097_176.jpg',
    './img/p097_177.jpg',
    './img/p097_178.jpg',
    './img/p097_179.jpg',
    './img/p099_184.jpg',
    './img/p099_185.jpg',
    './img/p099_186.jpg',
    './img/p099_187.jpg',
    './img/p100_190.jpg',
    './img/p100_191.jpg',
    './img/p100_192.jpg',
    './img/p100_193.jpg',
    './img/p102_200.jpg',
    './img/p102_201.jpg',
    './img/p102_202.jpg',
    './img/p102_203.jpg',
    './img/p107_229.jpg',
    './img/p107_230.jpg',
    './img/p107_231.jpg',
    './img/p107_232.jpg',
    './img/p108_233.jpg',
    './img/p108_234.jpg',
    './img/p108_235.jpg',
    './img/p108_236.jpg',
    './img/p108_237.jpg',
    './img/p108_238.jpg',
    './img/p108_239.jpg',
    './img/p108_240.jpg',
    './img/p108_241.jpg',
    './img/p109_242.jpg',
    './img/p109_243.jpg',
    './img/p109_244.jpg',
    './img/p109_245.jpg',
    './img/p112_256.jpg',
    './img/p112_257.jpg',
    './img/p112_258.jpg',
    './img/p112_259.jpg',
    './img/p113_260.jpg',
    './img/p113_261.jpg',
    './img/p113_262.jpg',
    './img/p113_263.jpg',
    './img/p113_264.jpg',
    './img/p113_265.jpg',
    './img/p026_50.jpg',
    './img/p026_53.jpg',
    './img/p035_84.jpg',
    './img/p035_85.jpg',
    './img/p051_132.jpg',
    './img/p060_153.jpg',
    './img/p036_86.jpg',
    './img/p036_87.jpg',
    './img/p057_144.jpg',
    './img/p057_145.jpg',
    './img/p111_250.jpg',
    './img/p111_251.jpg',
    './img/p111_252.jpg',
    './img/p111_253.jpg',
    './img/p111_254.jpg',
    './img/p111_255.jpg',
    './img/p114_266.jpg',
    './img/p114_267.jpg',
    './img/p114_268.jpg',
    './img/p114_269.jpg',
    './img/p114_270.jpg',
    './img/p114_271.jpg',
    './img/p036_88.jpg',
    './img/p036_89.jpg',
    './img/p043_108.jpg',
    './img/p043_109.jpg',
    './img/p052_134.jpg',
    './img/p055_141.jpg',
    './img/p061_155.jpg',
    './img/p096_172.jpg',
    './img/p096_173.jpg',
    './img/p096_174.jpg',
    './img/p096_175.jpg',
    './img/p098_180.jpg',
    './img/p098_181.jpg',
    './img/p098_182.jpg',
    './img/p098_183.jpg',
    './img/p105_217.jpg',
    './img/p105_218.jpg',
    './img/p105_219.jpg',
    './img/p105_220.jpg',
    './img/p105_221.jpg',
    './img/p105_222.jpg',
    './img/p040_99.jpg',
    './img/p061_156.jpg',
    './img/p104_213.jpg',
    './img/p104_214.jpg',
    './img/p104_215.jpg',
    './img/p104_216.jpg',
    './img/p058_147.jpg',
    './img/p037_90.jpg',
    './img/p037_91.jpg',
    './img/p062_157.jpg',
    './img/p101_196.jpg',
    './img/p101_197.jpg',
    './img/p101_198.jpg',
    './img/p101_199.jpg',
    './img/p110_246.jpg',
    './img/p110_247.jpg',
    './img/p110_248.jpg',
    './img/p110_249.jpg',
    './img/p044_110.jpg',
    './img/p046_114.jpg',
    './img/p046_115.jpg',
    './img/p046_116.jpg',
    './img/p056_143.jpg',
    './img/p059_148.jpg',
    './img/p059_149.jpg',
    './img/p103_204.jpg',
    './img/p103_205.jpg',
    './img/p103_206.jpg',
    './img/p103_207.jpg',
    './img/p103_208.jpg',
    './img/p103_209.jpg',
    './img/p103_210.jpg',
    './img/p103_211.jpg',
    './img/p103_212.jpg',
    './img/p023_16.jpg',
    './img/p023_17.jpg',
    './img/p023_18.jpg',
    './img/p023_19.jpg',
    './img/p023_20.jpg',
    './img/p023_21.jpg',
    './img/p023_22.jpg',
    './img/p023_23.jpg',
    './img/p023_24.jpg',
    './img/p023_25.jpg',
    './img/p023_26.jpg',
    './img/p023_27.jpg',
    './img/p023_28.jpg',
    './img/p023_29.jpg',
    './img/p023_30.jpg',
    './img/p023_31.jpg',
    './img/p023_32.jpg',
    './img/p023_33.jpg',
    './img/p023_34.jpg',
    './img/p023_35.jpg',
    './img/p023_36.jpg',
    './img/p023_37.jpg',
    './img/p023_38.jpg',
    './img/p023_39.jpg',
    './img/p023_40.jpg',
    './img/p023_41.jpg',
    './img/p023_42.jpg',
    './img/p023_43.jpg',
    './img/p023_44.jpg',
    './img/p023_45.jpg',
    './img/p023_46.jpg',
    './img/p038_92.jpg',
    './img/p038_93.jpg',
    './img/p038_94.jpg',
    './img/p044_111.jpg',
    './img/p044_112.jpg',
    './img/p044_113.jpg',
    './img/p048_122.jpg',
    './img/p048_123.jpg',
    './img/p048_124.jpg',
    './img/p094_162.jpg',
    './img/p094_163.jpg',
    './img/p094_164.jpg',
    './img/p094_165.jpg',
    './img/p095_166.jpg',
    './img/p095_167.jpg',
    './img/p095_168.jpg',
    './img/p095_169.jpg',
    './img/p095_170.jpg',
    './img/p106_223.jpg',
    './img/p106_224.jpg',
    './img/p106_225.jpg',
    './img/p106_226.jpg',
    './img/p106_227.jpg',
    './img/p039_95.jpg',
    './img/p039_96.jpg',
    './img/p050_129.jpg',
    './img/p093_158.jpg',
    './img/p093_159.jpg',
    './img/p093_160.jpg',
    './img/p093_161.jpg',
    './og-image.jpg',
    './icons/favicon-32.png',
    './icons/apple-touch-icon.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png',
    './fonts/NotoSansBengali-400-bengali.woff2',
    './fonts/NotoSansBengali-400-latin.woff2',
    './fonts/NotoSansBengali-700-bengali.woff2',
    './fonts/NotoSansBengali-700-latin.woff2',
    './fonts/NotoSerifBengali-400-bengali.woff2',
    './fonts/NotoSerifBengali-400-latin.woff2',
    './fonts/NotoSerifBengali-700-bengali.woff2',
    './fonts/NotoSerifBengali-700-latin.woff2',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then(async (cache) => {
            // cache shell one-by-one so one failure doesn't abort install
            for (const url of SHELL_ASSETS) {
                try {
                    await cache.add(new Request(url, { cache: 'reload' }));
                } catch (e) {
                    console.warn('precache failed:', url, e);
                }
            }
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== SHELL_CACHE && k !== IMG_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

function isImageRequest(url) {
    return (
        url.pathname.includes('/img/') ||
        /\.(jpe?g|png|gif|webp|svg)$/i.test(url.pathname)
    );
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // same-origin only — cross-origin requests (share endpoints, GA4 gtag.js
    // and google-analytics.com collection hits) bypass the SW completely,
    // untouched by cache logic
    if (url.origin !== self.location.origin) return;

    // navigations → network first, fall back to cached index (offline)
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() =>
                    caches.match(req, { ignoreSearch: true })
                        .then((page) => page || caches.match('./index.html', { ignoreSearch: true }))
                        .then((r) => r || caches.match('./'))
                )
        );
        return;
    }

    // images → cache-first (book photos)
    if (isImageRequest(url)) {
        event.respondWith(
            caches.match(req).then(
                (hit) =>
                    hit ||
                    fetch(req).then((res) => {
                        if (res.ok) {
                            const copy = res.clone();
                            caches.open(IMG_CACHE).then((c) => c.put(req, copy));
                        }
                        return res;
                    })
            )
        );
        return;
    }

    // everything else (css/js/fonts/manifest) → cache-first with network refresh
    event.respondWith(
        caches.match(req).then((hit) => {
            const fetching = fetch(req)
                .then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => hit);
            return hit || fetching;
        })
    );
});

// Allow the page to trigger full image precache (idle loader)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRECACHE_IMAGES' && Array.isArray(event.data.urls)) {
        const urls = event.data.urls;
        event.waitUntil(
            caches.open(IMG_CACHE).then(async (cache) => {
                for (const u of urls) {
                    try {
                        const hit = await cache.match(u);
                        if (!hit) await cache.add(u);
                    } catch (e) { /* ignore individual failures */ }
                }
                const clientList = await self.clients.matchAll();
                clientList.forEach((c) => c.postMessage({ type: 'PRECACHE_DONE', count: urls.length }));
            })
        );
    }
});

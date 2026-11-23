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

const VERSION = 'v1.8.0';
const SHELL_CACHE = `pwdfg-shell-${VERSION}`;
const IMG_CACHE = `pwdfg-img-${VERSION}`;

const SHELL_ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './manifest.webmanifest',
    './css/reader.css',
    './js/content.js',
    './js/tts.js',
    './js/share.js',
    './js/reader.js',
    './js/notes.js',
    './js/bookmarks.js',
    './js/search.js',
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
                    const copy = res.clone();
                    caches.open(SHELL_CACHE).then((c) => c.put('./index.html', copy));
                    return res;
                })
                .catch(() =>
                    caches.match('./index.html', { ignoreSearch: true })
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

/* ============================================================
   Image Picker — offline visual evidence for the diagnosis wizard
   - Device camera/gallery + drag-drop + bundled sample gallery
   - Client-side downscale to ~800px JPEG
   - Blob stored in IndexedDB (NOT localStorage — avoids quota)
   - 100% offline: no fetch, no server, no AI identification
   Exposes window.WIZARD_IMAGE_PICKER:
     .get()        -> Promise<{dataUrl, name} | null>
     .clear()      -> Promise<void>
     .onChange(cb) -> subscribe to selection changes
   ============================================================ */

(function (root) {
  'use strict';

  const DB_NAME = 'pwdfg-wizard-images';
  const STORE = 'evidence';
  const CASE_KEY = 'current-case';
  const MAX_DIM = 800;
  const JPEG_Q = 0.72;

  // Bundled specimens already precached by sw.js (img/ folder).
  const SAMPLES = [
    { src: 'img/p015_00.jpg', label: 'কাজুবাদামের পাতার দাগ' },
    { src: 'img/p026_50.jpg', label: 'টমেটো ব্লাইট' },
    { src: 'img/p043_106.jpg', label: 'ভুট্টা মোজাইক' },
    { src: 'img/p100_190.jpg', label: 'শিমের মরিচা' }
  ];

  let dbPromise = null;
  const listeners = [];
  let current = null; // { dataUrl, name }

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!root.indexedDB) return reject(new Error('IndexedDB unavailable'));
      const req = root.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function idbPut(value) {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, CASE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    }));
  }

  function idbGet() {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(CASE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    }));
  }

  function idbClear() {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(CASE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    }));
  }

  // Downscale + re-encode to keep the stored blob small.
  function downscale(file) {
    return new Promise((resolve, reject) => {
      const reader = new root.FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new root.Image();
        img.onerror = () => reject(new Error('image decode failed'));
        img.onload = () => {
          let { width, height } = img;
          if (Math.max(width, height) > MAX_DIM) {
            const scale = MAX_DIM / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = root.document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', JPEG_Q));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Load a bundled sample (same-origin asset) through the same downscale path.
  function loadSample(src) {
    return new Promise((resolve, reject) => {
      const img = new root.Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => reject(new Error('sample load failed'));
      img.onload = () => {
        let { width, height } = img;
        if (Math.max(width, height) > MAX_DIM) {
          const scale = MAX_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = root.document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_Q));
      };
      img.src = src;
    });
  }

  function emit() { listeners.forEach((cb) => { try { cb(current); } catch (e) { console.warn(e); } }); }

  function setSelection(dataUrl, name) {
    current = dataUrl ? { dataUrl, name: name || 'sample' } : null;
    if (current) idbPut(current).catch((e) => console.warn('idb put failed', e));
    else idbClear().catch((e) => console.warn('idb clear failed', e));
    render();
    emit();
  }

  function render() {
    const drop = root.document.getElementById('pickerDrop');
    const preview = root.document.getElementById('pickerPreview');
    const img = root.document.getElementById('pickerPreviewImg');
    const status = root.document.getElementById('pickerStatus');
    if (!drop || !preview || !img) return;
    if (current) {
      drop.hidden = true;
      preview.hidden = false;
      img.src = current.dataUrl;
      if (status) status.textContent = 'ছবি সংযুক্ত হয়েছে · ' + (current.name || '');
    } else {
      drop.hidden = false;
      preview.hidden = true;
      img.removeAttribute('src');
      if (status) status.textContent = '';
    }
  }

  function wire() {
    const drop = root.document.getElementById('pickerDrop');
    const file = root.document.getElementById('pickerFile');
    const gallery = root.document.getElementById('pickerGallery');
    const replaceBtn = root.document.getElementById('pickerReplace');
    const removeBtn = root.document.getElementById('pickerRemove');
    if (!drop || !file) return;

    const status = root.document.getElementById('pickerStatus');
    const fail = (e) => { console.warn(e); if (status) status.textContent = 'ছবি পড়া যায়নি। অন্য ছবি চেষ্টা করুন।'; };

    drop.addEventListener('click', () => file.click());
    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('is-drag'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('is-drag');
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) downscale(f).then((d) => setSelection(d, f.name)).catch(fail);
    });
    file.addEventListener('change', () => {
      const f = file.files && file.files[0];
      if (f) downscale(f).then((d) => setSelection(d, f.name)).catch(fail);
      file.value = '';
    });
    replaceBtn && replaceBtn.addEventListener('click', () => file.click());
    removeBtn && removeBtn.addEventListener('click', () => setSelection(null));

    if (gallery) {
      gallery.innerHTML = SAMPLES.map((s, i) =>
        `<button type="button" class="picker-thumb" data-sample="${i}"><img src="${s.src}" alt="${s.label}" loading="lazy"><span>${s.label}</span></button>`
      ).join('');
      gallery.addEventListener('click', (e) => {
        const btn = e.target.closest('.picker-thumb');
        if (!btn) return;
        const s = SAMPLES[Number(btn.dataset.sample)];
        loadSample(s.src).then((d) => setSelection(d, s.label)).catch(fail);
      });
    }

    // Restore any saved evidence for this case.
    idbGet().then((saved) => { if (saved && saved.dataUrl) { current = saved; render(); emit(); } }).catch(() => {});
  }

  function init() {
    wire();
    render();
  }

  root.WIZARD_IMAGE_PICKER = {
    get: () => Promise.resolve(current),
    clear: () => setSelection(null),
    onChange: (cb) => { if (typeof cb === 'function') listeners.push(cb); }
  };

  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
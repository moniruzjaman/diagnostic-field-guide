/* ============================================================
   Cause Database loader — loads js/cause-database.json
   Exposes window.CAUSE_DB_PROMISE (resolves to the parsed JSON).
   Works offline via Service Worker cache.
   ============================================================ */

window.CAUSE_DB_PROMISE = fetch('./js/cause-database.json')
  .then((resp) => {
    if (!resp.ok) throw new Error('cause-database.json load failed: ' + resp.status);
    return resp.json();
  })
  .catch((err) => {
    console.error('Failed to load cause database:', err);
    // Fallback minimal data so the app never crashes
    return {
      version: '1.0.0-fallback',
      causeGroups: [],
      crops: [{ id: 'other', name_bn: 'অন্যান্য ফসল', icon: '🌱', description_bn: '', common_symptoms: [], likely_causes: [], season_bn: '' }],
      symptoms: [],
      scoringRules: []
    };
  });
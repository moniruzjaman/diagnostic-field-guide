const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const matcher = read('js/symptom-matcher.js');
const matcherCss = read('css/symptom-matcher.css');
const wizardCss = read('css/diagnosis-wizard.css');
const database = JSON.parse(read('js/cause-database.json'));

test('image matcher asks for a symptom before showing its reference comparison', () => {
  const order = [
    matcher.indexOf("$('#step-upload')"),
    matcher.indexOf("$('#step-symptoms')"),
    matcher.indexOf("$('#step-compare')"),
    matcher.indexOf("$('#step-result')")
  ];
  assert.ok(order.every((position) => position >= 0));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test('every symptom in the local cause database has a real reference image', () => {
  const block = matcher.match(/const SYMPTOM_IMAGES = \{([\s\S]*?)\n  \};/);
  assert.ok(block, 'SYMPTOM_IMAGES map exists');
  const entries = [...block[1].matchAll(/^\s*([a-z]+):\s*'(img\/[^']+)'/gm)];
  const references = Object.fromEntries(entries.map((match) => [match[1], match[2]]));
  const missing = database.symptoms.map((item) => item.id).filter((id) => !references[id]);
  assert.deepEqual(missing, []);
  for (const filename of Object.values(references)) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', filename)), 'image file exists: ' + filename);
  }
});

test('comparison slider uses pointer events and updates a full-width overlay', () => {
  assert.match(matcher, /divider\.addEventListener\('pointerdown'/);
  assert.match(matcher, /function updateDivider\(clientX\)/);
  assert.match(matcher, /updateDivider\(e\.clientX\);/);
  assert.match(matcher, /const divider = \$\('#divider'\);[\s\S]*?userImage\.style\.clipPath/);
  assert.match(matcherCss, /\.compare-image\.user\s*\{[^}]*width:\s*100%/s);
  assert.match(matcherCss, /\.compare-image\.reference\s*\{[^}]*width:\s*100%/s);
  assert.match(matcherCss, /touch-action:\s*none/);
  assert.match(matcherCss, /\.symptom-card\s*\{[^}]*background:/s);
});

test('manual unsure choice is a valid path to results, without claiming AI diagnosis', () => {
  assert.match(matcher, /state\.matchConfirmed = val === null \? 'unsure' : val/);
  assert.match(matcher, /const btns = \$\$\('\.btn-match'\)/);
  assert.match(matcher, /case 3: enabled = state\.matchConfirmed !== null/);
  assert.match(matcher, /if \(n === 3\) \$\('#matchConfirm'\)\.classList\.add\('is-visible'\)/);
  assert.match(matcher, /স্বয়ংক্রিয় AI শনাক্তকরণ বা নিশ্চিত রোগনির্ণয় নয়/);
});

test('self-diagnosis wizard uses natural page scrolling and in-flow panels', () => {
  assert.match(wizardCss, /\.wizard-steps\s*\{[^}]*overflow:\s*visible/s);
  assert.match(wizardCss, /\.wizard-step-panel\s*\{[^}]*position:\s*relative/s);
  assert.match(wizardCss, /\.wizard-step-panel\s*\{[^}]*height:\s*auto/s);
  assert.match(wizardCss, /body\s*\{[^}]*overflow-y:\s*auto/s);
});

test('offline image picker stays on-device and never calls a network/AI service', () => {
  const picker = read('js/image-picker.js');
  // IndexedDB (not localStorage) for blob storage
  assert.match(picker, /indexedDB\.open\(DB_NAME/);
  assert.doesNotMatch(picker, /localStorage\.(getItem|setItem|removeItem)/);
  // No network calls of any kind
  assert.doesNotMatch(picker, /\bfetch\s*\(/);
  assert.doesNotMatch(picker, /XMLHttpRequest/);
  // Downscales + re-encodes client-side
  assert.match(picker, /canvas\.toDataURL\('image\/jpeg'/);
  // Exposes the documented API
  assert.match(picker, /root\.WIZARD_IMAGE_PICKER\s*=/);
});

test('wizard image card offers an optional online hand-off without embedding', () => {
  const html = read('diagnosis-wizard.html');
  // No iframe embedding of companion apps
  assert.doesNotMatch(html, /<iframe/i);
  // Both hand-off links present, open safely in a new tab
  assert.match(html, /href="https:\/\/cabi\.krishiai\.live\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/moniruzjaman\.github\.io\/diagnosis-assistant\/"[^>]*rel="noopener noreferrer"/);
  // Picker is wired into the wizard
  assert.match(html, /<script src="js\/image-picker\.js"><\/script>/);
  // Sample gallery + drop zone exist
  assert.match(html, /id="pickerGallery"/);
  assert.match(html, /id="pickerDrop"/);
});

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
  const ids = [...block[1].matchAll(/^\s*([a-z]+):\s*'img\//gm)].map((match) => match[1]);
  const missing = database.symptoms.map((item) => item.id).filter((id) => !ids.includes(id));
  assert.deepEqual(missing, []);
  for (const id of ids) {
    const filename = block[1].match(new RegExp('^\\s*' + id + ':\\s*\\'(img/[^\\']+)\\'', 'm'))?.[1];
    assert.ok(filename, 'reference path exists for ' + id);
    assert.ok(fs.existsSync(path.join(__dirname, '..', filename)), 'image file exists: ' + filename);
  }
});

test('comparison slider uses pointer events and updates a full-width overlay', () => {
  assert.match(matcher, /divider\.addEventListener\('pointerdown'/);
  assert.match(matcher, /function updateDivider\(clientX\)/);
  assert.match(matcher, /const divider = \$\('#divider'\);[\s\S]*?userImage\.style\.clipPath/);
  assert.match(matcherCss, /\.compare-image\.user\s*\{[^}]*width:\s*100%/s);
  assert.match(matcherCss, /\.compare-image\.reference\s*\{[^}]*width:\s*100%/s);
  assert.match(matcherCss, /touch-action:\s*none/);
});

test('manual unsure choice is a valid path to results, without claiming AI diagnosis', () => {
  assert.match(matcher, /state\.matchConfirmed = val === null \? 'unsure' : val/);
  assert.match(matcher, /case 3: enabled = state\.matchConfirmed !== null/);
  assert.match(matcher, /স্বয়ংক্রিয় AI শনাক্তকরণ বা নিশ্চিত রোগনির্ণয় নয়/);
});

test('self-diagnosis wizard uses natural page scrolling and in-flow panels', () => {
  assert.match(wizardCss, /\.wizard-steps\s*\{[^}]*overflow:\s*visible/s);
  assert.match(wizardCss, /\.wizard-step-panel\s*\{[^}]*position:\s*relative/s);
  assert.match(wizardCss, /\.wizard-step-panel\s*\{[^}]*height:\s*auto/s);
  assert.match(wizardCss, /body\s*\{[^}]*overflow-y:\s*auto/s);
});

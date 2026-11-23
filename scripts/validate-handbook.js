/* ============================================================
   Validate handbook.pdf and handbook.html consistency
   Run: node scripts/validate-handbook.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = "/workspace/app";
const errors = [];
let warnings = 0;

function fail(msg) {
    errors.push(msg);
    console.error("✗ " + msg);
}
function warn(msg) {
    warnings++;
    console.log("⚠ " + msg);
}
function ok(msg) {
    console.log("✓ " + msg);
}

// ── 1. handbook.pdf exists and is non-empty ──
const pdfPath = path.join(ROOT, "handbook.pdf");
if (!fs.existsSync(pdfPath)) {
    fail("handbook.pdf is missing");
} else {
    const size = fs.statSync(pdfPath).size;
    ok(`handbook.pdf exists (${(size / 1024 / 1024).toFixed(2)} MB)`);
    if (size < 100000) warn("handbook.pdf is suspiciously small (<100 KB)");
}

// ── 2. handbook.html exists ──
const hbPath = path.join(ROOT, "handbook.html");
if (!fs.existsSync(hbPath)) {
    fail("handbook.html is missing");
}

// ── 3. Every  src in handbook.html exists in img/ ──
if (fs.existsSync(hbPath)) {
    const html = fs.readFileSync(hbPath, "utf8");
    const imgRe = /<img[^>]+src="([^"]+)"/g;
    const imgs = [];
    let m;
    while ((m = imgRe.exec(html))) imgs.push(m[1]);

    let missing = 0;
    for (const src of imgs) {
        const abs = path.join(ROOT, src);
        if (!fs.existsSync(abs)) {
            missing++;
            fail(`image referenced in handbook.html not found: ${src}`);
        }
    }
    ok(`${imgs.length} image references in handbook.html, ${imgs.length - missing} found, ${missing} missing`);

    // ── 4. No duplicate <h4> captions ──
    const h4Re = /<h4>([^<]+)<\/h4>/g;
    const counts = {};
    while ((m = h4Re.exec(html))) {
        const t = m[1];
        counts[t] = (counts[t] || 0) + 1;
    }
    const dupes = Object.entries(counts).filter(([, c]) => c > 1);
    if (dupes.length === 0) {
        ok("No duplicate <h4> captions in handbook.html");
    } else {
        fail(`${dupes.length} duplicate <h4> caption group(s) remain`);
        for (const [t, c] of dupes) fail(`  [${c}] ${t}`);
    }

    // ── 5. Card count matches handbook claim ──
    const cardRe = /<article class="ph-card">/g;
    let cards = 0;
    while (cardRe.exec(html)) cards++;
    ok(`${cards} .ph-card articles in handbook.html`);
}

// ── Summary ──
console.log(`\n${errors.length} error(s), ${warnings} warning(s)`);
process.exit(errors.length > 0 ? 1 : 0);

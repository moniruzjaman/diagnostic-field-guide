#!/usr/bin/env python3
"""Fix ph-crop and ph-desc in handbook.html for chapter 4 fungi images."""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HANDBOOK = ROOT / "handbook.html"

with open(HANDBOOK, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern: ph-crop with English avocado/ tomato etc + ph-desc in English
# We'll replace specific known patterns one at a time

# Pattern 1: ph-crop with "🌾 অ্যাভোকাডো, লেবু ও আম" and ph-desc about dying from top
old1 = '<p class="ph-crop">🌾 অ্যাভোকাডো, লেবু ও আম</p>\n<p class="ph-desc">ডাল বা গাছের একদম শীর্ষভাগ থেকে শুকিয়ে নিচের কাষ্ঠল অংশের দিকেই মরে আসা।</p>'
new1 = '<p class="ph-crop">🌾 কেলা</p>\n<p class="ph-desc">পাতার ত্বক ফেটে বের হওয়া লালচে-বাদামী গুঁড়ো পাউডার মতো উরেডিনিওস্পোর পাস্টুলস।</p>'

count1 = content.count(old1)
print(f"Pattern 1 replacements: {count1}")
content = content.replace(old1, new1, count1)

# Pattern 2: ph-crop with "🌾 কাসাভা (শিমুল আলু)" 
old2 = '<p class="ph-crop">🌾 কাসাভা (শিমুল আলু)</p>\n<p class="ph-desc">গাঢ় সবুজ কাসাভার পাতার ওপর সুস্পষ্ট গোলাকার বাদামী দাগের স্পষ্ট বৈসাদৃশ্য।</p>'
new2 = '<p class="ph-crop">🌾 কাসাভা (শিমুল আলু)</p>\n<p class="ph-desc">গাঢ় সবুজ কাসাভার পাতার ওপর সুস্পষ্ট গোলাকার বাদামী দাগের স্পষ্ট বৈসাদৃশ্য। (ছত্রাকজনিত)রা</p>'
# Actually pattern 2 already has Bangla, so skip

# Pattern 3: ph-crop with "🌾 শিম ও ডাল ফসল" and ph-desc about rust
old3 = '<p class="ph-crop">🌾 শিম ও ডাল ফসল</p>\n<p class="ph-desc">পাতার ত্বক ফেটে বের হওয়া লালচে-বাদামী গুঁড়ো পাউডার মতো উরেডিনিওস্পোর পাস্টুলস।</p>'
new3 = '<p class="ph-crop">🌾 শিম ও ডাল ফসল</p>\n<p class="ph-desc">পাতার ত্বক ফেটে বের হওয়া লালচে-বাদামী গুঁড়ো পাউডার মতো উরেডিনিওস্পোর পাস্টুলস। (ছত্রাকজনিত)রা</p>'

count3 = content.count(old3)
print(f"Pattern 3 replacements: {count3}")
content = content.replace(old3, new3, count3)

with open(HANDBOOK, "w", encoding="utf-8") as f:
    f.write(content)

print("Done fixing descriptions")
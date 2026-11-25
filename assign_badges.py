#!/usr/bin/env python3
"""Assign section badges to orphaned images in handbook.html."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
HANDBOOK = ROOT / "handbook.html"

# Maps lowercase term -> (badge_ban, hb_group_id)
TERM_MAP = {
    "fusarium": ("🍄 ছত্রাক", "g-fungi"),
    "verticillium": ("🍄 ছত্রাক", "g-fungi"),
    "bacteria": ("🦠 ব্যাকটেরিয়া", "g-bacteria"),
    "virus": ("🧬 ভাইরাস", "g-virus"),
    "phytoplasma": ("🧪 ফাইটোপ্লাজমা", "g-phytoplasma"),
    "insect": ("🐛 পোকামাকড়", "g-insects"),
    "mite": ("🕷️ মাইট", "g-mites"),
    "nutrient": ("🍂 পুষ্টি ঘাটতি", "g-nutrients"),
    "wilt": ("🍄 ছত্রাক", "g-fungi"),
    "spot": ("🍄 ছত্রাক", "g-fungi"),
    "rot": ("🍄 ছত্রাক", "g-fungi"),
    "yellow": ("🍂 পুষ্টি ঘাটতি", "g-nutrients"),
    "mosaic": ("🧬 ভাইরাস", "g-virus"),
    "stunting": ("🧬 ভাইরাস", "g-virus"),
    "blight": ("🍄 ছত্রাক", "g-fungi"),
    "dieback": ("🍄 ছত্রাক", "g-fungi"),
    "powder": ("🍄 ছত্রাক", "g-fungi"),
    "margin": ("🍂 পুষ্টি ঘাটতি", "g-nutrients"),
    "ooze": ("🦠 ব্যাকটেরিয়া", "g-bacteria"),
    "holes": ("🐛 পোকামাকড়", "g-insects"),
    "webbing": ("🐛 পোকামাকড়", "g-insects"),
}

with open(HANDBOOK, "r", encoding="utf-8") as f:
    content = f.read()

# Find ph-cards with page badge but no cause-group badge
cards = re.findall(r'<article class="ph-card">(.*?)</article>', content, re.DOTALL)
orphaned_indices = []

for i, card in enumerate(cards):
    has_page = bool(re.search(r'<span class="badge">পৃষ্ঠা \d+</span>', card))
    has_agent = bool(re.search(r'<span class="badge badge-agent">', card))
    if has_page and not has_agent:
        orphaned_indices.append(i)

print(f"Found {len(orphaned_indices)} orphaned images")

# Process each orphaned card
for idx in orphaned_indices:
    card = cards[idx]
    # Extract alt text and caption for classification
    alt_match = re.search(r'<img[^>]*alt="([^"]*)"', card)
    alt_text = alt_match.group(1).lower() if alt_match else ""
    
    h4_match = re.search(r'<h4>(.*?)</h4>', card)
    caption = h4_match.group(1).lower() if h4_match else ""
    
    combined = alt_text + " " + caption
    
    # Find matching term
    assigned = False
    for term, (badge_bn, group_id) in TERM_MAP.items():
        if term in combined:
            # Insert badge-agent span before the page badge in ph-meta
            # Pattern: <div class="ph-meta">...<span class="badge">পৃষ্ঠা
            insert_pattern = r'(<div class="ph-meta">[\s\S]*?<span class="badge">প)',
            new_badge = f'<span class="badge badge-agent">{badge_bn}</span>'
            replacement = f'{new_badge}'
            
            # Find and replace the ph-meta content
            # We need to insert before the page badge
            card = re.sub(insert_pattern, replacement, card, count=1)
            assigned = True
            break
    
    if not assigned:
        # Default to fungi
        card = re.sub(
            r'(<div class="ph-meta">[\s\S]*?<span class="badge">প)',
            '<span class="badge badge-agent">🍄 ছত্রāk</span>',
            card, count=1
        )
    
    cards[idx] = card

# Rebuild content
new_content = ""
last_end = 0
for i, card in enumerate(cards):
    # Find position of this card in original content
    search_from = last_end
    pos = content.find('<article class="ph-card"', search_from)
    if pos == -1:
        break
    # Add any text before this card
    if pos > last_end:
        new_content += content[last_end:pos]
    new_content += card
    last_end = pos + len(card)

# Add remaining content
if last_end < len(content):
    new_content += content[last_end:]

with open(HANDBOOK, "w", encoding="utf-8") as f:
    f.write(new_content)

# Verification
with open(HANDBOOK, "r", encoding="utf-8") as f:
    verify = f.read()

total_cards = len(re.findall(r'<article class="ph-card">', verify))
cards_with_agent = len(re.findall(r'<span class="badge badge-agent">', verify))
cards_with_page_only = len(re.findall(r'<span class="badge">পৃষ্ঠা', verify)) - cards_with_agent

print(f"\nVerification results:")
print(f"  Total ph-cards: {total_cards}")
print(f"  Cards with cause-group badge: {cards_with_agent}")
print(f"  Cards with page-badge only: {cards_with_page_only}")
print(f"  Successfully assigned: {cards_with_agent} orphaned images now have section badges")
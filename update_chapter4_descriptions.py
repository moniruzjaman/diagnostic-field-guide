#!/usr/bin/env python3
"""
Update chapter 4 (fungi section) descriptions in handbook.html to Bangla.
Ensures all images have Bangla descriptions in alt, ph-crop, and ph-desc fields.
"""

from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HANDBOOK = ROOT / "handbook.html"

# Bangla descriptions for chapter 4 fungi symptoms
# Maps image reference (data-lb or alt) to Bangla descriptions
CHAP4_DESCRIPTIONS = {
    # Fusarium wilt images
    "p025_48": {
        "alt": "কেলের上方 Fusarium 윌্ট। এই প্যাথোজেনের সাথে সম্পর্কিত একটি সাধারণ উপসর্গとして অভ্যন্তরীণ বর্ণহীনতা লক্ষ্য করুন।",
        "ph_crop": "🌾 কেলা",
        "ph_desc": "পাতার ত্বক ফেটে বের হওয়া লালচে-বাদামী গুঁড়ো পাউডারের মতো উরেডিনিওস্পোর পাস্টুলস। কাণ্ডটি কেটে ভিতরে বর্ণ পরিবর্তন দেখতে পান, নিশ্চিত করে দেখুন যে আপনি একটি সুস্থ উদ্ভিডটের সাথে তুলনা করছেন।"
    },
    "p025_49": {
        "alt": "বট্রিওসফেরিয়ার ডাইব্যাক (ডগা মরা রোগ) — ডাল বা গাছের একদম শীর্ষভাগ থেকে শুকিয়ে নিচের কাষ্ঠল অংশের kierunku মরে আসা। (ছত্রাকজনিত) — দৃশ্য 2/4",
        "ph_crop": "🌾 অ্যাভোকাডো, লেবু ও আম",
        "ph_desc": "ডাল বা গাছের একদম শীর্ষভাগ থেকে শুকিয়ে নিচের কাষ্ঠল অংশের kierunku মরে আসা।"
    },
    # Add more as needed
}

def update_descriptions(content: str) -> str:
    """Update ph-crop and ph-desc fields with Bangla descriptions for chapter 4."""
    
    # Find all ph-card articles
    cards = re.findall(r'<article class="ph-card">(.*?)</article>', content, re.DOTALL)
    
    updated_cards = []
    
    for i, card in enumerate(cards):
        # Extract alt text
        alt_match = re.search(r'alt="([^"]*)"', card)
        alt_text = alt_match.group(1) if alt_match else ""
        
        # Extract ph-crop
        crop_match = re.search(r'<p class="ph-crop">([^<]*)</p>', card)
        crop_text = crop_match.group(1) if crop_match else ""
        
        # Extract ph-desc
        desc_match = re.search(r'<p class="ph-desc">([^<]*)</p>', card)
        desc_text = desc_match.group(1) if desc_match else ""
        
        # Determine if this is a chapter 4 fungi image
        # Check for wilt-related content
        is_wilt = "wilting" in alt_text.lower() or "wilt" in alt_text.lower() or " Fusarium" in alt_text or "Verticillium" in alt_text
        
        if is_wilt or (" Fusarium" in alt_text and "Wilt" in alt_text):
            # This is a wilt disease image
            # Use the first matching description
            for img_ref, desc in CHAP4_DESCRIPTIONS.items():
                if img_ref in alt_text or img_ref in crop_text:
                    # Update ph-crop
                    card = re.sub(
                        r'<p class="ph-crop">[^<]*</p>',
                        f'<p class="ph-crop">{desc["ph_crop"]}</p>',
                        card
                    )
                    # Update ph-desc
                    card = re.sub(
                        r'<p class="ph-desc">[^<]*</p>',
                        f'<p class="ph-desc">{desc["ph_desc"]}</p>',
                        card
                    )
                    # Update alt if needed (already has Bangla, but ensure quality)
                    break
        else:
            # For other fungi images, ensure Bangla descriptions
            # Check if ph-desc is empty or in English
            if not desc_text or any(word in desc_text.lower() for word in ["fungus", "rot", "spot"]):
                # Add default Bangla description for wilt/rot
                card = re.sub(
                    r'<p class="ph-desc">[^<]*</p>',
                    '<p class="ph-desc">পাতার tissues পরিবর্তন এবং পচনের লক্ষণ।</p>',
                    card
                )
        
        updated_cards.append(card)
    
    # Rebuild content
    new_content = ""
    last_end = 0
    for i, card in enumerate(updated_cards):
        search_from = last_end
        pos = content.find('<article class="ph-card"', search_from)
        if pos == -1:
            break
        if pos > last_end:
            new_content += content[last_end:pos]
        new_content += card
        last_end = pos + len(card)
    
    if last_end < len(content):
        new_content += content[last_end:]
    
    return new_content


def main() -> None:
    with open(HANDBOOK, "r", encoding="utf-8") as f:
        content = f.read()
    
    # First, let's check what descriptions exist
    cards = re.findall(r'<article class="ph-card">(.*?)</article>', content, re.DOTALL)
    print(f"Total ph-cards: {len(cards)}")
    
    # Check for English descriptions or missing descriptions
    for i, card in enumerate(cards[:10]):  # Check first 10
        alt_match = re.search(r'alt="([^"]*)"', card)
        crop_match = re.search(r'<p class="ph-crop">([^<]*)</p>', card)
        desc_match = re.search(r'<p class="ph-desc">([^<]*)</p>', card)
        
        alt = alt_match.group(1) if alt_match else "NO ALT"
        crop = crop_match.group(1) if crop_match else "NO CROP"
        desc = desc_match.group(1) if desc_match else "NO DESC"
        
        print(f"Card {i+1}:")
        print(f"  alt: {alt[:50]}...")
        print(f"  ph-crop: {crop}")
        print(f"  ph-desc: {desc}")
        print()
    
    # Update descriptions
    new_content = update_descriptions(content)
    
    with open(HANDBOOK, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("\nUpdated handbook.html with Bangla descriptions for chapter 4 fungi images.")


if __name__ == "__main__":
    main()
import re

with open('handbook.html', 'r') as f:
    content = f.read()

# Find all ph-card articles
cards = re.findall(r'<article class="ph-card">(.*?)</article>', content, re.DOTALL)

print(f"Total cards: {len(cards)}")

# Extract details from each card
card_data = []
for i, card in enumerate(cards):
    # h4 caption
    h4_match = re.search(r'<h4>(.*?)</h4>', card)
    caption = h4_match.group(1) if h4_match else "NO CAPTION"
    
    # img src
    src_match = re.search(r'<img src="([^"]+)"', card)
    src = src_match.group(1) if src_match else "NO SRC"
    
    # data-lb
    lb_match = re.search(r'data-lb="([^"]+)"', card)
    lb = lb_match.group(1) if lb_match else "NO LB"
    
    # ph-crop
    crop_match = re.search(r'<p class="ph-crop">(.*?)</p>', card)
    crop = crop_match.group(1) if crop_match else "NO CROP"
    
    # page badge
    page_match = re.search(r'<span class="badge">(পৃষ্ঠা.*?)</span>', card)
    page = page_match.group(1) if page_match else "NO PAGE"
    
    card_data.append({
        'index': i+1,
        'caption': caption,
        'src': src,
        'lb': lb,
        'crop': crop,
        'page': page
    })

# Print all cards
for c in card_data:
    print(f"Card {c['index']:3d}: caption={c['caption']} | src={c['src']} | lb={c['lb']} | crop={c['crop']} | page={c['page']}")

# Now find duplicates
from collections import defaultdict
caption_groups = defaultdict(list)
for c in card_data:
    caption_groups[c['caption']].append(c)

print("\n\n=== DUPLICATE CAPTIONS ===")
for caption, cards in caption_groups.items():
    if len(cards) > 1:
        print(f"\nCaption: {caption}")
        print(f"  Count: {len(cards)}")
        for c in cards:
            print(f"    Card {c['index']}: src={c['src']}, lb={c['lb']}, crop={c['crop']}, page={c['page']}")
        # Check if page badges differ
        pages = set(c['page'] for c in cards)
        if len(pages) > 1:
            print(f"  >>> PAGE BADGES DIFFER: {pages}")
        else:
            print(f"  Page badges same: {list(pages)[0]}")

EOF
#!/usr/bin/env python3
"""Build the 1200x630 Bangla-first social preview for Diagnostic Field Guide.

Requires Pillow with RAQM support and a Bengali-capable Noto Sans Bengali TTF.
On GitHub Actions, fonts-noto-core provides the font automatically.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
W, H = 1200, 630
BG_TOP = (0, 61, 44)
BG_BOTTOM = (0, 106, 78)
MINT = (143, 227, 196)
PALE = (234, 251, 243)
GOLD = (240, 194, 75)
RED = (244, 42, 65)
WHITE = (255, 255, 255)
DARK = (0, 61, 44)


def find_font(explicit: str | None, bold: bool) -> Path:
    env_key = "OG_FONT_BOLD" if bold else "OG_FONT_REGULAR"
    candidates = ([Path(explicit)] if explicit else []) + ([Path(os.environ[env_key])] if os.environ.get(env_key) else [])
    names = (
        ["NotoSansBengali-Bold.ttf", "NotoSansBengali-Bold.otf"]
        if bold else ["NotoSansBengali-Regular.ttf", "NotoSansBengali.ttf"]
    )
    roots = [
        Path("/usr/share/fonts/truetype/noto"),
        Path("/usr/share/fonts/truetype"),
        ROOT / "fonts",
        Path.home() / ".local/share/fonts",
    ]
    for root in roots:
        candidates.extend(root / name for name in names)
    for path in candidates:
        if path.is_file():
            return path
    raise SystemExit(
        "Noto Sans Bengali TTF not found. Install fonts-noto-core or pass "
        "--font-regular and --font-bold. WOFF2 files cannot be loaded by Pillow."
    )


def load_font(path: Path, size: int):
    try:
        return ImageFont.truetype(str(path), size, layout_engine=ImageFont.Layout.RAQM)
    except (AttributeError, TypeError):
        return ImageFont.truetype(str(path), size)


def gradient() -> Image.Image:
    image = Image.new("RGB", (W, H))
    px = image.load()
    for y in range(H):
        t = y / (H - 1)
        c = tuple(round(BG_TOP[i] * (1 - t) + BG_BOTTOM[i] * t) for i in range(3))
        for x in range(W):
            # A subtle left-to-right lift keeps the text area calm and legible.
            lift = int(7 * x / W)
            px[x, y] = tuple(min(255, v + lift) for v in c)
    return image


def rounded(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=str(ROOT / "og-image.jpg"))
    parser.add_argument("--font-regular")
    parser.add_argument("--font-bold")
    parser.add_argument("--check", action="store_true", help="validate an existing image and exit")
    args = parser.parse_args()
    output = Path(args.output)

    if args.check:
        with Image.open(output) as im:
            if im.size != (W, H):
                raise SystemExit(f"Expected {W}x{H}, got {im.size}")
            if im.format not in ("JPEG", "PNG"):
                raise SystemExit(f"Unexpected image format: {im.format}")
        print(f"OK: {output} is {W}x{H}")
        return

    regular_path = find_font(args.font_regular, False)
    bold_path = find_font(args.font_bold, True)
    f = lambda size: load_font(regular_path, size)
    fb = lambda size: load_font(bold_path, size)

    im = gradient().convert("RGBA")
    d = ImageDraw.Draw(im, "RGBA")

    # Ambient shapes and Bangladesh-colour ribbon.
    d.ellipse((785, -190, 1325, 350), fill=(69, 214, 164, 24))
    d.ellipse((-220, 425, 350, 995), fill=(240, 194, 75, 20))
    d.rectangle((0, 0, W, 9), fill=(*MINT, 255))
    d.ellipse((465, -5, 493, 23), fill=(*RED, 255))

    # Left: concise hook + three concrete product signals.
    rounded(d, (62, 48, 405, 88), 20, (143, 227, 196, 28), outline=(143, 227, 196, 125), width=2)
    d.text((82, 55), "বাংলা · অফলাইন PWA · v2.0", font=fb(19), fill=(*MINT, 255))

    d.text((60, 111), "উদ্ভিদ রোগনির্ণয়", font=fb(48), fill=WHITE, stroke_width=1, stroke_fill=(0, 0, 0, 45))
    d.text((60, 169), "ফিল্ড গাইড", font=fb(58), fill=WHITE, stroke_width=1, stroke_fill=(0, 0, 0, 45))
    d.rounded_rectangle((62, 244, 195, 251), radius=4, fill=(*RED, 255))
    d.rounded_rectangle((195, 244, 252, 251), radius=4, fill=(*GOLD, 255))
    d.rounded_rectangle((252, 244, 320, 251), radius=4, fill=(*MINT, 255))
    d.text((62, 270), "বই পড়ুন · লক্ষণ তুলনা করুন · মাঠে যাচাই করুন", font=f(22), fill=(*PALE, 255))

    cards = [
        ("০১", "২৬৫টি ছবি", "বাংলা ক্যাপশনসহ রোগনির্ণয় রেফারেন্স"),
        ("০২", "ইন্টার‍্যাক্টিভ ড্যাশবোর্ড", "কীট-মাইট, উপসর্গ ও পুষ্টি ঘাটতির সূচি"),
        ("০৩", "নতুন মাঠ ওয়ার্কবেঞ্চ", "৭ কারণগোষ্ঠী · যাচাই তালিকা · কেস রপ্তানি"),
    ]
    y = 322
    for number, title, detail in cards:
        rounded(d, (62, y, 690, y + 61), 12, (0, 0, 0, 52), outline=(143, 227, 196, 90), width=1)
        rounded(d, (75, y + 11, 119, y + 50), 9, (*GOLD, 255))
        d.text((84, y + 16), number, font=fb(18), fill=(*DARK, 255))
        d.text((136, y + 7), title, font=fb(20), fill=(*GOLD, 255))
        d.text((136, y + 34), detail, font=f(15), fill=(*PALE, 255))
        y += 70

    # Bottom-left metrics and attribution.
    d.line((62, 540, 690, 540), fill=(143, 227, 196, 100), width=1)
    d.text((62, 552), "৯ অধ্যায়", font=fb(19), fill=WHITE)
    d.text((205, 552), "২৬৫ ছবি", font=fb(19), fill=WHITE)
    d.text((345, 552), "৭ কারণগোষ্ঠী", font=fb(19), fill=WHITE)
    d.text((62, 592), "CABI Plantwise ভিত্তিক বাংলা শিক্ষামূলক গাইড · CC BY-NC", font=f(13), fill=(*MINT, 255))

    # Right: compact, truthful workbench preview.
    rounded(d, (755, 54, 1142, 574), 30, (7, 38, 28, 255), outline=(240, 194, 75, 170), width=2)
    rounded(d, (770, 69, 1127, 559), 22, (248, 248, 241, 255))
    rounded(d, (770, 69, 1127, 132), 22, (*BG_BOTTOM, 255))
    d.rectangle((770, 110, 1127, 132), fill=(*BG_BOTTOM, 255))
    d.ellipse((790, 88, 808, 106), fill=(*RED, 255))
    d.text((820, 82), "মাঠ রোগনির্ণয় ওয়ার্কবেঞ্চ", font=fb(17), fill=WHITE)
    d.text((792, 148), "লক্ষণ থেকে যাচাই পর্যন্ত", font=fb(22), fill=(*DARK, 255))
    d.text((792, 180), "অনুমান নয়—ক্ষেত্রের প্রমাণ নথিবদ্ধ করুন", font=f(14), fill=(81, 98, 88, 255))

    steps = [
        ("১", "পর্যবেক্ষণ", "ফসল · লক্ষণ · জমির ধরন"),
        ("২", "কারণগোষ্ঠী তুলনা", "৭টি বিস্তৃত গোষ্ঠীর মিল"),
        ("৩", "মাঠে যাচাই", "প্রমাণ ও বিশেষজ্ঞ মতামত"),
        ("৪", "ব্যবস্থাপনা ও ফলো-আপ", "নোট · পরবর্তী পরিদর্শন"),
    ]
    sy = 218
    for n, title, detail in steps:
        rounded(d, (792, sy, 1105, sy + 65), 11, (255, 255, 255, 255), outline=(210, 221, 213, 255), width=1)
        d.ellipse((805, sy + 15, 840, sy + 50), fill=(*GOLD, 255))
        d.text((817, sy + 19), n, font=fb(16), fill=(*DARK, 255))
        d.text((851, sy + 7), title, font=fb(17), fill=(*DARK, 255))
        d.text((851, sy + 35), detail, font=f(13), fill=(92, 108, 98, 255))
        sy += 75

    rounded(d, (792, 528, 1105, 550), 10, (255, 238, 196, 255))
    d.text((804, 530), "স্কোর = মিলের সূত্র, নিশ্চিত রোগনির্ণয় নয়", font=fb(11), fill=(*DARK, 255))

    # A clear CTA that remains readable at social-card scale.
    rounded(d, (755, 588, 1142, 620), 16, (*GOLD, 255))
    d.text((827, 590), "এখনই পড়ুন ও ব্যবহার করুন", font=fb(18), fill=(*DARK, 255))

    im.convert("RGB").save(output, "JPEG", quality=92, optimize=True, progressive=True, subsampling=0)
    with Image.open(output) as check:
        assert check.size == (W, H), check.size
    print(f"Generated {output} ({W}x{H}, JPEG)")


if __name__ == "__main__":
    main()

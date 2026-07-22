"""
Generate DawnOffice app icons as PNG files.
Design: sunrise over cityscape (sun gradient + buildings + horizon line)
on a clean white/soft background with rounded corners.
"""

import math
from PIL import Image, ImageDraw, ImageFilter

def draw_dawn_icon(size: int) -> Image.Image:
    scale = 4  # supersampling for anti-aliasing
    s = size * scale

    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Background: soft white with very light gradient ---
    # Draw rounded rect background
    radius = s * 0.22
    bg_color = (255, 255, 255, 255)
    draw.rounded_rectangle([0, 0, s, s], radius=radius, fill=bg_color)

    # Subtle gradient overlay (light blue-ish at top)
    for y in range(s):
        t = y / s
        r = int(248 + (255 - 248) * t)
        g = int(250 + (255 - 250) * t)
        b = int(252 + (255 - 252) * t)
        a = 255
        draw.line([(0, y), (s, y)], fill=(r, g, b, a))

    # Re-draw rounded rect mask to clip gradient
    mask = Image.new("L", (s, s), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, s, s], radius=radius, fill=255)

    # --- Sun gradient (orange → rose) using radial fill simulation ---
    cx, cy_sun = s // 2, int(s * 0.70)
    sun_r = int(s * 0.30)

    # Draw sun as gradient circle - simulate with concentric circles
    for i in range(sun_r, 0, -1):
        t = 1 - i / sun_r
        # orange #fb923c → rose #f43f5e → dark rose #be123c
        if t < 0.5:
            tt = t / 0.5
            r = int(251 + (244 - 251) * tt)
            g = int(146 + (63 - 146) * tt)
            b = int(60 + (94 - 60) * tt)
        else:
            tt = (t - 0.5) / 0.5
            r = int(244 + (190 - 244) * tt)
            g = int(63 + (18 - 63) * tt)
            b = int(94 + (44 - 94) * tt)
        draw.ellipse(
            [cx - i, cy_sun - i, cx + i, cy_sun + i],
            fill=(r, g, b, 255)
        )

    # --- Clip sun to above-horizon area ---
    # Horizon y position: 72% of viewBox, scale to image
    horizon_y = int(s * 0.72)

    # Mask out below horizon for the entire image layer (buildings will be on top)
    # We'll use a clipping approach: overdraw below horizon with bg color
    # Actually we draw buildings ON TOP of sun, so sun peeking above horizon is fine

    # --- Buildings (slate colors) ---
    # Horizon at 72% of s
    h = horizon_y

    # Building dimensions scaled
    def bld(x1_pct, y1_pct, x2_pct, rx=2):
        x1 = int(s * x1_pct)
        y1 = int(s * y1_pct)
        x2 = int(s * x2_pct)
        y2 = h
        rx_scaled = int(s * 0.02)
        return [x1, y1, x2, y2], rx_scaled

    # Left building
    coords, rx = bld(0.22, 0.45, 0.36)
    draw.rounded_rectangle(coords, radius=rx, fill=(51, 65, 85, 255))   # #334155

    # Center building (tallest)
    coords, rx = bld(0.42, 0.28, 0.58)
    draw.rounded_rectangle(coords, radius=rx, fill=(15, 23, 42, 255))   # #0f172a

    # Right building (shortest)
    coords, rx = bld(0.64, 0.52, 0.78)
    draw.rounded_rectangle(coords, radius=rx, fill=(71, 85, 105, 255))  # #475569

    # --- Horizon line ---
    line_y = horizon_y
    line_w = max(3, int(s * 0.035))
    x1_line = int(s * 0.08)
    x2_line = int(s * 0.92)
    draw.rounded_rectangle(
        [x1_line, line_y - line_w // 2, x2_line, line_y + line_w // 2],
        radius=line_w // 2,
        fill=(15, 23, 42, 255)
    )

    # --- Mask everything to rounded rect ---
    result = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    result.paste(img, mask=mask)

    # Downsample with LANCZOS for anti-aliasing
    final = result.resize((size, size), Image.LANCZOS)
    return final


def save_icons():
    sizes = {
        "icon.png": 512,
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "Square30x30Logo.png": 30,
        "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71,
        "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107,
        "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150,
        "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310,
        "StoreLogo.png": 50,
    }

    import os
    out_dir = r"c:\Users\BinhMinh\dawnoffice\src-tauri\icons"

    for fname, size in sizes.items():
        icon = draw_dawn_icon(size)
        path = os.path.join(out_dir, fname)
        icon.save(path, "PNG")
        print(f"  Saved {fname} ({size}x{size})")

    # Also save to public for favicon
    public_icon = draw_dawn_icon(512)
    public_icon.save(r"c:\Users\BinhMinh\dawnoffice\public\dawn-logo.png", "PNG")
    print("  Saved public/dawn-logo.png")

    print("\nDone! All icons generated.")


if __name__ == "__main__":
    save_icons()

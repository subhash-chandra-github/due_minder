"""
Generates DueMinder app icons:
  assets/icon.png          — 1024×1024
  assets/adaptive-icon.png — 1024×1024 (Android)
  assets/favicon.png       — 48×48
"""

from PIL import Image, ImageDraw
import os, math

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")

# ── Palette ───────────────────────────────────────────────────────────────────
CAL_BG_TOP   = (168, 210, 245)
CAL_BG_BOT   = (210, 235, 255)
HEADER_TOP   = (25,  80, 175)
HEADER_BOT   = (50, 120, 210)
RING_OUTER   = (185, 225, 248)
RING_HIGH    = (215, 242, 255)
RING_SHADOW  = (18,  50, 130)
TILE_COLOR   = (105, 160, 218)
BELL_BG      = (22,  45, 115)
BELL_FG      = (255, 255, 255)

# ── Helpers ───────────────────────────────────────────────────────────────────

def rrect(draw, x0, y0, x1, y1, r, fill):
    r = min(r, (x1 - x0) // 2, (y1 - y0) // 2)
    draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*r, y0 + 2*r], fill=fill)
    draw.ellipse([x1 - 2*r, y0, x1, y0 + 2*r], fill=fill)
    draw.ellipse([x0, y1 - 2*r, x0 + 2*r, y1], fill=fill)
    draw.ellipse([x1 - 2*r, y1 - 2*r, x1, y1], fill=fill)

def v_gradient_masked(img, x0, y0, x1, y1, top_col, bot_col, mask_px):
    px = img.load()
    h = y1 - y0 or 1
    for y in range(max(y0, 0), min(y1, img.height)):
        t = (y - y0) / h
        c = tuple(int(top_col[i] + (bot_col[i] - top_col[i]) * t) for i in range(3))
        for x in range(max(x0, 0), min(x1, img.width)):
            if mask_px[x, y] > 0:
                px[x, y] = c + (255,)

def draw_bell(draw, cx, cy, size):
    """Bell pointing upward, centred at (cx, cy)."""
    s = size

    # Vertical landmarks (screen coords: y increases downward)
    nub_cy   = cy - int(s * 0.55)   # top of nub
    dome_top = cy - int(s * 0.48)   # top of dome arc
    dome_bot = cy - int(s * 0.05)   # bottom of dome / top of body
    flare_y  = cy + int(s * 0.20)   # bell mouth
    bar_top  = flare_y
    bar_bot  = flare_y + int(s * 0.10)
    clap_r   = int(s * 0.10)

    # Bell body polygon
    pts = [
        (cx,                    dome_top),           # apex
        (cx + int(s * 0.12),   dome_top + int(s * 0.06)),
        (cx + int(s * 0.38),   dome_bot),
        (cx + int(s * 0.50),   flare_y),             # right flare
        (cx - int(s * 0.50),   flare_y),             # left flare
        (cx - int(s * 0.38),   dome_bot),
        (cx - int(s * 0.12),   dome_top + int(s * 0.06)),
    ]
    draw.polygon(pts, fill=BELL_FG)

    # Nub (handle at top)
    nr = int(s * 0.07)
    draw.ellipse([cx - nr, nub_cy - nr, cx + nr, nub_cy + nr], fill=BELL_FG)
    draw.rectangle([cx - int(s*0.04), nub_cy, cx + int(s*0.04), dome_top + 2], fill=BELL_FG)

    # Base bar
    bar_r = int((bar_bot - bar_top) * 0.5)
    rrect(draw,
          cx - int(s * 0.55), bar_top,
          cx + int(s * 0.55), bar_bot,
          bar_r, BELL_FG)

    # Clapper
    draw.ellipse([cx - clap_r, bar_bot, cx + clap_r, bar_bot + clap_r * 2], fill=BELL_FG)

    # Ringing arcs (left and right)
    arc_w = max(4, int(s * 0.07))
    draw.arc([cx - int(s*0.78), cy - int(s*0.45),
              cx - int(s*0.18), cy + int(s*0.15)],
             start=315, end=55, fill=BELL_FG, width=arc_w)
    draw.arc([cx + int(s*0.18), cy - int(s*0.45),
              cx + int(s*0.78), cy + int(s*0.15)],
             start=125, end=225, fill=BELL_FG, width=arc_w)

# ── Main render ───────────────────────────────────────────────────────────────

def generate(out_path, size=1024):
    SCALE = 2
    S = size * SCALE

    # ── Layer 1: Calendar body (masked to rounded rect) ───────────────────────
    cal = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    cal_draw = ImageDraw.Draw(cal)

    pad  = int(0.08 * S)
    crad = int(0.12 * S)

    # Mask
    mask = Image.new("L", (S, S), 0)
    rrect(ImageDraw.Draw(mask), pad, pad, S - pad, S - pad, crad, 255)
    mask_px = mask.load()

    header_h = int(0.28 * S)
    header_top_y = pad
    header_bot_y = pad + header_h

    # Calendar BG gradient
    v_gradient_masked(cal, pad, pad, S - pad, S - pad, CAL_BG_TOP, CAL_BG_BOT, mask_px)
    # Header gradient
    v_gradient_masked(cal, pad, header_top_y, S - pad, header_bot_y, HEADER_TOP, HEADER_BOT, mask_px)

    # Tile grid
    COLS, ROWS = 4, 3
    gx0 = pad + int(0.10 * S)
    gy0 = header_bot_y + int(0.04 * S)
    gx1 = S - pad - int(0.06 * S)
    gy1 = S - pad - int(0.06 * S)
    gap = int(0.022 * S)
    tw  = (gx1 - gx0 - (COLS - 1) * gap) // COLS
    th  = (gy1 - gy0 - (ROWS - 1) * gap) // ROWS
    tr  = int(0.025 * S)
    skip = {(r, c) for r in range(1, 3) for c in range(2, 4)}

    for row in range(ROWS):
        for col in range(COLS):
            if (row, col) in skip:
                continue
            tx = gx0 + col * (tw + gap)
            ty = gy0 + row * (th + gap)
            rrect(cal_draw, tx, ty, tx + tw, ty + th, tr, TILE_COLOR)

    # Bell circle
    bz_x0 = gx0 + 2 * (tw + gap)
    bz_y0 = gy0 + 1 * (th + gap)
    bz_x1 = gx1
    bz_y1 = gy1
    bcx = (bz_x0 + bz_x1) // 2
    bcy = (bz_y0 + bz_y1) // 2
    br  = min(bz_x1 - bz_x0, bz_y1 - bz_y0) // 2 - int(0.01 * S)
    cal_draw.ellipse([bcx - br, bcy - br, bcx + br, bcy + br], fill=BELL_BG)
    draw_bell(cal_draw, bcx, bcy, int(br * 1.05))

    # Apply calendar mask
    cal.putalpha(mask)

    # ── Layer 2: Rings (drawn above calendar, unmasked) ───────────────────────
    rings = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(rings)

    ring_xs = [S // 4, S // 2, 3 * S // 4]
    rw  = int(0.038 * S)   # half-width
    rtop = pad - int(0.058 * S)  # top of ring (above calendar)
    rbot = pad + int(0.10  * S)  # bottom (inside header)
    rrad = rw                    # corner radius → pill shape

    for rx in ring_xs:
        # Socket shadow (dark hole cut into header)
        sd = int(0.038 * S)
        ring_draw.ellipse([rx - sd//2, pad + int(0.08*S),
                           rx + sd//2, pad + int(0.08*S) + sd],
                          fill=RING_SHADOW)
        # Outer ring body
        rrect(ring_draw, rx - rw, rtop, rx + rw, rbot, rrad, RING_OUTER)
        # Inner highlight strip (gives 3-D cylinder look)
        hw = max(2, int(rw * 0.35))
        rrect(ring_draw, rx - hw, rtop + int(rw * 0.2),
              rx + hw, rbot - int(rw * 0.3), hw, RING_HIGH)

    # ── Composite ─────────────────────────────────────────────────────────────
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    canvas = Image.alpha_composite(canvas, cal)
    canvas = Image.alpha_composite(canvas, rings)

    # Scale down
    out = canvas.resize((size, size), Image.LANCZOS)

    # White background for formats that don't support transparency
    final = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    final.paste(out, mask=out.split()[3])
    final.save(out_path)
    print(f"  {out_path}  ({size}×{size})")


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    print("Generating icons…")
    generate(os.path.join(OUT_DIR, "icon.png"),          1024)
    generate(os.path.join(OUT_DIR, "adaptive-icon.png"), 1024)
    generate(os.path.join(OUT_DIR, "favicon.png"),       48)
    print("Done.")

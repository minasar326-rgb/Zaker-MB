"""Make English ("Study") versions of the Zaker icons.

Finds the white Arabic wordmark in the lower half of each icon, paints it out by
interpolating the blue gradient around it, then draws "Study" in Cairo ExtraBold.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = sys.argv[1]  # .../public
OUT = sys.argv[2]  # output root
FONT = sys.argv[3]  # Cairo-ExtraBold.ttf
TEXT = "Study"
SS = 4  # supersampling


def find_wordmark(arr):
    h, w = arr.shape[:2]
    white = (arr[..., 0] > 225) & (arr[..., 1] > 225) & (arr[..., 2] > 225) & (arr[..., 3] > 200)
    white[: int(h * 0.55)] = False  # wordmark lives in the lower half
    cols = np.where(white.sum(0) >= 2)[0]
    rows = np.where(white.sum(1) >= 1)[0]
    return cols.min(), cols.max(), rows.min(), rows.max()


def erase(arr, x0, x1, y0, y1):
    h, w = arr.shape[:2]
    k = w / 512.0
    px, pt, pb = int(12 * k) + 2, int(14 * k) + 2, int(20 * k) + 2
    X0, X1 = max(0, x0 - px), min(w - 1, x1 + px)
    Y0, Y1 = max(0, y0 - pt), min(h - 1, y1 + pb)
    top = arr[max(0, Y0 - 3):Y0, X0:X1 + 1].astype(float).mean(0)  # (cols, 4)
    bot = arr[Y1 + 1:min(h, Y1 + 4), X0:X1 + 1].astype(float).mean(0)
    n = Y1 - Y0 + 1
    t = np.linspace(0, 1, n)[:, None, None]
    fill = top[None] * (1 - t) + bot[None] * t
    out = arr.copy().astype(float)
    out[Y0:Y1 + 1, X0:X1 + 1] = fill
    return np.clip(out, 0, 255).astype(np.uint8)


def draw_study(img, cx, cy, target_w):
    w, h = img.size
    size = 50
    while True:
        f = ImageFont.truetype(FONT, size * SS)
        l, t, r, b = f.getbbox(TEXT)
        if (r - l) / SS >= target_w or size > 400:
            break
        size += 2
    l, t, r, b = f.getbbox(TEXT)
    tw, th = r - l, b - t
    pos = (cx * SS - tw / 2 - l, cy * SS - th / 2 - t)

    shadow = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((pos[0], pos[1] + 4 * SS * w / 512), TEXT, font=f, fill=(8, 30, 90, 150))
    shadow = shadow.filter(ImageFilter.GaussianBlur(3 * SS * w / 512))
    text = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    ImageDraw.Draw(text).text(pos, TEXT, font=f, fill=(255, 255, 255, 255))
    layer = Image.alpha_composite(shadow, text).resize((w, h), Image.LANCZOS)
    return Image.alpha_composite(img, layer)


def make_full(path_in, path_out):
    im = Image.open(path_in).convert("RGBA")
    arr = np.array(im)
    x0, x1, y0, y1 = find_wordmark(arr)
    clean = Image.fromarray(erase(arr, x0, x1, y0, y1), "RGBA")
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + 2 * im.width / 512
    res = draw_study(clean, cx, cy, (x1 - x0) * 1.45)
    os.makedirs(os.path.dirname(path_out), exist_ok=True)
    res.save(path_out)
    return res


os.makedirs(OUT + "/icons/en", exist_ok=True)
big = make_full(f"{SRC}/icons/zaker-study-512.png", f"{OUT}/icons/en/zaker-study-512.png")
big.resize((192, 192), Image.LANCZOS).save(f"{OUT}/icons/en/zaker-study-192.png")
big.resize((180, 180), Image.LANCZOS).save(f"{OUT}/apple-touch-icon-en.png")
make_full(f"{SRC}/icons/zaker-study-maskable.png", f"{OUT}/icons/en/zaker-study-maskable.png")
# 32px favicon: the wordmark is unreadable at that size, so keep the original artwork
Image.open(f"{SRC}/favicon.png").save(f"{OUT}/favicon-en.png")
print("done")

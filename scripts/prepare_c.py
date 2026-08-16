#!/usr/bin/env python3
"""Prepare assets/mascot_c.png from the provided JPG (white background -> transparent).

Keeps interior white areas (apron etc.) intact by flood-filling only the
connected white region that touches the image border.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(r"D:\微信图片_20260816090733_21_2.jpg")
OUT = Path("assets/mascot_c.png")

# Target height matches the existing mascot PNGs (520px).
TARGET_HEIGHT = 520
# Pixels this close to the removed background get a soft alpha ramp.
FEATHER = 2.0
# Near-white threshold used to detect the paper background.
WHITE = 245

def main() -> None:
    img = Image.open(SRC).convert("RGB")
    # Resize to the same visual height as the existing assets.
    scale = TARGET_HEIGHT / img.height
    target_size = (max(1, round(img.width * scale)), TARGET_HEIGHT)
    img = img.resize(target_size, Image.LANCZOS)

    rgb = np.asarray(img, dtype=np.uint8)
    h, w, _ = rgb.shape
    near_white = (
        (rgb[:, :, 0] >= WHITE)
        & (rgb[:, :, 1] >= WHITE)
        & (rgb[:, :, 2] >= WHITE)
    )

    # Keep only white components that touch the outer border.
    labeled, _ = ndimage.label(near_white, structure=np.ones((3, 3), dtype=int))
    border_labels = set(labeled[0, :]) | set(labeled[-1, :]) | set(labeled[:, 0]) | set(labeled[:, -1])
    border_labels.discard(0)
    background = np.isin(labeled, list(border_labels))

    # Alpha: fully transparent on the background, soft edge near it.
    dist = ndimage.distance_transform_edt(~background)
    alpha = np.clip(dist / FEATHER, 0.0, 1.0) * 255.0
    alpha[background] = 0.0
    alpha = np.rint(alpha).astype(np.uint8)

    rgba = np.dstack([rgb, alpha])
    out_img = Image.fromarray(rgba, "RGBA")

    # Trim fully transparent margins so the sprite is tightly packed.
    bbox = out_img.getchannel("A").getbbox()
    if bbox:
        out_img = out_img.crop(bbox)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out_img.save(OUT, "PNG")
    print(f"wrote {OUT} size={out_img.size} mode={out_img.mode}")

if __name__ == "__main__":
    main()

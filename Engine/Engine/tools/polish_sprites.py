#!/usr/bin/env python3
"""Padroniza os sprites de corpo inteiro (idle.png) para o mesmo tamanho dos outros: recorta a
margem transparente e redimensiona para 480 px de altura.

Uso:  python tools/polish_sprites.py
Depois rode:  python tools/make_basic_sprites.py  e  python tools/make_rigs.py
"""
import os, glob
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "assets", "characters")
TARGET_H = 480


def trim(im):
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 8)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def norm_idle(cid):
    p = os.path.join(CH, cid, "idle.png")
    im = Image.open(p).convert("RGBA")
    if im.height == TARGET_H:
        return None
    t = trim(im)
    k = TARGET_H / t.height
    out = t.resize((round(t.width * k), TARGET_H), Image.LANCZOS)
    out.save(p, optimize=True)
    print(f"{cid}: idle {im.size} -> {out.size}")
    return k


if __name__ == "__main__":
    for cid in sorted(os.listdir(CH)):
        norm_idle(cid)

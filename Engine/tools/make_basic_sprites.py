#!/usr/bin/env python3
"""
SPRITES BÁSICOS (provisórios) — gera andar, pular e agachar a partir do idle.png de cada personagem.

NÃO é pixel art desenhada à mão: o corpo é "fatiado" (tronco + duas pernas) e movido por
deslocamentos de pixels inteiros (sem borrar). Serve para o jogo já ter movimento enquanto as
sprites de verdade não chegam. Quando uma sprite desenhada existir, é só trocar o arquivo
assets/characters/<id>/walk.png (etc.) mantendo frameWidth/frameHeight/frames no arquivo do personagem.

Uso (na pasta do jogo, a que tem index.html):
    pip install pillow numpy
    python tools/make_basic_sprites.py            # todos os personagens de assets/characters/
    python tools/make_basic_sprites.py chico      # só um
    python tools/make_basic_sprites.py --preview  # também grava assets/_preview_<id>.png (folhas empilhadas)

Saída por personagem:  walk.png (8 quadros)  jump.png (6)  crouch.png (3)   — folhas em linha única
e um bloco `animations: {...}` que é escrito dentro de js/content/characters/<id>.js (entre os marcadores
  /* ANIM:BEGIN */ ... /* ANIM:END */ ).
"""
import math
import os
import re
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHARS = os.path.join(ROOT, "assets", "characters")
DATA = os.path.join(ROOT, "js", "content", "characters")
PAD = 28            # margem lateral de cada quadro (px do sprite de 480 de altura)
SPRITE_H = 480


# ------------------------------------------------------------------ anatomia
def runs(row):
    """lista de (início, fim) dos trechos preenchidos de uma linha booleana"""
    d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]]))
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))


def anatomy(alpha):
    """acha a linha do quadril (onde as pernas se separam) e a reta que divide perna esquerda/direita"""
    h, w = alpha.shape
    cx0, cx1 = int(w * .28), int(w * .72)
    hip, crotch_x = None, w // 2
    for y in range(int(h * .45), int(h * .85)):
        r = runs(alpha[y, cx0:cx1])
        gaps = [(r[i + 1][0] - r[i][1]) for i in range(len(r) - 1)]
        if gaps and max(gaps) >= 4 and all(
            len(runs(alpha[yy, cx0:cx1])) >= 2 for yy in range(y, min(h, y + 8))
        ):
            i = int(np.argmax(gaps))
            hip = y
            crotch_x = cx0 + (r[i][1] + r[i + 1][0]) // 2
            break
    if hip is None:
        hip = int(h * .56)
    # vão entre os pés (últimas linhas)
    best, foot_x = 0, crotch_x
    for y in range(int(h * .93), h - 2):
        r = runs(alpha[y])
        for i in range(len(r) - 1):
            g = r[i + 1][0] - r[i][1]
            if g > best:
                best, foot_x = g, (r[i][1] + r[i + 1][0]) // 2
    return hip, crotch_x, foot_x


def split_pieces(rgba, hip, crotch_x, foot_x):
    h, w, _ = rgba.shape
    upper = rgba.copy(); upper[hip:] = 0
    left = np.zeros_like(rgba); right = np.zeros_like(rgba)
    for y in range(hip, h):
        t = (y - hip) / max(1, h - 1 - hip)
        cut = int(round(crotch_x + (foot_x - crotch_x) * t))
        left[y, :cut] = rgba[y, :cut]
        right[y, cut:] = rgba[y, cut:]
    return upper, left, right


# ------------------------------------------------------------------ transformações (só pixels inteiros)
def shear(piece, y0, y1, fn):
    """desloca cada linha y em [y0,y1) por fn(y) pixels (inteiro)"""
    out = np.zeros_like(piece); w = piece.shape[1]
    for y in range(y0, y1):
        dx = int(round(fn(y)))
        if dx >= 0: out[y, dx:] = piece[y, : w - dx] if dx else piece[y]
        else:       out[y, : w + dx] = piece[y, -dx:]
    return out


def shift_y(piece, dy):
    out = np.zeros_like(piece)
    if dy > 0:   out[dy:] = piece[:-dy]
    elif dy < 0: out[:dy] = piece[-dy:]
    else:        out = piece.copy()
    return out


def squash_legs(piece, hip, scale, pivot):
    """encurta a perna na vertical (NEAREST). pivot='foot': pés no chão (agachar) | 'hip': pés sobem (encolher)"""
    h = piece.shape[0]
    seg = piece[hip:]
    nh = max(2, int(round(seg.shape[0] * scale)))
    idx = np.minimum(seg.shape[0] - 1, (np.arange(nh) / scale).astype(int))
    small = seg[idx]
    out = np.zeros_like(piece)
    top = h - nh if pivot == "foot" else hip
    out[top: top + nh] = small
    return out, (h - hip) - nh if pivot == "foot" else 0          # quanto o quadril desce


def compose(layers):
    img = Image.fromarray(layers[0], "RGBA")
    for l in layers[1:]:
        img = Image.alpha_composite(img, Image.fromarray(l, "RGBA"))
    return img


def build_frame(parts, hip, h, *, step=0.0, lift=(0, 0), legs_scale=1.0, pivot="foot", spread=0, lean=0.0, upper_dy=0, bob=0):
    """monta um quadro. step: balanço das pernas (px nos pés) · lift: (esq,dir) px · spread: afasta os pés"""
    upper, left, right = parts
    pieces = []
    drop = 0
    for sign, leg in ((-1, left), (1, right)):
        leg = leg.copy()
        if legs_scale != 1.0:
            leg, drop = squash_legs(leg, hip, legs_scale, pivot)
        span = max(1, h - hip)
        off = (step if sign < 0 else -step) + sign * spread
        leg = shear(leg, hip, h, lambda y, o=off: o * ((y - hip) / span) ** 1.0)
        l = lift[0] if sign < 0 else lift[1]
        if l: leg = shift_y(leg, -int(l))
        pieces.append(leg)
    up = shear(upper, 0, hip, lambda y: lean * (hip - y) / hip)
    up = shift_y(up, int(upper_dy + drop + bob))
    return compose(pieces + [up])


# ------------------------------------------------------------------ animações
def walk_frames(parts, hip, h):
    n, out = 8, []
    for k in range(n):
        p = 2 * math.pi * k / n
        stepamp = 30
        s = math.sin(p)
        lift = (int(22 * max(0, math.cos(p))), int(22 * max(0, -math.cos(p))))
        out.append(build_frame(parts, hip, h, step=stepamp * s, lift=lift, lean=5 * s, bob=int(7 * abs(s))))
    return out


def jump_frames(parts, hip, h):
    spec = [  # legs_scale, pivot, spread, upper_dy, lean
        dict(legs_scale=.80, pivot="foot", spread=6),                       # agacha para pular
        dict(legs_scale=1.0, pivot="foot", spread=0, lean=-3),              # estica ao decolar
        dict(legs_scale=.74, pivot="hip", spread=10, lean=-2),              # recolhe
        dict(legs_scale=.64, pivot="hip", spread=14),                       # pico
        dict(legs_scale=.74, pivot="hip", spread=12, lean=3),
        dict(legs_scale=.96, pivot="hip", spread=16, lean=4),               # estica para cair
    ]
    return [build_frame(parts, hip, h, **s) for s in spec]


def crouch_frames(parts, hip, h):
    spec = [dict(legs_scale=.90, spread=4, lean=3), dict(legs_scale=.76, spread=10, lean=6), dict(legs_scale=.66, spread=14, lean=8)]
    return [build_frame(parts, hip, h, pivot="foot", **s) for s in spec]


def to_sheet(frames, fw, fh):
    sheet = Image.new("RGBA", (fw * len(frames), fh), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * fw, 0))
    return sheet


def process(cid, preview=False):
    folder = os.path.join(CHARS, cid)
    idle = Image.open(os.path.join(folder, "idle.png")).convert("RGBA")
    w, h = idle.size
    fw = w + 2 * PAD
    canvas = Image.new("RGBA", (fw, h), (0, 0, 0, 0)); canvas.paste(idle, (PAD, 0))
    rgba = np.array(canvas)
    hip, cx, fx = anatomy(rgba[:, :, 3] > 128)
    parts = split_pieces(rgba, hip, cx, fx)
    sheets = {"walk": walk_frames(parts, hip, h), "jump": jump_frames(parts, hip, h), "crouch": crouch_frames(parts, hip, h)}
    fps = {"walk": 11, "jump": 9, "crouch": 22}
    loop = {"walk": True, "jump": False, "crouch": False}
    lines = []
    for name, frames in sheets.items():
        to_sheet(frames, fw, h).save(os.path.join(folder, f"{name}.png"), optimize=True)
        extra = "" if loop[name] else ", loop: false"
        lines.append(f"    {name}: {{ src: 'assets/characters/{cid}/{name}.png', frameWidth: {fw}, frameHeight: {h}, frames: {len(frames)}, fps: {fps[name]}{extra}, height: 200 }},")
    block = "/* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */\n  animations: {\n" + "\n".join(lines) + "\n  },\n  /* ANIM:END */"
    path = os.path.join(DATA, cid + ".js")
    src = open(path, encoding="utf-8").read()
    if "/* ANIM:BEGIN" in src:
        src = re.sub(r"/\* ANIM:BEGIN.*?/\* ANIM:END \*/", block.replace("\\", "\\\\"), src, flags=re.S)
    else:
        src, n = re.subn(r"animations:\s*\{\s*\},?", block.replace("\\", "\\\\"), src, count=1)
        if not n:
            print(f"  ! {cid}: não achei `animations: {{}}` em {path}"); return
    open(path, "w", encoding="utf-8").write(src)
    print(f"{cid:9} quadril y={hip} ({hip / h:.2f}) · vão dos pés x={fx} · quadro {fw}x{h}")
    if preview:
        rows = [to_sheet(f, fw, h) for f in sheets.values()]
        W = max(r.width for r in rows)
        prev = Image.new("RGBA", (W, h * 3), (35, 50, 60, 255))
        for i, r in enumerate(rows): prev.alpha_composite(r, (0, i * h))
        prev.resize((W // 2, h * 3 // 2), Image.NEAREST).save(os.path.join(ROOT, "assets", f"_preview_{cid}.png"))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    ids = args or sorted(d for d in os.listdir(CHARS) if os.path.exists(os.path.join(CHARS, d, "idle.png")))
    for cid in ids:
        process(cid, preview="--preview" in sys.argv)

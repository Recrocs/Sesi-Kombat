#!/usr/bin/env python3
"""
OLHOS FECHADOS — gera assets/characters/<id>/sleep.png (o idle.png com os olhos fechados).
Usado quando o personagem fica DORMINDO (especial do Vicenzo).

EYES = posição dos olhos em % da imagem (x%, y%), no idle.png original (que olha p/ a esquerda).
Se um olho ficar torto, ajuste a tabela e rode de novo:   python tools/make_closed_eyes.py
`skin` = de onde amostrar a cor da pele (dx%, dy% da altura) para "apagar" o olho aberto.
Quem usa óculos escuros/óculos de proteção (juliano, robson) fica com lista vazia — os olhos já não aparecem.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EYES = {
  'chico':   dict(eyes=[(35.5,10.4),(45.3,10.4)], skin=(0,-5.0)),
  'gerbi':   dict(eyes=[(35.5,10.8),(42.5,11.0)], skin=(0,3.0)),
  'italo':   dict(eyes=[(37.0,10.6),(45.8,10.6)], skin=(0,3.0)),
  'jordan':  dict(eyes=[(36.9,10.8),(45.3,10.8)], skin=(0,3.0)),
  'juliano': dict(eyes=[], skin=(0,3.0)),
  'kaique':  dict(eyes=[(37.3,11.2),(46.2,11.1)], skin=(0,3.0)),
  'leandro': dict(eyes=[(40.7,14.0),(45.8,14.0)], skin=(0,3.0)),
  'luis':    dict(eyes=[(42.2,9.8)], skin=(0,3.0)),
  'matheus': dict(eyes=[(34.2,10.5),(40.7,10.4)], skin=(0,3.0)),
  'otavio':  dict(eyes=[(37.4,9.9),(45.7,9.7)], skin=(0,3.0)),
  'pereira': dict(eyes=[(37.2,11.0),(43.4,11.0)], skin=(0,3.0)),
  'reenye':  dict(eyes=[(36.6,11.1),(43.6,11.1)], skin=(0,-5.0)),
  'robson':  dict(eyes=[], skin=(0,3.0)),
  'ronaldo': dict(eyes=[(41.5,10.8),(46.2,10.8)], skin=(0,3.0)),
  'vicenzo': dict(eyes=[(38.8,11.6),(41.5,11.6)], skin=(0,3.0)),
  'welli':   dict(eyes=[(44.8,10.4)], skin=(0,3.0)),
}
LID = (38, 24, 20, 255)

def skin_color(a, cx, cy, rx, ry):
    """cor da pele = mediana dos pixels num anel em volta do olho (ignora cílios/sobrancelha escuros e o branco do olho)"""
    H, W = a.shape[:2]; pts = []
    for ang in np.linspace(0, 2*np.pi, 40, endpoint=False):
        for m in (1.5, 2.0, 2.5):
            x, y = int(cx + np.cos(ang)*rx*m), int(cy + np.sin(ang)*ry*m*1.6)
            if 0 <= x < W and 0 <= y < H:
                r, g, b, al = (int(v) for v in a[y, x])
                lum = 0.3*r + 0.59*g + 0.11*b
                if al > 200 and 95 < lum < 225 and r >= g >= b - 8: pts.append((r, g, b))
    if not pts: return (200, 140, 100)
    return tuple(int(v) for v in np.median(np.array(pts), axis=0))

def make(cid, cfg):
    from PIL import ImageFilter
    p = os.path.join(ROOT, 'assets', 'characters', cid, 'idle.png')
    im = Image.open(p).convert('RGBA'); W, H = im.size
    a = np.array(im)
    SS = 4                                                    # desenha em 4x e reduz (bordas suaves)
    big = im.resize((W*SS, H*SS), Image.LANCZOS)
    rx, ry = 0.0135*H, 0.0072*H
    patch = Image.new('RGBA', big.size, (0, 0, 0, 0)); pd = ImageDraw.Draw(patch)
    for ex, ey in cfg['eyes']:
        cx, cy = ex/100*W, ey/100*H
        skin = skin_color(a, cx, cy, rx, ry) + (255,)
        pd.ellipse(((cx-rx)*SS, (cy-ry)*SS, (cx+rx)*SS, (cy+ry)*SS), fill=skin)      # apaga o olho aberto
    patch = patch.filter(ImageFilter.GaussianBlur(SS*0.7))
    big.alpha_composite(patch)
    d = ImageDraw.Draw(big)
    for ex, ey in cfg['eyes']:
        cx, cy = ex/100*W*SS, ey/100*H*SS; rxs, rys = rx*SS, ry*SS
        lw = max(2, round(0.0058*H*SS))
        d.arc((cx-rxs*0.95, cy-rys*1.7, cx+rxs*0.95, cy+rys*0.6), 15, 165, fill=LID, width=lw)   # pálpebra fechada (‿)
    out = big.resize((W, H), Image.LANCZOS)
    o = np.array(out); o[:,:,3] = np.minimum(o[:,:,3], a[:,:,3])                          # não vaza para fora do corpo
    Image.fromarray(o, 'RGBA').save(os.path.join(ROOT, 'assets', 'characters', cid, 'sleep.png'))

if __name__ == '__main__':
    for cid, cfg in EYES.items():
        make(cid, cfg); print('ok', cid)

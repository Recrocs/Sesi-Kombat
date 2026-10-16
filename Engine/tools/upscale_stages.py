#!/usr/bin/env python3
"""Melhora os fundos dos cenários: suaviza artefatos de JPEG, amplia para 1920x1080 (Lanczos)
e aplica um leve realce de nitidez. NÃO é IA: é ampliação de boa qualidade — para um resultado
melhor, troque o background.jpg por uma arte já em 1920x1080 (o jogo usa qualquer tamanho).

Uso:  python tools/upscale_stages.py          (todos os cenários; pula os que já têm 1920 de largura)
      python tools/upscale_stages.py --force
Requer: pip install opencv-python-headless numpy
"""
import glob, os, sys
import cv2, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1920, 1080
force = "--force" in sys.argv

for p in sorted(glob.glob(os.path.join(ROOT, "assets", "stages", "*", "background.jpg"))):
    img = cv2.imread(p)
    h, w = img.shape[:2]
    name = os.path.basename(os.path.dirname(p))
    if w >= W and not force:
        print(f"{name}: já tem {w}x{h}, pulei"); continue
    img = cv2.fastNlMeansDenoisingColored(img, None, 2.5, 2.5, 5, 15)           # tira bloquinhos do JPEG
    up = cv2.resize(img, (W, H), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(up, (0, 0), 1.6)
    up = cv2.addWeighted(up, 1.45, blur, -0.45, 0)                                 # realce suave
    cv2.imwrite(p, up, [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_OPTIMIZE, 1])
    print(f"{name}: {w}x{h} -> {W}x{H}  ({os.path.getsize(p)//1024} KB)")

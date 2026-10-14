#!/usr/bin/env python3
"""
PROCESSADOR DE ASSETS — transforma as imagens cruas do repositório em assets do jogo.

  Personagens  (jpg/jpeg, fundo branco)  →  assets/characters/<id>/idle.png      corpo inteiro, fundo transparente, 480px de altura
                                            assets/characters/<id>/portrait.png  busto quadrado 320x320 (cards e tela de versus)
  Cenários     (jpg/jpeg, qualquer proporção) → assets/stages/<id>/background.jpg  16:9 (1280x720)
                                            assets/stages/<id>/thumb.jpg       prévia 16:9 (640x360)

Uso (rode da pasta do jogo, a que contém index.html):

  pip install pillow numpy scipy
  python tools/process_assets.py --chars  "../Sesi-Kombat/Personagens" --stages "../Sesi-Kombat/Cenários"

  --only chico gerbi      processa só esses ids (personagens e/ou cenários)
  --chars / --stages      pode usar só um dos dois

O id vem do nome do arquivo: "chico.jpeg" → chico ; "society cenario.jpeg" → society (primeira palavra).
Depois de processar um personagem/cenário NOVO, crie o arquivo de dados dele em js/content/ (veja o README).
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# ------------------------------------------------------------------------------------------
# AJUSTES POR PERSONAGEM / CENÁRIO  (só precisa mexer aqui se uma imagem nova ficar estranha)
# ------------------------------------------------------------------------------------------

# Personagens cuja imagem original tem SOMBRA cinza no chão (o jogo desenha a própria sombra).
CHAR_HAS_SHADOW = {"kaique", "matheus", "vicenzo"}

# Cenários: onde cortar para 16:9. anchor = (x, y) de 0 a 1 — qual parte da imagem original fica
# visível quando ela é mais "alta" (y) ou mais "larga" (x) que 16:9. (0.5, 1) = centro/embaixo.
STAGE_ANCHOR = {
    "society": (0.5, 1.0),
    "quadra": (0.5, 1.0),
    "futmesa": (0.5, 0.78),
    "refeitorio": (0.5, 1.0),
    "salas": (0.5, 1.0),
}

SPRITE_HEIGHT = 480      # altura final do corpo inteiro (px)
PORTRAIT_SIZE = 320      # lado do retrato (px)
PORTRAIT_FRACTION = 0.46  # que parte da altura do corpo entra no retrato (cabeça + ombros + punhos)
STAGE_SIZE = (1280, 720)
THUMB_SIZE = (640, 360)

EXTS = (".jpg", ".jpeg", ".png", ".webp")


def ident(filename):
    stem = os.path.splitext(filename)[0].strip().lower()
    return stem.split()[0].replace("_", "-")


# ------------------------------------------------------------------------------------------
# Personagens
# ------------------------------------------------------------------------------------------
def remove_background(rgb, shadow):
    """Devolve máscara booleana do FUNDO (True = fundo)."""
    a = rgb.astype(np.int16)
    mn, mx = a.min(2), a.max(2)
    lum = a.mean(2)
    h, w = mn.shape

    # 1) branco conectado às bordas da imagem
    white = mn >= 230
    lab, _ = ndi.label(white)
    edge_labels = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    edge_labels = edge_labels[edge_labels != 0]
    bg = np.isin(lab, edge_labels)

    # 2) sombra cinza no chão (só personagens marcados)
    neutral = (mx - mn) <= 14
    if shadow:
        cand = neutral & (lum >= 55) & (lum < 230) & ~bg
        cand[: int(h * 0.55), :] = False                      # sombra só na metade de baixo
        lab2, n2 = ndi.label(cand)
        near_bg = ndi.binary_dilation(bg, iterations=2)
        for i in range(1, n2 + 1):
            comp = lab2 == i
            if comp.sum() >= 600 and (comp & near_bg).sum() >= 40:
                bg |= comp
        # a sombra pode ter isolado pedaços de fundo branco: se encostam no fundo já removido, também são fundo
        lab_w, n_w = ndi.label(white & ~bg)
        near_bg = ndi.binary_dilation(bg, iterations=3)
        for i in range(1, n_w + 1):
            comp = lab_w == i
            if (comp & near_bg).any():
                bg |= comp

    # 3) halo claro (franja de JPEG) colado no fundo
    for _ in range(3):
        edge = ndi.binary_dilation(bg) & ~bg
        fringe = edge & ((mn >= 200) | (shadow & neutral & (lum >= 100)))
        if not fringe.any():
            break
        bg |= fringe

    # 4) some com ilhas minúsculas de "personagem" (restos de sombra/ruído)
    fg = ~bg
    lab3, n3 = ndi.label(fg)
    if n3 > 1:
        sizes = ndi.sum(fg, lab3, range(1, n3 + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * 0.015]
        fg = np.isin(lab3, keep)
    # buracos de fundo totalmente cercados pelo personagem continuam sendo personagem (camisa branca etc.)
    return ~fg


def detect_facing(img):
    """Para que lado o personagem olha no PNG? Na guarda de luta o braço da frente é o que mais
    se projeta para fora do tronco: se ele sai para a esquerda, o personagem olha para a esquerda."""
    a = np.array(img.getchannel("A")) > 128
    h = a.shape[0]
    cx = np.where(a[int(.1 * h):int(.6 * h)])[1].mean()
    xs = np.where(a[int(.15 * h):int(.5 * h)].any(0))[0]
    return "left" if (cx - xs.min()) > (xs.max() - cx) else "right"


def process_character(path, out_dir, cid):
    rgb = np.array(Image.open(path).convert("RGB"))
    bg = remove_background(rgb, cid in CHAR_HAS_SHADOW)
    rgba = np.dstack([rgb, np.where(bg, 0, 255).astype(np.uint8)])
    img = Image.fromarray(rgba, "RGBA")
    img = img.crop(img.getchannel("A").getbbox())

    # --- retrato: do topo do corpo, centrado na cabeça ---
    W, H = img.size
    alpha = np.array(img.getchannel("A")) > 0
    S = int(round(H * PORTRAIT_FRACTION))
    top = alpha[: max(8, int(H * 0.10))]
    cols = np.where(top.any(0))[0]
    cx = int(cols.mean()) if len(cols) else W // 2
    left = int(np.clip(cx - S // 2, 0, max(0, W - S)))
    crop = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    crop.paste(img.crop((left, 0, min(W, left + S), S)), (0, 0))
    portrait = crop.resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.LANCZOS)

    # --- corpo inteiro ---
    nw = max(1, round(W * SPRITE_HEIGHT / H))
    idle = img.resize((nw, SPRITE_HEIGHT), Image.LANCZOS)

    os.makedirs(out_dir, exist_ok=True)
    idle.save(os.path.join(out_dir, "idle.png"), optimize=True)
    portrait.save(os.path.join(out_dir, "portrait.png"), optimize=True)
    print(f"            {cid:10} olha para a {detect_facing(img).upper()} no PNG  → use  facing: '{detect_facing(img)}'  em js/content/characters/{cid}.js")
    return idle.size


# ------------------------------------------------------------------------------------------
# Cenários
# ------------------------------------------------------------------------------------------
def crop_16_9(img, anchor):
    W, H = img.size
    target = STAGE_SIZE[0] / STAGE_SIZE[1]
    if W / H > target:                       # mais larga que 16:9 → corta dos lados
        nw = int(round(H * target))
        x = int(round((W - nw) * anchor[0]))
        return img.crop((x, 0, x + nw, H))
    nh = int(round(W / target))              # mais alta que 16:9 → corta em cima/embaixo
    y = int(round((H - nh) * anchor[1]))
    return img.crop((0, y, W, y + nh))


def process_stage(path, out_dir, sid):
    img = Image.open(path).convert("RGB")
    cropped = crop_16_9(img, STAGE_ANCHOR.get(sid, (0.5, 1.0)))
    os.makedirs(out_dir, exist_ok=True)
    cropped.resize(STAGE_SIZE, Image.LANCZOS).save(os.path.join(out_dir, "background.jpg"), quality=90, optimize=True)
    cropped.resize(THUMB_SIZE, Image.LANCZOS).save(os.path.join(out_dir, "thumb.jpg"), quality=85, optimize=True)
    return img.size


# ------------------------------------------------------------------------------------------
def list_images(folder):
    return sorted(f for f in os.listdir(folder) if f.lower().endswith(EXTS))


def main():
    ap = argparse.ArgumentParser(description="Processa os assets do repositório para o jogo.")
    ap.add_argument("--chars", help="pasta com as imagens dos personagens")
    ap.add_argument("--stages", help="pasta com as imagens dos cenários")
    ap.add_argument("--out", default="assets", help="pasta de saída (padrão: assets)")
    ap.add_argument("--only", nargs="*", help="processa só estes ids")
    args = ap.parse_args()
    if not args.chars and not args.stages:
        ap.error("informe --chars e/ou --stages")

    only = set(i.lower() for i in (args.only or []))

    if args.chars:
        for f in list_images(args.chars):
            cid = ident(f)
            if only and cid not in only:
                continue
            size = process_character(os.path.join(args.chars, f), os.path.join(args.out, "characters", cid), cid)
            print(f"personagem  {cid:10} {f:24} -> idle {size[0]}x{size[1]}")

    if args.stages:
        for f in list_images(args.stages):
            sid = ident(f)
            if only and sid not in only:
                continue
            size = process_stage(os.path.join(args.stages, f), os.path.join(args.out, "stages", sid), sid)
            print(f"cenário     {sid:10} {f:24} {size[0]}x{size[1]} -> 1280x720")


if __name__ == "__main__":
    sys.exit(main())

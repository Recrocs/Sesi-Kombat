#!/usr/bin/env python3
"""
RIG BÁSICO — descobre, em cada idle.png, onde ficam o QUADRIL e o ponto de divisão das pernas,
para o renderer montar as poses de andar / pular / agachar por código (js/game/renderer.js).

Gera  js/content/rigs.js   com  SK.Rigs = { <id>: { hipY, splitX } }   (frações de 0 a 1 da imagem).
Rode sempre que processar personagens novos:

  python tools/make_rigs.py            (na pasta do jogo, a que contém index.html)

Quando existirem sprites desenhados de verdade (campo `animations` do personagem), o renderer usa
esses e ignora o rig.
"""
import glob
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def runs(row):
    """lista de (início, fim) dos trechos opacos de uma linha"""
    idx = np.where(row)[0]
    if not len(idx):
        return []
    out, start, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i != prev + 1:
            out.append((start, prev)); start = i
        prev = i
    out.append((start, prev))
    return out


def rig_for(path):
    a = np.array(Image.open(path).getchannel("A")) > 128
    h, w = a.shape
    # sobe a partir dos pés até as duas pernas virarem uma só: aí está o quadril
    split_x, hip = w / 2, int(h * 0.55)
    best_gap_x = None
    for y in range(int(h * 0.97), int(h * 0.40), -1):
        r = runs(a[y])
        if len(r) >= 2:
            # maior vão entre trechos = espaço entre as pernas
            gaps = [(r[i + 1][0] - r[i][1], (r[i][1] + r[i + 1][0]) / 2) for i in range(len(r) - 1)]
            g = max(gaps)
            if g[0] >= 4:
                best_gap_x = g[1]
        elif len(r) == 1 and best_gap_x is not None:
            hip = y
            break
    if best_gap_x is not None:
        split_x = best_gap_x
    return {"hipY": round(hip / h, 3), "splitX": round(split_x / w, 3)}


def main():
    rigs = {}
    for p in sorted(glob.glob(os.path.join(ROOT, "assets", "characters", "*", "idle.png"))):
        cid = os.path.basename(os.path.dirname(p))
        rigs[cid] = rig_for(p)
        print(f"{cid:10} {rigs[cid]}")
    out = os.path.join(ROOT, "js", "content", "rigs.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* GERADO por tools/make_rigs.py — não edite à mão (ou edite e rode a ferramenta de novo só se precisar refazer).\n"
                "   hipY / splitX: posição do quadril e da divisão das pernas, em fração do idle.png. */\n")
        f.write("SK.Rigs = " + json.dumps(rigs, indent=2) + ";\n")
    print("→", out)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
FUNDO DOS MENUS — monta assets/ui/menu_background.jpg (1920x1080).
Base: tools/menu_bg_reference.png (deserto, plataforma, Ronaldo segurando o Sonho de Valsa gigante).
  1) apaga o logo e os textos espelhando o lado direito sobre o esquerdo (a cena é simétrica em torno da plataforma);
  2) troca a faixa de areia de baixo (onde ficavam os personagens genéricos) por areia nova com dunas;
  3) coloca os personagens do jogo em posição de luta, olhando para o centro, e uns docinhos pela areia.
Para refazer:   python tools/make_menu_bg.py     (na pasta que contém index.html)
"""
import math, os, random
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'assets', *p)
rng = np.random.default_rng(5); random.seed(5)

# ------------------------------------------------------------------ 1) cenário base (1024 x 651)
R = np.array(Image.open(os.path.join(ROOT, 'tools', 'menu_bg_reference.png')).convert('RGB')).astype(np.float32); H, W = R.shape[:2]
AXIS = 525
Rp = cv2.copyMakeBorder(R, 0, 0, 0, 90, cv2.BORDER_REFLECT)             # sobra à direita para o espelho chegar na borda esquerda
xs = np.arange(W)
mir = Rp[:, np.clip(2 * AXIS - xs, 0, Rp.shape[1] - 1)]
a = np.clip((426 - xs) / 26.0, 0, 1)[None, :, None]                      # espelho até x=400; depois mistura suave com o original
M = mir * a + R * (1 - a)

# cabeças que passam de y=405 nas bordas (lutadores/ninja do original): some por inpaint (só tons não-areia)
mask = np.zeros((H, W), np.uint8)
for x0, y0, x1, y1 in [(35, 404, 140, 445), (120, 404, 260, 445), (300, 404, 360, 445), (740, 404, 850, 445), (850, 404, 990, 445)]:
    hsv = cv2.cvtColor(M[y0:y1, x0:x1].astype(np.uint8), cv2.COLOR_RGB2HSV)
    h_, s_, v_ = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    mask[y0:y1, x0:x1] = np.where((h_ >= 8) & (h_ <= 24) & (s_ >= 70) & (s_ <= 190) & (v_ >= 150), 0, 255)
# restinho do redemoinho azul claro perto da porta da plataforma: some (só pixels claros e pouco saturados)
hsv = cv2.cvtColor(M[404:452, 392:452].astype(np.uint8), cv2.COLOR_RGB2HSV)
mask[404:452, 392:452] = np.where((hsv[..., 1] < 90) & (hsv[..., 2] > 150), 255, 0)
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
M = cv2.cvtColor(cv2.inpaint(cv2.cvtColor(M.astype(np.uint8), cv2.COLOR_RGB2BGR), mask, 6, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB).astype(np.float32)

# areia nova na faixa de baixo, com dunas suaves (luz em cima de cada duna, sombra logo abaixo)
YC = 440
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def noise(scale, seed):
    g = np.random.default_rng(seed).random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return cv2.resize(g, (W, H), interpolation=cv2.INTER_CUBIC)
base = M[YC - 10:YC - 2, 250:350].reshape(-1, 3).mean(0)
t = np.clip((yy - YC) / (H - YC), 0, 1)[..., None]
sand = base * (1 - t * 0.10) + np.array([14, 4, -8]) * t
shade = np.zeros((H, W), np.float32)
for y0, amp, f, ph, wid in [(462, 9, 0.011, 0.5, 26), (500, 12, 0.008, 2.1, 30), (545, 14, 0.006, 4.0, 34), (596, 16, 0.009, 1.2, 36)]:
    ry = y0 + amp * np.sin(xx * f + ph) + (noise(80, int(y0)) - 0.5) * 8
    d = yy - ry
    shade += np.where(d < 0, np.clip(1 + d / 6, 0, 1) * 0.0, 0) + np.clip(1 - np.abs(d) / 3, 0, 1) * 0.55 - np.where((d > 0) & (d < wid), (1 - d / wid) * 0.30, 0)
sand = sand * (1 + shade[..., None] * 0.16) * (0.97 + 0.06 * noise(36, 22)[..., None]) * (0.985 + 0.03 * noise(5, 23)[..., None])
b = np.clip((yy - (YC - 16)) / 30.0, 0, 1)[..., None]
M = M * (1 - b) + sand * b
M += (rng.random((H, W, 1)) - 0.5).astype(np.float32) * 4
scene = Image.fromarray(np.clip(M, 0, 255).astype('uint8')).resize((1920, round(H * 1920 / W)), Image.LANCZOS).crop((0, 0, 1920, 1080))
scene = scene.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2)).convert('RGBA')

# ------------------------------------------------------------------ 2) personagens do jogo + docinhos
def load(p): return Image.open(p).convert('RGBA')
def shadow(layer, cx, cy, wd, ht, a=120):
    s = Image.new('RGBA', layer.size, (0, 0, 0, 0)); ImageDraw.Draw(s).ellipse((cx - wd / 2, cy - ht / 2, cx + wd / 2, cy + ht / 2), fill=(60, 30, 10, a))
    return Image.alpha_composite(layer, s.filter(ImageFilter.GaussianBlur(ht * 0.4)))
def paste_base(layer, im, cx, by):
    t = Image.new('RGBA', layer.size, (0, 0, 0, 0)); t.alpha_composite(im, (int(cx - im.width / 2), int(by - im.height))); return Image.alpha_composite(layer, t)
def warm(im, k=0.10):                                                      # puxa um pouco para o tom quente do cenário
    o = Image.new('RGBA', im.size, (255, 214, 160, 255)); o.putalpha(im.getchannel('A').point(lambda v: int(v * k))); return Image.alpha_composite(im, o)

def hero(layer, cid, x, base_y, hh, face_right):
    im = load(A('characters', cid, 'idle.png')); bb = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    im = im.crop((0, 0, im.width, bb[3]))                                    # corta o vazio embaixo; mantém a proporção real do jogo
    k = hh / 480.0; im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    if face_right: im = im.transpose(Image.FLIP_LEFT_RIGHT)                  # o sprite original olha para a esquerda
    layer = shadow(layer, x, base_y - 4, im.width * 0.78, 30)
    return paste_base(layer, warm(im), x, base_y)

candy = load(A('powers', 'ronaldoSpecial.png')); candy = candy.crop(candy.getbbox())
def put_candy(layer, x, y, w_, ang):
    c = candy.resize((w_, round(candy.height * w_ / candy.width)), Image.LANCZOS).rotate(ang, expand=True, resample=Image.BICUBIC)
    layer = shadow(layer, x, y + c.height * 0.38, c.width * 0.8, 14, 90)
    t = Image.new('RGBA', layer.size, (0, 0, 0, 0)); t.alpha_composite(c, (int(x - c.width / 2), int(y - c.height / 2))); return Image.alpha_composite(layer, t)

BACK = [('gerbi', 260), ('juliano', 480), ('matheus', 700), ('kaique', 960), ('pereira', 1220), ('robson', 1440), ('vicenzo', 1660)]
FRONT = [('luis', 170), ('chico', 400), ('italo', 630), ('jordan', 860), ('leandro', 1060), ('otavio', 1290), ('reenye', 1520), ('welli', 1750)]
for cid, x in BACK: scene = hero(scene, cid, x, 985, 215, x <= 960)
for x, y, w_, ang in [(430, 1000, 74, 25), (1500, 1010, 70, -30), (980, 1030, 78, 12)]: scene = put_candy(scene, x, y, w_, ang)
for cid, x in FRONT: scene = hero(scene, cid, x, 1072, 262, x < 960)
for x, y, w_, ang in [(60, 1055, 120, 18), (1860, 1052, 126, -22), (530, 1066, 84, -15), (1390, 1064, 80, 28)]: scene = put_candy(scene, x, y, w_, ang)

# ------------------------------------------------------------------ 3) acabamento: poeira no ar e vinheta leve
fx = Image.new('RGBA', scene.size, (0, 0, 0, 0)); fd = ImageDraw.Draw(fx)
for _ in range(110):
    x = random.randint(0, 1920); y = random.randint(520, 1080); r = random.randint(1, 3)
    fd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 230, 190, random.randint(40, 120)))
scene = Image.alpha_composite(scene, fx.filter(ImageFilter.GaussianBlur(0.6)))
Y, X = np.mgrid[0:1080, 0:1920]; v = np.clip(np.hypot((X - 960) / 960, (Y - 540) / 540) - 0.7, 0, 1) ** 1.5
black = Image.new('RGBA', scene.size, (30, 12, 4, 255)); black.putalpha(Image.fromarray((v * 120).astype('uint8'), 'L'))
scene = Image.alpha_composite(scene, black).convert('RGB')
os.makedirs(A('ui'), exist_ok=True)
scene.save(A('ui', 'menu_background.jpg'), quality=92)
print('ok', scene.size)

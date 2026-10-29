/* ==========================================================================
   SPECIAL FX — animação própria de cada especial (tudo por código, sem imagens novas).

   Cada golpe pode ter `anim` (veja os personagens em js/content/characters/*.js):
     anim: {
       charge: { rot, tRot, ox, oy, sx, sy, tSY, stance, wobble:{ chave:[amp, Hz] } },   // pose no fim da PREPARAÇÃO
       strike: { ... },                                                                  // pose na hora de LANÇAR
       fx: { charge: <emissor>, active: <emissor>, release: <efeito> }                   // brilhos/partículas (um ou lista)
     }
   Convenção das poses: valores positivos = para a FRENTE (rot/tRot em rad, ox/oy em px, sx/sy = achatar/esticar).
   Emissores (charge/active): sparks, ring, groundring, beam, notes, symbols, smoke, papers, glint, candy, gas, dust
   Efeitos de lançamento (release): ring  (onda de choque; r = raio, origin = hand|feet|head, shake = tremor de tela)
   Projétil: glow, ghost (rastro), shed (cai papel/faísca), dust, landFx { kind: impact|splat|gas, color, shake }
   Tudo é "sem estado": as partículas são calculadas só a partir do tempo, então não pesa nem vaza memória.
   ========================================================================== */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const fr = (x) => x - Math.floor(x);
  const hash = (i, s) => fr(Math.sin(i * 12.9898 + (s || 0) * 78.233) * 43758.5453);
  const ease = {
    out: (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3),
    inOut: (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); },
  };
  const KEYS = ['rot', 'ox', 'oy', 'sx', 'sy', 'tRot', 'tOx', 'tSY', 'stance'];
  const NEUTRAL = { rot: 0, ox: 0, oy: 0, sx: 1, sy: 1, tRot: 0, tOx: 0, tSY: 1, stance: 0 };
  const mix = (a, b, u) => { const o = {}; KEYS.forEach((k) => { const av = a[k] != null ? a[k] : NEUTRAL[k], bv = b[k] != null ? b[k] : NEUTRAL[k]; o[k] = av + (bv - av) * u; }); return o; };
  const FRONT = { glint: 1, symbols: 1, notes: 1, smoke: 1, papers: 1 };            // emissores que ficam na frente do lutador

  /* ---------------------------------------------------------------- pose alvo de um especial */
  function pose(anim, t, a0, a1, end) {
    const ch = anim.charge || {}, st = anim.strike || ch;
    let p, rate, w;
    if (t < a0) { const u = ease.out(t / Math.max(1, a0)); p = mix(NEUTRAL, ch, u); rate = 26; w = [ch.wobble, u]; }
    else if (t < a1) { const u = ease.out((t - a0) / Math.max(1, a1 - a0)); p = mix(ch, st, u); rate = 80; w = [st.wobble, 1]; }
    else { const u = ease.inOut((t - a1) / Math.max(1, end - a1)); p = mix(st, NEUTRAL, u); rate = 18; w = [null, 0]; }
    if (w[0]) for (const k in w[0]) p[k] += w[0][k][0] * w[1] * Math.sin(t / 1000 * w[0][k][1] * TAU);
    return { p, rate };
  }

  /* ---------------------------------------------------------------- geometria do lutador */
  function geo(f) {
    const s = (f.size && f.size.spriteHeight ? f.size.spriteHeight : 200) / 200, d = f.facing;
    return { s, d, cx: f.x, cy: f.y - 100 * s, hx: f.x + d * 8 * s, hy: f.y - 172 * s, mx: f.x + d * 16 * s, my: f.y - 158 * s, handx: f.x + d * 46 * s, handy: f.y - 128 * s, fy: f.y };
  }
  const star = (c, x, y, r, ratio) => { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, rr = i % 2 ? r * (ratio || 0.28) : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); };

  /* ---------------------------------------------------------------- emissores (durante a preparação / golpe) */
  function emit(c, f, specs, u, T, front) {
    [].concat(specs).forEach((sp, si) => {
      if (!sp || (!!(sp.front != null ? sp.front : FRONT[sp.kind]) !== !!front)) return;
      const g = geo(f), col = sp.color || '#ffd94a', col2 = sp.color2 || '#ffffff', n = sp.n || 12;
      c.save();
      switch (sp.kind) {
        case 'sparks': case 'candy': {                                           // faíscas subindo em volta do corpo
          c.globalCompositeOperation = 'lighter';
          for (let i = 0; i < n; i++) {
            const ph = fr(T * (sp.speed || 0.9) + hash(i, si)), a = hash(i, 1 + si) * TAU, r = (28 + hash(i, 2) * 46) * g.s * (1 - 0.35 * ph);
            const x = g.cx + Math.cos(a) * r, y = g.cy - ph * 84 * g.s + Math.sin(a) * r * 0.45, sz = (2.4 + hash(i, 3) * 3.4) * (1 - ph * 0.6);
            c.globalAlpha = Math.min(1, u * 1.2) * (1 - ph) * Math.min(1, ph * 8);
            c.fillStyle = sp.kind === 'candy' && i % 2 ? col2 : col;
            if (sp.kind === 'candy') star(c, x, y, sz * 2.2); else if (sp.shape === 'drop') { c.beginPath(); c.ellipse(x, y + ph * 30, sz * 0.9, sz * 1.5, 0, 0, TAU); c.fill(); } else { c.save(); c.translate(x, y); c.rotate(a); c.fillRect(-sz, -sz, sz * 2, sz * 2); c.restore(); }
          }
          break;
        }
        case 'ring': {                                                           // anéis de energia se fechando no corpo
          c.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 3; i++) { const ph = fr(T * 1.5 + i / 3), r = (96 * (1 - ph) + 10) * g.s; c.globalAlpha = u * ph * 0.9; c.strokeStyle = col; c.lineWidth = 2 + 3 * ph; c.beginPath(); c.ellipse(g.cx, g.cy, r, r * 0.92, 0, 0, TAU); c.stroke(); }
          break;
        }
        case 'groundring': {                                                     // círculo de invocação no chão
          for (let i = 0; i < 2; i++) { const ph = fr(T * 1.1 + i / 2), rx = (30 + 62 * ph) * g.s; c.globalAlpha = u * (1 - ph) * 0.9; c.strokeStyle = i ? col2 : col; c.lineWidth = 3; c.beginPath(); c.ellipse(g.cx, g.fy, rx, rx * 0.26, 0, 0, TAU); c.stroke(); }
          c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(g.cx, g.fy, 2, g.cx, g.fy, 70 * g.s); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
          c.globalAlpha = u * 0.4; c.fillStyle = gr; c.beginPath(); c.ellipse(g.cx, g.fy, 70 * g.s, 20 * g.s, 0, 0, TAU); c.fill();
          break;
        }
        case 'beam': {                                                           // coluna de luz subindo para o céu
          c.globalCompositeOperation = 'lighter'; const wd = (10 + 10 * Math.sin(T * 14)) * (0.4 + 0.6 * u), x = g.cx - g.d * 6;
          const lg = c.createLinearGradient(0, g.fy - 160, 0, -40); lg.addColorStop(0, col); lg.addColorStop(1, 'rgba(255,255,255,0)');
          c.globalAlpha = 0.6 * u; c.fillStyle = lg; c.fillRect(x - wd, -40, wd * 2, g.fy - 120); c.globalAlpha = 0.9 * u; c.fillStyle = col2; c.fillRect(x - wd * 0.3, -40, wd * 0.6, g.fy - 120);
          break;
        }
        case 'notes': {                                                          // notas musicais subindo
          c.font = "bold 28px 'Big Shoulders', Impact, sans-serif"; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(20,20,40,0.85)';
          for (let i = 0; i < n; i++) { const ph = fr(T * 0.75 + hash(i, si)), x = g.mx + g.d * ph * 44 + Math.sin(ph * 9 + i) * 16 + (hash(i, 4) - 0.5) * 40, y = g.my - ph * 100 * g.s;
            c.globalAlpha = Math.min(1, u * 1.3) * (1 - ph) * Math.min(1, ph * 6); c.fillStyle = i % 2 ? col2 : col; const gl = ['♪', '♫', '♬'][i % 3]; c.strokeText(gl, x, y); c.fillText(gl, x, y); }
          break;
        }
        case 'symbols': {                                                        // X □ O orbitando (Chico)
          const cols = ['#27d8ee', '#e84bf0', '#ff4a4a'];
          for (let i = 0; i < 3; i++) { const a = T * 2.6 + i * TAU / 3, x = g.cx + Math.cos(a) * 64 * g.s, y = g.cy + Math.sin(a) * 28 * g.s - 6, z = 0.7 + 0.3 * Math.sin(a);
            c.globalAlpha = Math.min(1, u * 1.4); c.strokeStyle = cols[i]; c.lineWidth = 4 * z; c.lineCap = 'round'; const r = 11 * z; c.beginPath();
            if (i === 0) { c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); } else if (i === 1) c.rect(x - r, y - r, r * 2, r * 2); else c.arc(x, y, r, 0, TAU); c.stroke(); }
          break;
        }
        case 'smoke': {                                                          // fumaça na boca (sp.in = puxando para dentro)
          for (let i = 0; i < n; i++) { const ph = fr(T * 1.3 + i / n), k = sp.in ? 1 - ph : ph, x = g.mx + g.d * k * (24 + 52 * u) + Math.sin(i * 3) * 6, y = g.my - 4 - Math.sin(ph * 3) * 10 - k * 12, r = (4 + k * 18) * g.s;
            c.globalAlpha = u * 0.55 * (sp.in ? ph : 1 - ph); c.fillStyle = 'rgb(205,210,216)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
          break;
        }
        case 'papers': {                                                         // papéis voando em volta (ficha de advertência)
          for (let i = 0; i < n; i++) { const ph = fr(T * 0.5 + hash(i, si)), a = hash(i, 1) * TAU + T * 1.3, x = g.cx + Math.cos(a) * (46 + hash(i, 2) * 30) * g.s, y = g.cy - 30 * g.s - ph * 60 + Math.sin(a) * 18;
            c.save(); c.translate(x, y); c.rotate(a * 2); c.globalAlpha = Math.min(1, u * 1.3) * Math.min(1, (1 - ph) * 3); c.fillStyle = '#f4f1e8'; c.strokeStyle = '#555'; c.lineWidth = 1.2; c.fillRect(-5, -7, 10, 14); c.strokeRect(-5, -7, 10, 14); c.fillStyle = '#cc2b2b'; c.fillRect(-4, -5, 5, 2); c.restore(); }
          break;
        }
        case 'glint': {                                                          // brilho no olhar (Pereira)
          c.globalCompositeOperation = 'lighter'; const sz = (3 + 26 * u) * (0.75 + 0.25 * Math.sin(T * 22)), x = g.hx + g.d * 10 * g.s, y = g.hy + 6 * g.s;
          const gr = c.createRadialGradient(x, y, 1, x, y, sz * 1.8); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,241,168,0)'); c.fillStyle = gr; c.globalAlpha = u; c.beginPath(); c.arc(x, y, sz * 1.8, 0, TAU); c.fill();
          c.fillStyle = col; c.globalAlpha = u; star(c, x, y, sz, 0.14);
          break;
        }
        case 'gas': {                                                            // névoa verde em volta das mãos
          for (let i = 0; i < n; i++) { const ph = fr(T * 0.8 + hash(i, si)), x = g.handx + (hash(i, 1) - 0.5) * 50 * g.s + Math.sin(ph * 5 + i) * 10, y = g.handy - ph * 50 * g.s, r = (8 + ph * 20) * g.s;
            const gr = c.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(155,227,122,0)'); c.globalAlpha = u * 0.55 * (1 - ph); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
          break;
        }
        case 'dust': {                                                           // poeira nos pés (motor acelerando)
          for (let i = 0; i < n; i++) { const ph = fr(T * 2.4 + i / n), x = g.cx - g.d * (30 + ph * 70) * g.s, y = g.fy - 4 - ph * 22, r = (5 + ph * 15) * g.s;
            c.globalAlpha = u * 0.5 * (1 - ph); c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
          break;
        }
        default: break;
      }
      c.restore();
    });
  }

  /* ---------------------------------------------------------------- efeito ao lançar (k = 0..1) */
  function release(c, f, specs, k, T) {
    [].concat(specs).forEach((sp) => {
      if (!sp) return;
      const g = geo(f), col = sp.color || '#fff';
      const o = sp.origin === 'feet' ? [g.cx + g.d * 20, g.fy - 6] : sp.origin === 'head' ? [g.hx + g.d * 14, g.hy + 8] : [g.handx, g.handy];
      const r = (sp.r || 130) * ease.out(k);
      c.save(); c.translate(o[0], o[1]); c.globalCompositeOperation = 'lighter';
      const gr = c.createRadialGradient(0, 0, 2, 0, 0, r * 0.9 + 12); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = (1 - k) * 0.6; c.fillStyle = gr; c.beginPath(); c.arc(0, 0, r * 0.9 + 12, 0, TAU); c.fill();
      c.globalAlpha = 1 - k; c.strokeStyle = col; c.lineWidth = 8 * (1 - k) + 1; c.beginPath(); c.ellipse(0, 0, r, sp.origin === 'feet' ? r * 0.28 : r * 0.92, 0, 0, TAU); c.stroke();
      if (sp.origin !== 'feet') for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = r * 0.55, r1 = r * (0.8 + hash(i, 6) * 0.35); c.lineWidth = 2.5 * (1 - k) + 0.5; c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); c.stroke(); }
      c.restore();
    });
  }
  /* tremor de tela de um lutador executando um especial (px) */
  function shakeOf(f) {
    const m = f.move; if (f.state !== 'attack' || !m || !m.anim || !m.anim.fx || !m.anim.fx.release) return 0;
    const sp = [].concat(m.anim.fx.release)[0], a0 = m.startup, t = f.moveTime;
    if (!sp || !sp.shake || t < a0 || t > a0 + 300) return 0;
    return sp.shake * Math.pow(1 - (t - a0) / 300, 2);
  }

  /* ---------------------------------------------------------------- impactos no chão (efeito de partida: kind 'impact') */
  function impact(c, e, T) {
    const k = e.t / e.dur, col = e.color || '#e8c99a', w = e.w || 80;
    c.save(); c.translate(e.x, e.y);
    if (e.fx === 'impact') {                                                     // onda de choque + poeira + pedacinhos
      c.globalAlpha = (1 - k) * 0.9; c.strokeStyle = '#fff'; c.lineWidth = 6 * (1 - k) + 1; c.beginPath(); c.ellipse(0, 0, 20 + w * 1.3 * ease.out(k), 5 + w * 0.3 * ease.out(k), 0, 0, TAU); c.stroke();
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI + Math.PI, d = (18 + w * 0.9 * ease.out(k)) * (0.7 + hash(i, 1) * 0.5), x = Math.cos(a) * d, y = Math.sin(a) * d * 0.45 - 6 - 24 * Math.sin(k * Math.PI) * hash(i, 2);
        c.globalAlpha = (1 - k) * 0.7; c.fillStyle = col; c.beginPath(); c.arc(x, y, (6 + hash(i, 3) * 8) * (0.6 + k * 0.8), 0, TAU); c.fill(); }
      for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.15 + hash(i, 4) * 0.7), v = (80 + hash(i, 5) * 110) * k, x = Math.cos(a) * v * (hash(i, 7) > 0.5 ? 1 : -1), y = Math.sin(a) * v + 140 * k * k;
        c.globalAlpha = (1 - k); c.fillStyle = '#b08a5c'; c.save(); c.translate(x, y); c.rotate(k * 8 + i); c.fillRect(-3, -3, 6, 5); c.restore(); }
    } else if (e.fx === 'splat') {                                               // respingo de geleia
      c.globalAlpha = (1 - k) * 0.8; c.fillStyle = col; c.beginPath(); c.ellipse(0, -2, 14 + 18 * ease.out(k), 4 + 4 * ease.out(k), 0, 0, TAU); c.fill();
      for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.1 + hash(i, 1) * 0.8), v = 70 + hash(i, 2) * 70, t = k * 0.55, x = Math.cos(a) * v * t * (i % 2 ? 1 : -1), y = Math.sin(a) * v * t + 420 * t * t;
        c.globalAlpha = (1 - k); c.beginPath(); c.arc(x, y - 2, 3.2 * (1 - k * 0.5), 0, TAU); c.fill(); }
    } else if (e.fx === 'gas') {                                                 // nuvem de gás
      for (let i = 0; i < 7; i++) { const x = (hash(i, 1) - 0.5) * 70 * (0.4 + k), y = -hash(i, 2) * 30 * k - 6, r = 14 + 26 * k + hash(i, 3) * 10;
        const gr = c.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(155,227,122,0)'); c.globalAlpha = (1 - k) * 0.7; c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    }
    c.restore();
  }

  /* ---------------------------------------------------------------- extras do projétil (atrás do sprite) */
  function projBack(c, p, T, groundY) {
    if (p.glow) { c.save(); c.globalCompositeOperation = 'lighter'; const r = Math.max(p.w, p.h) * (0.9 + 0.08 * Math.sin(p.age / 1000 * 18)), gr = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, r);
      gr.addColorStop(0, p.glow); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = 0.55; c.fillStyle = gr; c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill(); c.restore(); }
    if (p.dust && groundY != null) { c.save(); for (let i = 0; i < 6; i++) { const x = p.x - p.dir * (16 + i * 17), y = groundY - 4 - i * 1.5 - hash(i, 2) * 5, r = 5 + i * 2.6;
      c.globalAlpha = 0.34 * (1 - i / 6); c.fillStyle = '#e6cfa0'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } c.restore(); }
    if (p.shed) { c.save(); const n = p.shed.n || 8; for (let i = 0; i < n; i++) { const ph = fr(p.age / 1000 * 1.5 + hash(i, 1)), x = p.x - p.dir * ph * 80 + (hash(i, 2) - 0.5) * 50, y = p.y + ph * 70 + (hash(i, 3) - 0.5) * 60;
      c.save(); c.translate(x, y); c.rotate(ph * 7 + i); c.globalAlpha = 1 - ph; c.fillStyle = p.shed.color || '#fff'; c.fillRect(-4, -5, 8, 10); c.restore(); } c.restore(); }
  }

  /* ---------------------------------------------------------------- veículos: poeira e linhas de velocidade */
  function rideFx(c, f, active, T) {
    const g = geo(f), n = active ? 8 : 4;
    c.save();
    for (let i = 0; i < n; i++) { const ph = fr(T * 3 + i / n), x = g.cx - g.d * (46 + ph * 100), y = g.fy - 4 - ph * 22 - hash(i, 2) * 4, r = 5 + ph * 15;
      c.globalAlpha = (active ? 0.55 : 0.3) * (1 - ph); c.fillStyle = '#e6cfa0'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    if (active) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const ph = fr(T * 5 + hash(i, 1)), y = g.fy - 14 - hash(i, 2) * 120, x0 = g.cx - g.d * (70 + ph * 150), len = 34 + hash(i, 3) * 60;
        c.globalAlpha = 0.5 * (1 - ph); c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 - g.d * len, y); c.stroke(); } }
    c.restore();
  }

  SK.SpecialFX = { pose, emit, release, shakeOf, impact, projBack, rideFx };
})();

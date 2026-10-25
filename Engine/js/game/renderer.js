/* ==========================================================================
   RENDERER — desenha a luta no <canvas> (960x540).
   Ordem: cenário → sombras → lutadores → projéteis → efeitos → debug.

   Poses provisórias: enquanto o personagem não tiver `animations` para um
   estado, o sprite estático ganha uma pose simples (agachar, inclinar ao
   atacar, cair no KO). Quando a animação real existir, `frame.fallback` é
   false e nenhuma pose provisória é aplicada.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ANIMAÇÃO PROCEDURAL — enquanto o personagem só tem 1 imagem, o corpo é movido por código.
     Cada estado define uma POSE ALVO; a pose real vai até ela com suavização (mola), o que dá
     fluidez nas trocas (parado → soco → dano → ...). Convenção: valores positivos = para a FRENTE.
       rot   inclinação do corpo todo (rad)      ox/oy  deslocamento (px)       sx/sy  achatar / esticar
       tRot  inclinação extra só do TRONCO       tSY    tronco esticando (respiração)
       stance abertura das pernas (rad)          lie    0→1 deitado no chão (KO)
     ====================================================================== */
  const ease = {
    out: (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3),
    inOut: (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); },
    back: (x) => { x = Math.min(1, Math.max(0, x)); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const POSE_KEYS = ['rot', 'ox', 'oy', 'sx', 'sy', 'tRot', 'tOx', 'tSY', 'stance', 'lie'];
  const neutralPose = () => ({ rot: 0, ox: 0, oy: 0, sx: 1, sy: 1, tRot: 0, tOx: 0, tSY: 1, stance: 0, lie: 0 });

  /* devolve { p: pose alvo, rate: quão rápido a pose real acompanha (1/s) } */
  function poseTarget(f, T) {
    const p = neutralPose(); let rate = 16;
    const TAU = Math.PI * 2;
    switch (f.state) {
      case 'idle': {                                   // respirando
        const br = Math.sin(T * TAU * 0.85 + f.slot * 1.7);
        p.tSY = 1 + 0.013 * br; p.sy = 1 + 0.004 * br; p.tRot = 0.014 * br; p.stance = 0.03; rate = 12;
        break;
      }
      case 'block': {                                  // guarda: encolhe, recua o tronco; treme quando apanha na defesa
        const k = Math.min(1, f.hitFlash / 90);
        p.sy = 0.95 - 0.02 * k; p.sx = 1 - 0.04 * k; p.rot = -0.08; p.tRot = -0.14 - 0.1 * k; p.ox = -4 - 9 * k; p.stance = 0.13; rate = 26;
        break;
      }
      case 'hit': {                                    // recua de supetão e se recompõe balançando
        const t = f.stateTime / 1000, pulse = Math.exp(-t * 13), wob = Math.sin(t * 38) * 0.05 * Math.exp(-t * 9);
        p.rot = -0.1 - 0.26 * pulse + wob; p.tRot = -0.12 - 0.3 * pulse; p.ox = -6 - 17 * pulse; p.sy = 1 - 0.07 * pulse; p.sx = 1 + 0.05 * pulse; p.stance = 0.1; rate = 70;
        break;
      }
      case 'attack': {                                 // preparação (recua/encolhe) → golpe (lança o corpo) → recuperação
        const m = f.move; if (!m) break;
        const t = f.moveTime, a0 = m.startup, a1 = m.startup + m.active, end = a1 + m.recovery;
        const power = f.moveKey === 'special' ? 1.45 : f.moveKey === 'projectile' ? 0.9 : 1;
        if (m.gaze) {                                  // mão no bolso, olhar fixo: tronco relaxado e depois inclina para encarar
          const u = Math.min(1, t / a0);
          p.rot = -0.04 * ease.out(u); p.tRot = -0.1 * ease.out(u) + (t >= a0 ? 0.2 : 0); p.ox = -3 * u; p.sy = 1 - 0.01 * u; rate = 18;
        } else if (m.kind === 'ride') {
          const u = Math.min(1, t / a0);
          p.sy = 1 - 0.05 * Math.sin(u * Math.PI); p.rot = t >= a0 && t < a1 ? 0.13 : 0.02; p.tRot = t >= a0 && t < a1 ? 0.12 : 0; rate = 20;
        } else if (t < a0) {
          const u = ease.out(t / Math.max(1, a0));
          p.rot = -0.14 * power * u; p.tRot = -0.2 * power * u; p.ox = -9 * power * u; p.sx = 1 - 0.03 * u; p.sy = 1 - 0.04 * power * u; p.stance = 0.14 * u;
          if (f.moveKey === 'special') p.ox += Math.sin(t * 0.085) * 2.2 * u;                     // tremor de energia concentrando
          rate = 30;
        } else if (t < a1) {
          const u = ease.out((t - a0) / Math.max(1, m.active));
          p.rot = (0.16 + 0.1 * u) * power; p.tRot = (0.26 + 0.12 * u) * power; p.ox = 22 * power; p.sx = 1.05; p.sy = 0.98; p.stance = 0.22; rate = 75;
        } else {
          const u = ease.inOut((t - a1) / Math.max(1, end - a1));
          p.rot = 0.1 * power * (1 - u); p.tRot = 0.14 * power * (1 - u); p.ox = 8 * (1 - u); p.stance = 0.1 * (1 - u); rate = 20;
        }
        break;
      }
      case 'status': {
        const st = f.status || {};
        if (st.type === 'stun') {                      // gargalhando: tronco vai e volta, pulinhos de riso
          const w = Math.sin(T * TAU * 4.2);
          p.oy = -Math.abs(w) * 7; p.sy = 1 + 0.03 * Math.sin(T * TAU * 8.4); p.rot = -0.1 + w * 0.07; p.tRot = -0.18 + w * 0.14; p.stance = 0.06; rate = 28;
        } else if (st.type === 'sleep') {              // cabeça pendendo, respiração lenta, balançando de leve
          const br = Math.sin(T * TAU * 0.55);
          p.tRot = 0.34 + 0.03 * br; p.rot = 0.07; p.sy = 0.975 + 0.012 * br; p.ox = Math.sin(T * 1.1) * 3; p.stance = -0.02; rate = 14;
        }
        break;
      }
      case 'win': {                                    // abaixa, pula comemorando (squash & stretch) e balança
        const t = f.stateTime / 1000;
        if (t < 0.2) { p.sy = 1 - 0.08 * ease.out(t / 0.2); p.tRot = 0.1; rate = 30; break; }
        const P = 0.66, tt = t - 0.2, u = (tt % P) / P, h = 4 * u * (1 - u);
        const sq = Math.max(0, 1 - Math.min(u, 1 - u) / 0.12);
        const sw = Math.sin(TAU * tt / (2 * P));
        p.oy = -h * 58; p.sy = 1 - 0.1 * sq + 0.07 * h; p.sx = 1 + 0.07 * sq - 0.03 * h; p.tRot = -0.14 * h + sw * 0.08; p.rot = sw * 0.09; p.stance = 0.12 * h; rate = 40;
        break;
      }
      case 'ko': {                                     // arremessado para trás, cai deitado, quica e fica
        const t = f.stateTime / 1000, pr = Math.min(1, t / 0.42), fe = ease.out(pr);
        p.rot = -(Math.PI / 2) * fe; p.lie = fe; p.tRot = -0.15 * Math.sin(Math.PI * pr);
        const tb = t - 0.42;
        if (tb > 0) p.oy = -16 * Math.exp(-7 * tb) * Math.abs(Math.sin(15 * tb));
        rate = 80;
        break;
      }
      default: break;
    }
    return { p, rate };
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      /* o canvas é desenhado em SK.config.renderScale x (nítido em tela cheia); o jogo continua pensando em 960x540 */
      this.S = canvas.width / SK.config.width;
      this.W = SK.config.width; this.H = SK.config.height;
      this.ctx.setTransform(this.S, 0, 0, this.S, 0, 0);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    draw(match) {
      const c = this.ctx;
      const T = match.time || 0;
      this._dt = Math.min(0.05, Math.max(0, T - (this._lastT != null ? this._lastT : T))); this._lastT = T; this._T = T;
      match.fighters.forEach((f) => this._tick(f, T));
      c.clearRect(0, 0, this.W, this.H);
      this._stage(match.stage, match.time);

      this._groundY = match.groundY;
      match.fighters.forEach((f) => this._shadow(f));
      match.fighters.forEach((f) => this._ride(f));
      /* quem está atacando fica na frente */
      const order = match.fighters.slice().sort((a, b) => (a.state === 'attack') - (b.state === 'attack'));
      order.forEach((f) => this._fighter(f));
      match.projectiles.forEach((p) => this._projectile(p));
      match.fighters.forEach((f) => this._overlay(f));
      match.effects.forEach((e) => this._effect(e));
      if (SK.debug.hitboxes) this._debug(match);
    }

    /* cenário: imagem única ou camadas (parallax futuro) */
    _stage(stage, t) {
      const c = this.ctx;
      const layers = stage.layers && stage.layers.length ? stage.layers : [{ src: stage.background, parallax: 0 }];
      layers.forEach((l) => {
        const img = SK.Assets.get(l.src);
        if (!img) { c.fillStyle = '#10222a'; c.fillRect(0, 0, this.W, this.H); return; }
        const s = Math.max(this.W / img.width, this.H / img.height);
        const w = img.width * s, h = img.height * s;
        c.drawImage(img, (this.W - w) / 2, this.H - h, w, h);
      });
    }

    _shadow(f) {
      const c = this.ctx;
      const lift = Math.min(1, (f.groundY - f.y) / 160);
      c.save();
      c.fillStyle = 'rgba(0,0,0,' + (0.38 - lift * 0.2) + ')';
      c.beginPath();
      const sk = f.state === 'status' && f.status && f.status.type === 'bag' ? 0.65 : f.state === 'ko' ? 1.25 : 1;
      c.ellipse(f.x, f.groundY + 2, 52 * sk * (1 - lift * 0.35), 9 * (1 - lift * 0.35), 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

/* ---- golpes `ride` (scooter / carro): o veículo aparece embaixo e o lutador sobe nele ---- */
    _rideInfo(f) {
      const m = f.move;
      if (f.state !== 'attack' || !m || m.kind !== 'ride') return null;
      const a1 = m.startup + m.active, t = f.moveTime;
      const mount = Math.min(1, t / Math.max(1, m.startup));                         // 0→1 enquanto monta
      const dismount = t > a1 ? Math.min(1, (t - a1) / Math.max(1, m.recovery * 0.7)) : 0;   // 0→1 na recuperação
      return { mount, dismount, t };
    }
    _rideLift(f) {
      const r = this._rideInfo(f); if (!r) return 0;
      const e = (x) => x * x * (3 - 2 * x);                                           // suaviza
      return f.move.ride.lift * e(r.mount) * (1 - e(r.dismount));
    }
    _ride(f) {
      const r = this._rideInfo(f); if (!r) return;
      const cfg = f.move.ride, img = SK.Assets.get(cfg.sprite); if (!img) return;
      const c = this.ctx, k = cfg.drawSize / Math.max(img.width, img.height);
      const dw = img.width * k, dh = img.height * k;
      const srcDir = cfg.faces === 'left' ? -1 : 1;
      const active = f.movePhase === 'active';
      const bob = active ? Math.abs(Math.sin(r.t / 1000 * 24)) * 3 : 0;               // trepidação enquanto acelera
      c.save();
      c.globalAlpha = Math.min(1, r.mount * 1.6) * (1 - Math.max(0, r.dismount - 0.6) / 0.4);
      c.translate(f.x, f.y - bob);
      c.scale(f.facing * srcDir, 1);
      c.drawImage(img, -dw / 2, -dh + 4, dw, dh);
      c.restore();
    }

    /* suaviza a pose do lutador até a pose-alvo do estado atual (1 vez por quadro) */
    _tick(f, T) {
      const v = f.vis || (f.vis = { p: neutralPose(), land: 0, prevGround: true, init: false, lastVy: 0 });
      const { p, rate } = poseTarget(f, T);
      const k = v.init ? 1 - Math.exp(-this._dt * rate) : 1;
      POSE_KEYS.forEach((key) => { v.p[key] += (p[key] - v.p[key]) * k; });
      if (f.state === 'ko') v.p.lie = p.lie;                              // KO: deitar acompanha o tempo exato
      if (f.onGround && !v.prevGround && v.init) v.land = Math.min(1, 0.35 + Math.abs(v.lastVy) / 900);   // aterrissagem: achata
      v.prevGround = f.onGround; v.lastVy = f.vy || v.lastVy; v.land *= Math.exp(-this._dt * 9);
      v.init = true;
    }

    /* camada temporária: desenha o lutador nela e cobre de uma cor (flash de dano / defesa / status) */
    _layerCtx() {
      if (!this._layer) {
        const cv = document.createElement('canvas'); cv.width = this.canvas.width; cv.height = this.canvas.height;
        this._layer = { cv, ctx: cv.getContext('2d') };
        this._layer.ctx.imageSmoothingEnabled = true; this._layer.ctx.imageSmoothingQuality = 'high';
      }
      return this._layer;
    }
    _withTint(tint, draw) {
      if (!tint || tint.a <= 0.01) { draw(); return; }
      const main = this.ctx, L = this._layerCtx(), lc = L.ctx;
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, L.cv.width, L.cv.height); lc.setTransform(this.S, 0, 0, this.S, 0, 0);
      this.ctx = lc; draw(); this.ctx = main;
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-atop';
      lc.fillStyle = 'rgba(' + tint.c + ',' + tint.a + ')'; lc.fillRect(0, 0, L.cv.width, L.cv.height); lc.globalCompositeOperation = 'source-over';
      main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.drawImage(L.cv, 0, 0); main.restore();
    }
    _tintFor(f) {
      if (f.state === 'block' && f.hitFlash > 0) return { c: '150,215,255', a: 0.35 * Math.min(1, f.hitFlash / 90) };
      if (f.hitFlash > 0) return { c: '255,255,255', a: 0.6 * Math.min(1, f.hitFlash / 160) };
      if (f.popTime > 0) return { c: '255,255,255', a: 0.75 * Math.min(1, f.popTime / 450) };
      return null;
    }

    _fighter(f) {
      const st = f.status;
      if (f.state === 'status' && st && st.type === 'bag') { this._withTint(this._tintFor(f), () => this._bag(f)); return; }
      const fr = SK.Animator.frameFor(f);
      if (!fr) return;
      if (f.state === 'status' && st && st.closedEyes && fr.fallback && f.char.sprites.sleep) {      // dormindo: sprite de olhos fechados
        const sl = SK.Assets.get(f.char.sprites.sleep); if (sl) fr.img = sl;
      }
      const dh = fr.dh, dw = fr.sw * (dh / fr.sh);
      const V = f.vis || { p: neutralPose(), land: 0 };
      const P = fr.fallback ? V.p : neutralPose();
      const srcDir = f.char.facing === 'left' ? -1 : 1;
      const flip = (f.look || f.facing) * srcDir;      // `look` = lado em que ele anda; `facing` = lado do adversário
      const rig = fr.fallback && SK.Rigs && SK.Rigs[f.char.id];
      const puppet = !!rig && f.state !== 'ko';
      const land = V.land || 0;

      this._aura(f);
      this._withTint(this._tintFor(f), () => {
        const c = this.ctx;
        c.save();
        c.translate(f.x, f.y - dw * 0.5 * P.lie - this._rideLift(f));
        c.scale(flip, 1);
        /* as poses foram pensadas para um sprite que olha p/ a direita; se o PNG original olha p/ a esquerda
           (srcDir = -1), inverte offset e rotação para inclinar/cair do lado certo */
        c.translate(P.ox * srcDir, P.oy);
        c.rotate(P.rot * srcDir);
        c.scale(P.sx * (1 + 0.1 * land), P.sy * (1 - 0.13 * land));
        if (puppet) this._puppet(f, fr, rig, dw, dh, srcDir, P);
        else c.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, -dw / 2, -dh, dw, dh);
        c.restore();
      });

      /* soco: rastro de ar na frente do lutador durante a janela de acerto */
      const hb = f.hitbox;
      if (hb && f.move && f.move.kind === 'melee') f.move.gaze ? this._gaze(f, hb) : this._swoosh(f, hb);
    }

    /* halo de energia carregando o especial */
    _aura(f) {
      if (f.state !== 'attack' || f.moveKey !== 'special' || !f.move || f.movePhase !== 'startup') return;
      const u = Math.min(1, f.moveTime / Math.max(1, f.move.startup)), c = this.ctx;
      const col = f.char.themeColor || '#ffd94a', r = 60 + 40 * u + Math.sin(this._T * 30) * 3;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(f.x, f.y - 100, 5, f.x, f.y - 100, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = 0.45 * u; c.fillStyle = g;
      c.beginPath(); c.arc(f.x, f.y - 100, r, 0, Math.PI * 2); c.fill(); c.restore();
    }

    _swoosh(f, hb) {
      const c = this.ctx, u = Math.min(1, (f.moveTime - f.move.startup) / Math.max(1, f.move.active)), dir = f.facing;
      const cx = (dir > 0 ? hb.x : hb.x + hb.w) - dir * hb.w * 0.1, cy = hb.y + hb.h / 2, r = Math.max(hb.w * 0.62, hb.h);
      c.save(); c.translate(cx, cy); c.scale(dir, 1); c.lineCap = 'round';
      [[16, 'rgba(120,200,255,0.30)'], [9, 'rgba(255,255,255,0.55)'], [4, 'rgba(255,255,255,0.95)']].forEach(([w, col]) => {
        c.strokeStyle = col; c.lineWidth = w * (1 - u * 0.5); c.globalAlpha = 1 - u * 0.65;
        c.beginPath(); c.arc(0, 0, r, -0.8 + u * 0.3, 0.8 + u * 0.3); c.stroke();
      });
      c.restore();
    }

    /* olhar do Pereira: feixe fino do olho até o fim do alcance + brilho no bolso */
    _gaze(f, hb) {
      const c = this.ctx, dir = f.facing, u = Math.min(1, (f.moveTime - f.move.startup) / Math.max(1, f.move.active));
      const x0 = f.x + dir * 24, y0 = f.y - 168, x1 = dir > 0 ? hb.x + hb.w : hb.x;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(255,245,170,0.95)'); g.addColorStop(1, 'rgba(255,245,170,0)');
      c.strokeStyle = g; c.lineCap = 'round'; c.lineWidth = 7 * (1 - u * 0.6); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0 + 6); c.stroke();
      c.restore();
    }

    /* pose de marionete: pernas e tronco separados (rig). Anda/pula/agacha por código + as poses do estado (P). */
    _puppet(f, fr, rig, dw, dh, srcDir, P) {
      const c = this.ctx, img = fr.img;
      const k = dh / fr.sh;                                  // px do PNG → px do jogo
      const hipPx = rig.hipY * fr.sh, splitPx = rig.splitX * fr.sw;
      const legH = (fr.sh - hipPx) * k;
      const hipY = -dh + hipPx * k;                          // y do quadril no jogo
      const splitX = -dw / 2 + splitPx * k;
      const t = f.stateTime / 1000;

      let rotL = P.stance, rotR = -P.stance, liftL = 0, liftR = 0, legSY = 1, legSX = 1, hipDy = 0, torsoDy = 0, torsoRot = P.tRot * srcDir, torsoSY = P.tSY;

      if (f.state === 'walk') {
        const ph = t * Math.PI * 2 * 2.3, a = Math.sin(ph);
        rotL = a * 0.26; rotR = -a * 0.26;                   // pernas em tesoura
        liftL = Math.max(0, -a) * 5; liftR = Math.max(0, a) * 5;   // a perna que avança sai do chão
        torsoDy = 1.5 - Math.abs(a) * 3;                     // tronco sobe e desce a cada passo
        torsoRot = 0.05 * srcDir;                            // leve inclinação para a frente
      } else if (f.state === 'jump') {
        const rising = SK.util.clamp(-f.vy / 700, -1, 1);
        const tuck = SK.util.clamp(0.4 + 0.5 * rising, 0, 1);   // subindo: encolhe as pernas; descendo: estica
        legSY = 1 - 0.36 * tuck;
        rotL = 0.10 + 0.34 * tuck; rotR = -(0.10 + 0.34 * tuck);
        torsoRot = 0.04 * srcDir;
      } else if (f.state === 'crouch') {
        legSY = 0.6; legSX = 1.12;
        rotL = 0.05; rotR = -0.05;
        hipDy = torsoDy = (1 - legSY) * legH;                // quadril desce até onde as pernas encolheram
        torsoRot = 0.12 * srcDir; torsoSY = 0.95;
      } else if (f.state === 'block') {
        legSX = 1.06; legSY = 0.9; hipDy = torsoDy = (1 - legSY) * legH;
      }

      const leg = (sx0, sw0, destX, rot, lift) => {
        c.save();
        c.translate(splitX, hipY + hipDy);
        c.rotate(rot);
        c.scale(legSX, legSY);
        c.translate(0, -lift / legSY);
        c.drawImage(img, sx0, hipPx - 1, sw0, fr.sh - hipPx + 1, destX, -k, sw0 * k, legH + k);
        c.restore();
      };
      leg(0, splitPx, -splitPx * k, rotL, liftL);
      leg(splitPx, fr.sw - splitPx, 0, rotR, liftR);

      /* tronco por cima (2px de sobreposição no quadril para não abrir fresta) */
      c.save();
      c.translate(splitX + P.tOx * srcDir, hipY + torsoDy);
      c.rotate(torsoRot);
      c.scale(1, torsoSY);
      c.drawImage(img, 0, 0, fr.sw, hipPx + 2, -dw / 2 - splitX, -dh - hipY, dw, hipPx * k + 2 * k);
      c.restore();
    }

    /* adversário virou MOCHILA (golpe do Pereira) */
    _bag(f) {
      const st = f.status, img = SK.Assets.get(st.sprite); if (!img) return;
      const c = this.ctx, t = f.stateTime / 1000, T = this._T;
      const pop = ease.back(t / 0.38);
      const h = st.drawH || 110, k = h / img.height, dw = img.width * k;
      const wob = Math.sin(t * 9) * 0.07 * Math.exp(-t * 1.6) + Math.sin(T * 3.2) * 0.012;
      const shake = f.hitFlash > 0 ? Math.sin(T * 90) * 3 * (f.hitFlash / 160) : 0;
      c.save();
      c.translate(f.x + shake, f.y); c.rotate(wob); c.scale(pop, pop * (1 + 0.02 * Math.sin(T * 4)));
      c.drawImage(img, -dw / 2, -h, dw, h);
      c.restore();
    }

    /* coisas por cima: balão de zzz (dormindo), risada (atordoado), brilho ao entrar/sair de um status, confete da vitória */
    _overlay(f) {
      const c = this.ctx, T = this._T, st = f.status;
      if (f.state === 'status' && st) {
        const head = (st.type === 'bag' ? (st.drawH || 110) : f.size.spriteHeight) + 6;
        if (st.type === 'sleep' && st.icon) {
          const img = SK.Assets.get(st.icon);
          if (img) {
            const appear = ease.back(f.stateTime / 350), h = 78, w = img.width * (h / img.height);
            c.save(); c.translate(f.x + f.facing * 6 * -1 + 22, f.y - head - 12 - Math.sin(T * 2.4) * 5);
            c.scale(appear, appear); c.globalAlpha = Math.min(1, f.stateTime / 200);
            c.drawImage(img, -w * 0.25, -h, w, h); c.restore();
          }
        } else if (st.type === 'stun') {
          const n = Math.floor(T * 5) % 3 + 1, txt = ('HA ').repeat(n).trim() + '!';
          c.save(); c.translate(f.x + 8, f.y - head - 6 - Math.abs(Math.sin(T * Math.PI * 4.2)) * 6);
          c.font = "bold 26px 'Big Shoulders', Impact, sans-serif"; c.textAlign = 'center'; c.lineJoin = 'round';
          c.lineWidth = 6; c.strokeStyle = '#1c2230'; c.strokeText(txt, 0, 0); c.fillStyle = '#ffd94a'; c.fillText(txt, 0, 0); c.restore();
        }
      }
      if (f.popTime > 0) this._burst(f.x, f.y - (f.status && f.status.type === 'bag' ? 55 : 95), 1 - f.popTime / 450, '#ffffff');
      if (f.state === 'win') this._confetti(f);
    }

    /* estrelinhas de 4 pontas saindo em círculo */
    _burst(x, y, k, color) {
      const c = this.ctx; c.save(); c.translate(x, y); c.globalAlpha = Math.max(0, 1 - k);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + k * 0.8, d = 18 + 70 * ease.out(k), s = 11 * (1 - k * 0.6);
        c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d); c.rotate(a); c.fillStyle = color;
        c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.28, 0); c.lineTo(0, s); c.lineTo(-s * 0.28, 0); c.closePath(); c.fill();
        c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.28, 0); c.lineTo(0, s); c.lineTo(-s * 0.28, 0); c.closePath(); c.fill(); c.restore();
      }
      c.restore();
    }

    _confetti(f) {
      const c = this.ctx, t = f.stateTime / 1000, cols = ['#ffd94a', '#58bfe8', '#ff6b5e', '#7be08a', '#ffffff', '#c78bff'];
      c.save();
      for (let i = 0; i < 26; i++) {
        const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = (Math.sin(i * 78.233) * 12345.6789) % 1, r3 = Math.abs((Math.sin(i * 3.7) * 999.1) % 1);
        const delay = Math.abs(r2) * 0.9, tt = t - delay; if (tt < 0) continue;
        const x = f.x + r1 * 170 + Math.sin(tt * 3 + i) * 14, y = f.y - 330 + ((tt * 150 + r3 * 60) % 360);
        c.save(); c.translate(x, y); c.rotate(tt * (3 + r3 * 4) + i); c.fillStyle = cols[i % cols.length];
        c.globalAlpha = Math.min(1, tt * 4); c.fillRect(-4, -2, 8, 4); c.restore();
      }
      c.restore();
    }

    _projectile(p) {
      const c = this.ctx;
      const path = p.currentSprite();
      const img = path && SK.Assets.get(path);
      /* sombra no chão (aviso do que está caindo) */
      if (p.shadow && !p.landed && this._groundY != null) {
        const near = SK.util.clamp(1 - (this._groundY - (p.y + p.h / 2)) / 520, 0.2, 1);
        c.save();
        c.fillStyle = 'rgba(0,0,0,' + (0.12 + 0.3 * near) + ')';
        c.beginPath(); c.ellipse(p.x, this._groundY + 2, p.w * 0.55 * near, Math.max(4, p.w * 0.1 * near), 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      c.save();
      if (p.fadeOut && p.life < p.fadeOut) c.globalAlpha = Math.max(0, p.life / p.fadeOut);
      if (img) {
        const bottom = p.anchor === 'bottom';
        const bw = p.bob ? Math.sin(p.age / 1000 * p.bob.freq) : 0;
        c.translate(p.x, (bottom ? p.y + p.h / 2 : p.y) - (p.bob ? Math.abs(bw) * p.bob.amp : 0));
        if (p.bob) c.rotate(bw * 0.05 * p.dir);
        if (p.angle) c.rotate(p.angle);
        if (p.faces && ((p.faces === 'left' && p.dir > 0) || (p.faces === 'right' && p.dir < 0))) c.scale(-1, 1);
        if (p.scaleIn) { const s = 0.4 + 0.6 * Math.min(1, p.age / p.scaleIn); c.scale(s, s); }
        const k = p.drawSize / Math.max(img.width, img.height);   // mantém a proporção original
        const dw = img.width * k, dh = img.height * k;
        c.drawImage(img, -dw / 2, bottom ? -dh : -dh / 2, dw, dh);
      } else {                                                    // placeholder
        const g = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.w * 0.8);
        g.addColorStop(0, '#fff'); g.addColorStop(0.45, p.color || '#fdd746'); g.addColorStop(1, 'rgba(253,215,70,0)');
        c.fillStyle = g;
        c.beginPath(); c.ellipse(p.x, p.y, p.w * 0.8, p.h * 0.8, 0, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }

    _effect(e) {
      const c = this.ctx;
      const k = e.t / e.dur;
      if (e.kind === 'flash') {                                   // clarão + estrelinhas (status aplicado)
        c.save(); c.globalCompositeOperation = 'lighter';
        const r = 24 + 110 * ease.out(k), g = c.createRadialGradient(e.x, e.y, 2, e.x, e.y, r);
        g.addColorStop(0, e.color || '#fff'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = (1 - k) * 0.9; c.fillStyle = g; c.beginPath(); c.arc(e.x, e.y, r, 0, Math.PI * 2); c.fill(); c.restore();
        this._burst(e.x, e.y, k, e.color || '#fff');
        return;
      }
      const r = (e.kind === 'block' ? 16 : 26) * (0.6 + k * 0.9);
      c.save();
      c.translate(e.x, e.y);
      c.globalAlpha = 1 - k;
      c.fillStyle = e.kind === 'block' ? '#58bfe8' : '#fdd746';
      c.strokeStyle = '#fff'; c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.45 : r;
        c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.closePath(); c.fill(); c.stroke();
      c.restore();
    }

    _debug(match) {
      const c = this.ctx;
      c.save();
      c.lineWidth = 2;
      match.fighters.forEach((f) => {
        const h = f.hurtbox;
        c.strokeStyle = '#3cff7a'; c.strokeRect(h.x, h.y, h.w, h.h);
        const hb = f.hitbox;
        if (hb) { c.strokeStyle = '#ff3c3c'; c.strokeRect(hb.x, hb.y, hb.w, hb.h); }
      });
      match.projectiles.forEach((p) => { const r = p.rect; c.strokeStyle = '#ff3c3c'; c.strokeRect(r.x, r.y, r.w, r.h); });
      c.strokeStyle = '#ffffff55';
      c.beginPath(); c.moveTo(0, match.groundY); c.lineTo(this.W, match.groundY); c.stroke();
      c.restore();
    }
  }

  SK.Renderer = Renderer;
})();

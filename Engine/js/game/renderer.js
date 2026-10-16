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

  /* pose provisória (só para sprites sem animação) */
  function placeholderPose(f) {
    const p = { sx: 1, sy: 1, rot: 0, ox: 0, oy: 0, alpha: 1 };
    switch (f.state) {
      case 'crouch': p.sy = 0.74; break;
      case 'block': p.rot = -0.05; p.sx = 0.96; break;
      case 'jump': p.sy = 1.02; p.sx = 0.98; break;
      case 'attack': {
        const ph = f.movePhase;
        if (ph === 'startup') { p.rot = -0.07; p.ox = -6; }
        else if (ph === 'active') { p.rot = 0.2; p.ox = 16; }
        else { p.rot = 0.06; p.ox = 5; }
        break;
      }
      case 'hit':
        p.rot = -0.1; p.ox = (Math.floor(f.stateTime / 45) % 2 ? 3 : -3);
        p.alpha = Math.floor(f.stateTime / 70) % 2 ? 0.65 : 1;
        break;
      case 'ko': p.rot = -Math.PI / 2; p.ko = true; break;
      default: break;
    }
    return p;
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
<<<<<<< HEAD
      /* o canvas é desenhado em SK.config.renderScale x (nítido em tela cheia); o jogo continua pensando em 960x540 */
      this.S = canvas.width / SK.config.width;
      this.W = SK.config.width; this.H = SK.config.height;
      this.ctx.setTransform(this.S, 0, 0, this.S, 0, 0);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
=======
      this.W = canvas.width; this.H = canvas.height;
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
    }

    draw(match) {
      const c = this.ctx;
      c.clearRect(0, 0, this.W, this.H);
      this._stage(match.stage, match.time);

      match.fighters.forEach((f) => this._shadow(f));
      /* quem está atacando fica na frente */
      const order = match.fighters.slice().sort((a, b) => (a.state === 'attack') - (b.state === 'attack'));
      order.forEach((f) => this._fighter(f));
      match.projectiles.forEach((p) => this._projectile(p));
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
      c.ellipse(f.x, f.groundY + 2, 52 * (1 - lift * 0.35), 9 * (1 - lift * 0.35), 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    _fighter(f) {
      const fr = SK.Animator.frameFor(f);
      if (!fr) return;
      const c = this.ctx;
      const dh = fr.dh;
      const dw = fr.sw * (dh / fr.sh);
      const pose = fr.fallback ? placeholderPose(f) : { sx: 1, sy: 1, rot: 0, ox: 0, oy: 0, alpha: 1 };
      const srcDir = f.char.facing === 'left' ? -1 : 1;
      const flip = (f.look || f.facing) * srcDir;      // `look` = lado em que ele anda; `facing` = lado do adversário

      /* andar / pular / agachar "de mentirinha": o corpo é fatiado em tronco + 2 pernas e movido por código
         (SK.Rigs, gerado por tools/make_rigs.py). Some sozinho quando o personagem tiver `animations` de verdade. */
      const rig = fr.fallback && SK.Rigs && SK.Rigs[f.char.id];
      const puppet = rig && (f.state === 'walk' || f.state === 'jump' || f.state === 'crouch');

      c.save();
      c.globalAlpha = pose.alpha;
      c.translate(f.x, f.y - (pose.ko ? dw * 0.5 : 0));
      c.scale(flip, 1);
      if (puppet) {
        this._puppet(f, fr, rig, dw, dh, srcDir);
      } else {
        /* as poses provisórias foram pensadas para um sprite que olha p/ a direita;
           se o PNG original olha p/ a esquerda (srcDir = -1), inverte offset e rotação para cair/inclinar do lado certo */
        c.translate(pose.ox * srcDir, pose.oy);
        c.rotate(pose.rot * srcDir);
        c.scale(pose.sx, pose.sy);
        c.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, -dw / 2, -dh, dw, dh);
      }
      c.restore();

      /* marcador provisório do alcance do golpe (some quando houver animação de ataque) */
      const hb = f.hitbox;
      if (hb && fr.fallback) {
        c.save();
        c.fillStyle = 'rgba(255, 236, 140, .55)';
        c.strokeStyle = 'rgba(255, 255, 255, .9)';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(hb.x + hb.w / 2, hb.y + hb.h / 2, hb.w / 2, hb.h / 2, 0, 0, Math.PI * 2);
        c.fill(); c.stroke();
        c.restore();
      }
    }

    /* Pose por código. O contexto já está na origem dos pés (x=0 centro, y=0 chão) e espelhado.
       Tudo é desenhado no espaço do PNG original; "para a frente" = lado para onde o PNG olha (srcDir).
       Corpo = tronco (do topo até o quadril) + perna esquerda + perna direita (cortadas em hipY / splitX). */
    _puppet(f, fr, rig, dw, dh, srcDir) {
      const c = this.ctx, img = fr.img;
      const k = dh / fr.sh;                                  // px do PNG → px do jogo
      const hipPx = rig.hipY * fr.sh, splitPx = rig.splitX * fr.sw;
      const legH = (fr.sh - hipPx) * k;
      const hipY = -dh + hipPx * k;                          // y do quadril no jogo
      const splitX = -dw / 2 + splitPx * k;
      const t = f.stateTime / 1000;

      let rotL = 0, rotR = 0, liftL = 0, liftR = 0, legSY = 1, legSX = 1, hipDy = 0, torsoDy = 0, torsoRot = 0, torsoSY = 1;

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
      } else {                                               // crouch
        legSY = 0.6; legSX = 1.12;
        rotL = 0.05; rotR = -0.05;
        hipDy = torsoDy = (1 - legSY) * legH;                // quadril desce até onde as pernas encolheram
        torsoRot = 0.12 * srcDir; torsoSY = 0.95;
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
      c.translate(splitX, hipY + torsoDy);
      c.rotate(torsoRot);
      c.scale(1, torsoSY);
      c.drawImage(img, 0, 0, fr.sw, hipPx + 2, -dw / 2 - splitX, -dh - hipY, dw, hipPx * k + 2 * k);
      c.restore();
    }

    _projectile(p) {
      const c = this.ctx;
      const img = p.sprite && SK.Assets.get(p.sprite);
      c.save();
      if (img) {
        c.translate(p.x, p.y); c.scale(p.dir, 1);
        c.drawImage(img, -p.w / 2, -p.h / 2, p.w, p.h);
      } else {                                                    // placeholder
        const g = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.w * 0.8);
        g.addColorStop(0, '#fff'); g.addColorStop(0.45, p.color); g.addColorStop(1, 'rgba(253,215,70,0)');
        c.fillStyle = g;
        c.beginPath(); c.ellipse(p.x, p.y, p.w * 0.8, p.h * 0.8, 0, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }

    _effect(e) {
      const c = this.ctx;
      const k = e.t / e.dur;
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

/* ==========================================================================
   PROJECTILE — projétil lançado por um golpe `kind: 'projectile'`.
   Configurado em move.projectile = { speed, w, h, spawn:{x,y}, lifetime, color, sprite, ... }.
   `sprite` (opcional) é um caminho de imagem que o renderer usa no lugar do placeholder.

   Opções extras (todas opcionais):
     sprites, fps     lista de imagens animadas (ciclo) em vez de `sprite`
     faces            'left' | 'right' — para onde o sprite olha no PNG; o renderer espelha conforme a direção do tiro
     anchor           'bottom' = o sprite se apoia na base da hitbox (objetos no chão); padrão: centro
     spin             giro em rad/s          heading   true = o sprite aponta para onde está indo
     boomerang        { range, accel }       vai, freia e volta até o dono
     gravity, vy0     queda (px/s², px/s)    landStay  ms que fica no chão depois de cair (sem isso: some ao tocar o chão)
     shadow           true = sombra no chão (aviso do que vai cair)
     wave             { amp, freq }          ondula para cima e para baixo
     scaleIn, fadeOut ms de crescimento no início / de desaparecer no fim
     maxHits, hitInterval, dieOnHit   acerta várias vezes (ex.: fumaça); dieOnHit:false = fica depois do último acerto
     dir, x, y        sobrescrevem direção / posição inicial (usado pelas "volleys")
     volley           { pattern, ... } dispara vários projéteis de uma vez (veja volleys.js)
   ========================================================================== */
(function () {
  'use strict';
  class Projectile {
    constructor(owner, move, cfg) {
      this.owner = owner;
      this.move = move;
      this.dir = cfg.dir || owner.facing;
      const sp = cfg.spawn || { x: 0, y: 0 };
      this.x = cfg.x != null ? cfg.x : owner.x + this.dir * sp.x;
      this.y0 = cfg.y != null ? cfg.y : owner.y + sp.y;
      this.y = this.y0;
      this.vx = this.dir * (cfg.speed || 0);
      this.vy = cfg.vy0 || 0;
      this.gravity = cfg.gravity || 0;
      this.landStay = cfg.landStay;
      this.landed = false;
      this.w = cfg.w; this.h = cfg.h;
      this.life = cfg.lifetime;
      this.age = 0;
      this.color = cfg.color;
      this.sprite = cfg.sprite;
      this.sprites = cfg.sprites || null;
      this.fps = cfg.fps || 10;
      this.faces = cfg.faces || null;
      this.anchor = cfg.anchor || 'center';
      this.heading = !!cfg.heading;
      this.shadow = !!cfg.shadow;
      this.wave = cfg.wave || null;
      this.scaleIn = cfg.scaleIn || 0;
      this.fadeOut = cfg.fadeOut || 0;
      this.drawSize = cfg.drawSize || 60;   // maior lado do sprite desenhado (a hitbox w/h não muda)
      this.spin = cfg.spin || 0;            // giro em rad/s (0 = não gira)
      this.angle = 0;
      this.maxHits = cfg.maxHits || 1;
      this.hitInterval = cfg.hitInterval || 0;
      this.dieOnHit = cfg.dieOnHit !== false;
      this.hits = 0; this.hitCd = 0;
      /* bumerangue: vai até `range` px, freia, e volta até o dono */
      this.boom = cfg.boomerang ? { range: cfg.boomerang.range, accel: cfg.boomerang.accel || 1800, speed: cfg.speed, phase: 'out', x0: this.x } : null;
      this.dead = false;
    }
    get rect() { return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h }; }
    currentSprite() {
      if (this.sprites && this.sprites.length) return this.sprites[Math.floor(this.age / 1000 * this.fps) % this.sprites.length];
      return this.sprite;
    }
    _boomerang(dt) {
      const b = this.boom, o = this.owner;
      if (b.phase === 'out') {
        const traveled = Math.abs(this.x - b.x0);
        const brake = (this.vx * this.vx) / (2 * b.accel);            // distância que falta para parar
        if (traveled >= b.range - brake) {
          this.vx -= this.dir * b.accel * dt;                           // freia
          if (this.vx * this.dir <= 0) { this.vx = 0; b.phase = 'back'; }
        }
      } else {
        const want = (o.x >= this.x ? 1 : -1) * b.speed;                // volta na direção de quem jogou
        const step = b.accel * dt;
        this.vx += Math.max(-step, Math.min(step, want - this.vx));
        if (Math.abs(this.x - o.x) < 36) this.dead = true;              // "pegou" o taco de volta
      }
    }
    update(dt, match) {
      const ms = dt * 1000;
      this.age += ms;
      this.hitCd = Math.max(0, this.hitCd - ms);
      if (this.boom) this._boomerang(dt);

      if (!this.landed) {
        if (this.gravity) this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y0 += this.vy * dt;
        this.y = this.y0 + (this.wave ? this.wave.amp * Math.sin(this.age / 1000 * this.wave.freq) : 0);
        if ((this.gravity || this.vy > 0) && this.y0 + this.h / 2 >= match.groundY) {   // tocou o chão
          if (this.landStay != null) {
            this.landed = true; this.vx = 0; this.vy = 0;
            this.y0 = this.y = match.groundY - this.h / 2;
            this.life = Math.min(this.life, this.landStay);
          } else this.dead = true;
        }
      }
      if (this.heading && (this.vx || this.vy) && !this.landed) this.angle = Math.atan2(this.vy, this.vx);
      else this.angle += this.spin * this.dir * dt;

      this.life -= ms;
      if (this.life <= 0 || this.x < -60 || this.x > SK.config.width + 60) this.dead = true;
      if (this.dead) return;

      const target = match.opponentOf(this.owner);
      if (target.state !== 'ko' && this.hits < this.maxHits && this.hitCd <= 0 && match.overlap(this.rect, target.hurtbox)) {
        const res = target.receiveHit(this.owner, this.move, match, this.x);
        this.owner.addSpecial(this.move.meterGain || 0);
        match.registerHit(this.owner, target, this.move, res, this.x, this.y);
        this.hits++; this.hitCd = this.hitInterval;
        if (this.dieOnHit && this.hits >= this.maxHits) this.dead = true;
      }
    }
  }
  SK.Projectile = Projectile;
})();

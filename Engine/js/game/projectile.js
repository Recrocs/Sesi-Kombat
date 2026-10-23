/* ==========================================================================
   PROJECTILE — projétil lançado por um golpe `kind: 'projectile'`.
   Configurado em move.projectile = { speed, w, h, spawn:{x,y}, lifetime, color, sprite }.
   `sprite` (opcional) é um caminho de imagem que o renderer usa no lugar do placeholder.
   ========================================================================== */
(function () {
  'use strict';
  class Projectile {
    constructor(owner, move, cfg) {
      this.owner = owner;
      this.move = move;
      this.dir = owner.facing;
      this.x = owner.x + this.dir * cfg.spawn.x;
      this.y = owner.y + cfg.spawn.y;
      this.vx = this.dir * cfg.speed;
      this.w = cfg.w; this.h = cfg.h;
      this.life = cfg.lifetime;
      this.color = cfg.color;
      this.sprite = cfg.sprite;
      this.drawSize = cfg.drawSize || 60;   // maior lado do sprite desenhado (a hitbox w/h não muda)
      this.spin = cfg.spin || 0;            // giro em rad/s (0 = não gira); positivo gira no sentido da direção do tiro
      this.angle = 0;
      /* bumerangue (opcional): cfg.boomerang = { range, accel } — vai até `range` px, freia, e volta até o dono */
      this.boom = cfg.boomerang ? { range: cfg.boomerang.range, accel: cfg.boomerang.accel || 1800, speed: cfg.speed, phase: 'out', x0: this.x } : null;
      this.dead = false;
    }
    get rect() { return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h }; }
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
      if (this.boom) this._boomerang(dt);
      this.x += this.vx * dt;
      this.angle += this.spin * this.dir * dt;
      this.life -= dt * 1000;
      if (this.life <= 0 || this.x < -60 || this.x > SK.config.width + 60) this.dead = true;
      if (this.dead) return;
      const target = match.opponentOf(this.owner);
      if (target.state !== 'ko' && match.overlap(this.rect, target.hurtbox)) {
        const res = target.receiveHit(this.owner, this.move, match, this.x);
        this.owner.addSpecial(this.move.meterGain || 0);
        match.registerHit(this.owner, target, this.move, res, this.x, this.y);
        this.dead = true;
      }
    }
  }
  SK.Projectile = Projectile;
})();

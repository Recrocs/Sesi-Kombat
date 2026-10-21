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
      this.dead = false;
    }
    get rect() { return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h }; }
    update(dt, match) {
      this.x += this.vx * dt;
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

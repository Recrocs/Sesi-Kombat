/* ==========================================================================
   CONTROLLERS — quem "aperta os botões" de cada lutador.

   A luta só conhece INTENÇÕES:
     { left, right, up, down, block,  pressed: Set<nome de golpe> }
   `pressed` contém os golpes disparados NESTE frame.

   Controllers existentes: HumanController (teclado + controle, via SK.Input) e CPUController.
   Para joystick, toque ou online: crie outra classe com o método read().
   ========================================================================== */
(function () {
  'use strict';

  class HumanController {
    constructor(playerIndex) { this.player = playerIndex; }
    read(fighter) {
      const I = SK.Input, p = this.player;
      const pressed = new Set();
      Object.keys(fighter.moves).forEach((key) => { if (SK.config.controls['p' + (p + 1)][key] && I.wasPressed(p, key)) pressed.add(key); });
      return {
        left: I.isDown(p, 'left'), right: I.isDown(p, 'right'),
        up: I.isDown(p, 'up'), down: I.isDown(p, 'down'),
        block: I.isDown(p, 'block'),
        pressed,
      };
    }
  }

  class CPUController {
    constructor(level) {
      this.p = SK.config.fight.cpu[level] || SK.config.fight.cpu.normal;
      this.timer = 300;
      this.held = { left: false, right: false, up: false, down: false, block: false };
    }
    read(f, match, dt) {
      const p = this.p, h = this.held;
      const o = match.opponentOf(f);
      const dist = Math.abs(o.x - f.x);
      const toward = o.x > f.x ? 'right' : 'left';
      const away = toward === 'right' ? 'left' : 'right';
      const pressed = new Set();
      let jump = false;

      this.timer -= dt * 1000;
      if (this.timer <= 0) {
        this.timer = p.think * (0.7 + Math.random() * 0.6);
        h.left = h.right = h.down = h.block = false;
        const r = Math.random();
        const sp = f.moves.special;

        if (o.state === 'attack' && dist < 175 && r < p.defense) {
          h.block = true; this.timer = 280;
        } else if (dist > 250) {
          if (f.moves.projectile && f.cooldowns.projectile <= 0 && r < p.ranged) pressed.add('projectile');
          else h[toward] = true;
          if (Math.random() < 0.06) jump = true;
        } else if (dist > 125) {
          if (r < p.aggression) h[toward] = true;
          else if (r < p.aggression + 0.15) jump = true;
        } else {
          if (sp && f.special >= sp.cost && r < 0.35) pressed.add('special');
          else if (r < p.aggression) pressed.add('attack');
          else if (r < p.aggression + 0.18) h[away] = true;
          else h.block = true;
        }
      }
      return { left: h.left, right: h.right, up: jump, down: h.down, block: h.block, pressed };
    }
  }

  SK.HumanController = HumanController;
  SK.CPUController = CPUController;
})();

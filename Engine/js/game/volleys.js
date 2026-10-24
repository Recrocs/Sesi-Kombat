/* ==========================================================================
   VOLLEYS — padrões que disparam VÁRIOS projéteis de um golpe só.
   Uso (dentro de move.projectile):  volley: { pattern: 'rain', count: 9, ... }
   Cada padrão devolve uma lista [{ delay (ms), ov: {...campos que sobrescrevem move.projectile} }].
   Para criar um padrão novo, basta adicionar uma função aqui.
   ========================================================================== */
(function () {
  'use strict';
  const rand = (a, b) => a + Math.random() * (b - a);

  SK.Volleys = {
    /* um objeto cai do céu em cima de onde o adversário está AGORA (dá tempo de fugir) */
    dropOnTarget(owner, target, v, match, cfg) {
      return [{ delay: 0, ov: { x: target.x, y: v.fromY != null ? v.fromY : -170, dir: owner.facing } }];
    },

    /* chuva: `count` objetos caem em x aleatório em volta do adversário, um depois do outro */
    rain(owner, target, v, match, cfg) {
      const b = match.bounds, list = [];
      for (let i = 0; i < v.count; i++) {
        const x = SK.util.clamp(target.x + rand(-v.spread, v.spread), b.left, b.right);
        list.push({ delay: i * v.interval, ov: { x, y: v.fromY != null ? v.fromY : -60, dir: owner.facing, vy0: (cfg.vy0 || 0) * rand(0.8, 1.3) } });
      }
      return list;
    },

    /* corredores entram pelos DOIS lados da tela (alternando) e atravessam a arena no chão */
    sides(owner, target, v, match, cfg) {
      const list = [], W = SK.config.width;
      for (let i = 0; i < v.count; i++) {
        const fromLeft = i % 2 === 0;
        list.push({
          delay: i * v.interval,
          ov: { x: fromLeft ? -(v.offset || 30) : W + (v.offset || 30), y: match.groundY - cfg.h / 2, dir: fromLeft ? 1 : -1, speed: cfg.speed * rand(0.92, 1.18) },
        });
      }
      return list;
    },
  };
})();

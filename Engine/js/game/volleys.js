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
    /* leque: vários projéteis em sequência, cada um com seu sprite e altura (ex.: X, quadrado e bolinha do Chico) */
    fan(owner, target, v, match, cfg) {
      return v.items.map((it) => ({
        delay: it.delay || 0,
        ov: { sprite: it.sprite, y: owner.y + it.y, dir: owner.facing, speed: it.speed || cfg.speed, spin: it.spin != null ? it.spin : cfg.spin },
      }));
    },

    /* busca: joga uma isca em arco e, logo depois, um bicho sai correndo do dono até onde ela vai cair (ex.: rosquinha + cachorro do Italo) */
    fetch(owner, target, v, match, cfg) {
      const b = match.bounds, dir = owner.facing, sp = cfg.spawn || { x: 0, y: 0 };
      const x0 = owner.x + dir * sp.x, y0 = owner.y + sp.y;
      const xLand = SK.util.clamp(owner.x + dir * v.distance, b.left + 40, b.right - 40);
      const T = v.flight / 1000, g = cfg.gravity;
      const yLand = match.groundY - cfg.h / 2;
      const vy0 = (yLand - y0 - 0.5 * g * T * T) / T;            // velocidades para a isca cair exatamente em xLand
      const vx = (xLand - x0) / T;
      const dogDir = xLand >= owner.x ? 1 : -1;
      const dogT = v.dogDelay + Math.abs(xLand - owner.x) / v.dog.speed * 1000;   // quando o bicho chega
      const life = Math.max(v.flight + 150, dogT + 100);                           // a isca some junto com a chegada dele
      return [
        { delay: 0, ov: { x: x0, y: y0, dir: vx >= 0 ? 1 : -1, speed: Math.abs(vx), vy0, lifetime: life + 300, landStay: life - v.flight } },
        { delay: v.dogDelay, ov: Object.assign({}, v.dog, { x: owner.x + dogDir * 20, y: match.groundY - v.dog.h / 2, dir: dogDir, goalX: xLand,
            spin: 0, gravity: 0, vy0: 0, harmless: false, landStay: undefined, shadow: false, lifetime: 4000 }) },
      ];
    },

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

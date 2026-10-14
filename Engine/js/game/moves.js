/* ==========================================================================
   MOVES — golpes padrão, 100% data-driven.

   Cada golpe é um objeto de dados. A chave do golpe é o NOME DA AÇÃO que o
   dispara (veja SK.config.controls). Tempos em milissegundos.

     kind        'melee' (hitbox) | 'projectile'
     startup     antes de acertar (pode-se ligar "anticipation" da animação)
     active      janela em que o golpe acerta
     recovery    tempo parado depois do golpe
     damage, hitstun, blockstun, knockback, pushbackBlock
     hitbox      {x, y, w, h}  relativo aos pés do lutador, olhando p/ a direita (y negativo = para cima)
     cost        custo de barra de especial (0 = grátis)
     cooldown    tempo mínimo entre usos
     meterGain / meterGainTaken   barra de especial ganha ao acertar / ao apanhar
     sfx         { start, hit, block }   ids de som (veja audio.js)
     lunge       impulso horizontal ao iniciar (px/s)

   Cada personagem pode sobrescrever qualquer campo em `moves: { attack: { damage: 9 } }`
   e criar golpes novos (basta usar uma ação nova em SK.config.controls).
   ========================================================================== */
SK.defaultMoves = {
  attack: {
    label: 'Golpe', kind: 'melee',
    startup: 80, active: 110, recovery: 170,
    damage: 7, hitstun: 260, blockstun: 150, knockback: 170, pushbackBlock: 110,
    hitbox: { x: 24, y: -170, w: 104, h: 56 },
    meterGain: 9, meterGainTaken: 4,
    cost: 0, cooldown: 0,
  },
  projectile: {
    label: 'Lançar', kind: 'projectile',
    startup: 150, active: 40, recovery: 260,
    damage: 6, hitstun: 240, blockstun: 140, knockback: 130, pushbackBlock: 90,
    projectile: { speed: 470, w: 34, h: 26, spawn: { x: 52, y: -128 }, lifetime: 1800, color: '#fdd746', sprite: null },
    meterGain: 5, meterGainTaken: 3,
    cost: 0, cooldown: 800,
  },
  special: {
    label: 'Especial', kind: 'melee',
    startup: 220, active: 150, recovery: 380,
    damage: 18, hitstun: 440, blockstun: 220, knockback: 430, pushbackBlock: 200,
    hitbox: { x: 16, y: -196, w: 140, h: 150 },
    meterGain: 0, meterGainTaken: 0,
    cost: 100, cooldown: 0,
  },
};

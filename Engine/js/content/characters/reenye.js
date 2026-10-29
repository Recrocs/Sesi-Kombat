/* PERSONAGEM: Chico
   ------------------------------------------------------------------------
   Para criar um personagem novo:
     1) copie este arquivo e troque o `id`, o nome e os caminhos;
     2) ponha as imagens em assets/characters/<id>/ ;
     3) adicione o <script> em index.html (seção "CONTEÚDO").
   Pronto: ele aparece sozinho na seleção, no versus e na luta.
   ------------------------------------------------------------------------ */
SK.Characters.register({
  id: 'reenye',
  name: 'REENYE',
  themeColor: '#5a8cff',          // cor de destaque (cards, versus)

  sprites: {
    portrait: 'assets/characters/reenye/portrait.png',   // busto (cards e versus)
    portraitHi: 'assets/characters/reenye/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/reenye/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/reenye/idle.png',           // corpo inteiro: menus + pose padrão na luta
    sleep: 'assets/characters/reenye/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/reenyePower.png' } },
    /* ESPECIAL (tecla C / .): joga uma ficha de advertência do SENAI gigante, que bate como uma parede. */
    special: {
      label: 'Ficha Gigante', kind: 'projectile',
      startup: 260, active: 40, recovery: 420,
      damagePct: 18, hitstun: 520, blockstun: 260, knockback: 420, pushbackBlock: 220,
      projectile: { sprite: 'assets/powers/reenyeSpecial.png', speed: 360, w: 120, h: 190, drawSize: 230, shed: { color: '#f4f1e8', n: 8 }, ghost: 3, lifetime: 2600, spawn: { x: 70, y: -110 } },
      anim: {   // joga a ficha com os dois braços: estufa o peito e empurra com força
        charge: { rot: -0.1, tRot: -0.35, oy: -4, sy: 1.04, tSY: 1.05, ox: -8 },
        strike: { rot: 0.18, tRot: 0.5, ox: 24, sy: 0.96 },
        fx: { charge: { kind: 'papers', n: 9 }, release: { kind: 'ring', color: '#ffd94a', r: 150, shake: 3 } },
      },
      cost: 100,
    },
  },

  /* Animações — vazio por enquanto; veja js/game/animator.js para o formato. */
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/reenye/walk.png', frameWidth: 359, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/reenye/jump.png', frameWidth: 359, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/reenye/crouch.png', frameWidth: 359, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */

  /* Sons do personagem (ids registrados em audio.js) — futuro */
  sounds: {},
});

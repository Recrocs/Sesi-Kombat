/* PERSONAGEM: otavio
   ------------------------------------------------------------------------
   Para criar um personagem novo:
     1) copie este arquivo e troque o `id`, o nome e os caminhos;
     2) ponha as imagens em assets/characters/<id>/ ;
     3) adicione o <script> em index.html (seção "CONTEÚDO").
   Pronto: ele aparece sozinho na seleção, no versus e na luta.
   ------------------------------------------------------------------------ */
SK.Characters.register({
  id: 'otavio',
  name: 'OTAVIO',
  themeColor: '#2fbf5a',          // cor de destaque (cards, versus)

  sprites: {
    portrait: 'assets/characters/otavio/portrait.png',   // busto (cards e versus)
    portraitHi: 'assets/characters/otavio/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/otavio/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/otavio/idle.png',           // corpo inteiro: menus + pose padrão na luta
    sleep: 'assets/characters/otavio/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/otavioPower.png' } },
    /* ESPECIAL (tecla C / .): chove geleia em volta do adversário (9 gotas, 4% cada). */
    special: {
      label: 'Chuva de Geleia', kind: 'projectile',
      startup: 280, active: 40, recovery: 420,
      damagePct: 4, hitstun: 200, blockstun: 120, knockback: 70, pushbackBlock: 50,
      projectile: {
        sprite: 'assets/powers/otavioSpecial.png', heading: true,
        w: 52, h: 52, drawSize: 74, glow: '#ff6b8f', landFx: { kind: 'splat', color: '#d3173f' }, speed: 0, gravity: 1700, vy0: 260, shadow: true, lifetime: 2400,
        volley: { pattern: 'rain', count: 9, spread: 240, interval: 120, fromY: -50 },
      },
      anim: {   // braços para o alto chamando a chuva: gotas vermelhas em volta
        charge: { tRot: -0.3, tSY: 1.08, oy: -8, sy: 1.03, rot: -0.08, wobble: { ox: [2, 5] } },
        strike: { tRot: -0.1, oy: -2, sy: 0.97 },
        fx: { charge: { kind: 'sparks', shape: 'drop', color: '#d3173f', n: 14 }, release: { kind: 'ring', color: '#ff7aa0', origin: 'feet', r: 120 } },
      },
      cost: 100,
    },
  },

  /* Animações — vazio por enquanto; veja js/game/animator.js para o formato. */
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/otavio/walk.png', frameWidth: 366, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/otavio/jump.png', frameWidth: 366, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/otavio/crouch.png', frameWidth: 366, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */

  /* Sons do personagem (ids registrados em audio.js) — futuro */
  sounds: {},
});

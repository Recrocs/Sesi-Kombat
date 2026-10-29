/* PERSONAGEM: ronaldo
   ------------------------------------------------------------------------
   Para criar um personagem novo:
     1) copie este arquivo e troque o `id`, o nome e os caminhos;
     2) ponha as imagens em assets/characters/<id>/ ;
     3) adicione o <script> em index.html (seção "CONTEÚDO").
   Pronto: ele aparece sozinho na seleção, no versus e na luta.
   ------------------------------------------------------------------------ */
SK.Characters.register({
  id: 'ronaldo',
  name: 'RONALDO',
  themeColor: '#58bfe8',          // cor de destaque (cards, versus)

  sprites: {
    portrait: 'assets/characters/ronaldo/portrait.png',   // busto (cards e versus)
    portraitHi: 'assets/characters/ronaldo/portrait1.png',  // busto grande (tela de VERSUS)
    idle: 'assets/characters/ronaldo/idle.png',           // corpo inteiro: menus + pose padrão na luta
    sleep: 'assets/characters/ronaldo/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/ronaldoPower.png' } },
    /* ESPECIAL (tecla C / .): um bombom Sonho de Valsa gigante cai do céu em cima de onde o adversário estava (a sombra avisa). */
    special: {
      label: 'Sonho de Valsa Gigante', kind: 'projectile',
      startup: 300, active: 40, recovery: 450,
      damagePct: 20, hitstun: 560, blockstun: 260, knockback: 280, pushbackBlock: 170,
      projectile: {
        sprite: 'assets/powers/ronaldoSpecial.png', anchor: 'bottom',
        w: 210, h: 105, drawSize: 250, speed: 0, gravity: 2600, vy0: 0, shadow: true,
        lifetime: 2600, landStay: 700, dieOnHit: false, glow: '#ff7ab8', landFx: { kind: 'impact', color: '#e8c0d0', shake: 9 },
        volley: { pattern: 'dropOnTarget', fromY: -140 },
      },
      anim: {   // ergue o bombom gigante com os braços para o alto: coluna rosa e confeitos brilhando
        charge: { oy: -10, tRot: -0.36, rot: -0.12, tSY: 1.08, sy: 1.04, ox: -6, wobble: { ox: [1.5, 14] } },
        strike: { oy: -2, tRot: 0.3, rot: 0.12, sy: 0.96, ox: 10 },
        fx: { charge: [{ kind: 'beam', color: '#ff7ab8', color2: '#ffffff' }, { kind: 'candy', color: '#ff4f9a', color2: '#ffd94a', n: 16 }], release: { kind: 'ring', color: '#ff9ad0', origin: 'feet', r: 150, shake: 3 } },
      },
      cost: 100,
    },
  },

  /* Animações — vazio por enquanto; veja js/game/animator.js para o formato. */
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/ronaldo/walk.png', frameWidth: 354, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/ronaldo/jump.png', frameWidth: 354, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/ronaldo/crouch.png', frameWidth: 354, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */

  /* Sons do personagem (ids registrados em audio.js) — futuro */
  sounds: {},
});

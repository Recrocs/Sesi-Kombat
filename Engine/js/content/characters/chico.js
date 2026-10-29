/* PERSONAGEM: Chico
   ------------------------------------------------------------------------
   Para criar um personagem novo:
     1) copie este arquivo e troque o `id`, o nome e os caminhos;
     2) ponha as imagens em assets/characters/<id>/ ;
     3) adicione o <script> em index.html (seção "CONTEÚDO").
   Pronto: ele aparece sozinho na seleção, no versus e na luta.
   ------------------------------------------------------------------------ */
SK.Characters.register({
  id: 'chico',
  name: 'CHICO',
  themeColor: '#58bfe8',          // cor de destaque (cards, versus)

  sprites: {
    portrait: 'assets/characters/chico/portrait.png',   // busto (cards e versus)
    portraitHi: 'assets/characters/chico/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/chico/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/chico/idle.png',           // corpo inteiro: menus + pose padrão na luta
    sleep: 'assets/characters/chico/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/chicoPower.png' } },
    /* ESPECIAL (tecla C / .): lança X, quadrado e bolinha; quem for atingido fica ATORDOADO por 3 s, rindo sem parar (bloqueando não pega). */
    special: {
      label: 'X, Quadrado e Bolinha', kind: 'projectile',
      startup: 280, active: 40, recovery: 420,
      damagePct: 4, hitstun: 200, blockstun: 140, knockback: 60, pushbackBlock: 60,
      status: { type: 'stun', ms: 3000, fx: '#ffd94a' },
      projectile: {
        sprite: 'assets/powers/chicoX.png', ghost: 4, speed: 430, w: 60, h: 60, drawSize: 84, spin: 9, lifetime: 2200, spawn: { x: 55, y: -130 },
        volley: { pattern: 'fan', items: [
          { sprite: 'assets/powers/chicoX.png', glow: '#27d8ee', y: -110, delay: 0 },
          { sprite: 'assets/powers/chicoSquare.png', glow: '#e84bf0', y: -150, delay: 170 },
          { sprite: 'assets/powers/chicoCircle.png', glow: '#ff4a4a', y: -120, delay: 340 },
        ] },
      },
      anim: {   // pose de zoeira: inclina para trás rindo, símbolos girando em volta, e lança de uma vez
        charge: { tRot: -0.26, rot: -0.08, sy: 0.98, wobble: { oy: [3, 8], tRot: [0.05, 8] } },
        strike: { tRot: 0.4, rot: 0.16, ox: 18, sx: 1.05 },
        fx: { charge: { kind: 'symbols' }, release: { kind: 'ring', color: '#ffd94a', r: 110 } },
      },
      cost: 100,
    },
  },

  /* Animações — vazio por enquanto; veja js/game/animator.js para o formato. */
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/chico/walk.png', frameWidth: 354, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/chico/jump.png', frameWidth: 354, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/chico/crouch.png', frameWidth: 354, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */

  /* Sons do personagem (ids registrados em audio.js) — futuro */
  sounds: {},
});

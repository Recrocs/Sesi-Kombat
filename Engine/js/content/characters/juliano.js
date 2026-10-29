/* PERSONAGEM: JULIANO  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'juliano',
  name: 'JULIANO',
  themeColor: '#9a6bff',
  sprites: {
    portrait: 'assets/characters/juliano/portrait.png',
    portraitHi: 'assets/characters/juliano/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/juliano/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/juliano/idle.png',
    sleep: 'assets/characters/juliano/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/julianoPower.png' } },
    /* ESPECIAL (tecla C / .): sopra uma nuvem de fumaça tóxica da boca; ela avança devagar e machuca várias vezes (4 x 4%). */
    special: {
      label: 'Fumaça Tóxica', kind: 'projectile',
      startup: 240, active: 40, recovery: 400,
      damagePct: 4, hitstun: 240, blockstun: 150, knockback: 70, pushbackBlock: 60,
      projectile: {
        sprite: 'assets/powers/julianoSpecial.png', faces: 'left',
        speed: 230, w: 220, h: 130, drawSize: 280, lifetime: 2300, spawn: { x: 40, y: -150 },
        maxHits: 4, hitInterval: 420, scaleIn: 380, fadeOut: 500,
      },
      anim: {   // puxa o ar (peito estufa) e sopra a fumaça de uma vez
        charge: { tSY: 1.1, sy: 1.03, tRot: -0.18, rot: -0.06, ox: -4 },
        strike: { tSY: 0.94, tRot: 0.38, rot: 0.14, ox: 14, sy: 0.97 },
        fx: { charge: { kind: 'smoke', in: true, n: 7 }, active: { kind: 'smoke', n: 9 }, release: { kind: 'ring', color: '#d5dade', origin: 'head', r: 90 } },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/juliano/walk.png', frameWidth: 350, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/juliano/jump.png', frameWidth: 350, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/juliano/crouch.png', frameWidth: 350, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

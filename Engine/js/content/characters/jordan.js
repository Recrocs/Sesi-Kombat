/* PERSONAGEM: JORDAN  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'jordan',
  name: 'JORDAN',
  themeColor: '#ff9a3c',
  sprites: {
    portrait: 'assets/characters/jordan/portrait.png',
    portraitHi: 'assets/characters/jordan/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/jordan/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/jordan/idle.png',
    sleep: 'assets/characters/jordan/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/jordanPower.png' } },
    /* ESPECIAL (tecla C / .): monta na scooter e avança em linha reta atropelando (16%). Dá pra pular por cima. */
    special: {
      label: 'Scooter Turbo', kind: 'ride',
      startup: 380, active: 720, recovery: 480,
      damagePct: 16, hitstun: 520, blockstun: 240, knockback: 520, pushbackBlock: 260,
      hitbox: { x: -10, y: -110, w: 115, h: 110 },
      ride: { sprite: 'assets/powers/jordanSpecial.png', faces: 'left', drawSize: 135, lift: 58, speed: 640 },
      anim: {   // acelera a scooter no lugar (trepidando) antes de sair
        charge: { sy: 0.96, tRot: 0.12, ox: -4, wobble: { oy: [1.6, 26], ox: [1.5, 26] } },
        strike: { tRot: 0.18, rot: 0.1, ox: 6, sy: 0.97 },
        fx: { charge: { kind: 'dust', color: '#e6cfa0', n: 8 }, release: { kind: 'ring', color: '#ffffff', origin: 'feet', r: 100, shake: 1 } },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/jordan/walk.png', frameWidth: 361, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/jordan/jump.png', frameWidth: 361, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/jordan/crouch.png', frameWidth: 361, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

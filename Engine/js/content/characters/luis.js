/* PERSONAGEM: LUIS  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'luis',
  name: 'LUIS',
  themeColor: '#9be04a',
  sprites: {
    portrait: 'assets/characters/luis/portrait.png',
    portraitHi: 'assets/characters/luis/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/luis/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/luis/idle.png',
    sleep: 'assets/characters/luis/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/luisPower.png' } },
    /* ESPECIAL (barra cheia — tecla C / .): joga o taco como frisbee/bumerangue — vai, gira, e volta. Tira 15% da vida (acerta na ida OU na volta, uma vez só). */
    special: {
      label: 'Taco Frisbee', kind: 'projectile',
      startup: 220, active: 40, recovery: 380,
      damagePct: 15, hitstun: 440, blockstun: 220, knockback: 360, pushbackBlock: 180,
      projectile: {
        sprite: 'assets/powers/luisSpecial.png',
        speed: 560, w: 84, h: 48, drawSize: 130, spin: 22, lifetime: 3000,
        boomerang: { range: 430, accel: 1800 }, glow: '#7fd0ff', ghost: 5,   // distância da ida (px) e força da freada/volta
        spawn: { x: 52, y: -120 },
      },
      anim: {   // arremesso girando: gira o tronco para trás e solta com um estalo
        charge: { rot: -0.12, tRot: -0.55, ox: -12, sy: 0.97, stance: 0.16, wobble: { tRot: [0.04, 9] } },
        strike: { rot: 0.22, tRot: 0.62, ox: 26, sx: 1.05, stance: 0.26 },
        fx: { charge: { kind: 'ring', color: '#7fd0ff' }, release: { kind: 'ring', color: '#bfe9ff', r: 120 } },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/luis/walk.png', frameWidth: 298, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/luis/jump.png', frameWidth: 298, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/luis/crouch.png', frameWidth: 298, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

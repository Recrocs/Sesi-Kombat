/* PERSONAGEM: KAIQUE  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'kaique',
  name: 'KAIQUE',
  themeColor: '#ff5fa2',
  sprites: {
    portrait: 'assets/characters/kaique/portrait.png',
    portraitHi: 'assets/characters/kaique/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/kaique/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/kaique/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/kaiquePower.png' } },
    /* ESPECIAL (tecla C / .): invoca 6 davizinhos que entram correndo pelos dois lados da tela (3% cada). */
    special: {
      label: 'Invasão de Davizinhos', kind: 'projectile',
      startup: 300, active: 40, recovery: 420,
      damagePct: 3, hitstun: 260, blockstun: 140, knockback: 90, pushbackBlock: 70,
      projectile: {
        sprites: ['assets/powers/kaiqueSpecial1.png', 'assets/powers/kaiqueSpecial2.png', 'assets/powers/kaiqueSpecial3.png', 'assets/powers/kaiqueSpecial4.png'],
        fps: 14, faces: 'right', anchor: 'bottom',
        w: 54, h: 90, drawSize: 100, speed: 330, lifetime: 3500,
        volley: { pattern: 'sides', count: 6, interval: 170, offset: 40 },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/kaique/walk.png', frameWidth: 364, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/kaique/jump.png', frameWidth: 364, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/kaique/crouch.png', frameWidth: 364, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

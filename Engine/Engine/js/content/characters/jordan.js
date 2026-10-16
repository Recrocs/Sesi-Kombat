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
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/jordan/walk.png', frameWidth: 361, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/jordan/jump.png', frameWidth: 361, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/jordan/crouch.png', frameWidth: 361, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

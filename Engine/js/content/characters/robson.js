/* PERSONAGEM: ROBSON  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'robson',
  name: 'ROBSON',
  themeColor: '#3fd08a',
  sprites: {
    portrait: 'assets/characters/robson/portrait.png',
    portraitHi: 'assets/characters/robson/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/robson/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/robson/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: { projectile: { projectile: { sprite: 'assets/powers/robsonPower.png' } } },   // poder individual (tecla X / ,)
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/robson/walk.png', frameWidth: 355, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/robson/jump.png', frameWidth: 355, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/robson/crouch.png', frameWidth: 355, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

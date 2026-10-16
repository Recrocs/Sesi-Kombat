/* PERSONAGEM: JULIANO  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'juliano',
  name: 'JULIANO',
  themeColor: '#9a6bff',
  sprites: {
    portrait: 'assets/characters/juliano/portrait.png',
<<<<<<< HEAD
    portraitHi: 'assets/characters/juliano/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/juliano/icon.png',             // cartão da seleção (se não existir, usa portrait)
=======
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
    idle: 'assets/characters/juliano/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
<<<<<<< HEAD
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/juliano/walk.png', frameWidth: 350, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/juliano/jump.png', frameWidth: 350, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/juliano/crouch.png', frameWidth: 350, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
=======
  animations: {},
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
  sounds: {},
});

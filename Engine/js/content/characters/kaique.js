/* PERSONAGEM: KAIQUE  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'kaique',
  name: 'KAIQUE',
  themeColor: '#ff5fa2',
  sprites: {
    portrait: 'assets/characters/kaique/portrait.png',
<<<<<<< HEAD
    portraitHi: 'assets/characters/kaique/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/kaique/icon.png',             // cartão da seleção (se não existir, usa portrait)
=======
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
    idle: 'assets/characters/kaique/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/kaique/walk.png', frameWidth: 364, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/kaique/jump.png', frameWidth: 364, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/kaique/crouch.png', frameWidth: 364, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

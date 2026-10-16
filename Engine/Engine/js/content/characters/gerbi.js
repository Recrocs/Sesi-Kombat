/* PERSONAGEM: GERBI  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'gerbi',
  name: 'GERBI',
  themeColor: '#e8c53a',
  sprites: {
    portrait: 'assets/characters/gerbi/portrait.png',
    portraitHi: 'assets/characters/gerbi/portrait1.png',  // busto grande (tela de VERSUS)
    idle: 'assets/characters/gerbi/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/gerbi/walk.png', frameWidth: 363, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/gerbi/jump.png', frameWidth: 363, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/gerbi/crouch.png', frameWidth: 363, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

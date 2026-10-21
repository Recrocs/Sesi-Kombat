/* PERSONAGEM: MATHEUS  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'matheus',
  name: 'MATHEUS',
  themeColor: '#4de1d2',
  sprites: {
    portrait: 'assets/characters/matheus/portrait.png',
    portraitHi: 'assets/characters/matheus/portrait1.png',  // busto grande (tela de VERSUS)
    idle: 'assets/characters/matheus/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: { projectile: { projectile: { sprite: 'assets/powers/matheusPower.png' } } },   // poder individual (tecla X / ,)
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/matheus/walk.png', frameWidth: 356, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/matheus/jump.png', frameWidth: 356, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/matheus/crouch.png', frameWidth: 356, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

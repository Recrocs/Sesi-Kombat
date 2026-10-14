/* PERSONAGEM: JULIANO  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'juliano',
  name: 'JULIANO',
  themeColor: '#9a6bff',
  sprites: {
    portrait: 'assets/characters/juliano/portrait.png',
    idle: 'assets/characters/juliano/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
  animations: {},
  sounds: {},
});

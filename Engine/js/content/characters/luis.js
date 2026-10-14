/* PERSONAGEM: LUIS  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'luis',
  name: 'LUIS',
  themeColor: '#9be04a',
  sprites: {
    portrait: 'assets/characters/luis/portrait.png',
    idle: 'assets/characters/luis/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
  animations: {},
  sounds: {},
});

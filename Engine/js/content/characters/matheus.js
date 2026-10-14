/* PERSONAGEM: MATHEUS  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'matheus',
  name: 'MATHEUS',
  themeColor: '#4de1d2',
  sprites: {
    portrait: 'assets/characters/matheus/portrait.png',
    idle: 'assets/characters/matheus/idle.png',
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {},
  animations: {},
  sounds: {},
});

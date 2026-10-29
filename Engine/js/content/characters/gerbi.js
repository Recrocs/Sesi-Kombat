/* PERSONAGEM: GERBI  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'gerbi',
  name: 'GERBI',
  themeColor: '#e8c53a',
  sprites: {
    portrait: 'assets/characters/gerbi/portrait.png',
    portraitHi: 'assets/characters/gerbi/portrait1.png',  // busto grande (tela de VERSUS)
    idle: 'assets/characters/gerbi/idle.png',
    sleep: 'assets/characters/gerbi/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/gerbiPower.png' } },
    /* ESPECIAL (tecla C / .): canta, e uma pauta de notas musicais ondula pela arena machucando (3 x 5%). */
    special: {
      label: 'Música Sonora', kind: 'projectile',
      startup: 300, active: 40, recovery: 420,
      damagePct: 5, hitstun: 220, blockstun: 140, knockback: 90, pushbackBlock: 70,
      projectile: {
        sprite: 'assets/powers/gerbiSpecial.png', faces: 'right',
        speed: 330, w: 240, h: 120, drawSize: 280, lifetime: 2600, spawn: { x: 60, y: -135 },
        wave: { amp: 22, freq: 6 }, glow: '#ffd94a', maxHits: 3, hitInterval: 300,
      },
      anim: {   // canta: peito aberto, balançando no ritmo, notas saindo
        charge: { tRot: -0.22, tSY: 1.07, sy: 1.02, wobble: { rot: [0.06, 2.6], ox: [4, 2.6] } },
        strike: { tRot: -0.28, tSY: 1.08, rot: -0.05, ox: 6, wobble: { rot: [0.05, 5] } },
        fx: { charge: { kind: 'notes', color: '#ffd94a', n: 7 }, active: { kind: 'notes', color: '#ff9ad9', n: 9 } },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/gerbi/walk.png', frameWidth: 363, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/gerbi/jump.png', frameWidth: 363, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/gerbi/crouch.png', frameWidth: 363, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

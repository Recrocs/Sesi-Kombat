/* PERSONAGEM: welli  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'welli',
  name: 'WELLIFABIO',
  themeColor: '#b8c4cc',
  sprites: {
    portrait: 'assets/characters/welli/portrait.png',
    portraitHi: 'assets/characters/welli/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/welli/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/welli/idle.png',
    sleep: 'assets/characters/welli/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/welliPower.png' } },
    /* ESPECIAL (tecla C / .): uma Kombi cai do céu em cima de onde o adversário estava; a sombra no chão avisa (dá para desviar). */
    special: {
      label: 'Kombi do Céu', kind: 'projectile',
      startup: 300, active: 40, recovery: 450,
      damagePct: 22, hitstun: 600, blockstun: 280, knockback: 300, pushbackBlock: 180,
      projectile: {
        sprite: 'assets/powers/welliSpecial.png', anchor: 'bottom',
        w: 190, h: 130, drawSize: 215, speed: 0, gravity: 2600, vy0: 0, shadow: true,
        lifetime: 2600, landStay: 700, dieOnHit: false,
        volley: { pattern: 'dropOnTarget', fromY: -170 },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/welli/walk.png', frameWidth: 361, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/welli/jump.png', frameWidth: 361, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/welli/crouch.png', frameWidth: 361, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

/* PERSONAGEM: VICENZO  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'vicenzo',
  name: 'VICENZO',
  themeColor: '#b8c4cc',
  sprites: {
    portrait: 'assets/characters/vicenzo/portrait.png',
    portraitHi: 'assets/characters/vicenzo/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/vicenzo/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/vicenzo/idle.png',
    sleep: 'assets/characters/vicenzo/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/vicenzoPower.png' } },
    /* ESPECIAL (tecla C / .): joga uma lata de gás sonífero em arco; quem for atingido DORME por 3 s (olhos fechados e balão de zzz). Agachar desvia; bloquear também. */
    special: {
      label: 'Gás Sonífero', kind: 'projectile',
      startup: 260, active: 40, recovery: 440,
      damagePct: 5, hitstun: 200, blockstun: 150, knockback: 40, pushbackBlock: 70,
      status: { type: 'sleep', ms: 3000, icon: 'assets/powers/zzz.png', closedEyes: true, fx: '#9be37a' },
      projectile: {
        sprite: 'assets/powers/vicenzoSpecial.png', speed: 520, w: 46, h: 78, drawSize: 100, spin: 14,
        gravity: 380, vy0: -190, lifetime: 2000, spawn: { x: 55, y: -135 },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/vicenzo/walk.png', frameWidth: 361, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/vicenzo/jump.png', frameWidth: 361, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/vicenzo/crouch.png', frameWidth: 361, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

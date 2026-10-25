/* PERSONAGEM: ÍTALO  (modelo comentado em chico.js) */
SK.Characters.register({
  id: 'italo',
  name: 'ÍTALO',
  themeColor: '#ff6b5e',
  sprites: {
    portrait: 'assets/characters/italo/portrait.png',
    portraitHi: 'assets/characters/italo/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/italo/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/italo/idle.png',
    sleep: 'assets/characters/italo/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/italoPower.png' } },
    /* ESPECIAL (tecla C / .): joga uma rosquinha bem longe; o cachorro sai correndo para pegá-la e machuca quem estiver no caminho (14%). */
    special: {
      label: 'Rosquinha e Cachorro', kind: 'projectile',
      startup: 260, active: 40, recovery: 420,
      damagePct: 14, hitstun: 420, blockstun: 220, knockback: 360, pushbackBlock: 160,
      projectile: {
        sprite: 'assets/powers/italoSpecial.png', harmless: true, spin: 12,
        w: 40, h: 40, drawSize: 58, gravity: 1500, lifetime: 3000, spawn: { x: 40, y: -150 },
        volley: {
          pattern: 'fetch', distance: 600, flight: 650, dogDelay: 280,
          dog: { sprite: 'assets/powers/italoDog.png', faces: 'right', anchor: 'bottom', w: 100, h: 64, drawSize: 150, speed: 640, bob: { amp: 5, freq: 24 } },
        },
      },
      cost: 100,
    },
  },
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/italo/walk.png', frameWidth: 352, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/italo/jump.png', frameWidth: 352, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/italo/crouch.png', frameWidth: 352, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */
  sounds: {},
});

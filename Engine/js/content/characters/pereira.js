/* PERSONAGEM: pereira
   ------------------------------------------------------------------------
   Para criar um personagem novo:
     1) copie este arquivo e troque o `id`, o nome e os caminhos;
     2) ponha as imagens em assets/characters/<id>/ ;
     3) adicione o <script> em index.html (seção "CONTEÚDO").
   Pronto: ele aparece sozinho na seleção, no versus e na luta.
   ------------------------------------------------------------------------ */
SK.Characters.register({
  id: 'pereira',
  name: 'PEREIRA',
  themeColor: '#2fbf5a',          // cor de destaque (cards, versus)

  sprites: {
    portrait: 'assets/characters/pereira/portrait.png',   // busto (cards e versus)
    portraitHi: 'assets/characters/pereira/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/pereira/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/pereira/idle.png',           // corpo inteiro: menus + pose padrão na luta
    sleep: 'assets/characters/pereira/sleep.png',          // olhos fechados (quando dorme)
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: {
    projectile: { projectile: { sprite: 'assets/powers/pereiraPower.png' } },
    /* ESPECIAL (tecla C / .): põe a mão no bolso, encara o adversário e, num brilho, transforma ele em MOCHILA por 3,5 s.
       Alcance longo, não dá para bloquear; dá para escapar ficando longe ou acertando o Pereira durante a pose (520 ms). */
    special: {
      label: 'Olhar da Mochila', kind: 'melee', gaze: true, unblockable: true,
      startup: 520, active: 70, recovery: 460,
      damagePct: 0, hitstun: 0, blockstun: 0, knockback: 0,
      hitbox: { x: 30, y: -200, w: 470, h: 200 },
      status: { type: 'bag', ms: 3500, sprite: 'assets/powers/pereiraBag.png', drawH: 112, fx: '#fff1a8' },
      anim: {   // calmo, com a mão no bolso: o olhar brilha crescendo até o disparo
        charge: { tRot: -0.1, rot: -0.04, ox: -3 },
        strike: { tRot: 0.2 },
        fx: { charge: [{ kind: 'glint', color: '#fff1a8' }, { kind: 'sparks', color: '#fff1a8', n: 8 }], release: { kind: 'ring', color: '#fff1a8', origin: 'head', r: 140 } },
      },
      cost: 100,
    },
  },

  /* Animações — vazio por enquanto; veja js/game/animator.js para o formato. */
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/pereira/walk.png', frameWidth: 366, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/pereira/jump.png', frameWidth: 366, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/pereira/crouch.png', frameWidth: 366, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */

  /* Sons do personagem (ids registrados em audio.js) — futuro */
  sounds: {},
});

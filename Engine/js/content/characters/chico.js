/* PERSONAGEM: Chico
   ------------------------------------------------------------------------
   Para criar um personagem novo:
     1) copie este arquivo e troque o `id`, o nome e os caminhos;
     2) ponha as imagens em assets/characters/<id>/ ;
     3) adicione o <script> em index.html (seção "CONTEÚDO").
   Pronto: ele aparece sozinho na seleção, no versus e na luta.
   ------------------------------------------------------------------------ */
SK.Characters.register({
  id: 'chico',
  name: 'CHICO',
  themeColor: '#58bfe8',          // cor de destaque (cards, versus)

  sprites: {
    portrait: 'assets/characters/chico/portrait.png',   // busto (cards e versus)
    portraitHi: 'assets/characters/chico/portrait1.png',  // busto grande (tela de VERSUS)
    icon: 'assets/characters/chico/icon.png',             // cartão da seleção (se não existir, usa portrait)
    idle: 'assets/characters/chico/idle.png',           // corpo inteiro: menus + pose padrão na luta
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: { projectile: { projectile: { sprite: 'assets/powers/chicoPower.png' } } },   // poder individual (tecla X / ,)

  /* Animações — vazio por enquanto; veja js/game/animator.js para o formato. */
  /* ANIM:BEGIN (gerado por tools/make_basic_sprites.py — pode editar à mão) */
  animations: {
    walk: { src: 'assets/characters/chico/walk.png', frameWidth: 354, frameHeight: 480, frames: 8, fps: 11, height: 200 },
    jump: { src: 'assets/characters/chico/jump.png', frameWidth: 354, frameHeight: 480, frames: 6, fps: 9, loop: false, height: 200 },
    crouch: { src: 'assets/characters/chico/crouch.png', frameWidth: 354, frameHeight: 480, frames: 3, fps: 22, loop: false, height: 200 },
  },
  /* ANIM:END */

  /* Sons do personagem (ids registrados em audio.js) — futuro */
  sounds: {},
});

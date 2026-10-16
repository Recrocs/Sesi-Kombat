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
  },
  facing: 'left',                 // para onde o sprite ORIGINAL olha no PNG ('right' | 'left') — detectado: todos olham p/ a ESQUERDA

  /* Tamanho em jogo (px do canvas 960x540) */
  size: { spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 },

  /* Atributos */
  stats: { maxHp: 100, speed: 235, jumpPower: 700 },

  /* Sobrescreva golpes padrão (veja js/game/moves.js) ou crie novos. Exemplo:
     moves: { attack: { damage: 9 }, special: { hitbox: { x: 20, y: -190, w: 160, h: 140 } } } */
  moves: {},

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

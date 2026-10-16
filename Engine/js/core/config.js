/* ==========================================================================
   CONFIG — configuração central. Quase tudo que você vai querer ajustar
   (textos, menu, controles, regras da luta, áudio) está aqui.
   ========================================================================== */
SK.config = {
  title: 'SENAI KOMBAT',
  logoLines: ['SENAI', 'KOMBAT'],        // texto do logo provisório (2 linhas)
  tagline: '',
  credits: 'Developed by ronildos',
  suggestionsUrl: '',                    // link do formulário de sugestões (Google Forms etc.)

<<<<<<< HEAD
  renderScale: 2,                        // nitidez do canvas da luta (1 = leve, 2 = nítido, 3 = máximo)

=======
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
  width: 960,
  height: 540,

  defaultMode: 'versus',                 // 'versus' = P1 vs P2 | 'cpu' = P1 vs CPU

  /* ---- Interface ---------------------------------------------------------- */
  ui: {
    menuBackground: 'assets/stages/society/background.jpg',   // fundo dos menus (troque por uma arte de mapa depois)
    logoImage: null,                     // ex.: 'assets/ui/logo.png' — se definido, substitui o logo em texto
    vsImage: null,                       // ex.: 'assets/ui/vs.png'
    rosterSlots: 12,                     // total de casas na grade de personagens (as vazias viram "???")
    rosterColumns: 4,                    // colunas da grade (4 x 3 = 12 casas)
    stageSlots: 8,                       // total de itens na lista de cenários
    settleMs: 2600,                      // quanto tempo duram as animações de entrada de cada tela
    versusAutoAdvanceMs: 4600,           // 0 = só avança com ENTER
    titleVariant: 'lineup',              // 'lineup' = todos os lutadores em fila | 'duel' = dois lutadores sorteados
    titleFighters: null,                 // ex.: ['chico', 'robson']; null = sorteia
  },

  /* ---- Menu principal (data-driven: adicione/remova botões aqui) ---------- */
  menu: [
    { id: 'circuit',     label: 'CIRCUITO',       size: 'lg', screen: 'towerMenu' },          // modo Torre
    { id: 'fight',       label: 'LUTA',           size: 'lg', screen: 'characterSelect' },
    { id: 'settings',    label: 'CONFIGURAÇÕES',  size: 'sm', screen: 'settings' },
    { id: 'suggestions', label: 'SUGESTÕES',      size: 'sm', screen: 'suggestions' },
  ],

  /* ---- Controles ----------------------------------------------------------
     Valores = `event.key` em minúsculo (a tecla que está impressa no teclado,
     funciona em qualquer layout, inclusive ABNT2).
     Para criar um golpe novo: adicione a ação aqui (ex.: kick: 'b'),
     crie `moves.kick` no personagem e pronto.                                  */
  controls: {
    p1: { left: 'a', right: 'd', up: 'w', down: 's', attack: 'z', projectile: 'x', special: 'c', block: 'v' },
    p2: { left: 'j', right: 'l', up: 'i', down: 'k', attack: 'm', projectile: ',', special: '.', block: ';' },
    pause: 'Escape',
  },
  actionLabels: { attack: 'GOLPE', projectile: 'LANÇAR', special: 'ESPECIAL', block: 'DEFESA' },
  /* ações exibidas na legenda de controles, na ordem */
  actionOrder: ['attack', 'projectile', 'special', 'block'],

  /* ---- Regras da luta ------------------------------------------------------ */
  fight: {
    roundTime: 60,                       // segundos (pode ser alterado em Configurações)
    roundsToWin: 2,
    introRoundMs: 1300,                  // "ROUND 1"
    introFightMs: 800,                   // "FIGHT!" (os lutadores já podem agir)
    roundEndMs: 2400,                    // pausa depois do KO
    faceMoveDirection: true,             // true = o sprite vira para o lado em que anda (false = sempre de frente p/ o adversário)
    gravity: 1900,
    minFighterDistance: 58,              // "colisão" entre os corpos
    chipDamage: 0.12,                    // dano que passa na defesa
    startX: [290, 670],
    cpu: {                               // dificuldade da CPU
      easy:   { think: 520, defense: 0.20, aggression: 0.35, ranged: 0.25 },
      normal: { think: 330, defense: 0.45, aggression: 0.55, ranged: 0.35 },
      hard:   { think: 190, defense: 0.70, aggression: 0.75, ranged: 0.45 },
    },
  },

<<<<<<< HEAD
  /* ---- Áudio ----------------------------------------------------------------
     Sons registrados em js/content/audio.js. `events` liga eventos do jogo a sons;
     `music` liga telas a músicas (a mesma música continua tocando entre telas);
     `duck` abaixa a música numa tela (1 = normal, 0.5 = metade).                 */
  audio: {
    events: {
      'ui:move': 'ui_move', 'ui:confirm': 'ui_confirm', 'ui:back': 'ui_back', 'ui:error': 'ui_error',
      'fight:move': 'swing', 'fight:hit': 'hit', 'fight:block': 'block', 'fight:jump': 'jump', 'fight:land': 'land',
      'fight:projectile': 'shot', 'fight:ko': 'ko', 'round:intro': 'round', 'round:fight': 'fight', 'match:end': 'win',
    },
    music: {
      title: 'music_theme', characterSelect: 'music_theme', stageSelect: 'music_theme', versus: 'music_theme',
      fight: 'music_theme', settings: 'music_theme', suggestions: 'music_theme', towerMenu: 'music_theme', tower: 'music_theme',
    },
    duck: { fight: 0.45, versus: 0.8 },
=======
  /* ---- Áudio (vazio até o sound design chegar) ------------------------------
     Veja js/content/audio.js e o README: registre os arquivos lá e ligue aos
     eventos aqui.                                                               */
  audio: {
    events: {
      // 'ui:move':      'ui_move',
      // 'ui:confirm':   'ui_confirm',
      // 'fight:hit':    'hit_01',
      // 'round:fight':  'announcer_fight',
    },
    music: {
      // title: 'music_title',        // chave = id da tela
      // fight: 'music_fight',
    },
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
  },
};

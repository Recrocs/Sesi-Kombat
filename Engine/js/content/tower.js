/* ==========================================================================
   CONTEÚDO DO MODO TORRE — modos e modificadores de andar (só dados).

   MODOS     cada um aparece como um cartão no menu CIRCUITO.
             modifiers: 'none'   → andares normais (só o chefe final é mais forte)
                        'random' → cada andar sorteia uma regra de MODIFIERS
             Para um modo novo, copie um item e mude o `id`/textos. Para uma lógica
             nova de sorteio, mexa em SK.Tower.buildFloors (js/game/tower.js).

   MODIFICADORES   player / enemy: multiplicadores { hp, speed, damage }
                   time: duração do round em segundos (sobrescreve as Configurações)
   ========================================================================== */
SK.TowerData = {
  modes: [
    {
      id: 'classic',
      name: 'TORRE CLÁSSICA',
      tagline: 'Um adversário por andar',
      desc: 'Suba os andares enfrentando todos os outros lutadores, um de cada vez. A CPU fica mais dura a cada andar e o chefe final é pesado.',
      modifiers: 'none',
    },
    {
      id: 'chaos',
      name: 'TORRE MALUCA',
      tagline: 'Cada andar tem uma regra',
      desc: 'Cada andar sorteia uma regra maluca: vida pela metade, pernas de chumbo, inimigo turbinado… Dá pra sobreviver?',
      modifiers: 'random',
    },
  ],

  /* quantos cartões o menu mostra. Hoje = só os modos existentes (sem "EM BREVE").
     Se botar um número maior que modes.length, as casas que sobram viram cartões bloqueados. */
  modeSlots: 2,

  modifiers: [
    { id: 'half_hp', name: 'VIDA PELA METADE',  desc: 'Você começa cada round com metade da vida.',          player: { hp: 0.5 } },
    { id: 'slow',    name: 'PERNAS DE CHUMBO',  desc: 'Você anda 30% mais devagar.',                          player: { speed: 0.7 } },
    { id: 'weak',    name: 'MÃOS DE MANTEIGA',  desc: 'Seus golpes causam 30% menos dano.',                   player: { damage: 0.7 } },
    { id: 'tank',    name: 'INIMIGO BLINDADO',  desc: 'O inimigo tem 50% a mais de vida.',                    enemy: { hp: 1.5 } },
    { id: 'fast',    name: 'INIMIGO TURBINADO', desc: 'O inimigo anda 30% mais rápido.',                      enemy: { speed: 1.3 } },
    { id: 'strong',  name: 'SOQUEIRA',          desc: 'Os golpes do inimigo causam 50% a mais de dano.',      enemy: { damage: 1.5 } },
    { id: 'glass',   name: 'VIDRO',             desc: 'Todo mundo com metade da vida. Um vacilo e acabou.',   player: { hp: 0.5 }, enemy: { hp: 0.5 } },
    { id: 'rush',    name: 'RELÓGIO CORRENDO',  desc: 'Round de apenas 30 segundos.',                         time: 30 },
  ],

  /* chefe do último andar (em qualquer modo) */
  boss: { id: 'boss', name: 'CHEFE FINAL', desc: 'O último da torre: mais vida e mais dano.', enemy: { hp: 1.4, damage: 1.2 } },

  /* nível da CPU por andar: índice do andar (0 = primeiro) → 'easy' | 'normal' | 'hard' */
  cpuLevelFor(index, total) {
    const t = total > 1 ? index / (total - 1) : 0;
    return t < 0.34 ? 'easy' : t < 0.72 ? 'normal' : 'hard';
  },
};

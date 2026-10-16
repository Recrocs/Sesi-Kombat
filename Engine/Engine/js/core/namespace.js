/* ==========================================================================
   NAMESPACE — cria o objeto global `SK` (Senai Kombat) e utilitários básicos.
   Tudo do jogo mora em SK.*  (nada de variáveis soltas no window).
   Os arquivos são scripts clássicos (não módulos) para o jogo abrir
   direto com duplo clique em index.html, sem servidor.
   ========================================================================== */
(function (g) {
  'use strict';
  const SK = (g.SK = g.SK || {});
  SK.version = '0.5.0';

  /* Registro genérico: personagens, cenários e qualquer conteúdo futuro
     entram no jogo chamando  SK.Characters.register({...})  — sem tocar na engine. */
  SK.createRegistry = function (kind) {
    const map = new Map();
    return {
      kind,
      register(def) {
        if (!def || !def.id) throw new Error('[SK] ' + kind + ': a definição precisa de um "id".');
        if (map.has(def.id)) console.warn('[SK] ' + kind + ' "' + def.id + '" já existia e foi substituído.');
        map.set(def.id, def);
        return def;
      },
      get: (id) => map.get(id) || null,
      has: (id) => map.has(id),
      all: () => Array.from(map.values()),
      ids: () => Array.from(map.keys()),
    };
  };

  SK.Characters = SK.createRegistry('personagem');
  SK.Stages = SK.createRegistry('cenário');

  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  SK.util = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    rand: (a, b) => a + Math.random() * (b - a),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    /* mescla objetos recursivamente (devolve um novo objeto; arrays e valores são substituídos) */
    deepMerge(base, ...overrides) {
      const out = {};
      for (const k in base) out[k] = isObj(base[k]) ? SK.util.deepMerge(base[k]) : base[k];
      for (const o of overrides) {
        if (!o) continue;
        for (const k in o) out[k] = isObj(o[k]) && isObj(out[k]) ? SK.util.deepMerge(out[k], o[k]) : isObj(o[k]) ? SK.util.deepMerge(o[k]) : o[k];
      }
      return out;
    },
    esc: (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  };

  /* Estado da "sessão" de jogo: o que foi escolhido nos menus */
  SK.Session = {
    mode: null,      // 'versus' (P1 vs P2) | 'cpu' (P1 vs CPU)
    p1: null,        // id do personagem
    p2: null,
    stage: null,     // id do cenário
  };

  SK.debug = { hitboxes: false };
})(window);

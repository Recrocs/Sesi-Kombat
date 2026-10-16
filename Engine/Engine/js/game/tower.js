/* ==========================================================================
   TOWER — estado do modo Torre (uma subida).

   Fluxo:  SK.Tower.start(jogador, modo)  →  tela 'tower' (escada)
           →  versus → luta  →  SK.Tower.report(venceu)  →  tela 'tower' de novo
   Não desenha nada: as telas (screens/tower*.js) só leem `SK.Tower.state`.
   ========================================================================== */
(function () {
  'use strict';
  const D = () => SK.TowerData;

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* junta várias regras numa só (multiplica os valores, usa o menor tempo) */
  function merge(list) {
    list = list.filter(Boolean);
    if (!list.length) return null;
    const out = { id: list.map((m) => m.id).join('+'), name: list.map((m) => m.name).join(' + '), desc: list.map((m) => m.desc).join(' '), player: {}, enemy: {} };
    list.forEach((m) => {
      ['player', 'enemy'].forEach((side) => {
        Object.keys(m[side] || {}).forEach((k) => { out[side][k] = (out[side][k] || 1) * m[side][k]; });
      });
      if (m.time) out.time = Math.min(out.time || 999, m.time);
    });
    return out;
  }

  SK.Tower = {
    state: null,

    mode(id) { return D().modes.find((m) => m.id === id); },

    /* monta os andares: adversários (todos os outros), estágio e regra de cada um */
    buildFloors(playerId, mode) {
      const opps = shuffle(SK.Characters.ids().filter((id) => id !== playerId));
      const stages = SK.Stages.ids();
      const pool = shuffle(D().modifiers);
      let lastStage = null;
      return opps.map((opp, i) => {
        const last = i === opps.length - 1;
        let stage; do { stage = stages[Math.floor(Math.random() * stages.length)]; } while (stages.length > 1 && stage === lastStage);
        lastStage = stage;
        const mods = [];
        if (mode.modifiers === 'random' && i > 0) mods.push(pool[(i - 1) % pool.length]);   // andar 1 sempre sem regra
        if (last) mods.push(D().boss);
        return { opp, stage, mod: merge(mods), boss: last, cpuLevel: D().cpuLevelFor(i, opps.length) };
      });
    },

    start(playerId, modeId) {
      const mode = SK.Tower.mode(modeId) || D().modes[0];
      this.state = { mode, player: playerId, floors: this.buildFloors(playerId, mode), index: 0, losses: 0, finished: false, startedAt: Date.now() };
      return this.state;
    },

    get active() { return !!this.state; },
    get floor() { return this.state && this.state.floors[this.state.index]; },
    get total() { return this.state ? this.state.floors.length : 0; },

    /* parâmetros prontos para SK.Screens.go('versus' | 'fight', ...) */
    fightParams() {
      const st = this.state, f = this.floor, m = f.mod || {};
      return {
        tower: true, mode: 'cpu',
        p1: st.player, p2: f.opp, stage: f.stage,
        mods: { p1: m.player || null, p2: m.enemy || null },
        roundTime: m.time || null,
        cpuLevel: f.cpuLevel,
        floorNumber: st.index + 1, floorTotal: st.floors.length, modName: m.name || '', boss: f.boss,
      };
    },

    /* resultado da luta: venceu → sobe um andar; perdeu → conta a derrota e repete */
    report(won) {
      const st = this.state;
      if (!st) return;
      if (won) { st.index++; if (st.index >= st.floors.length) { st.finished = true; st.index = st.floors.length - 1; st.finishedAt = Date.now(); } }
      else st.losses++;
    },

    reset() { this.state = null; },
  };
})();

/* ==========================================================================
   MATCH — a partida: dois lutadores, rounds, tempo, colisões e vitória.
   Não desenha nada e não mexe em DOM: só lógica. Quem desenha é o Renderer,
   e a tela de luta (screens/fight.js) escuta os eventos para mostrar banners.
   ========================================================================== */
(function () {
  'use strict';

  class Match {
    /**
     * @param {object} o { p1: {char, controller}, p2: {char, controller}, stage, settings }
     */
    constructor(o) {
      this.cfg = SK.config.fight;
      this.stage = o.stage;
      this.groundY = o.stage.groundY || 455;
      this.bounds = o.stage.bounds || { left: 50, right: SK.config.width - 50 };
      this.roundTime = o.roundTime || this.cfg.roundTime;
      this.roundsToWin = o.roundsToWin || this.cfg.roundsToWin;

      this.fighters = [
        new SK.Fighter(o.p1.char, 0, o.p1.controller, o.p1.mods),
        new SK.Fighter(o.p2.char, 1, o.p2.controller, o.p2.mods),
      ];
      this.projectiles = [];
      this.pending = [];                       // projéteis agendados (volleys)
      this.effects = [];
      this.round = 0;
      this.phase = 'intro';
      this.phaseTime = 0;
      this.timer = this.roundTime;
      this.time = 0;
      this.winner = null;
      this.started = false;
    }

    opponentOf(f) { return this.fighters[1 - f.slot]; }
    canAct() { return this.phase === 'fight'; }
    overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

    /* ---- fluxo de rounds ---------------------------------------------------- */
    start() { this.started = true; this.startRound(); }

    startRound() {
      this.round++;
      this.fighters.forEach((f, i) => f.resetRound(this.cfg.startX[i], i === 0 ? 1 : -1, this.groundY));
      this.projectiles = [];
      this.pending = [];
      this.effects = [];
      this.timer = this.roundTime;
      this.phase = 'intro'; this.phaseTime = 0;
      this.fightAnnounced = false;
      this.lastRound = null;
      SK.Events.emit('round:intro', { round: this.round });
    }

    endRound(reason) {
      const [a, b] = this.fighters;
      let winner = null;
      if (reason === 'ko') {
        if (a.hp > 0 && b.hp <= 0) winner = a;
        else if (b.hp > 0 && a.hp <= 0) winner = b;
      } else {
        if (a.hp > b.hp) winner = a; else if (b.hp > a.hp) winner = b;
      }
      if (winner) { winner.wins++; winner._set('win'); }
      else { a.wins++; b.wins++; }                         // empate: ponto para os dois
      this.projectiles = [];
      this.pending = [];
      this.lastRound = { winner, reason };
      this.phase = 'roundEnd'; this.phaseTime = 0;
      SK.Events.emit('round:end', { winner, reason, round: this.round });
    }

    nextAfterRound() {
      const [a, b] = this.fighters;
      const need = this.roundsToWin;
      if ((a.wins >= need || b.wins >= need) && a.wins !== b.wins) {
        this.winner = a.wins > b.wins ? a : b;
        this.phase = 'matchEnd'; this.phaseTime = 0;
        SK.Events.emit('match:end', { winner: this.winner });
      } else {
        this.startRound();
      }
    }

    /* ---- loop ------------------------------------------------------------------ */
    update(dt) {
      const ms = dt * 1000;
      this.phaseTime += ms;
      this.time += dt;

      if (this.phase === 'intro' && this.phaseTime >= this.cfg.introRoundMs) {
        this.phase = 'fight'; this.phaseTime = 0;
        SK.Events.emit('round:fight', { round: this.round });
      }

      this.fighters.forEach((f) => f.update(dt, this));

      if (this.phase === 'fight') {
        this.pending.forEach((q) => { q.t -= ms; if (q.t <= 0) { q.done = true; this._spawnOne(q.owner, q.move, q.ov); } });
        this.pending = this.pending.filter((q) => !q.done);
      }
      if (this.phase === 'fight' || this.phase === 'roundEnd') {
        this.projectiles.forEach((p) => p.update(dt, this));
        this.projectiles = this.projectiles.filter((p) => !p.dead);
      }
      this._separate();
      this.effects.forEach((e) => { e.t += ms; });
      this.effects = this.effects.filter((e) => e.t < e.dur);

      if (this.phase === 'fight') {
        this.timer = Math.max(0, this.timer - dt);
        const [a, b] = this.fighters;
        if (a.hp <= 0 || b.hp <= 0) this.endRound('ko');
        else if (this.timer <= 0) this.endRound('time');
      } else if (this.phase === 'roundEnd' && this.phaseTime >= this.cfg.roundEndMs) {
        this.nextAfterRound();
      }
    }

    /* ---- combate ----------------------------------------------------------------- */
    tryMeleeHit(att, move) {
      const hb = att.hitbox;
      const def = this.opponentOf(att);
      if (!hb || def.state === 'ko') return false;
      if (!this.overlap(hb, def.hurtbox)) return false;
      const res = def.receiveHit(att, move, this);
      att.addSpecial(move.meterGain || 0);
      this.registerHit(att, def, move, res, hb.x + hb.w / 2, hb.y + hb.h / 2);
      return true;
    }

    spawnProjectile(owner, move) {
      const cfg = move.projectile, v = cfg.volley;
      const list = v && SK.Volleys[v.pattern] ? SK.Volleys[v.pattern](owner, this.opponentOf(owner), v, this, cfg) : [{ delay: 0, ov: {} }];
      list.forEach((it) => {
        if (it.delay > 0) this.pending.push({ t: it.delay, owner, move, ov: it.ov });
        else this._spawnOne(owner, move, it.ov);
      });
      SK.Events.emit('fight:projectile', { fighter: owner, move });
    }
    _spawnOne(owner, move, ov) {
      this.projectiles.push(new SK.Projectile(owner, move, Object.assign({}, move.projectile, ov)));
    }

    registerHit(att, def, move, result, x, y) {
      this.effects.push({ kind: result === 'blocked' ? 'block' : 'hit', x, y, t: 0, dur: 180 });
      SK.Events.emit(result === 'blocked' ? 'fight:block' : 'fight:hit', { attacker: att, defender: def, move, x, y });
    }

    /* impede que os corpos se atravessem */
    _separate() {
      const [a, b] = this.fighters;
      if (Math.abs(a.y - b.y) > 110) return;
      const min = this.cfg.minFighterDistance;
      const dx = b.x - a.x, dist = Math.abs(dx);
      if (dist >= min) return;
      const dir = dx === 0 ? (a.facing || 1) : Math.sign(dx);
      const push = (min - dist) / 2;
      a.x -= dir * push; b.x += dir * push;
      [a, b].forEach((f) => { const hw = f.size.hurtW / 2; f.x = SK.util.clamp(f.x, this.bounds.left + hw, this.bounds.right - hw); });
    }
  }

  SK.Match = Match;
})();

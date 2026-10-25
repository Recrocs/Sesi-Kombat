/* ==========================================================================
   FIGHTER — um lutador em campo: física, estados e golpes.

   Estados:  idle, walk, jump, crouch, block   (livres: aceitam comando)
             attack (executando um golpe), hit (atordoado), ko, win

   Tudo que muda de personagem para personagem vem do arquivo de dados dele
   (stats, size, moves, animations) — a classe não tem nada "hardcoded".
   ========================================================================== */
(function () {
  'use strict';
  const NEUTRAL = Object.freeze({ left: false, right: false, up: false, down: false, block: false, pressed: new Set() });

  class Fighter {
    /* mods (opcional, usado pelo modo Torre): multiplicadores { hp, speed, damage } */
    constructor(char, slot, controller, mods) {
      this.char = char;
      this.slot = slot;                     // 0 = P1, 1 = P2
      this.controller = controller;
      this.mods = Object.assign({ hp: 1, speed: 1, damage: 1 }, mods);
      this.stats = Object.assign({ maxHp: 100, maxSpecial: 100, speed: 235, jumpPower: 700 }, char.stats);
      this.stats.maxHp = Math.round(this.stats.maxHp * this.mods.hp);
      this.stats.speed = this.stats.speed * this.mods.speed;
      this.size = Object.assign({ spriteHeight: 200, hurtW: 64, hurtH: 172, crouchH: 112 }, char.size);
      this.moves = SK.util.deepMerge(SK.defaultMoves, char.moves || {});
      this.wins = 0;
      this.resetRound(300, 1, 455);
    }

    resetRound(x, facing, groundY) {
      this.groundY = groundY;
      this.x = x; this.y = groundY; this.vx = 0; this.vy = 0;
      this.facing = facing;
      this.look = facing;                   // para onde o SPRITE olha (pode diferir de `facing` ao andar de costas)
      this.hp = this.stats.maxHp;
      this.special = 0;
      this.state = 'idle'; this.stateTime = 0;
      this.moveKey = null; this.move = null; this.moveTime = 0; this.moveHit = false; this.moveSpawned = false;
      this.hitstun = 0; this.hitFlash = 0;
      this.status = null; this.statusImmune = 0; this.popTime = 0;   // status: { type:'stun'|'sleep'|'bag', t, dur, ... }
      this.cooldowns = {};
      Object.keys(this.moves).forEach((k) => { this.cooldowns[k] = 0; });
      this.onGround = true;
    }

    /* caixa de dano (onde o lutador pode ser atingido) */
    get hurtbox() {
      let h = this.state === 'crouch' ? this.size.crouchH : this.size.hurtH;
      if (this.status && this.status.type === 'bag') h = (this.status.drawH || 110) + 4;   // virou mochila: caixa menor
      return { x: this.x - this.size.hurtW / 2, y: this.y - h, w: this.size.hurtW, h };
    }

    /* caixa de ataque atual (ou null) */
    get hitbox() {
      const m = this.move;
      if (this.state !== 'attack' || !m || (m.kind !== 'melee' && m.kind !== 'ride')) return null;
      if (this.movePhase !== 'active') return null;
      const hb = m.hitbox;
      return { x: this.facing > 0 ? this.x + hb.x : this.x - hb.x - hb.w, y: this.y + hb.y, w: hb.w, h: hb.h };
    }

    get movePhase() {
      const m = this.move;
      if (!m) return null;
      if (this.moveTime < m.startup) return 'startup';
      if (this.moveTime < m.startup + m.active) return 'active';
      return 'recovery';
    }

    addSpecial(n) { this.special = SK.util.clamp(this.special + (n || 0), 0, this.stats.maxSpecial); }

    _set(state) {
      this.state = state; this.stateTime = 0;
      if (state === 'ko' || state === 'win') this.status = null;
    }

    /* Status que deixam o lutador sem agir por um tempo (golpe com move.status = { type, ms, sprite?, icon?, closedEyes? }) */
    applyStatus(cfg) {
      if (this.statusImmune > 0 || this.status || this.state === 'ko' || this.state === 'win') return false;
      this.status = { type: cfg.type, t: cfg.ms, dur: cfg.ms, sprite: cfg.sprite, icon: cfg.icon, closedEyes: !!cfg.closedEyes, wake: !!cfg.wakeOnHit, drawH: cfg.drawH };
      this.move = null; this.moveKey = null;
      this.popTime = 450;
      this._set('status');
      return true;
    }
    _updateStatus(ms) {
      const s = this.status;
      if (!s) { this._set(this.onGround ? 'idle' : 'jump'); return; }
      s.t -= ms;
      if (s.t <= 0) {
        this.status = null; this.statusImmune = 900; this.popTime = 450;     // depois de acordar, fica imune um instante (sem "prender" o jogador)
        this._set(this.onGround ? 'idle' : 'jump');
      }
    }
    _setIf(state) { if (this.state !== state) this._set(state); }

    update(dt, match) {
      const ms = dt * 1000;
      this.stateTime += ms;
      this.hitFlash = Math.max(0, this.hitFlash - ms);
      this.popTime = Math.max(0, this.popTime - ms);
      this.statusImmune = Math.max(0, this.statusImmune - ms);
      for (const k in this.cooldowns) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - ms);

      const intent = match.canAct() ? (this.controller.read(this, match, dt) || NEUTRAL) : NEUTRAL;
      const opp = match.opponentOf(this);

      switch (this.state) {
        case 'attack': this._updateMove(ms, match); break;
        case 'hit':
          this.hitstun -= ms;
          if (this.hitstun <= 0) this._set(this.onGround ? 'idle' : 'jump');
          break;
        case 'status': this._updateStatus(ms); break;
        case 'ko':
        case 'win': break;
        default: this._updateFree(intent, opp, match);
      }
      this._physics(dt, match);
    }

    _updateFree(I, opp, match) {
      const g = this.onGround;
      if (g && opp && Math.abs(opp.x - this.x) > 4) this.facing = opp.x > this.x ? 1 : -1;
      const turn = match.cfg.faceMoveDirection !== false;      // sprite vira para o lado em que anda
      if (g) this.look = this.facing;

      if (g) {
        for (const key of I.pressed) {
          if (this._canStart(key)) { this._startMove(key); return; }
        }
        if (I.block) { this._setIf('block'); this.vx = 0; return; }
        if (I.down)  { this._setIf('crouch'); this.vx = 0; return; }
        const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
        if (I.up) {
          this.vy = -this.stats.jumpPower; this.onGround = false;
          this.vx = dir * this.stats.speed * 0.9;
          if (turn && dir) this.look = dir;
          this._set('jump');
          SK.Events.emit('fight:jump', { fighter: this });
          return;
        }
        this.vx = dir * this.stats.speed;
        if (turn && dir) this.look = dir;
        this._setIf(dir ? 'walk' : 'idle');
      }
    }

    _canStart(key) {
      const m = this.moves[key];
      if (!m) return false;
      if (this.cooldowns[key] > 0) return false;
      if (m.cost && this.special < m.cost) return false;
      return true;
    }

    _startMove(key) {
      const m = this.moves[key];
      if (m.cost) this.special -= m.cost;
      this.look = this.facing;
      this.move = m; this.moveKey = key; this.moveTime = 0; this.moveHit = false; this.moveSpawned = false;
      this.vx = (m.lunge || 0) * this.facing;
      if (m.cooldown) this.cooldowns[key] = m.cooldown;
      this._set('attack');
      SK.Events.emit('fight:move', { fighter: this, move: m, key });
    }

    _updateMove(ms, match) {
      const m = this.move;
      this.moveTime += ms;
      const a0 = m.startup, a1 = m.startup + m.active, end = a1 + m.recovery;
      if (this.moveTime >= a0 && this.moveTime < a1) {
        if (m.kind === 'projectile') {
          if (!this.moveSpawned) { this.moveSpawned = true; match.spawnProjectile(this, m); }
        } else if (m.kind === 'ride') {
          /* investida montado num veículo: avança direto; ao atropelar, encerra a investida */
          this.vx = this.facing * m.ride.speed;
          if (!this.moveHit && match.tryMeleeHit(this, m)) { this.moveHit = true; this.moveTime = a1; }
        } else if (!this.moveHit && match.tryMeleeHit(this, m)) {
          this.moveHit = true;
        }
      }
      if (this.moveTime >= end) {
        this.move = null; this.moveKey = null;
        this._set(this.onGround ? 'idle' : 'jump');
      }
    }

    /* Recebe um golpe. Devolve 'hit' ou 'blocked'. */
    receiveHit(attacker, move, match, fromX) {
      const ax = fromX !== undefined ? fromX : attacker.x;
      const away = (this.x - ax) >= 0 ? 1 : -1;
      const inFront = (ax - this.x) * this.facing > 0;
      const blocking = !move.unblockable && this.state === 'block' && inFront && this.onGround;

      /* `damagePct` = dano em % da vida máxima de quem apanha (ex.: 15 → tira 15% da barra); senão usa `damage` fixo */
      const base = move.damagePct != null ? this.stats.maxHp * move.damagePct / 100 : (move.damage || 0);
      const dmg = base * ((attacker.mods && attacker.mods.damage) || 1);

      if (blocking) {
        const chip = Math.round(dmg * match.cfg.chipDamage);
        this.hp = Math.max(1, this.hp - chip);              // dano de defesa nunca nocauteia
        this.vx = away * (move.pushbackBlock != null ? move.pushbackBlock : 110);
        this.addSpecial((move.meterGainTaken || 0) * 0.5);
        this.hitFlash = 90;
        return 'blocked';
      }

      this.move = null; this.moveKey = null;
      this.look = this.facing;
      this.hp = Math.max(0, this.hp - Math.round(dmg));
      this.addSpecial(move.meterGainTaken);
      this.hitFlash = 160;
      this.vx = away * (move.knockback != null ? move.knockback : 150);

      if (this.hp <= 0) {
        this.status = null;
        this._set('ko');
        this.onGround = false; this.vy = -340; this.vx = away * 260;
        SK.Events.emit('fight:ko', { fighter: this });
      } else if (move.status && this.applyStatus(move.status)) {
        this.vx = away * (move.knockback != null ? move.knockback : 0) * 0.4;        // entrou no status (atordoado / dormindo / mochila)
      } else if (this.state === 'status' && this.status && !this.status.wake) {
        this.vx = away * (move.knockback != null ? move.knockback : 0) * 0.3;        // já está dormindo/atordoado: leva o dano e continua assim
      } else {
        if (this.status) this.status = null;
        this._set('hit');
        this.hitstun = move.hitstun != null ? move.hitstun : 250;
      }
      return 'hit';
    }

    _physics(dt, match) {
      if (!this.onGround) this.vy += match.cfg.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        if (!this.onGround) {
          this.onGround = true;
          if (this.state === 'jump') { this._set('idle'); this.vx = 0; }
          else if (this.state === 'ko') this.vx *= 0.5;
          SK.Events.emit('fight:land', { fighter: this });
        }
        this.vy = 0;
      }

      const riding = this.state === 'attack' && this.move && this.move.kind === 'ride' && this.movePhase === 'active';
      if (this.onGround && !riding && this.state !== 'idle' && this.state !== 'walk' && this.state !== 'crouch' && this.state !== 'jump') {
        this.vx -= this.vx * Math.min(1, 10 * dt);          // atrito em hit / ko / block / attack
      }

      const b = match.bounds;
      const hw = this.size.hurtW / 2;
      this.x = SK.util.clamp(this.x, b.left + hw, b.right - hw);
    }
  }

  SK.Fighter = Fighter;
})();

/* TELA: Luta — liga Match (lógica) + Renderer (canvas) + HUD (DOM) + pausa/resultado.
   Toda a regra da luta fica em js/game/*; aqui é só "cola" e interface. */
SK.Screens.register('fight', function (params) {
  const c1 = SK.Characters.get(params.p1), c2 = SK.Characters.get(params.p2);
  const stage = SK.Stages.get(params.stage);
  const cpu = params.mode === 'cpu';
  const tower = !!params.tower;                                      // modo Torre
  const cpuLevel = params.cpuLevel || SK.Settings.get('cpuLevel');

  let root = null, match = null, renderer = null;
  let paused = false, finished = false;
  let pauseNav = null, resultNav = null, bannerTimer = null;
  const offs = [];
  const hud = {};

  const $ = (sel) => root.querySelector(sel);

  /* ---- HUD ----------------------------------------------------------------- */
  function hudSide(i, c) {
    const side = i === 0 ? 'l' : 'r';
    const tag = i === 1 && cpu ? 'CPU' : 'P' + (i + 1);
    const dots = Array.from({ length: Number(SK.Settings.get('roundsToWin')) }, () => '<i></i>').join('');
    return '<div class="hud__p hud__p--' + side + ' panel abs" data-slot="' + i + '">' +
      '<div class="hud__name">' + tag + ' · ' + SK.util.esc(c.name) + '</div>' +
      '<div class="bar' + (i ? ' bar--rtl' : '') + '"><i class="bar__trail"></i><i class="bar__fill"></i></div>' +
      '<div class="hud__row"><span class="hud__lbl">ESPECIAL</span>' +
        '<div class="bar bar--special' + (i ? ' bar--rtl' : '') + '"><i class="bar__fill"></i></div>' +
        '<div class="hud__rounds">' + dots + '</div></div></div>';
  }

  function menuHTML(items) {
    return '<div class="overlay__menu">' + items.map((t) => '<div class="btn panel">' + t + '</div>').join('') + '</div>';
  }

  function updateHud() {
    match.fighters.forEach((f, i) => {
      const h = hud.sides[i];
      const hp = (f.hp / f.stats.maxHp) * 100;
      const sp = (f.special / f.stats.maxSpecial) * 100;
      if (h.hpV !== hp) { h.fill.style.width = hp + '%'; h.trail.style.width = hp + '%'; h.hpV = hp; h.panel.classList.toggle('is-low', hp > 0 && hp <= 25); }
      if (h.spV !== sp) { h.sp.style.width = sp + '%'; h.spBar.classList.toggle('is-full', sp >= 100); h.spV = sp; }
      h.dots.forEach((d, k) => d.classList.toggle('is-won', k < f.wins));
    });
    const t = match.phase === 'intro' ? match.roundTime : Math.ceil(match.timer);
    if (hud.tV !== t) { hud.timer.textContent = t; hud.timer.classList.toggle('is-low', t <= 10 && match.phase === 'fight'); hud.tV = t; }
    if (hud.rV !== match.round) { hud.round.textContent = 'ROUND ' + match.round; hud.rV = match.round; }
  }

  /* ---- Banners ---------------------------------------------------------------- */
  function banner(text, ms, cls) {
    const el = hud.banner;
    clearTimeout(bannerTimer);
    el.textContent = text;
    el.className = 'banner' + (cls ? ' ' + cls : '');
    void el.offsetWidth;                                  // reinicia a animação
    el.classList.add('is-show');
    if (ms) bannerTimer = setTimeout(() => { el.className = 'banner'; }, ms);
  }

  /* ---- Pausa / resultado --------------------------------------------------------- */
  function setPaused(v) {
    if (finished || paused === v) return;
    paused = v;
    $('.overlay--pause').classList.toggle('hidden', !v);
    SK.Events.emit(v ? 'ui:confirm' : 'ui:back');
  }
  const restart = () => SK.Screens.go('fight', params);
  const toMenu = () => { if (tower) SK.Tower.reset(); SK.Screens.go(tower ? 'towerMenu' : 'title'); };
  const toSelect = () => { SK.Session.p1 = null; SK.Session.p2 = null; SK.Screens.go('characterSelect'); };

  function showResult(winner) {
    finished = true;
    const w = winner.char;
    const who = winner.slot === 1 && cpu ? 'CPU' : 'P' + (winner.slot + 1);
    $('.result__who').textContent = who + ' · ' + w.name;

    /* botões do resultado: no modo Torre dependem de ter vencido ou perdido */
    let items, actions, title = 'VITÓRIA!';
    if (tower) {
      const won = winner.slot === 0;
      const lastFloor = params.floorNumber >= params.floorTotal;
      title = won ? (lastFloor ? 'TORRE CONQUISTADA!' : 'ANDAR LIMPO!') : 'DERROTA';
      if (won) {
        items = [lastFloor ? 'VER O FINAL' : 'SUBIR A TORRE'];
        actions = [() => { SK.Tower.report(true); SK.Screens.go('tower'); }];
      } else {
        items = ['TENTAR DE NOVO', 'DESISTIR'];
        actions = [() => { SK.Tower.report(false); SK.Screens.go('tower'); }, toMenu];
      }
    } else {
      items = ['REVANCHE', 'TROCAR LUTADORES', 'MENU PRINCIPAL'];
      actions = [restart, toSelect, toMenu];
    }
    $('.result__title').textContent = title;
    $('.result__title').classList.toggle('t-lose', title === 'DERROTA');
    $('.result__menu').innerHTML = items.map((t) => '<div class="btn panel">' + t + '</div>').join('');
    $('.overlay--result').classList.remove('hidden');
    resultNav = new SK.UI.NavList(Array.from($('.overlay--result').querySelectorAll('.btn')), {
      onActivate: (i) => actions[i](),
    });
  }

  /* ---- Ciclo da tela ---------------------------------------------------------------- */
  return {
    render() {
      return '<canvas class="fight__canvas" width="' + SK.config.width + '" height="' + SK.config.height + '"></canvas>' +
        '<div class="hud">' + hudSide(0, c1) +
          '<div class="hud__timer panel abs"><div class="hud__timer-n"></div><div class="hud__timer-r"></div></div>' +
          hudSide(1, c2) +
          '<div class="hud__ctl hud__ctl--l panel">' + SK.UI.controlsLineHTML(0) + '</div>' +
          (cpu ? '<div class="hud__ctl hud__ctl--r panel"><div><b>CPU</b> · ' + SK.util.esc(cpuLevel.toUpperCase()) + '</div></div>'
               : '<div class="hud__ctl hud__ctl--r panel">' + SK.UI.controlsLineHTML(1) + '</div>') +
        '</div>' +
        '<div class="fight__pause btn panel abs" data-act="pause">PAUSA</div>' +
        (tower ? '<div class="fight__tower abs"><b>ANDAR ' + params.floorNumber + ' / ' + params.floorTotal + '</b>' + (params.modName ? ' · ' + SK.util.esc(params.modName) : '') + '</div>' : '') +
        '<div class="banner"></div>' +
        '<div class="overlay overlay--pause hidden"><div class="overlay__box panel"><div class="overlay__title t-title t-yellow">PAUSA</div>' +
          menuHTML(['CONTINUAR', 'REINICIAR LUTA', 'SAIR PARA O MENU']) + '</div></div>' +
        '<div class="overlay overlay--result hidden"><div class="overlay__box panel"><div class="overlay__title result__title t-title t-yellow">VITÓRIA!</div>' +
          '<div class="overlay__sub result__who"></div><div class="overlay__menu result__menu"></div></div></div>';
    },

    mount(el) {
      root = el;
      const p1c = new SK.HumanController(0);
      const p2c = cpu ? new SK.CPUController(cpuLevel) : new SK.HumanController(1);
      match = new SK.Match({
        p1: { char: c1, controller: p1c, mods: params.mods && params.mods.p1 },
        p2: { char: c2, controller: p2c, mods: params.mods && params.mods.p2 },
        stage,
        roundTime: params.roundTime || Number(SK.Settings.get('roundTime')),
        roundsToWin: Number(SK.Settings.get('roundsToWin')),
      });
      renderer = new SK.Renderer($('.fight__canvas'));
      SK.debug.match = match;                               // facilita depurar no console: SK.debug.match

      /* referências do HUD */
      hud.sides = [0, 1].map((i) => {
        const p = $('.hud__p[data-slot="' + i + '"]');
        const bars = p.querySelectorAll('.bar');
        return { panel: p, fill: bars[0].querySelector('.bar__fill'), trail: bars[0].querySelector('.bar__trail'),
                 spBar: bars[1], sp: bars[1].querySelector('.bar__fill'), dots: Array.from(p.querySelectorAll('.hud__rounds i')) };
      });
      hud.timer = $('.hud__timer-n'); hud.round = $('.hud__timer-r'); hud.banner = $('.banner');

      /* botões */
      $('[data-act="pause"]').addEventListener('click', () => setPaused(true));
      pauseNav = new SK.UI.NavList(Array.from($('.overlay--pause').querySelectorAll('.btn')), {
        onActivate: (i) => { if (i === 0) setPaused(false); else if (i === 1) restart(); else toMenu(); },
      });

      /* eventos da partida → banners */
      offs.push(SK.Events.on('round:intro', (e) => banner('ROUND ' + e.round)));
      offs.push(SK.Events.on('round:fight', () => banner('FIGHT!', 800)));
      offs.push(SK.Events.on('round:end', (e) => {
        if (!e.winner) banner('EMPATE');
        else banner(e.reason === 'ko' ? 'K.O.' : 'TEMPO!', 0, e.reason === 'ko' ? 'banner--ko' : '');
      }));
      offs.push(SK.Events.on('match:end', (e) => { banner('', 0); showResult(e.winner); }));

      const onBlur = () => { if (match.phase === 'intro' || match.phase === 'fight') setPaused(true); };
      window.addEventListener('blur', onBlur);
      offs.push(() => window.removeEventListener('blur', onBlur));

      match.start();
      updateHud();
    },

    update(dt) {
      if (!match) return;
      if (!paused) match.update(Math.min(dt, 1 / 30));
      renderer.draw(match);
      updateHud();
    },

    onKey(key, e) {
      if (finished) return resultNav ? resultNav.handle(key) : false;
      if (paused) {
        if (key === 'back') { setPaused(false); return true; }
        return pauseNav.handle(key);
      }
      /* controle: o botão B é DEFESA durante a luta; só o Start pausa */
      if (key === 'back' && e && e.source === 'gamepad' && e.button !== 'start') return false;
      if (key === 'back') { setPaused(true); return true; }
      return false;
    },

    unmount() {
      offs.forEach((f) => f());
      clearTimeout(bannerTimer);
      pauseNav && pauseNav.destroy();
      resultNav && resultNav.destroy();
    },
  };
});

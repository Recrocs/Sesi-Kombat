/* TELA: Seleção de personagem
   Fluxo: P1 escolhe → P2 (ou CPU) escolhe → ENTER vai para a escolha de cenário.
   A grade tem SK.config.ui.rosterSlots casas; as que sobram viram "???". */
SK.Screens.register('characterSelect', function (params) {
  const S = SK.Session;
  const cfg = SK.config;
  /* modo Torre: só o P1 escolhe; os adversários vêm da própria torre */
  const towerMode = params && params.tower ? SK.Tower.mode(params.tower) : null;
  const roster = SK.Characters.all();
  const cols = cfg.ui.rosterColumns || 4;
  const slots = Math.ceil(Math.max(cfg.ui.rosterSlots, roster.length) / cols) * cols;

  let mode = towerMode ? 'cpu' : (S.mode || cfg.defaultMode);
  let picking = 1;                 // quem está escolhendo agora (1 ou 2)
  let p1 = !towerMode && S.p1 ? SK.Characters.get(S.p1) : null;
  let p2 = !towerMode && S.p2 ? SK.Characters.get(S.p2) : null;
  if (p1) picking = 2;
  let ready = !!(p1 && p2);
  let nav = null, root = null, hovered = roster[0] || null;

  const $ = (sel) => root.querySelector(sel);

  function cardHTML(i) {
    const c = roster[i];
    if (!c) {
      const last = i === slots - 1;
      return '<div class="char-card char-card--locked panel" data-i="' + i + '" style="--i:' + i + '"><span class="char-card__bg"></span>' +
        '<span class="char-card__q">???</span>' + (last ? '<div class="tape"><span>EM BREVE</span></div>' : '') + '</div>';
    }
    return '<div class="char-card panel" data-i="' + i + '" style="--i:' + i + ';--theme:' + c.themeColor + '">' +
      '<span class="char-card__bg"></span>' +
      '<img class="char-card__img" src="' + c.sprites.portrait + '" alt="">' +
      '<span class="char-card__tags"><span class="tag tag--p1" data-tag="1" style="display:none">P1</span><span class="tag tag--p2" data-tag="2" style="display:none">P2</span></span>' +
      '<span class="char-card__name">' + SK.util.esc(c.name) + '</span></div>';
  }

  function sideHTML(side) {
    const n = side === 1 ? 'l' : 'r';
    return '<div class="cs__side cs__side--' + n + ' panel abs" data-side="' + side + '">' +
      '<div class="cs__side-label t-title ' + (side === 1 ? 't-p1' : 't-p2') + '" data-role="label">P' + side + '</div>' +
      '<div class="cs__side-sprite" data-role="sprite"></div>' +
      '<div class="cs__side-name" data-role="name"></div></div>' +
      '<div class="cs__ctl cs__ctl--' + n + ' ctl ctl--p' + side + ' panel abs" data-role="ctl' + side + '"></div>';
  }

  function refresh() {
    const idx = nav ? nav.index : 0;
    hovered = roster[idx] || null;

    const cpu = mode === 'cpu';

    /* tags P1/P2 nos cards */
    root.querySelectorAll('.char-card').forEach((card, i) => {
      const c = roster[i];
      card.querySelectorAll('.tag').forEach((t) => {
        const isP1 = t.dataset.tag === '1';
        const side = isP1 ? p1 : p2;
        t.style.display = c && side && side.id === c.id ? '' : 'none';
        if (!isP1) t.textContent = cpu ? 'CPU' : 'P2';
      });
    });

    const prompt = towerMode ? (ready ? 'PRONTO! ENTER PARA SUBIR A TORRE' : 'ESCOLHA O SEU LUTADOR')
      : ready ? 'PRONTO! ENTER PARA O CENÁRIO'
      : picking === 1 ? 'ESCOLHA O LUTADOR DO P1'
      : cpu ? 'ESCOLHA O ADVERSÁRIO (CPU)' : 'ESCOLHA O LUTADOR DO P2';
    $('.cs__prompt').textContent = prompt;

    /* modos */
    $('.cs__mode--a').classList.toggle('is-selected', cpu);
    $('.cs__mode--b').classList.toggle('is-selected', !cpu);
    $('.cs__foot').innerHTML = towerMode
      ? SK.util.esc(towerMode.name) + ' · ' + (SK.Characters.all().length - 1) + ' ANDARES<br>ESC VOLTA'
      : (cpu ? '1 JOGADOR · CONTRA A CPU' : '2 JOGADORES · MESMO TECLADO') + '<br>TAB TROCA O MODO · ESC VOLTA';

    /* painéis laterais: mostra o escolhido, ou o que está sob o cursor para quem está escolhendo */
    [1, 2].forEach((side) => {
      const chosen = side === 1 ? p1 : p2;
      const showing = chosen || (picking === side && !ready ? hovered : null);
      const panel = root.querySelector('.cs__side[data-side="' + side + '"]');
      const sprite = panel.querySelector('[data-role="sprite"]');
      const name = panel.querySelector('[data-role="name"]');
      panel.querySelector('[data-role="label"]').textContent = side === 2 && cpu ? 'CPU' : 'P' + side;
      if (showing) {
        sprite.innerHTML = '<img src="' + showing.sprites.idle + '" alt=""' + SK.UI.flipStyle(showing, side === 1 ? 'right' : 'left') + '>';
        name.textContent = showing.name;
        name.style.opacity = chosen ? 1 : 0.7;
      } else {
        sprite.innerHTML = '<span class="cs__empty">?</span>';
        name.textContent = '';
      }
    });
    $('[data-role="ctl1"]').innerHTML = SK.UI.controlsHTML(0);
    $('[data-role="ctl2"]').innerHTML = towerMode
      ? '<div class="ctl__title ctl__title--p2">TORRE</div><div class="ctl__sub">' + SK.util.esc(towerMode.tagline || '').toUpperCase() + '</div>'
      : cpu
      ? '<div class="ctl__title ctl__title--p2">CPU</div><div class="ctl__sub">CONTROLADO PELO COMPUTADOR</div>'
      : SK.UI.controlsHTML(1);

    const go = $('.cs__go');
    go.classList.toggle('is-ready', ready);
    go.classList.toggle('is-selected', ready);
    go.classList.toggle('is-disabled', !ready);
  }

  function pick(i) {
    const c = roster[i];
    if (!c) { SK.UI.toast('Personagem em breve!'); return; }
    if (towerMode) { p1 = c; ready = true; }
    else if (picking === 1) { p1 = c; picking = 2; }
    else { p2 = c; ready = true; }
    refresh();
  }

  function undo() {
    if (towerMode) { if (ready) { ready = false; p1 = null; } else { SK.Screens.go('towerMenu'); return; } }
    else if (ready) { ready = false; p2 = null; picking = 2; }
    else if (picking === 2 && p1) { p1 = null; picking = 1; }
    else { SK.Screens.go('title'); return; }
    SK.Events.emit('ui:back');
    refresh();
  }

  function advance() {
    if (!ready) { SK.UI.toast(picking === 1 ? 'Escolha o lutador do P1' : 'Escolha o outro lutador'); return; }
    if (towerMode) { SK.Tower.start(p1.id, towerMode.id); SK.Screens.go('tower'); return; }
    S.mode = mode; S.p1 = p1.id; S.p2 = p2.id;
    SK.Screens.go('stageSelect');
  }

  function setMode(m) { if (!towerMode && mode !== m) { mode = m; S.mode = m; SK.Events.emit('ui:move'); refresh(); } }

  return {
    render() {
      let cards = '';
      for (let i = 0; i < slots; i++) cards += cardHTML(i);
      return '<div class="menu-bg"></div>' +
        '<div class="back-btn btn panel abs" data-act="back">VOLTAR</div>' +
        '<div class="cs__title screen-title panel abs t-title">' + (towerMode ? SK.util.esc(towerMode.name) : 'LUTA') + '</div>' +
        '<div class="cs__mode cs__mode--a btn panel abs' + (towerMode ? ' hidden' : '') + '" data-mode="cpu">P1 vs CPU</div>' +
        '<div class="cs__mode cs__mode--b btn panel abs' + (towerMode ? ' hidden' : '') + '" data-mode="versus">P1 vs P2</div>' +
        '<div class="cs__prompt abs t-title"></div>' +
        sideHTML(1) + sideHTML(2) +
        '<div class="cs__grid abs" style="--cols:' + cols + '">' + cards + '</div>' +
        '<div class="cs__go btn panel abs" data-act="go">' + (towerMode ? 'SUBIR A TORRE' : 'ESCOLHER CENÁRIO') + '</div>' +
        '<div class="cs__foot abs t-title"></div>';
    },
    mount(el) {
      root = el;
      el.querySelector('[data-act="back"]').addEventListener('click', () => SK.Screens.go(towerMode ? 'towerMenu' : 'title'));
      el.querySelector('[data-act="go"]').addEventListener('click', advance);
      el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

      const cards = Array.from(el.querySelectorAll('.char-card'));
      nav = new SK.UI.NavList(cards, {
        columns: cols, cls: 'is-cursor',
        onChange: (i, el) => { if (root) { refresh(); el && el.scrollIntoView({ block: 'nearest' }); } },
        onActivate: (i) => pick(i),
      });
      refresh();
    },
    onKey(key) {
      if (key === 'back') { undo(); return true; }
      if (key === 'tab' && !towerMode) { setMode(mode === 'cpu' ? 'versus' : 'cpu'); return true; }
      if (key === 'confirm' && ready) { advance(); return true; }
      return nav.handle(key);
    },
    unmount() { nav && nav.destroy(); },
  };
});

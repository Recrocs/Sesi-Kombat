/* TELA: Torre — o pagode do modo Torre (visual inspirado nas torres de jogos de luta clássicos).
   Cada andar mostra o adversário numa janela; a serpente dourada marca o andar atual e a câmera sobe
   quando você vence. ENTER luta; ESC desiste. Estado em SK.Tower.state (js/game/tower.js).

   Medidas (precisam bater com css/tower.css): FLOOR_H altura de cada andar, ROOF_H telhado, BASE_H base,
   VIEW_H altura da janela de visualização. */
SK.Screens.register('tower', function () {
  const T = SK.Tower;
  const st = T.state;
  if (!st) { setTimeout(() => SK.Screens.go('towerMenu'), 0); return { render: () => '' }; }

  const FLOOR_H = 96, ROOF_H = 112, BASE_H = 84, VIEW_H = 372;
  const player = SK.Characters.get(st.player);
  const floor = T.floor;
  const opp = SK.Characters.get(floor.opp);
  const stage = SK.Stages.get(floor.stage);
  const n = st.floors.length;
  let root = null, climbTimer = null;

  function fmtTime(ms) { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  /* translateY para centralizar o andar `k` (0 = primeiro) na janela */
  function offsetFor(k) {
    const centerY = ROOF_H + (n - 1 - k) * FLOOR_H + FLOOR_H / 2;
    return Math.round(VIEW_H / 2 - centerY);
  }

  /* telhado de pagode (SVG) */
  const ROOF_SVG =
    '<svg class="tw__roof" viewBox="0 0 360 112" preserveAspectRatio="none" aria-hidden="true">' +
    '<defs><linearGradient id="twr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5a52"/><stop offset="1" stop-color="#16302f"/></linearGradient></defs>' +
    '<path d="M180 2 L188 30 L172 30 Z" fill="#e8c766"/>' +
    '<path d="M118 60 Q150 36 180 30 Q210 36 242 60 Q222 52 180 50 Q138 52 118 60Z" fill="url(#twr)" stroke="#e8c766" stroke-width="2"/>' +
    '<path d="M64 92 Q116 64 180 58 Q244 64 296 92 Q250 82 180 78 Q110 82 64 92Z" fill="url(#twr)" stroke="#e8c766" stroke-width="2"/>' +
    '<path d="M10 112 Q84 80 180 74 Q276 80 350 112 Q276 100 180 98 Q84 100 10 112Z" fill="url(#twr)" stroke="#e8c766" stroke-width="2"/>' +
    '<circle cx="14" cy="108" r="4" fill="#e8c766"/><circle cx="346" cy="108" r="4" fill="#e8c766"/></svg>';

  /* serpente dourada que marca o andar atual */
  const SNAKE_SVG =
    '<svg class="tw__snake" viewBox="0 0 440 40" aria-hidden="true"><defs><linearGradient id="twsn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a1c"/><stop offset=".5" stop-color="#f6d56a"/><stop offset="1" stop-color="#c79a2c"/></linearGradient></defs>' +
    '<path d="M4 26 C40 4 74 38 112 20 S182 2 220 22 S292 40 330 18 S396 6 420 20" fill="none" stroke="#06202a" stroke-width="13" stroke-linecap="round"/>' +
    '<path d="M4 26 C40 4 74 38 112 20 S182 2 220 22 S292 40 330 18 S396 6 420 20" fill="none" stroke="url(#twsn)" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M420 20 L436 14 L434 22 L436 28 Z" fill="#f6d56a" stroke="#06202a" stroke-width="2"/><circle cx="428" cy="19" r="1.8" fill="#d6382d"/></svg>';

  function floorHTML(i) {
    const f = st.floors[i], c = SK.Characters.get(f.opp);
    const done = i < st.index || (st.finished && i === st.index);
    const cur = i === st.index && !st.finished;
    const cls = (cur ? ' is-cur' : done ? ' is-done' : ' is-future') + (f.boss ? ' is-boss' : '');
    const plate = (i + 1) + ' · ' + (cur || done ? c.name : f.boss ? 'CHEFE' : '???');
    return '<div class="tw__floor' + cls + '" style="--theme:' + c.themeColor + '">' +
      '<div class="tw__balcony"></div>' +
      '<span class="tw__torch tw__torch--l"></span><span class="tw__torch tw__torch--r"></span>' +
<<<<<<< HEAD
      '<div class="tw__alcove"><img src="' + (c.sprites.portraitHi || c.sprites.portrait) + '" alt="">' +
=======
      '<div class="tw__alcove"><img src="' + c.sprites.portrait + '" alt="">' +
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
        (done ? '<span class="tw__x"></span><span class="tw__stamp">VENCIDO</span>' : '') +
        (cur ? '<span class="tw__spot"></span>' : '') + '</div>' +
      '<div class="tw__plate">' + SK.util.esc(plate) + '</div></div>';
  }

  function towerHTML() {
    let floors = '';
    for (let i = n - 1; i >= 0; i--) floors += floorHTML(i);
    const snakeTop = ROOF_H + (n - 1 - st.index) * FLOOR_H - 4;
    return '<div class="tw__tower" style="transform:translateY(' + offsetFor(st.shownIndex != null ? st.shownIndex : st.index) + 'px)">' +
      ROOF_SVG + floors + '<div class="tw__base"><i></i></div>' +
      (st.finished ? '' : '<div class="tw__snake-wrap" style="top:' + snakeTop + 'px">' + SNAKE_SVG + '</div>') +
      '</div>';
  }

  /* fundo: noite com neblina e outras torres ao longe */
  const BG_HTML = '<div class="tw__bg"><div class="tw__far tw__far--a"></div><div class="tw__far tw__far--b"></div><div class="tw__far tw__far--c"></div>' +
    '<div class="tw__fog tw__fog--1"></div><div class="tw__fog tw__fog--2"></div></div>';

  function go() {
    if (st.finished) { T.reset(); SK.Screens.go('towerMenu'); return; }
    SK.Screens.go('versus', T.fightParams());
  }
  function quit() { T.reset(); SK.Screens.go('towerMenu'); }

  return {
    render() {
      const mod = floor.mod;
      const sub = st.finished ? 'TORRE CONQUISTADA!' : 'ANDAR ' + (st.index + 1) + ' / ' + n + ' · DERROTAS ' + st.losses;
      const win = st.finished
        ? '<div class="tw__win panel abs"><div class="tw__win-t">TORRE CONQUISTADA!</div>' +
          '<div class="tw__win-s">' + SK.util.esc(player.name) + ' derrubou os ' + n + ' andares</div>' +
          '<div class="tw__win-s">DERROTAS: ' + st.losses + ' &nbsp;·&nbsp; TEMPO: ' + fmtTime((st.finishedAt || Date.now()) - st.startedAt) + '</div></div>' : '';
      const side = st.finished ? '' :
        '<div class="tw__opp panel abs"><div class="cs__side-label t-title t-p2">' + (floor.boss ? 'CHEFE FINAL' : 'ANDAR ' + (st.index + 1)) + '</div>' +
          '<div class="cs__side-sprite"><img src="' + opp.sprites.idle + '" alt=""' + SK.UI.flipStyle(opp, 'left') + '></div>' +
          '<div class="cs__side-name">' + SK.util.esc(opp.name) + '</div></div>' +
        '<div class="tw__mod panel abs' + (mod ? ' has-mod' : '') + '">' +
          (mod ? '<div class="tw__mod-n">' + SK.util.esc(mod.name) + '</div><div class="tw__mod-d">' + SK.util.esc(mod.desc) + '</div>'
               : '<div class="tw__mod-n tw__mod-n--none">SEM REGRAS ESPECIAIS</div><div class="tw__mod-d">Luta normal contra ' + SK.util.esc(opp.name) + ' em ' + SK.util.esc(stage.name) + '.</div>') + '</div>';
      return BG_HTML + SK.UI.embersHTML(12) +
        '<div class="back-btn btn panel abs" data-act="back">DESISTIR</div>' +
        '<div class="tw__title screen-title panel abs t-title">' + SK.util.esc(st.mode.name) + '</div>' +
        '<div class="tw__sub abs t-title">' + sub + '</div>' +
        '<div class="tw__me panel abs"><div class="cs__side-label t-title t-p1">P1</div>' +
          '<div class="cs__side-sprite"><img src="' + player.sprites.idle + '" alt=""' + SK.UI.flipStyle(player, 'right') + '></div>' +
          '<div class="cs__side-name">' + SK.util.esc(player.name) + '</div></div>' +
        '<div class="tw__view abs' + (st.finished ? ' is-dim' : '') + '">' + towerHTML() + '</div>' + win + side +
        '<div class="tw__go btn panel abs is-selected" data-act="go">' + (st.finished ? 'VOLTAR AO MENU' : '<kbd>ENTER</kbd><span>' + (floor.boss ? 'ENFRENTAR O CHEFE' : 'LUTAR!') + '</span>') + '</div>';
    },
    mount(el) {
      root = el;
      el.querySelector('[data-act="back"]').addEventListener('click', quit);
      el.querySelector('[data-act="go"]').addEventListener('click', go);
      /* subida da câmera: começa no andar que foi mostrado da última vez e sobe até o atual */
      if (st.shownIndex != null && st.shownIndex !== st.index) {
        const tower = el.querySelector('.tw__tower');
        climbTimer = setTimeout(() => { tower.classList.add('is-climb'); tower.style.transform = 'translateY(' + offsetFor(st.index) + 'px)'; }, 650);
      }
      st.shownIndex = st.index;
    },
    onKey(key) {
      if (key === 'confirm') { SK.Events.emit('ui:confirm'); go(); return true; }
      if (key === 'back') { SK.Events.emit('ui:back'); quit(); return true; }
      return false;
    },
    unmount() { clearTimeout(climbTimer); },
  };
});

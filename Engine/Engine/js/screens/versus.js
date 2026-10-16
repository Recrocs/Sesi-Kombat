/* TELA: Versus — apresentação da luta. Avança sozinha (SK.config.ui.versusAutoAdvanceMs) ou com ENTER. */
SK.Screens.register('versus', function (params) {
  const S = SK.Session;
  /* vindo da Torre, os parâmetros chegam prontos; senão, vêm da sessão dos menus */
  const P = params && params.p1 ? params : { p1: S.p1, p2: S.p2, stage: S.stage, mode: S.mode };
  const tower = !!P.tower;
  const c1 = SK.Characters.get(P.p1), c2 = SK.Characters.get(P.p2);
  const stage = SK.Stages.get(P.stage);
  const back = () => SK.Screens.go(tower ? 'tower' : 'stageSelect');
  let timer = null;

  function go() { SK.Screens.go('fight', Object.assign({}, P)); }

  return {
    render() {
      const n2 = P.mode === 'cpu' ? c2.name + ' (CPU)' : c2.name;
      const vs = SK.config.ui.vsImage ? '<img src="' + SK.config.ui.vsImage + '" alt="VS">' : 'VS';
      return '<div class="versus__bg" style="--theme-l:' + c1.themeColor + ';--theme-r:' + c2.themeColor + '">' +
          '<div class="versus__half versus__half--l"></div><div class="versus__half versus__half--r"></div></div>' +
        '<div class="back-btn btn panel abs" data-act="back">VOLTAR</div>' +
        '<div class="versus__title screen-title panel abs t-title">' + (tower ? (P.boss ? 'CHEFE FINAL' : 'ANDAR ' + P.floorNumber + ' / ' + P.floorTotal) : SK.util.esc(SK.config.title)) + '</div>' +
        (tower && P.modName ? '<div class="versus__rule abs"><span>REGRA: ' + SK.util.esc(P.modName) + '</span></div>' : '') +
        '<div class="versus__card versus__card--l panel abs" style="--theme:' + c1.themeColor + '"><img src="' + (c1.sprites.portraitHi || c1.sprites.portrait) + '" alt=""></div>' +
        '<div class="versus__card versus__card--r panel abs" style="--theme:' + c2.themeColor + '"><img src="' + (c2.sprites.portraitHi || c2.sprites.portrait) + '" alt=""></div>' +
        '<div class="versus__name versus__name--l panel btn abs t-title">' + SK.util.esc(c1.name) + '</div>' +
        '<div class="versus__name versus__name--r panel btn abs t-title">' + SK.util.esc(n2) + '</div>' +
        '<div class="versus__vs abs">' + vs + '</div>' +
        '<div class="versus__fight abs t-title">FIGHT!</div>' +
        '<div class="versus__stage panel btn abs t-title">' + SK.util.esc(stage.name) + '</div>' +
        '<div class="versus__hint abs t-title">ENTER AVANÇAR</div>';
    },
    mount(el) {
      el.querySelector('[data-act="back"]').addEventListener('click', back);
      const ms = SK.config.ui.versusAutoAdvanceMs;
      if (ms > 0) timer = setTimeout(go, ms);
      el.addEventListener('dblclick', go);
    },
    onKey(key) {
      if (key === 'confirm') { go(); return true; }
      if (key === 'back') { back(); return true; }
      return false;
    },
    unmount() { clearTimeout(timer); },
  };
});

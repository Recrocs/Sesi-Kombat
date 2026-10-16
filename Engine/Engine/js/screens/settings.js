/* TELA: Configurações
   Para adicionar uma opção: coloque o padrão em js/core/settings.js e uma linha em ROWS. */
SK.Screens.register('settings', function () {
  const S = SK.Settings;
  const onOff = (v) => (v ? 'LIGADO' : 'DESLIGADO');

  const ROWS = [
    { key: 'scanlines',         label: 'Efeito CRT (scanlines)',        options: [true, false],            fmt: onOff },
    { key: 'colorGrade',        label: 'Correção de cor',               options: ['soft', 'normal', 'vivid'], fmt: (v) => ({ soft: 'SUAVE', normal: 'NORMAL', vivid: 'VIVA' }[v]) },
    { key: 'animations',        label: 'Animações de menu',             options: [true, false],            fmt: onOff },
    { key: 'fightControlsHint', label: 'Legenda de controles na luta',  options: [true, false],            fmt: onOff },
    { key: 'roundTime',         label: 'Tempo do round',                options: [30, 45, 60, 90, 99],     fmt: (v) => v + 's' },
    { key: 'roundsToWin',       label: 'Rounds para vencer',            options: [1, 2, 3],                fmt: (v) => v },
    { key: 'cpuLevel',          label: 'Dificuldade da CPU',            options: ['easy', 'normal', 'hard'], fmt: (v) => ({ easy: 'FÁCIL', normal: 'NORMAL', hard: 'DIFÍCIL' }[v]) },
    { key: 'volumeMaster',      label: 'Volume geral',                  options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], fmt: (v) => v + '%' },
    { key: 'volumeMusic',       label: 'Volume da música',              options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], fmt: (v) => v + '%' },
    { key: 'volumeSfx',         label: 'Volume dos efeitos',            options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], fmt: (v) => v + '%' },
    { action: 'fullscreen',     label: 'Tela cheia',                    text: 'ALTERNAR' },
    { action: 'reset',          label: 'Restaurar padrões',             text: 'RESTAURAR' },
  ];

  let nav = null, root = null;

  function valueText(row) { return row.action ? row.text : String(row.fmt(S.get(row.key))); }

  function refreshRow(i) { root.querySelectorAll('.set__val')[i].textContent = valueText(ROWS[i]); }

  function change(i, dir) {
    const row = ROWS[i];
    if (row.action) { if (dir > 0) run(row); return; }
    const cur = row.options.indexOf(S.get(row.key));
    const next = (cur + dir + row.options.length) % row.options.length;
    S.set(row.key, row.options[next]);
    refreshRow(i);
  }

  function run(row) {
    if (row.action === 'fullscreen') SK.toggleFullscreen();
    if (row.action === 'reset') { S.reset(); ROWS.forEach((r, k) => refreshRow(k)); SK.UI.toast('Padrões restaurados'); }
  }

  return {
    render() {
      const rows = ROWS.map((r, i) => '<div class="set__row btn panel" style="--i:' + i + '"><span>' + r.label + '</span><span class="set__val"></span></div>').join('');
      return '<div class="menu-bg"></div>' +
        '<div class="back-btn btn panel abs" data-act="back">VOLTAR</div>' +
        '<div class="set__title screen-title panel abs t-title">CONFIGURAÇÕES</div>' +
        '<div class="set__list abs">' + rows + '</div>' +
        '<div class="set__foot abs t-title">← → ALTERAM &nbsp; ENTER CONFIRMA &nbsp; ESC VOLTA</div>';
    },
    mount(el) {
      root = el;
      el.querySelector('[data-act="back"]').addEventListener('click', () => SK.Screens.go('title'));
      ROWS.forEach((r, i) => refreshRow(i));
      nav = new SK.UI.NavList(Array.from(el.querySelectorAll('.set__row')), { wrap: true, onActivate: (i) => change(i, 1) });
    },
    onKey(key) {
      if (key === 'back') { SK.Events.emit('ui:back'); SK.Screens.go('title'); return true; }
      if (key === 'left')  { change(nav.index, -1); return true; }
      if (key === 'right') { change(nav.index, 1); return true; }
      return nav.handle(key);
    },
    unmount() { nav && nav.destroy(); },
  };
});

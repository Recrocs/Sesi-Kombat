/* ==========================================================================
   INPUT — teclado + controle (Gamepad API).
   Dois usos:
     1) Menus: `nav(e)` traduz uma tecla em 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | 'tab'
     2) Luta:  `isDown(jogador, ação)` e `wasPressed(jogador, ação)`, lendo SK.config.controls

   O controle (Xbox/standard) é lido por `poll()` a cada frame e alimenta as MESMAS
   funções (isDown/wasPressed e a navegação dos menus): teclado, mouse e controle
   funcionam juntos. A luta continua só conhecendo "intenções" (js/game/controllers.js).
   ========================================================================== */
(function () {
  'use strict';
  const down = new Set();
  const justPressed = new Set();

  const norm = (e) => (e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key);

  const NAV = {
    ArrowUp: 'up', w: 'up',
    ArrowDown: 'down', s: 'down',
    ArrowLeft: 'left', a: 'left',
    ArrowRight: 'right', d: 'right',
    Enter: 'confirm', ' ': 'confirm',
    Escape: 'back', Backspace: 'back',
    Tab: 'tab',
  };

  function boundKeys() {
    const set = new Set([SK.config.controls.pause]);
    ['p1', 'p2'].forEach((p) => Object.values(SK.config.controls[p]).forEach((k) => set.add(k)));
    return set;
  }
  let bound = null;

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = norm(e);
    if (!bound) bound = boundKeys();
    if (bound.has(k) || NAV[k]) e.preventDefault();       // evita rolar a página, etc.
    if (!down.has(k)) { down.add(k); justPressed.add(k); }
  });
  window.addEventListener('keyup', (e) => down.delete(norm(e)));
  window.addEventListener('blur', () => { down.clear(); justPressed.clear(); });

  /* ==========================================================================
     GAMEPAD — controles estilo Xbox (Gamepad API). Convive com o teclado:
     isDown/wasPressed (luta) e a navegação dos menus aceitam as duas fontes.

     Mapeamento (controle com mapping === 'standard'):
       Luta     analógico esq. / direcional = mover · A = pular · direcional/analógico ↓ = abaixar
                X = GOLPE · Y = LANÇAR · RB / RT = ESPECIAL · B / LB / LT = DEFESA · Start = pausar
       Menus    direcional / analógico = navegar · A = confirmar · B = voltar
                Y / Select(View) = alternar modo (TAB) · Start = confirmar (na luta: pausar)

     Jogadores: o 1º controle conectado controla o P1 e o 2º controla o P2. Qualquer
     controle navega nos menus. Controles sem mapping 'standard' usam um layout
     de contingência (eixos 0/1 e botões 0–5 na ordem A B X Y LB RB) e avisam o jogador.
     ========================================================================== */
  const GP = {
    deadzone: 0.25,                 // abaixo disso o analógico é ignorado (zona morta radial)
    on: 0.5, off: 0.35,             // histerese: liga em 0.5, só desliga abaixo de 0.35
    navDelay: 380, navRepeat: 130,  // repetição ao segurar uma direção nos menus (ms)
  };
  const STD = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, back: 8, start: 9, up: 12, down: 13, left: 14, right: 15 };
  const FIGHT_MAP = {                // ação da luta → botões lógicos do controle
    left: ['left'], right: ['right'], up: ['up', 'a'], down: ['down'],
    attack: ['x'], projectile: ['y'], special: ['rb', 'rt'], block: ['b', 'lb', 'lt'],
  };
  const ACTIONS = Object.keys(FIGHT_MAP);

  const pads = new Map();            // índice do gamepad → estado
  const slots = [null, null];        // [índice do controle do P1, do P2]
  const padDown = [new Set(), new Set()];
  const padJust = [new Set(), new Set()];
  const slotOf = (idx) => slots.indexOf(idx);

  function attach(gp) {
    let st = pads.get(gp.index);
    if (st) return st;
    st = { index: gp.index, id: gp.id, std: gp.mapping === 'standard', held: new Set(), prev: new Set(), navDir: null, navAt: 0 };
    pads.set(gp.index, st);
    const free = slots.indexOf(null);
    if (free >= 0) slots[free] = gp.index;
    if (!st.std) console.warn('[SK.Input] Controle sem mapping "standard" (' + gp.id + '): usando layout de contingência.');
    return st;
  }

  function detach(index) {
    if (!pads.has(index)) return;
    pads.delete(index);
    const s = slotOf(index);
    if (s >= 0) slots[s] = null;
  }

  function note(msg) { if (SK.UI && SK.UI.toast) SK.UI.toast(msg, 2200, true); }

  window.addEventListener('gamepadconnected', (e) => {
    const st = attach(e.gamepad);
    const s = slotOf(st.index);
    note('CONTROLE CONECTADO · ' + (s >= 0 ? 'P' + (s + 1) : 'SÓ MENUS') + (st.std ? '' : ' · LAYOUT NÃO PADRÃO'));
    SK.Events && SK.Events.emit('gamepad:connect', { index: st.index, player: s });
  });
  window.addEventListener('gamepaddisconnected', (e) => {
    const s = slotOf(e.gamepad.index);
    detach(e.gamepad.index);
    note('CONTROLE DESCONECTADO' + (s >= 0 ? ' · P' + (s + 1) : ''));
    SK.Events && SK.Events.emit('gamepad:disconnect', { index: e.gamepad.index, player: s });
  });

  /* lê um gamepad e devolve { held: Set de botões lógicos, nav: direção única p/ menus } */
  function readPad(gp, st) {
    const held = new Set();
    const btn = (i) => { const b = gp.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
    ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'back', 'start'].forEach((n) => { if (btn(STD[n])) held.add(n); });
    const dpad = {};
    ['up', 'down', 'left', 'right'].forEach((n) => { dpad[n] = btn(STD[n]); });

    let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    const mag = Math.hypot(ax, ay);
    if (mag < GP.deadzone) { ax = 0; ay = 0; }
    const thr = (n) => (st.held.has(n) ? GP.off : GP.on);
    if (dpad.left  || ax < -thr('left'))  held.add('left');
    if (dpad.right || ax >  thr('right')) held.add('right');
    if (dpad.up    || ay < -thr('up'))    held.add('up');
    if (dpad.down  || ay >  thr('down'))  held.add('down');
    if (held.has('left') && held.has('right')) { held.delete('left'); held.delete('right'); }
    if (held.has('up') && held.has('down')) { held.delete('up'); held.delete('down'); }

    /* direção única para menus: direcional tem prioridade; no analógico vale o eixo dominante */
    let nav = null;
    const dp = ['up', 'down', 'left', 'right'].find((n) => dpad[n]);
    if (dp) nav = dp;
    else if (mag >= (st.navDir ? GP.off : GP.on)) nav = Math.abs(ax) >= Math.abs(ay) ? (ax < 0 ? 'left' : 'right') : (ay < 0 ? 'up' : 'down');
    return { held, nav };
  }

  function emitNav(nav, st, button) {
    if (!SK.Screens || !SK.Screens.dispatchNav) return false;
    const before = SK.Screens.current;
    SK.Screens.dispatchNav(nav, { source: 'gamepad', button, pad: st.index, preventDefault() {} });
    return SK.Screens.current !== before;        // trocou de tela: descarta o resto do frame
  }

  /* chamado pelo loop principal uma vez por frame, ANTES de atualizar a tela */
  function poll(now) {
    if (!navigator.getGamepads) return;
    const list = navigator.getGamepads();
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const gp = list[i];
      if (!gp || !gp.connected) continue;
      seen.add(gp.index);
      attach(gp);                                // cobre navegadores que não disparam o evento
    }
    Array.from(pads.keys()).forEach((idx) => { if (!seen.has(idx)) detach(idx); });

    let switched = false;
    pads.forEach((st) => {
      const gp = list[st.index];
      if (!gp) return;
      const r = readPad(gp, st);
      st.prev = st.held; st.held = r.held;
      if (switched) { st.navDir = r.nav; return; }

      /* botões de navegação: um evento por pressionamento (sem repetição) */
      const fight = SK.Screens && SK.Screens.currentId === 'fight';
      const edge = (n) => st.held.has(n) && !st.prev.has(n);
      const out = [];
      if (edge('a')) out.push(['confirm', 'a']);
      if (edge('b')) out.push(['back', 'b']);
      if (edge('start')) out.push([fight ? 'back' : 'confirm', 'start']);
      if (edge('y')) out.push(['tab', 'y']);
      if (edge('back')) out.push(['tab', 'back']);

      /* direções: dispara ao inclinar e repete se segurar */
      if (r.nav && r.nav !== st.navDir) { out.push([r.nav, 'dir']); st.navAt = now + GP.navDelay; }
      else if (r.nav && now >= st.navAt) { out.push([r.nav, 'dir']); st.navAt = now + GP.navRepeat; }
      st.navDir = r.nav;

      for (const [nav, button] of out) { if (emitNav(nav, st, button)) { switched = true; break; } }
    });

    /* estado da luta por jogador (isDown / wasPressed) */
    [0, 1].forEach((p) => {
      const st = pads.get(slots[p]);
      const now_ = new Set(), prev_ = new Set();
      if (st) {
        ACTIONS.forEach((act) => {
          if (FIGHT_MAP[act].some((n) => st.held.has(n))) now_.add(act);
          if (FIGHT_MAP[act].some((n) => st.prev.has(n))) prev_.add(act);
        });
      }
      padDown[p] = now_;
      padJust[p] = new Set(Array.from(now_).filter((a) => !prev_.has(a)));
    });
  }

  SK.Input = {
    nav: (e) => NAV[norm(e)] || null,
    key: norm,
    keyOf: (player, action) => SK.config.controls['p' + (player + 1)][action],
    isDown: (player, action) => down.has(SK.Input.keyOf(player, action)) || (!!padDown[player] && padDown[player].has(action)),
    wasPressed: (player, action) => justPressed.has(SK.Input.keyOf(player, action)) || (!!padJust[player] && padJust[player].has(action)),
    /* chamado pelo loop principal ao fim de cada frame */
    endFrame() { justPressed.clear(); padJust[0].clear(); padJust[1].clear(); },
    /* lê os controles (chamado pelo loop principal antes de atualizar a tela) */
    poll,
    /* quantos controles estão conectados e quem controla o quê */
    gamepads: () => ({ count: pads.size, p1: slots[0], p2: slots[1] }),
    /* texto amigável para exibir uma tecla */
    label(key) {
      const map = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'ESC', Enter: 'ENTER', ' ': 'ESPAÇO' };
      return map[key] || String(key).toUpperCase();
    },
  };
})();

/* ==========================================================================
   INPUT — teclado.
   Dois usos:
     1) Menus: `nav(e)` traduz uma tecla em 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | 'tab'
     2) Luta:  `isDown(jogador, ação)` e `wasPressed(jogador, ação)`, lendo SK.config.controls

   Para suportar joystick/touch no futuro, crie um novo "controller"
   (veja js/game/controllers.js) — a luta só conhece "intenções", não teclas.
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

  SK.Input = {
    nav: (e) => NAV[norm(e)] || null,
    key: norm,
    keyOf: (player, action) => SK.config.controls['p' + (player + 1)][action],
    isDown: (player, action) => down.has(SK.Input.keyOf(player, action)),
    wasPressed: (player, action) => justPressed.has(SK.Input.keyOf(player, action)),
    /* chamado pelo loop principal ao fim de cada frame */
    endFrame() { justPressed.clear(); },
    /* texto amigável para exibir uma tecla */
    label(key) {
      const map = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'ESC', Enter: 'ENTER', ' ': 'ESPAÇO' };
      return map[key] || String(key).toUpperCase();
    },
  };
})();

/* ==========================================================================
   SCREENS — gerenciador de telas.

   Para criar uma tela nova:
     SK.Screens.register('minhaTela', (params) => ({
       render()        { return '<div>html da tela</div>'; },
       mount(el)       { ...liga eventos, cria NavList... },
       onKey(nav, e)   { ...retorne true se consumiu a tecla... },
       update(dt)      { ...opcional, roda todo frame (dt em segundos)... },
       unmount()       { ...limpeza... },
     }));
   e navegue com  SK.Screens.go('minhaTela', { qualquerParametro: 1 }).
   ========================================================================== */
(function () {
  'use strict';
  const registry = new Map();
  let current = null, currentId = null;
  let rootEl = null, gameEl = null;

  function fitToWindow() {
    const W = SK.config.width, H = SK.config.height;
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    const x = (window.innerWidth - W * s) / 2;
    const y = (window.innerHeight - H * s) / 2;
    gameEl.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }

  /* entrega uma intenção de menu ('up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | 'tab') à tela atual */
  function dispatchNav(nav, e) {
    if (!nav || !current || !current.onKey) return;
    current.onKey(nav, e);
  }

  SK.Screens = {
    dispatchNav,
    register(id, factory) { registry.set(id, factory); },
    get current() { return current; },
    get currentId() { return currentId; },

    init() {
      gameEl = document.getElementById('game');
      rootEl = document.getElementById('screen-root');
      const bg = SK.config.ui.menuBackground;
      /* URL absoluta: dentro de variáveis CSS o caminho seria resolvido a partir de css/ */
      if (bg) gameEl.style.setProperty('--menu-bg', 'url("' + new URL(bg, document.baseURI).href + '")');
      fitToWindow();
      window.addEventListener('resize', fitToWindow);

      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const nav = SK.Input.nav(e);
        if (!nav || !current || !current.onKey) return;
        if (e.repeat && (nav === 'confirm' || nav === 'back' || nav === 'tab')) return;
        dispatchNav(nav, e);
      });
    },

    go(id, params) {
      const factory = registry.get(id);
      if (!factory) { console.error('[SK.Screens] tela inexistente:', id); return; }

      const prev = current;
      const next = factory(params || {});
      const el = document.createElement('section');
      el.className = 'screen screen--' + id;
      el.innerHTML = next.render ? next.render() : '';
      next.el = el;
      rootEl.appendChild(el);

      if (prev) {
        if (prev.unmount) prev.unmount();
        const old = prev.el;
        old.classList.remove('is-active');
        setTimeout(() => old.remove(), 220);
      }

      current = next; currentId = id;
      if (next.mount) next.mount(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-active')));
      /* depois que as animações de ENTRADA terminam, a tela fica "settled" (veja css/ui-fx.css) */
      setTimeout(() => el.classList.add('is-settled'), SK.config.ui.settleMs || 2600);
      SK.Events.emit('screen:enter', { id, params });
    },

    update(dt) { if (current && current.update) current.update(dt); },
  };
})();

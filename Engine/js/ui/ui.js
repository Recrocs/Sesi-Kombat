/* ==========================================================================
   UI — componentes de interface reutilizáveis.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- NavList: cursor de menu (lista ou grade) com teclado + mouse -------- */
  class NavList {
    /**
     * @param {HTMLElement[]} items   elementos navegáveis, na ordem
     * @param {object} opts  columns, wrap, cls (classe do cursor), onChange(i), onActivate(i)
     */
    constructor(items, opts = {}) {
      this.items = items;
      this.columns = opts.columns || 1;
      this.wrap = opts.wrap !== false;
      this.cls = opts.cls || 'is-selected';
      this.onChange = opts.onChange || (() => {});
      this.onActivate = opts.onActivate || (() => {});
      this.index = opts.start || 0;
      this._cleanup = [];

      items.forEach((el, i) => {
        const enter = () => { if (this.index !== i) this.select(i); };
        const click = () => { this.select(i, true); this.activate(); };
        el.addEventListener('mouseenter', enter);
        el.addEventListener('click', click);
        this._cleanup.push(() => { el.removeEventListener('mouseenter', enter); el.removeEventListener('click', click); });
      });
      this.select(this.index, true, true);
    }

    select(i, silent = false, initial = false) {
      this.items.forEach((el, k) => el.classList.toggle(this.cls, k === i));
      const changed = i !== this.index || initial;
      this.index = i;
      if (changed) {
        if (!silent) SK.Events.emit('ui:move');
        this.onChange(i, this.items[i]);
      }
    }

    move(dir) {
      const n = this.items.length, c = this.columns, i = this.index;
      const row = Math.floor(i / c), col = i % c;
      let next = i;
      if (dir === 'left')  next = col > 0 ? i - 1 : (this.wrap ? Math.min(row * c + c - 1, n - 1) : i);
      if (dir === 'right') next = (col < c - 1 && i + 1 < n) ? i + 1 : (this.wrap ? row * c : i);
      if (dir === 'up') {
        if (row > 0) next = i - c;
        else if (this.wrap) { next = Math.floor((n - 1) / c) * c + col; if (next >= n) next -= c; }
      }
      if (dir === 'down') {
        if (i + c < n) next = i + c;
        else if (this.wrap) next = col;
      }
      if (next !== i) this.select(next);
    }

    activate() { SK.Events.emit('ui:confirm'); this.onActivate(this.index, this.items[this.index]); }

    /* devolve true se a tecla foi consumida */
    handle(nav) {
      if (nav === 'up' || nav === 'down' || nav === 'left' || nav === 'right') { this.move(nav); return true; }
      if (nav === 'confirm') { this.activate(); return true; }
      return false;
    }

    destroy() { this._cleanup.forEach((f) => f()); this._cleanup = []; }
  }

  /* ---- Toast ---------------------------------------------------------------- */
  function toast(msg, ms = 1800, silent = false) {
    const root = document.getElementById('overlay-root');
    const el = document.createElement('div');
    el.className = 'toast panel panel--plain t-title';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => el.remove(), ms);
    if (!silent) SK.Events.emit('ui:error');
  }

  /* ---- Bloco de controles (seleção de personagem) --------------------------------- */
  function controlsHTML(p) {
    const c = SK.config.controls['p' + (p + 1)];
    const L = SK.config.actionLabels;
    const K = SK.Input.label;
    const move = [c.up, c.left, c.down, c.right].map(K).join(' ');
    const keys = SK.config.actionOrder.map((a) => '<div><b>' + K(c[a]) + '</b><span>' + L[a] + '</span></div>').join('');
    return '<div class="ctl__title ctl__title--p' + (p + 1) + '">P' + (p + 1) + ' · ' + move + '</div>' +
           '<div class="ctl__sub">MOVER · PULAR · ABAIXAR</div>' +
           '<div class="ctl__keys">' + keys + '</div>';
  }

  /* ---- Fita de teclas compacta (HUD da luta) ----------------------------------------- */
  function controlsLineHTML(p) {
    const c = SK.config.controls['p' + (p + 1)];
    const L = SK.config.actionLabels;
    const K = SK.Input.label;
    const move = [c.up, c.left, c.down, c.right].map(K).join('');
    const a = SK.config.actionOrder.map((k) => K(c[k]) + ' · ' + L[k]);
    return '<div><b>P' + (p + 1) + ' ' + move + ' · MOVER</b> ' + a.slice(0, 2).join(' &nbsp; ') + '</div>' +
           '<div>' + a.slice(2).join(' &nbsp; ') + ' &nbsp; ' + SK.Input.label(SK.config.controls.pause) + ' · PAUSAR</div>';
  }

  /* Nome do personagem para exibição */
  const charName = (c) => (c ? c.name : '???');

  SK.UI = { NavList, toast, controlsHTML, controlsLineHTML, charName };
})();

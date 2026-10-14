/* TELA: Título — menu principal. Os botões vêm de SK.config.menu. */
SK.Screens.register('title', function () {
  let nav = null;
  const items = SK.config.menu;

  function pickFighters() {
    const ids = SK.Characters.ids();
    const fixed = SK.config.ui.titleFighters;
    if (fixed && fixed.length >= 2) return fixed.map((id) => SK.Characters.get(id)).filter(Boolean);
    const a = SK.util.pick(ids);
    const b = SK.util.pick(ids.filter((i) => i !== a).length ? ids.filter((i) => i !== a) : ids);
    return [SK.Characters.get(a), SK.Characters.get(b)];
  }

  return {
    render() {
      const variant = SK.config.ui.titleVariant || 'lineup';
      const [l, r] = pickFighters();
      const buttons = items.map((it, i) =>
        '<div class="title__btn btn panel' + (it.size === 'lg' ? ' title__btn--lg' : '') + (it.enabled === false ? ' is-disabled' : '') + '" data-i="' + i + '">' +
          SK.util.esc(it.label) + (it.badge ? '<span class="btn__badge">' + SK.util.esc(it.badge) + '</span>' : '') +
        '</div>').join('');
      let fighters;
      if (variant === 'lineup') {
        // todos os lutadores, metade de cada lado, virados para o centro
        const all = SK.Characters.ids().map((id) => SK.Characters.get(id));
        const half = Math.ceil(all.length / 2);
        const side = (arr, dir, cls) => arr.map((c, k) =>
          '<div class="lu lu--' + cls + ' lu--r' + (k % 2) + '" style="--k:' + k + '"><img src="' + c.sprites.idle + '" alt=""' + SK.UI.flipStyle(c, dir) + '></div>').join('');
        fighters = '<div class="lu-wrap lu-wrap--l">' + side(all.slice(0, half), 'right', 'l') + '</div>' +
          '<div class="lu-wrap lu-wrap--r">' + side(all.slice(half).reverse(), 'left', 'r') + '</div>' +
          '<div class="lu-spot lu-spot--l"></div><div class="lu-spot lu-spot--r"></div>';
      } else {
        fighters = '<div class="title__fighter title__fighter--l"><img src="' + l.sprites.idle + '" alt=""' + SK.UI.flipStyle(l, 'right') + '></div>' +
          '<div class="title__fighter title__fighter--r"><img src="' + r.sprites.idle + '" alt=""' + SK.UI.flipStyle(r, 'left') + '></div>';
      }
      return '<div class="menu-bg menu-bg--title"></div><div class="title__rays"></div>' + SK.UI.embersHTML(18) +
        SK.UI.logoHTML() + fighters +
        '<div class="title__menu abs">' + buttons + '</div>' +
        '<div class="title__credits abs t-title">' + SK.util.esc(SK.config.credits) + '</div>' +
        '<div class="title__version abs">v' + SK.version + '</div>';
    },
    mount(root) {
      root.classList.add('title--' + (SK.config.ui.titleVariant || 'lineup'));
      const els = Array.from(root.querySelectorAll('.title__btn'));
      const first = Math.max(0, items.findIndex((it) => it.enabled !== false));
      nav = new SK.UI.NavList(els, {
        columns: 2, start: first,
        onActivate(i) {
          const it = items[i];
          if (it.enabled === false) { SK.UI.toast('Em breve!'); return; }
          if (it.id === 'fight') { SK.Session.p1 = SK.Session.p2 = null; }
          if (it.screen) SK.Screens.go(it.screen);
        },
      });
    },
    onKey(key) { return nav.handle(key); },
    unmount() { nav && nav.destroy(); },
  };
});

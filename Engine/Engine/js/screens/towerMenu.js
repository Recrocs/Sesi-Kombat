/* TELA: Menu do CIRCUITO — escolhe o modo de torre.
   Os cartões vêm de SK.TowerData.modes (js/content/tower.js); as casas que sobram viram "EM BREVE". */
SK.Screens.register('towerMenu', function () {
  const D = SK.TowerData;
  const modes = D.modes;
  const slots = Math.max(D.modeSlots || 3, modes.length);
  let nav = null, root = null;

  const ICONS = ['★', '☠', '?'];

  function card(i) {
    const m = modes[i];
    if (!m) {
      return '<div class="tm__card tm__card--locked panel" style="--i:' + i + '"><div class="tm__icon">?</div><div class="tm__name">???</div>' +
        '<div class="tm__tag">NOVOS MODOS</div><div class="tape"><span>EM BREVE</span></div></div>';
    }
    return '<div class="tm__card panel" style="--i:' + i + '"><div class="tm__icon">' + (ICONS[i] || '★') + '</div>' +
      '<div class="tm__name">' + SK.util.esc(m.name) + '</div><div class="tm__tag">' + SK.util.esc(m.tagline || '') + '</div>' +
      '<div class="tm__desc">' + SK.util.esc(m.desc) + '</div>' +
      '<div class="tm__chips">' + [(SK.Characters.all().length - 1) + ' ANDARES', 'CHEFE FINAL', m.modifiers === 'random' ? 'REGRAS MALUCAS' : 'SEM REGRAS'].map((t) => '<span>' + t + '</span>').join('') + '</div></div>';
  }

  function go(i) {
    const m = modes[i];
    if (!m) { SK.UI.toast('Modo em breve!'); return; }
    SK.Session.tower = m.id;
    SK.Session.p1 = SK.Session.p2 = null;
    SK.Screens.go('characterSelect', { tower: m.id });
  }

  return {
    render() {
      let cards = '';
      for (let i = 0; i < slots; i++) cards += card(i);
      return '<div class="menu-bg"></div>' + SK.UI.embersHTML(10) +
        '<div class="back-btn btn panel abs" data-act="back">VOLTAR</div>' +
        '<div class="tm__title screen-title panel abs t-title">CIRCUITO</div>' +
        '<div class="tm__sub abs t-title">ESCOLHA O SEU DESAFIO</div>' +
        '<div class="tm__grid abs" style="--cols:' + slots + '">' + cards + '</div>' +
        '<div class="tm__hint abs t-title">← → ESCOLHER &nbsp;&nbsp; ENTER CONFIRMAR &nbsp;&nbsp; ESC VOLTAR</div>';
    },
    mount(el) {
      root = el;
      el.querySelector('[data-act="back"]').addEventListener('click', () => SK.Screens.go('title'));
      nav = new SK.UI.NavList(Array.from(el.querySelectorAll('.tm__card')), { columns: slots, cls: 'is-cursor', onActivate: go });
    },
    onKey(key) {
      if (key === 'back') { SK.Events.emit('ui:back'); SK.Screens.go('title'); return true; }
      return nav.handle(key);
    },
    unmount() { nav && nav.destroy(); },
  };
});

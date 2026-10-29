/* TELA: Seleção de cenário
   A lista tem SK.config.ui.stageSlots itens; os que sobram viram "?????". */
SK.Screens.register('stageSelect', function () {
  const S = SK.Session;
  const stages = SK.Stages.all();
  const slots = Math.max(SK.config.ui.stageSlots, stages.length);
  let nav = null, root = null;

  const $ = (sel) => root.querySelector(sel);
  const p1 = SK.Characters.get(S.p1), p2 = SK.Characters.get(S.p2);

  function preview(i) {
    const st = stages[i];
    const shot = $('.ss__shot');
    if (st) {
      shot.innerHTML = '<img src="' + (st.thumb || st.background) + '" alt="">';
      $('.ss__name').textContent = st.name;
      $('.ss__sub').textContent = st.subtitle || '';
    } else {
      shot.innerHTML = '<div class="ss__shot-q">?</div>';
      $('.ss__name').textContent = '?????';
      $('.ss__sub').textContent = 'CENÁRIO EM BREVE';
    }
    const go = $('.ss__go');
    go.classList.toggle('is-disabled', !st);
    go.classList.toggle('is-selected', !!st);
  }

  function start() {
    const st = stages[nav.index];
    if (!st) { SK.UI.toast('Cenário em breve!'); return; }
    S.stage = st.id;
    SK.Screens.go('versus');
  }

  return {
    render() {
      let list = '';
      for (let i = 0; i < slots; i++) {
        const st = stages[i];
        list += '<div class="ss__item btn panel' + (st ? '' : ' is-disabled') + '" style="--i:' + i + '">' + (st ? SK.util.esc(st.name) : '?????') + '</div>';
      }
      return '<div class="menu-bg"></div>' +
        '<div class="back-btn btn panel abs" data-act="back">VOLTAR</div>' +
        '<div class="ss__title screen-title panel abs t-title">ESCOLHA O CENÁRIO</div>' +
        '<div class="ss__crumbs abs t-title">PERSONAGEM &gt; <b>CENÁRIO</b> &gt; LUTA</div>' +
        '<div class="ss__preview panel abs"><div class="ss__shot"></div></div>' +
        '<div class="ss__label panel abs btn t-title">PRÉVIA DO CENÁRIO</div>' +
        '<div class="ss__name panel abs btn t-title"></div>' +
        '<div class="ss__sub abs t-title"></div>' +
        '<div class="ss__list abs">' + list + '</div>' +
        '<div class="ss__go btn panel abs"><kbd>ENTER</kbd><span>COMEÇAR A TRETA</span></div>' +
        '<div class="ss__hint abs t-title">SETAS / A D ESCOLHER &nbsp;&nbsp; ESC VOLTAR</div>';
    },
    mount(el) {
      root = el;
      el.querySelector('[data-act="back"]').addEventListener('click', () => SK.Screens.go('characterSelect'));
      el.querySelector('.ss__go').addEventListener('click', start);
      const items = Array.from(el.querySelectorAll('.ss__item'));
      const startIdx = Math.max(0, stages.findIndex((s) => s.id === S.stage));
      /* mantém o cenário selecionado sempre visível dentro da lista que rola */
      const reveal = (i) => { const it = items[i], list = it && it.parentElement; if (!list) return;
        const top = it.offsetTop - 4, bottom = it.offsetTop + it.offsetHeight + 4;
        if (top < list.scrollTop) list.scrollTop = top; else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight; };
      nav = new SK.UI.NavList(items, {
        start: startIdx,
        onChange: (i) => { if (root) { preview(i); reveal(i); } },
        onActivate: () => start(),
      });
      preview(nav.index);
      reveal(nav.index);
    },
    onKey(key) {
      if (key === 'back') { SK.Events.emit('ui:back'); SK.Screens.go('characterSelect'); return true; }
      /* esquerda/direita também navegam na lista (como no hint da tela) */
      if (key === 'left') return nav.handle('up');
      if (key === 'right') return nav.handle('down');
      return nav.handle(key);
    },
    unmount() { nav && nav.destroy(); },
  };
});

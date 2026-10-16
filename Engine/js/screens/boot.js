/* TELA: Boot — pré-carrega as imagens e espera o 1º clique/tecla
   (necessário para o navegador liberar o áudio no futuro). */
SK.Screens.register('boot', function () {
  let ready = false, el = null;

  function proceed() { if (ready) SK.Screens.go('title'); }

  return {
    render() {
      return '<div class="menu-bg menu-bg--title"></div><div class="title__rays"></div>' + SK.UI.embersHTML(14) + SK.UI.logoHTML() +
        '<div class="boot__bar panel panel--plain abs"><div class="bar"><i class="bar__fill" style="width:0%"></i></div></div>' +
        '<div class="boot__text abs t-title">CARREGANDO...</div>';
    },
    mount(root) {
      el = root;
      const fill = root.querySelector('.bar__fill');
      const text = root.querySelector('.boot__text');
      SK.Assets.preload((done, total) => { fill.style.width = (total ? (done / total) * 100 : 100) + '%'; }).then(() => {
        ready = true;
        text.textContent = 'PRESSIONE ENTER OU CLIQUE';
        text.classList.add('blink');
      });
      root.addEventListener('click', proceed);
    },
    onKey(nav) { if (nav === 'confirm') { proceed(); return true; } return false; },
  };
});

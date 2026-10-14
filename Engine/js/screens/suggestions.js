/* TELA: Sugestões — aponta para SK.config.suggestionsUrl (Google Forms, e-mail, etc.). */
SK.Screens.register('suggestions', function () {
  function open() {
    const url = SK.config.suggestionsUrl;
    if (!url) { SK.UI.toast('Canal de sugestões em breve!'); return; }
    window.open(url, '_blank', 'noopener');
  }
  return {
    render() {
      return '<div class="menu-bg"></div>' +
        '<div class="back-btn btn panel abs" data-act="back">VOLTAR</div>' +
        '<div class="sug__title screen-title panel abs t-title">SUGESTÕES</div>' +
        '<div class="sug__box panel abs"><h3 class="t-title">AJUDE A MELHORAR O JOGO</h3>' +
          '<p>Teve uma ideia de personagem, cenário, golpe ou melhoria?</p>' +
          '<p>Mande sua sugestão para a equipe do Senai Kombat.</p></div>' +
        '<div class="sug__go btn panel abs is-selected">ENVIAR SUGESTÃO</div>';
    },
    mount(el) {
      el.querySelector('[data-act="back"]').addEventListener('click', () => SK.Screens.go('title'));
      el.querySelector('.sug__go').addEventListener('click', open);
    },
    onKey(key) {
      if (key === 'back') { SK.Screens.go('title'); return true; }
      if (key === 'confirm') { open(); return true; }
      return false;
    },
  };
});

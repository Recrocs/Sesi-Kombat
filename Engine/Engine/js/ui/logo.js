/* LOGO — usa a imagem de SK.config.ui.logoImage se existir; senão, o logo provisório em texto. */
/* brasas flutuando (efeito de interface; some com "Animações de menu" desligado) */
SK.UI.embersHTML = function (n) {
  let out = '';
  for (let i = 0; i < (n || 16); i++) {
    const r = (k) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };   // pseudo-aleatório fixo
    out += '<i style="--x:' + Math.round(r(1) * 100) + '%;--s:' + (3 + Math.round(r(2) * 3)) + 'px;--d:' + (5 + r(3) * 6).toFixed(1) + 's;--w:' + (-r(4) * 9).toFixed(1) + 's;--dx:' + Math.round((r(5) - 0.5) * 120) + 'px"></i>';
  }
  return '<div class="embers">' + out + '</div>';
};

/* Sprite de menu virado para o lado certo.
   `want` = para onde ele deve olhar na tela ('right' | 'left'); o PNG original olha para char.facing.
   Devolve o atributo style com --flip (usado pelo CSS: transform: scaleX(var(--flip))). */
SK.UI.flipStyle = function (char, want) {
  const src = (char && char.facing) || 'right';
  return ' style="--flip:' + (src === want ? 1 : -1) + '"';
};

SK.UI.logoHTML = function () {
  const cfg = SK.config;
  if (cfg.ui.logoImage) return '<div class="logo"><img src="' + cfg.ui.logoImage + '" alt="' + SK.util.esc(cfg.title) + '"></div>';
  const [l1, l2] = cfg.logoLines;
  return '<div class="logo"><span class="logo__l1">' + SK.util.esc(l1) + '</span><span class="logo__l2">' + SK.util.esc(l2) + '</span>' +
         (cfg.tagline ? '<span class="logo__tag">' + SK.util.esc(cfg.tagline) + '</span>' : '') + '</div>';
};

/* ==========================================================================
   ASSETS — carregamento e cache de imagens.
   Qualquer caminho de imagem declarado em personagens, cenários ou na
   config é descoberto automaticamente e pré-carregado na tela de boot.
   ========================================================================== */
(function () {
  'use strict';
  const cache = new Map();

  function load(src) {
    if (!src) return Promise.resolve(null);
    if (cache.has(src)) return cache.get(src).promise;
    const img = new Image();
    const entry = { img: null, ok: false, promise: null };
    entry.promise = new Promise((resolve) => {
      img.onload = () => { entry.img = img; entry.ok = true; resolve(img); };
      img.onerror = () => { console.warn('[SK.Assets] não foi possível carregar:', src); resolve(null); };
    });
    img.src = src;
    cache.set(src, entry);
    return entry.promise;
  }

  /* lista todas as imagens que o jogo conhece */
  function collect() {
    const list = new Set();
    const add = (s) => { if (s) list.add(s); };
    const cfg = SK.config.ui;
    add(cfg.menuBackground); add(cfg.logoImage); add(cfg.vsImage);

    SK.Characters.all().forEach((c) => {
      const s = c.sprites || {};
      add(s.portrait); add(s.portraitHi); add(s.icon); add(s.idle);
      Object.values(c.animations || {}).forEach((a) => add(a.src));
      Object.values(c.moves || {}).forEach((m) => m && m.projectile && add(m.projectile.sprite));
    });
    SK.Stages.all().forEach((st) => {
      add(st.background); add(st.thumb);
      (st.layers || []).forEach((l) => add(l.src));
    });
    return Array.from(list);
  }

  SK.Assets = {
    load,
    collect,
    /* leitura síncrona (só funciona depois do preload) */
    get(src) { const e = cache.get(src); return e && e.ok ? e.img : null; },
    async preload(onProgress) {
      const list = collect();
      let done = 0;
      onProgress && onProgress(0, list.length);
      await Promise.all(list.map((src) => load(src).then(() => { done++; onProgress && onProgress(done, list.length); })));
    },
  };
})();

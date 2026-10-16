/* ==========================================================================
   MAIN — inicialização e loop principal.
   ========================================================================== */
(function () {
  'use strict';

  SK.toggleFullscreen = function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
  };

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.key === 'F2') {                                        // mostra caixas de colisão
      e.preventDefault();
      SK.debug.hitboxes = !SK.debug.hitboxes;
      const b = document.getElementById('debug-badge');
      b.textContent = SK.debug.hitboxes ? 'DEBUG: HITBOXES (F2)' : '';
    }
    if (e.key === 'f' || e.key === 'F') { if (SK.Screens.currentId !== 'fight') SK.toggleFullscreen(); }
  });

  function start() {
    SK.Settings.apply();
    SK.Audio.init();
    SK.Screens.init();
    SK.Screens.go('boot');

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      try { SK.Input.poll(now); } catch (err) { console.error(err); }
      try { SK.Screens.update(dt); } catch (err) { console.error(err); }
      SK.Input.endFrame();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

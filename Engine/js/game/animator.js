/* ==========================================================================
   ANIMATOR — escolhe qual imagem desenhar para cada estado do lutador.

   HOJE: cada personagem só tem 1 imagem (sprites.idle) → ela é usada em todos
   os estados (com poses provisórias feitas pelo renderer).

   QUANDO AS SPRITES CHEGAREM: basta preencher `animations` no arquivo do
   personagem — nenhuma linha da engine muda:

     animations: {
       idle:   { src: 'assets/characters/chico/idle.png',   frameWidth: 300, frameHeight: 480, frames: 6, fps: 8, loop: true },
       walk:   { src: '.../walk.png',   frameWidth: 300, frameHeight: 480, frames: 8, fps: 12 },
       attack: { src: '.../attack.png', frameWidth: 340, frameHeight: 480, frames: 5, loop: false },   // sem fps = distribui no tempo do golpe
       ...
     }

   Estados reconhecidos: idle, walk, jump, crouch, block, hit, ko, win,
   e o nome de cada golpe (attack, projectile, special, ...).
   As folhas são lidas em linha única, da esquerda p/ direita.
   ========================================================================== */
(function () {
  'use strict';

  function animKey(f) {
    if (f.state === 'attack' && f.moveKey) return f.moveKey;
    return f.state;
  }

  SK.Animator = {
    /**
     * @returns {{img, sx, sy, sw, sh, dh, fallback}}  dh = altura de desenho (px do jogo)
     */
    frameFor(f) {
      const char = f.char;
      const key = animKey(f);
      const def = char.animations && char.animations[key];
      const sheet = def && SK.Assets.get(def.src);

      if (def && sheet) {
        const fw = def.frameWidth, fh = def.frameHeight, n = def.frames || 1;
        let idx = 0;
        if (n > 1) {
          if (f.state === 'attack' && f.move && !def.fps) {
            const total = f.move.startup + f.move.active + f.move.recovery;
            idx = Math.min(n - 1, Math.floor((f.moveTime / total) * n));
          } else {
            const t = (f.stateTime / 1000) * (def.fps || 10);
            idx = def.loop === false ? Math.min(n - 1, Math.floor(t)) : Math.floor(t) % n;
          }
        }
        return { img: sheet, sx: idx * fw, sy: 0, sw: fw, sh: fh, dh: def.height || f.size.spriteHeight, fallback: false };
      }

      const img = SK.Assets.get(char.sprites.idle);
      if (!img) return null;
      return { img, sx: 0, sy: 0, sw: img.width, sh: img.height, dh: f.size.spriteHeight, fallback: true };
    },
  };
})();

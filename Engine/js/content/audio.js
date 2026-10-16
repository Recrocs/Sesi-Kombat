/* ==========================================================================
   ÁUDIO — sons do jogo. Ligue-os a eventos/telas em SK.config.audio (js/core/config.js).

   Formas de registrar:
     arquivo:      id: { src: 'assets/audio/sfx/hit_01.wav', bus: 'sfx' }
     música:       id: { src: 'assets/audio/music/x.mp3',    bus: 'music', loop: true }
     sintetizado:  id: { bus: 'sfx', synth: { wave:'square', f0:440, f1:200, dur:.1, vol:.3 } }
   ========================================================================== */
SK.Audio.registerAll({
  /* Trilha do jogo (feita por ronildos) */
  music_theme: { src: 'assets/audio/music/senai_kombat_theme.mp3', bus: 'music', loop: true, volume: 0.9 },

  /* Efeitos provisórios sintetizados no próprio navegador (sem arquivos).
     Para trocar por som de verdade: { src: 'assets/audio/sfx/hit_01.wav', bus: 'sfx' } */
  ui_move:    { bus: 'sfx', synth: { wave: 'square',   f0: 520, f1: 640, dur: .05, vol: .16 } },
  ui_confirm: { bus: 'sfx', synth: [{ wave: 'square', f0: 520, f1: 780, dur: .08, vol: .2 }, { wave: 'square', f0: 780, f1: 1040, dur: .1, vol: .18, delay: .07 }] },
  ui_back:    { bus: 'sfx', synth: { wave: 'square',   f0: 520, f1: 300, dur: .1, vol: .18 } },
  ui_error:   { bus: 'sfx', synth: { wave: 'sawtooth', f0: 160, f1: 110, dur: .16, vol: .22 } },
  swing:      { bus: 'sfx', synth: { wave: 'none', noise: .9, dur: .12, vol: .16, lp: 2600 } },
  hit:        { bus: 'sfx', synth: [{ wave: 'square', f0: 240, f1: 70, dur: .12, vol: .42, noise: .5 }, { wave: 'sine', f0: 110, f1: 45, dur: .16, vol: .5 }] },
  block:      { bus: 'sfx', synth: [{ wave: 'triangle', f0: 900, f1: 520, dur: .09, vol: .26 }, { wave: 'none', noise: .5, dur: .06, vol: .2, lp: 4000 }] },
  jump:       { bus: 'sfx', synth: { wave: 'square', f0: 260, f1: 520, dur: .11, vol: .13 } },
  land:       { bus: 'sfx', synth: { wave: 'sine', f0: 120, f1: 60, dur: .08, vol: .22 } },
  shot:       { bus: 'sfx', synth: [{ wave: 'sawtooth', f0: 700, f1: 260, dur: .22, vol: .2 }, { wave: 'none', noise: .3, dur: .12, vol: .12, lp: 3000 }] },
  ko:         { bus: 'sfx', synth: [{ wave: 'sawtooth', f0: 420, f1: 50, dur: .7, vol: .4 }, { wave: 'none', noise: .6, dur: .5, vol: .3, lp: 1500 }] },
  round:      { bus: 'sfx', synth: [{ wave: 'square', f0: 440, dur: .12, vol: .22 }, { wave: 'square', f0: 660, dur: .12, vol: .22, delay: .13 }, { wave: 'square', f0: 880, dur: .3, vol: .26, delay: .26 }] },
  fight:      { bus: 'sfx', synth: [{ wave: 'sawtooth', f0: 220, f1: 440, dur: .25, vol: .35 }, { wave: 'square', f0: 660, dur: .35, vol: .25, delay: .1 }] },
  win:        { bus: 'sfx', synth: [523, 659, 784, 1046].map((f, i) => ({ wave: 'square', f0: f, dur: .16, vol: .22, delay: i * .12 })) },
});

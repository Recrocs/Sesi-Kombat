/* ==========================================================================
   AUDIO — gerenciador de som (pronto, mas sem nenhum arquivo ainda).

   Como funciona:
     1) Registre os sons em js/content/audio.js:
          SK.Audio.register('hit_01', { src: 'assets/audio/sfx/hit_01.wav', bus: 'sfx' });
     2) Ligue sons a eventos do jogo em SK.config.audio.events:
          'fight:hit': 'hit_01'
     3) Música por tela em SK.config.audio.music:  fight: 'music_fight'
     4) Sons específicos de um golpe: no golpe, `sfx: { start:'id', hit:'id', block:'id' }`

   Enquanto nada estiver registrado, este módulo não faz nada.
   ========================================================================== */
(function () {
  'use strict';
  const sounds = new Map();
  let music = null, musicId = null;

  const vol = (bus) => {
    const S = SK.Settings;
    const base = S.get('volumeMaster') / 100;
    return base * (bus === 'music' ? S.get('volumeMusic') : S.get('volumeSfx')) / 100;
  };

  const SFX_KEY = { 'fight:move': 'start', 'fight:hit': 'hit', 'fight:block': 'block' };

  SK.Audio = {
    register(id, def) { sounds.set(id, Object.assign({ bus: 'sfx', volume: 1, loop: false }, def)); },
    registerAll(map) { Object.keys(map).forEach((id) => SK.Audio.register(id, map[id])); },
    has: (id) => sounds.has(id),

    play(id) {
      const d = sounds.get(id);
      if (!d) return;
      try {
        const a = new Audio(d.src);
        a.volume = Math.min(1, vol(d.bus) * d.volume);
        a.play().catch(() => {});        // o navegador pode bloquear antes da 1ª interação
      } catch (e) { /* ignora */ }
    },

    playMusic(id) {
      if (id === musicId) return;
      SK.Audio.stopMusic();
      const d = sounds.get(id);
      if (!d) return;
      musicId = id;
      music = new Audio(d.src);
      music.loop = true;
      music.volume = Math.min(1, vol('music') * d.volume);
      music.play().catch(() => {});
    },
    stopMusic() { if (music) { music.pause(); music = null; } musicId = null; },
    refreshVolume() {
      if (music && musicId) music.volume = Math.min(1, vol('music') * (sounds.get(musicId).volume));
    },

    init() {
      SK.Events.onAny((evt, payload) => {
        const map = SK.config.audio.events;
        if (map[evt]) SK.Audio.play(map[evt]);
        const k = SFX_KEY[evt];
        if (k && payload && payload.move && payload.move.sfx && payload.move.sfx[k]) SK.Audio.play(payload.move.sfx[k]);
        if (evt === 'screen:enter') {
          const m = SK.config.audio.music[payload.id];
          if (m) SK.Audio.playMusic(m);
        }
      });
      SK.Events.on('settings:change', () => SK.Audio.refreshVolume());
    },
  };
})();

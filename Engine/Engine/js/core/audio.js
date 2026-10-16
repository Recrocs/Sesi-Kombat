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
  let music = null, musicId = null, duck = 1, duckTo = 1, pending = false;

  const vol = (bus) => {
    const S = SK.Settings;
    const base = S.get('volumeMaster') / 100;
    return base * (bus === 'music' ? S.get('volumeMusic') : S.get('volumeSfx')) / 100;
  };

  /* ---- Sons sintetizados (WebAudio): nenhum arquivo necessário. Troque por .wav/.mp3 quando quiser. ----
     spec: { wave, f0, f1, dur, vol, noise (0-1 mistura de ruído), lp (filtro), delay } ou lista de specs */
  let ctx = null;
  function actx() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function synth(spec, gainMul) {
    const a = actx(); if (!a) return;
    (Array.isArray(spec) ? spec : [spec]).forEach((sp) => {
      const t0 = a.currentTime + (sp.delay || 0), dur = sp.dur || 0.12;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (sp.vol || 0.5) * gainMul), t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      let node = g;
      if (sp.lp) { const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = sp.lp; f.connect(a.destination); g.connect(f); node = null; }
      if (node) g.connect(a.destination);
      if (sp.wave !== 'none') {
        const o = a.createOscillator();
        o.type = sp.wave || 'square';
        o.frequency.setValueAtTime(sp.f0 || 440, t0);
        if (sp.f1) o.frequency.exponentialRampToValueAtTime(sp.f1, t0 + dur);
        o.connect(g); o.start(t0); o.stop(t0 + dur + 0.02);
      }
      if (sp.noise) {
        const n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const src = a.createBufferSource(); src.buffer = buf;
        const ng = a.createGain(); ng.gain.value = sp.noise; src.connect(ng); ng.connect(g); src.start(t0);
      }
    });
  }

  const SFX_KEY = { 'fight:move': 'start', 'fight:hit': 'hit', 'fight:block': 'block' };

  SK.Audio = {
    register(id, def) { sounds.set(id, Object.assign({ bus: 'sfx', volume: 1, loop: false }, def)); },
    registerAll(map) { Object.keys(map).forEach((id) => SK.Audio.register(id, map[id])); },
    has: (id) => sounds.has(id),

    play(id) {
      const d = sounds.get(id);
      if (!d) return;
      if (d.synth) { synth(d.synth, vol(d.bus) * d.volume); return; }
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
      music.volume = Math.min(1, vol('music') * d.volume * duck);
      music.play().catch(() => { pending = true; });      // bloqueado até a 1ª tecla/clique
    },
    status: () => ({ musicId, playing: !!music && !music.paused, volume: music ? music.volume : 0, waiting: pending }),
    stopMusic() { if (music) { music.pause(); music = null; } musicId = null; },
    refreshVolume() {
      if (music && musicId) music.volume = Math.min(1, vol('music') * (sounds.get(musicId).volume) * duck);
    },

    /* abaixa/sobe a música suavemente (ex.: durante a luta, para ouvir os golpes) */
    setDuck(v) {
      duckTo = v;
      if (SK.Audio._duckTimer) return;
      SK.Audio._duckTimer = setInterval(() => {
        duck += (duckTo - duck) * 0.18;
        if (Math.abs(duckTo - duck) < 0.01) { duck = duckTo; clearInterval(SK.Audio._duckTimer); SK.Audio._duckTimer = null; }
        SK.Audio.refreshVolume();
      }, 40);
    },

    init() {
      /* navegadores só liberam áudio depois de um gesto do jogador */
      const unlock = () => {
        actx();
        if (pending && music) { pending = false; music.play().catch(() => { pending = true; }); }
      };
      ['keydown', 'pointerdown', 'touchstart'].forEach((e) => window.addEventListener(e, unlock, true));
      SK.Events.on('gamepad:connect', unlock);
      SK.Events.onAny((evt, payload) => {
        const map = SK.config.audio.events;
        if (map[evt]) SK.Audio.play(map[evt]);
        const k = SFX_KEY[evt];
        if (k && payload && payload.move && payload.move.sfx && payload.move.sfx[k]) SK.Audio.play(payload.move.sfx[k]);
        if (evt === 'screen:enter') {
          const m = SK.config.audio.music[payload.id];
          if (m) SK.Audio.playMusic(m);
          const dk = SK.config.audio.duck || {};
          SK.Audio.setDuck(dk[payload.id] != null ? dk[payload.id] : 1);
        }
      });
      SK.Events.on('settings:change', () => SK.Audio.refreshVolume());
    },
  };
})();

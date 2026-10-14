/* ==========================================================================
   EVENTS — barramento de eventos.
   A engine "anuncia" o que acontece (SK.Events.emit) e outros sistemas
   (áudio, efeitos, estatísticas...) escutam. É assim que o sound design vai
   se conectar ao jogo sem alterar a lógica de luta.

   Eventos emitidos hoje:
     screen:enter {id, params}
     ui:move | ui:confirm | ui:back | ui:error
     round:intro {round} | round:fight | round:end {winner, reason} | match:end {winner}
     fight:move {fighter, move, key} | fight:hit {...} | fight:block {...}
     fight:projectile {...} | fight:jump {fighter} | fight:land {fighter} | fight:ko {fighter}
     settings:change {key, value}
   ========================================================================== */
(function () {
  'use strict';
  const handlers = new Map();
  const any = new Set();

  function safe(fn, a, b) { try { fn(a, b); } catch (e) { console.error('[SK.Events]', e); } }

  SK.Events = {
    on(evt, fn) {
      if (!handlers.has(evt)) handlers.set(evt, new Set());
      handlers.get(evt).add(fn);
      return () => SK.Events.off(evt, fn);
    },
    off(evt, fn) { const s = handlers.get(evt); if (s) s.delete(fn); },
    /* escuta TODOS os eventos: fn(nomeDoEvento, payload) */
    onAny(fn) { any.add(fn); return () => any.delete(fn); },
    emit(evt, payload) {
      const s = handlers.get(evt);
      if (s) s.forEach((fn) => safe(fn, payload));
      any.forEach((fn) => safe(fn, evt, payload));
    },
  };
})();

/* ==========================================================================
   SETTINGS — preferências do jogador (salvas no navegador via localStorage).
   Para adicionar uma opção: coloque o valor padrão em `defaults` e uma linha
   em js/screens/settings.js.
   ========================================================================== */
(function () {
  'use strict';
  const KEY = 'senai-kombat:settings:v1';

  const defaults = {
    scanlines: true,
    animations: true,
    colorGrade: 'normal',
    fightControlsHint: true,
    roundTime: SK.config.fight.roundTime,
    roundsToWin: SK.config.fight.roundsToWin,
    cpuLevel: 'normal',
    volumeMaster: 80,
    volumeMusic: 70,
    volumeSfx: 80,
  };

  let data = Object.assign({}, defaults);

  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) Object.assign(data, JSON.parse(raw));
  } catch (e) { /* localStorage indisponível: segue com os padrões */ }

  function persist() {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignora */ }
  }

  SK.Settings = {
    defaults,
    get: (k) => data[k],
    set(k, v) {
      data[k] = v;
      persist();
      SK.Settings.apply();
      SK.Events.emit('settings:change', { key: k, value: v });
    },
    reset() { data = Object.assign({}, defaults); persist(); SK.Settings.apply(); },
    /* reflete as preferências no DOM */
    apply() {
      document.body.classList.toggle('no-scanlines', !data.scanlines);
      document.body.classList.toggle('no-anim', !data.animations);
      document.body.classList.toggle('grade-soft', data.colorGrade === 'soft');
      document.body.classList.toggle('grade-vivid', data.colorGrade === 'vivid');
      document.body.classList.toggle('hide-fight-controls', !data.fightControlsHint);
    },
  };
})();

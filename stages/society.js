/* CENÁRIO: Society
   Para criar um cenário novo: copie este arquivo, mude os dados, ponha a imagem
   em assets/stages/<id>/ e adicione o <script> em index.html. */
SK.Stages.register({
  id: 'society',
  name: 'SOCIETY',
  subtitle: 'Quadra de society da escola · fim de tarde',

  background: 'assets/stages/society/background.jpg',   // imagem de fundo (cobre 960x540)
  thumb: 'assets/stages/society/thumb.jpg',             // prévia na seleção de cenário

  groundY: 455,                                         // y (px) da linha do chão onde os pés ficam
  bounds: { left: 40, right: 920 },                     // limites de movimento horizontal

  /* FUTURO — parallax em camadas (substitui `background` quando existir):
     layers: [ { src: 'assets/stages/society/sky.png', parallax: 0.2 },
               { src: 'assets/stages/society/field.png', parallax: 1 } ],          */
  layers: null,

  /* FUTURO — música do cenário: music: 'music_society' (id registrado em audio.js) */
  music: null,
});

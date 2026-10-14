# Senai Kombat — Próximos passos e prompt de continuação

## 1. PROMPT PARA COLAR NUM CHAT NOVO
> Estou desenvolvendo o **Senai Kombat**, jogo de luta de navegador (HTML/CSS/JS puro, canvas 960×540) só para amigos. Eu NÃO programo: responda em português, curto, e faça você mesmo os testes.
> Vou anexar o zip do projeto (senai-kombat-v0.4.zip). Leia o `PROXIMOS_PASSOS.md` e o `README.md` dentro dele, analise tudo e continue a partir do "Status" e do "Roadmap". Mantenha o jogo data-driven (personagens, mapas, golpes, sons em `js/content/` e `js/core/config.js`). Teste com Playwright (screenshots, bot-vs-bot, torre completa) antes de entregar um zip novo e atualize este arquivo no fim.
> Assuntos desta vez: [escreva aqui o que quer].

## 2. Resumo do projeto
- Rodar: abrir `index.html` (funciona em file://). Sem build.
- Namespace `SK`; telas via `SK.Screens.register(id, factory)`; conteúdo em `js/content/characters|stages|tower.js|rigs.js`.
- Todos os PNGs de personagem olham para a ESQUERDA (`facing:'left'`); o renderer espelha pela direção de andar.
- Estilo: tokens em `css/tokens.css`; efeitos em `css/ui-fx.css`; torre em `css/tower.css`. Animações de entrada só na interface (`.is-settled`, `body.no-anim`).
- Cores: teal/azul/amarelo + vermelho/branco SENAI-SESI; correção em `--sat-bg/--sat-stage`, classes `grade-soft|grade-vivid`.

## 3. Status (v0.4)
| Item | Estado |
|---|---|
| 10 personagens, 5 mapas | ok |
| Menu, seleção, versus, luta, configurações | ok |
| Torre Clássica e Maluca (9 andares, modificadores, chefe) | ok, visual pagode |
| Tela principal lineup (+ duel) | ok |
| Sprites andar/pular/agachar | provisório (boneco em código) |
| Correção de cor + CRT | ok |
| Golpes/especiais únicos por personagem | genérico, falta |
| Som | só ganchos, sem áudio |
| Online | não iniciado |

## 4. Roadmap (ordem sugerida)
1. **Arte real**: frames desenhados de andar/pular/agachar/golpe/dano/KO por personagem em `animations` (substitui o boneco sozinho). Se o usuário mandar referência da tela principal, refazer `title.js`.
2. **Golpes e especiais por personagem** (dados em cada `characters/*.js`): combos, projétil, defesa, balanço de dano.
3. **Sound design**: música por tela/mapa, efeitos de golpe, voz; usar `SK.Events` e `config.sounds`.
4. **Mais mapas** com fundo animado; mais menu animado.
5. **Torre**: mais modos, recompensas, finais por personagem, dificuldades da CPU, ranking local.
6. **Online** (só planejado): lockstep determinístico sobre WebRTC (PeerJS) — precisa que a simulação use frame fixo e RNG com semente; trocar apenas inputs; sala por código de 4 letras; começar com versus 1x1.
7. Controle (gamepad) e toque no celular.

## 5. Testes (na pasta do scratchpad, Playwright + /opt/pw-browsers/chromium)
`shoot.py` (todas as telas), `tower.py` (torre inteira), `soak.py` (60 lutas bot vs bot), `misc.py` (no-anim, grade), `pose.py` (folha de poses), `tw.py` (telas da torre). Se o scratchpad sumir, recriar: abrir file://…/index.html, navegar com teclado/`SK.Screens.go`, capturar erros de console.

## 6. Preferências do usuário
Foco no design primeiro, jogabilidade depois; visual cartoon, vermelho+branco SENAI/SESI mas sem exagero de vermelho nem saturação estourada; manter efeito VHS; créditos "Developed by ronildos".

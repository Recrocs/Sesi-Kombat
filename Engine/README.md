# Senai Kombat

Jogo de luta 2D para navegador (HTML + CSS + JavaScript puro, sem dependências).
Esta é a **base**: menus completos, luta funcional e uma arquitetura preparada para
receber personagens, mapas, animações, golpes e sound design sem reescrever nada.

## Como rodar

Dê duplo clique em `index.html`. Não precisa de servidor nem de instalação.
As fontes são locais (`assets/fonts/`), então funciona totalmente offline.

## Controles

| | P1 | P2 |
|---|---|---|
| Mover / pular / abaixar | W A S D | I J K L |
| Golpe | Z | M |
| Lançar | X | , |
| Especial (barra cheia) | C | . |
| Defesa | V | ; |

Ao andar, o lutador **vira para o lado em que está andando** (para trás, ele fica de costas para o adversário). Desligue com `fight.faceMoveDirection: false` em `config.js`.

`ESC` pausa · `F` tela cheia (nos menus) · `F2` mostra as caixas de colisão · `TAB` troca o modo na seleção.
Todos os controles ficam em `js/core/config.js` → `controls`.

<<<<<<< HEAD
## Novidades da v0.5
- **Base**: o Engine que você atualizou no GitHub (controle/gamepad, Otavio, Reenye, mapas XV, Sellor e Sala) + polimento.
- **Trilha sonora** (`assets/audio/music/senai_kombat_theme.mp3`) toca em todas as telas e abaixa sozinha durante a luta (`audio.duck` em `config.js`). Efeitos sintetizados (menus, golpe, defesa, pulo, KO, round) em `js/content/audio.js` — troque por .wav quando quiser.
- **Nitidez**: canvas da luta em 2x (`renderScale`), fundos em 1920x1080 (`tools/upscale_stages.py`), sprites padronizados em 480 px (`tools/polish_sprites.py`).
- **Sprites andar/pular/agachar** para os 12 personagens (`tools/make_basic_sprites.py`, provisórios).
- **Retratos**: cartão da seleção usa `icon.png`; tela de VERSUS e Torre usam o busto `portrait1.png` (nítido).
- Torre agora tem 11 andares (todos os outros personagens). Tela principal mostra os 12 lutadores.

=======
>>>>>>> 5c13f29e29ce36520b26a88da6f18bb8d20c18d9
## Novidades da v0.4
- **Torre estilo pagode (Mortal Kombat)**: andares com retrato, serpente dourada no andar atual, tochas, torres ao fundo. Menu da torre só com Clássica e Maluca (sem "Em breve").
- **Cores corrigidas**: paleta azul-petróleo / amarelo / vermelho / branco, menos saturação. Em Configurações > *Correção de cor* (Suave / Normal / Vívida). O efeito CRT/VHS continua.
- **Nova tela principal "lineup"**: os 10 lutadores em fila. Para voltar à antiga: `ui.titleVariant: 'duel'` em `js/core/config.js`.
- **Sprites básicos** (andar, pular, agachar) para todos os personagens, gerados em código a partir do PNG (`js/content/rigs.js`, feito por `tools/make_rigs.py`). São provisórios: assim que um personagem tiver `animations` reais, elas substituem o boneco automaticamente.

## Novidades da v0.3
- **Direção dos sprites corrigida**: todos os PNGs olham para a **esquerda** (antes o jogo achava que era direita). Cada personagem tem `facing` no seu arquivo; menus e luta usam esse campo. `tools/process_assets.py` agora imprime para que lado cada PNG novo olha.
- **Modo Torre (CIRCUITO)**: *Torre Clássica* (um adversário por andar, CPU mais difícil a cada andar, chefe final) e *Torre Maluca* (cada andar sorteia uma regra: vida pela metade, pernas de chumbo, inimigo turbinado…). Dados em `js/content/tower.js`, estado em `js/game/tower.js`, telas em `js/screens/towerMenu.js` e `tower.js`.
- **Tema SENAI/SESI**: vermelho e branco, contorno de gibi nas letras, fundo mais saturado com meio-tom, raios girando no título, logo novo. Paleta em `css/tokens.css`.
- Poses de golpe/K.O. respeitam o lado do PNG (caem para trás de verdade).

## Modo Torre — como mexer
- **Novo modo**: adicione um item em `SK.TowerData.modes` (`js/content/tower.js`); aparece sozinho no menu do Circuito.
- **Nova regra de andar**: adicione em `SK.TowerData.modifiers` — `player` / `enemy` com multiplicadores `{ hp, speed, damage }` e `time` (segundos do round).
- Nível da CPU por andar: `cpuLevelFor`. Chefe final: `SK.TowerData.boss`.
- Sorteio de adversários/cenários/regras: `SK.Tower.buildFloors` (`js/game/tower.js`).
- Os multiplicadores chegam ao `Fighter` pelo campo `mods` (qualquer modo futuro pode usá-los).

## Novidades da v0.2
- **Fonte nova e legível** (Big Shoulders nos títulos/botões, Tektur nos textos pequenos), local e sem depender de internet. Efeito CRT mais leve.
- **Interface mais estilizada**: painéis com parafusos nos cantos e sombra, botão selecionado com brilho e setas, logo maior.
- **Animações só na interface** (os lutadores continuam estáticos): entrada dos botões/cards/painéis, logo, brasas no fundo, fundo com zoom lento, cursor pulsando, VS com impacto e tremor, HUD, banners. Tudo em `css/ui-fx.css`. Dá para desligar em *Configurações → Animações de menu*.
- **Sprites viram para a direção do movimento** (campo `look` do lutador, `js/game/fighter.js` + `renderer.js`).
- **10 personagens e 5 cenários** ligados no jogo, a partir dos assets atualizados do repositório. Grade de seleção 4×3 (`ui.rosterColumns`, `ui.rosterSlots`).
- Créditos: *Developed by ronildos* (`credits` em `config.js`).

## Fluxo das telas

`boot → título → seleção de personagem → seleção de cenário → versus → luta → (resultado)`
Circuito: `título → menu do circuito → seleção (só P1) → torre (escada) → versus → luta → torre → … → final`
Também: Configurações e Sugestões. 

## Estrutura

```
index.html            ordem de carregamento dos scripts (e onde registrar conteúdo novo)
css/
  tokens.css          ★ paleta, fontes, espessura das bordas — o design vive aqui
  ui-fx.css           ★ tipografia por elemento, acabamento dos painéis e TODAS as animações de interface
  base.css            container 960x540 escalável, troca de telas, efeito CRT
  components.css      painel pixelado, botão, barras, tags, logo
  screens.css         layout de cada tela (coordenadas do jogo)
js/
  core/               config, eventos, input, áudio, assets, configurações, gerenciador de telas
  ui/                 NavList (cursor de menu com teclado+mouse), toast, logo
  game/               engine de luta: moves, fighter, match, projectile, controllers, animator, renderer
  content/            ★ DADOS: characters/*.js, stages/*.js, audio.js
  screens/            uma tela por arquivo
assets/               characters/<id>/, stages/<id>/, ui/, audio/, fonts/
```

Regra de ouro: **conteúdo é dado, engine é código.** Quase tudo que você vai
adicionar mexe só em `js/content/` e `assets/`.

---

## Receitas

### Adicionar um personagem
1. Crie `assets/characters/<id>/` com `idle.png` (corpo inteiro, fundo transparente, olhando para a direita) e `portrait.png` (busto, quadrado).
2. Copie `js/content/characters/chico.js` → `<id>.js` e troque `id`, `name`, `themeColor` e os caminhos.
3. Inclua `<script src="js/content/characters/<id>.js">` em `index.html`.

Ele aparece sozinho na seleção, no versus e na luta. A grade tem 12 casas (4 colunas); as vazias viram `???`
(`ui.rosterSlots` e `ui.rosterColumns` em `config.js`).

### Adicionar um mapa
1. Imagem em `assets/stages/<id>/` (`background.jpg` e `thumb.jpg`).
2. Copie `js/content/stages/society.js`, ajuste `groundY` (linha do chão) e `bounds`.
3. Inclua o `<script>` em `index.html`.

Já existe suporte a **camadas com parallax**: preencha `layers: [{ src, parallax }]` no lugar de `background`.

### Adicionar animações (quando as sprites chegarem)
No arquivo do personagem, preencha `animations` (folhas em linha única, da esquerda para a direita):

```js
animations: {
  idle:   { src: 'assets/characters/chico/idle_sheet.png',   frameWidth: 300, frameHeight: 480, frames: 6, fps: 8 },
  walk:   { src: 'assets/characters/chico/walk_sheet.png',   frameWidth: 300, frameHeight: 480, frames: 8, fps: 12 },
  attack: { src: 'assets/characters/chico/attack_sheet.png', frameWidth: 340, frameHeight: 480, frames: 5, loop: false },
}
```
Estados: `idle, walk, jump, crouch, block, hit, ko, win` + o nome de cada golpe.
Estado sem animação continua usando `sprites.idle`. Sem `fps`, um golpe distribui os frames pela duração dele.
As poses provisórias do `renderer.js` (inclinar ao atacar, cair no KO) só valem para estados **sem** animação.

### Criar ou alterar golpes
Golpes são dados (`js/game/moves.js`): tempos de startup/active/recovery, dano, hitbox, knockback, custo de barra...
Sobrescreva por personagem:

```js
moves: {
  attack:  { damage: 9, hitbox: { x: 24, y: -170, w: 120, h: 56 } },
  special: { kind: 'projectile', projectile: { speed: 600, w: 60, h: 40, sprite: 'assets/fx/onda.png' } },
}
```
Golpe novo (ex.: chute): adicione `kick: 'b'` (e a versão do P2) em `controls` e `kick: {...}` em `moves`.

### Sound design
1. Coloque os arquivos em `assets/audio/` e registre em `js/content/audio.js`.
2. Ligue aos eventos em `config.audio.events` (ex.: `'fight:hit': 'hit_01'`) e à música por tela em `config.audio.music`.
3. Sons por golpe: `sfx: { start, hit, block }` dentro do golpe.

Eventos disponíveis (lista completa no topo de `js/core/events.js`): `ui:move`, `ui:confirm`, `ui:back`,
`round:intro`, `round:fight`, `round:end`, `match:end`, `fight:move`, `fight:hit`, `fight:block`, `fight:projectile`, `fight:jump`, `fight:land`, `fight:ko`.
Os volumes de Configurações já estão ligados ao gerenciador.

### Animações de interface
Ficam todas em `css/ui-fx.css` (seções numeradas por tela). As de **entrada** só rodam enquanto a tela é nova
(a classe `.is-settled` entra após `ui.settleMs`); as de "vida" (brilho, cursor, fundo) continuam.
Para animar um elemento novo, use o prefixo `.screen.is-active:not(.is-settled)` e os `@keyframes` `fx-*` já existentes.
Itens de lista usam `style="--i:N"` para entrar em sequência.

### Animações e arte de menu
- Logo e "VS" definitivos: `ui.logoImage` / `ui.vsImage` em `config.js`.
- Botões do menu principal: array `menu` em `config.js` (adicione, remova, desabilite, mude textos).
- Fundo dos menus: `ui.menuBackground` (hoje usa o cenário Society; troque por uma arte de mapa).
- Visual dos painéis: `.panel` em `css/components.css` (hoje feito só com `box-shadow`; dá para trocar por `border-image`).

### Nova tela
Veja o comentário no topo de `js/core/screens.js` e use qualquer arquivo de `js/screens/` como modelo.

### Joystick / toque / online
A luta só conhece **intenções** (`{left, right, up, down, block, pressed}`), produzidas por *controllers*
(`js/game/controllers.js`). Para suportar um novo dispositivo, crie outro controller com o método `read()`.

## O que já é provisório (de propósito)
- Logo e "VS" em texto/CSS.
- Pose dos lutadores: um único sprite estático (agora virado para o lado do movimento) com poses simples; indicador do alcance do golpe (círculo amarelo) e faíscas de impacto.
- Projétil: bolinha brilhante.
- Sem áudio.


## Controle (Xbox / Gamepad API)
Plugue o controle (USB ou Bluetooth), abra o jogo no Chrome/Edge e aperte qualquer botão. Teclado e mouse continuam funcionando junto.

| Controle | Luta | Menus |
|---|---|---|
| Analógico esq. / direcional | mover (↓ = abaixar) | navegar |
| A | pular | confirmar |
| B / LB / LT | defesa | voltar (B) |
| X | golpe | — |
| Y | lançar | alternar modo (TAB) |
| RB / RT | especial | — |
| Start | pausar / despausar | confirmar |
| View/Select | — | alternar modo (TAB) |

1º controle conectado = P1, 2º = P2. Código em `js/core/input.js` (zona morta 0.25, histerese, 1 evento por clique).

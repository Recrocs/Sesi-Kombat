# Fontes (locais)

O jogo carrega as fontes daqui (declaradas em `css/tokens.css`), sem precisar de internet:

- `BigShoulders-Bold.ttf` — títulos, botões, logo (licença em `BigShoulders-OFL.txt`)
- `Tektur-Regular.ttf`, `Tektur-Medium.ttf` — textos pequenos e legendas (licença em `Tektur-OFL.txt`)

Para trocar a fonte: copie o arquivo para cá, ajuste o `@font-face` e as variáveis `--font-ui` / `--font-display`
no topo de `css/tokens.css`. Os tamanhos de cada elemento estão em `css/ui-fx.css` (seção 1).

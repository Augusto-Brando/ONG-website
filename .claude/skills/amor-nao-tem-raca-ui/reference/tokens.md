# Tokens

Fonte da verdade: `assets/tokens.css`. Este arquivo explica o uso e o mapeamento para o Astryx.

## Cores e contraste conferido (WCAG 2.1 AA)

| Token | Hex | Uso | Pares aprovados |
|---|---|---|---|
| `--ant-tinta` | #122334 | Texto principal, fundos escuros | no creme 15,1:1 · no branco 16:1 |
| `--ant-tinta-suave` | #4A5A68 | Texto secundário, legendas | no creme 6,7:1 · no branco 7,1:1 |
| `--ant-creme` | #FFF8EC | Fundo da página | |
| `--ant-branco` | #FFFFFF | Cartões e campos | |
| `--ant-azul` | #0077B3 | Links, botão azul, títulos de apoio | branco nele 4,9:1 · ele no creme 4,6:1 |
| `--ant-azul-logo` | #008AC8 | Só áreas e títulos >= 24 px | branco nele 3,8:1 (reprova texto pequeno) |
| `--ant-azul-escuro` | #0B3F5E | Faixas escuras, botão "copiado" | branco nele 11:1 · sol nele 8:1 |
| `--ant-azul-suave` + `--ant-azul-texto-suave` | #E4F3FB + #005C88 | Opção selecionada | 6,4:1 |
| `--ant-acao` | #F7791A | Botão principal | tinta nele 5,9:1 · **branco nele 2,7:1 (proibido)** |
| `--ant-laranja-texto` | #B84A06 | Texto laranja, nota manuscrita, degrau | no creme 4,9:1 · no branco 5,2:1 · no sol-suave 4,6:1 |
| `--ant-sol` | #FFD84D | Raios, fitas, selos, barra de meta | tinta nele 11,5:1 · nunca como texto |
| `--ant-sol-suave` | #FFF1B8 | Etiquetas, fundo de seção "Como funciona" | tinta nele 14:1 |
| `--ant-pessego` | #FFE3BF | Bloco quente (sócio contribuinte) | tinta nele |
| `--ant-cacau` | #A85A3E | Ilustração, pata | branco nele 5:1 |
| `--ant-erro` | #B3261E | Texto de erro com ícone | no creme 6,2:1 |
| `--ant-erro-fundo` + `--ant-erro-texto-forte` | #FDEDEA + #7A1A14 | Banner de erro | 9,3:1 |

Tons para placeholder de foto: `--ant-foto-1..4` (dourado, azul claro, amarelo claro, pêssego). Alterne entre cartões.

## Tipografia

| Papel | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título de hero | Baloo 2 | 800 | `--ant-titulo-xl` (46 a 84 px), altura 0,92 |
| Título de página | Baloo 2 | 800 | 64 px desktop, 40 px celular |
| Título de seção | Baloo 2 | 800 | `--ant-titulo-lg` 52 px desktop, 34 px celular |
| Nome do animal no cartão | Baloo 2 | 800 | 30 px desktop, 24 px celular |
| Números de impacto | Baloo 2 | 800 | 64 px desktop, 40 px celular |
| Corpo | Nunito | 400 | 17 px, altura 1,5 |
| Rótulo, botão, chip | Nunito | 800 | 15 a 18 px |
| Slogan e notas | Caveat | 600 | 24 a 34 px, nunca menor |

Títulos alinhados à esquerda. Centralizar só em estados vazios, sucesso e cartões pequenos.

## Raio, sombra, espaçamento

- Raio: campos 16, cartões 28 (24 a 32), blocos grandes 40, botões e chips em pílula.
- Sombras quentes e baixas: `--ant-sombra-sm/md/lg`. Botão laranja tem degrau sólido `--ant-sombra-degrau`.
- Espaçamento em base 4. Seções com 72 a 88 px verticais no desktop e 40 px no celular. Gutter 16 px no celular e 40 px no desktop. Conteúdo com largura máxima de 1240 px.

## Mapeamento para o Astryx

O Astryx gera a paleta em oklch (clara e escura) a partir de uma cor-semente por família. Use `assets/tokens.json` > `seed`:

| Família do Astryx | Semente |
|---|---|
| primária | #0077B3 |
| ação / acento de chamada | #F7791A |
| destaque | #FFD84D |
| neutra | #122334 |

Depois de gerar, **sobrescreva** com os valores fixos da tabela acima nos papéis críticos de contraste: texto sobre o botão de ação (`--ant-tinta`), fundo da página (`--ant-creme`) e azul de texto (`--ant-azul`). Confira os nomes exatos das variáveis de tema no repositório do Astryx antes de mapear. Não invente nomes.

Modo escuro: ainda não desenhado. Se o Astryx gerar automaticamente, revise contraste do laranja com texto e do amarelo antes de publicar.

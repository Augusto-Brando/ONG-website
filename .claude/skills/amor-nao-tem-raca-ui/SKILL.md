---
name: amor-nao-tem-raca-ui
description: Design system do site e do painel da ONG Amor Não Tem Raça (Juiz de Fora). Use sempre que criar, alterar ou revisar qualquer tela, componente, estilo, animação ou texto de interface do projeto, no site público ou no painel administrativo.
---

# Design system · Amor Não Tem Raça

Direção visual: **"Sol de Bairro" com toques de álbum**. Um abrigo de bairro feito com carinho, que também é organizado e transparente. Fundo creme quente, sol amarelo da logo como motivo gráfico, laranja para agir, azul para confiar, cantos bem arredondados, fotos dos animais como protagonistas em molduras de polaroide.

Stack: Next.js 16 (App Router), React 19 e o design system **Astryx** (componentes e páginas-modelo). Este documento define a camada da marca por cima do Astryx.

## Antes de mexer em qualquer tela

1. Leia `reference/tokens.md` e use **somente** os tokens de `assets/tokens.css`. Nada de hex solto no código.
2. Veja em `reference/telas.md` a estrutura da tela e o modelo do Astryx correspondente.
3. Monte com os componentes de `reference/componentes.md`. Se o Astryx já tem o componente, use o dele e aplique o tema. Só crie componente próprio quando a tabela disser "próprio".
4. Animações: `assets/motion.css` e `reference/movimento.md`. Sempre com a alternativa de movimento reduzido.
5. Textos: `reference/conteudo.md` (pt-BR, tom caloroso e direto).
6. Antes de terminar, passe pelo checklist abaixo e por `reference/nao-fazer.md`.

## Regras que não se negociam

- **Contraste WCAG 2.1 AA.** Botão laranja `--ant-acao` leva texto `--ant-tinta`, nunca branco (branco dá 2,7:1). Texto e botões azuis usam `--ant-azul` (#0077B3). O azul da logo `--ant-azul-logo` (#008AC8) só em áreas e títulos de 24 px ou mais.
- **Amarelo nunca é texto.** `--ant-sol` vive em raios, fitas, selos e barras.
- **Um único botão laranja por área visível.** O segundo apelo é azul de contorno.
- **Alvo de toque mínimo de 44 px.** Botões principais com 56 px.
- **Elementos reais:** `<button>`, `<a href>`, `<input>` com `<label>`. Nada de `div` clicável. Botão só com ícone leva `aria-label`.
- **Mobile primeiro (390 px).** No site público, barra fixa no rodapé com "Quero adotar" (laranja) e "Doar" (azul de contorno).
- **Fotos de qualquer proporção.** A moldura fixa a proporção e a foto entra com `object-fit: cover` e ponto focal no rosto. Sem foto, mostra a pata sobre cor suave.
- **Sem números inventados.** Impacto, metas e transparência vêm da API. Enquanto não houver dado, mostre o estado de carregando, não um valor fictício.
- **Erro nunca só por cor.** Ícone mais texto, com `role="alert"`.
- **Movimento:** uma curva para tudo, ease-in-out `cubic-bezier(.65, 0, .35, 1)`. Respeitar `prefers-reduced-motion`.

## Assinaturas visuais da marca

| Elemento | Onde usar | Como |
|---|---|---|
| Raios do sol | Hero, estados vazios, sucesso, cabeçalhos de página | `.ant-sol` (gradiente cônico amarelo), círculo parcialmente fora da tela, atrás do conteúdo |
| Polaroide com fita | Cartões de animal, galeria do animal, histórias de adoção | `.ant-polaroide` + `.ant-fita`, inclinação de -3° a 3°, endireita no hover |
| Nota manuscrita | Personalidade do animal ("ama passeios"), slogan, pequenos rótulos | Fonte Caveat, 24 px ou mais, laranja-texto ou azul |
| Botão em degrau | Ação principal laranja | Sombra sólida `0 4px 0 var(--ant-acao-sombra)` |
| Pata | Placeholder de foto, estado vazio | SVG de 5 elipses, em `--ant-cacau` ou na cor do fundo escurecida |

## Arquivos

- `reference/tokens.md` · cores, tipografia, raio, sombras, espaçamento e o mapeamento para o tema do Astryx
- `reference/componentes.md` · cada componente, variações, estados e acessibilidade
- `reference/telas.md` · estrutura de cada tela do site e do painel
- `reference/movimento.md` · o que anima, duração, curva e versão reduzida
- `reference/conteudo.md` · voz, microcopy e dados reais da ONG
- `reference/nao-fazer.md` · lista do que quebra a identidade
- `assets/tokens.css` · variáveis CSS (fonte da verdade)
- `assets/tokens.json` · sementes no formato Design Tokens (W3C) para gerar o tema do Astryx
- `assets/motion.css` · keyframes e classes de animação
- `assets/logo-amor-nao-tem-raca.svg` · logo vetorial oficial, fundo transparente
- `examples/` · componentes de referência em React 19 + TypeScript

## Checklist antes de entregar uma tela

- [ ] Só tokens, nenhum hex solto
- [ ] Contraste conferido nos pares usados (tabela em `tokens.md`)
- [ ] Funciona em 390 px sem rolagem horizontal, barra fixa no rodapé no site público
- [ ] Estados de carregando, vazio, erro e sucesso desenhados quando a tela busca ou envia dados
- [ ] Foto vertical, horizontal e ausente testadas
- [ ] Navegação por teclado, foco visível (`--ant-foco`), `aria-label` em botões de ícone
- [ ] Animações com `prefers-reduced-motion`
- [ ] Textos em pt-BR seguindo `conteudo.md`

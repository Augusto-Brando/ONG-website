# Movimento

Estilo motion graphics leve: tudo começa devagar, acelera e pousa suave. **Uma curva para tudo:** `var(--ant-curva)` = `cubic-bezier(.65, 0, .35, 1)` (ease-in-out). Única exceção: giros contínuos (sol, spinner) são lineares.

Classes prontas em `assets/motion.css`. Exemplos em `examples/`.

| O quê | Como | Duração | Movimento reduzido |
|---|---|---|---|
| Entrada de seções e itens | Sobe 24 px, cresce de 96% e aparece. Itens escalonados em 100 ms. Dispara uma vez ao entrar na tela (IntersectionObserver, `threshold` 0,2) | 700 ms | Aparece direto |
| Contadores de impacto | Contam do zero ao valor com a mesma curva (easeInOutCubic) | 1600 ms | Valor final |
| Botão no hover | Sobe 3 px e clareia 5% | 350 ms | Só a cor |
| Botão no clique | Afunda 2 px e vai a 97% | 120 ms | Só a cor |
| Link com seta | A seta anda 6 px | 350 ms | Parada |
| Botão de ícone | Sobe 3 px e inclina -6°. No clique, 90% | 350 ms | Parado |
| Polaroide no hover/foco | Endireita, sobe 6 px, cresce 3%, sombra maior | 450 ms | Só a sombra |
| Coração "quero conhecer" | Pulo 1 → 1,3 → 1 e preenche de laranja | 450 ms | Só a cor |
| Copiar Pix | Botão vira azul-escuro, ícone de certo aparece | 350 ms (cor) · 500 ms (ícone) · volta em 2,8 s | Troca sem transição |
| Cartão para página do animal | A foto desliza e cresce até a galeria (View Transitions API com `view-transition-name` na foto) | 600 ms | Troca direta |
| Etapas do formulário | Trilho desliza na horizontal | 600 ms | Troca instantânea |
| Barra de meta | Enche de 0 ao valor ao entrar na tela | 1400 ms | Já cheia |
| Carregando | Fantasma pulsa | ciclo de 1,6 s | Parado |
| Conteúdo após carregar | Aparece com leve crescimento (97% → 100%) | 500 ms | Direto |
| Sol de fundo | Gira uma volta, linear, só no hero e no sucesso | 60 s | Parado |

## Regras

- Interações entre 350 e 600 ms. Entradas e preenchimentos até 1,6 s. Nada passa disso.
- Nada pisca, nada fica em loop chamativo. Só o sol gira, e devagar.
- Animação de entrada roda **uma vez** por visita à seção.
- Animar só `transform`, `opacity`, `filter` e cores. Nunca `top/left/height`. A barra de meta é a exceção aceita (`width`).
- Sempre testar com `prefers-reduced-motion: reduce` ligado. O conteúdo tem de estar visível e utilizável sem nenhuma animação.
- Mudanças de estado anunciadas para leitor de tela (`role="status"` ou `aria-live="polite"`), não só animadas.

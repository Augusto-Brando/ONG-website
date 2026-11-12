# Acessibilidade — site e painel da Amor não tem Raça

Auditoria de acessibilidade (WCAG 2.1 AA, com atenção aos critérios da WCAG 2.2 que
continuam valendo) feita em 2026-11-12 na branch `teste/erp-crm`.

**Método:** leitura do código de cada tela e do HTML servido (`curl` autenticado como
`admin@ong.local`), além de testes reais no navegador (Chrome) para foco, teclado,
diálogos Radix e alvos de toque em 390 px. O contraste das cores foi **calculado**
convertendo as variáveis `oklch` de `app/globals.css` para sRGB e aplicando a fórmula
de luminância relativa da WCAG (razão de contraste = (L1 + 0.05) / (L2 + 0.05)).

**Telas no escopo:** `/` (site público), `/admin/login`, `/admin/painel`, `/admin/adocoes`,
`/admin/doacoes`, `/admin/estoque`. A tela `/admin/news` foi **corrigida** nesta rodada
(é o único arquivo de código alterado por esta auditoria).

**Observação de escopo:** por regra da rodada, os achados fora do meu arquivo
(`app/admin/news/page.tsx`) foram apenas **documentados**, não corrigidos.

---

## 1. Resumo por tela

| Tela | Resultado | Observação principal |
|---|---|---|
| `/` (site público) | Parcial | Sem link "pular para o conteúdo"; texto em `text-primary` abaixo de 4.5:1; pontos do carrossel com 8 px |
| `/admin/login` | Parcial | Erro de login sem `role="alert"`; h1 com cor primária (3,72:1) |
| `/admin/painel` | Bom | Gráficos com `role="img"`, resumo por `aria-label` e tabela `sr-only`; títulos dos cartões não são headings |
| `/admin/adocoes` | Bom | Colunas do Kanban com `aria-labelledby` + `h2`; cartões e selects com nome acessível; diálogos com descrição |
| `/admin/doacoes` | Bom | Filtros com `<Label htmlFor>`; tabela com rolagem horizontal; nome do doador "Anônimo" no texto |
| `/admin/estoque` | Bom | Tabelas com cabeçalhos, `role="alert"` no aviso de estoque baixo, botões com `aria-label` |
| `/admin/news` | **Corrigido** | Migrada para `<AdminShell>`; rótulos, nomes acessíveis, `aria-pressed` e diálogo com descrição |

---

## 2. O que já está conforme (amostras verificadas)

- **Idioma e metadados:** `<html lang="pt-BR">` em todas as telas; textos em pt-BR.
- **Marcos (landmarks):** `header`, `nav`, `main`, `footer` presentes; o painel usa a
  `<main id="conteudo">` de `components/admin/admin-shell.tsx`.
- **Link de escape:** presente em todas as telas do painel
  (`components/admin/admin-shell.tsx:81-86`) — ausente no site público (achado A2).
- **Título principal (h1):** exatamente um por tela, sem salto de nível
  (`h1 → h2 → h3`); verificado no HTML servido das 7 rotas.
- **Rótulos de formulário:** todos os campos de `/admin/doacoes`, `/admin/estoque`,
  `/admin/login` e do formulário público de adoção (`components/adoption-form.tsx`)
  usam `<Label htmlFor>`; os `Select` do Radix recebem `id` no `SelectTrigger`, e o
  `<label for>` aponta para ele (nome acessível conferido no HTML servido).
- **Imagens:** as 13 imagens da home têm `alt` (as decorativas usam `alt=""`).
- **Botões e links:** nenhum botão ou link sem nome acessível nas 7 telas auditadas
  (verificado por varredura do HTML servido).
- **Foco visível:** `focus-visible:ring-[3px]` em `components/ui/button.tsx:8` e
  `focus-visible:ring-[3px]` em `components/ui/input.tsx:12`; medido no navegador:
  anel de 3 px na cor primária nos botões e anel de 2 px nos links do menu.
  O link "pular para o conteúdo" recebe contorno de 1 px ao receber foco.
- **Teclado e diálogos Radix:** testado em `/admin/doacoes` — ao abrir o diálogo o foco
  entra nele, o `Tab` percorre os campos em ordem (donorName → donorEmail →
  donorPhone → tipo → valor → forma → data), o foco **fica preso dentro do diálogo**,
  o `Shift+Tab` volta para o botão de fechar e o `Esc` fecha o diálogo
  (`role="dialog"` com `aria-labelledby` e `aria-describedby` apontando para título e
  descrição existentes).
- **Gráficos (painel):** os dois gráficos do Recharts têm `role="img"`, `aria-label`
  com os valores por mês e uma tabela `sr-only` equivalente
  (`components/admin/painel/finance-chart.tsx`, `components/admin/painel/donations-chart.tsx`).
  O funil de adoções não é imagem: são texto + número por etapa.
- **Alvos de toque (390 px):** nas telas do painel nenhum controle fica abaixo de
  24 px (botões `size="icon"` = 36 px, `sm` = 32 px). No site público há exceção (achado A1).

---

## 3. Problemas encontrados

Gravidade: **alta** = impede o uso de um recurso a um grupo de pessoas;
**média** = atrapalha ou degrada; **baixa** = melhoria recomendada.

| # | Onde (arquivo:linha) | Critério WCAG | Gravidade | O que acontece | Correção sugerida |
|---|---|---|---|---|---|
| A1 | `components/dog-carousel.tsx:78-85` | 2.5.8 Target Size (Minimum) (AA na 2.2) | média | Os marcadores de posição do carrossel medem **8×8 px** (o ativo, 32×8) — bem abaixo de 24×24 px | Manter o ponto visual e ampliar a área clicável: `className="h-6 w-6 p-2"` com o ponto em `<span className="h-2 w-2 rounded-full …" />` |
| A2 | `components/header.tsx:5-37` (e `app/page.tsx:47`) | 2.4.1 Bypass Blocks | média | O site público **não tem link "pular para o conteúdo"**; quem navega por teclado precisa atravessar todo o cabeçalho e o menu a cada página | Replicar o skip link de `components/admin/admin-shell.tsx:81-86` no `Header` |
| A3 | `app/admin/login/page.tsx:44` | 4.1.3 Status Messages | média | A mensagem de erro ("E-mail ou senha incorretos") é um `<p>` comum: leitores de tela não anunciam a falha ao enviar o formulário | Trocar por `<p role="alert" …>` (ou envolver num `aria-live="assertive"`) |
| A4 | `app/globals.css:14` (`--primary`) | 1.4.3 Contrast (Minimum) | média | `text-primary` usado como texto normal mede **3,72:1** (3,38:1 sobre `bg-accent/10`, 3,51:1 sobre `bg-primary/5`), abaixo de 4,5:1. Passa em texto grande (≥ 24 px), mas falha em rótulos e botões de 14 px. O texto do botão (`primary-foreground` sobre `primary`) mede **3,61:1** | Escurecer o primário (ex.: `oklch(0.52 0.14 237)` ≈ 4,6:1) ou reservar `text-primary` para títulos grandes e dar um tom escuro aos botões |
| A5 | `app/globals.css:20` (`--accent`) e `:16` (`--secondary`) | 1.4.3 Contrast (Minimum) | alta | Os números das estatísticas do site ("8 Anos", "100%") usam `text-accent` (2,19:1) e `text-secondary` (2,27:1) sobre seus fundos — **abaixo de 3:1**, o mínimo para texto grande | Usar `text-foreground`/`text-primary` nesses números ou definir tons escuros próprios para texto |
| A6 | `app/globals.css:22-23` (`--destructive` / `--destructive-foreground`) | 1.4.3 Contrast (Minimum) | média | As duas variáveis têm **o mesmo valor** (`oklch(0.577 0.245 27.325)`), ou seja, texto sobre fundo destrutivo fica com contraste **1:1** (latente: hoje o `Badge` destrutivo usa `text-white` fixo, que mede 4,76:1) | Definir `--destructive-foreground: oklch(0.98 0 0)` |
| A7 | `app/globals.css:24-25` (`--border`, `--input`) | 1.4.11 Non-text Contrast | baixa | Bordas de campo (1,12:1) e de tabela (1,31:1) contra o fundo, abaixo de 3:1 | Escurecer `--border`/`--input` para ~0,86 de luminosidade |
| A8 | `components/ui/card.tsx:31` (`CardTitle` é `<div>`) | 1.3.1 Info and Relationships / 2.4.6 Headings and Labels | média | Os títulos dos cartões do painel ("Receitas x despesas", "Funil de adoções", "Estoque baixo", indicadores do topo) **não são headings**: a estrutura de títulos do painel é só `h1` | Renderizar `CardTitle` como `h2`/`h3` (ou aceitar `as="h2"`) |
| A9 | `components/dog-detail-modal.tsx:55` e `components/news-detail-modal.tsx:24` | 4.1.2 Name, Role, Value | baixa | Os dois diálogos públicos têm título, mas **sem descrição**: conferido no navegador, o `aria-describedby="radix-_r_2_"` aponta para um id que não existe no DOM | Incluir um `<DialogDescription>` (ex.: "Detalhes do animal" / "Notícia completa") |
| A10 | `components/ui/dialog.tsx:75` | 3.1.2 Language of Parts | baixa | O botão de fechar do diálogo tem o texto para leitores de tela **em inglês** ("Close") em um produto todo em português | Trocar por "Fechar" |
| A11 | `components/footer.tsx:21-25` e `components/contact-section.tsx:36-76` | 2.5.8 Target Size (Minimum) | baixa | Links do rodapé e de contato medem **21 px** de altura (o mínimo é 24 px) | Dar `inline-block py-2` / `min-h-11` aos links |
| A12 | `components/admin/dog-form-dialog.tsx:102` e `:227` | 1.3.1 / 3.3.2 Labels or Instructions | média | `<Label>` sem `htmlFor` ("Fotos", "Cor do card"): os campos não ficam associados ao rótulo | Dar `id` aos controles e `htmlFor` aos rótulos (ou `aria-label` no botão de upload) |
| A13 | `app/globals.css:58-59` (tema escuro) | 1.4.3 / 1.4.11 | baixa | No tema escuro `--destructive-foreground` sobre `--destructive` dá 2,63:1 e a borda 1,48:1. **Hoje o tema escuro nem é aplicado** (o `ThemeProvider` de `components/theme-provider.tsx` não é montado em `app/layout.tsx`), então o risco é latente | Ajustar os valores ao ativar o tema escuro |
| A14 | `components/admin/adocoes/request-card.tsx:30` e `components/news-section.tsx:70` | 1.3.1 / 2.4.6 | baixa | O nome do adotante e o título da notícia são `<p>`/`<h3>` dentro de `<button>`: o texto do título continua legível, mas fica "achatado" dentro do nome acessível do botão | Manter o título como heading fora do botão, ou repetir o título no `aria-label` do botão |

### Achados corrigidos nesta rodada (`app/admin/news/page.tsx`)

| Antes | Critério | Correção |
|---|---|---|
| Cabeçalho próprio, sem navegação do painel nem skip link | 2.4.1 | Tela migrada para `<AdminShell title="Notícias" actions={…}>` (nenhuma função perdida: criar, editar, excluir, publicar e upload de capa continuam) |
| `<Label>Imagem de capa</Label>` sem `htmlFor` (linha 230) | 1.3.1 / 3.3.2 | `<Label htmlFor="cover-file">` + `id` no `input type="file"` (mantido `sr-only` e com `tabIndex={-1}`) |
| Área de escolha da capa era um `<div onClick>` | 2.1.1 Keyboard | Virou `<button type="button">` que abre o seletor de arquivo pelo teclado |
| Botões só com ícone (confirmar, cancelar, excluir) sem nome | 4.1.2 | Receberam `aria-label` descritivo (`Excluir notícia {título}` etc.) |
| Botão de publicar/sem publicar sem estado | 4.1.2 | `aria-pressed` refletindo a publicação |
| Diálogo sem descrição | 4.1.2 | `<DialogDescription>` adicionado |
| Título do card como `<p>` | 1.3.1 | Virou `<h2>` (estrutura `h1 → h2`) |
| `alt="preview"` da capa | 1.1.1 | `alt="Pré-visualização da imagem de capa"` |

---

## 4. Contraste do tema (calculado)

Razões de contraste a partir das variáveis `oklch` de `app/globals.css` (tema claro, o
que está em uso). Texto normal exige 4,5:1; texto grande (≥ 24 px ou ≥ 18,66 px em negrito)
e componentes gráficos exigem 3:1.

| Combinação | Razão | Mínimo | Situação |
|---|---|---|---|
| `foreground` sobre `background` | 15,53:1 | 4,5:1 | OK |
| `muted-foreground` sobre `background` | 5,82:1 | 4,5:1 | OK |
| `muted-foreground` sobre `muted` | 5,02:1 | 4,5:1 | OK |
| `muted-foreground` sobre `card` | 5,98:1 | 4,5:1 | OK |
| **`primary` (texto) sobre `background`** | **3,72:1** | 4,5:1 | **FALHA** (ok só para texto grande) |
| **`primary` (texto) sobre `bg-accent/10`** | **3,38:1** | 4,5:1 | **FALHA** |
| **`primary-foreground` sobre `primary` (texto de botão, 14 px)** | **3,61:1** | 4,5:1 | **FALHA** |
| **`accent` sobre `bg-accent/20` (estatística do site)** | **2,19:1** | 3:1 | **FALHA** |
| **`secondary` sobre `bg-secondary/10` (estatística do site)** | **2,27:1** | 3:1 | **FALHA** |
| `secondary-foreground` sobre `secondary` | 6,29:1 | 4,5:1 | OK |
| `accent-foreground` sobre `accent` | 6,37:1 | 4,5:1 | OK |
| branco sobre `destructive` (badge "Estoque baixo") | 4,76:1 | 4,5:1 | OK |
| **`destructive-foreground` sobre `destructive`** | **1,00:1** | 4,5:1 | **FALHA** (variáveis iguais) |
| borda de campo (`input`) sobre `background` | 1,12:1 | 3:1 | FALHA (baixa) |
| borda de tabela (`border`) sobre `background` | 1,31:1 | 3:1 | FALHA (baixa) |
| anel de foco (`ring` = `primary`) sobre `background` | 3,72:1 | 3:1 | OK |

Tema escuro (`.dark`, hoje não aplicado): `primary` 7,18:1, `foreground` 16,27:1,
`muted-foreground` 7,60:1 — todos OK; continuam as falhas de `destructive-foreground`
(2,63:1) e da borda (1,48:1).

---

## 5. Conclusão

- O painel está em boa forma: casca única com navegação, skip link, marcos, um `h1` por
  tela, rótulos associados, foco visível, diálogos Radix com foco preso e `Esc`, gráficos
  com alternativa textual e tabelas equivalentes.
- As falhas que mais pesam estão **na paleta do tema** (A4, A5, A6), porque alcançam
  todo o site público e o painel de uma vez: o azul primário usado como texto de 14 px
  fica em 3,6:1 e os números "8 Anos"/"100%" em 2,2:1.
- As falhas pontais de teclado/touch estão no site público (A1, A2, A11) e no login (A3).
- A tela `/admin/news` foi migrada para a casca nova e está conforme: `h1` único,
  navegação do painel, skip link, rótulos, nomes acessíveis, `aria-pressed` e diálogo
  com descrição.
- Nenhum achado foi corrigido fora de `app/admin/news/page.tsx` — conforme a regra da
  rodada, os demais estão documentados acima para o maestro distribuir.
- Recomenda-se refazer esta auditoria depois de aplicar as correções de contraste
  (A4–A6) e de tamanho de alvo (A1), medindo novamente as razões.

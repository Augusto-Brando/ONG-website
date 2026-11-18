# Componentes

"Astryx" = use o componente do Astryx com o tema da marca. "Próprio" = crie no projeto seguindo esta especificação. Exemplos de código em `examples/`.

## Botão · Astryx (Button) com variações da marca

| Variação | Fundo | Texto | Borda/sombra | Quando |
|---|---|---|---|---|
| Ação | `--ant-acao` | `--ant-tinta` | degrau `--ant-sombra-degrau` | Uma por área: "Quero adotar", "Enviar pedido", "Copiar chave Pix" |
| Azul | `--ant-azul` | branco | nenhuma | "Quero ser sócio", "Tentar de novo" |
| Contorno | transparente | `--ant-azul` | 2 px `--ant-azul`, hover fundo `--ant-azul-suave` | Segundo apelo: "Quero ajudar", "Doar", "Voltar" |
| Link com seta | nenhum | `--ant-azul` | nenhuma, seta anda 6 px no hover | "Ver todos os animais →" |
| Ícone | `--ant-branco` ou `--ant-sol-suave` | ícone 2,2 px de traço | `--ant-sombra-sm` | Coração, compartilhar, menu. Sempre `aria-label` |

Forma: pílula, altura 48 px (padrão), 56 px (principal), 44 px mínimo. Texto Nunito 800. Estados: hover sobe 3 px, clique afunda 2 px (`motion.css` > `.ant-botao`), carregando mostra spinner e troca o rótulo ("Enviando…") e fica desabilitado para novos cliques, foco com `--ant-foco`.

## Chip de filtro · Astryx (ToggleButton/Chip)

Pílula 44 a 48 px. Inativo: branco com borda 2 px `--ant-areia`. Ativo de espécie: `--ant-tinta` com texto branco. Ativo de atributo: `--ant-azul-suave` com borda e texto azul. Filtros aplicados viram etiquetas removíveis ("Médio ×") em `--ant-sol-suave`.

## Etiqueta · Astryx (Badge)

Pílula pequena, `--ant-sol-suave`, texto Nunito 800 13 px. Ex.: Castrado, Vacinado. Em cima de foto: `--ant-azul-escuro` com texto branco.

## Cartão de animal (polaroide) · Próprio

Estrutura: `article.ant-polaroide.ant-polaroide--interativa` com `--ant-inclinacao` alternando entre -1,5°, 1°, -1°, 1,5°.

1. Fita (`.ant-fita`), decorativa, `aria-hidden`.
2. Foto em moldura com raio 20 px. Proporção fixa por contexto (lista 4:5, 4:3 ou 1:1 alternando no desktop, 4:5 no celular). `object-fit: cover`, ponto focal no rosto. Sem foto: fundo `--ant-foto-n` + pata + "sem foto ainda".
3. Botão de coração no canto superior direito da foto (48 px, branco), `aria-label="Quero conhecer {nome}"`, `aria-pressed`.
4. Nome (Baloo 2 800), linha de dados em azul ("Cão · Golden · 3 anos"), nota manuscrita de personalidade em Caveat laranja-texto ("ama passeios").
5. Etiquetas de saúde.
6. Ação: "Conhecer {nome}" em botão de ação de largura total, ou o cartão inteiro como link com o nome como texto do link.

Nunca incline mais de 3°. No celular, cartões em 2 colunas e menos texto (sem etiquetas e sem botão).

## Número de impacto · Próprio

Valor em Baloo 2 800, rótulo Nunito 600 abaixo. Conta do zero ao valor quando entra na tela, uma vez (`examples/useContador.ts`). Faixa azul `--ant-azul` com texto branco no desktop e grade 2x2 no celular. Sem dado da API: mostre esqueleto, não um número.

## Barra de meta de campanha · Próprio (ou Astryx Progress com tema)

Trilho em pílula 18 a 22 px. Preenchimento `--ant-sol` sobre fundo escuro, ou `--ant-acao` sobre fundo claro. Abaixo: "R$ {arrecadado} de R$ {meta}" e "{n}% da meta". `role="progressbar"` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. Enche ao entrar na tela.

## Copiar chave Pix · Próprio

Chave em Baloo 2 800 grande, botão de ação "Copiar chave Pix". Ao clicar: copia, botão vira `--ant-azul-escuro` com texto branco, ícone de certo e rótulo "Chave copiada!" por 2,8 s, e uma região `role="status"` diz "Cole no app do seu banco. Obrigado por ajudar!". Se a cópia falhar, selecione o texto da chave e mostre "Copie a chave selecionada". Ver `examples/CopiarPix.tsx`.

## Assistente de etapas (Quero adotar) · Astryx (form-wizard)

- Barra de 4 segmentos (azul para feito e atual, `--ant-areia` para futuro), "Passo N de 4" e uma nota manuscrita ("Leva uns 3 minutos").
- Etapas: 1 Seus dados (nome, WhatsApp, e-mail, cidade) · 2 Moradia e rotina (rádios grandes em cartão) · 3 Mensagem (opcional) · 4 Consentimento LGPD (checkbox obrigatório) · Sucesso.
- Coluna lateral com mini polaroide do animal pedido. No celular ela vai para o topo.
- Validação ao avançar, erro abaixo do campo com ícone e texto, foco vai para o primeiro campo com erro.
- Envio: botão com spinner "Enviando…". Falha: banner de erro mantendo os dados. Sucesso: sol, "Pedido enviado!", próximos passos (Triagem, Conversa, Visita) e "Ver outros animais".
- Campos: raio 16, borda 2 px `--ant-areia-forte`, altura 52 px, rótulo visível acima (nunca só placeholder).

## Cabeçalho do site · Astryx (shell-top-nav)

Logo SVG à esquerda (64 px de altura no desktop, 52 px no celular, sem cartão por trás). Links Nunito 800: Animais, Como adotar, Doe e seja sócio, Contato. Página atual em azul com sublinhado amarelo de 3 px. "Doar" como botão de ação. No celular: logo e botão de menu redondo.

## Barra fixa de rodapé (celular, site público) · Próprio

Fixa no rodapé, 96 px com área segura, fundo `--ant-creme` e sombra para cima. Dois botões dividindo a largura: "Quero adotar" (ação) e "Doar" (contorno). Na página do animal: "Quero adotar o {nome}" + botão redondo de WhatsApp.

## Estados

- **Carregando:** cartões fantasma (`.ant-esqueleto`) na mesma forma do conteúdo e "Procurando os focinhos…" em Caveat com `role="status"`.
- **Vazio:** sol pequeno com pata branca no centro, título Baloo ("Nenhum focinho com esses filtros"), uma frase de ajuda, ação "Limpar filtros" e link de WhatsApp.
- **Erro:** círculo pêssego com ícone de alerta, título ("Não conseguimos buscar os animais"), frase com `role="alert"` dizendo o que foi mantido, botão azul "Tentar de novo" e link de WhatsApp.
- **Sucesso:** sol grande com coração laranja, título Baloo, nota manuscrita, próximos passos.

## Rodapé

Faixa `--ant-tinta`, slogan em Caveat amarelo, WhatsApp, e-mail e Instagram com rótulos em amarelo.

## Ícones

Traço arredondado de 2 a 2,4 px, `stroke-linecap: round`, sem preenchimento (exceto coração ativo e pata). Decorativos com `aria-hidden="true"`. Nunca emoji.

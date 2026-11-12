# Telas

Ordem das seções de cada tela. Modelos do Astryx indicados vêm do briefing: confirme o nome exato no repositório antes de usar.

## Site público

### Home · `centered-hero` ou `gallery-hero`, `mixed-gallery`, `shell-top-nav`
1. Cabeçalho.
2. Hero em duas colunas: à esquerda slogan em Caveat azul, título "Todo focinho merece um lar." (com "lar" em azul), frase sobre a ONG e dois botões (Quero adotar · Quero ajudar). À direita, sol grande com foto de destaque em forma orgânica e um adesivo inclinado com nome e personalidade ("Thor, 3 anos · ama passeios"). No celular, a foto vem primeiro.
3. Faixa azul de impacto com 4 números da API (resgatados, adoções no ano, castrações, anos de atuação).
4. "Conheça quem quer ir para casa": chips Todos/Cães/Gatos, link "Ver todos →", 4 cartões polaroide (no celular, carrossel horizontal com encaixe).
5. "Como funciona a adoção" em fundo `--ant-sol-suave`: 4 passos com círculos laranja numerados.
6. Histórias de adoção: antes e depois em duas polaroides, carimbo "ADOTADO!" opcional.
7. Campanha ativa (bloco escuro com sol e barra de meta) + Pix + sócio contribuinte.
8. Notícias (cartões simples, 3 por linha).
9. Rodapé.

### Lista de animais · `classic-gallery` ou `mixed-gallery`
Título "Animais para adoção" + nota "{n} focinhos esperando por você" + sol no canto. Desktop: coluna de filtros de 280 px (espécie, sexo, porte, idade, saúde, Limpar) e grade de polaroides. Celular: chips de espécie, botão "Filtros (n)" que abre painel inferior, seletor de ordenação, etiquetas removíveis. "Mostrando X de Y" e "Mostrar mais animais". Estados: carregando, vazio, erro.

### Página do animal · `product-detail` adaptado
"← Todos os animais". Esquerda: polaroide grande com fita e nota manuscrita, miniaturas abaixo. Direita: espécie e raça em Caveat, nome enorme (96 px), frase de personalidade, ficha em blocos (idade, peso, porte, sexo, castrado, vacinado), cartão de ação (Quero adotar o {nome}, Perguntar no WhatsApp, Compartilhar, "Toda adoção inclui…"). Abaixo: Como ele é (etiquetas + texto), Cuidados (lista numerada), Focinhos parecidos (3 polaroides). Celular: barra fixa com "Quero adotar o {nome}" + WhatsApp.

### Quero adotar · `form-wizard`
Cabeçalho simplificado (logo + "Sair do pedido"). Ver componente Assistente de etapas.

### Doe e seja sócio · `detail-page`, `contact-form`
Título "Seu apoio vira ração, vacina e um lar". Dois blocos lado a lado: Pix (QR + chave + copiar) e Sócio contribuinte (a partir de R$ 50/mês, 3 passos, WhatsApp e e-mail). Faixa azul-escura de campanhas com metas. Transparência: barras por categoria (veterinário e castrações, ração, medicamentos, outros) com percentuais da API e link para a prestação de contas.

## Painel administrativo (próxima fase)

Mesma paleta e tipografia, mais sóbrio: fundo `--ant-branco`/`--ant-creme`, sem polaroides inclinadas, sem notas manuscritas, sol só no login.

- Login · `login-split`: lado esquerdo com sol e logo, direito com formulário.
- Painel · `dashboard`, `dashboard-scorecard`: números de impacto, gráficos simples.
- CRM de adoções · `kanban-board`: colunas novo, triagem, entrevista, visita, aprovado, adotado, pós-adoção. Cartão com mini foto, nome do animal, nome do adotante e dias na etapa.
- Listas · `table-filter`, `table-page`: animais, tratamentos, estoque, doações, financeiro. Formulários em diálogo.
- Navegação · `shell-side-nav`, `settings-sidebar`.

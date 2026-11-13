# Manual do painel — ONG Amor não tem Raça

Este manual é para a equipe da ONG. Ele explica, tela por tela, como usar o painel do sistema
(`/admin`) no dia a dia: cadastrar animais, acompanhar adoções, registrar doações e despesas,
controlar o estoque e tirar relatórios.

Não é preciso saber programação. Se algo não estiver aqui, procure o responsável técnico do projeto.

---

## 1. Antes de começar

### 1.1 O que é o painel

O painel é a parte do sistema que só a equipe vê. O site público (a vitrine de animais) mostra
apenas o que você cadastra aqui. Tudo o que é digitado no painel fica salvo no banco de dados da
ONG e pode ser consultado depois.

### 1.2 Como entrar

1. Abra o endereço do painel no navegador (no computador da ONG, `http://localhost:3000/admin`;
   em produção, o endereço do site seguido de `/admin`).
2. Se você ainda não estiver conectado, o sistema leva para a tela **Área Administrativa**.
3. Digite seu **e-mail** e sua **senha** e clique em **Entrar**.
4. Você cai direto no **Painel**.

Detalhes importantes:

- A sessão dura **12 horas**. Depois disso é preciso entrar de novo.
- Depois de **10 tentativas erradas** no mesmo computador, o sistema bloqueia novas tentativas por
  **15 minutos** (“Muitas tentativas. Tente novamente em 15 minutos.”). Espere e tente outra vez.
- Se a senha estiver errada, aparece a mensagem “E-mail ou senha incorretos”. A mensagem é a mesma
  para e-mail inexistente e senha errada — isso é proposital, para não revelar quem tem conta.

### 1.3 Como sair

Clique no ícone de **porta com seta** no canto superior direito (o botão tem o nome acessível
“Sair”). Você volta para a tela de login. **Sempre saia** quando usar um computador compartilhado.

### 1.4 A tela do painel por dentro

Todas as telas têm a mesma estrutura:

- **Cabeçalho**: logo da ONG, a palavra “Admin”, seu nome e seu perfil, e o botão de sair.
- **Menu de módulos** (abaixo do cabeçalho): só aparecem os módulos que o **seu perfil** pode usar.
  O módulo em que você está fica destacado.
- **Título e descrição** da tela, com os botões de ação à direita (por exemplo, “Adicionar”).
- **Conteúdo** da tela.

O menu rola para os lados no celular. Em telas pequenas, alguns textos dos botões ficam só com o
ícone — o nome continua disponível para leitores de tela.

### 1.5 Perfis de acesso (quem vê o quê)

| Módulo | Administrador | Voluntário | Financeiro |
|---|---|---|---|
| Painel (indicadores) | sim | sim | sim |
| Animais | sim | sim | não |
| Tratamentos | sim | sim | não |
| Estoque | sim | sim | sim |
| Adoções | sim | sim | não |
| Doações e campanhas | sim | não | sim |
| Financeiro | sim | não | sim |
| Relatórios e exportação | sim | não | sim |
| Voluntários | sim | sim | não |
| Notícias | sim | sim | não |
| Usuários | sim | não | não |

Se você tentar abrir um endereço de módulo que o seu perfil não tem, o sistema devolve você ao
Painel. Isso vale também para as telas que você não vê no menu.

### 1.6 Coisas que aparecem em todas as telas

- **Mensagens verdes** (canto da tela) confirmam o que deu certo: “Animal cadastrado!”,
  “Doação excluída.”, etc.
- **Mensagens vermelhas** avisam o que deu errado. Em geral basta tentar de novo; se persistir,
  avise o responsável técnico.
- **Janelas (diálogos)** abrem por cima da tela para cadastrar ou editar. Elas fecham no botão
  **Cancelar**, no “X” ou com a tecla **Esc**.
- **Exclusões** quase sempre pedem confirmação: ou aparece uma janela do navegador (“OK/Cancelar”),
  ou o botão de lixeira se transforma em dois botões (✔ para confirmar, ✕ para desistir).
- **Tabelas** rolam para os lados quando têm muitas colunas.

---

## 2. Painel (visão geral)

Endereço: `/admin/painel` — é a primeira tela depois do login.

O Painel reúne os números do dia a dia. Ele **só mostra o que o seu perfil pode ver**: o Financeiro
não vê adoções, o Voluntário não vê dinheiro, e assim por diante.

### 2.1 Cartões de indicadores

No topo aparecem cartões como:

- **Animais disponíveis** — quantos estão na vitrine do site.
- **Adoções abertas** — solicitações que ainda estão em andamento.
- **Doações do mês** — total arrecadado no mês corrente.
- **Saldo do mês** — receitas menos despesas do mês.
- **Itens com estoque baixo** — quantos itens estão abaixo do mínimo.

Cada cartão é um atalho: clicar nele leva ao módulo correspondente.

### 2.2 Gráficos

- **Receitas x despesas** — barras dos últimos 6 meses.
- **Doações por mês** — quanto entrou de doação em cada um dos últimos 6 meses.
- **Funil de adoções** — quantas solicitações estão em cada etapa (Novo, Triagem, Entrevista,
  Visita, Aprovado, Adotado, Pós-adoção).

Os gráficos têm uma descrição em texto para quem usa leitor de tela.

### 2.3 Listas de alerta

- **Estoque baixo** — itens abaixo da quantidade mínima, com o saldo atual.
- **Próximos tratamentos** — vacinas, consultas e retornos previstos para os **próximos 30 dias**
  (até 8 itens).

### 2.4 Atualizar

O botão **Atualizar** (com ícone de seta circular) recarrega os números. Use depois de lançar algo
em outra aba do navegador.

---

## 3. Animais

Endereço: `/admin` (o menu chama de **Animais**).

É o cadastro dos cães e gatos. Cada animal aparece em um cartão com foto, nome, espécie, raça,
idade, situação e cor.

### 3.1 Cadastrar um animal

1. Clique em **Adicionar** (canto superior direito).
2. Preencha a janela **Novo Animal**:

| Campo | Obrigatório | O que colocar |
|---|---|---|
| Fotos | não | Uma ou várias imagens. A **primeira é a capa** (a que aparece no site). |
| Nome | sim | Nome do animal. |
| Raça | não | Já vem “Vira-lata”; troque se souber. |
| Idade | sim | Texto livre, por exemplo “2 anos” ou “3 meses”. |
| Peso | não | Texto livre, por exemplo “15kg”. |
| Descrição | sim | Personalidade e história, em 2 ou 3 frases. Aparece no site. |
| Observações | não | Cuidados especiais, histórico de saúde. Uso interno. |
| Cor do card | não | Quatro opções (laranja, roxo, rosa, azul). É só a bolinha de cor do cartão. |
| Espécie | não | Cão ou Gato. |
| Sexo | não | Macho, Fêmea ou Não informado. |
| Situação | não | Disponível, Em processo de adoção, Em tratamento, Adotado, Indisponível. |
| Data do resgate | não | Data em que o animal chegou à ONG. |
| Castrado / Vacinado | não | Marque as caixinhas conforme a realidade. |

3. Clique em **Cadastrar**. A janela fecha e o cartão novo aparece na lista.

**Fotos:** clique na área tracejada “Adicionar fotos” e escolha uma ou várias imagens do computador
ou do celular. Formatos aceitos: JPG, PNG, WEBP, GIF e AVIF, até **8 MB** por arquivo. Passando o
mouse sobre uma foto aparecem dois botões: a **estrela** transforma aquela foto em capa e o **X**
remove a foto do animal.

### 3.2 Editar

Clique em **Editar** no cartão do animal. A janela abre com os dados atuais; mude o que precisar e
clique em **Salvar alterações**.

### 3.3 Excluir

Clique na **lixeira** do cartão. O botão vira ✔ e ✕: confirme no ✔ (ou desista no ✕). A exclusão é
definitiva — se o animal só saiu da ONG, prefira mudar a **Situação** para “Adotado” ou
“Indisponível”.

### 3.4 O que aparece no site

A vitrine do site mostra **somente** os animais com situação **Disponível** ou **Em processo de adoção**.
Animais "Em tratamento", "Adotado" ou "Indisponível" ficam só no painel, para a equipe.

- Para tirar um animal do site, mude a **Situação** dele (por exemplo, "Indisponível").
- Quando uma adoção é fechada na tela de Adoções (etapa "Adotado"), o animal sai do site sozinho.
- Se a adoção for desfeita (a solicitação volta para uma etapa anterior), o animal volta para o site.

## 4. Tratamentos

Endereço: `/admin/tratamentos`.

Registra vacinas, vermífugos, castrações, consultas, medicações, cirurgias e exames de cada animal.

### 4.1 A tela

- **Próximos tratamentos** (no topo): o que está agendado ou tem retorno previsto para os próximos
  30 dias. É o que precisa de atenção primeiro.
- **Filtros**: por **Animal** e por **Status** (Agendado, Realizado, Cancelado). “Todos” limpa o
  filtro.
- **Tabela**: data, animal, tipo, descrição, veterinário, custo, status e próxima data.

### 4.2 Registrar um tratamento

1. Clique em **Novo tratamento**.
2. Preencha:

| Campo | Obrigatório | Observação |
|---|---|---|
| Animal | sim | Escolha na lista. |
| Tipo | sim | Vacina, Vermífugo, Castração, Consulta, Medicação, Cirurgia, Exame, Outro. |
| Status | sim | Agendado, Realizado ou Cancelado. |
| Data | sim | Data do tratamento. |
| Próxima data | não | Quando há retorno (ex.: reforço de vacina). Alimenta a lista de próximos. |
| Veterinário | não | Nome de quem atendeu. |
| Custo (R$) | não | Só o número, com ponto decimal (ex.: `120.50`). |
| Descrição | não | O que foi feito. |
| Observações | não | Detalhes internos. |

3. Clique em **Salvar**.

### 4.3 Regra do custo (importante)

Quando o status é **Realizado** e o custo é **maior que zero**, o sistema cria sozinho uma
**despesa** no Financeiro, na categoria de veterinária, com a data do tratamento. Se você corrigir o
custo ou mudar o status, o lançamento é atualizado; se o custo virar zero ou o status deixar de ser
“Realizado”, o lançamento é apagado. **Não lance essa despesa duas vezes** no Financeiro.

### 4.4 Editar e excluir

Use os botões de lápis (editar) e lixeira (excluir) na última coluna. A exclusão pede confirmação e
também remove a despesa vinculada.

---

## 5. Estoque

Endereço: `/admin/estoque`.

Controla ração, medicamentos, material de higiene e limpeza, acessórios e outros itens.

### 5.1 A tela

- **Faixa de alerta** (amarela): aparece quando há itens abaixo do mínimo e lista os nomes.
- **Tabela**: nome, categoria, saldo, mínimo e situação (“OK” ou “Estoque baixo”).
- **Últimas movimentações**: histórico de entradas e saídas.

### 5.2 Cadastrar um item

1. Clique em **Novo item**.
2. Preencha **Nome** (obrigatório), **Categoria** (Ração, Medicamento, Higiene, Limpeza,
   Acessório, Outro), **Unidade** (obrigatória: `un`, `kg`, `cx`...), **Quantidade mínima (alerta)** e
   **Observações**.
3. Clique em **Salvar**.

O saldo começa em zero. Para colocar a quantidade que já existe, use **Movimentar** com tipo
**Entrada**.

### 5.3 Registrar entrada ou saída

1. Na linha do item, clique em **Movimentar**.
2. Escolha **Tipo** (Entrada ou Saída), a **Quantidade** (obrigatória), a **Data** (já vem com hoje)
   e o **Motivo** (ex.: “doação recebida”, “uso nos animais”).
3. Clique em **Salvar**. O saldo é atualizado na hora.

O sistema **não deixa** a saída deixar o saldo negativo: se faltar quantidade, ele avisa e não grava.

### 5.4 Editar e excluir

Lápis edita o cadastro do item; lixeira exclui o item **e todo o histórico de movimentações dele**.
Para itens que só acabaram, prefira deixar o saldo em zero em vez de excluir.

---

## 6. Adoções (CRM)

Endereço: `/admin/adocoes`.

Aqui ficam todas as solicitações de adoção, vindas do site ou cadastradas pela equipe. A tela é um
quadro com uma coluna por etapa.

### 6.1 As etapas

| Etapa | Significado |
|---|---|
| **Novo** | Pedido chegou e ninguém olhou ainda. |
| **Triagem** | Alguém já leu e está avaliando. |
| **Entrevista** | Conversa com o interessado marcada ou feita. |
| **Visita** | Visita à casa ou encontro com o animal. |
| **Aprovado** | Adoção aprovada, faltando a entrega. |
| **Adotado** | Animal entregue. |
| **Pós-adoção** | Acompanhamento depois da entrega. |
| **Recusado** | Pedido recusado (fica em “Encerradas”). |
| **Desistiu** | O interessado desistiu (fica em “Encerradas”). |

As sete primeiras aparecem sempre. **Recusado** e **Desistiu** ficam dentro do botão
**Encerradas (n)**, que abre e fecha.

### 6.2 Passo a passo: do site até o pós-adoção

1. **O pedido chega.** No site, a pessoa abre a ficha de um animal, clica em **Quero adotar**, preenche
   nome, telefone, e-mail, cidade, tipo de moradia, se tem outros animais e uma mensagem, e marca o
   **consentimento LGPD** (obrigatório). O sistema cria a solicitação na etapa **Novo** e envia um
   e-mail de confirmação para o interessado (quando ele informou e-mail) e um aviso de “Nova
   solicitação de adoção” para a caixa configurada em `ADMIN_NOTIFY_EMAIL`.
2. **Triagem.** Abra o cartão, leia a mensagem e confira os dados. Se fizer sentido, mude a etapa para
   **Triagem** na caixinha “Etapa” do próprio cartão.
3. **Contato.** Ligue ou mande mensagem. Depois, abra o cartão e registre o contato em
   **Registrar interação**: escolha o **Tipo** (Nota, Ligação, WhatsApp, E-mail, Visita) e escreva o
   **Conteúdo**. Isso monta o histórico da conversa.
4. **Entrevista e visita.** Mude a etapa conforme o processo anda. A cada mudança o sistema envia um
   e-mail automático ao interessado contando a nova etapa.
5. **Aprovação.** Etapa **Aprovado**.
6. **Entrega.** Ao mudar para **Adotado** (ou **Pós-adoção**), o animal vinculado passa
   automaticamente para a situação “Adotado”, recebe a data de adoção e sai da vitrine do site.
7. **Pós-adoção.** Acompanhe por telefone e registre as interações. Quando terminar, deixe em
   **Pós-adoção**.
8. **Encerrar.** Se o pedido não seguir, mude para **Recusado** ou **Desistiu**. A solicitação sai do
   quadro principal e vai para “Encerradas”.

Se você voltar uma solicitação de “Adotado”/“Pós-adoção” para uma etapa anterior, a data de adoção do
animal é desfeita e ele volta para “Em processo de adoção”.

### 6.3 Cadastrar um pedido que chegou por WhatsApp ou telefone

1. Clique em **Nova solicitação**.
2. Escolha o **Interessado** na lista. Se for pessoa nova, preencha **Nome** (obrigatório),
   **Telefone** (obrigatório), **E-mail** e **Cidade** — o cadastro é criado junto.
3. Escolha o **Animal** (ou “Sem animal definido”, se a pessoa ainda não escolheu).
4. Informe a **Origem** (Site, WhatsApp, Instagram, Evento, Outro) e a **Mensagem**.
5. Clique em **Criar**. A solicitação entra em **Novo**.

### 6.4 O cartão e a janela de detalhe

No cartão aparecem o nome do interessado, o animal, a origem, a data e a caixinha **Etapa**.
Clicando no nome abre a janela com:

- **Interessado**: nome, telefone, e-mail, cidade, moradia, se tem outros animais, consentimento
  LGPD (com a data) e o animal vinculado.
- **Mensagem do interessado** (o texto do formulário).
- **Histórico de interações**, do mais recente para o mais antigo.
- **Registrar interação** (tipo + conteúdo).

### 6.5 Privacidade (LGPD)

Os dados do interessado são pessoais. Use só para o processo de adoção, não copie para grupos ou
planilhas paralelas, e não repasse a terceiros. As exportações de adoções **não incluem telefone nem
e-mail** justamente por isso.

---

## 7. Doações e campanhas

Endereço: `/admin/doacoes`. A tela tem duas abas: **Doações** e **Campanhas**.

### 7.1 Aba Doações

**Filtros**: **De** e **Até** (datas), **Tipo** (Dinheiro, Ração, Medicamento, Material, Outro) e o
botão **Limpar filtros**.

**Registrar uma doação:**

1. Clique em **Nova doação**.
2. Preencha:

| Campo | Obrigatório | Observação |
|---|---|---|
| Doador | não | Em branco = “Anônimo”. |
| E-mail / Telefone | não | Contato do doador. Uso interno. |
| Tipo | sim | Dinheiro, Ração, Medicamento, Material, Outro. |
| Valor (R$) | não | Só para doações em dinheiro. |
| Forma | não | Pix, Dinheiro, Transferência, Cartão, Outro. |
| Data da doação | sim | Já vem com hoje. |
| Campanha | não | Vincule se a doação for de uma campanha. |
| Descrição | não | Ex.: “20 kg de ração adulto”. |

3. Clique em **Salvar**.

**Regra do dinheiro:** doação do tipo **Dinheiro** com valor maior que zero gera automaticamente uma
**receita** no Financeiro. Doações de ração, medicamento ou material **não** geram lançamento
financeiro (o caminho certo para elas é dar entrada no **Estoque**).

**Excluir** uma doação (lixeira) também apaga o lançamento financeiro vinculado. A janela de
confirmação avisa disso.

### 7.2 Aba Campanhas

Cada campanha aparece em um cartão com título, período, situação (Ativa/Encerrada), valor arrecadado,
meta e uma barra de progresso com a porcentagem da meta.

**Criar campanha** (botão **Nova campanha**): **Título** (obrigatório), **Descrição**, **Meta (R$)**,
**Início** (obrigatório), **Fim** e a caixinha **Campanha ativa**.

**Editar** (lápis) corrige os dados. **Encerrar** (quadrado) desmarca a campanha como ativa — ela
continua no histórico, mas não recebe mais doações novas por engano.

O valor arrecadado é a soma das doações vinculadas àquela campanha.

---

## 8. Financeiro

Endereço: `/admin/financeiro`.

Mostra **receitas**, **despesas** e **saldo** do período escolhido. Ao abrir, o período já vem como o
**mês atual**.

### 8.1 A tela

- **Cartões**: Receitas, Despesas e Saldo do período.
- **Filtros**: **De**, **Até**, **Tipo** (Receita/Despesa/Todos) e **Limpar** (volta ao mês atual).
- **Tabela** de lançamentos, com editar e excluir.

### 8.2 Lançar uma receita ou despesa

1. Clique em **Novo lançamento**.
2. Escolha o **Tipo** (Receita ou Despesa), escreva a **Categoria** (texto livre, ex.: `racao`,
   `veterinario`, `evento`), o **Valor (R$)** e a **Data** (obrigatórios) e, se quiser, a
   **Descrição**.
3. Clique em **Salvar**.

### 8.3 O que entra sozinho

- **Doação em dinheiro** → receita.
- **Tratamento realizado com custo** → despesa.

Esses lançamentos aparecem com a origem indicada. Se precisar corrigir, corrija **na tela de
origem** (Doações ou Tratamentos) para não ficar com valores diferentes nos dois lugares.

### 8.4 Excluir

A lixeira exclui o lançamento depois da confirmação. Lançamentos vindos de doação ou tratamento
devem ser excluídos na origem.

---

## 9. Relatórios e exportação

Endereço: `/admin/reports`.

### 9.1 Resumo e relatório de animais

No topo: **Animais cadastrados**, **Disponíveis para adoção** e **Adoções/Saídas registradas**.
Abaixo, três tabelas: quantidade por categoria/raça, histórico de adoções e registros de entradas e
saídas.

Dois botões no cabeçalho:

- **PDF** — abre a janela de impressão do navegador com o relatório formatado. Para salvar em PDF,
  escolha “Salvar como PDF” no destino da impressão.
- **Planilha** — baixa um arquivo CSV com o mesmo conteúdo, para abrir no Excel.

### 9.2 Exportar dados (CSV)

A seção **Exportar dados (CSV)** baixa os dados completos de cada área:

1. Se quiser, escolha o período em **De** e **Até** (deixe em branco para exportar tudo).
2. Clique no botão da área: **Animais**, **Adoções**, **Doações**, **Financeiro**, **Estoque** ou
   **Tratamentos**.
3. O arquivo é baixado com o nome da área e a data (ex.: `doacoes-2026-11-12.csv`).

O arquivo abre no Excel e no LibreOffice com acentos corretos e colunas separadas. Se a data inicial
for depois da final, os botões ficam bloqueados e aparece um aviso.

**Privacidade:** as exportações de **adoções** e **doações** não trazem telefone nem e-mail dos
interessados e doadores. Nome e cidade do interessado aparecem nas adoções, porque são necessários
para o acompanhamento.

Toda exportação fica registrada na auditoria do sistema (quem exportou, o quê e quando).

---

## 10. Voluntários

Endereço: `/admin/voluntarios`.

Cadastro de quem ajuda a ONG. A tabela mostra nome, contato, disponibilidade, habilidades e situação
(Ativo/Inativo).

**Cadastrar voluntário**: clique em **Adicionar** (a janela se chama *Novo voluntário*) e preencha
**Nome** (obrigatório), **Telefone**, **E-mail**, **Disponibilidade** (ex.: “sábados de manhã”),
**Habilidades** (ex.: “passeios, redes sociais”), a caixinha **Ativo** e a caixinha
**Autorizou o uso dos dados (LGPD)**.

Use **Ativo** para tirar da lista quem saiu sem apagar o histórico. A lixeira exclui o cadastro.

---

## 11. Notícias

Endereço: `/admin/news`.

As notícias cadastradas aqui aparecem na seção de notícias da página inicial do site.

**Nova notícia**: clique em **Adicionar** (a janela se chama *Nova Notícia*) e preencha
**Imagem de capa** (opcional, clique na área tracejada), **Título** (obrigatório),
**Resumo** (obrigatório — é o texto curto do cartão na Home), **Conteúdo completo**, **Data de
publicação** e o botão de visibilidade (**Ativa (visível na Home)** / **Inativa (oculta da Home)**).

- **Ativa** = aparece no site. **Inativa** = fica guardada, sem aparecer.
- O cartão mostra a situação (Ativa/Inativa) e a data.
- Lápis edita; lixeira exclui (com confirmação em ✔/✕).

---

## 12. Usuários e perfis

Endereço: `/admin/usuarios` — **só o Administrador** vê esta tela.

Aqui se cria quem pode entrar no painel. A tabela mostra nome, e-mail, perfil, situação (Ativo/Inativo)
e último acesso. O seu próprio nome aparece com “(você)”.

**Novo usuário**: **Nome**, **E-mail**, **Perfil** (Administrador, Voluntário ou Financeiro), **Senha**
(mínimo 8 caracteres) e a caixinha **Ativo**. A descrição da janela explica o que o perfil escolhido
enxerga.

- **Editar**: para trocar a senha, digite a nova; para manter a atual, deixe o campo em branco.
- **Inativo**: a pessoa continua cadastrada, mas não consegue entrar.
- **Excluir**: não é possível excluir o próprio usuário (o botão fica desabilitado).
- Não é possível cadastrar dois usuários com o mesmo e-mail.

**Esqueceu a senha?** Não há recuperação automática: um Administrador entra em Usuários, edita o
cadastro e define uma senha nova.

---

## 13. Perguntas frequentes

**O animal não aparece no site. Por quê?**
Confira se ele está cadastrado e se tem foto de capa e descrição. Atenção: na versão atual a vitrine
mostra **todos** os animais, qualquer que seja a situação (ver seção 3.4) — se ele não aparece, é
sinal de cadastro faltando ou de falha de conexão com o banco; avise o responsável técnico.

**Apaguei um animal sem querer. Dá para voltar?**
Não pela tela. O sistema tem backup do banco (veja `docs/backup-e-restauracao.md` com o responsável
técnico). Por isso, prefira mudar a situação em vez de excluir.

**Lancei uma doação em dinheiro e o Financeiro ficou com o dobro.**
Provavelmente a receita foi lançada à mão **e** a doação gerou a receita automática. Exclua o
lançamento manual no Financeiro e mantenha o que veio da doação.

**Mudei o status do tratamento para “Realizado” e apareceu uma despesa. Foi erro?**
Não. Tratamento realizado com custo vira despesa automaticamente. Se o valor estiver errado, corrija
o custo no próprio tratamento.

**A pessoa desistiu da adoção. Apago a solicitação?**
Não. Mude a etapa para **Desistiu**. Assim o histórico fica guardado e o animal volta a ficar
disponível (se for o caso, ajuste a situação do animal em Animais).

**Como faço o animal voltar para a vitrine depois de uma adoção desfeita?**
Mude a etapa da solicitação para uma etapa anterior a “Adotado” (o animal volta para “Em processo de
adoção”) e, em Animais, ajuste a situação para **Disponível**.

**O e-mail para o interessado não chegou.**
O envio de e-mail nunca interrompe o cadastro: se o servidor de e-mail estiver fora, a solicitação é
criada do mesmo jeito. Confira a caixa de spam e, se o problema continuar, avise o responsável
técnico (configuração de SMTP).

**Posso usar o painel no celular?**
Sim. As telas foram feitas para funcionar em telas de 390 px; tabelas e o menu rolam para os lados.

**Quem viu meus dados?**
O sistema registra em auditoria os logins, cadastros, alterações, exclusões e exportações. Dados
pessoais não são gravados nos detalhes da auditoria.

**Como saio de todos os computadores?**
A sessão expira sozinha em 12 horas. Para encerrar na hora, use **Sair** no computador em que estiver.
Se precisar bloquear alguém, um Administrador pode marcar o usuário como **Inativo** em Usuários.

---

## 14. Para o responsável técnico

- Documentação de implantação: `docs/implantacao.md`.
- Backup e restauração: `docs/backup-e-restauracao.md`.
- Testes e CI: `docs/testes.md`.
- Banco de dados e API: `docs/banco-de-dados.md` e `docs/api.md`.
- Acessibilidade: `docs/acessibilidade.md`.

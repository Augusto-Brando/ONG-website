# O que falta para o projeto ficar 100%

Guia único do que ainda precisa ser feito no Sistema Integrado de Gestão da ONG Amor não tem Raça
(site + painel ERP/CRM). Atualizado em 16/11/2026. Prazo da extensão: **27/11/2026**.

Marque `[x]` conforme for concluindo. Cada item diz **o que fazer**, **onde** e **como saber que está pronto**.

---

## 0. Onde estamos

**Pronto e funcionando** (branch `teste/redesign`, PR #1, CI verde):

- Site público redesenhado (tema "Sol de Bairro"): vitrine com filtros, ficha do animal, formulário "Quero adotar" em 4 passos, notícias, contato, doação Pix com QR Code e valor, transparência e campanha com meta.
- Painel com login por usuário e perfis (administrador, voluntário, financeiro) e auditoria.
- Módulos: animais, CRM de adoções (Kanban com etapas até pós-adoção e histórico de contatos), tratamentos, estoque com alerta de baixa, doações + "Pix a confirmar", campanhas, financeiro, voluntários, usuários, notícias, relatórios com exportação.
- E-mails automáticos (solicitação recebida, aviso à equipe), `/api/health`, migrações versionadas, seed de demonstração.
- Qualidade: TypeScript sem `ignoreBuildErrors`, ESLint, testes Vitest, teste de ponta a ponta, CI no GitHub Actions (tipos, lint, testes, migrações, build, e2e).
- Documentação: `docs/manual-do-painel.md`, `docs/implantacao.md`, `docs/api.md`, `docs/banco-de-dados.md`, `docs/backup-e-restauracao.md`, `docs/testes.md`, `docs/acessibilidade.md`.
- Demonstração no ar (Vercel, banco Neon **separado** do de produção) e apresentada à ONG em 14/11.

**Falta:** retorno da ONG, segunda fase do redesign do painel, colocar em produção e entregar a etapa final da extensão.

---

## 1. Retorno da ONG (prioridade 1 — orienta o resto)

Respostas às perguntas da apresentação. Registrar cada uma e transformar em tarefa:

- [ ] **Perfis:** os três perfis fazem sentido? Quem da equipe usa cada um? (cria as contas reais na seção 4)
- [ ] **Etapas da adoção:** batem com o processo real? Falta ou sobra alguma? (ajuste em `lib/format.ts`, enum no schema e migração)
- [ ] **Formulário "Quero adotar":** falta alguma pergunta (quintal telado, já teve animal, etc.)?
- [ ] **Pix:** quem confere o extrato para confirmar? Querem confirmação automática no futuro (exige intermediador, ~1% de taxa)?
- [ ] **Dados reais:** fotos e fichas dos animais para cadastrar.
- [ ] **Domínio e e-mail:** a ONG tem domínio próprio e um e-mail para os avisos do sistema?
- [ ] **Visual:** algo que não combina com a ONG?

**Pronto quando:** cada resposta virou um item com responsável (ou foi descartada com motivo).

---

## 2. Painel — fase P2 do redesign

A fase P1 (casca com navegação lateral e login em duas colunas) já está feita. Princípio: **mesma
funcionalidade, nova apresentação** — não mudar APIs, permissões (`can()` em `lib/auth.ts`) nem fluxos.
Um responsável por tela, em paralelo.

- [x] **Painel inicial** (`app/admin/painel/`, `components/admin/painel/`): indicadores em cartões (dashboard/scorecard).
- [x] **CRM de adoções** (`app/admin/adocoes/`, `components/admin/adocoes/`): cartão com mini foto do animal, nome, adotante e **dias na etapa**; mudar etapa pelo teclado.
- [x] **Listas com filtros** e formulários em diálogo, padronizadas: animais, tratamentos, estoque, doações, financeiro, voluntários, usuários, notícias, relatórios.
  Base comum em `components/admin/lista/` (barra de filtros, busca sem acento, estados de carregando, vazio, erro e "nada encontrado") e `lib/busca.ts` (com testes). Diálogos de voluntários, usuários e notícias saíram das páginas.

**Pronto quando:** cada tela abre (200) para os três perfis, sem rolagem horizontal em 1440 px e 390 px,
e `npx tsc --noEmit`, `npm run lint`, `npm test` e `npm run test:e2e` passam.

---

## 3. Ajustes pequenos já conhecidos

- [x] `docs/manual-do-painel.md`, perto da linha 524: o texto diz que a vitrine mostra **todos** os animais, o que contradiz a seção 3.4 (só "Disponível" e "Em processo de adoção"). Corrigir.
- [x] `tsconfig.tsbuildinfo` aparece modificado no Git: incluir no `.gitignore` e remover do repositório.
- [ ] Modo escuro: o design system não define as cores. Decidir entre desenhar ou desligar de vez.
- [ ] WhatsApp: hoje é só um link (`wa.me`). Decidir se basta ou se o plano prometia aviso automático (ver seção 7).

---

## 4. Implantação oficial (produção)

Passo a passo completo em **`docs/implantacao.md`**. Resumo do que falta, junto com o dono do
repositório e do banco de produção:

- [ ] **Antes de tudo:** desligar ou isolar a **prévia automática da Vercel** do projeto atual. Hoje ela usa o banco de **produção**, então uma branch com migração poderia mexer nos dados reais.
- [ ] Revisar e aprovar o **PR #1** (`teste/redesign` → `main`). O merge é decisão do grupo.
- [ ] **Backup** do Neon de produção (branch do Neon ou `pg_dump`), conforme `docs/backup-e-restauracao.md`.
- [ ] Marcar a migração `0000_inicial` como aplicada e rodar `npm run db:migrate` (seção 3.3 e 3.4 do guia). **Nunca** rodar o seed em produção.
- [ ] Cadastrar as variáveis na Vercel (seção 4 do guia): `DATABASE_URL`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `SMTP_*`, `ADMIN_NOTIFY_EMAIL` e `ADMIN_PASSWORD` só para o primeiro acesso.
- [ ] Criar o primeiro administrador, as contas reais de cada pessoa da equipe e **remover `ADMIN_PASSWORD`**.
- [ ] Domínio próprio e HTTPS (se a ONG tiver domínio) e remetente de e-mail verificado.
- [ ] Monitor de disponibilidade apontando para `/api/health`.
- [ ] Cadastrar os animais reais com fotos (no painel, pela equipe ou com a equipe).
- [ ] Treinar a equipe com `docs/manual-do-painel.md`.

**Pronto quando:** o site oficial responde `/api/health` com `db: ok`, a equipe entra com as próprias
contas, um pedido de adoção de teste chega por e-mail e é apagado em seguida.

---

## 5. Segurança e LGPD (checagem final)

- [ ] Conferir que nenhum segredo está no repositório (`git log -p | grep -i "neon.tech\|SMTP_PASS\|SESSION_SECRET="` sem resultado com valores reais).
- [ ] `SESSION_SECRET` forte e exclusivo de produção; senhas das contas com 8+ caracteres.
- [ ] Formulário de adoção com consentimento de uso dos dados; exportações sem telefone e e-mail (já feito; conferir em produção).
- [ ] Rotina de backup combinada: quem faz, com que frequência e onde guarda.

---

## 6. Entrega da extensão (Etapa 4 — até 27/11/2026)

- [ ] Relatório final: o que foi planejado × entregue (por frente do grupo), métricas (telas, endpoints, testes, cobertura do CI), prints e link da demonstração.
- [ ] Registrar o retorno da ONG (seção 1) e as mudanças feitas por causa dele.
- [ ] Evidências de impacto: sistema em produção (ou o plano de implantação aceito pela ONG), equipe treinada.
- [ ] Contribuição de cada integrante (tabela de frentes do planejamento).
- [ ] Apresentação final (slides + demonstração curta seguindo o roteiro usado na ONG).
- [x] README do repositório atualizado com execução local, links para os `docs/` e para este guia.

---

## 7. Fora do escopo agora (melhorias futuras)

Registrar no relatório como próximos passos, sem bloquear a entrega:

- Confirmação automática de Pix por intermediador de pagamento.
- Avisos por WhatsApp (API oficial) além do e-mail.
- Modo escuro, se não entrar na seção 3.
- Política de privacidade completa (dispensada pela ONG por ora).

---

## Ordem sugerida

1. Seção 1 (retorno da ONG) → ajusta o que muda nas seções 2 e 3.
2. Seções 2 e 3 em paralelo.
3. Seção 4 com o dono do repositório e do banco, depois do merge do PR #1.
4. Seção 5 antes de divulgar o endereço oficial.
5. Seção 6 até 27/11/2026.

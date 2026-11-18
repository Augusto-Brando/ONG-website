# Testes

O projeto usa três camadas de teste, do mais barato ao mais caro, mais uma verificação de saúde
usada por monitores e pelo CI:

| Camada | O que é | Onde | Quantidade atual |
|---|---|---|---|
| Unitários | funções puras (formatação, validação, sessão) com Vitest | `tests/*.test.ts` | 48 testes em 3 arquivos |
| Ponta a ponta (E2E) | HTTP de verdade contra o app rodando: telas, CRUD, permissões | `scripts/e2e.mjs` | 42 checagens (41 sem Mailpit) |
| Integração contínua | tipos, lint, unitários, migrações, build e E2E | `.github/workflows/ci.yml` | roda a cada push/PR |
| Saúde | `GET /api/health` (banco responde?) | `app/api/health/route.ts` | 1 endpoint público |

## Como rodar

```bash
npm test                     # unitários (Vitest)
npm run typecheck            # TypeScript
npm run lint                 # ESLint

npm run db:seed              # dados de demonstração (só banco local)
npm run test:e2e             # E2E contra http://localhost:3000

MAILPIT_URL=http://localhost:8025 npm run test:e2e   # E2E incluindo a checagem de e-mails
```

Pré-requisitos do E2E: app no ar (`npm run dev` ou `npm start`) e banco com o seed aplicado
(`npm run db:up && npm run db:migrate && npm run db:seed`).

## Unitários (Vitest)

- `tests/format.test.ts` — `formatDate` (ISO → `DD/MM/AAAA`, `null`/`undefined` viram `—`),
  `formatMoney` (string numérica do Postgres, número, nulo), `label` (chave conhecida,
  desconhecida, nula) e `todayIso` (formato `AAAA-MM-DD`).
- `tests/validators.test.ts` — schemas zod de entrada: formulário público (consentimento
  obrigatório, telefone curto, honeypot preenchido, e-mail vazio aceito), doações (valor
  negativo, data em `DD/MM/AAAA`, e-mail), lançamentos (valor zero, tipo inválido),
  movimentação de estoque (quantidade zero/negativa, coerção de `"5"`), tratamentos (status
  padrão, tipo inexistente), usuários (e-mail normalizado, senha curta, perfil inválido) e
  mudança de etapa (etapa válida e inexistente).
- `tests/auth.test.ts` — hash scrypt (senha certa/errada, salt único, hash malformado),
  sessão assinada (ida e volta, assinatura alterada, corpo trocado, expiração com fake timers)
  e a matriz de permissões `can()` (admin tudo; voluntário sem financeiro e sem usuários).

Os unitários não tocam o banco nem a rede: são rápidos (< 1 s) e rodam em qualquer máquina.

## Ponta a ponta (`scripts/e2e.mjs`)

Porte do roteiro antigo `smoke.sh`: só `fetch` (Node 20+), nenhuma dependência, nenhum acesso
ao banco, com o mesmo conjunto de checagens e mais três acréscimos (saúde, animal fora da
vitrine e volta do animal para a vitrine).

Variáveis:

| Variável | Padrão | Para que serve |
|---|---|---|
| `E2E_BASE_URL` | `http://localhost:3000` | endereço do app sob teste |
| `MAILPIT_URL` | — | se definida, liga a checagem de e-mails no Mailpit |

Comportamento:

- Faz login com os três perfis do seed (`admin`, `voluntario`, `financeiro`, senha `ong12345`)
  e guarda o cookie `admin_session` de cada um em memória. Se um login falhar, a suíte para.
- Não segue redirecionamentos: uma tela que devolva 307/302 para o login conta como falha
  (é o que garante que a tela está realmente protegida e acessível com sessão).
- Cada execução usa um IP de teste próprio (`x-real-ip`) no formulário público, para que rodar
  a suíte várias vezes não esbarre no limite de 5 envios por IP a cada 10 minutos.
- Ao final, devolve o animal do teste para a vitrine (`PATCH` da solicitação de volta para
  `novo`), então a suíte pode rodar de novo sem refazer o seed. O animal usado é escolhido em
  tempo de execução entre os que estão disponíveis.
- Saída só com caracteres ASCII (`ok`/`FALHA`/`pular` por linha e um resumo); código de saída
  1 se qualquer checagem falhar — é o que marca o job do CI como vermelho.
- Não rode o E2E enquanto outro processo executa `npm run db:seed`: o seed apaga e recria as
  solicitações no meio da suíte e as checagens passam a falhar com 404 (o teste depende dos
  ids que ele mesmo acabou de criar). Rode o seed e só depois a suíte.

O que é verificado:

- **Saúde** — `/api/health` responde 200 e `db: 'ok'`.
- **Telas do painel (11)** — `/admin`, `/admin/painel`, `/admin/adocoes`, `/admin/doacoes`,
  `/admin/financeiro`, `/admin/estoque`, `/admin/tratamentos`, `/admin/voluntarios`,
  `/admin/usuarios`, `/admin/reports`, `/admin/news` respondem 200 com sessão de admin.
- **CRM de adoções** — formulário público cria (201), recusa sem consentimento (400), honeypot
  responde 200 sem gravar, a solicitação aparece na lista, muda para `adotado` (200), o animal
  sai da vitrine (`status: adotado`, `available: false`), o detalhe tem histórico, interação
  manual (201), o animal volta para a vitrine ao desfazer a etapa, e-mails chegam ao Mailpit
  (≥ 2) quando `MAILPIT_URL` está definida.
- **Doações e financeiro** — doação em dinheiro soma +100 em `summary.receitas`, o lançamento
  gerado não pode ser excluído direto na tela do financeiro (409), excluir a doação desfaz a
  receita (volta a 0), campanhas trazem `raised`.
- **Estoque e tratamentos** — saída acima do saldo (409).
- **Painel e exportação** — dashboard do admin tem bloco financeiro e o do voluntário não,
  `/api/export/doacoes` responde 200 sem nenhum `@` no CSV (LGPD), entidade inválida (404).

### Permissões por perfil cobertas

| Perfil | Checagens no E2E |
|---|---|
| financeiro | 403 no CRM (`/api/adoption-requests`) e em tratamentos (`/api/treatments`) |
| voluntário | 403 em doações, em financeiro e na exportação; dashboard sem bloco financeiro |
| admin | todas as telas 200, dashboard completo, exportação 200 |

O que o E2E **não** cobre (de propósito): limite de requisições do formulário público (precisa
de 30+ envios e é por processo), falha do banco no `/api/health` (derrubaria o servidor de
teste), envio real de e-mail (o Mailpit só confirma que a mensagem foi aceita) e regras de
negócio internas, que ficam nos unitários.

## Integração contínua (`.github/workflows/ci.yml`)

Em cada push para `main`/`teste/**` e em cada pull request, em `ubuntu-latest` com um Postgres
16 de serviço na porta 5433:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm test` (unitários)
5. `npm run db:migrate` (banco limpo → valida as migrações da pasta `drizzle/`)
6. `npm run build`
7. `npm run db:seed` (dados de demonstração)
8. `nohup npm start` em segundo plano
9. espera o `/api/health` responder por até 60 s (se não responder, imprime o log e falha)
10. `npm run test:e2e` (sem `MAILPIT_URL`: o runner não tem Mailpit, a checagem de e-mail é pulada)
11. em caso de falha em qualquer passo, imprime o log do servidor

O CI não sobe Mailpit nem depende de serviço pago: usa só Node, o Postgres do próprio runner e curl.

## Saúde (`/api/health`)

`GET /api/health` é público, `dynamic = 'force-dynamic'`, sem dados sensíveis, e faz um
`select 1` no banco:

```json
{ "status": "ok", "db": "ok", "time": "2026-11-12T17:14:14.852Z" }
```

Se o banco não responder, devolve **503** com `{ "status": "erro", "db": "erro", "time": ... }`.
Serve para o monitor de disponibilidade em produção e para o CI saber quando o servidor
terminou de subir.

## Resultado atual (12/11/2026, servidor local com `npm run db:seed`)

- `npm test` → 3 arquivos, **48 testes passando**.
- `MAILPIT_URL=http://localhost:8025 npm run test:e2e` → **42 ok, 0 falha(s)**, código de saída 0.
- `npm run test:e2e` (sem Mailpit, como no CI) → **41 ok, 0 falha(s), 1 pulada**, código 0.
- `GET /api/health` → **200** `{"status":"ok","db":"ok"}`.
- Execuções seguidas do E2E sem refazer o seed também passam (o animal do teste volta para a
  vitrine no fim).

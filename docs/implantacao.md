# Guia de implantação em produção

Como publicar o site e o painel da ONG Amor não tem Raça na Vercel, com banco no Neon, fotos no
Vercel Blob e e-mail por SMTP.

> **Leia antes de mexer em produção:** o banco de produção já existe e tem dados reais. Faça backup
> (ou crie uma *branch* no Neon) antes de qualquer migração. Nunca rode `npm run db:seed` contra
> produção — o script recusa qualquer `DATABASE_URL` que não seja localhost, mas não conte com isso.

---

## 1. Visão geral do ambiente de produção

| Peça | Serviço | Para que serve |
|---|---|---|
| Aplicação (site + painel + API) | Vercel (Next.js 16, App Router) | Servir as páginas e as rotas `/api/*` |
| Banco de dados | Neon (Postgres gerenciado) | Todos os dados da ONG |
| Fotos | Vercel Blob | Upload das fotos de animais e notícias |
| E-mail | Servidor SMTP (Gmail com senha de app ou serviço transacional) | Confirmações ao interessado e avisos para a equipe |
| Monitoramento | Monitor de disponibilidade + `/api/health` | Avisar quando o site ou o banco caírem |

O código escolhe o driver do banco pela URL: endereços de `localhost`/`127.0.0.1`/`postgres`/`db`
usam o driver `pg`; qualquer outra URL usa o driver HTTP do Neon. Por isso, em produção, basta a URL
do Neon em `DATABASE_URL`.

---

## 2. Pré-requisitos

- Conta na **Vercel** (plano gratuito serve para começar) e repositório do projeto no **GitHub**.
- Conta no **Neon** (plano gratuito serve para começar).
- Node.js **20 ou superior** na máquina de quem for rodar as migrações.
- Acesso ao DNS do domínio da ONG (se for usar domínio próprio).
- Uma conta de e-mail para envio (Gmail da ONG com senha de app, ou um serviço transacional).

---

## 3. Banco de dados no Neon

### 3.1 Criar o projeto

1. Crie um projeto no Neon e escolha a região mais próxima dos usuários (ex.: `us-east-1` ou
   `sa-east-1`, se disponível).
2. Guarde a **connection string** no formato
   `postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require&channel_binding=require`.
   Para a aplicação, prefira a URL **pooled** (com `-pooler` no host) — o driver HTTP do Neon usa
   HTTP e não mantém conexões abertas, o que combina com funções serverless.
3. Anote a senha em um gerenciador de senhas. **Nunca** cole a URL com senha em conversa, issue ou
   documento.

### 3.2 Backup antes de qualquer migração

Duas opções, ambas rápidas:

- **Branch do Neon** (recomendado): no painel do Neon, crie uma *branch* a partir da `main`. Ela é
  uma cópia instantânea e pode ser usada para restaurar ou testar migrações.
- **Dump lógico**: `pg_dump` com a URL do Neon (ver `docs/backup-e-restauracao.md`).

### 3.3 Migrações: marcar a `0000_inicial` como aplicada

O banco de produção foi criado **antes** das migrações versionadas (com `db:push`) e já possui as
tabelas `dogs` e `news`. Se você rodar `npm run db:migrate` direto, a migração `0000_inicial` vai
tentar criar essas tabelas de novo e falhar.

O controle de migrações do Drizzle fica na tabela `drizzle.__drizzle_migrations`, com o **hash
SHA-256 do conteúdo do arquivo `.sql`** e o `created_at` vindo de `drizzle/meta/_journal.json`.
Então:

1. Peça o hash do arquivo real do repositório (ele precisa bater exatamente com o conteúdo do
   `drizzle/0000_inicial.sql` versionado):

   ```bash
   node -e "const c=require('crypto'),f=require('fs');console.log(c.createHash('sha256').update(f.readFileSync('drizzle/0000_inicial.sql')).digest('hex'))"
   ```

   Com o repositório atual, o resultado é:

   ```
   732c6238f46314fd7c957afac0213bd2f5d040beccc508fe4ca4e5d3fbb87b58
   ```

   e o `created_at` correspondente é `1794498885175`.

2. No SQL Editor do Neon, crie a tabela de controle (se ainda não existir) e registre a migração
   0000 como aplicada:

   ```sql
   CREATE SCHEMA IF NOT EXISTS drizzle;
   CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
     id serial PRIMARY KEY,
     hash text NOT NULL,
     created_at bigint
   );

   INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
   VALUES ('732c6238f46314fd7c957afac0213bd2f5d040beccc508fe4ca4e5d3fbb87b58', 1794498885175);
   ```

3. Confira que as tabelas antigas estão lá e que a de controle tem 1 linha:

   ```sql
   SELECT hash, created_at FROM drizzle.__drizzle_migrations;
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1;
   ```

### 3.4 Aplicar a `0001_erp_crm`

Na máquina, com a URL do Neon só na variável de ambiente do comando (não em arquivo comitado):

```bash
# Linux/macOS
DATABASE_URL="postgresql://...neon.tech/ong?sslmode=require" npm run db:migrate
```

```powershell
# Windows (PowerShell)
$env:DATABASE_URL="postgresql://...neon.tech/ong?sslmode=require"; npm run db:migrate
```

Isso cria as 12 tabelas do ERP/CRM (`users`, `adopters`, `adoption_requests`, `interactions`,
`treatments`, `inventory_items`, `inventory_movements`, `campaigns`, `donations`, `transactions`,
`volunteers`, `audit_log`), os enums e os índices, além de adicionar as colunas novas em `dogs`.

Verifique:

```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';  -- deve passar de 14
SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id;         -- 2 linhas
```

> Migrações são **para frente**. Se precisar voltar atrás, restaure o backup/branch, não edite a
> tabela de controle na mão.

---

## 4. Variáveis de ambiente

Configure na Vercel em **Project → Settings → Environment Variables**, marcando os ambientes
*Production* (e *Preview*, se quiser testar antes). Base: `.env.example` do repositório.

| Variável | Obrigatória | Exemplo de valor (sem dados reais) | Observação |
|---|---|---|---|
| `DATABASE_URL` | sim | `postgresql://usuario:senha@ep-xxx-pooler.neon.tech/ong?sslmode=require` | URL **pooled** do Neon. Contém senha: trate como segredo. |
| `SESSION_SECRET` | sim | string aleatória de 32+ caracteres | Assina o cookie de sessão. Mínimo 16 caracteres; se faltar, o login quebra. Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Trocar este valor derruba todas as sessões. |
| `ADMIN_PASSWORD` | só no primeiro acesso | senha temporária forte | Só funciona **enquanto não existe nenhum usuário** no banco. Serve para criar o primeiro administrador. Depois, pode remover. |
| `BLOB_READ_WRITE_TOKEN` | sim (para fotos) | token do Blob store | Sem ele, em produção, o upload de foto falha com “BLOB_READ_WRITE_TOKEN não configurado”. |
| `SMTP_HOST` | sim (para e-mail) | `smtp.gmail.com` ou o host do serviço | Sem `SMTP_HOST`, o sistema simplesmente não envia e-mail (não dá erro). |
| `SMTP_PORT` | sim (para e-mail) | `587` (TLS) ou `465` (SSL) | A porta 465 ativa `secure`. |
| `SMTP_USER` | conforme o provedor | usuário de autenticação | Se vazio, o envio é sem autenticação (raro em produção). |
| `SMTP_PASS` | conforme o provedor | senha de app / API key | Nunca comitar. |
| `SMTP_FROM` | recomendado | `Amor Nao Tem Raca <nao-responda@dominio-da-ong.org>` | Muitos provedores exigem remetente de domínio verificado. |
| `ADMIN_NOTIFY_EMAIL` | recomendado | `equipe@ong.local` | Quem recebe o aviso de “Nova solicitação de adoção”. Padrão: `equipe@ong.local` (caixa inexistente). |

Nunca comite `.env`. O `.env.example` existe só como lista de nomes.

---

## 5. Publicar na Vercel

1. **Import Project** → escolha o repositório no GitHub.
2. Framework: **Next.js** (detectado). Build Command: `npm run build`. Install: `npm install`.
   Root Directory: a raiz do repositório.
3. Node.js: 20.x ou superior (Settings → General → Node.js Version).
4. Cadastre as variáveis da seção 4 **antes** do primeiro deploy.
5. Deploy. Ao terminar, abra a URL `*.vercel.app` e confirme:
   - `/` carrega o site com os animais (mesmo que a vitrine ainda mostre todos — ver
     `docs/manual-do-painel.md`, seção 3.4);
   - `/admin/login` abre a Área Administrativa;
   - `/api/health` responde `{"status":"ok","db":"ok","time":"..."}`.

O projeto é compatível com funções serverless: as páginas que leem o banco são dinâmicas
(`force-dynamic`) e as rotas de API também, então o build não precisa de banco disponível.

**Não** rode `npm run db:migrate` como parte do build: migração é ação manual e consciente, com
backup antes.

---

## 6. Primeiro administrador

1. Com `ADMIN_PASSWORD` definida e o banco **sem nenhum usuário**, abra `/admin/login`.
2. Entre usando esse e-mail/senha temporários (o login legado é aceito enquanto a tabela `users`
   estiver vazia).
3. Vá em **Usuários** e crie o primeiro usuário real com perfil **Administrador** (nome, e-mail,
   senha de 8+ caracteres).
4. Saia e entre com o usuário novo para conferir.
5. **Remova `ADMIN_PASSWORD` das variáveis de ambiente** (ou troque por um valor inutilizável). A
   partir do primeiro usuário, o login legado deixa de funcionar de qualquer forma, mas retirar a
   variável elimina o risco.

Se o primeiro usuário for criado por outra pessoa, cada um deve ter a **sua** conta: a auditoria
registra quem fez cada operação.

---

## 7. Domínio próprio e HTTPS

1. Vercel → **Settings → Domains → Add**. Informe o domínio (ex.: `amornaotemraca.org.br`) e o
   `www`.
2. No painel do registrador/DNS, crie os registros que a Vercel indicar (normalmente `A` para o
   domínio raiz e `CNAME` para `www`).
3. Aguarde a verificação (de minutos a algumas horas). O certificado **HTTPS é automático** e
   renovado pela Vercel.
4. Escolha o domínio principal e configure o outro para redirecionar (`www` → raiz, ou o contrário).
5. Confirme que `http://` redireciona para `https://` e que o cookie de sessão continua funcionando
   (ele é `HttpOnly` e vale para o domínio acessado).

Depois de trocar de domínio, atualize:
- a URL usada nos testes de ponta a ponta (`E2E_BASE_URL`);
- o endereço no monitor de disponibilidade;
- os links divulgados nas redes sociais e o `SMTP_FROM` (se o domínio de envio mudar).

---

## 8. E-mail em produção

O envio é feito por SMTP (`nodemailer`). **Falha de e-mail nunca derruba a operação**: o sistema
registra no log e segue.

### 8.1 Opção A — Gmail da ONG (senha de app)

1. Ative a verificação em duas etapas na conta Google da ONG.
2. Gere uma **senha de app** (16 caracteres) em <https://myaccount.google.com/apppasswords>.
3. Variáveis: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=<e-mail da ONG>`,
   `SMTP_PASS=<senha de app>`, `SMTP_FROM=Amor Nao Tem Raca <e-mail da ONG>`.
4. Limitação: o Gmail tem cotas diárias de envio (centenas de mensagens por dia). Para o volume da
   ONG costuma bastar; para campanhas grandes, use a opção B.

### 8.2 Opção B — serviço transacional (Resend, SendGrid, Mailgun, SES...)

1. Crie a conta e **verifique o domínio de envio** (registros DNS DKIM/SPF que o serviço informar).
2. Pegue as credenciais SMTP do serviço.
3. Variáveis: `SMTP_HOST`, `SMTP_PORT` (587/465), `SMTP_USER`, `SMTP_PASS`,
   `SMTP_FROM=Amor Nao Tem Raca <nao-responda@dominio-verificado>`.
4. Configure `ADMIN_NOTIFY_EMAIL` com uma caixa que a equipe realmente lê.

### 8.3 Teste

1. Abra o site, clique em **Quero adotar** num animal, preencha e envie com um e-mail seu.
2. Confira a caixa de entrada do interessado (confirmação) e de `ADMIN_NOTIFY_EMAIL` (aviso).
3. No painel, mude a etapa de uma solicitação e confirme o e-mail de mudança de etapa.
4. Se nada chegar, veja a seção 11 (diagnóstico).

---

## 9. Fotos (Vercel Blob)

1. Vercel → **Storage → Create → Blob**. Isso cria a variável `BLOB_READ_WRITE_TOKEN` (confira em
   Settings → Environment Variables).
2. Formatos aceitos: JPG, PNG, WEBP, GIF, AVIF, até **8 MB** por arquivo.
3. Sem o token, em produção o upload falha; em desenvolvimento as fotos vão para `public/uploads`
   (pasta local, não versionada).

---

## 10. Monitoramento

### 10.1 Endpoint de saúde

`GET /api/health` é público, não devolve dado sensível e responde:

- `200` com `{"status":"ok","db":"ok","time":"..."}` quando o banco responde a um `select 1`;
- `503` com `{"status":"erro","db":"erro","time":"..."}` quando o banco está fora.

### 10.2 Monitor de disponibilidade gratuito

1. Escolha um serviço (UptimeRobot, Better Stack, Cronitor...).
2. Crie um monitor HTTP(S) para `https://SEU-DOMINIO/api/health`, intervalo de **5 minutos**.
3. Configure para considerar falha status diferente de 200 (assim o 503 do banco também alerta) e
   envie o alerta para um e-mail/grupo que a equipe acompanhe.
4. Opcional: segundo monitor para a home (`/`), para detectar falha de página mesmo com banco ok.

### 10.3 Logs e auditoria

- **Vercel → Deployments → Functions/Logs**: erros de execução e mensagens `console.error`.
- **Auditoria no banco** (tabela `audit_log`): logins, criações, alterações, exclusões e exportações,
  com usuário, entidade, data e detalhes sem dados pessoais.
- Acompanhe o **uso do Neon** (armazenamento e horas de computação) para não estourar o plano
  gratuito.

---

## 11. Atualizar versões e reverter

### 11.1 Rotina de atualização

1. Trabalhe em branch, abra pull request; o CI roda tipos, lint, testes, migrações num Postgres
   limpo e o build.
2. Faça **backup/branch no Neon** antes de qualquer migração nova.
3. Aplique a migração manualmente (`npm run db:migrate` com a `DATABASE_URL` de produção).
4. Faça o merge na branch principal — a Vercel publica sozinha.
5. Rode `npm run test:e2e` apontando para produção (`E2E_BASE_URL=https://SEU-DOMINIO`), de
   preferência em uma janela de pouco movimento. **Atenção:** a suíte cria e altera registros; rode
   apenas se aceitar dados de teste na base (ou use uma branch do Neon + deploy de preview).

### 11.2 Reverter (rollback)

- **Código**: Vercel → Deployments → escolha o deploy anterior → **Promote to Production**. É
  imediato e não precisa de rebuild.
- **Banco**: migrações não são revertidas automaticamente. Se a versão nova gravou dados
  incompatíveis, restaure a branch/dump feito no passo 2. Combine código antigo + banco restaurado.
- **Variáveis**: mudanças de ambiente exigem **Redeploy** para valer.

---

## 12. Checklist de go-live

- [ ] Backup/branch do Neon criado antes das migrações.
- [ ] `0000_inicial` marcada como aplicada; `0001_erp_crm` aplicada; 2 linhas em
      `drizzle.__drizzle_migrations`.
- [ ] Todas as variáveis da seção 4 cadastradas em Production.
- [ ] `SESSION_SECRET` aleatório (≥ 32 caracteres) e guardado no gerenciador de senhas.
- [ ] Primeiro administrador criado; `ADMIN_PASSWORD` removida.
- [ ] `BLOB_READ_WRITE_TOKEN` configurado e uma foto enviada com sucesso pelo painel.
- [ ] E-mail testado (confirmação ao interessado + aviso à equipe + mudança de etapa).
- [ ] Domínio apontando, HTTPS ativo, `www` redirecionando.
- [ ] `/api/health` respondendo 200 e monitor externo criado.
- [ ] Login testado com os três perfis (Administrador, Voluntário, Financeiro) e conferência do menu.
- [ ] Exportação CSV baixada e aberta no Excel.
- [ ] `ADMIN_PASSWORD`/senhas de teste não aparecem em nenhum documento ou issue.

---

## 13. Segurança e LGPD em produção

- Sessão em cookie assinado (HMAC-SHA256), `HttpOnly`, validade de 12 h; limite de 10 tentativas de
  login por IP a cada 15 minutos.
- Senhas guardadas com `scrypt` + salt individual.
- Cada rota de API valida o perfil (`requireArea`); as telas do painel são protegidas pelo `proxy.ts`.
- Formulário público: consentimento LGPD obrigatório, honeypot anti-robô e limite de envios por IP.
- Exportações de adoções e doações **não** incluem telefone/e-mail.
- Dados pessoais (interessados, doadores, voluntários) devem ter finalidade definida, acesso
  restrito por perfil e prazo de guarda combinado com a ONG.
- `.env` nunca vai para o repositório; segredos só na Vercel e no gerenciador de senhas da equipe.

---

## 14. Diagnóstico rápido

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Site abre, mas sem animais e sem notícias | `DATABASE_URL` ausente/errada | Conferir a variável e `/api/health`; ver logs da Vercel |
| `/api/health` com 503 | Banco suspenso, cota do Neon ou URL inválida | Abrir o painel do Neon, conferir cota e a URL |
| Login sempre diz “E-mail ou senha incorretos” para senha certa | `SESSION_SECRET` ausente ou com menos de 16 caracteres (a sessão não é assinada e a API falha com 500) | Definir `SESSION_SECRET` e fazer redeploy |
| Login recusa usuário correto | Usuário inativo, senha trocada ou limite de tentativas (429) | Conferir em Usuários; esperar 15 min |
| Upload de foto falha em produção | `BLOB_READ_WRITE_TOKEN` ausente | Criar Blob store e redeployar |
| Nenhum e-mail chega | `SMTP_HOST` vazio, credencial errada ou remetente não verificado | Conferir variáveis, ver logs; testar credenciais do provedor |
| Painel redireciona para `/admin/login` sem parar | Cookie bloqueado (domínio/HTTPS) ou `SESSION_SECRET` alterado | Usar o domínio oficial em HTTPS e entrar de novo |
| Build falha na Vercel com erro de tipo | Código novo com erro de TypeScript | Rodar `npm run typecheck` localmente antes do push |
| “Muitas tentativas” ao entrar | Limite de tentativas atingido | Esperar 15 minutos |

Para qualquer incidente com dados: primeiro **backup/branch no Neon**, depois investigar. Ver
`docs/backup-e-restauracao.md`.

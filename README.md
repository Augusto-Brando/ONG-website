# Amor não tem Raça: site e Sistema Integrado de Gestão

Site da ONG Amor não tem Raça (Juiz de Fora/MG) com vitrine de animais para adoção e um painel administrativo que funciona como **ERP simplificado + CRM de adoções**: animais, tratamentos veterinários, estoque, doações e campanhas, financeiro, adoções, voluntários, usuários com perfis, painel gerencial e exportação de relatórios.

Projeto de extensão universitária (Sistemas de Informação e Engenharia de Software).

## Stack

- Next.js 16 (App Router) e React 19, Tailwind CSS 4, shadcn/ui
- Drizzle ORM + PostgreSQL (Neon em produção, Docker no desenvolvimento)
- Vercel Blob para fotos (em desenvolvimento, as fotos ficam em `public/uploads`)
- Nodemailer para e-mails (Mailpit no desenvolvimento)
- Vitest, ESLint e GitHub Actions

## Rodar localmente (passo a passo)

Requisitos: **Node.js 20+**, **npm** e **Docker Desktop** ligado.

```bash
npm install
cp .env.example .env          # no Windows (PowerShell): copy .env.example .env
npm run db:up                 # sobe Postgres (porta 5433) e Mailpit (8025)
npm run db:migrate            # cria as tabelas
npm run db:seed               # dados fictícios para testar
npm run dev                   # http://localhost:3000
```

No `.env`, troque `SESSION_SECRET` por um valor aleatório longo, por exemplo o resultado de `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

| Endereço | O que é |
|---|---|
| http://localhost:3000 | Site público (o botão "Quero adotar" envia para o CRM) |
| http://localhost:3000/admin | Painel administrativo |
| http://localhost:8025 | Caixa de e-mails de teste (Mailpit): nada é enviado de verdade |

### Logins de teste (criados pelo seed, senha `ong12345`)

| E-mail | Perfil | Enxerga |
|---|---|---|
| `admin@ong.local` | Administrador | tudo, inclusive usuários |
| `voluntario@ong.local` | Voluntário | animais, tratamentos, estoque, adoções, notícias, voluntários |
| `financeiro@ong.local` | Financeiro | doações, financeiro, relatórios, estoque |

O seed **apaga e recria** os dados e só roda com banco local (recusa qualquer `DATABASE_URL` que não seja localhost).

## Módulos

| Módulo | Onde | Destaques |
|---|---|---|
| Painel gerencial | `/admin/painel` | indicadores, receitas x despesas, doações por mês, funil de adoções, estoque baixo, próximos tratamentos |
| Animais | `/admin` | cães e gatos, situação (disponível, em processo, em tratamento, adotado), castração, vacinação, fotos |
| Tratamentos | `/admin/tratamentos` | vacinas, castrações, consultas; próximas datas; custo vira despesa automaticamente |
| Estoque | `/admin/estoque` | entradas e saídas, saldo, alerta de mínimo |
| Adoções (CRM) | `/admin/adocoes` | funil por etapas, histórico de contatos, e-mail ao interessado a cada etapa |
| Doações e campanhas | `/admin/doacoes` | doações em dinheiro viram receita; meta e arrecadado por campanha |
| Financeiro | `/admin/financeiro` | receitas, despesas e saldo por período |
| Relatórios | `/admin/reports` | impressão/PDF e exportação CSV (sem telefone/e-mail, por LGPD) |
| Voluntários, Notícias, Usuários | `/admin/voluntarios`, `/admin/news`, `/admin/usuarios` | cadastros; usuários só para administrador |

## Segurança e LGPD

- Login por e-mail e senha (hash scrypt), sessão em cookie assinado (HMAC) com validade de 12 h, limite de tentativas.
- Cada rota da API confere o perfil (`lib/api.ts` → `requireArea`); o `proxy.ts` protege as telas.
- Auditoria de criações, alterações, exclusões, logins e exportações (`audit_log`), sem dados pessoais nos detalhes.
- Formulário público com consentimento obrigatório e proteção anti-robô.
- `ADMIN_PASSWORD` só funciona enquanto não existe nenhum usuário (serve para criar o primeiro administrador em produção).

## Scripts

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # testes (Vitest)
npm run db:up        # Postgres + Mailpit no Docker
npm run db:migrate   # aplica migrações (pasta drizzle/)
npm run db:seed      # dados fictícios (só banco local)
npm run db:generate  # gera migração a partir de lib/schema.ts
npm run db:studio    # interface do Drizzle para ver o banco
```

## Variáveis de ambiente

Veja `.env.example`. Em produção: `DATABASE_URL` (Neon), `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` e `ADMIN_NOTIFY_EMAIL`.

## Produção: atenção ao migrar o banco existente

O banco de produção foi criado antes das migrações versionadas (com `db:push`) e já tem as tabelas `dogs` e `news`. Antes de rodar `db:migrate` em produção:

1. Faça backup do banco no painel do Neon (ou crie uma branch).
2. Marque a migração `0000_inicial` como já aplicada (ela só cria `dogs` e `news`), e então rode `npm run db:migrate` para aplicar a `0001_erp_crm`.
3. Configure `SESSION_SECRET` e entre no painel com `ADMIN_PASSWORD` para cadastrar o primeiro administrador em `/admin/usuarios`.

## Dados atuais da ONG

- Instagram: `https://www.instagram.com/amornaotemracajf/`
- WhatsApp principal: `+55 32 99961-1971`
- E-mail: `amornaotemracajf@gmail.com`
- Pix CNPJ: `48.118.169/0001-77`

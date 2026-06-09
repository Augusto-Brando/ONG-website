# Amor nao tem Raca - Landing Page

Landing page da ONG Amor nao tem Raca para divulgar animais disponiveis para adocao, contatos oficiais, doacoes e cadastro administrativo de animais.

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- Drizzle ORM
- Neon/PostgreSQL
- Vercel Blob para upload de fotos

## Requisitos

- Node.js 20 ou superior
- npm
- Banco PostgreSQL compativel com Neon

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="sua-senha-do-admin"
BLOB_READ_WRITE_TOKEN="seu-token-do-vercel-blob"
```

Observacoes:

- `DATABASE_URL` e obrigatoria para carregar e cadastrar animais.
- `ADMIN_PASSWORD` protege a area `/admin`.
- `BLOB_READ_WRITE_TOKEN` e necessario para upload de imagens fora do ambiente configurado da Vercel.

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Area administrativa:

```text
http://localhost:3000/admin
```

## Scripts principais

```bash
npm run dev       # inicia o ambiente local
npm run build     # gera build de producao
npm run start     # roda a build de producao
npm run lint      # executa lint, se as dependencias de lint estiverem configuradas
```

## Banco de dados

O schema principal esta em `lib/schema.ts`. A tabela usada atualmente se chama `dogs`, mas a interface do site foi ajustada para tratar os registros como animais, pois a ONG tambem trabalha com gatos.

Comandos Drizzle disponiveis:

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```

## Funcionalidades

- Listagem publica de animais para adocao.
- Carrossel em formato de card com melhor enquadramento das fotos.
- Modal de detalhes do animal.
- Contato por WhatsApp, Instagram e email.
- Secao de doacoes com chave Pix CNPJ.
- Informacao para socio contribuinte.
- Area admin para cadastrar, editar e remover animais.
- Upload de fotos via Vercel Blob.

## Producao

A home e a rota `/api/dogs` estao configuradas como dinamicas para buscar os animais atualizados no banco em producao:

```ts
export const dynamic = 'force-dynamic'
```

Depois de cadastrar novos animais pelo admin, a landing deve refletir os dados do banco sem depender de um novo build.

## Dados atuais da ONG

- Instagram: `https://www.instagram.com/amornaotemracajf/`
- WhatsApp principal: `+55 32 99961-1971`
- Email: `amornaotemracajf@gmail.com`
- Pix CNPJ: `48.118.169/0001-77`

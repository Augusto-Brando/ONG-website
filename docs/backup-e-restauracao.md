# Backup e restauração do banco

Como proteger os dados da ONG (animais, doações, financeiro, adoções) contra erro humano e falha de banco — e como voltar ao normal se algo der errado.

## Como funciona

| Banco | Onde roda o `pg_dump` | Por quê |
| --- | --- | --- |
| **Local** (Docker, `localhost:5433`) | Dentro do contêiner: `docker compose exec -T db pg_dump -U ong -d ong --clean --if-exists` | O Windows (e a maioria das máquinas de dev) não tem `pg_dump` instalado. O contêiner do Postgres já tem. |
| **Neon** (produção) | `pg_dump` do próprio sistema, com a `DATABASE_URL` | Não há contêiner em produção; o cliente do Postgres roda na sua máquina. |

O nome da URL é usado só para escolher o caminho. A senha **nunca** é impressa no terminal (nem em mensagens de erro).

## Comandos

```bash
# 1) Criar um backup (gera backups/ong-AAAA-MM-DD-HHmm.sql)
npm run db:backup

# 2) Restaurar um backup no banco LOCAL (pede para digitar RESTAURAR)
npm run db:restore -- backups/ong-2026-11-12-1430.sql

#    ...ou sem a confirmação manual (scripts/CI):
npm run db:restore -- backups/ong-2026-11-12-1430.sql --sim
```

Regras dos scripts:

- `db:backup` mantém apenas os **10 backups mais recentes** em `backups/` (os antigos são apagados no fim de cada execução). A pasta está no `.gitignore` — backup local **não** vai para o Git.
- `db:restore` **recusa** `DATABASE_URL` que não seja local (mesma regra do `scripts/seed.ts`). É impossível acidentalmente restaurar por cima do banco de produção com esse script.
- A restauração roda em **uma única transação**: se qualquer comando do dump falhar no meio, o banco volta ao estado de antes (nada de banco pela metade).
- O dump usa `--clean --if-exists`, ou seja, restaurar **substitui** o conteúdo atual do banco local.

## Plano de backup

| Item | Recomendação |
| --- | --- |
| **Frequência (produção/Neon)** | Diário. O Neon já faz backup automático (o período de retenção depende do plano — confira no painel); o backup diário manual é a segunda camada. |
| **Frequência (dev)** | Antes de qualquer mudança perigosa (migração, seed, experimento) e uma vez por semana. |
| **Retenção** | 10 backups no script local. No Neon: manter o padrão do plano (dias) + baixar 1 por mês para fora. |
| **Onde guardar** | **Nunca só na mesma máquina.** Local: `backups/` é conveniência de dev. Produção: baixar o dump e guardar em local diferente (pen drive pessoal criptografado, drive da equipe, bucket privado). Regra 3-2-1: 3 cópias, 2 mídias diferentes, 1 fora da máquina. |
| **Neon pelo painel** | Console do Neon → banco → *Backups*: ver histórico, restaurar para um **novo banco** (PITR) ou criar um **branch** com os dados de um momento anterior. Em dúvida, o branch é o caminho mais seguro: você testa a restauração sem tocar no banco de produção. |
| **Teste mensal** | Todo mês, no banco local: criar um backup, apagar um registro de teste e restaurar (roteiro abaixo). Backup que nunca foi testado não é backup. |

## Roteiro de teste de restauração (mensal, banco local)

```bash
# 1. Backup de referência
npm run db:backup

# 2. Ver a contagem atual de animais (exemplo)
curl -s http://localhost:3000/api/dogs | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).length))"

# 3. Criar um animal de teste (logado como admin; veja o login no README)
curl -s -b c.txt -F "name=Teste Backup" -F "age=1 dia" http://localhost:3000/api/dogs

# 4. Excluir o animal de teste (use o id retornado no passo 3)
curl -s -b c.txt -X DELETE http://localhost:3000/api/dogs/<ID>

# 5. Restaurar o backup do passo 1 (digitar RESTAURAR)
npm run db:restore -- backups/ong-<data>.sql

# 6. Conferir que a contagem voltou ao valor do passo 2
curl -s http://localhost:3000/api/dogs | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).length))"
```

Se o passo 6 não bater com o passo 2, **pare e acione o responsável** antes de continuar usando o banco.

## Roteiro de desastre (produção)

1. **Não panique, não reinicie nada.** Anote o horário exato do problema (ex.: "migração aplicada às 10h05").
2. **Congele as gravações** se houver dado sendo destruído (ex.: parar o app ou tirar o domínio da Vercel).
3. **Copie o estado atual** para análise, se possível (um branch do Neon ou `pg_dump`) — serve de prova de onde o banco está agora.
4. **Escolha o ponto de restauração:**
   - Erro humano recente (exclusão em massa, migração errada) → restaurar para **depois do último backup conhecido bom** (antes do problema).
   - Falha total do banco → o Neon recria o banco; use o backup automático/PITR do painel.
5. **Restaure num banco novo, nunca por cima:**
   - Neon: crie um **branch** (ou um banco novo) a partir do momento desejado → valide os dados (contagens, páginas, logins) → quando estiver certo, promova/substitua.
   - Local: `npm run db:restore -- backups/<arquivo>.sql` (substitui o banco local, o que é aceitável por ser só dev).
6. **Valide depois de restaurar:** `GET /api/health` (quando existir), logar com o admin, conferir os módulos (animais, doações, adocões) e as contagens do painel.
7. **Comunique** a equipe o que aconteceu, qual backup foi usado e o que mudou.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| `docker compose exec: Não é possível ...` | Docker fechado | Abra o Docker Desktop e rode `npm run db:up` |
| Backup falha em produção com "pg_dump não está no PATH" | Cliente do Postgres não instalado | Veja as instruções que o próprio script imprime (winget/choco/brew/apt) |
| Restauração recusa ("não é local") | `DATABASE_URL` apontando para o Neon | É comportamento de segurança. A restauração por script só atende o banco local; em produção use o painel do Neon |
| Backup demora / arquivo grande | Crescimento natural do banco | Normal para banco pequeno; se passar de dezenas de MB, repense a retenção |
